import type { IdentityType } from '../domain/models/types';
import type { SesPort } from '../domain/ports/ses-port';

export const verifyIdentity = async (ses: SesPort, identity: string, type: IdentityType) => {
  await ses.verifyIdentity(identity, type);
};
