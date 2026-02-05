import { loadConfig } from './config/config';
import { AwsSesAdapter } from './infrastructure/aws/ses-adapter';
import { LocalStackMessagesAdapter } from './infrastructure/messages/messages-adapter';
import { createServer } from './delivery/http/create-server';

const start = async () => {
  const config = loadConfig();
  const ses = new AwsSesAdapter(config);
  const messages = new LocalStackMessagesAdapter(config);

  const app = createServer({ config, ses, messages });

  await app.listen({ port: config.PORT, host: '0.0.0.0' });
  app.log.info(`Server listening on ${config.PORT}`);
  app.log.info(`LOCALSTACK_ENDPOINT: ${config.LOCALSTACK_ENDPOINT}`);
  app.log.info(`AWS_REGION: ${config.AWS_REGION}`);
  app.log.info(`NODE_ENV: ${config.NODE_ENV}`);
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
