import { isAxiosError } from 'axios';
import { api } from '@/api/client';

export const MAX_AVATAR_BYTES = 1024 * 1024;
export const AVATAR_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function profileError(cause: unknown, fallback: string) {
  if (isAxiosError(cause)) {
    const detail = cause.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (cause.response?.status === 401) return 'Your session has expired. Please sign in again.';
    return fallback;
  }
  return cause instanceof Error ? cause.message : fallback;
}

export function validatePassword(current: string, next: string, confirmation: string): string | null {
  if (!current) return 'Current password is incorrect';
  if (next.length < 8) return 'Password must be at least 8 characters';
  if (next !== confirmation) return 'Passwords do not match';
  // The current password is verified exclusively by the server.
  return null;
}

function avatarMarker(data: { avatar?: unknown }): string {
  if (typeof data?.avatar !== 'string') throw new Error('Failed to load profile');
  return data.avatar;
}

export async function setAvatarMarker(avatar: string, signal?: AbortSignal) {
  return avatarMarker((await api.put('/auth/profile', { avatar }, { signal })).data);
}

export async function uploadAvatar(form: FormData, signal?: AbortSignal) {
  // Clear the client's JSON default so the adapter supplies the multipart boundary.
  return avatarMarker((await api.put('/auth/profile/avatar', form, { signal, headers: { 'Content-Type': undefined } })).data);
}

export async function removeAvatar(signal?: AbortSignal) {
  return avatarMarker((await api.delete('/auth/profile/avatar', { signal })).data);
}

export async function changePassword(current: string, next: string, signal?: AbortSignal) {
  await api.put('/auth/profile/password', { current_password: current, new_password: next }, { signal });
}

// Load through the authenticated client on both native and web, including when
// the API is hosted on another origin. Never put a session token in the image URL.
export async function getAvatarImage(userId: string, marker: string, signal?: AbortSignal) {
  const { data, headers } = await api.get<ArrayBuffer>(`/auth/avatar/${encodeURIComponent(userId)}`, {
    params: { v: marker.slice(4) }, responseType: 'arraybuffer', signal,
  });
  const mime = String(headers['content-type'] ?? '').split(';')[0];
  const bytes = new Uint8Array(data);
  if (!AVATAR_MIME_TYPES.includes(mime) || !bytes.length || bytes.length > MAX_AVATAR_BYTES) throw new Error('Could not decode image');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1] ?? 0, c = bytes[i + 2] ?? 0;
    chunks.push(alphabet[a >> 2] + alphabet[((a & 3) << 4) | (b >> 4)] +
      (i + 1 < bytes.length ? alphabet[((b & 15) << 2) | (c >> 6)] : '=') +
      (i + 2 < bytes.length ? alphabet[c & 63] : '='));
  }
  return `data:${mime};base64,${chunks.join('')}`;
}
