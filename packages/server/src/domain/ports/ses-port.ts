import type {
  Identity,
  IdentityType,
  SendEmailInput,
  SendEmailResult,
  SendRawInput,
  SendRawResult,
} from '@ses-admin/server/domain/models/types';

export interface SesPort {
  listIdentities(): Promise<Identity[]>;
  verifyIdentity(identity: string, type: IdentityType): Promise<void>;
  deleteIdentity(identity: string): Promise<void>;
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
  sendRawEmail(input: SendRawInput, raw: Buffer): Promise<SendRawResult>;
}
