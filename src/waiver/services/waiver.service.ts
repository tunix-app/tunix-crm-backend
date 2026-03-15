import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { KnexService } from 'src/infra/database/knex.service';
import { SupabaseService } from 'src/infra/supabase/supabase.service';
import { WaiverEntity } from 'src/types/db/waiver';
import { WaiverDto, WaiverSignedUrlDto } from 'src/types/dto/waiver.dto';

const BUCKET = 'client-waivers';
const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

@Injectable()
export class WaiverService {
  private readonly logger = new Logger(WaiverService.name);

  constructor(
    private readonly knexService: KnexService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async uploadWaiver(
    clientId: string,
    file: Express.Multer.File,
  ): Promise<WaiverDto> {
    this.logger.debug(`Uploading waiver for client ${clientId}`);

    const client = await this.knexService
      .db('clients as C')
      .join('users as U', 'U.id', 'C.client_id')
      .where('C.id', clientId)
      .select('U.first_name', 'U.last_name')
      .first();

    if (!client) {
      throw new NotFoundException(`Client with id ${clientId} not found`);
    }

    const firstName = sanitizeName(client.first_name ?? 'unknown');
    const lastName = sanitizeName(client.last_name ?? 'unknown');
    const timestamp = Date.now();
    const filename = `${firstName}_${lastName}_${timestamp}.pdf`;
    const storagePath = `${clientId}/${filename}`;

    const { error: uploadError } = await this.supabaseService.client.storage
      .from(BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      this.logger.error(`Storage upload failed: ${uploadError.message}`);
      throw new BadRequestException(
        `Failed to upload waiver: ${uploadError.message}`,
      );
    }

    const [inserted]: WaiverEntity[] = await this.knexService
      .db('client_waivers')
      .insert({
        client_id: clientId,
        storage_path: storagePath,
        original_filename: filename,
        file_size_bytes: file.size,
      })
      .returning('*');

    return this.toDto(inserted);
  }

  async getWaiversByClientId(clientId: string): Promise<WaiverDto[]> {
    this.logger.debug(`Fetching waivers for client ${clientId}`);
    const rows: WaiverEntity[] = await this.knexService
      .db('client_waivers')
      .where({ client_id: clientId })
      .orderBy('uploaded_at', 'desc');
    return rows.map((row) => this.toDto(row));
  }

  async getSignedUrl(waiverId: string): Promise<WaiverSignedUrlDto> {
    this.logger.debug(`Generating signed URL for waiver ${waiverId}`);

    const waiver: WaiverEntity = await this.knexService
      .db('client_waivers')
      .where({ id: waiverId })
      .first();

    if (!waiver) {
      throw new NotFoundException(`Waiver with id ${waiverId} not found`);
    }

    const { data, error } = await this.supabaseService.client.storage
      .from(BUCKET)
      .createSignedUrl(waiver.storage_path, SIGNED_URL_EXPIRY_SECONDS);

    if (error || !data) {
      this.logger.error(`Failed to generate signed URL: ${error?.message}`);
      throw new BadRequestException('Failed to generate download URL');
    }

    const expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY_SECONDS * 1000);

    return {
      id: waiver.id,
      original_filename: waiver.original_filename,
      signed_url: data.signedUrl,
      expires_at: expiresAt,
    };
  }

  async deleteWaiver(waiverId: string): Promise<{ message: string }> {
    this.logger.debug(`Deleting waiver ${waiverId}`);

    const waiver: WaiverEntity = await this.knexService
      .db('client_waivers')
      .where({ id: waiverId })
      .first();

    if (!waiver) {
      throw new NotFoundException(`Waiver with id ${waiverId} not found`);
    }

    const { error: storageError } = await this.supabaseService.client.storage
      .from(BUCKET)
      .remove([waiver.storage_path]);

    if (storageError) {
      this.logger.warn(
        `Storage deletion failed for ${waiver.storage_path}: ${storageError.message}`,
      );
    }

    await this.knexService.db('client_waivers').where({ id: waiverId }).del();

    return { message: `Waiver ${waiverId} deleted successfully` };
  }

  private toDto(waiver: WaiverEntity): WaiverDto {
    return {
      id: waiver.id,
      client_id: waiver.client_id,
      original_filename: waiver.original_filename,
      file_size_bytes: waiver.file_size_bytes,
      uploaded_at: waiver.uploaded_at,
    };
  }
}
