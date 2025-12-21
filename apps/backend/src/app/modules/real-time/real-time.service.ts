import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import { ExtendedPrismaService } from '../database/prisma.extension';
import { EXTENDED_PRISMA_SERVICE } from '../database/db.constants';
import { RealTimeSettings } from '@momentum/constants';
import { UserDto } from '../../dto';
import { plainToInstance } from 'class-transformer';

export const REALTIME_CONFIG_ID = 'RealTime';

@Injectable()
export class RealTimeService extends Server implements OnModuleInit {
  settings: RealTimeSettings = {
    team1: null,
    team2: null,
    mapID: null,
    allowTimes: true,
    pauseTime: null,
    timerStart: null,
    teams: []
  };

  constructor(
    @Inject(EXTENDED_PRISMA_SERVICE) private readonly db: ExtendedPrismaService
  ) {
    super(9132, {
      cors: { origin: '*' }
    });

    this.on('connection', (sock) => {
      if (this.settings) sock.emit('settings', this.settings);
      sock.on('getFullData', async (_, ret) => {
        ret(await this.getFullData());
      });
    });
  }

  async onModuleInit() {
    const dbSettings = await this.db.config.findUnique({
      where: { id: REALTIME_CONFIG_ID }
    });
    if (!dbSettings) {
      this.updateSettings({
        team1: null,
        team2: null,
        mapID: null,
        allowTimes: true,
        pauseTime: null,
        timerStart: null,
        teams: []
      });
    } else {
      this.settings = dbSettings.value as RealTimeSettings;
      this.emit('settings', this.settings);
    }
  }

  async updateSettings(settings: RealTimeSettings) {
    Object.assign(this.settings, settings);
    await this.db.config.upsert({
      where: { id: REALTIME_CONFIG_ID },
      update: { value: this.settings },
      create: { id: REALTIME_CONFIG_ID, value: this.settings }
    });
    this.emit('settings', this.settings);
  }

  async nukeRuns() {
    if (!this.settings.mapID) return;
    await this.db.leaderboardRun.deleteMany({
      where: { mapID: this.settings.mapID }
    });
  }

  async getFullData() {
    const map =
      this.settings.mapID !== null
        ? await this.db.mMap.findUnique({ where: { id: this.settings.mapID } })
        : null;
    const team1 =
      this.settings.team1 !== null
        ? await this.db.user
            .findMany({
              where: {
                id: { in: this.settings.teams[this.settings.team1].memberIDs }
              }
            })
            .then((arr) => arr.map((t) => plainToInstance(UserDto, t)))
        : null;
    const team2 =
      this.settings.team2 !== null
        ? await this.db.user
            .findMany({
              where: {
                id: { in: this.settings.teams[this.settings.team2].memberIDs }
              }
            })
            .then((arr) => arr.map((t) => plainToInstance(UserDto, t)))
        : null;
    const members: number[] = [];
    if (team1) {
      members.push(...team1.map(({ id }) => id));
    }
    if (team2) {
      members.push(...team2.map(({ id }) => id));
    }
    const runs =
      this.settings.mapID !== null && members.length > 0
        ? await this.db.leaderboardRun.findMany({
            where: {
              mapID: this.settings.mapID,
              userID: { in: members }
            }
          })
        : [];
    return { map, team1, team2, runs };
  }
}
