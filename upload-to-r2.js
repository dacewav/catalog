#!/usr/bin/env node
/**
 * upload-to-r2.js — Sube archivos a Cloudflare R2 (S3-compatible)
 * Uso: node upload-to-r2.js archivo1.jpg archivo2.png ...
 *      node upload-to-r2.js --prefix audio/ beat.mp3
 *      node upload-to-r2.js --list
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// === CONFIG ===
const ACCOUNT_ID = 'b9915d52e9ac118230931e40d46ab3ce';
const BUCKET = 'dace-beats';
const PUBLIC_URL = 'https://cdn.dacewav.store';
const REGION = 'auto';
const HOST = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;

const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

// === HELPERS ===
function hmacSHA256(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function sha256hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif',
    '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
    '.ogg': 'audio/ogg', '.m4a': 'audio/mp4',
    '.mp4': 'video/mp4', '.webm': 'video/webm',
    '.json': 'application/json', '.css': 'text/css',
    '.html': 'text/html', '.js': 'application/javascript',
    '.md': 'text/markdown', '.txt': 'text/plain',
    '.pdf': 'application/pdf', '.zip': 'application/zip',
  };
  return types[ext] || 'application/octet-stream';
}

function parseArgs() {
  const args = process.argv.slice(2);
  let prefix = '';
  const files = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--prefix' && args[i + 1]) {
      prefix = args[i + 1].replace(/\/$/, '') + '/';
      i++;
    } else {
      files.push(args[i]);
    }
  }
  return { prefix, files };
}

// === R2IGNORE ===
function loadIgnoreRules() {
  const ignoreFile = path.join(process.cwd(), '.r2ignore');
  if (!fs.existsSync(ignoreFile)) return [];
  return fs.readFileSync(ignoreFile, 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
}

function isIgnored(filename, patterns) {
  const basename = path.basename(filename);
  return patterns.some(pat => {
    if (pat.startsWith('*')) return basename.endsWith(pat.slice(1));
    if (pat.endsWith('*')) return basename.startsWith(pat.slice(0, -1));
    return basename === pat;
  });
}

// === AWS SIGNATURE V4 ===
function signAndRequest(method, objectKey, body, contentType) {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const dateStamp = now.toISOString().replace(/[-:]/g, '').slice(0, 8);
    const amzDate = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    const payloadHash = sha256hex(body);

    const canonicalUri = `/${BUCKET}/${encodeURI(objectKey).replace(/%2F/g, '/')}`;
    const canonicalHeaders = `host:${HOST}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      method, canonicalUri, '',
      canonicalHeaders, signedHeaders, payloadHash
    ].join('\n');

    const credentialScope = `${dateStamp}/${REGION}/s3/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256hex(canonicalRequest)}`;

    const kDate = hmacSHA256(`AWS4${SECRET_ACCESS_KEY}`, dateStamp);
    const kRegion = hmacSHA256(kDate, REGION);
    const kService = hmacSHA256(kRegion, 's3');
    const kSigning = hmacSHA256(kService, 'aws4_request');
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const options = {
      hostname: HOST,
      port: 443,
      path: canonicalUri,
      method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': contentType,
        'Content-Length': body.length,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ objectKey, url: `${PUBLIC_URL}/${objectKey}`, status: res.statusCode });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// === LIST OBJECTS ===
function listObjects() {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const dateStamp = now.toISOString().replace(/[-:]/g, '').slice(0, 8);
    const amzDate = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';

    const canonicalUri = `/${BUCKET}`;
    const canonicalHeaders = `host:${HOST}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      'GET', canonicalUri, 'list-type=2',
      canonicalHeaders, signedHeaders, 'UNSIGNED-PAYLOAD'
    ].join('\n');

    const credentialScope = `${dateStamp}/${REGION}/s3/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256hex(canonicalRequest)}`;

    const kDate = hmacSHA256(`AWS4${SECRET_ACCESS_KEY}`, dateStamp);
    const kRegion = hmacSHA256(kDate, REGION);
    const kService = hmacSHA256(kRegion, 's3');
    const kSigning = hmacSHA256(kService, 'aws4_request');
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const options = {
      hostname: HOST,
      port: 443,
      path: `${canonicalUri}?list-type=2`,
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
        'x-amz-date': amzDate,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Simple XML parse for object keys
          const objects = [];
          const keyRegex = /<Key>([^<]+)<\/Key>/g;
          const sizeRegex = /<Size>([^<]+)<\/Size>/g;
          const keys = [...data.matchAll(keyRegex)].map(m => m[1]);
          const sizes = [...data.matchAll(sizeRegex)].map(m => parseInt(m[1]));
          for (let i = 0; i < keys.length; i++) {
            objects.push({ key: keys[i], size: sizes[i] || 0 });
          }
          resolve(objects);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// === DELETE OBJECT ===
function deleteObject(objectKey) {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const dateStamp = now.toISOString().replace(/[-:]/g, '').slice(0, 8);
    const amzDate = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';

    const canonicalUri = `/${BUCKET}/${encodeURI(objectKey).replace(/%2F/g, '/')}`;
    const canonicalHeaders = `host:${HOST}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      'DELETE', canonicalUri, '',
      canonicalHeaders, signedHeaders, 'UNSIGNED-PAYLOAD'
    ].join('\n');

    const credentialScope = `${dateStamp}/${REGION}/s3/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256hex(canonicalRequest)}`;

    const kDate = hmacSHA256(`AWS4${SECRET_ACCESS_KEY}`, dateStamp);
    const kRegion = hmacSHA256(kDate, REGION);
    const kService = hmacSHA256(kRegion, 's3');
    const kSigning = hmacSHA256(kService, 'aws4_request');
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const options = {
      hostname: HOST,
      port: 443,
      path: canonicalUri,
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
        'x-amz-date': amzDate,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ key: objectKey, deleted: true });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// === MAIN ===
async function main() {
  if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    console.error('❌ Faltan variables de entorno:');
    console.error('   export R2_ACCESS_KEY_ID="..."');
    console.error('   export R2_SECRET_ACCESS_KEY="..."');
    process.exit(1);
  }

  if (process.argv.includes('--list')) {
    console.log('\n📂 Archivos en el bucket:\n');
    const objects = await listObjects();
    if (objects.length === 0) {
      console.log('   (vacío)');
    } else {
      objects.forEach(obj => {
        const sz = obj.size > 1048576
          ? `${(obj.size / 1048576).toFixed(1)} MB`
          : `${(obj.size / 1024).toFixed(1)} KB`;
        console.log(`   📄 ${obj.key} (${sz})`);
        console.log(`      → ${PUBLIC_URL}/${obj.key}\n`);
      });
    }
    return;
  }

  // Handle --delete
  const deleteIdx = process.argv.indexOf('--delete');
  if (deleteIdx !== -1) {
    const filesToDelete = process.argv.slice(deleteIdx + 1).filter(a => !a.startsWith('--'));
    if (filesToDelete.length === 0) {
      console.log('Uso: node upload-to-r2.js --delete archivo1 archivo2 ...');
      process.exit(0);
    }
    console.log(`\n🗑️  Borrando ${filesToDelete.length} archivo(s) del bucket...\n`);
    let ok = 0, fail = 0;
    for (const file of filesToDelete) {
      try {
        await deleteObject(file);
        console.log(`✅ ${file} borrado`);
        ok++;
      } catch (err) {
        console.error(`❌ ${file}: ${err.message}`);
        fail++;
      }
    }
    console.log(`\n📊 ${ok} borrados, ${fail} fallidos\n`);
    return;
  }

  const { prefix, files } = parseArgs();
  if (files.length === 0) {
    console.log('Uso:');
    console.log('  node upload-to-r2.js archivo.jpg');
    console.log('  node upload-to-r2.js --prefix img/ *.jpg');
    console.log('  node upload-to-r2.js --list');
    process.exit(0);
  }

  console.log(`\n🪣 Subiendo ${files.length} archivo(s) → ${BUCKET}${prefix ? '/' + prefix : ''}\n`);

  const ignorePatterns = loadIgnoreRules();
  let ok = 0, fail = 0, skipped = 0;
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error(`❌ ${file}: no existe\n`);
      fail++;
      continue;
    }
    if (isIgnored(file, ignorePatterns)) {
      console.log(`⏭️  ${file}: ignorado (.r2ignore)\n`);
      skipped++;
      continue;
    }
    const objectKey = prefix + path.basename(file);
    const contentType = getMimeType(file);
    const body = fs.readFileSync(file);
    try {
      const res = await signAndRequest('PUT', objectKey, body, contentType);
      console.log(`✅ ${file} (${(body.length / 1024).toFixed(1)} KB)`);
      console.log(`   → ${res.url}\n`);
      ok++;
    } catch (err) {
      console.error(`❌ ${file}: ${err.message}\n`);
      fail++;
    }
  }

  console.log(`📊 ${ok} subidos, ${fail} fallidos, ${skipped} ignorados\n`);
}

main().catch(console.error);
