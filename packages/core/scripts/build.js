const rollup = require('rollup');
const typescript = require('@rollup/plugin-typescript');
const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve;
const commonjs = require('@rollup/plugin-commonjs');
const path = require('path');



const outputCommonJSOptions = {
  file: './lib/core.js',
  format: 'cjs',
  exports: 'auto'
}

const outputESMOptions = {
  file: './lib/core.esm.js',
  format: 'esm',
  exports: 'auto'
}

const outputRuntimeOptions = {
  file: './lib/core.runtime.js',
  format: 'umd',
  name: 'ThreeDViewer',
  exports: 'auto'
}

const pluginOptions = [typescript({
  tsconfig: path.resolve('./tsconfig.json')
}), nodeResolve(), commonjs()]

const external = [
  'three',
  'three/examples/jsm/loaders/GLTFLoader.js',
  'three/examples/jsm/loaders/DRACOLoader.js',
  'three/examples/jsm/loaders/KTX2Loader.js',
  'three/examples/jsm/controls/OrbitControls.js',
  'three/examples/jsm/libs/meshopt_decoder.module.js'
]

const inputOptions = {
  input: './src/main.ts',
  plugins: pluginOptions
}

async function build() {
  if (process.env.NODE_ENV === 'production') {
    const bundleWithRuntime = await rollup.rollup(inputOptions)
    const buidleWithExternal = await rollup.rollup({...inputOptions, external})

    await buidleWithExternal.write(outputCommonJSOptions);

    await buidleWithExternal.write(outputESMOptions);

    await buidleWithExternal.close();

    await bundleWithRuntime.write(outputRuntimeOptions);

    await bundleWithRuntime.close();
  } else {
    const bundleWithRuntime = await rollup.rollup(inputOptions)
    const buidleWithExternal = await rollup.rollup({...inputOptions, external})

    await buidleWithExternal.write(outputCommonJSOptions);

    await buidleWithExternal.write(outputESMOptions);

    await buidleWithExternal.close();

    await bundleWithRuntime.write(outputRuntimeOptions);

    await bundleWithRuntime.close();

  }
}

build()