import typescript from '@rollup/plugin-typescript';
import htmlTemplate from 'rollup-plugin-generate-html-template';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve'


export default {
  input: 'src/main.ts',
  output: {
    dir: 'lib',
    format: 'esm'
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    }),
    htmlTemplate({
      template: 'public/index.html',
      target: 'lib/index.html'
    }),
    serve('lib'),
    commonjs(),
    nodeResolve()
  ]
};
