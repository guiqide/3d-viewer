declare global {
	interface Window {
		content: any;
		renderer: any;
		scene: any;
	}
}

import _ from 'lodash';
import {
	Scene,
	LoadingManager,
	WebGLRenderer,
	LoaderUtils,
	Box3,
	Vector3,
	REVISION,
	Light,
	PerspectiveCamera,
	AmbientLight,
	DirectionalLight,
	HemisphereLight,
	Group,
} from 'three'
import * as THREE from 'three'

window.THREE = THREE

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const MANAGER = new LoadingManager();
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`
const DRACO_LOADER = new DRACOLoader( MANAGER ).setDecoderPath( `${THREE_PATH}/examples/js/libs/draco/gltf/` );
const KTX2_LOADER = new KTX2Loader( MANAGER ).setTranscoderPath( `${THREE_PATH}/examples/js/libs/basis/` );

interface OptionProps {
	encode: boolean;
	kiosk: boolean;
	model: string;
	preset: string;
	cameraPosition: number[];
}

const DEFAULT_CAMERA = '[default]';
interface StateProps {
	environment?: string;
	background: boolean;
	playbackSpeed: number;
	actionStates: object;
	camera: string;
	wireframe: boolean;
	skeleton: boolean;
	grid: boolean;
	addLights: boolean;
	exposure: number;
	textureEncoding: string;
	ambientIntensity: number;
	ambientColor: number;
	directIntensity: number;
	directColor: number;
	bgColor1: string;
	bgColor2: string;
}

const Preset = {ASSET_GENERATOR: 'assetgenerator'};

export default class Render {
	options: OptionProps;
	container: Element;
	scene: Scene;
	lights: Light[];
	renderer: any;
	content: Group;
	defaultCamera: PerspectiveCamera;
	activeCamera: PerspectiveCamera | THREE.Object3D;
	prevTime: number;
	controls: OrbitControls;
	state: StateProps;

	constructor(el: Element, options) {
		
		if (!(el instanceof Element)) {
			throw new Error('Render needs a DOM element to render to')
		}

		this.state = {
      background: false,
      playbackSpeed: 1.0,
      actionStates: {},
      camera: DEFAULT_CAMERA,
      wireframe: false,
      skeleton: false,
      grid: false,

      // Lights
      addLights: true,
      exposure: 1.0,
      textureEncoding: 'sRGB',
      ambientIntensity: 0.3,
      ambientColor: 0xFFFFFF,
      directIntensity: 0.8 * Math.PI, // TODO(#116)
      directColor: 0xFFFFFF,
      bgColor1: '#ffffff',
      bgColor2: '#353535'
    };
		
		this.lights = []
		this.prevTime = 0;
		this.scene = new Scene();
		window.scene = this.scene;

		const fov = options.preset === 'assetgenerator'
      ? 0.8 * 180 / Math.PI
      : 60;

		// 摄像机视锥体长宽比
		const aspect = el.clientWidth / el.clientHeight


		this.defaultCamera = new PerspectiveCamera( fov, aspect, 0.01, 1000 );


		this.activeCamera = this.defaultCamera;

		this.scene.add(this.defaultCamera)
		this.container = el;

		this.renderer = window.renderer = new WebGLRenderer({antialias: true})
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( el.clientWidth, el.clientHeight );

		this.options = _.merge({}, options)

		// 镜头控制器
		this.controls = new OrbitControls( this.defaultCamera, this.renderer.domElement );
    this.controls.autoRotate = true;
    // this.controls.autoRotateSpeed = -10;
    this.controls.screenSpacePanning = true;
		
		this.container.appendChild(this.renderer.domElement);

	}

	load(url: string) {
		return new Promise((resolve, reject) => {
			console.log(url);
			

			const loader = new GLTFLoader(MANAGER)
			.setCrossOrigin('anonymous')
			.setDRACOLoader( DRACO_LOADER )
			.setKTX2Loader(KTX2_LOADER.detectSupport( this.renderer ))
			.setMeshoptDecoder( MeshoptDecoder );

			loader.loadAsync(url, (event) => {
				console.log(event);
				
			}).then((gltf) => {
				console.log(gltf);
				
				const scene = gltf.scene

				if (!scene) {
					throw new Error('No scene found in gltf')
				}

				this.animate = this.animate.bind(this);
    		requestAnimationFrame( this.animate );
				this.setContent(scene)

				resolve(gltf)
			})
		})
	}

	setCamera ( name ) {
    if (name === DEFAULT_CAMERA) {
      this.controls.enabled = true;
      this.activeCamera = this.defaultCamera;
    } else {
      this.controls.enabled = false;
      this.content.traverse((node) => {
				console.log(node);
				
        if (node.isCamera && node.name === name) {
          this.activeCamera = node;
        }
      });
    }
  }

	setContent(object: Group) {
		const box = new Box3().setFromObject(object);
    const size = box.getSize(new Vector3()).length();
    const center = box.getCenter(new Vector3());

    this.controls.reset();

    object.position.x += (object.position.x - center.x);
    object.position.y += (object.position.y - center.y);
    object.position.z += (object.position.z - center.z);
    this.controls.maxDistance = size * 10;
    this.defaultCamera.near = size / 100;
    this.defaultCamera.far = size * 100;
    this.defaultCamera.updateProjectionMatrix();

    if (this.options.cameraPosition) {

      this.defaultCamera.position.fromArray( this.options.cameraPosition );
      this.defaultCamera.lookAt( new Vector3() );

    } else {

      this.defaultCamera.position.copy(center);
      this.defaultCamera.position.x += size / 2.0;
      this.defaultCamera.position.y += size / 5.0;
      this.defaultCamera.position.z += size / 2.0;
      this.defaultCamera.lookAt(center);

    }

		this.setCamera(DEFAULT_CAMERA);
		this.updateLights();
		
		this.controls.saveState();

		this.scene.add(object)
		this.content = object
		window.content = this.content

		this.printGraph(this.content);
	}

	updateLights () {
    const state = this.state;
    const lights = this.lights;

    if (state.addLights && !lights.length) {
      this.addLights();
    } else if (!state.addLights && lights.length) {
      this.removeLights();
    }

    this.renderer.toneMappingExposure = state.exposure;

    if (lights.length === 2) {
      lights[0].intensity = state.ambientIntensity;
      lights[0].color.setHex(state.ambientColor);
      lights[1].intensity = state.directIntensity;
      lights[1].color.setHex(state.directColor);
    }
  }

	addLights () {
    const state = this.state;

    if (this.options.preset === Preset.ASSET_GENERATOR) {
      const hemiLight = new HemisphereLight();
      hemiLight.name = 'hemi_light';
      this.scene.add(hemiLight);
      this.lights.push(hemiLight);
      return;
    }

    const light1  = new AmbientLight(state.ambientColor, state.ambientIntensity);
    light1.name = 'ambient_light';
    this.defaultCamera.add( light1 );

    const light2  = new DirectionalLight(state.directColor, state.directIntensity);
    light2.position.set(0.5, 0, 0.866); // ~60º
    light2.name = 'main_light';
    this.defaultCamera.add( light2 );

    this.lights.push(light1, light2);
  }

	removeLights () {

    this.lights.forEach((light) => light.parent.remove(light));
    this.lights.length = 0;

  }

	animate (time) {

    requestAnimationFrame( this.animate );

    const dt = (time - this.prevTime) / 1000;

		// autoRotate
    this.controls.update();
    this.render();

    this.prevTime = time;


  }

	render() {
		this.renderer.render( this.scene, this.activeCamera );
	}

	printGraph (node) {
		// console.log(node);
    console.group(' <' + node.type + '> ' + node.name);
    node.children.forEach((child) => this.printGraph(child));
    console.groupEnd();

  }
}