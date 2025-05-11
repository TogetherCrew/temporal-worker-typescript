import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Bottleneck from 'bottleneck';
import { BottleneckService } from './BottleneckService';
import { ProxyService, defaultProxyOpts } from './ProxyService';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'LimiterService' });

export class LimiterService {
  private readonly bottleneckService: BottleneckService;
  private readonly proxyService: ProxyService;

  constructor() {
    this.bottleneckService = new BottleneckService();
    this.proxyService = new ProxyService();
  }

  protected async get(
    endpoint: string,
    path: string,
    params: object,
    scheme = 'https',
  ) {
    const url = `${scheme}://${endpoint}/${path}`;
    const limiter: Bottleneck = this.getLimiter(endpoint, defaultProxyOpts);
    return limiter.schedule(() =>
      this.req(url, { params, httpsAgent: this.proxyService.getProxy() }),
    );
  }

  private async req(
    url: string,
    opts: AxiosRequestConfig<any> | undefined,
  ): Promise<AxiosResponse<any, any>> {
    try {
      logger.debug({ url, params: opts?.params }, 'Fetching');
      return axios.get(url, opts);
    } catch (error) {
      logger.error({ url, params: opts?.params, error }, 'Failed to fetch');
      throw error;
    }
  }

  private getLimiter(
    id: string,
    options?: Partial<Bottleneck.ConstructorOptions>,
  ): Bottleneck {
    let limiter: Bottleneck | undefined = this.bottleneckService.getLimiter(id);
    if (limiter == undefined) {
      limiter = this.bottleneckService.createClusterLimiter(id, options);
      this.bottleneckService.setLimiter(id, limiter);
    }
    return limiter;
  }
}
