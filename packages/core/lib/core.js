'use strict';

var three = require('three');
var GLTFLoader_js = require('three/examples/jsm/loaders/GLTFLoader.js');
var DRACOLoader_js = require('three/examples/jsm/loaders/DRACOLoader.js');
var KTX2Loader_js = require('three/examples/jsm/loaders/KTX2Loader.js');
var OrbitControls_js = require('three/examples/jsm/controls/OrbitControls.js');
var meshopt_decoder_module_js = require('three/examples/jsm/libs/meshopt_decoder.module.js');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var Stats = function () {

	var mode = 0;

	var container = document.createElement( 'div' );
	container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
	container.addEventListener( 'click', function ( event ) {

		event.preventDefault();
		showPanel( ++ mode % container.children.length );

	}, false );

	//

	function addPanel( panel ) {

		container.appendChild( panel.dom );
		return panel;

	}

	function showPanel( id ) {

		for ( var i = 0; i < container.children.length; i ++ ) {

			container.children[ i ].style.display = i === id ? 'block' : 'none';

		}

		mode = id;

	}

	//

	var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

	var fpsPanel = addPanel( new Stats.Panel( 'FPS', '#0ff', '#002' ) );
	var msPanel = addPanel( new Stats.Panel( 'MS', '#0f0', '#020' ) );

	if ( self.performance && self.performance.memory ) {

		var memPanel = addPanel( new Stats.Panel( 'MB', '#f08', '#201' ) );

	}

	showPanel( 0 );

	return {

		REVISION: 16,

		dom: container,

		addPanel: addPanel,
		showPanel: showPanel,

		begin: function () {

			beginTime = ( performance || Date ).now();

		},

		end: function () {

			frames ++;

			var time = ( performance || Date ).now();

			msPanel.update( time - beginTime, 200 );

			if ( time >= prevTime + 1000 ) {

				fpsPanel.update( ( frames * 1000 ) / ( time - prevTime ), 100 );

				prevTime = time;
				frames = 0;

				if ( memPanel ) {

					var memory = performance.memory;
					memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );

				}

			}

			return time;

		},

		update: function () {

			beginTime = this.end();

		},

		// Backwards Compatibility

		domElement: container,
		setMode: showPanel

	};

};

Stats.Panel = function ( name, fg, bg ) {

	var min = Infinity, max = 0, round = Math.round;
	var PR = round( window.devicePixelRatio || 1 );

	var WIDTH = 80 * PR, HEIGHT = 48 * PR,
		TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
		GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
		GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

	var canvas = document.createElement( 'canvas' );
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	canvas.style.cssText = 'width:80px;height:48px';

	var context = canvas.getContext( '2d' );
	context.font = 'bold ' + ( 9 * PR ) + 'px Helvetica,Arial,sans-serif';
	context.textBaseline = 'top';

	context.fillStyle = bg;
	context.fillRect( 0, 0, WIDTH, HEIGHT );

	context.fillStyle = fg;
	context.fillText( name, TEXT_X, TEXT_Y );
	context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	context.fillStyle = bg;
	context.globalAlpha = 0.9;
	context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	return {

		dom: canvas,

		update: function ( value, maxValue ) {

			min = Math.min( min, value );
			max = Math.max( max, value );

			context.fillStyle = bg;
			context.globalAlpha = 1;
			context.fillRect( 0, 0, WIDTH, GRAPH_Y );
			context.fillStyle = fg;
			context.fillText( round( value ) + ' ' + name + ' (' + round( min ) + '-' + round( max ) + ')', TEXT_X, TEXT_Y );

			context.drawImage( canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT );

			context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

			context.fillStyle = bg;
			context.globalAlpha = 0.9;
			context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );

		}

	};

};

var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this.events = [];
    }
    EventEmitter.prototype.create = function (type) {
        var curr = { type: type, listener: [] };
        this.events.push(curr);
        return curr;
    };
    EventEmitter.prototype.getOrCreate = function (type) {
        var find = this.events.find(function (event) { return event.type === type; });
        return find ? find : this.create(type);
    };
    EventEmitter.prototype.get = function (type) {
        var find = this.events.find(function (event) { return event.type === type; });
        return find;
    };
    EventEmitter.prototype.on = function (event, listener) {
        var e = this.getOrCreate(event);
        e.listener.push(listener);
    };
    EventEmitter.prototype.off = function (event) {
        var e = this.get(event);
        if (e) {
            e.listener = [];
        }
    };
    EventEmitter.prototype.emit = function (event, args, that) {
        var e = this.get(event);
        if (e) {
            e.listener.forEach(function (listener) { return listener.apply(that, args); });
        }
    };
    return EventEmitter;
}());

var vert = "#define GLSLIFY 1\nattribute vec3 position;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;varying vec2 vUv;void main(){gl_Position=vec4(position,1.0);vUv=vec2(position.x,position.y)*0.5+0.5;}"; // eslint-disable-line

var frag = "precision mediump float;\n#define GLSLIFY 1\nvec3 mod289_0(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 mod289_0(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute_0(vec4 x){return mod289_0(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt_0(vec4 r){return 1.79284291400159-0.85373472095314*r;}vec3 fade(vec3 t){return t*t*t*(t*(t*6.0-15.0)+10.0);}float pnoise(vec3 P,vec3 rep){vec3 Pi0=mod(floor(P),rep);vec3 Pi1=mod(Pi0+vec3(1.0),rep);Pi0=mod289_0(Pi0);Pi1=mod289_0(Pi1);vec3 Pf0=fract(P);vec3 Pf1=Pf0-vec3(1.0);vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);vec4 iy=vec4(Pi0.yy,Pi1.yy);vec4 iz0=Pi0.zzzz;vec4 iz1=Pi1.zzzz;vec4 ixy=permute_0(permute_0(ix)+iy);vec4 ixy0=permute_0(ixy+iz0);vec4 ixy1=permute_0(ixy+iz1);vec4 gx0=ixy0*(1.0/7.0);vec4 gy0=fract(floor(gx0)*(1.0/7.0))-0.5;gx0=fract(gx0);vec4 gz0=vec4(0.5)-abs(gx0)-abs(gy0);vec4 sz0=step(gz0,vec4(0.0));gx0-=sz0*(step(0.0,gx0)-0.5);gy0-=sz0*(step(0.0,gy0)-0.5);vec4 gx1=ixy1*(1.0/7.0);vec4 gy1=fract(floor(gx1)*(1.0/7.0))-0.5;gx1=fract(gx1);vec4 gz1=vec4(0.5)-abs(gx1)-abs(gy1);vec4 sz1=step(gz1,vec4(0.0));gx1-=sz1*(step(0.0,gx1)-0.5);gy1-=sz1*(step(0.0,gy1)-0.5);vec3 g000=vec3(gx0.x,gy0.x,gz0.x);vec3 g100=vec3(gx0.y,gy0.y,gz0.y);vec3 g010=vec3(gx0.z,gy0.z,gz0.z);vec3 g110=vec3(gx0.w,gy0.w,gz0.w);vec3 g001=vec3(gx1.x,gy1.x,gz1.x);vec3 g101=vec3(gx1.y,gy1.y,gz1.y);vec3 g011=vec3(gx1.z,gy1.z,gz1.z);vec3 g111=vec3(gx1.w,gy1.w,gz1.w);vec4 norm0=taylorInvSqrt_0(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));g000*=norm0.x;g010*=norm0.y;g100*=norm0.z;g110*=norm0.w;vec4 norm1=taylorInvSqrt_0(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));g001*=norm1.x;g011*=norm1.y;g101*=norm1.z;g111*=norm1.w;float n000=dot(g000,Pf0);float n100=dot(g100,vec3(Pf1.x,Pf0.yz));float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z));float n110=dot(g110,vec3(Pf1.xy,Pf0.z));float n001=dot(g001,vec3(Pf0.xy,Pf1.z));float n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));float n011=dot(g011,vec3(Pf0.x,Pf1.yz));float n111=dot(g111,Pf1);vec3 fade_xyz=fade(Pf0);vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);vec2 n_yz=mix(n_z.xy,n_z.zw,fade_xyz.y);float n_xyz=mix(n_yz.x,n_yz.y,fade_xyz.x);return 2.2*n_xyz;}vec3 mod289_1(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 mod289_1(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute_1(vec4 x){return mod289_1(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt_1(vec4 r){return 1.79284291400159-0.85373472095314*r;}float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g_0=step(x0.yzx,x0.xyz);vec3 l=1.0-g_0;vec3 i1=min(g_0.xyz,l.zxy);vec3 i2=max(g_0.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289_1(i);vec4 p=permute_1(permute_1(permute_1(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt_1(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}float grain(vec2 texCoord,vec2 resolution,float frame,float multiplier){vec2 mult=texCoord*resolution;float offset=snoise(vec3(mult/multiplier,frame));float n1=pnoise(vec3(mult,offset),vec3(1.0/texCoord*resolution,1.0));return n1/2.0+0.5;}float grain(vec2 texCoord,vec2 resolution,float frame){return grain(texCoord,resolution,frame,2.5);}float grain(vec2 texCoord,vec2 resolution){return grain(texCoord,resolution,0.0);}vec3 blendSoftLight(vec3 base,vec3 blend){return mix(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend),2.0*base*blend+base*base*(1.0-2.0*blend),step(base,vec3(0.5)));}uniform vec3 color1;uniform vec3 color2;uniform float aspect;uniform vec2 offset;uniform vec2 scale;uniform float noiseAlpha;uniform bool aspectCorrection;uniform float grainScale;uniform float grainTime;uniform vec2 smooth;varying vec2 vUv;void main(){vec2 q=vec2(vUv-0.5);if(aspectCorrection){q.x*=aspect;}q/=scale;q-=offset;float dst=length(q);dst=smoothstep(smooth.x,smooth.y,dst);vec3 color=mix(color1,color2,dst);if(noiseAlpha>0.0&&grainScale>0.0){float gSize=1.0/grainScale;float g=grain(vUv,vec2(gSize*aspect,gSize),grainTime);vec3 noiseColor=blendSoftLight(color,vec3(g));gl_FragColor.rgb=mix(color,noiseColor,noiseAlpha);}else{gl_FragColor.rgb=color;}gl_FragColor.a=1.0;}"; // eslint-disable-line

/**
 * Source: https://github.com/mattdesl/three-vignette-background
 * License: MIT
 * 因为原仓库没有开外修改颜色接口等参数的接口，所以这里重写修改
 */
function createBackground(opt) {
    opt = opt || {};
    // https://threejs.org/docs/?q=PlaneGeometry#api/en/geometries/PlaneGeometry
    var geometry = opt.geometry || new three.PlaneGeometry(2, 2, 1);
    var material = new three.RawShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        side: three.DoubleSide,
        uniforms: {
            aspectCorrection: { value: false },
            aspect: { value: 1 },
            grainScale: { value: 0.005 },
            grainTime: { value: 0 },
            noiseAlpha: { value: 0.25 },
            offset: { value: new three.Vector2(0, 0) },
            scale: { value: new three.Vector2(1, 1) },
            smooth: { value: new three.Vector2(0.0, 1.0) },
            color1: { value: new three.Color('#fff') },
            color2: { value: new three.Color('#283844') }
        },
        depthTest: false
    });
    function setColor(opt) {
        if (Array.isArray(opt.colors)) {
            var colors = opt.colors.map(function (c) {
                if (typeof c === 'string' || typeof c === 'number') {
                    return new three.Color(c);
                }
                return c;
            });
            material.uniforms.color1.value.copy(colors[0]);
            material.uniforms.color2.value.copy(colors[1]);
        }
    }
    var mesh = new three.Mesh(geometry, material);
    if (opt)
        setColor(opt);
    mesh['setColor'] = setColor;
    return mesh;
}

var MANAGER = new three.LoadingManager();
var THREE_PATH = "https://unpkg.com/three@0.".concat(three.REVISION, ".x");
var DRACO_LOADER = new DRACOLoader_js.DRACOLoader(MANAGER).setDecoderPath("".concat(THREE_PATH, "/examples/js/libs/draco/gltf/"));
var KTX2_LOADER = new KTX2Loader_js.KTX2Loader(MANAGER).setTranscoderPath("".concat(THREE_PATH, "/examples/js/libs/basis/"));
var DEFAULT_CAMERA = '[default]';
var Preset = { ASSET_GENERATOR: 'assetgenerator' };
var defaultOptions = {
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
    directColor: 0xFFFFFF
};
var ThreeDViewer = /** @class */ (function (_super) {
    __extends(ThreeDViewer, _super);
    function ThreeDViewer(el, options) {
        var _this = _super.call(this) || this;
        if (!(el instanceof Element)) {
            throw new Error('ThreeDViewer needs a DOM element to render to');
        }
        _this.options = Object.assign({}, defaultOptions, options);
        _this.state = {
            actionStates: {},
            camera: DEFAULT_CAMERA,
            wireframe: false,
            skeleton: false,
            grid: false,
            // Lights
            addLights: true,
            exposure: 1.0,
            textureEncoding: 'sRGB'
        };
        _this.lights = [];
        _this.prevTime = 0;
        _this.scene = new three.Scene();
        var fov = options.preset === 'assetgenerator'
            ? 0.8 * 180 / Math.PI
            : 60;
        // 摄像机视锥体长宽比
        var aspect = el.clientWidth / el.clientHeight;
        // 初始化摄像机，视锥体
        // https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
        _this.defaultCamera = new three.PerspectiveCamera(fov, aspect, 0.01, 1000);
        _this.activeCamera = _this.defaultCamera;
        _this.scene.add(_this.defaultCamera);
        _this.container = el;
        _this.renderer = new three.WebGLRenderer({ antialias: true });
        _this.renderer.setPixelRatio(window.devicePixelRatio);
        _this.renderer.setSize(el.clientWidth, el.clientHeight);
        if (_this.options.isBgColor) {
            _this.bg = createBackground({
                colors: [_this.options.bgColor1, _this.options.bgColor2]
            });
            _this.bg.name = 'BG';
            _this.bg.renderOrder = -1;
        }
        // 镜头控制器
        _this.controls = new OrbitControls_js.OrbitControls(_this.defaultCamera, _this.renderer.domElement);
        _this.controls.autoRotate = _this.options.autoRotate;
        _this.controls.autoRotateSpeed = _this.options.autoRotateSpeed;
        _this.controls.screenSpacePanning = true;
        if (_this.options.stats) {
            var stats = Stats();
            _this.stats = stats;
        }
        _this.container.appendChild(_this.renderer.domElement);
        if (_this.options.stats) {
            _this.container.appendChild(_this.stats.dom);
        }
        return _this;
    }
    ThreeDViewer.prototype.load = function (url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var loader = new GLTFLoader_js.GLTFLoader(MANAGER)
                .setCrossOrigin('anonymous')
                .setDRACOLoader(DRACO_LOADER)
                .setKTX2Loader(KTX2_LOADER.detectSupport(_this.renderer))
                .setMeshoptDecoder(meshopt_decoder_module_js.MeshoptDecoder);
            _this.emit('preLoad', [loader, _this], _this);
            loader.loadAsync(url, function (event) {
                _this.emit('loading', [event, _this], _this);
            }).then(function (gltf) {
                _this.emit('loaded', [gltf, _this], _this);
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
    // 只渲染一次
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
        if (this.options.isBgColor) {
            this.scene.add(this.bg);
        }
        this.content = object;
        // this.printGraph(this.content);
    };
    ThreeDViewer.prototype.updateLights = function () {
        var state = this.state;
        var lights = this.lights;
        var options = this.options;
        if (state.addLights && !lights.length) {
            this.addLights();
        }
        else if (!state.addLights && lights.length) {
            this.removeLights();
        }
        this.renderer.toneMappingExposure = state.exposure;
        if (lights.length === 2) {
            lights[0].intensity = options.ambientIntensity;
            lights[0].color.setHex(options.ambientColor);
            lights[1].intensity = options.directIntensity;
            lights[1].color.setHex(options.directColor);
        }
    };
    // 增加两种光照
    ThreeDViewer.prototype.addLights = function () {
        this.state;
        var options = this.options;
        if (this.options.preset === Preset.ASSET_GENERATOR) {
            var hemiLight = new three.HemisphereLight();
            hemiLight.name = 'hemi_light';
            this.scene.add(hemiLight);
            this.lights.push(hemiLight);
            return;
        }
        var light1 = new three.AmbientLight(options.ambientColor, options.ambientIntensity);
        light1.name = 'ambient_light';
        this.defaultCamera.add(light1);
        var light2 = new three.DirectionalLight(options.directColor, options.directIntensity);
        light2.position.set(0.5, 0, 0.866); // ~60º
        light2.name = 'main_light';
        this.defaultCamera.add(light2);
        this.lights.push(light1, light2);
    };
    ThreeDViewer.prototype.removeLights = function () {
        this.lights.forEach(function (light) { return light.parent.remove(light); });
        this.lights.length = 0;
    };
    // TODO: 暂不支持动画
    ThreeDViewer.prototype.animate = function (time) {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.render();
        this.prevTime = time;
        if (this.options.stats) {
            this.stats.update();
        }
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
}(EventEmitter));

module.exports = ThreeDViewer;
