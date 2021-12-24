import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	BoxGeometry,
	Vector2,
	LatheGeometry,
	Mesh,
	MeshBasicMaterial,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default class Render {
	constructor(dom) {
		this.container = dom
	}

	render() {

		const scene = new Scene()

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		)
		camera.position.z = 2

		const renderer = new WebGLRenderer()
		renderer.setSize(this.container.clientWidth, this.container.clientHeight)
		this.container.appendChild(renderer.domElement)

		const controls = new OrbitControls(camera, renderer.domElement)
		controls.addEventListener('change', render)

		const states = new Stats()
		document.body.appendChild(states.dom)

		const geometry = new BoxGeometry()
		const material = new MeshBasicMaterial({
			color: 0x00ff00,
			wireframe: true,
		})

		const cube = new Mesh(geometry, material)
		scene.add(cube)

		function animate() {
			requestAnimationFrame(animate)
	
			cube.rotation.x += 0.01
			cube.rotation.y += 0.01
	
			render()
	
			states.update()
	}
	animate()

		window.addEventListener('resize', onWindowResize, false)
		function onWindowResize() {
			camera.aspect = this.container.clientWidth / this.container.clientHeight
			camera.updateProjectionMatrix()
			renderer.setSize(this.container.clientWidth, this.container.clientHeight)
			render()
		}

		function render() {
			console.log(renderer)
			renderer.render(scene, camera)
		}

		render()
	}
}
