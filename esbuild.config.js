const browserSync =  require("browser-sync");
const esbuild =  require("esbuild");

const bs = browserSync.create();
bs.init({
  server: true
})

bs.watch('./dist/**/*.*').on('change', bs.reload);

const esbuildScript = () => require('esbuild').build({
  entryPoints: ['src/app.js'],
  bundle: true,
  watch: {
    onRebuild(error, result) {
      if (error) console.error('watch build failed:', error)
      else console.log('watch build succeeded:', result)
    },
  },
  outfile: 'dist/dist.js'
}).then(result => {
  console.log('watching...')
})

esbuildScript();