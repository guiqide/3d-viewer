import typescript from '@rollup/plugin-typescript';

export default {
  input: './src/main.ts',
  output: {
    file: './lib/core.js',
    format: 'umd',
    name: 'ThreeDViewer',
    exports: 'auto'
  },
  plugins: [typescript({
    tsconfig: './tsconfig.json'
  })]
};
