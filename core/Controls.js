import { vec3 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

export class Controls {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;

    this.azimuth = -Math.PI / 6;
    this.elevation = Math.PI / 14 - 0.01;

    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;

    this.isPinching = false;
    this.lastDist = 0;

    this.rotateSensitivity = 0.01;
    this.zoomSensitivity = 0.005;

    this.initEvents();
    this.updateCameraPosition();
  }

  initEvents() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.isDragging || this.isPinching) return;
      this.rotate(e.clientX - this.lastX, e.clientY - this.lastY);
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.zoom(e.deltaY * 0.01);
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          this.isDragging = true;
          const touch = e.touches[0];
          this.lastX = touch.clientX;
          this.lastY = touch.clientY;
        } else if (e.touches.length === 2) {
          this.isPinching = true;
          this.lastDist = this._touchDistance(e.touches[0], e.touches[1]);
        }
      },
      { passive: true }
    );

    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        if (this.isPinching && e.touches.length === 2) {
          const dist = this._touchDistance(e.touches[0], e.touches[1]);
          const delta = dist - this.lastDist;
          this.lastDist = dist;
          this.zoom(-delta * this.zoomSensitivity);
        } else if (this.isDragging && e.touches.length === 1) {
          const touch = e.touches[0];
          this.rotate(touch.clientX - this.lastX, touch.clientY - this.lastY);
          this.lastX = touch.clientX;
          this.lastY = touch.clientY;
        }
      },
      { passive: false }
    );

    window.addEventListener(
      "touchend",
      () => {
        this._resetTouchState();
      },
      { passive: true }
    );

    window.addEventListener(
      "touchcancel",
      () => {
        this._resetTouchState();
      },
      { passive: true }
    );
  }

  rotate(dx, dy) {
    this.azimuth += dx * this.rotateSensitivity;
    this.elevation -= dy * this.rotateSensitivity;
    const maxElev = Math.PI / 2 - 0.01;
    const minElev = -maxElev;
    this.elevation = Math.max(minElev, Math.min(maxElev, this.elevation));

    this.updateCameraPosition();
  }

  zoom(amount) {
    this.camera.position[1] += amount;
    this.camera.position[1] = Math.max(
      0.1,
      Math.min(5.0, this.camera.position[1])
    );
    this.updateCameraPosition();
  }

  _resetTouchState() {
    this.isDragging = false;
    this.isPinching = false;
  }

  _touchDistance(t0, t1) {
    const dx = t0.clientX - t1.clientX;
    const dy = t0.clientY - t1.clientY;
    return Math.hypot(dx, dy);
  }

  updateCameraPosition() {
    const eye = this.camera.position;

    const dir = vec3.fromValues(
      -Math.sin(this.azimuth) * Math.cos(this.elevation),
      Math.sin(this.elevation),
      Math.cos(this.azimuth) * Math.cos(this.elevation)
    );

    const target = vec3.create();
    vec3.add(target, eye, dir);
    vec3.copy(this.camera.target, target);

    this.camera.updateViewMatrix();
  }
}
