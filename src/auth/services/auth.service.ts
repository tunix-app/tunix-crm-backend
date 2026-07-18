import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Resend } from 'resend';
import { KnexService } from '../../infra/database/knex.service';
import { SupabaseService } from '../../infra/supabase/supabase.service';
import { User, UserRole } from '../../types/db/user';
import { RequestOtpDto, VerifyOtpDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  constructor(
    private readonly knexService: KnexService,
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async requestOtp({ email }: RequestOtpDto): Promise<{ message: string }> {
    const user = await this.knexService
      .db('users')
      .where({ email: email.toLowerCase() })
      .first<User>();

    if (!user) {
      throw new NotFoundException('No account found with that email address');
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.COACH) {
      throw new ForbiddenException('Access restricted to coaches and admins');
    }

    // Ensure the user exists in Supabase Auth as a confirmed account.
    // createUser fails silently if they already exist — that's fine.
    const { error: createError } =
      await this.supabaseService.client.auth.admin.createUser({
        email,
        email_confirm: true,
      });

    if (createError) {
      this.logger.warn(`Supabase createUser (may already exist): ${createError.message}`);
    }

    // generateLink gives us the 6-digit email_otp directly so we control the
    // email instead of relying on Supabase's template rendering.
    const { data: linkData, error: linkError } =
      await this.supabaseService.client.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });

    if (linkError || !linkData.properties?.email_otp) {
      this.logger.error(`Supabase generateLink error: ${linkError?.message}`);
      throw new InternalServerErrorException('Failed to generate login code');
    }

    const otp = linkData.properties.email_otp;

    const { error: emailError } = await this.resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'Your GetJahBodyRight login code',
      html: `
        <h2>Your login code</h2>
        <p>Enter this code to sign in to GetJahBodyRight:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;">${otp}</p>
        <p>This code expires in 1 hour. Do not share it.</p>
      `,
    });

    if (emailError) {
      this.logger.error(`Resend email error: ${emailError.message}`);
      throw new InternalServerErrorException('Failed to send login code');
    }

    return { message: 'Login code sent — check your email' };
  }

  async verifyOtp({
    email,
    token,
  }: VerifyOtpDto): Promise<{ access_token: string; user: Partial<User> }> {
    const { error } = await this.supabaseService.anonClient.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      this.logger.error(`Supabase verify OTP error: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired login code');
    }

    const user = await this.knexService
      .db('users')
      .where({ email: email.toLowerCase() })
      .first<User>();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const access_token = this.jwtService.sign({ id: user.id });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }
}
