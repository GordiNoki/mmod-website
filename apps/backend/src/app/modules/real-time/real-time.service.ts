import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class RealTimeService extends Server {
  constructor() {
    super(3001, {
      cors: { origin: '*' }
    });
  }
}
