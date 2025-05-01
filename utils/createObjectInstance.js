import { ObjectInstance } from "../objects/ObjectInstance.js";

// Funkcja tworząca instancje obiektów na podstawie części modelu
export const createObjectInstance = (objectParts, translate, rotate, scale) => {
  const objectInstanceParts = [];

  // Iteracja po wszystkich częściach modelu
  for (let i = 0; i < objectParts.length; i++) {
    // Tworzenie nowej instancji dla danej części
    const instance = new ObjectInstance(objectParts[i]);

    // Ustawienie pozycji, obrotu i skali instancji
    instance.translate(...translate);
    instance.rotate(...rotate);
    instance.scale(...scale);

    // Dodanie instancji do tablicy wynikowej
    objectInstanceParts.push(instance);
  }

  // Zwrócenie wszystkich instancji jako tablica
  return objectInstanceParts;
};
