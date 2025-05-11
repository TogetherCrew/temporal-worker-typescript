import pino from 'pino';
import { ConfigService } from './';
const configService = ConfigService.getInstance();

export default pino({
  level: configService.get('logger').LEVEL,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
});
