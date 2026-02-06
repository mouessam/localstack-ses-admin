import type { SendEmailInput } from '@ses-admin/server/domain/models/types';
import type { SesPort } from '@ses-admin/server/domain/ports/ses-port';

export const sendEmail = async (ses: SesPort, input: SendEmailInput) => ses.sendEmail(input);
