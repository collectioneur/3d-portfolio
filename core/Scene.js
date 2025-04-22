import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

export class Scene {
  constructor(gl, camera) {
    this.gl = gl;
    this.camera = camera;
    this.objects = [];
    this.background = null;

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
  }

  setBackground(bg) {
    this.background = bg;
  }

  addObject(obj) {
    this.objects.push(obj);
  }

  render(time) {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const viewMatrix = this.camera.getViewMatrix();
    const projectionMatrix = this.camera.getProjectionMatrix();

    if (this.background) {
      this.background.draw(viewMatrix, projectionMatrix, time);
    }

    for (const obj of this.objects) {
      if (obj.draw.length === 2) {
        obj.draw(this.camera, time);
      } else {
        obj.draw(this.camera);
      }
    }
  }
}
