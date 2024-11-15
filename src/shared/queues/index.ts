export enum QUEUE {
  // LIGHT processes lightweight notification workflows
  LIGHT = 'TEMPORAL_QUEUE_LIGHT',
  // HEAVY processes workflows related to data ingestion and analytics
  HEAVY = 'TEMPORAL_QUEUE_HEAVY',
}
