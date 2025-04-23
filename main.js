import { GLTFLoader } from "./core/GLTFLoader.js"; // <== теперь локальный и рабочий

import { Scene } from "./core/Scene.js";
import { Camera } from "./core/Camera.js";
import { Ground } from "./objects/Ground.js";
import { Controls } from "./core/Controls.js";
import { Skybox } from "./objects/Skybox.js";

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

const loader = new GLTFLoader();
loader.load(
  "./objects/terrain.glb",
  (gltf) => {
    let terrainMesh = null;

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        terrainMesh = child;
      }
    });

    if (!terrainMesh) {
      console.error("Не удалось найти меш в glTF сцене");
      return;
    }
    const geometry = terrainMesh.geometry;
    const textureImage = terrainMesh.material.map.image;

    const vertices = Array.from(geometry.attributes.position.array);
    const normals = Array.from(geometry.attributes.normal.array);
    const indices = geometry.index ? Array.from(geometry.index.array) : null;
    const texCoords = Array.from(geometry.attributes.uv.array);
    console.log(geometry.attributes);
    console.log(vertices.length, indices.length, texCoords.length);

    const ground = new Ground(gl, textureImage, {
      vertices,
      texCoords,
      indices,
    });

    scene.addObject(ground);
  },
  undefined,
  (error) => {
    console.error("Ошибка загрузки GLB:", error);
  }
);

function render(time) {
  scene.render(time * 0.001);
  requestAnimationFrame(render);
}

render();
