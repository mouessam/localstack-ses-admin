import type {
  Identity,
  IdentityType,
  Message,
  SendEmailInput,
  SendRawInput,
} from '@ses-admin/shared';

export type { Identity, IdentityType, Message, SendEmailInput, SendRawInput };

export type SendEmailResult = { messageId: string };
export type SendRawResult = { messageId: string };
