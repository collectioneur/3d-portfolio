import { Object } from "../objects/Object.js";
import { Scene } from "../core/Scene.js";
import { GLTFLoader } from "../core/GLTFLoader.js";
import { ObjectInstance } from "../objects/ObjectInstance.js";
import { Me } from "../objects/Me.js";

const loader = new GLTFLoader();

export const createObject = (
  link,
  scene,
  gl,
  scale,
  translate,
  rotate,
  numberOfInstances
) => {
  let objects = [];
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
        const textureImage = terrainMesh.material.map?.image;
        console.log(terrainMesh);

        const vertices = Array.from(geometry.attributes.position.array);
        const normals = Array.from(geometry.attributes.normal.array);
        const indices = geometry.index
          ? Array.from(geometry.index.array)
          : null;
        const texCoords = Array.from(geometry.attributes.uv.array);
        let object = null;
        if (link === "../objects/me2.glb") {
          object = new Me(gl, textureImage, {
            vertices,
            texCoords,
            indices,
          });
        } else {
          object = new Object(gl, textureImage, {
            vertices,
            texCoords,
            indices,
            normals,
          });
        }

        object.scale(scale[0], scale[1], scale[2]);
        object.translate(translate[0], translate[1], translate[2]);
        object.rotate(
          rotate[0] * (Math.PI / 180),
          rotate[1] * (Math.PI / 180),
          rotate[2] * (Math.PI / 180)
        );

        objects.push(object);
        scene.addObject(object);
      });
      createObjectInstances(objects, scene, numberOfInstances);
    },
    (error) => {
      console.error("Ошибка загрузки GLB:", error);
    }
  );
};

export const createObjectInstance = (objectParts) => {
  const x = Math.random() * 100.0 - 50.0;
  const z = Math.random() * 100.0 - 50.0;
  //   const x = 0;
  //   const z = 0;

  const objectInstanceParts = [];
  for (let i = 0; i < objectParts.length; i++) {
    const instance = new ObjectInstance(objectParts[i]);
    instance.translate(x, 0, z);
    objectInstanceParts.push(instance);
  }
  return objectInstanceParts;
};

export const createObjectInstances = (objectParts, scene, count) => {
  const instances = [];
  for (let i = 0; i < count; i++) {
    const objectInstanceParts = createObjectInstance(objectParts);
    for (let j = 0; j < objectInstanceParts.length; j++) {
      scene.addObject(objectInstanceParts[j]);
    }
    instances.push(objectInstanceParts);
  }
  return instances;
};
