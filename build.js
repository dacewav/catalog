const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const isWatch = process.argv.includes('--watch');
const isDev = process.argv.includes('--dev');

const storeConfig = {
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  sourcemap: true,
  minify: !isWatch && !isDev,
  logLevel: 'info',
  entryPoints: ['src/main.js'],
  outfile: 'dist/store-app.js',
};

const adminConfig = {
  ...storeConfig,
  entryPoints: ['src/admin-main.js'],
  outfile: 'dist/admin-app.js',
};

function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

function copyCSS() {
  fs.mkdirSync('dist', { recursive: true });
  fs.copyFileSync('store-styles.css', 'dist/store-styles.css');
  fs.copyFileSync('admin-styles.css', 'dist/admin-styles.css');
  // Copy _headers for Cloudflare Pages (CSP, security headers)
  if (fs.existsSync('_headers')) fs.copyFileSync('_headers', 'dist/_headers');
}

function bustCache() {
  // Compute hashes
  const hashes = {
    'admin-styles.css': hashFile('admin-styles.css'),
    'dist/admin-app.js': hashFile('dist/admin-app.js'),
    'store-styles.css': hashFile('store-styles.css'),
    'dist/store-app.js': hashFile('dist/store-app.js'),
  };

  // Update admin.html
  if (fs.existsSync('admin.html')) {
    let html = fs.readFileSync('admin.html', 'utf8');
    html = html.replace(
      /admin-styles\.css(\?v=[^"']*)?/g,
      `admin-styles.css?v=${hashes['admin-styles.css']}`
    );
    html = html.replace(
      /dist\/admin-app\.js(\?v=[^"']*)?/g,
      `dist/admin-app.js?v=${hashes['dist/admin-app.js']}`
    );
    fs.writeFileSync('admin.html', html);
    console.log(`🔑 admin.html → css:${hashes['admin-styles.css']} js:${hashes['dist/admin-app.js']}`);
  }

  // Update index.html (store)
  if (fs.existsSync('index.html')) {
    let html = fs.readFileSync('index.html', 'utf8');
    html = html.replace(
      /store-styles\.css(\?v=[^"']*)?/g,
      `store-styles.css?v=${hashes['store-styles.css']}`
    );
    html = html.replace(
      /dist\/store-app\.js(\?v=[^"']*)?/g,
      `dist/store-app.js?v=${hashes['dist/store-app.js']}`
    );
    fs.writeFileSync('index.html', html);
    console.log(`🔑 index.html → css:${hashes['store-styles.css']} js:${hashes['dist/store-app.js']}`);
  }
}

async function main() {
  fs.mkdirSync('dist', { recursive: true });

  if (isWatch) {
    const ctxStore = await esbuild.context(storeConfig);
    const ctxAdmin = await esbuild.context(adminConfig);
    await ctxStore.watch();
    await ctxAdmin.watch();
    copyCSS();
    fs.watch('store-styles.css', copyCSS);
    fs.watch('admin-styles.css', copyCSS);
    console.log('👀 Watching for changes...');
  } else {
    await esbuild.build(storeConfig);
    await esbuild.build(adminConfig);
    copyCSS();
    bustCache();

    // Report sizes
    const storeSize = fs.statSync('dist/store-app.js').size;
    const adminSize = fs.statSync('dist/admin-app.js').size;
    console.log(`\n📦 store: ${(storeSize / 1024).toFixed(1)}KB | admin: ${(adminSize / 1024).toFixed(1)}KB`);
    console.log('✅ Build complete');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
