/**
 * r2-upload-worker.js
 * Cloudflare Worker para subir archivos a R2 desde el admin panel.
 * 
 * SETUP:
 * 1. Cloudflare Dashboard → Workers & Pages → Create Worker
 * 2. Pega este código
 * 3. En Settings → Variables → R2 Bucket Bindings:
 *    - Variable name: BUCKET
 *    - R2 bucket: dace-beats
 * 4. En Settings → Variables → Environment Variables:
 *    - UPLOAD_TOKEN = (genera un token aleatorio fuerte, ej: openssl rand -hex 24)
 *    - PUBLIC_URL = https://cdn.dacewav.store
 * 5. Deploy
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ALLOWED_ORIGINS = [
      'https://dacewav.store',
      'https://cdn.dacewav.store',
      // Agrega aquí orígenes de desarrollo si los necesitas:
      // 'http://localhost:3000',
    ];

    const origin = request.headers.get('Origin') || '';
    const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

    const corsHeaders = {
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Upload-Token',
    };

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // ═══ Rate Limiting (simple IP-based via cache) ═══
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rlKey = `rl:${clientIP}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minuto
    const maxRequests = 60; // 60 req/min por IP

    // Health check no cuenta para rate limit
    if (url.pathname !== '/' || request.method !== 'GET') {
      try {
        const rlCache = caches.default;
        const rlReq = new Request(`https://rl.internal/${rlKey}`);
        const cached = await rlCache.match(rlReq);
        let count = 0;
        let windowStart = now;
        if (cached) {
          const data = await cached.json();
          count = data.count || 0;
          windowStart = data.windowStart || now;
        }
        if (now - windowStart > windowMs) {
          count = 0;
          windowStart = now;
        }
        count++;
        if (count > maxRequests) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Intenta de nuevo en 1 minuto.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
          });
        }
        const rlRes = new Response(JSON.stringify({ count, windowStart }), {
          headers: { 'Cache-Control': `max-age=${Math.ceil(windowMs / 1000)}` },
        });
        await rlCache.put(rlReq, rlRes);
      } catch (e) {
        // Si rate limiting falla, continuar sin bloquear
      }
    }

    // Health check
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', service: 'dacewav-r2-upload' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Listar archivos
    if (url.pathname === '/list' && request.method === 'GET') {
      const token = request.headers.get('X-Upload-Token');
      if (token !== env.UPLOAD_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const prefix = url.searchParams.get('prefix') || '';
      const listed = await env.BUCKET.list({ prefix });
      const files = listed.objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        url: `${env.PUBLIC_URL}/${obj.key}`,
        uploaded: obj.uploaded,
      }));

      return new Response(JSON.stringify({ files }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upload
    if (request.method === 'PUT' || request.method === 'POST') {
      // Auth
      const token = request.headers.get('X-Upload-Token');
      if (token !== env.UPLOAD_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Obtener nombre del archivo de la URL
      let objectKey = url.pathname.slice(1); // quitar el /
      if (!objectKey) {
        return new Response(JSON.stringify({ error: 'Falta nombre de archivo en la URL' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Decodificar URL (espacios, etc)
      objectKey = decodeURIComponent(objectKey);

      let body, contentType;

      if (request.method === 'POST') {
        // Multipart form data
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) {
          return new Response(JSON.stringify({ error: 'No se encontró archivo en el form' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        body = await file.arrayBuffer();
        contentType = file.type || 'application/octet-stream';

        // Si envían un key personalizado, usarlo
        const customKey = formData.get('key');
        if (customKey) {
          objectKey = customKey;
        }
      } else {
        // PUT directo
        body = await request.arrayBuffer();
        contentType = request.headers.get('Content-Type') || 'application/octet-stream';
      }

      // Guardar en R2
      await env.BUCKET.put(objectKey, body, {
        httpMetadata: { contentType },
      });

      const publicUrl = `${env.PUBLIC_URL}/${objectKey}`;

      return new Response(JSON.stringify({
        success: true,
        key: objectKey,
        url: publicUrl,
        size: body.byteLength,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete
    if (request.method === 'DELETE') {
      const token = request.headers.get('X-Upload-Token');
      if (token !== env.UPLOAD_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const objectKey = decodeURIComponent(url.pathname.slice(1));
      if (!objectKey) {
        return new Response(JSON.stringify({ error: 'Falta nombre de archivo' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await env.BUCKET.delete(objectKey);

      return new Response(JSON.stringify({ success: true, deleted: objectKey }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
