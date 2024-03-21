import * as THREE from "three";
import * as CANNON from "cannon-es";
const scene = new THREE.Scene();
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0),
});
const timeStep = 1 / 50;
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0.5, 3);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  "./resources/posx.jpg",
  "./resources/negx.jpg",
  "./resources/posy.jpg",
  "./resources/negy.jpg",
  "./resources/posz.jpg",
  "./resources/negz.jpg",
]);
scene.background = texture;

let light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(20, 100, 10);
light.target.position.set(0, 0, 0);
light.castShadow = true;
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 500.0;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500.0;
light.shadow.camera.left = 100;
light.shadow.camera.right = -100;
light.shadow.camera.top = 100;
light.shadow.camera.bottom = -100;
scene.add(light);

light = new THREE.AmbientLight(0x101010);
scene.add(light);

const geometry = new THREE.CylinderGeometry();
const material = new THREE.MeshPhongMaterial({
  color: 0x00ff00,
});
const capsule = new THREE.Mesh(geometry, material);
capsule.position.y = 1.5;
scene.add(capsule);
const capsuleBody = new CANNON.Body({
  shape: new CANNON.Cylinder(),
  mass: 1,
});
world.addBody(capsuleBody);

const pivot = new THREE.Object3D();
pivot.position.set(0, 1, 10);
const yaw = new THREE.Object3D();
const pitch = new THREE.Object3D();
scene.add(pivot);
pivot.add(yaw);
yaw.add(pitch);
pitch.add(camera);

const plane_geometry = new THREE.PlaneGeometry(1000, 1000);
const plane_material = new THREE.MeshPhongMaterial({ color: 0x00000ff });
const plane_capsule = new THREE.Mesh(plane_geometry, plane_material);
plane_capsule.position.y = -3;
plane_capsule.rotateX(THREE.MathUtils.degToRad(-90));
scene.add(plane_capsule);
const planeBody = new CANNON.Body({
  shape: new CANNON.Plane(),
  mass: 0,
});
planeBody.quaternion.setFromEuler(THREE.MathUtils.degToRad(-90), 0, 0);
planeBody.position.copy(plane_capsule.position);
world.addBody(planeBody);
function AddObjects(number) {
  for (let i = 0; i < number; i++) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshPhongMaterial({ color: 0x00000ff });
    const cap = new THREE.Mesh(geo, mat);
    cap.position.y = 0;
    let x = Math.random() * 200 - 100;
    let z = Math.random() * 200 - 100;
    cap.position.set(x, -3, z);
    cap.rotateX(THREE.MathUtils.degToRad(-90));
    scene.add(cap);
    const boxBody = new CANNON.Body({
      shape: new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5)),
      mass: 0,
    });
    boxBody.position.set(x,-3,z);
    world.addBody(boxBody);
  }
}
AddObjects(1000);
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}
function onDocumentMouseMove(e) {
  yaw.rotation.y -= e.movementX * 0.002;
  const v = pitch.rotation.x - e.movementY * 0.002;
  if (v > -1 && v < 0.1) {
    pitch.rotation.x = v;
  }
  return false;
}
function onDocumentMouseWheel(e) {
  const v = camera.position.z + e.deltaY * 0.005;
  if (v >= 2 && v <= 10) {
    camera.position.z = v;
  }
  return false;
}
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let jump = false;
const keyMap = {};
const onDocumentKey = (e) => {
  keyMap[e.code] = e.type === "keydown";
  if (pointerLocked) {
    moveForward = keyMap["KeyW"];
    moveBackward = keyMap["KeyS"];
    moveLeft = keyMap["KeyA"];
    moveRight = keyMap["KeyD"];
    jump = keyMap["KeyR"];
  }
};
const menuPanel = document.getElementById("menuPanel");
const startButton = document.getElementById("startButton");
startButton.addEventListener(
  "click",
  () => {
    renderer.domElement.requestPointerLock();
  },
  false
);

let pointerLocked = false;
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === renderer.domElement) {
    pointerLocked = true;

    startButton.style.display = "none";
    menuPanel.style.display = "none";

    document.addEventListener("keydown", onDocumentKey, false);
    document.addEventListener("keyup", onDocumentKey, false);

    renderer.domElement.addEventListener(
      "mousemove",
      onDocumentMouseMove,
      false
    );
    renderer.domElement.addEventListener("wheel", onDocumentMouseWheel, false);
  } else {
    pointerLocked = false;

    menuPanel.style.display = "block";

    document.removeEventListener("keydown", onDocumentKey, false);
    document.removeEventListener("keyup", onDocumentKey, false);

    renderer.domElement.removeEventListener(
      "mousemove",
      onDocumentMouseMove,
      false
    );
    renderer.domElement.removeEventListener(
      "wheel",
      onDocumentMouseWheel,
      false
    );

    setTimeout(() => {
      startButton.style.display = "block";
    }, 1000);
  }
});

const v = new THREE.Vector3();
const inputVelocity = new THREE.Vector3();
const euler = new THREE.Euler();
const quaternion = new THREE.Quaternion();
const speed = 10;
const clock = new THREE.Clock();
let delta = 0;

function animate() {
  requestAnimationFrame(animate);

  delta = clock.getDelta();
  world.step(timeStep);
  inputVelocity.set(0, 0, 0);
  capsule.position.copy(capsuleBody.position);
  capsule.quaternion.copy(capsuleBody.quaternion);
  if (moveForward) {
    inputVelocity.z = -speed * delta;
  }
  if (moveBackward) {
    inputVelocity.z = speed * delta;
  }

  if (moveLeft) {
    inputVelocity.x = -speed * delta;
  }
  if (moveRight) {
    inputVelocity.x = speed * delta;
  }

  // apply camera rotation to inputVelocity
  euler.y = yaw.rotation.y;
  capsuleBody.position.copy(capsule.position);
  quaternion.setFromEuler(euler);
  inputVelocity.applyQuaternion(quaternion);
  capsule.position.add(inputVelocity);

  capsule.getWorldPosition(v);
  pivot.position.lerp(v, 0.1);
  
  if(jump){
    capsuleBody.applyImpulse(new CANNON.Vec3(0,3,0));
  }
  render();
}

function render() {
  renderer.render(scene, camera);
}

animate();
