import type { SesPort } from '../domain/ports/ses-port';

export const listIdentities = async (ses: SesPort) => ses.listIdentities();
