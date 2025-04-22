import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

const vertexSource = `
  attribute vec3 a_position;
  attribute vec2 a_texcoord;

  varying vec2 v_texcoord;

  uniform mat4 u_model;
  uniform mat4 u_view;
  uniform mat4 u_proj;

  void main() {
    vec4 worldPos = u_model * vec4(a_position, 1.0);
    v_texcoord = a_texcoord;
    gl_Position = u_proj * u_view * worldPos;
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

export class Ground {
  constructor(gl, textureUrl) {
    this.gl = gl;
    this.modelMatrix = mat4.create();

    // Позиции (x, y, z)
    const positions = new Float32Array([
      -2,
      0,
      -2, // 0
      2,
      0,
      -2, // 1
      2,
      0,
      2, // 2
      -2,
      0,
      2, // 3
    ]);

    // Текстурные координаты (u, v)
    const texCoords = new Float32Array([
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    ]);

    const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);

    // Буфер вершин
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Буфер текстурных координат
    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    // Буфер индексов
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    this.vertexCount = indices.length;

    // Компиляция шейдеров
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
    };

    // Загрузка текстуры
    this.texture = gl.createTexture();
    const image = new Image();
    image.src = textureUrl;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
      gl.generateMipmap(gl.TEXTURE_2D);
    };
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

    // Позиции
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

    // Текстурные координаты
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

    // Матрицы
    gl.uniformMatrix4fv(this.uniformLocations.model, false, this.modelMatrix);
    gl.uniformMatrix4fv(this.uniformLocations.view, false, camera.viewMatrix);
    gl.uniformMatrix4fv(
      this.uniformLocations.proj,
      false,
      camera.projectionMatrix
    );

    // Текстура
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uniformLocations.texture, 0);

    // Отрисовка
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
  }
}
