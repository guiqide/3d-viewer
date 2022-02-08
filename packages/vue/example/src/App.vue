<template>
  <ThreeDViewer :url="url" :options="options" class="sceen" />
</template>

<script>
import { onMounted, reactive, toRefs } from 'vue'
import ThreeDViewer from '3d-viewer-vue'

export default {
  name: 'App',
  components: {
    ThreeDViewer
    },
  setup(_, context) {
    const state = reactive({
      options: {
      },
      url: '/skate.glb'
    })

    return {
      ...toRefs(state)
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.sceen {
  width: 800px;
  height: 800px;
}
</style>
