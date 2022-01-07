import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';


export default {
  input: './src/main.ts',
  output: {
    file: './lib/core.js',
    format: 'cjs',
    exports: 'auto'
  },
  plugins: [typescript({
    tsconfig: './tsconfig.json'
  }), nodeResolve(), commonjs()]
};
