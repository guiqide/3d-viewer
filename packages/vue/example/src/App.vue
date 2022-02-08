<template>
  <three-d-viewer url="/skate.glb" :options="options" class="sceen" />
</template>

<script>
import { onMounted, reactive, toRefs } from '@vue/runtime-core'

export default {
  name: 'App',
  setup(_, context) {
    const state = reactive({
      options: {
      },
      url: 'skate.glb'
    })
    onMounted(() => {
      console.log(this, context)
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
