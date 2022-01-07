import typescript from '@rollup/plugin-typescript';
import htmlTemplate from 'rollup-plugin-generate-html-template';

export default {
  input: 'src/main.ts',
  output: {
    dir: 'lib',
    format: 'esm'
  },
  plugins: [typescript({
    tsconfig: './tsconfig.json'
  }), htmlTemplate({
    template: 'public/index.html',
    target: 'lib/index.html'
  })]
};
