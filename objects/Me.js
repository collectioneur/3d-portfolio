import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

const vertexSource = `
  attribute vec3 a_position;
  attribute vec2 a_texcoord;

  varying vec2 v_texcoord;

  uniform mat4 u_model;
  uniform mat4 u_view;
  uniform mat4 u_proj;
  uniform float u_time;

  void main() {
  vec4 pos = vec4(a_position, 1.0);
  if ((a_position.z > 0.16 || a_position.z < -0.16) && a_position.y > 0.16) {
    pos.y += sin(u_time) * a_position.y * 0.1;
    pos.z += sign(a_position.z) * abs(cos(u_time)) * a_position.y * 0.1;
  }
    vec4 worldPos = u_model * pos;
    v_texcoord = a_texcoord;
    gl_Position = u_proj * u_view  * worldPos;
  }
`;

const fragmentSource = `
  precision mediump float;

  varying vec2 v_texcoord;
  uniform sampler2D u_texture;

  void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
  }
`;

export class Me {
  constructor(gl, textureImage, { vertices, texCoords, indices }) {
    this.gl = gl;
    this.modelMatrix = mat4.create();

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint32Array(indices),
      gl.STATIC_DRAW
    );

    this.vertexCount = indices.length;

    this.program = this.createProgram(gl, vertexSource, fragmentSource);
    this.attribLocations = {
      position: gl.getAttribLocation(this.program, "a_position"),
      texcoord: gl.getAttribLocation(this.program, "a_texcoord"),
    };
    this.uniformLocations = {
      model: gl.getUniformLocation(this.program, "u_model"),
      view: gl.getUniformLocation(this.program, "u_view"),
      proj: gl.getUniformLocation(this.program, "u_proj"),
      texture: gl.getUniformLocation(this.program, "u_texture"),
      time: gl.getUniformLocation(this.program, "u_time"),
    };
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    if (textureImage) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        textureImage
      );
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      const whitePixel = new Uint8Array([23, 56, 22, 255]);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        whitePixel
      );
    }
  }

  rotate(x, y, z) {
    mat4.rotateX(this.modelMatrix, this.modelMatrix, x);
    mat4.rotateY(this.modelMatrix, this.modelMatrix, y);
    mat4.rotateZ(this.modelMatrix, this.modelMatrix, z);
  }

  translate(x, y, z) {
    mat4.translate(this.modelMatrix, this.modelMatrix, [x, y, z]);
  }

  scale(x, y, z) {
    mat4.scale(this.modelMatrix, this.modelMatrix, [x, y, z]);
  }

  createProgram(gl, vsSource, fsSource) {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(vs));
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(fs));
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }

    return program;
  }

  draw(camera) {
    const gl = this.gl;
    gl.useProgram(this.program);

    const now = performance.now();
    const timeInSeconds = now / 1000.0;
    // Активируем и связываем буфер вершин
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(this.attribLocations.position);
    gl.vertexAttribPointer(
      this.attribLocations.position,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    // Активируем и связываем буфер текстурных координат
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.enableVertexAttribArray(this.attribLocations.texcoord);
    gl.vertexAttribPointer(
      this.attribLocations.texcoord,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    // Устанавливаем uniform-переменные для матриц
    gl.uniformMatrix4fv(this.uniformLocations.model, false, this.modelMatrix);
    gl.uniformMatrix4fv(
      this.uniformLocations.view,
      false,
      camera.getViewMatrix()
    );
    gl.uniformMatrix4fv(
      this.uniformLocations.proj,
      false,
      camera.getProjectionMatrix()
    );
    gl.uniform1f(this.uniformLocations.time, timeInSeconds);

    // Активируем текстуру
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uniformLocations.texture, 0);

    // Отрисовываем объект
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_INT, 0);
  }

  // ... draw() остаётся без изменений ...
}
