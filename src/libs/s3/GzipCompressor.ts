import Pako from 'pako';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'GzipCompressor' });

export class GzipCompressor {
  public encoding = 'gzip/json';
  public fileExtension = '.json.gz';

  public compress(json: any): Uint8Array {
    try {
      const str = JSON.stringify(json);
      return Pako.gzip(str);
    } catch (error) {
      logger.error({ error }, 'Failed to compress');
      throw error;
    }
  }

  public decompress(compressed: Uint8Array): any {
    try {
      const str = Pako.ungzip(compressed, { to: 'string' });
      return JSON.parse(str);
    } catch (error) {
      logger.error({ error }, 'Failed to decompress');
      throw error;
    }
  }
}
