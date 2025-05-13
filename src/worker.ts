import { Worker, NativeConnection } from '@temporalio/worker';
import { Connection as MongoConnection } from '@togethercrew.dev/db';
import * as activities from './activities';

import { ConfigService } from './config';
import parentLogger from './config/logger.config';
const logger = parentLogger.child({ mdoule: 'worker' });

async function connectTemporal(uri: string) {
  return NativeConnection.connect({ address: uri });
}

async function connectMongo(uri: string) {
  const mongo = MongoConnection.getInstance();
  await mongo.connect(uri);
  return mongo;
}

async function createWorker(temporalConn: NativeConnection, taskQueue: string) {
  return Worker.create({
    connection: temporalConn,
    namespace: 'default',
    taskQueue,
    workflowsPath: require.resolve('./workflows'),
    activities,
    maxConcurrentWorkflowTaskExecutions: 5,
    maxConcurrentActivityTaskExecutions: 10,
    bundlerOptions: {
      ignoreModules: ['fs', 'path', 'os', 'crypto'],
    },
  });
}

export async function bootstrap() {
  const configService = ConfigService.getInstance();
  const temporal = await connectTemporal(configService.get('temporal').URI);
  const mongo = await connectMongo(configService.get('db').URI);

  const worker = await createWorker(
    temporal,
    configService.get('temporal').QUEUE,
  );

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down worker…');
    await worker.shutdown();
    await temporal.close();
    if (typeof mongo.disconnect === 'function') {
      await mongo.disconnect();
    }
    process.exit(0);
  };
  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((sig) =>
    process.on(sig, () => shutdown(sig)),
  );

  return worker;
}

(async () => {
  try {
    const worker = await bootstrap();
    logger.info('Worker started');
    await worker.run();
  } catch (err) {
    logger.error({ err }, 'Worker failed');
    process.exit(1);
  }
})();
