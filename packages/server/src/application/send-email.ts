import type { SendEmailInput } from '../domain/models/types';
import type { SesPort } from '../domain/ports/ses-port';

export const sendEmail = async (ses: SesPort, input: SendEmailInput) => ses.sendEmail(input);
