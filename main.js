import { Scene } from "/core/Scene.js";
import { Camera } from "/core/Camera.js";
import { Ground } from "/objects/Ground.js";
import { Controls } from "/core/Controls.js";
import { Skybox } from "/objects/Skybox.js";

const canvas = document.getElementById("glcanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext("webgl");

if (!gl) {
  alert("Unable to initialize WebGL. Your browser may not support it.");
  throw new Error("WebGL not supported");
}

const camera = new Camera(canvas);
new Controls(camera, canvas);
const scene = new Scene(gl, camera);
scene.setBackground(new Skybox(gl));

const ground = new Ground(gl, "textures/ground.jpg");
scene.addObject(ground);

function render(time) {
  scene.render(time * 0.001);
  requestAnimationFrame(render);
}

render();
