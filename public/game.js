import * as THREE from "three";

import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

import * as CANNON from "cannon-es";
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

window.addEventListener(
  "resize",
  () => {
    this._OnWindowResize();
  },
  false
);

const fov = 60;
const aspect = 1920 / 1080;
const near = 1.0;
const far = 5000.0;
let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(75, 20, 0);

let scene = new THREE.Scene();
let world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0),
});
let light = new THREE.AmbientLight(0x101010);
scene.add(light);

const hemlight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 10 );
scene.add( hemlight );


const controls = new PointerLockControls(camera, document.body);
document.getElementById("playBtn").onclick = () => {
  controls.lock();
};

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  "./resources/posx.jpg",
  "./resources/negx.jpg",
  "./resources/posy.jpg",
  "./resources/negy.jpg",
  "./resources/posz.jpg",
  "./resources/negz.jpg",
]);
// scene.background = texture;
scene.fog = new THREE.Fog( 0xcccccc, 10, far );
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100, 10, 10),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
  })
);
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
var slipperyMaterial = new CANNON.Material("slipperyMaterial");

// The ContactMaterial defines what happens when two materials meet.
// In this case we want friction coefficient = 0.0 when the slippery material touches ground.
var slippery_ground_cm = new CANNON.ContactMaterial(
  slipperyMaterial,
  slipperyMaterial,
  {
    friction: 0.01,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
  }
);

// We must add the contact materials to the world
world.addContactMaterial(slippery_ground_cm);

let planeBod = new CANNON.Body({
  shape: new CANNON.Plane(),
  mass: 0,
  material: slipperyMaterial
});
console.log(planeBod);
planeBod.quaternion.copy(plane.quaternion);
planeBod.position.copy(plane.position);
world.addBody(planeBod);





const fbxLoader = new FBXLoader()
fbxLoader.load(
    './resources/island2/source/Stronghold.fbx',
    (object) => {
        scene.add(object)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

fbxLoader.load(
    './resources/island2/source/Stronghold.fbx',
    (object) => {
        scene.add(object)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)






const box = new THREE.Mesh(
  new THREE.SphereGeometry(),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
  })
);
box.position.set(0, 500, 0);
box.castShadow = true;
box.receiveShadow = true;
scene.add(box);
let boxBod = new CANNON.Body({
  shape: new CANNON.Sphere(),
  mass: 1,
  material: slipperyMaterial
});
boxBod.quaternion.copy(box.quaternion);
boxBod.position.copy(box.position);
world.addBody(boxBod);

animate();

function OnWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
addEventListener("resize", OnWindowResize);
var keyMap = {};
const onDocumentKey = (e) => {
  keyMap[e.code] = e.type === "keydown";
};
document.addEventListener("keydown", onDocumentKey, false);
document.addEventListener("keyup", onDocumentKey, false);

var v = new THREE.Vector3(0, 0, 0);
function animate() {
  world.step(1 / 60);
  requestAnimationFrame(() => {
    controls.getDirection(v);
    if (keyMap["KeyW"]) {
        boxBod.position.z += v.z;
        boxBod.position.x += v.x;
    //   boxBod.applyImpulse(new CANNON.Vec3(v.x, 0, v.y));
    }
    if (keyMap["KeyA"]) {
      boxBod.position.x += v.z;
      boxBod.position.z += v.x;
    }
    if (keyMap["KeyS"]) {
      boxBod.position.z -= v.z;
      boxBod.position.x -= v.x;
    }
    if (keyMap["KeyD"]) {
      boxBod.position.x -= v.z;
      boxBod.position.z -= v.x;
    }
    camera.position.copy(boxBod.position);
    camera.position.add(v.multiply(new THREE.Vector3(-10, -10, -10)));
    box.quaternion.copy(boxBod.quaternion);
    box.position.copy(boxBod.position);

    plane.quaternion.copy(planeBod.quaternion);
    plane.position.copy(planeBod.position);
    renderer.render(scene, camera);
    animate();
  });
}
