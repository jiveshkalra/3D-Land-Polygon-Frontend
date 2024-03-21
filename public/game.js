import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as CANNON from "cannon-es";
var camera, scene, renderer, mesh, goal, follow, world, clock, meshPhy;
var box, floor;
var boxPhy, floorPhy;
var keys = {
  a: false,
  s: false,
  d: false,
  w: false,
  space: false,
};
var dt = 1;
var time = 0;
var newPosition = new THREE.Vector3();
var matrix = new THREE.Matrix4();
var mixers = [];
var walking;
var stop = 1;
var DEGTORAD = 0.01745327;
var temp = new THREE.Vector3();
var dir = new THREE.Vector3();
var a = new THREE.Vector3();
var b = new THREE.Vector3();
var coronaSafetyDistance = 20;
var velocity = 0.0;
var speed = 0.0;

init();

function init() {
  clock = new THREE.Clock();
  camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
      );
  camera.position.set(0, 20, 0);
  world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -10, 0),
});
scene = new THREE.Scene();
camera.lookAt(scene.position);
let loader = new FBXLoader();
loader.load("./resources/island2/source/Stronghold.fbx", (model) => {
    model.scale.set(0.5, 0.5, 0.5);
    // scene.add(model);
});
loader.load("./resources/player/Aj.fbx", (model) => {
    model.scale.set(0.05, 0.05, 0.05);
    mesh = model;
    meshPhy = new CANNON.Body({
        shape: new CANNON.Cylinder(),
        mass: 1,
    });
    meshPhy.position.copy(mesh.position);
    world.addBody(meshPhy);
    goal = new THREE.Object3D();
    follow = new THREE.Object3D();
    follow.position.z = -coronaSafetyDistance;
    mesh.add(follow);
    goal.add(camera);
    scene.add(mesh);
    mesh.position.set(-21, 0, 152);
    
    box = new THREE.Mesh(
        new THREE.BoxGeometry(150, 150, 150),
      new THREE.MeshPhongMaterial({ color: 0x00f0f0 })
      );
      scene.add(box);
      boxPhy = new CANNON.Body({
          shape: new CANNON.Box(new CANNON.Vec3(150, 150, 150)),
          mass: 0,
        });
        boxPhy.position.copy(box.position);
        world.addBody(boxPhy);
        floor = new THREE.Mesh(
          new THREE.BoxGeometry(1500, 10, 1500),
          new THREE.MeshPhongMaterial({ color: 0x00f0f0 })
        );
        floor.position.y -= 7;
        scene.add(floor);
        floorPhy = new CANNON.Body({
          shape: new CANNON.Box(new CANNON.Vec3(1500, 3, 1500)),
          mass: 0,
        });
        floorPhy.position.copy(floor.position);
        world.addBody(floorPhy);
        
        let anim_loader = new FBXLoader();
    anim_loader.load(
      "./resources/player/anims/Standard Walk.fbx",
      (animation) => {
        let m = new THREE.AnimationMixer(mesh);
        mixers.push(m);
        walking = m.clipAction(animation.animations[0]);
        walking.play();
      }
    );
    animate();
  });
  var gridHelper = new THREE.GridHelper(40, 40);
  scene.add(gridHelper);

  scene.add(new THREE.AxesHelper());

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 50);
  scene.add(light);

  document.body.addEventListener("keydown", function (e) {
    const key = e.code.replace("Key", "").toLowerCase();
    if (keys[key] !== undefined) keys[key] = true;
  });
  document.body.addEventListener("keyup", function (e) {
    const key = e.code.replace("Key", "").toLowerCase();
    if (keys[key] !== undefined) keys[key] = false;
  });
}
function animate() {
  dt = clock.getDelta();
//   requestAnimationFrame(animate);
  world.step(1 / 60);
  mixers.map((m) => m.update(dt));
  speed = 0.0;
  if (keys.w) speed = 0.1;
  else if (keys.s) speed = -0.1;
  if (keys.space) mesh.translateY(0.01);
  velocity += (speed - velocity) * 0.3;
  mesh.translateZ(velocity);

  if (keys.a) mesh.rotateY(0.05);
  else if (keys.d) mesh.rotateY(-0.05);

  a.lerp(mesh.position, 0.4);
  b.copy(goal.position);

  dir.copy(a).sub(b).normalize();
  const dis = a.distanceTo(b) - coronaSafetyDistance;
  goal.position.addScaledVector(dir, dis);
  goal.position.lerp(temp, 0.02);
  temp.setFromMatrixPosition(follow.matrixWorld);
  camera.lookAt(mesh.position);
  mesh.position.copy(meshPhy.position);
  box.position.copy(boxPhy.position);
  box.quaternion.copy(boxPhy.quaternion);

  renderer.render(scene, camera);
  setInterval(animate,1000)
}
