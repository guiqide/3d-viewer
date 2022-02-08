<template>
  <div ref="viewRef" class="viewer" :url="url"></div>
</template>

<script>
import { onMounted, ref } from 'vue'
import ThreeDViewer from '3d-viewer-core'

export default {
  name: 'ThreeDViewer',
  props: ['url', 'options'],
  setup(props, {emit}) {
    onMounted(() => {
      const config = Object.assign({}, options, props.options);
      const viewer = new ThreeDViewer(viewRef.value, config);

      viewer.on('preLoad', (loader, threedViewer) => {
        emit('preLoad', [loader, threedViewer]);
      })

      viewer.on('loading', (event, threedViewer) => {
        emit('loading', [event, threedViewer]);
      })

      viewer.on('loaded', (gltf, threedViewer) => {
        emit('loaded', [gltf, threedViewer]);
      })

      viewer.load(transferUrl(props.url)).then((gltf) => {
        console.log(gltf);
      })
    })
    const viewRef = ref(null);

    return { viewRef }
  },
}
</script>