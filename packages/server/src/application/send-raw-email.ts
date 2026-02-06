import type { SendRawInput } from '@ses-admin/server/domain/models/types';
import type { SesPort } from '@ses-admin/server/domain/ports/ses-port';

export const sendRawEmail = async (ses: SesPort, input: SendRawInput, raw: Buffer) =>
  ses.sendRawEmail(input, raw);
