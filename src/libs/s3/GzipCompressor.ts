import Pako from 'pako';

export class GzipCompressor {
  public encoding = 'gzip/json';
  public fileExtension = '.json.gz';

  public compress(json: any): Uint8Array {
    try {
      const str = JSON.stringify(json);
      return Pako.gzip(str);
    } catch (error) {
      console.error('Failed to compress:', error);
      throw error;
    }
  }

  public decompress(compressed: Uint8Array): any {
    try {
      const str = Pako.ungzip(compressed, { to: 'string' });
      return JSON.parse(str);
    } catch (error) {
      console.error('Failed to decompress:', error);
      throw error;
    }
  }
}
