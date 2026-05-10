import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class DashboardSessionDto {
  @ApiProperty() id: string;
  @ApiProperty() client_id: string;
  @ApiProperty() client_name: string;
  @ApiProperty() session_type: string;
  @ApiProperty() start_time: string;
  @ApiProperty() end_time: string;
  @ApiProperty() duration_minutes: number;
  @ApiPropertyOptional({ nullable: true }) description: string | null;
}

export class UnscheduledClientDto {
  @ApiProperty() id: string;
  @ApiProperty() client_id: string;
  @ApiProperty() client_name: string;
  @ApiProperty() client_email: string;
  @ApiPropertyOptional({ nullable: true }) last_session: string | null;
}

export class CoachDashboardDto {
  @ApiProperty() total_sessions_today: number;
  @ApiProperty() total_active_clients: number;
  @ApiProperty({ type: [DashboardSessionDto] })
  sessions_today: DashboardSessionDto[];
  @ApiProperty({ type: [UnscheduledClientDto] })
  unscheduled_clients: UnscheduledClientDto[];
}

export class GetDashboardQueryDto {
  @ApiPropertyOptional({
    description: 'ISO date YYYY-MM-DD. Defaults to today UTC.',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
