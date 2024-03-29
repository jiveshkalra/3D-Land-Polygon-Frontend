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
var startX = 40;
var startY = 40;
var currentX = 40;
var currentY = 40;
var maxX = 1000;
var maxY = 20000;
var pedestals = [];
var textMarkers = [];
let font;
let models = [];
const blocker = document.getElementById("blocker");
const instructions = document.getElementById("instructions");
var openedByTrigger = false;
var keys = {};
let video;
let maxSize = 40;
var sell_portal;
let foliagePack;
let folList = [];
let no_of_instances_per_foliage = 10000;
let hidden = false;
function createOneTimeTimeOut() {
  if (hidden) return;
  setTimeout(() => {
    document
      .querySelector("#loader")
      .parentNode.removeChild(document.querySelector("#loader"));
  }, 10000);
}
//start app;
init();
animate();
//function definitions

const main = async () => {
  let signer = null;
  let provider;
  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults");
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const account = await provider.send("eth_requestAccounts", []);
    return account[0];
  } else {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const account = await provider.send("eth_requestAccounts", []);
    console.log("Connected to MetaMask account", account[0]);
    signer = await provider.getSigner();
    return account[0];
  }
};

addEventListener("DOMContentLoaded", main);

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
      let sizeVec = new THREE.Vector3(0, 0, 0);
      let bb = new THREE.Box3().setFromObject(mdl.scene);
      bb.getSize(sizeVec);
      let scaleRatio = 1;
      let biggest = sizeVec.x;
      if (sizeVec.y > sizeVec.x) biggest = sizeVec.y;
      if (sizeVec.z > sizeVec.y) biggest = sizeVec.z;
      scaleRatio = maxSize / biggest;
      mdl.scene.scale.set(scaleRatio, scaleRatio, scaleRatio);
      models.push(mdl.scene);
      scene.add(mdl.scene);
    });
    createTrigger(ped, objectCode);
  });
}


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
  let scale = 0.8;
  let floorGeometry = new THREE.PlaneGeometry(
    2000 * scale,
    2000 * scale,
    1000 * scale,
    1000 * scale
  );
  floorGeometry.rotateX(-Math.PI / 2);

  const floorMaterial = new THREE.MeshPhongMaterial({
    color: 0x666666,
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

  let border = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshBasicMaterial({ color: 0x104fe3 })
  );
  border.scale.set(600, 600, 600);
  border.position.y -= 200;
  border.material.side = THREE.BackSide;
  scene.add(border);

  new GLTFLoader().load("./resources/foliage/grass.glb", (fol) => {
    foliagePack =
      fol.scene.children[0].children[0].children[0].children[0].children[0];

    const mesh = new THREE.InstancedMesh(
      foliagePack.geometry,
      foliagePack.material,
      no_of_instances_per_foliage
    );
    const dummy = new THREE.Object3D();
    for (let i = 0; i < no_of_instances_per_foliage; i++) {
      dummy.position.set(
        Math.random() * 2000 - 1000,
        0,
        Math.random() * 2000 - 1000
      );
      dummy.rotation.x = THREE.MathUtils.degToRad(-90);

      dummy.scale.set(
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
  });
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
    instructions.style.display = "flex";
    if (openedByTrigger) {
      document.querySelector("#info").style.display = "flex";
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
  window.addEventListener("mousedown", () => {
    video.play();
  });
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
    2000
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
  scene.fog = new THREE.Fog(0xddddff, 0.0, 800.0);
  window.scene = scene;
}
function correctPointInBox(pt, cube) {
  cube.geometry.computeBoundingBox();
  cube.updateMatrixWorld(); //Make sure the object matrix is current with the position/rotation/scaling of the object...
  var localPt = cube.worldToLocal(pt.clone()); //Transform the point from world space into the objects space
  return cube.geometry.boundingBox.containsPoint(localPt);
}
function collider(self) {
  if (correctPointInBox(controls.getObject().position, self))
    window.location.href = window.location.origin + "/form";
}
//init function
function init() {
  video = document.createElement("video");
  video.src = "./resources/vids/vid01.mp4";
  video.loop = true;
  video.autoplay = true;
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

  new GLTFLoader().load("./resources/gate/portal_frame.glb", (modl) => {
    let mdl = modl.scenes[0].children[0];
    sell_portal = mdl;
    mdl.scale.set(0.5, 0.5, 0.5);
    mdl.position.y -= 30;
    mdl.position.z -= 200;
    mdl.position.x += 10;
    scene.add(mdl);
    objects.push(sell_portal);

    new FontLoader().load(
      "https://unpkg.com/three@0.157.0/examples/fonts/helvetiker_bold.typeface.json",
      (res) => {
        font = res;
        let text = new THREE.Mesh(
          new TextGeometry("Sell Your NFT!!", {
            font: font,
          }),
          new THREE.MeshPhongMaterial({ color: 0x00ff80 })
        );
        text.material.bumpMap = new THREE.TextureLoader().load(
          "./resources/normal_Maps/download.jpeg"
        );
        text.material.bumpScale = 10;
        window.font = font;
        text.scale.set(0.1, 0.1, 0.05);
        text.position.copy(sell_portal.position);
        text.position.y = 180;
        text.geometry.computeBoundingBox();
        text.position.x -= 40;
        text.lookAt(new THREE.Vector3(0, 0, 0));
        text.name = "txt";
        scene.add(text);
      }
    );

    var geometry = new THREE.CylinderGeometry(
      0.8 / Math.sqrt(2),
      1 / Math.sqrt(2),
      1,
      4,
      1
    ); // size of top can be changed
    geometry.rotateY(Math.PI / 4);
    let coll = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({
        color: 0x401961,
        transparent: true,
      })
    );
    let texture = new THREE.VideoTexture(
      video,
      THREE.RepeatWrapping,
      undefined,
      THREE.RepeatWrapping,
      THREE.RepeatWrapping
    );
    coll.material.map = texture;
    coll.material.alphaMap = texture;
    coll.scale.set(100, 150, 10);
    coll.material.opacity = 0.95;
    coll.update = collider;
    coll.position.copy(mdl.position);
    coll.position.y = 70;
    scene.add(coll);
  });

  // createActualPedestal('https://gateway.pinata.cloud/ipfs/QmVZV2rFuYjapcHCgun4Uy2mdNf2gDWBAyp1PQE5Xuf9cp');
  loadAllPedestals();
  scene.createPedestal = createPedestal;
}
//mainLOOP
function animate() {
  requestAnimationFrame(animate);
  if (
    controls.getObject().position.distanceTo(new THREE.Vector3(0, 0, 0)) > 425.0
  )
    camera.position.set(0, 15, 0);
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
  if (models.length == pedestals.length) {
    createOneTimeTimeOut();
    pedestals.map((p, i) => {
      models[i].position.copy(p.position);
      models[i].position.y = 30;
      models[i].position.x += 4;
      models[i].position.z -= 4;
      if (p.position.x == 0 && p.position.z == 0) {
        p.position.x = currentX;
        p.position.z = currentY;
        p.children[0].position.x = currentX;
        p.children[0].position.z = currentY;
        currentX += 40;
      }
    });
  }
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
    if (keys[80] && triggersSteppedOn.length > 0) {
      let objectData = triggersSteppedOn[0].object.objectCode;
      document.querySelector("#price").innerText = objectData.price;
      document.querySelector("#name").innerText = objectData.model_name;
      document.querySelector("#desc").innerText = objectData.description;
      document.querySelector("#tokenid").innerText = objectData.tokenId;
      document.querySelector("#cat").innerText = objectData.category;
      main().then((res) => {
        const currentAddr = res;
        if (
          currentAddr != objectData.seller.toLowerCase() &&
          currentAddr != objectData.owner.toLowerCase()
        ) {
          document.querySelector("#purchasebtn").style = "display:flex;";
          document.querySelector("#alreadyOwned").style = "display:none;";
        } else {
          document.querySelector("#purchasebtn").style = "display:none;";
          document.querySelector("#alreadyOwned").style = "display:flex;";
        }
      });

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
