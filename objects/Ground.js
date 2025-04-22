import { mat4 } from "https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js";

const vertexSource = `
  attribute vec3 a_position;
  uniform mat4 u_model;
  uniform mat4 u_view;
  uniform mat4 u_proj;

  varying vec3 v_pos;

  void main() {
    vec4 worldPos = u_model * vec4(a_position, 1.0);
    v_pos = worldPos.xyz;
    gl_Position = u_proj * u_view * worldPos;
  }
`;

const fragmentSource = `
  precision mediump float;

varying vec3 v_pos;
uniform float u_time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float grass(vec2 uv, float time, out float randomColorFactor) {
  float density = 120.0;
  uv *= density;

  float wind = sin(uv.x * 0.1 + time * 1.5) * 0.2;
  uv.y += wind;

  vec2 cell = floor(uv);
  vec2 local = fract(uv);

  float rnd = hash(cell);
  randomColorFactor = rnd; // передаём в цвет

  float angle = rnd * 6.2831;
  float s = sin(angle);
  float c = cos(angle);
  local = mat2(c, -s, s, c) * (local - 0.5) + 0.5;

  float blade = smoothstep(0.4, 0.5, abs(local.x - 0.5)) *
                smoothstep(0.0, 0.05 + rnd * 0.2, local.y);

  return 1.0 - blade;
}

void main() {
  vec2 uv = v_pos.xz * 0.3;

  float colorVar = 0.0;
  float g = grass(uv, u_time, colorVar); // передаём ссылку на рандом

  // базовый цвет и вариации
  vec3 base1 = vec3(0.2, 0.4, 0.3); // яркая трава
  vec3 base2 = vec3(0.1, 0.5, 0.2); // тёмная
  vec3 base3 = vec3(0.3, 0.3, 0.4); // светлая

  // Смешиваем по цветовой случайности
  vec3 randomColor = mix(base1, base2, smoothstep(0.2, 0.8, colorVar));
  randomColor = mix(randomColor, base3, sin(colorVar * 10.0 + u_time * 0.5) * 0.5 + 0.5);

  // затемняем по форме травы (g)
  vec3 final = mix(randomColor * 0.5, randomColor, g);

  gl_FragColor = vec4(final, 1.0);
}


`;

export class Ground {
  constructor(gl) {
    this.gl = gl;
    this.modelMatrix = mat4.create();

    // Плоскость (2 треугольника)
    const positions = new Float32Array([
      -20, 0, -20, 20, 0, -20, 20, 0, 20, -20, 0, 20,
    ]);
    const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    this.vertexCount = indices.length;

    // Компиляция шейдеров
    this.program = this.createProgram(gl, vertexSource, fragmentSource);
    this.attribLocations = {
      position: gl.getAttribLocation(this.program, "a_position"),
    };
    this.uniformLocations = {
      model: gl.getUniformLocation(this.program, "u_model"),
      view: gl.getUniformLocation(this.program, "u_view"),
      proj: gl.getUniformLocation(this.program, "u_proj"),
      time: gl.getUniformLocation(this.program, "u_time"),
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

  draw(camera, time) {
    const gl = this.gl;
    gl.useProgram(this.program);

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

    gl.uniformMatrix4fv(this.uniformLocations.model, false, this.modelMatrix);
    gl.uniformMatrix4fv(this.uniformLocations.view, false, camera.viewMatrix);
    gl.uniformMatrix4fv(
      this.uniformLocations.proj,
      false,
      camera.projectionMatrix
    );
    gl.uniform1f(this.uniformLocations.time, time);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
  }
}
