const rollup = require('rollup');
const typescript = require('@rollup/plugin-typescript');
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

const pluginOptions = [typescript({
  tsconfig: path.resolve('./tsconfig.json')
})]

const inputOptions = {
  input: './src/main.ts',
  plugins: pluginOptions
}

async function build() {
  if (process.env.NODE_ENV === 'production') {
    const bundle = await rollup.rollup(inputOptions)

    const { output } = await bundle.generate(outputOptions);
  
    console.log(output);
  } else {
    const bundle = await rollup.rollup(inputOptions)

    await bundle.write(outputCommonJSOptions);

    await bundle.write(outputESMOptions);

    await bundle.close();

  }
}

build()