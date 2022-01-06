import html from '@web/rollup-plugin-html';
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  input: 'src/main.ts',
  output: { dir: 'lib' },
  plugins: [
    html({ input: ['index.html'] }),
    esbuildPlugin({ ts: true, tsconfig: './tsconfig.json' })
  ],
};