import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AvatarsService } from './avatars.service';

@ApiTags('avatars')
@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Get('presets')
  @ApiOperation({ summary: 'List default avatar presets.' })
  @ApiOkResponse({ description: 'Default avatar presets available during sign up.' })
  findPresets() {
    return this.avatarsService.findPresets();
  }
}
