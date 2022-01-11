/**
 * Source: https://github.com/mattdesl/three-vignette-background
 * License: MIT
 * 因为原仓库没有开外修改颜色接口等参数的接口，所以这里重写修改
 */

import {
  Color,
  DoubleSide,
  Mesh,
  BufferGeometry,
  PlaneGeometry,
  RawShaderMaterial,
  Vector2
} from 'three';
import vert from './shader.vert'
import frag from './shader.frag'

interface backgroundProps {
  colors?: string[]
  geometry?: BufferGeometry
}

export default function createBackground(opt: backgroundProps) {
  opt = opt || {}
  // https://threejs.org/docs/?q=PlaneGeometry#api/en/geometries/PlaneGeometry
  const geometry = opt.geometry || new PlaneGeometry(2, 2, 1)
  const material = new RawShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    side: DoubleSide,
    uniforms: {
      aspectCorrection: { value: false },
      aspect: {value: 1 },
      grainScale: { value: 0.005 },
      grainTime: { value: 0 },
      noiseAlpha: { value: 0.25 },
      offset: { value: new Vector2(0, 0) },
      scale: { value: new Vector2(1, 1) },
      smooth: { value: new Vector2(0.0, 1.0) },
      color1: { value: new Color('#fff') },
      color2: { value: new Color('#283844') }
    },
    depthTest: false
  })


  function setColor(opt: backgroundProps): void {
    if (Array.isArray(opt.colors)) {
      var colors = opt.colors.map(function (c) {
        if (typeof c === 'string' || typeof c === 'number') {
          return new Color(c)
        }
        return c
      })
      material.uniforms.color1.value.copy(colors[0])
      material.uniforms.color2.value.copy(colors[1])
    }
  }

  const mesh = new Mesh(geometry, material)
  if (opt) setColor(opt)
  mesh['setColor'] = setColor
  return mesh

}
