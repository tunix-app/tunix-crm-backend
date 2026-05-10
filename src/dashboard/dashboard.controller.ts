import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { DashboardService } from './services/dashboard.service';
import {
  CoachDashboardDto,
  GetDashboardQueryDto,
} from 'src/types/dto/dashboard.dto';

@ApiTags('dashboard')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: "Get the authenticated coach's dashboard summary" })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'ISO date YYYY-MM-DD. Defaults to today UTC.',
  })
  getDashboard(
    @Request() req,
    @Query() query: GetDashboardQueryDto,
  ): Promise<CoachDashboardDto> {
    return this.dashboardService.getDashboard(req.user.id, query.date);
  }
}
