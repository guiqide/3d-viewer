import * as THREE from 'three';

export default class Render {
	constructor(dom) {
		this.container = dom
	}

	view() {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

		const renderer = new THREE.WebGLRenderer();
		renderer.setSize( this.container.offsetWidth, this.container.offsetHeight );
		this.container.appendChild( renderer.domElement );
	}
}
