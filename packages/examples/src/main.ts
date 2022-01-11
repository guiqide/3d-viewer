import ThreeDViewer from '3d-viewer-core';

const container = document.querySelector('#app')


const options = {
  kiosk: false,
  model: '',
  stats: true,
  autoRotate: true,
  preset: '',
  cameraPosition: null,
  ambientIntensity: 0.3,
	ambientColor: 0xFFFFFF,
  directIntensity: 0.8 * Math.PI,
  directColor: 0xFFFFFF,
};

const viewer = new ThreeDViewer(container, options)

// 这些钩子

viewer.on('preLoad', (viewer) => {

})

viewer.on('loading', (viewer) => {
})

viewer.on('loaded', (viewer) => {
  console.log(viewer)
})

viewer.on('preRender', (viewer) => {

})

viewer.on('rendered', (viewer) => {

})

const transferUrl = (url) => {
  return typeof url === 'string'
      ? url
      : URL.createObjectURL(url);
}

viewer.load(transferUrl('./skate.glb')).then((gltf) => {
  console.log(gltf);
  
})