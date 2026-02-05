import { Busboy } from '@fastify/busboy';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { IdentitySchema, SendEmailSchema, SendRawSchema } from '@ses-admin/shared';
import { ValidationError } from '../../domain/errors/app-error';
import type { MessagesPort } from '../../domain/ports/messages-port';
import type { SesPort } from '../../domain/ports/ses-port';
import type { AttachmentInput } from '../../infrastructure/mime/mime-builder';
import { buildRawMime } from '../../infrastructure/mime/mime-builder';
import { deleteIdentity } from '../../application/delete-identity';
import { deleteMessages } from '../../application/delete-messages';
import { listIdentities } from '../../application/list-identities';
import { listMessages } from '../../application/list-messages';
import { sendEmail } from '../../application/send-email';
import { sendRawEmail } from '../../application/send-raw-email';
import { verifyIdentity } from '../../application/verify-identity';

export type RouteDeps = {
  ses: SesPort;
  messages: MessagesPort;
};

const parseList = (value?: string): string[] | undefined => {
  if (!value) return undefined;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const registerRoutes = (app: FastifyInstance, deps: RouteDeps) => {
  app.get('/api/health', async () => ({ ok: true }));

  app.get('/api/identities', async () => {
    const items = await listIdentities(deps.ses);
    return { items };
  });

  app.post('/api/identities', async (request) => {
    const parsed = IdentitySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid identity payload');
    }
    await verifyIdentity(deps.ses, parsed.data.identity, parsed.data.type);
    return { ok: true };
  });

  app.delete('/api/identities/:identity', async (request) => {
    const params = request.params as { identity: string };
    await deleteIdentity(deps.ses, params.identity);
    return { ok: true };
  });

  app.post('/api/send', async (request) => {
    const parsed = SendEmailSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid send payload');
    }
    return sendEmail(deps.ses, parsed.data);
  });

  app.post('/api/send-raw', async (request) => {
    const { fields, attachments } = await parseMultipart(request);

    const parsed = SendRawSchema.safeParse({
      from: fields.from,
      to: parseList(fields.to) ?? [],
      cc: parseList(fields.cc),
      bcc: parseList(fields.bcc),
      subject: fields.subject,
      text: fields.text,
      html: fields.html,
      raw: fields.raw,
    });

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid raw payload');
    }

    const rawBuffer = parsed.data.raw
      ? Buffer.from(parsed.data.raw, 'utf8')
      : await buildRawMime(parsed.data, attachments);

    return sendRawEmail(deps.ses, parsed.data, rawBuffer);
  });

  app.get('/api/messages', async (request) => {
    const query = request.query as { id?: string; email?: string };
    const messages = await listMessages(deps.messages, { id: query.id, email: query.email });
    return { messages };
  });

  app.delete('/api/messages', async (request) => {
    const query = request.query as { id?: string; email?: string };
    await deleteMessages(deps.messages, { id: query.id, email: query.email });
    return { ok: true };
  });
};

const parseMultipart = async (
  request: FastifyRequest,
): Promise<{ fields: Record<string, string>; attachments: AttachmentInput[] }> => {
  const contentType = request.headers['content-type'];
  if (!contentType || !contentType.toString().startsWith('multipart/form-data')) {
    throw new ValidationError('Expected multipart/form-data');
  }

  const fields: Record<string, string> = {};
  const attachments: AttachmentInput[] = [];

  await new Promise<void>((resolve, reject) => {
    const busboy = Busboy({ headers: { 'content-type': contentType.toString() } });

    busboy.on('field', (name, value) => {
      fields[name] = value;
    });

    busboy.on('file', (name, file, filename, _encoding, mimeType) => {
      const chunks: Buffer[] = [];
      file.on('data', (chunk: Buffer) => chunks.push(chunk));
      file.on('limit', () => reject(new ValidationError('Attachment too large')));
      file.on('error', reject);
      file.on('end', () => {
        attachments.push({
          filename: filename || `${name}.bin`,
          contentType: mimeType,
          content: Buffer.concat(chunks),
        });
      });
    });

    busboy.on('error', reject);
    busboy.on('finish', () => resolve());

    request.raw.pipe(busboy);
  });

  return { fields, attachments };
};
