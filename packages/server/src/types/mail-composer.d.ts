declare module 'nodemailer/lib/mail-composer' {
  type Address = string | { name?: string; address: string };
  type Attachment = {
    filename?: string;
    content?: Buffer | string;
    contentType?: string;
  };

  interface MailComposerOptions {
    from?: Address;
    to?: Address | Address[];
    cc?: Address | Address[];
    bcc?: Address | Address[];
    subject?: string;
    text?: string;
    html?: string;
    attachments?: Attachment[];
  }

  class MailComposer {
    constructor(options: MailComposerOptions);
    compile(): {
      build: (callback: (err: Error | null, message: Buffer) => void) => void;
    };
  }

  export = MailComposer;
}
