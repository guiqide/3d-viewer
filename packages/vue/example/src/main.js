import { createApp } from 'vue'
import App from './App.vue'
import ThreeDViewer from '3d-viewer-vue'

const app = createApp(App)

app.use(ThreeDViewer, {})
console.log(app)
app.mount('#app')
