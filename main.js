import { GLTFLoader } from "./core/GLTFLoader.js"; // <== теперь локальный и рабочий

import { Scene } from "./core/Scene.js";
import { Camera } from "./core/Camera.js";
import { Controls } from "./core/Controls.js";
import { Skybox } from "./objects/Skybox.js";
import { createObject, createObjectInstances } from "./utils/createObject.js";
import { Object } from "./objects/Object.js";
import { Ground } from "./objects/Ground.js";

const canvas = document.getElementById("glcanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext("webgl");

if (!gl) {
  alert("Unable to initialize WebGL. Your browser may not support it.");
  throw new Error("WebGL not supported");
}
gl.getExtension("OES_element_index_uint");

const camera = new Camera(canvas);
new Controls(camera, canvas);
const scene = new Scene(gl, camera);
scene.setBackground(new Skybox(gl));

// createObject(
//   "../objects/terrain1.glb",
//   scene,
//   gl,
//   [1, 1, 1],
//   [0, 0, 0],
//   [0, 0, 0],
//   0
// );
// createObject(
//   "../objects/baobab1.glb",
//   scene,
//   gl,
//   [1, 1, 1],
//   [Math.random() * 1.0 - 0.5, 0, Math.random() * 1 - 0.5],
//   [0, 0, 0],
//   10
// );
// let positionsBaobab = [
//   [-1.07, -1.18379, 13.0582],
//   [1.94173, -0.883373, 2.13635],
//   [-4.41552, -0.46294, 26.4603],
//   [13.168, -0.758571, 47.3939],
// ];
// for (let i = 0; i < positionsBaobab.length; i++) {
//   createObject(
//     "../objects/baobab1.glb",
//     scene,
//     gl,
//     [1, 1, 1],
//     positionsBaobab[i],
//     [0, 0, 0],
//     0
//   );
// }
const ground = new Ground(gl);
ground.scale(50, 1, 50);
scene.addObject(ground);

createObject(
  "../objects/me2.glb",
  scene,
  gl,
  [1, 1, 1],
  [1, 0.1, 1],
  [90, 90, 0],
  0
);

// createObject(
//   "../objects/mountain.glb",
//   scene,
//   gl,
//   [0.1, 0.1, 0.1],
//   [-600, -50, 0],
//   [-90, 0, 90],
//   0
// );
createObject(
  "../objects/grasss.glb",
  scene,
  gl,
  [1, 1, 1],
  [10, 0, 10],
  [0, 0, 0],
  100
);
createObject(
  "../objects/baobab1.glb",
  scene,
  gl,
  [1, 1, 1],
  [3, 0, 3],
  [0, 0, 0],
  30
);

function render(time) {
  scene.render(time * 0.001);
  requestAnimationFrame(render);
}

render();
