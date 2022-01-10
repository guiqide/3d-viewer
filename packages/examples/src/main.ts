import ThreeDViewer from '3d-viewer-core';

const container = document.querySelector('#app')


const options = {
  kiosk: false,
  model: '',
  preset: '',
  cameraPosition: null
};

const viewer = new ThreeDViewer(container, options)

const transferUrl = (url) => {
  return typeof url === 'string'
      ? url
      : URL.createObjectURL(url);
}

viewer.load(transferUrl('./skate.glb')).then((gltf) => {
  console.log(gltf);
  
})

viewer.render()