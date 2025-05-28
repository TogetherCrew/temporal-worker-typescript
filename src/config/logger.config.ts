import pino from 'pino';
import { ConfigService } from './config.service';

export const logger = pino({
  level: 'info', //ConfigService.getInstance().get('logger').LEVEL,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});

export default logger;
