import { GLTFLoader } from "./core/GLTFLoader.js"; // <== теперь локальный и рабочий

import { Scene } from "./core/Scene.js";
import { Camera } from "./core/Camera.js";
import { Ground } from "./objects/Ground.js";
import { Controls } from "./core/Controls.js";
import { Skybox } from "./objects/Skybox.js";
import { createObject } from "./utils/createObject.js";

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

// createObject("../objects/baobab.glb", scene, gl, [1, 1, 1], [-40.4, 0, 0.5]);
createObject(
  "../objects/terrain1.glb",
  scene,
  gl,
  [1, 1, 1],
  [0, 0, 0],
  [0, 0, 0]
);
let positionsBaobab = [
  [-1.07, -1.18379, 13.0582],
  [1.94173, -0.883373, 2.13635],
  [-4.41552, -0.46294, 26.4603],
  [13.168, -0.758571, 47.3939],
];
for (let i = 0; i < positionsBaobab.length; i++) {
  createObject(
    "../objects/baobab1.glb",
    scene,
    gl,
    [1, 1, 1],
    positionsBaobab[i],
    [0, 0, 0]
  );
}
createObject(
  "../objects/me2.glb",
  scene,
  gl,
  [1, 1, 1],
  [1, -0.7, 1],
  [90, 90, 0]
);
function render(time) {
  scene.render(time * 0.001);
  requestAnimationFrame(render);
}

render();
