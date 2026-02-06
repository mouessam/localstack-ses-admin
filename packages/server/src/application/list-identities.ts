import type { SesPort } from '@ses-admin/server/domain/ports/ses-port';

export const listIdentities = async (ses: SesPort) => ses.listIdentities();
