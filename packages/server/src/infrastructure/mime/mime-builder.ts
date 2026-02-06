import MailComposer from 'nodemailer/lib/mail-composer';
import type { SendRawInput } from '@ses-admin/server/domain/models/types';

export type AttachmentInput = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export const buildRawMime = async (
  input: SendRawInput,
  attachments: AttachmentInput[],
): Promise<Buffer> => {
  const mail = new MailComposer({
    from: input.from,
    to: input.to,
    cc: input.cc,
    bcc: input.bcc,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: attachments.map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
    })),
  });

  return new Promise((resolve, reject) => {
    mail.compile().build((err: Error | null, message: Buffer) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(Buffer.from(message));
    });
  });
};
