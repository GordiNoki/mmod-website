import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards
} from '@nestjs/common';
import { Roles } from '../../decorators';
import { RealTimeSettings, Role as RolesEnum } from '@momentum/constants';
import { NonGameAuthGuard } from '../auth/jwt/game.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RealTimeService } from './real-time.service';

@Controller('real-time')
@UseGuards(RolesGuard)
@UseGuards(NonGameAuthGuard)
@Roles(RolesEnum.ADMIN)
export class RealTimeController {
  constructor(private rt: RealTimeService) {}

  @Get('/settings')
  getSettings(): RealTimeSettings {
    return this.rt.settings;
  }

  @Patch('/settings')
  setSettings(@Body() settings: RealTimeSettings) {
    return this.rt.updateSettings(settings);
  }

  @Patch('/timer')
  setTimerState(@Body() timer: Pick<RealTimeSettings, 'timerEnd'>) {
    return this.rt.updateSettings({
      ...this.rt.settings,
      timerEnd: timer.timerEnd
    });
  }

  @Get('/runs')
  getCurrentTeamsRuns() {
    return null;
  }

  @Delete('/runs')
  deleteCurrentMapRuns() {
    return this.rt.nukeRuns();
  }

  // Get timer settings
  // Set timer settings (teams, current map, allow time submission, timer start time (null if ))
  // Set timer state (reset, start, pause)
  // Nuke runs
  // Create team
  // Update team (add user)
}
