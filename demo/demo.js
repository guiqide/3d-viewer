import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
// Instantiate a loader
const loader = new GLTFLoader();

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const THREE_PATH = `https://unpkg.com/three@0.${THREE.REVISION}.x`

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( `${THREE_PATH}/examples/js/libs/draco/gltf/` );
loader.setDRACOLoader( dracoLoader );

let camera, scene, renderer;

init();
			render();

function init() {

  const container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
  camera.position.set( - 1.8, 0.6, 2.7 );

  scene = new THREE.Scene();

  new RGBELoader()
    .setPath( './' )
    .load( 'royal_esplanade_1k.hdr', function ( texture ) {

      texture.mapping = THREE.EquirectangularReflectionMapping;

      scene.background = texture;
      scene.environment = texture;

      render();

      // model

      // use of RoughnessMipmapper is optional
      const roughnessMipmapper = new RoughnessMipmapper( renderer );

      const loader = new GLTFLoader().setPath( './' );
      loader.load( './DamagedHelmet.gltf', function ( gltf ) {

        gltf.scene.traverse( function ( child ) {

          if ( child.isMesh ) {

            roughnessMipmapper.generateMipmaps( child.material );

          }

        } );

        scene.add( gltf.scene );

        roughnessMipmapper.dispose();

        render();

      } );

    } );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild( renderer.domElement );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render ); // use if there is no animation loop
  controls.minDistance = 2;
  controls.maxDistance = 10;
  controls.target.set( 0, 0, - 0.2 );
  controls.update();


}
function render() {

  renderer.render( scene, camera );

}