import { env } from 'cloudflare:workers';

// Server-only adapter. Never expose SUPABASE_SECRET_KEY to browser code.
const bucketName = 'project-management-files';
function config() {
  const e = env as unknown as Record<string, string>;
  const base = e.SUPABASE_URL?.replace(/\/$/, '');
  const key = e.SUPABASE_SECRET_KEY;
  if (!base || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base) || !key) {
    throw new Error('Supabase Storage is not configured');
  }
  return { base, key };
}
function endpoint(key: string) {
  if (!key.startsWith('documents/') || key.split('/').some(part => part === '..')) {
    throw new Error('Invalid storage key');
  }
  const { base } = config();
  return base + '/storage/v1/object/' + bucketName + '/' + key.split('/').map(encodeURIComponent).join('/');
}
function headers(extra: Record<string,string> = {}) {
  const { key } = config();
  return { Authorization: 'Bearer ' + key, apikey: key, ...extra };
}
export async function uploadDocument(key: string, bytes: Uint8Array, mime: string) {
  const response = await fetch(endpoint(key), {
    method: 'POST',
    headers: headers({ 'Content-Type': mime, 'x-upsert': 'false' }),
    body: bytes,
  });
  if (!response.ok) throw new Error('Storage upload failed (' + response.status + ')');
}
export async function downloadDocument(key: string): Promise<ReadableStream<Uint8Array> | null> {
  const response = await fetch(endpoint(key), { headers: headers() });
  if (response.status === 404) return null;
  if (!response.ok || !response.body) throw new Error('Storage download failed (' + response.status + ')');
  return response.body;
}
export async function deleteDocument(key: string) {
  const { base } = config();
  const response = await fetch(base + '/storage/v1/object/' + bucketName, {
    method: 'DELETE',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prefixes: [key] }),
  });
  if (!response.ok) throw new Error('Storage cleanup failed (' + response.status + ')');
}
