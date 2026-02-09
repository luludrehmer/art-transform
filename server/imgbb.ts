/**
 * ImgBB image hosting for art-transform.
 * Uploads the transformed image buffer to ImgBB so the previewImageUrl
 * sent to Photos-to-Paintings is a stable public URL (i.ibb.co/...)
 * that works from anywhere — no localhost dependency.
 *
 * API: https://api.imgbb.com/
 */

import sharp from 'sharp';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

export function isImgbbConfigured(): boolean {
  return !!IMGBB_API_KEY;
}

/**
 * Upload an image buffer to ImgBB. Optimizes to WebP before upload.
 * Returns the direct image URL (data.url).
 */
export async function uploadToImgbb(
  buffer: Buffer,
  slug?: string
): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error('IMGBB_API_KEY not set. Cannot upload to ImgBB.');
  }

  // Optimize: resize to max 1600px, convert to WebP
  const optimized = await sharp(buffer)
    .resize(1600, null, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer();

  const base64 = optimized.toString('base64');
  const params = new URLSearchParams();
  params.set('key', IMGBB_API_KEY);
  params.set('image', base64);
  if (slug) {
    params.set('name', slug.replace(/[^a-zA-Z0-9._-]/g, '_'));
  }

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ImgBB upload failed: ${res.status} ${text}`);
  }

  const json = (await res.json()) as { data?: { url?: string }; success?: boolean };
  if (!json.data?.url) {
    throw new Error('ImgBB response missing data.url');
  }

  return json.data.url;
}
