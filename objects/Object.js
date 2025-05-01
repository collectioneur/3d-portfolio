import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";
import { GLTFLoader } from "../core/GLTFLoader.js";

let vertexSource = `
  attribute vec3 a_position;
  attribute vec2 a_texcoord;
  attribute vec3 a_normal;

  varying vec2 v_texcoord;
  varying vec3 v_normal;

  uniform mat4 u_model;
  uniform mat4 u_view;
  uniform mat4 u_proj;
  uniform float u_time;

  void main() {
  vec4 pos = vec4(a_position, 1.0);
    vec4 worldPos = u_model * pos;
    v_texcoord = a_texcoord;
    v_normal = mat3(u_model) * a_normal;
    gl_Position = u_proj * u_view  * worldPos;
  }
`;

let fragmentSource = `
  precision mediump float;

  varying vec2 v_texcoord;
  varying vec3 v_normal;
  uniform vec3 u_reverseLightDirection;
  uniform sampler2D u_texture;

  void main() {
   vec3 normal = normalize(v_normal);
   vec3 reverseLightDirection = normalize(u_reverseLightDirection);
   float light = dot(normal, reverseLightDirection);
    if (light < 0.0) {
      light = 0.0;
}
    gl_FragColor = texture2D(u_texture, v_texcoord);
    gl_FragColor.rgb *= light * 3.0;
  }
`;

export class Object {
  constructor(
    gl,
    textureImage,
    { vertices, texCoords, indices, normals },
    vert,
    frag
  ) {
    this.gl = gl;
    this.modelMatrix = mat4.create();
    this.reverseLightDirection = [-0.5, 1, 1];
    vertexSource = vert || vertexSource;
    fragmentSource = frag || fragmentSource;

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

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    this.vertexCount = indices.length;
    console.log(vertices);

    this.program = this.createProgram(gl, vertexSource, fragmentSource);
    this.attribLocations = {
      position: gl.getAttribLocation(this.program, "a_position"),
      texcoord: gl.getAttribLocation(this.program, "a_texcoord"),
      normal: gl.getAttribLocation(this.program, "a_normal"),
    };
    this.uniformLocations = {
      model: gl.getUniformLocation(this.program, "u_model"),
      view: gl.getUniformLocation(this.program, "u_view"),
      proj: gl.getUniformLocation(this.program, "u_proj"),
      texture: gl.getUniformLocation(this.program, "u_texture"),
      time: gl.getUniformLocation(this.program, "u_time"),
      reverseLightDirection: gl.getUniformLocation(
        this.program,
        "u_reverseLightDirection"
      ),
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

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.enableVertexAttribArray(this.attribLocations.normal);
    gl.vertexAttribPointer(
      this.attribLocations.normal,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

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

    gl.uniform3fv(
      this.uniformLocations.reverseLightDirection,
      this.reverseLightDirection
    );
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

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uniformLocations.texture, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_INT, 0);
  }

  static loadFromGLTF(gl, url, vert, frag, { scale, translate, rotate } = {}) {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const meshes = [];
          gltf.scene.traverse((child) => child.isMesh && meshes.push(child));
          if (!meshes.length) return reject(new Error("Mesh not found"));

          let objectList = [];
          for (let m of meshes) {
            console.log(m);
            const geom = m.geometry;
            const data = {
              vertices: Array.from(geom.attributes.position.array),
              normals: Array.from(geom.attributes.normal.array),
              texCoords: Array.from(geom.attributes.uv.array),
              indices: Array.from(geom.index.array),
            };
            const img = m.material.map?.image || null;

            const obj = new Object(gl, img, data, vert, frag);
            if (scale) obj.scale(...scale);
            if (translate) obj.translate(...translate);
            if (rotate) {
              const [rx, ry, rz] = rotate.map((d) => (d * Math.PI) / 180);
              obj.rotate(rx, ry, rz);
            }
            objectList.push(obj);
          }

          resolve(objectList);
        },
        undefined,
        (err) => reject(err)
      );
    });
  }
}
