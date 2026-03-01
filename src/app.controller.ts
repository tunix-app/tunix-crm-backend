import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt.auth.guard';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Health ping' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ summary: 'Protected route — verifies JWT auth guard' })
  @ApiBearerAuth()
  @Get('/protected')
  @UseGuards(JwtAuthGuard)
  async protected(@Req() req) {
    return {
      message: 'Authguard Works!',
      authenticated_user: req.user,
    };
  }
}
