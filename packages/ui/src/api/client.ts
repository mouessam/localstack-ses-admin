import type { Identity, ListIdentitiesResponse, Message, SendEmailInput } from '@ses-admin/shared';

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const needsJsonHeader = init?.body && !(init.body instanceof FormData);
  const response = await fetch(path, {
    headers: {
      ...(init?.headers ?? {}),
      ...(needsJsonHeader ? { 'Content-Type': 'application/json' } : {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message ?? response.statusText);
  }

  return (await response.json()) as T;
};

export const listIdentities = () => request<ListIdentitiesResponse>('/api/identities');

export const verifyIdentity = (payload: Identity) =>
  request<{ ok: boolean }>('/api/identities', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const deleteIdentity = (identity: string) =>
  request<{ ok: boolean }>(`/api/identities/${encodeURIComponent(identity)}`, {
    method: 'DELETE',
  });

export const sendEmail = (payload: SendEmailInput) =>
  request<{ messageId: string }>('/api/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const sendRawEmail = (data: FormData) =>
  request<{ messageId: string }>('/api/send-raw', {
    method: 'POST',
    body: data,
  });

export const listMessages = (query?: { id?: string; email?: string }) => {
  const params = new URLSearchParams();
  if (query?.id) params.set('id', query.id);
  if (query?.email) params.set('email', query.email);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return request<{ messages: Message[] }>(`/api/messages${suffix}`);
};

export const deleteMessages = (query?: { id?: string; email?: string }) => {
  const params = new URLSearchParams();
  if (query?.id) params.set('id', query.id);
  if (query?.email) params.set('email', query.email);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return request<{ ok: boolean }>(`/api/messages${suffix}`, {
    method: 'DELETE',
  });
};
