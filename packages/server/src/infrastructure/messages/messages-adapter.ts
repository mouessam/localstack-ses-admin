import { request } from 'undici';
import type { AppConfig } from '@ses-admin/server/config/config';
import type { Message } from '@ses-admin/server/domain/models/types';
import type { MessagesPort } from '@ses-admin/server/domain/ports/messages-port';
import { UpstreamError } from '@ses-admin/server/domain/errors/app-error';

export class LocalStackMessagesAdapter implements MessagesPort {
  private readonly endpoint: string;

  constructor(config: AppConfig) {
    this.endpoint = config.LOCALSTACK_ENDPOINT;
  }

  async listMessages(query: { id?: string; email?: string }): Promise<Message[]> {
    const url = new URL('/_aws/ses', this.endpoint);
    if (query.id) url.searchParams.set('id', query.id);
    if (query.email) url.searchParams.set('email', query.email);

    const response = await request(url.toString(), { method: 'GET' });
    if (response.statusCode >= 400) {
      throw new UpstreamError(`LocalStack messages list failed: ${response.statusCode}`);
    }

    const bodyText = await readBody(response.body);
    const parsed = bodyText ? (JSON.parse(bodyText) as { messages?: Message[] }) : {};
    return parsed.messages ?? [];
  }

  async deleteMessages(query: { id?: string; email?: string }): Promise<void> {
    const url = new URL('/_aws/ses', this.endpoint);
    if (query.id) url.searchParams.set('id', query.id);
    if (query.email) url.searchParams.set('email', query.email);

    const response = await request(url.toString(), { method: 'DELETE' });
    if (response.statusCode >= 400) {
      throw new UpstreamError(`LocalStack messages delete failed: ${response.statusCode}`);
    }
  }
}

const readBody = async (body: NodeJS.ReadableStream): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
};
