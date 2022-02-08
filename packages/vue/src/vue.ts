
import ThreeD from '3d-viewer-core'
import {ref} from 'vue'

const transferUrl = (url) => {
  return typeof url === 'string'
      ? url
      : URL.createObjectURL(url);
}

export default {
  install(app, options) {
    app.component('ThreeDViewer', {
      props: ['options', 'url'],
      template: `<div class="threed-viewer" ref="viewRef" >asdf</div>`,
      mounted() {
        debugger
        const config = Object.assign({}, options, this.options);
          const viewer = new ThreeD(this.$refs.viewRef, config);

          viewer.on('preLoad', (loader, threedViewer) => {
            this.emit('preLoad', [loader, threedViewer]);
          })

          viewer.on('loading', (event, threedViewer) => {
            this.emit('loading', [event, threedViewer]);
          })

          viewer.on('loaded', (gltf, threedViewer) => {
            this.emit('loaded', [gltf, threedViewer]);
          })

          viewer.load(transferUrl(this.url)).then((gltf) => {
            console.log(gltf);
          })
      },
     
    })
  }
}