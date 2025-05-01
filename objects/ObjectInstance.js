import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

export class ObjectInstance {
  constructor(prototype) {
    this.gl = prototype.gl;
    this.prototype = prototype;
    this.modelMatrix = mat4.clone(prototype.modelMatrix);
  }

  translate(x, y, z) {
    mat4.translate(this.modelMatrix, this.modelMatrix, [x, y, z]);
  }

  scale(x, y, z) {
    mat4.scale(this.modelMatrix, this.modelMatrix, [x, y, z]);
  }

  rotate(x, y, z) {
    mat4.rotateX(this.modelMatrix, this.modelMatrix, x);
    mat4.rotateY(this.modelMatrix, this.modelMatrix, y);
    mat4.rotateZ(this.modelMatrix, this.modelMatrix, z);
  }

  draw(camera, timeInSeconds) {
    const gl = this.gl;
    const program = this.prototype.program;

    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.prototype.vertexBuffer);
    gl.enableVertexAttribArray(this.prototype.attribLocations.position);
    gl.vertexAttribPointer(
      this.prototype.attribLocations.position,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.prototype.normalBuffer);
    gl.enableVertexAttribArray(this.prototype.attribLocations.normal);
    gl.vertexAttribPointer(
      this.prototype.attribLocations.normal,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.prototype.texCoordBuffer);
    gl.enableVertexAttribArray(this.prototype.attribLocations.texcoord);
    gl.vertexAttribPointer(
      this.prototype.attribLocations.texcoord,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.uniform3fv(
      this.prototype.uniformLocations.reverseLightDirection,
      this.prototype.reverseLightDirection
    );
    gl.uniformMatrix4fv(
      this.prototype.uniformLocations.model,
      false,
      this.modelMatrix
    );
    gl.uniformMatrix4fv(
      this.prototype.uniformLocations.view,
      false,
      camera.getViewMatrix()
    );
    gl.uniformMatrix4fv(
      this.prototype.uniformLocations.proj,
      false,
      camera.getProjectionMatrix()
    );
    gl.uniform1f(this.prototype.uniformLocations.time, timeInSeconds);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.prototype.texture);
    gl.uniform1i(this.prototype.uniformLocations.texture, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.prototype.indexBuffer);
    gl.drawElements(
      gl.TRIANGLES,
      this.prototype.vertexCount,
      gl.UNSIGNED_INT,
      0
    );
  }
}
