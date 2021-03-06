const rollup = require('rollup');
const typescript = require('@rollup/plugin-typescript');
const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve;
const commonjs = require('@rollup/plugin-commonjs');
import glslify from 'rollup-plugin-glslify';

const def = {
  input: './src/main.ts',
  plugins: [
    glslify({
      include: [
        'src/**/*.vs',
        'src/**/*.fs',
        'src/**/*.vert',
        'src/**/*.frag',
        'src/**/*.glsl'
      ],
    }),
    typescript({
      tsconfig: './tsconfig.json'
    }),
    nodeResolve(),
    commonjs()
  ],
  external: [
    'three',
    'three/examples/jsm/loaders/GLTFLoader.js',
    'three/examples/jsm/loaders/DRACOLoader.js',
    'three/examples/jsm/loaders/KTX2Loader.js',
    'three/examples/jsm/controls/OrbitControls.js',
    'three/examples/jsm/libs/meshopt_decoder.module.js'
  ],
  output: {
    file: './lib/core.js',
    format: 'cjs',
    exports: 'auto'
  }
  
}

export default def