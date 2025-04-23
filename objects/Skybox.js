export class Skybox {
  constructor(gl) {
    this.gl = gl;

    const vertexSource = `
      attribute vec3 a_position;
      varying vec3 v_texCoord;
      
      uniform mat4 u_viewMatrix;
      uniform mat4 u_projectionMatrix;
      
      void main() {
        // Используем позицию вершины как текстурные координаты
        v_texCoord = a_position;
        
        // Удаляем компонент перемещения из матрицы вида
        mat4 view = u_viewMatrix;
        view[3][0] = 0.0;
        view[3][1] = 0.0;
        view[3][2] = 0.0;
        
        // Применяем только поворот камеры, игнорируя перемещение
        vec4 pos = u_projectionMatrix * view * vec4(a_position, 1.0);
        
        // Устанавливаем z-компоненту в w, чтобы skybox всегда был на заднем плане
        gl_Position = vec4(pos.xy, pos.w, pos.w);
      }
    `;

    // Фрагментный шейдер для кубического skybox
    const fragmentSource = `
      precision highp float;
varying vec3 v_texCoord;

uniform samplerCube u_skybox;
uniform float u_time;

float rand(vec3 co) {
  return fract(sin(dot(co, vec3(12.9898, 78.233, 45.164))) * 48.5453);
}

void main() {
  vec4 color = textureCube(u_skybox, v_texCoord);

  // "Случайное" значение для этой точки, чтобы звёзды мерцали не одинаково
  float noise = rand(v_texCoord);

  // Мерцание — синус от времени + шум (чтобы звезды мерцали в разное время)
  float twinkle = 0.6 + 0.4 * sin(u_time * 5.0 + noise * 10.0);

  // Увеличим эффект только для ярких пикселей (звёзд)
  float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114)); // восприятие яркости
  if (brightness > 0.5 * noise) {
    color.rgb *= mix(0.5, 2.0, twinkle); // изменяем яркость
  }

  gl_FragColor = color;
}

    `;

    this.program = this.createProgram(gl, vertexSource, fragmentSource);
    this.timeLocation = gl.getUniformLocation(this.program, "u_time");

    // Создаем вершины куба
    const cubeVertices = new Float32Array([
      // Передняя грань
      -1000.0, -1000.0, 1000.0, 1000.0, -1000.0, 1000.0, 1000.0, 1000.0, 1000.0,
      -1000.0, 1000.0, 1000.0,
      // Задняя грань
      -1000.0, -1000.0, -1000.0, -1000.0, 1000.0, -1000.0, 1000.0, 1000.0,
      -1000.0, 1000.0, -1000.0, -1000.0,
      // Верхняя грань
      -1000.0, 1000.0, -1000.0, -1000.0, 1000.0, 1000.0, 1000.0, 1000.0, 1000.0,
      1000.0, 1000.0, -1000.0,
      // Нижняя грань
      -1000.0, -1000.0, -1000.0, 1000.0, -1000.0, -1000.0, 1000.0, -1000.0,
      1000.0, -1000.0, -1000.0, 1000.0,
      // Правая грань
      1000.0, -1000.0, -1000.0, 1000.0, 1000.0, -1000.0, 1000.0, 1000.0, 1000.0,
      1000.0, -1000.0, 1000.0,
      // Левая грань
      -1000.0, -1000.0, -1000.0, -1000.0, -1000.0, 1000.0, -1000.0, 1000.0,
      1000.0, -1000.0, 1000.0, -1000.0,
    ]);

    // Создаем индексы для треугольников
    const indices = new Uint16Array([
      0,
      1,
      2,
      0,
      2,
      3, // Передняя грань
      4,
      5,
      6,
      4,
      6,
      7, // Задняя грань
      8,
      9,
      10,
      8,
      10,
      11, // Верхняя грань
      12,
      13,
      14,
      12,
      14,
      15, // Нижняя грань
      16,
      17,
      18,
      16,
      18,
      19, // Правая грань
      20,
      21,
      22,
      20,
      22,
      23, // Левая грань
    ]);

    // Создаем буферы
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Получаем локации атрибутов и униформов
    this.positionLocation = gl.getAttribLocation(this.program, "a_position");
    this.viewMatrixLocation = gl.getUniformLocation(
      this.program,
      "u_viewMatrix"
    );
    this.projectionMatrixLocation = gl.getUniformLocation(
      this.program,
      "u_projectionMatrix"
    );
    this.skyboxLocation = gl.getUniformLocation(this.program, "u_skybox");

    // Создаем текстуру куба
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

    // Загружаем текстуры для каждой грани куба
    this.loadCubemap([
      "textures/skybox/right.png", // положительный X
      "textures/skybox/left.png", // отрицательный X
      "textures/skybox/top.png", // положительный Y
      "textures/skybox/bottom.png", // отрицательный Y
      "textures/skybox/front.png", // положительный Z
      "textures/skybox/back.png", // отрицательный Z
    ]);
  }

  loadCubemap(urls) {
    const gl = this.gl;
    const targets = [
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    ];

    // Устанавливаем временные текстуры для каждой грани
    for (let i = 0; i < 6; i++) {
      gl.texImage2D(
        targets[i],
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255])
      );
    }

    // Загружаем текстуры
    urls.forEach((url, i) => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        gl.texImage2D(targets[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      };
      image.src = url;
    });

    // Устанавливаем параметры текстуры
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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

  draw(viewMatrix, projectionMatrix, time) {
    const gl = this.gl;
    gl.useProgram(this.program);

    // Отключаем запись в буфер глубины
    gl.depthFunc(gl.LEQUAL);

    // Устанавливаем матрицы
    gl.uniformMatrix4fv(this.viewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(this.projectionMatrixLocation, false, projectionMatrix);

    // Привязываем текстуру
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    gl.uniform1i(this.skyboxLocation, 0);
    gl.uniform1f(this.timeLocation, time);

    // Рисуем куб
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    // Восстанавливаем настройки глубины
    gl.depthFunc(gl.LESS);
  }
}
