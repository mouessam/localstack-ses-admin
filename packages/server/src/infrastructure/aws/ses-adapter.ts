import {
  DeleteIdentityCommand,
  ListIdentitiesCommand,
  SendEmailCommand,
  SendRawEmailCommand,
  SESClient,
  VerifyDomainIdentityCommand,
  VerifyEmailIdentityCommand,
} from '@aws-sdk/client-ses';
import type { AppConfig } from '../../config/config';
import type { SesPort } from '../../domain/ports/ses-port';
import type {
  Identity,
  IdentityType,
  SendEmailInput,
  SendEmailResult,
  SendRawInput,
  SendRawResult
} from '../../domain/models/types';
import { UpstreamError } from '../../domain/errors/app-error';

export class AwsSesAdapter implements SesPort {
  private readonly client: SESClient;

  constructor(config: AppConfig) {
    this.client = new SESClient({
      region: config.AWS_REGION,
      endpoint: config.LOCALSTACK_ENDPOINT,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async listIdentities(): Promise<Identity[]> {
    try {
      const response = await this.client.send(new ListIdentitiesCommand({}));
      const identities = response.Identities ?? [];
      return identities.map((identity) => ({
        identity,
        type: identity.includes('@') ? 'email' : 'domain',
      }));
    } catch (error) {
      throw new UpstreamError(`SES list identities failed: ${String(error)}`);
    }
  }

  async verifyIdentity(identity: string, type: IdentityType): Promise<void> {
    try {
      if (type === 'email') {
        await this.client.send(new VerifyEmailIdentityCommand({ EmailAddress: identity }));
        return;
      }
      await this.client.send(new VerifyDomainIdentityCommand({ Domain: identity }));
    } catch (error) {
      throw new UpstreamError(`SES verify identity failed: ${String(error)}`);
    }
  }

  async deleteIdentity(identity: string): Promise<void> {
    try {
      await this.client.send(new DeleteIdentityCommand({ Identity: identity }));
    } catch (error) {
      throw new UpstreamError(`SES delete identity failed: ${String(error)}`);
    }
  }

  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    try {
      const response = await this.client.send(
        new SendEmailCommand({
          Source: input.from,
          Destination: {
            ToAddresses: input.to,
            CcAddresses: input.cc,
            BccAddresses: input.bcc,
          },
          Message: {
            Subject: { Data: input.subject },
            Body: {
              ...(input.text ? { Text: { Data: input.text } } : {}),
              ...(input.html ? { Html: { Data: input.html } } : {}),
            },
          },
        }),
      );

      return { messageId: response.MessageId ?? '' };
    } catch (error) {
      throw new UpstreamError(`SES send email failed: ${String(error)}`);
    }
  }

  async sendRawEmail(input: SendRawInput, raw: Buffer): Promise<SendRawResult> {
    try {
      const destinations = [...input.to, ...(input.cc ?? []), ...(input.bcc ?? [])];
      const response = await this.client.send(
        new SendRawEmailCommand({
          Source: input.from,
          Destinations: destinations,
          RawMessage: { Data: raw },
        }),
      );
      return { messageId: response.MessageId ?? '' };
    } catch (error) {
      throw new UpstreamError(`SES send raw email failed: ${String(error)}`);
    }
  }
}
