import { ObjectInstance } from "../objects/ObjectInstance.js";

export const createObjectInstance = (objectParts, translate, rotate, scale) => {
  const objectInstanceParts = [];
  for (let i = 0; i < objectParts.length; i++) {
    const instance = new ObjectInstance(objectParts[i]);
    instance.translate(...translate);
    instance.rotate(...rotate);
    instance.scale(...scale);
    objectInstanceParts.push(instance);
  }
  return objectInstanceParts;
};
