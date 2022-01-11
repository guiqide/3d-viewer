import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs';
import glslify from 'rollup-plugin-glslify';


export default {
  input: './src/main.ts',
  output: {
    file: './lib/core.js',
    format: 'cjs',
    exports: 'auto'
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    typescript({
      tsconfig: './tsconfig.json'
    }),
    glslify({
      include: [
        'src/**/*.vs',
        'src/**/*.fs',
        'src/**/*.vert',
        'src/**/*.frag',
        'src/**/*.glsl'
      ],
    }),
    nodeResolve(),
    commonjs(),
  ]
};
