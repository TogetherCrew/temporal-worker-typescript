import { Platform } from '@togethercrew.dev/db';
import axios from 'axios';
import { config } from '../../config';
import { v4 as uuidv4 } from 'uuid';

export class AirflowService {
  private readonly url;
  private readonly auth;

  constructor() {
    const username = config.AIRFLOW_USER;
    const password = config.AIRFLOW_PASS;
    const baseUrl = config.AIRFLOW_URI;
    this.url = `${baseUrl}/api/v1/dags/discourse_analyzer_etl/dagRuns`;
    this.auth = Buffer.from(`${username}:${password}`).toString('base64');
  }

  async runDiscourseAnalyerETLDag(platformId: string) {
    const platform = await Platform.findById(platformId);

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
      console.error('Failed to trigger Airflow', (error as Error).message);
      throw error;
    }
  }
}
