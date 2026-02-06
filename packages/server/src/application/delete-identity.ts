import type { SesPort } from '@ses-admin/server/domain/ports/ses-port';

export const deleteIdentity = async (ses: SesPort, identity: string) => {
  await ses.deleteIdentity(identity);
};
