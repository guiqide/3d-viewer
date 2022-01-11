declare global {
	interface Window {
		content: any;
		renderer: any;
		scene: any;
	}
}

import {
	Scene,
	LoadingManager,
	WebGLRenderer,
	LoaderUtils,
	Box3,
	Vector3,
	REVISION,
	Light,
	Mesh,
	PerspectiveCamera,
	AmbientLight,
	Object3D,
	DirectionalLight,
	HemisphereLight,
	Group,
	Line,
} from 'three'

import Stats from 'three/examples/jsm/libs/stats.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const MANAGER = new LoadingManager();
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`
const DRACO_LOADER = new DRACOLoader( MANAGER ).setDecoderPath( `${THREE_PATH}/examples/js/libs/draco/gltf/` );
const KTX2_LOADER = new KTX2Loader( MANAGER ).setTranscoderPath( `${THREE_PATH}/examples/js/libs/basis/` );

import EventEmitter from './utils/EventEmitter';
import createBackground from './utils/background'

interface OptionProps {
	encode: boolean;
	kiosk: boolean;
	model: string;
	preset: string;
	cameraPosition: number[];
	autoRotate: boolean; // 是否自动旋转
	autoRotateSpeed: number; // 自动旋转速度
	stats: boolean; // 是否开启帧数显示
	isBgColor: boolean; // 是否开启背景颜色
	bgColor1: string; // 光照背景色1
	bgColor2: string; // 光照背景色2
	ambientIntensity: number; // 环境光强度
	ambientColor: number; // 环境光颜色
	directIntensity: number; // 平行光强度
	directColor: number;  // 平行光颜色
}

const DEFAULT_CAMERA = '[default]';
interface StateProps {
	environment?: string;
	actionStates: object;
	camera: string;
	wireframe: boolean;
	skeleton: boolean;
	grid: boolean;
	addLights: boolean;
	exposure: number;
	textureEncoding: string;
}

const Preset = {ASSET_GENERATOR: 'assetgenerator'};

const defaultOptions = {
	stats: false,
	background: false,
	isBgColor: true,
	autoRotate: false,
	autoRotateSpeed: 1.0,
	bgColor1: '#ffffff',
	bgColor2: '#353535',
	ambientIntensity: 0.3,
  ambientColor: 0xFFFFFF,
	directIntensity: 0.8 * Math.PI,
  directColor: 0xFFFFFF,
}

export default class ThreeDViewer extends EventEmitter {
	options: OptionProps;
	container: Element;
	scene: Scene;
	lights: Light[];
	renderer: any;
	content: Group;
	defaultCamera: PerspectiveCamera;
	activeCamera: PerspectiveCamera | Object3D;
	prevTime: number;
	controls: OrbitControls;
	state: StateProps;
	stats: Stats;
	bg: Mesh

	constructor(el: Element, options) {
		super()
		
		if (!(el instanceof Element)) {
			throw new Error('ThreeDViewer needs a DOM element to render to')
		}

		this.options = Object.assign({}, defaultOptions, options)

		this.state = {
      actionStates: {},
      camera: DEFAULT_CAMERA,
      wireframe: false,
      skeleton: false,
      grid: false,

      // Lights
      addLights: true,
      exposure: 1.0,
      textureEncoding: 'sRGB',
    };
		

		this.lights = []
		this.prevTime = 0;
		this.scene = new Scene();

		const fov = options.preset === 'assetgenerator'
      ? 0.8 * 180 / Math.PI
      : 60;

		// 摄像机视锥体长宽比
		const aspect = el.clientWidth / el.clientHeight


		// 初始化摄像机，视锥体
		// https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
		this.defaultCamera = new PerspectiveCamera( fov, aspect, 0.01, 1000 );


		this.activeCamera = this.defaultCamera;

		this.scene.add(this.defaultCamera)
		this.container = el;

		this.renderer = new WebGLRenderer({antialias: true})
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( el.clientWidth, el.clientHeight );

		if (this.options.isBgColor) {
			this.bg = createBackground({
				colors: [this.options.bgColor1, this.options.bgColor2]
			});
	
			this.bg.name = 'BG';
			this.bg.renderOrder = -1;
		}


		// 镜头控制器
		this.controls = new OrbitControls( this.defaultCamera, this.renderer.domElement );
    this.controls.autoRotate = this.options.autoRotate;
    this.controls.autoRotateSpeed = this.options.autoRotateSpeed;
    this.controls.screenSpacePanning = true;

		if (this.options.stats) {
			const stats = Stats()
			this.stats = stats;
		}
		
		
		this.container.appendChild(this.renderer.domElement);

		if (this.options.stats) {
			this.container.appendChild(this.stats.dom);
		}

	}

	load(url: string) {
		return new Promise((resolve, reject) => {

			const loader = new GLTFLoader(MANAGER)
			.setCrossOrigin('anonymous')
			.setDRACOLoader( DRACO_LOADER )
			.setKTX2Loader(KTX2_LOADER.detectSupport( this.renderer ))
			.setMeshoptDecoder( MeshoptDecoder );
			this.emit('preLoad', [loader], this)

			loader.loadAsync(url, (event) => {
				this.emit('loading', [event], this)
			}).then((gltf) => {
				this.emit('loaded', [gltf], this)
				
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
        // if (node?.isCamera && node.name === name) {
        //   this.activeCamera = node;
        // }
      });
    }
  }

	// 只渲染一次
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

		if (this.options.isBgColor) {
			this.scene.add(this.bg);
		}
		this.content = object

		// this.printGraph(this.content);
	}

	updateLights () {
    const state = this.state;
    const lights = this.lights;
		const options = this.options;

    if (state.addLights && !lights.length) {
      this.addLights();
    } else if (!state.addLights && lights.length) {
      this.removeLights();
    }

    this.renderer.toneMappingExposure = state.exposure;

    if (lights.length === 2) {
      lights[0].intensity = options.ambientIntensity;
      lights[0].color.setHex(options.ambientColor);
      lights[1].intensity = options.directIntensity;
      lights[1].color.setHex(options.directColor);
    }
  }

	// 增加两种光照
	addLights () {
    const state = this.state;
		const options = this.options;

    if (this.options.preset === Preset.ASSET_GENERATOR) {
      const hemiLight = new HemisphereLight();
      hemiLight.name = 'hemi_light';
      this.scene.add(hemiLight);
      this.lights.push(hemiLight);
      return;
    }

    const light1  = new AmbientLight(options.ambientColor, options.ambientIntensity);
    light1.name = 'ambient_light';
    this.defaultCamera.add( light1 );

    const light2  = new DirectionalLight(options.directColor, options.directIntensity);
    light2.position.set(0.5, 0, 0.866); // ~60º
    light2.name = 'main_light';
    this.defaultCamera.add( light2 );

    this.lights.push(light1, light2);
  }

	removeLights () {

    this.lights.forEach((light) => light.parent.remove(light));
    this.lights.length = 0;

  }

	// TODO: 暂不支持动画
	animate (time) {

    requestAnimationFrame( this.animate );

    this.controls.update();
    this.render();

    this.prevTime = time;

		if (this.options.stats) {
			this.stats.update();
		}
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