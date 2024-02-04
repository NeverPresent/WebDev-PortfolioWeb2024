import * as THREE from 'three'; //Import everything as everything from three
import './style.css';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

///[SCENE]
const scene = new THREE.Scene(); //Scenes are like movie sets

///[GEOMETRY]
//Create our sphere (Geometry, the shape of things, imagine it like clay)
const geometry = new THREE.SphereGeometry(3, 64, 64); //3 is radius, 64 and 64 are the segments
const material = new THREE.MeshStandardMaterial({
  color: '#00ff83',
  roughness: 0.6,
});

const mesh = new THREE.Mesh(geometry, material); //Combinning both together to create the final mesh
scene.add(mesh);

//Sizes (Allowing for full screen)
//Gain the size of the viewport
const sizes = { width: window.innerWidth, height: window.innerHeight };

///[LIGHTS]
const light = new THREE.PointLight(0xffffff, 70, 100, 1.7);
light.position.set(0, 10, 10); //xyz positiion
scene.add(light);

///[CAMERA]
//Add a camera (captures the actual set)
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
); //Don't go above 50 due to distortion. 0.1 is the clipping plane, 100 is the far clipping point
//Referance to sizes as well so we can base it off the sizes.
camera.position.z = 20;
scene.add(camera);

///[Renderer]
const canvas = document.querySelector('.webgl'); //Render the scene on the screen
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(3);
renderer.render(scene, camera);

///[CONTROLS]
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; //based on how quickly you drag up and down
controls.enablePan = false;
controls.enableZoom = false;

///[RESIZE]
//Resize- This litens for updates to the window, for resizing to automatically update without a refresh
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  //Update the camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

///[LOOPS]
//Loop that constantly updates the canvas
const loop = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(loop);
};
loop();

///[Timeline Magic]
const tl = gsap.timeline({ defaults: { duration: 1 } });
tl.fromTo(mesh.scale, { z: 0, x: 0, y: 0 }, { z: 1, x: 1, y: 1 });
tl.fromTo('.title', { opacity: 0 }, { opacity: 1 });
tl.fromTo('nav', { y: '-80%' }, { y: '0%' }, '-=0.3'); // This starts the nav animation 0.3 seconds before the title animation ends

///[Mouse Animation Colour]
let mouseDown = false;
let rgb = [];
window.addEventListener('mousedown', () => (mouseDown = true));
window.addEventListener('mouseup', () => (mouseUp = false));

window.addEventListener('mousemove', (e) => {
  if (mouseDown) {
    rgb = [
      Math.round((e.pageX / sizes.width) * 255),
      Math.round((e.pageX / sizes.width) * 255),
      150,
    ];

    // Animation:
    let newColor = new THREE.Color(`rgb(${rgb.join(',')})`);

    gsap.to(mesh.material.color, {
      r: newColor.r,
      g: newColor.g,
      b: newColor.b,
    });
  }
});
