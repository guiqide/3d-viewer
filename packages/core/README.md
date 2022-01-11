# 3d-viewer-core

是gltf的主渲染库

使用方法：

```
const options = {};

import ThreeDViewer from '3d-viewer-core';

const container = document.querySelector('#app')

const viewer = new ThreeDViewer(container, options)

viewer.load('http://gltf.url').then((gltf) => {
  console.log('gltf loaded');
})


```

## options参数

autoRotate `boolean`
自动旋转
默认: `true`

autoRotateSpeed `number`
渲染转速度
默认: `1.0`

stats `boolean`
是否开启帧数、内存显示
默认: `false`

isBgColor `boolean`
是否开启渐变色彩背景
默认: `true`

bgColor1 `string`
渐变背景色1
默认: `#ffffff`

bgColor2 `string`
渐变背景色2
默认: `#353535`

ambientIntensity `number`
环境光强度
默认: `0.3`

ambientColor `number`
环境光颜色
默认: `0xFFFFFF`

directIntensity `number`
平行光强度
默认: `0.8 * Math.PI`

ambientColor `number`
平行光颜色
默认: `0xFFFFFF`

## 对外函数

加载gltf前
viewer.on('preLoad', (gltf, new ThreeDViewer) => {})

加载gltf时
viewer.on('loading', (ProgressEvent, new ThreeDViewer) => {})

加载gltf完成
viewer.on('loaded', (gltf, new ThreeDViewer) => {})


