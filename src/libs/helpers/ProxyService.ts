import { HttpsProxyAgent } from 'https-proxy-agent';
import { ConfigService } from '../../config/config.service';

export const defaultProxyOpts = {
  minTime: (60 * 1000) / 1000,
  reservoir: 1000,
  reservoirRefreshAmount: 1000,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 1000,
};

export class ProxyService {
  uri: string;
  private readonly configService = ConfigService.getInstance();

  constructor() {
    this.uri = this.configService.get('proxy').URI;
  }

  getProxy(): HttpsProxyAgent<string> {
    const port = this.getRandomNumber(20001, 29980);
    const url = `${this.uri}:${port}`;
    return new HttpsProxyAgent(url);
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
