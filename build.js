const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

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

function copyCSS() {
  fs.mkdirSync('dist', { recursive: true });
  fs.copyFileSync('store-styles.css', 'dist/store-styles.css');
  fs.copyFileSync('admin-styles.css', 'dist/admin-styles.css');
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

    // Report sizes
    const storeSize = fs.statSync('dist/store-app.js').size;
    console.log(`\n📦 dist/store-app.js: ${(storeSize / 1024).toFixed(1)}KB`);
    console.log('✅ Build complete');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
