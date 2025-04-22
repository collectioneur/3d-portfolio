import {
  vec3,
  mat4,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

export class Controls {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;

    this.orbitRadius = 6;
    this.azimuth = 0;
    this.elevation = 0.3;

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
        this.orbitRadius += e.deltaY * 0.01;
        this.orbitRadius = Math.max(2, Math.min(20, this.orbitRadius));
        this.updateCameraPosition();
      },
      { passive: false }
    );
  }

  updateCameraPosition() {
    const x =
      this.orbitRadius * Math.sin(this.azimuth) * Math.cos(this.elevation);
    const y = this.orbitRadius * Math.sin(this.elevation);
    const z =
      this.orbitRadius * Math.cos(this.azimuth) * Math.cos(this.elevation);

    vec3.set(this.camera.position, x, y, z);
    this.camera.updateViewMatrix();
  }
}
