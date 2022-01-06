import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/main.ts',
  output: {
    dir: 'lib',
    format: 'iife'
  },
  plugins: [typescript({
    tsconfig: './tsconfig.json'
  })]
};
