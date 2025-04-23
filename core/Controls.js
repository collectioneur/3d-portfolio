import {
  vec3,
  mat4,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

export class Controls {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;

    this.orbitRadius = 0.4;
    this.azimuth = -Math.PI / 2;
    this.elevation = -Math.PI / 2;

    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;

    this.sensitivity = 0.01;

    this.initEvents();
    this.updateCameraPosition();
  }

  initEvents() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    this.canvas.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;

      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;

      this.lastX = e.clientX;
      this.lastY = e.clientY;

      this.azimuth += dx * this.sensitivity;
      this.elevation -= dy * this.sensitivity;

      const maxElev = Math.PI / 2 - 0.01;
      const minElev = -maxElev;
      this.elevation = Math.max(minElev, Math.min(maxElev, this.elevation));

      this.updateCameraPosition();
    });

    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.camera.position[1] += e.deltaY * 0.01; // вверх/вниз
        this.camera.position[1] = Math.max(
          0.3,
          Math.min(3.0, this.camera.position[1])
        );
        this.updateCameraPosition();
      },
      { passive: false }
    );
  }

  updateCameraPosition() {
    const eye = this.camera.position;

    // Вычисляем направление взгляда из азимута и возвышения
    const dir = vec3.fromValues(
      -Math.sin(this.azimuth) * Math.cos(this.elevation),
      Math.sin(this.elevation),
      Math.cos(this.azimuth) * Math.cos(this.elevation)
    );

    // Устанавливаем target = position + direction
    const target = vec3.create();
    vec3.add(target, eye, dir);
    vec3.copy(this.camera.target, target);

    this.camera.updateViewMatrix();
  }
}
