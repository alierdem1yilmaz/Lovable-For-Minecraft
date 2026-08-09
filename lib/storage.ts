import { createAdminClient } from './supabase/admin';

const GENERATIONS_BUCKET = 'generations';
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 saat

export async function createSignedDownloadUrl(path: string | null): Promise<string | null> {
  if (!path) return null;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(GENERATIONS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    console.error('signed url error', error);
    return null;
  }

  return data.signedUrl;
}
