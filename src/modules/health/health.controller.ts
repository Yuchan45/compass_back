import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check API health.' })
  @ApiOkResponse({
    description: 'API process health information.',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-05-14T19:00:00.000Z',
        uptime: 42.1,
      },
    },
  })
  check() {
    return this.healthService.check();
  }
}
