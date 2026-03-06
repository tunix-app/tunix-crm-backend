import { ApiProperty } from '@nestjs/swagger';

export class WaiverDto {
  @ApiProperty() id: string;
  @ApiProperty() client_id: string;
  @ApiProperty() original_filename: string;
  @ApiProperty() file_size_bytes: number;
  @ApiProperty() uploaded_at: Date;
}

export class WaiverSignedUrlDto {
  @ApiProperty() id: string;
  @ApiProperty() original_filename: string;
  @ApiProperty() signed_url: string;
  @ApiProperty() expires_at: Date;
}
