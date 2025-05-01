import { Scene } from "./core/Scene.js";
import { Camera } from "./core/Camera.js";
import { Controls } from "./core/Controls.js";
import { Skybox } from "./objects/Skybox.js";
import { createObjectInstance } from "./utils/createObjectInstance.js";
import { Object } from "./objects/Object.js";
import { Ground } from "./objects/Ground.js";
import {
  fragmentSource as baobabFrag,
  vertexSource as baobabVert,
} from "./shaders/baobabShaders.js";
import {
  fragmentSource as grassFrag,
  vertexSource as grassVert,
} from "./shaders/grassShaders.js";
import {
  fragmentSource as meFrag,
  vertexSource as meVert,
} from "./shaders/meShaders.js";

let seed = 5000;
function random() {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

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

const ground = new Ground(gl);
scene.addObject(ground);
let baobab = [];
(async () => {
  baobab = await Object.loadFromGLTF(
    gl,
    "/3d-portfolio/models/baobab.glb",
    baobabVert,
    baobabFrag
  );
  for (let i = 0; i < 60; i++) {
    let scale = random() * 0.2 + 0.9;
    let x = random() * 200 - 100;
    let z = random() * 200 - 100;
    let rotate = random() * 360;
    let instance = createObjectInstance(
      baobab,
      [x, 0, z],
      [0, rotate, 0],
      [scale, scale, scale]
    );
    for (let i = 0; i < instance.length; i++) {
      scene.addObject(instance[i]);
    }
  }
})();
(async () => {
  const grass = await Object.loadFromGLTF(
    gl,
    "/3d-portfolio/models/grass.glb",
    grassVert,
    grassFrag
  );
  for (let i = 0; i < 800; i++) {
    let scale = 0.5;
    let x = random() * 200 - 100;
    let z = random() * 200 - 100;
    let instance = createObjectInstance(
      grass,
      [x, 0, z],
      [0, 0, 0],
      [scale, scale, scale]
    );
    for (let i = 0; i < instance.length; i++) {
      scene.addObject(instance[i]);
    }
  }
})();
(async () => {
  const [me] = await Object.loadFromGLTF(
    gl,
    "/3d-portfolio/models/me.glb",
    meVert,
    meFrag
  );
  me.scale(1.0, 1.0, 1.0);
  me.translate(1.2, 0.5, 1.2);
  me.rotate(0, 110, 0);
  scene.addObject(me);
})();

function render(time) {
  scene.render(time * 0.001);
  requestAnimationFrame(render);
}

render();
