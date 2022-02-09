<template>
  <div ref="viewRef" class="viewer" :url="url"></div>
</template>

<script>
import { version } from 'vue'
import ThreeDViewer from '3d-viewer-core'

const transferUrl = (url) => {
  return typeof url === 'string'
      ? url
      : URL.createObjectURL(url);
}

export default {
  name: 'ThreeDViewer',
  props: ['url', 'options'],
  mounted() {
    let viewRef = null
    if (version > '3.0') {
      viewRef = this.$el
    } else {
      viewRef = this.$refs.viewRef
    }

    const config = Object.assign({}, this.options);
    const viewer = new ThreeDViewer(viewRef, config);
    viewer.on('preLoad', (loader, threedViewer) => {
      this.$emit('preLoad', [loader, threedViewer]);
    })

    viewer.on('loading', (event, threedViewer) => {
      this.$emit('loading', [event, threedViewer]);
    })

    viewer.on('loaded', (gltf, threedViewer) => {
      this.$emit('loaded', [gltf, threedViewer]);
    })

    viewer.load(transferUrl(this.url)).then((gltf) => {
    })
  },
}
</script>