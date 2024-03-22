//imports
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
//var definition
let camera, scene, renderer, controls;
const objects = [];
const triggers = [];
let raycaster1;
let raycaster2;
let raycaster3;
let raycaster4;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();
var stepTime = 0;
var isTriggerSteppedOnThisFrame = false;
let ped;
var floor;
var light;
var light_mult = 1;
var startX = 0;
var startY = 0;
var currentX = 0;
var currentY = 0;
var maxX = 120;
var maxY = 200;
var pedestals = [];
//start app;
init();
animate();
//function definitions

function createPedestal(objectCode) {
  let fbxloader = new FBXLoader();
  fbxloader.load("./resources/pedestal/source/Pedestal_low.fbx", (model) => {
    ped = model.children[0];
    scene.add(ped);
    let scaleFactor = 10;
    ped.scale.set(scaleFactor, scaleFactor, scaleFactor);
    ped.material.map = new THREE.TextureLoader().load(
      "./resources/pedestal/textures/Pedestal_low_lambert2_AlbedoTransparency.png"
    );
    ped.material.normalMap = new THREE.TextureLoader().load(
      "./resources/pedestal/textures/Pedestal_low_lambert2_Normal.png"
    );
    ped.material.metalnessMap = new THREE.TextureLoader().load(
      "./resources/pedestal/textures/Pedestal_low_lambert2_MetallicSmoothness.png"
    );
    ped.material.metalness = 100;
    ped.material.aoMap = new THREE.TextureLoader().load(
      "./resources/pedestal/textures/Pedestal_low_lambert2_AmbientOcclusion.png"
    );
    ped.material.emissiveIntensity = 0.5;
    ped.material.emissive = new THREE.Color(100, 100, 100);
    ped.material.emissiveMap = new THREE.TextureLoader().load(
      "./resources/pedestal/textures/Pedestal_low_lambert2_Emission.png"
    );
    objects.push(ped);
    createTrigger(ped, objectCode);
  });
}
function createTrigger(pedestal, objectCode) {
  pedestal.position.y += 2;
  let trigger = new THREE.Mesh(
    new THREE.BoxGeometry(30, 10, 30),
    new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true })
  );
  trigger.position.copy(pedestal.position);
  trigger.name = "trigger";
  pedestal.children[0] = trigger;
  trigger.material.opacity = 0.2;
  trigger.objectCode = objectCode;
  scene.add(trigger);
  triggers.push(trigger);
}
function createFloor() {
  // floor
  let scale = 1;
  let floorGeometry = new THREE.PlaneGeometry(
    2000 * scale,
    2000 * scale,
    1000 * scale,
    1000 * scale
  );
  floorGeometry.rotateX(-Math.PI / 2);

  const floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xb0c87f,
    // transparent: true,
  });
  const normalTexture = new THREE.TextureLoader().load(
    "./resources/normal_Maps/download.jpeg"
  );

  const grassTexture = new THREE.TextureLoader().load(
    "./resources/normal_Maps/grass.jpg"
  );
  grassTexture.repeat.set(8, 8);
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  floorMaterial.map = grassTexture;
  floorMaterial.normalMap = normalTexture;
  floorMaterial.normalScale.set(80, 80);
  floor = new THREE.Mesh(floorGeometry, floorMaterial);

  scene.add(floor);
}
function createEventListeners() {
  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");

  instructions.addEventListener("click", function () {
    controls.lock();
  });

  controls.addEventListener("lock", function () {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });

  controls.addEventListener("unlock", function () {
    blocker.style.display = "block";
    instructions.style.display = "";
  });

  const onKeyDown = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;

      case "Space":
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
    }
  };

  const onKeyUp = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  window.addEventListener("resize", onWindowResize);
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
function sceneAndCameraSetup() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.y = 10;

  scene = new THREE.Scene();
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
  scene.fog = new THREE.Fog(0xb0c87f, 1, 1000);
  window.scene = scene;
}
//init function
function init() {
  sceneAndCameraSetup();
  light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 4.5);
  scene.add(light);

  controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());

  createEventListeners();

  raycaster1 = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );
  raycaster2 = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    5
  );
  raycaster3 = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    5
  );

  createFloor();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  createPedestal({
    type: "purchase",
    link: "https://purchase.net/NFTTradeLink",
    price: "3eth",
    model_link: "https://models.tk",
  });

  createPedestal({
    type: "purchase",
    link: "https://purchase.net/NFTTradeLink",
    price: "13eth",
    model_link: "https://models.tk",
  });
  scene.createPedestal = createPedestal;
}
//mainLOOP
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();

  pedestals = [];
  for (let child of scene.children) {
    if (child.children.length > 0 && !child.Set) {
      pedestals.push(child);
    }
  }
  if(currentX > maxX){
    currentX = parseFloat(startX.toString());
    currentY += 40
  }
  if(currentY > maxY){
    currentY = parseFloat(startY.toString());
  }
  pedestals.map((p) => {
    if (p.position.x == 0 && p.position.z == 0) {
      p.position.x = currentX;
      p.position.z = currentY;
      p.children[0].position.x = currentX;
      p.children[0].position.z = currentY;
      currentX += 40;
    }
  });

  const delta = (time - prevTime) / 1000;

  if (controls.isLocked === true) {
    raycaster1.ray.origin.copy(controls.getObject().position);
    raycaster1.ray.origin.y -= 10;
    raycaster3.ray.origin.copy(controls.getObject().position);
    let intersectionsFront = 0;
    let intersectionsBack = 0;
    let intersectionsLeft = 0;
    let intersectionsRight = 0;
    for (let x = 0; x < 1; x++) {
      for (let y = 0; y < 2; y++) {
        raycaster2.setFromCamera(new THREE.Vector3(x - 0.5, y - 1), camera);
        intersectionsFront += raycaster2.intersectObjects(
          objects,
          false
        ).length;
      }
    }
    const intersections1 = raycaster1.intersectObjects(objects, false);
    const triggersSteppedOn = raycaster3.intersectObjects(triggers, false);
    isTriggerSteppedOnThisFrame = triggersSteppedOn.length > 0;

    if (isTriggerSteppedOnThisFrame) stepTime += 0.01;
    if (stepTime > 1.0 && isTriggerSteppedOnThisFrame) {
      console.log(triggersSteppedOn[0].object.objectCode);
      document.querySelector("#info").innerText =
        triggersSteppedOn[0].object.objectCode.price;
      controls.unlock();
      stepTime = 0;
    }

    const onObject = intersections1.length > 0;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }
    light.intensity += 0.1 * light_mult;
    if (light.intensity > 4) light_mult *= -1;
    if (light.intensity < -4) light_mult *= -1;

    controls.moveRight(-velocity.x * delta);
    if (!intersectionsFront) controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 10) {
      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
    }
  }

  if (!isTriggerSteppedOnThisFrame) {
    stepTime = 0;
  }
  prevTime = time;
  renderer.render(scene, camera);
}
