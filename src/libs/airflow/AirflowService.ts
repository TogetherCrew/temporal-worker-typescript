import axios from 'axios';
import { ConfigService } from '../../config/config.service';
import { v4 as uuidv4 } from 'uuid';
import { PlatformService } from '../mongo/PlatformService';
import parentLogger from '../../config/logger.config';

export class AirflowService {
  private readonly url;
  private readonly auth;
  private readonly configService = ConfigService.getInstance();
  private readonly airflowConfig;
  private readonly logger = parentLogger.child({ module: 'AirflowService' });

  constructor() {
    this.airflowConfig = this.configService.get('airflow');
    const username = this.airflowConfig.USER;
    const password = this.airflowConfig.PASS;
    const baseUrl = this.airflowConfig.URI;
    this.url = `${baseUrl}/api/v1/dags/discourse_analyzer_etl/dagRuns`;
    this.auth = Buffer.from(`${username}:${password}`).toString('base64');
  }

  async runDiscourseAnalyerETLDag(platformId: string) {
    this.logger.info({ platformId }, 'runDiscourseAnalyerETLDag');

    const platformService = new PlatformService();
    const platform = await platformService.findById(platformId);

    const dag_run_id = uuidv4();

    const date = new Date();
    date.setMinutes(date.getMinutes() + 1);

    const logical_date = date.toISOString();
    const body = {
      dag_run_id,
      logical_date,
      conf: {
        platform_id: platform._id,
        period: platform.metadata.period,
        id: platform.metadata.id,
        recompute: false,
      },
      note: 'compute',
    };

    try {
      await axios.post(this.url, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.auth}`,
        },
      });
    } catch (error) {
      this.logger.error('Failed to trigger Airflow', (error as Error).message);
      throw error;
    }
  }
}
