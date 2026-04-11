export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const token = request.headers.get('X-Upload-Token');

    // CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Token',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    // Health check
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', service: 'DACEWAV R2 Worker' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Auth check for mutations
    if (['PUT', 'POST', 'DELETE'].includes(request.method)) {
      if (!token || token !== env.UPLOAD_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Upload (PUT /:key)
    if (request.method === 'PUT') {
      const key = decodeURIComponent(url.pathname.slice(1));
      if (!key) {
        return new Response(JSON.stringify({ error: 'Missing key' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
      await env.R2_BUCKET.put(key, request.body, {
        httpMetadata: { contentType, cacheControl: 'public, max-age=31536000' },
      });

      const cdnBase = env.CDN_URL || `https://${url.hostname}`;
      const publicUrl = `${cdnBase}/${key}`;

      return new Response(JSON.stringify({ url: publicUrl, key }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete (DELETE /:key)
    if (request.method === 'DELETE') {
      const key = decodeURIComponent(url.pathname.slice(1));
      if (!key) {
        return new Response(JSON.stringify({ error: 'Missing key' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      await env.R2_BUCKET.delete(key);
      return new Response(JSON.stringify({ deleted: key }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // List (GET /?prefix=...)
    if (request.method === 'GET' && url.pathname === '/list') {
      const prefix = url.searchParams.get('prefix') || '';
      const limit = parseInt(url.searchParams.get('limit')) || 100;
      const listed = await env.R2_BUCKET.list({ prefix, limit });
      return new Response(JSON.stringify(listed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
