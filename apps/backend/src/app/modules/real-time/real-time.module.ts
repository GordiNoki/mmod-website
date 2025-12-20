import { Module } from '@nestjs/common';
import { RealTimeService } from './real-time.service';
import { RealTimeController } from './real-time.controller';
import { DbModule } from '../database/db.module';

@Module({
  imports: [DbModule],
  providers: [RealTimeService],
  controllers: [RealTimeController],
  exports: [RealTimeService]
})
export class RealTimeModule {}
