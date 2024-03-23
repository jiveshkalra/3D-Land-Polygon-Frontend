//imports
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getAllNFTs } from "./nfts.js";
window.textGeo = TextGeometry;
window.three = THREE;
// window.createPedestal = createActualPedestal;
window.loadAllPedestals = loadAllPedestals;
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
var textMarkers = [];
let font;
let models = [];
const blocker = document.getElementById("blocker");
const instructions = document.getElementById("instructions");
var openedByTrigger = false;
var keys = {};
//start app;
init();
animate();
//function definitions

const main= async () => {
  let signer = null;
  let provider;
  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults");
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const account = await provider.send("eth_requestAccounts", []);
    return account[0]
  } else {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const account = await provider.send("eth_requestAccounts", []);
    console.log("Connected to MetaMask account", account[0]);
    signer = await provider.getSigner();
    return account[0]
  }
};

function createPedestal(url, objectCode) {
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
    new GLTFLoader().load(url, (mdl) => {
      mdl.scene.name = "";
      mdl.scene.scale.set(0.1, 0.1, 0.1);
      models.push(mdl.scene);
      scene.add(mdl.scene);
    });
    createTrigger(ped, objectCode);
  });
}

// async function createActualPedestal(url_json){
//   let res = await fetch(url_json);
//   let data = await res.json();
//   createPedestal(data.model_url, data);
//   console.log(data);
// }

async function loadAllPedestals() {
  let data = await getAllNFTs();
  data.map((d) => {
    try {
      createPedestal(d.model_url, d);
    } catch (err) {
      console.log(err);
    }
  });
}
function textScript(self) {
  // self.lookAt(camera.position);
}
function createTrigger(pedestal, objectCode) {
  pedestal.position.y += 2;
  let trigger = new THREE.Mesh(
    new THREE.BoxGeometry(30, 10, 30),
    new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true })
  );
  font;
  new FontLoader().load(
    "https://unpkg.com/three@0.157.0/examples/fonts/helvetiker_bold.typeface.json",
    (res) => {
      font = res;
      let text = new THREE.Mesh(
        new TextGeometry("Sasta Maal", {
          font: font,
        }),
        new THREE.MeshPhongMaterial({ color: 0x00ffff })
      );
      window.font = font;
      text.scale.set(0.05, 0.05, 0.05);
      text.update = textScript;
      // scene.add(text);
      // trigger.position.copy(pedestal.position);
      text.position.y += 30;
      text.position.x -= 15;
      textMarkers.push(text);
    }
  );
  trigger.name = "trigger";
  pedestal.children[0] = trigger;
  trigger.material.opacity = 0.001;
  trigger.objectCode = objectCode;
  pedestal.objectCode = objectCode;
  scene.add(trigger);
  triggers.push(trigger);
}
function createFloor() {
  // floor
  let scale = 2;
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
  document.getElementById("playBtn").addEventListener("click", function () {
    controls.lock();
    document.querySelector("#modal").style.display = "none";
  });
  document.getElementById("close").addEventListener("click", function () {
    controls.lock();
    document.querySelector("#modal").style.display = "none";
  });

  controls.addEventListener("lock", function () {
    instructions.style.display = "none";
    document.querySelector("#modal").style.display = "none";
  });

  controls.addEventListener("unlock", function () {
    document.querySelector("#modal").style.display = "none";
    instructions.style.display = "block";
    if (openedByTrigger) {
      document.querySelector("#info").style.display = "block";
      document.querySelector("#playBtn").style.display = "none";
      openedByTrigger = false;
    } else {
      document.querySelector("#info").style.display = "none";
      document.querySelector("#playBtn").style.display = "block";
    }
  });

  const onKeyDown = function (event) {
    keys[event.keyCode] = true;
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
    keys[event.keyCode] = false;
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

<<<<<<< Updated upstream
  // new FBXLoader().load("./resources/gate/PortalThing.fbx", (modl) => {
  //   let  mdl = modl.children[0];
  //   // mdl.scale.set(0.5, 0.5, 0.5);
  //   // mdl.position.y -= 30;
  //   // mdl.position.z -= 200;
  //   // mdl.position.x += 10;
  //   console.log(mdl)
  //   mdl.material.map = new THREE.TextureLoader().load(
  //     "./resources/gate/T_PortalFrame_Normal.png"
  //   );
  //   mdl.material.normalMap = new THREE.TextureLoader().load(
  //     "./resources/gate/T_PortalFrame_Normal.png"
  //   );
  //   mdl.material.metalnessMap = new THREE.TextureLoader().load(
  //     "./resources/gate/T_PortalFrame_Metallic.png"
  //   );
  //   mdl.material.aoMap = new THREE.TextureLoader().load(
  //     "./resources/gate/T_PortalFrame_AO.png"
  //   );
  //   mdl.material.roughnessMap = new THREE.TextureLoader().load(
  //     "./resources/gate/T_PortalFrame_Roughness.png"
  //   );

  //   mdl.material.emissiveIntensity = 0.5;
  //   mdl.material.emissive = new THREE.Color(100, 100, 100);
  //   mdl.material.emissiveMap = new THREE.TextureLoader().load(
  //     "./resources/gate/T_PortalFrame_Emissive.png"
  //   );
  //   scene.add(mdl);
  // });

  new GLTFLoader().load("./resources/gate/portal_frame.glb", (modl) => {
    let mdl = modl.scenes[0].children[0];
=======
  new FBXLoader().load("./resources/gate/PortalThing.fbx", (mdl) => {
>>>>>>> Stashed changes
    mdl.scale.set(0.5, 0.5, 0.5);
    mdl.position.y -= 30;
    mdl.position.z -= 200;
    mdl.position.x += 10;
    console.log(mdl);
    scene.add(mdl);
<<<<<<< Updated upstream
    let coll = new THREE.Mesh(new THREE.BoxGeometry(100,400,10), new THREE.MeshBasicMaterial({color:0x00ffff, transparent:true}))
    coll.material.opacity = 0;
    coll.position.y = 0;
    
    coll.position.copy(mdl.position);
    scene.add(coll);
=======
>>>>>>> Stashed changes
  });

  // createActualPedestal('https://gateway.pinata.cloud/ipfs/QmVZV2rFuYjapcHCgun4Uy2mdNf2gDWBAyp1PQE5Xuf9cp');
  loadAllPedestals();
  scene.createPedestal = createPedestal;
}
//mainLOOP
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();
  pedestals = [];
  for (let child of scene.children) {
    if (child.update) child.update(child);
    if (child.children.length > 0 && child.isMesh) {
      pedestals.push(child);
    }
  }
  if (currentX > maxX) {
    currentX = parseFloat(startX.toString());
    currentY += 40;
  }
  if (currentY > maxY) {
    currentY = parseFloat(startY.toString());
  }
  pedestals.map((p, i) => {
    models[i].position.copy(p.position);
    models[i].position.y = 30;
    models[i].position.x += 4;
    models[i].position.z -= 4;
    // console.log(i)
    if (p.position.x == 0 && p.position.z == 0 && i != 0) {
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

<<<<<<< Updated upstream
    if (isTriggerSteppedOnThisFrame) stepTime += 0.01;
    if (keys[80] && triggersSteppedOn.length > 0) {
      console.log(triggersSteppedOn[0].object.objectCode);
      document.querySelector("#price").innerText =
        triggersSteppedOn[0].object.objectCode.price;
      document.querySelector("#name").innerText =
        triggersSteppedOn[0].object.objectCode.model_name;
      document.querySelector("#desc").innerText =
        triggersSteppedOn[0].object.objectCode.description;
      document.querySelector("#cat").innerText =
        triggersSteppedOn[0].object.objectCode.category;
=======
    if (isTriggerSteppedOnThisFrame) stepTime += 0.01; 
    if (keys[80] && triggersSteppedOn.length > 0) {
      let objectData = triggersSteppedOn[0].object.objectCode
      document.querySelector("#price").innerText = objectData.price;
      document.querySelector("#name").innerText = objectData.model_name;
      document.querySelector("#desc").innerText = objectData.description;
      document.querySelector("#cat").innerText = objectData.category;
      main().then((res)=>{
        const currentAddr =res;
        console.log(objectData.owner.toLowerCase())
        console.log(currentAddr)
        console.log(objectData.seller.toLowerCase())
        if (currentAddr != objectData.seller.toLowerCase() && currentAddr != objectData.owner.toLowerCase()){
          // Purchasing logic here  
        }
        else{
          document.querySelector("#purchasebtn").style='display:none;'
          
        }
      })

>>>>>>> Stashed changes
      openedByTrigger = true;
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
