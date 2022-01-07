'use strict';

var three = require('three');
var GLTFLoader_js = require('three/examples/jsm/loaders/GLTFLoader.js');
var DRACOLoader_js = require('three/examples/jsm/loaders/DRACOLoader.js');
var KTX2Loader_js = require('three/examples/jsm/loaders/KTX2Loader.js');
var OrbitControls_js = require('three/examples/jsm/controls/OrbitControls.js');
var meshopt_decoder_module_js = require('three/examples/jsm/libs/meshopt_decoder.module.js');

var MANAGER = new three.LoadingManager();
var THREE_PATH = "https://unpkg.com/three@0.".concat(three.REVISION, ".x");
var DRACO_LOADER = new DRACOLoader_js.DRACOLoader(MANAGER).setDecoderPath("".concat(THREE_PATH, "/examples/js/libs/draco/gltf/"));
var KTX2_LOADER = new KTX2Loader_js.KTX2Loader(MANAGER).setTranscoderPath("".concat(THREE_PATH, "/examples/js/libs/basis/"));
var DEFAULT_CAMERA = '[default]';
var Preset = { ASSET_GENERATOR: 'assetgenerator' };
var ThreeDViewer = /** @class */ (function () {
    function ThreeDViewer(el, options) {
        if (!(el instanceof Element)) {
            throw new Error('ThreeDViewer needs a DOM element to render to');
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
            directIntensity: 0.8 * Math.PI,
            directColor: 0xFFFFFF,
            bgColor1: '#ffffff',
            bgColor2: '#353535'
        };
        this.lights = [];
        this.prevTime = 0;
        this.scene = new three.Scene();
        window.scene = this.scene;
        var fov = options.preset === 'assetgenerator'
            ? 0.8 * 180 / Math.PI
            : 60;
        // 摄像机视锥体长宽比
        var aspect = el.clientWidth / el.clientHeight;
        this.defaultCamera = new three.PerspectiveCamera(fov, aspect, 0.01, 1000);
        this.activeCamera = this.defaultCamera;
        this.scene.add(this.defaultCamera);
        this.container = el;
        this.renderer = window.renderer = new three.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(el.clientWidth, el.clientHeight);
        this.options = Object.assign({}, options);
        // 镜头控制器
        this.controls = new OrbitControls_js.OrbitControls(this.defaultCamera, this.renderer.domElement);
        this.controls.autoRotate = true;
        // this.controls.autoRotateSpeed = -10;
        this.controls.screenSpacePanning = true;
        this.container.appendChild(this.renderer.domElement);
    }
    ThreeDViewer.prototype.load = function (url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.log(url);
            var loader = new GLTFLoader_js.GLTFLoader(MANAGER)
                .setCrossOrigin('anonymous')
                .setDRACOLoader(DRACO_LOADER)
                .setKTX2Loader(KTX2_LOADER.detectSupport(_this.renderer))
                .setMeshoptDecoder(meshopt_decoder_module_js.MeshoptDecoder);
            loader.loadAsync(url, function (event) {
                console.log(event);
            }).then(function (gltf) {
                console.log(gltf);
                var scene = gltf.scene;
                if (!scene) {
                    throw new Error('No scene found in gltf');
                }
                _this.animate = _this.animate.bind(_this);
                requestAnimationFrame(_this.animate);
                _this.setContent(scene);
                resolve(gltf);
            });
        });
    };
    ThreeDViewer.prototype.setCamera = function (name) {
        if (name === DEFAULT_CAMERA) {
            this.controls.enabled = true;
            this.activeCamera = this.defaultCamera;
        }
        else {
            this.controls.enabled = false;
            this.content.traverse(function (node) {
                // if (node?.isCamera && node.name === name) {
                //   this.activeCamera = node;
                // }
            });
        }
    };
    ThreeDViewer.prototype.setContent = function (object) {
        var box = new three.Box3().setFromObject(object);
        var size = box.getSize(new three.Vector3()).length();
        var center = box.getCenter(new three.Vector3());
        this.controls.reset();
        object.position.x += (object.position.x - center.x);
        object.position.y += (object.position.y - center.y);
        object.position.z += (object.position.z - center.z);
        this.controls.maxDistance = size * 10;
        this.defaultCamera.near = size / 100;
        this.defaultCamera.far = size * 100;
        this.defaultCamera.updateProjectionMatrix();
        if (this.options.cameraPosition) {
            this.defaultCamera.position.fromArray(this.options.cameraPosition);
            this.defaultCamera.lookAt(new three.Vector3());
        }
        else {
            this.defaultCamera.position.copy(center);
            this.defaultCamera.position.x += size / 2.0;
            this.defaultCamera.position.y += size / 5.0;
            this.defaultCamera.position.z += size / 2.0;
            this.defaultCamera.lookAt(center);
        }
        this.setCamera(DEFAULT_CAMERA);
        this.updateLights();
        this.controls.saveState();
        this.scene.add(object);
        this.content = object;
        window.content = this.content;
        this.printGraph(this.content);
    };
    ThreeDViewer.prototype.updateLights = function () {
        var state = this.state;
        var lights = this.lights;
        if (state.addLights && !lights.length) {
            this.addLights();
        }
        else if (!state.addLights && lights.length) {
            this.removeLights();
        }
        this.renderer.toneMappingExposure = state.exposure;
        if (lights.length === 2) {
            lights[0].intensity = state.ambientIntensity;
            lights[0].color.setHex(state.ambientColor);
            lights[1].intensity = state.directIntensity;
            lights[1].color.setHex(state.directColor);
        }
    };
    ThreeDViewer.prototype.addLights = function () {
        var state = this.state;
        if (this.options.preset === Preset.ASSET_GENERATOR) {
            var hemiLight = new three.HemisphereLight();
            hemiLight.name = 'hemi_light';
            this.scene.add(hemiLight);
            this.lights.push(hemiLight);
            return;
        }
        var light1 = new three.AmbientLight(state.ambientColor, state.ambientIntensity);
        light1.name = 'ambient_light';
        this.defaultCamera.add(light1);
        var light2 = new three.DirectionalLight(state.directColor, state.directIntensity);
        light2.position.set(0.5, 0, 0.866); // ~60º
        light2.name = 'main_light';
        this.defaultCamera.add(light2);
        this.lights.push(light1, light2);
    };
    ThreeDViewer.prototype.removeLights = function () {
        this.lights.forEach(function (light) { return light.parent.remove(light); });
        this.lights.length = 0;
    };
    ThreeDViewer.prototype.animate = function (time) {
        requestAnimationFrame(this.animate);
        (time - this.prevTime) / 1000;
        // autoRotate
        this.controls.update();
        this.render();
        this.prevTime = time;
    };
    ThreeDViewer.prototype.render = function () {
        this.renderer.render(this.scene, this.activeCamera);
    };
    ThreeDViewer.prototype.printGraph = function (node) {
        var _this = this;
        // console.log(node);
        console.group(' <' + node.type + '> ' + node.name);
        node.children.forEach(function (child) { return _this.printGraph(child); });
        console.groupEnd();
    };
    return ThreeDViewer;
}());

module.exports = ThreeDViewer;
