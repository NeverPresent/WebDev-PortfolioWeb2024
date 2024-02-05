import * as THREE from 'three';
import './style.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

///[SCENE]
const scene = new THREE.Scene();

// Fog
const fogColor = new THREE.Color(0x2F4049); //Fog
scene.fog = new THREE.Fog(fogColor, 0, 100);
scene.background = fogColor;

///[MODEL]
const loader = new GLTFLoader();
loader.load('/Version7.glb', (gltf) => {
  scene.add(gltf.scene);
  gltf.scene.position.set(0, 0, 0);
  gltf.scene.scale.set(1, 1, 1);
});

//Sizes
const sizes = { width: window.innerWidth, height: window.innerHeight };

///[LIGHTS]
const light = new THREE.PointLight(0x0000, 1, 1, 1);
light.position.set(0, 1, 0);
scene.add(light);

///[CAMERA]
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 15;
camera.position.y = 2.2;


// Define a curve the camera will follow
const points = [
  camera.position.clone(),
  new THREE.Vector3(0, 2.2, 10),
  new THREE.Vector3(0, 2.2, 5)
];
const curve = new THREE.CatmullRomCurve3(points);
let cameraCurvePosition = 0; // Start at the first point


///[RENDERER]
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(scene.fog.color);

//[POST PROCESSING]
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.05, // Bloom strength
    0.4, // Bloom radius
    1 // Bloom threshold
  );
  composer.addPass(bloomPass);

// Noise pass
const noisePass = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.02 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    varying vec2 vUv;
    float random(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
    }
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float rand = random(vUv) * amount;
      gl_FragColor = vec4(color.rgb + rand, color.a);
    }
  `
});
composer.addPass(noisePass);

///[CONTROLS]
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = true;
controls.enableRotate = false;
controls.zoomSpeed = 1;
controls.target.set(-5, 2.2, 5);

///[RESIZE]
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  composer.setSize(sizes.width, sizes.height);
});

///[ANIMATION LOOP]
const loop = () => {
  controls.update();
  composer.render();
  window.requestAnimationFrame(loop);
};
loop();