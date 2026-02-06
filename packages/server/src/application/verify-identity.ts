import type { IdentityType } from '@ses-admin/server/domain/models/types';
import type { SesPort } from '@ses-admin/server/domain/ports/ses-port';

export const verifyIdentity = async (ses: SesPort, identity: string, type: IdentityType) => {
  await ses.verifyIdentity(identity, type);
};
