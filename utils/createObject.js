import { Ground } from "../objects/Ground.js";
import { Scene } from "../core/Scene.js";
import { GLTFLoader } from "../core/GLTFLoader.js";

const loader = new GLTFLoader();

export const createObject = (link, scene, gl, scale, translate, rotate) => {
  loader.load(
    link,
    (gltf) => {
      const meshes = [];

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          meshes.push(child);
        }
      });

      if (meshes.length === 0) {
        console.error("Не удалось найти меши в glTF сцене");
        return;
      }

      meshes.forEach((terrainMesh) => {
        const geometry = terrainMesh.geometry;
        const textureImage = terrainMesh.material.map?.image; // иногда карта может отсутствовать

        const vertices = Array.from(geometry.attributes.position.array);
        const normals = Array.from(geometry.attributes.normal.array);
        const indices = geometry.index
          ? Array.from(geometry.index.array)
          : null;
        const texCoords = Array.from(geometry.attributes.uv.array);

        const ground = new Ground(gl, textureImage, {
          vertices,
          texCoords,
          indices,
        });
        ground.scale(scale[0], scale[1], scale[2]);
        ground.translate(translate[0], translate[1], translate[2]);
        ground.rotate(
          rotate[0] * (Math.PI / 180),
          rotate[1] * (Math.PI / 180),
          rotate[2] * (Math.PI / 180)
        );
        scene.addObject(ground);
      });
    },
    (error) => {
      console.error("Ошибка загрузки GLB:", error);
    }
  );
};
