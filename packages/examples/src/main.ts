import threeDViewer from '3d-viewer-core';

const container = document.querySelector('#app')


const options = {
  kiosk: false,
  model: '',
  preset: '',
  cameraPosition: null
};

const render = new threeDViewer(container, options)

const transferUrl = (url: string) => {
  return typeof url === 'string'
      ? url
      : URL.createObjectURL(url);
}

render.load(transferUrl('./assets/models/skate.glb')).then((gltf) => {
  console.log(gltf);
})

render.render()