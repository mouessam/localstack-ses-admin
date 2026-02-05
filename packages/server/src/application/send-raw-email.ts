import type { SendRawInput } from '../domain/models/types';
import type { SesPort } from '../domain/ports/ses-port';

export const sendRawEmail = async (ses: SesPort, input: SendRawInput, raw: Buffer) =>
  ses.sendRawEmail(input, raw);
