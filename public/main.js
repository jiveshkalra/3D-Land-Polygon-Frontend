import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
const loader = new THREE.CubeTextureLoader();
loader.setPath("");

const textureCube = loader.load([
  "t.png",
  "t.png",
  "t.png",
  "t.png",
  "t.png",
  "t.png",
]);

const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  envMap: textureCube,
});
material.side = THREE.DoubleSide;
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;

const plane = new THREE.PlaneGeometry(1000, 1000);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x964b00 });
planeMaterial.side = THREE.DoubleSide;
const planeMesh = new THREE.Mesh(plane, planeMaterial);
planeMesh.rotateX(1.5708);
planeMesh.position.y -= 100;
scene.add(planeMesh);
const char_geo = new THREE.BoxGeometry(1, 1, 1);
const char_mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    envMap: textureCube,
  });;
const character = new THREE.Mesh(char_geo, char_mat);
character.position.y = -99.5;
function Random_Boxes(number) {
  for (let i = 0; i < number; i++) {
    let geo = new THREE.BoxGeometry(1, 1, 1);
    let mat = new THREE.MeshBasicMaterial({ color: 0x00 });
    let cter = new THREE.Mesh(geo, mat);
    cter.position.set(
      Math.random() * 2000 - 1000,
      -99.5,
      Math.random() * 2000 - 1000
    );
    scene.add(cter);
  }
}
var angleX = 0;
var angleY = 0;
Random_Boxes(10_000);
scene.add(character);
function Movement(e) {
//   camera.position.set(character.position.x - cam_rot_x, character.position.y + 5, character.position.z - cam_rot_z  );

  let distance = 5;
  let theta = angleX*(Math.PI / 180);
  let phi = angleY*(Math.PI / 180);
  let x = Math.cos(theta) * Math.cos(phi) * distance;
  let y = Math.sin(theta) * Math.cos(phi) * distance;
  let z = distance * Math.sin(phi);
  camera.position.set(x,y,z);
  camera.position.add(character.position);

  camera.lookAt(character.position);
  if (e.key.toLowerCase() == "w") {
    character.position.x -= 0.1;
  }
  if (e.key.toLowerCase() == "d") {
    character.position.z -= 0.1;
  }
  if (e.key.toLowerCase() == "s") {
    character.position.x += 0.1;
  }
  if (e.key.toLowerCase() == "a") {
    character.position.z += 0.1;
  }
}
addEventListener("keydown", (e) => {
  Movement(e);
});
var px,py,cx,cy;
var mousedown = false;
addEventListener('mousedown', (e)=>{mousedown = true});
addEventListener('mouseup', (e)=>{mousedown = false});
addEventListener('mousemove', e=>{
    px=cx;
    py=cy;
    cx=e.clientX;
    cy=e.clientY;
    if(mousedown){
        let changeX = cx-px;
        let changeY = cy-py;
        angleY += changeX;
        angleX += changeY;
        console.log(angleX,angleY)
    }
})
Movement({ key: "test" });
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
