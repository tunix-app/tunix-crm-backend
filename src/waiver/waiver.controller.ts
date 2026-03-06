import {
  BadRequestException,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { WaiverService } from './services/waiver.service';
import { WaiverDto, WaiverSignedUrlDto } from 'src/types/dto/waiver.dto';

@ApiTags('Waivers')
@Controller('waiver')
export class WaiverController {
  constructor(private readonly waiverService: WaiverService) {}

  @Post('client/:clientId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: 'Upload a waiver PDF for a client' })
  @ApiParam({ name: 'clientId', description: 'Client UUID (clients.id)' })
  async uploadWaiver(
    @Param('clientId') clientId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/pdf' })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<WaiverDto> {
    return this.waiverService.uploadWaiver(clientId, file);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get all waivers for a client' })
  @ApiParam({ name: 'clientId', description: 'Client UUID (clients.id)' })
  async getWaivers(
    @Param('clientId') clientId: string,
  ): Promise<WaiverDto[]> {
    return this.waiverService.getWaiversByClientId(clientId);
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get a 1-hour signed download URL for a waiver' })
  @ApiParam({ name: 'id', description: 'Waiver UUID' })
  async getSignedUrl(
    @Param('id') id: string,
  ): Promise<WaiverSignedUrlDto> {
    return this.waiverService.getSignedUrl(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a waiver from storage and database' })
  @ApiParam({ name: 'id', description: 'Waiver UUID' })
  async deleteWaiver(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.waiverService.deleteWaiver(id);
  }
}
