import browserSync from "browser-sync";
import chalk from "chalk";
import del from "del";
import esbuild from "esbuild";
const { dev } = commandLineArgs({ name: "dev", type: Boolean });
const bs = browserSync.create();

const esbuildConig = () => require('esbuild').buildSync({
  entryPoints: ['src/app.js'],
  bundle: true,
  outfile: 'dist/dist.js'
})

esbuildConig();