import { AirflowService } from '../../libs/airflow/AirflowService';

export async function runDiscourseAnalyer(platformId: string) {
  const airflow = new AirflowService();
  await airflow.runDiscourseAnalyerETLDag(platformId);
}