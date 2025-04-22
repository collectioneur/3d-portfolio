import {
  mat4,
  vec3,
} from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

export class Camera {
  constructor(canvas) {
    this.position = vec3.fromValues(0, 2, 6);
    this.target = vec3.fromValues(0, 0, 0);
    this.up = vec3.fromValues(0, 1, 0);

    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();

    this.updateViewMatrix();
    this.updateProjectionMatrix(canvas.width / canvas.height);
  }

  updateViewMatrix() {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }

  updateProjectionMatrix(aspect) {
    mat4.perspective(
      this.projectionMatrix,
      (45 * Math.PI) / 180,
      aspect,
      0.1,
      100
    );
  }
}
