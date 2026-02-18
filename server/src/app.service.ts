import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getHealth(): string {
    return "Your systemm is working fine and running smoothly don't worry";
  }
}
