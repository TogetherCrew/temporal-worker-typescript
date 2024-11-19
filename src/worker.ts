import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
import { config } from './config';
import { Connection } from '@togethercrew.dev/db';

async function run() {
  await Connection.getInstance().connect(
    [
      'mongodb://',
      config.DB_USER,
      ':',
      config.DB_PASSWORD,
      '@',
      config.DB_HOST,
      ':',
      config.DB_PORT,
      '/',
      config.DB_NAME,
      '?authSource=admin',
      '&directConnection=true',
    ].join(''),
  );
  // Step 1: Establish a connection with Temporal server.
  //
  // Worker code uses `@temporalio/worker.NativeConnection`.
  // (But in your application code it's `@temporalio/client.Connection`.)
  const connection = await NativeConnection.connect({
    address: config.TEMPORAL_URI,
    // TLS and gRPC metadata configuration goes here.
  });
  // Step 2: Register Workflows and Activities with the Worker.
  const worker = await Worker.create({
    connection,
    namespace: 'default',
    taskQueue: config.QUEUE,
    workflowsPath: require.resolve('./workflows'),
    activities,
  });

  // Step 3: Start accepting tasks on the `hello-world` queue
  //
  // The worker runs until it encounters an unexpected error or the process receives a shutdown signal registered on
  // the SDK Runtime object.
  //
  // By default, worker logs are written via the Runtime logger to STDERR at INFO level.
  //
  // See https://typescript.temporal.io/api/classes/worker.Runtime#install to customize these defaults.
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
