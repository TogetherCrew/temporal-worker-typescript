import { AirflowService } from '../../libs/airflow/AirflowService';
import parentLogger from '../../config/logger.config';

const logger = parentLogger.child({ module: 'runDiscourseAnalyer' });

export async function runDiscourseAnalyer(platformId: string) {
  logger.info({ platformId }, 'runDiscourseAnalyer');
  const airflow = new AirflowService();
  await airflow.runDiscourseAnalyerETLDag(platformId);
}
