// ════════════════════════════════════════════════════════════
// DACEWAV.STORE — Cloudflare Worker: Upload to R2
// ════════════════════════════════════════════════════════════
// Binding: AUDIO_BUCKET (R2)
// Deploy via: wrangler deploy

const ALLOWED_TYPES = [
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif'
];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    // Auth check — expect Bearer token (Firebase ID token)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file');
      const path = formData.get('path');

      if (!file || !path) {
        return json({ error: 'Missing file or path' }, 400);
      }

      if (file.size > MAX_SIZE) {
        return json({ error: 'File too large (max 50MB)' }, 413);
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return json({ error: `Invalid file type: ${file.type}` }, 415);
      }

      // Upload to R2
      const arrayBuffer = await file.arrayBuffer();
      await env.AUDIO_BUCKET.put(path, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000',
        },
      });

      // Public URL (assumes R2 custom domain: cdn.dacewav.store)
      const url = `https://cdn.dacewav.store/${path}`;

      return json({ url, path, size: file.size, type: file.type });
    } catch (err) {
      return json({ error: 'Upload failed', details: err.message }, 500);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
