import { AirflowService } from '../../libs/airflow/AirflowService';

export async function runDiscourseAnalyer(platformId: string) {
  console.log('runDiscourseAnalyer', platformId);
  const airflow = new AirflowService();
  await airflow.runDiscourseAnalyerETLDag(platformId);
}
