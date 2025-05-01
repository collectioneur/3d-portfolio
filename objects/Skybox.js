export class Skybox {
  constructor(gl) {
    this.gl = gl;

    const vertexSource = `
      attribute vec3 a_position;
      varying vec3 v_texCoord;
      
      uniform mat4 u_viewMatrix;
      uniform mat4 u_projectionMatrix;
      
      void main() {
        v_texCoord = a_position;
        
        mat4 view = u_viewMatrix;
        view[3][0] = 0.0;
        view[3][1] = 0.0;
        view[3][2] = 0.0;

        vec4 pos = u_projectionMatrix * view * vec4(a_position, 1.0);
        gl_Position = vec4(pos.xy, pos.w, pos.w);
      }
    `;

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

        float noise = rand(v_texCoord);


        float twinkle = 0.6 + 0.4 * sin(u_time * 5.0 + noise * 10.0);


        float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        if (brightness > 0.5 * noise) {
          color.rgb *= mix(0.5, 2.0, twinkle);
        }

        if (v_texCoord.y < 250.0) {
          float x1 = 40.0 * sin(v_texCoord.x / 70.0 + u_time * 0.03);
          float x2 = 30.0 * sin(v_texCoord.x / 80.0 - u_time * 0.05 + 10.0);
          float x3 = -abs(60.0 * sin(v_texCoord.x / 100.0 + u_time * 0.01 + 5.0)) + 40.0;
          float profileX = max(x1, max(x2, x3));

          float z1 = 30.0 * sin(v_texCoord.z / 70.0 + u_time * 0.03);
          float z2 = 40.0 * sin(v_texCoord.z / 90.0 - u_time * 0.05 + 10.0);
          float z3 = -abs(60.0 * sin(v_texCoord.z / 120.0 + u_time * 0.01 + 5.0)) + 50.0;
          float profileZ = max(z1, max(z2, z3));

          float mountainProfile = (v_texCoord.x == 1000.0 || v_texCoord.x == -1000.0 ? 0.0 : profileX) +
          (v_texCoord.z == 1000.0 || v_texCoord.z == -1000.0 ? 0.0 : profileZ) + 3.0 * rand(v_texCoord / 100.0) + 50.0;

          if(v_texCoord.y < mountainProfile) {
            float depth = mountainProfile - v_texCoord.y;
            float alpha = smoothstep(0.0, 20.0, depth);
            float t = clamp(depth / 50.0, 0.0, 1.0);
            t = smoothstep(0.0, 1.0, t);
            vec3 baseColor = vec3(0.05, 0.05, 0.05);
            vec3 peakColor = vec3(0., 0., 0.);
            color.rgb = mix(color.rgb, peakColor, alpha);
          }
        }
      
        gl_FragColor = color;
      }
    `;

    this.program = this.createProgram(gl, vertexSource, fragmentSource);
    this.timeLocation = gl.getUniformLocation(this.program, "u_time");

    const cubeVertices = new Float32Array([
      -1000.0, -1000.0, 1000.0, 1000.0, -1000.0, 1000.0, 1000.0, 1000.0, 1000.0,
      -1000.0, 1000.0, 1000.0, -1000.0, -1000.0, -1000.0, -1000.0, 1000.0,
      -1000.0, 1000.0, 1000.0, -1000.0, 1000.0, -1000.0, -1000.0, -1000.0,
      1000.0, -1000.0, -1000.0, 1000.0, 1000.0, 1000.0, 1000.0, 1000.0, 1000.0,
      1000.0, -1000.0, -1000.0, -1000.0, -1000.0, 1000.0, -1000.0, -1000.0,
      1000.0, -1000.0, 1000.0, -1000.0, -1000.0, 1000.0, 1000.0, -1000.0,
      -1000.0, 1000.0, 1000.0, -1000.0, 1000.0, 1000.0, 1000.0, 1000.0, -1000.0,
      1000.0, -1000.0, -1000.0, -1000.0, -1000.0, -1000.0, 1000.0, -1000.0,
      1000.0, 1000.0, -1000.0, 1000.0, -1000.0,
    ]);

    const indices = new Uint16Array([
      0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12,
      14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
    ]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

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

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

    this.loadCubemap([
      "textures/skybox/right.png",
      "textures/skybox/left.png",
      "textures/skybox/top.png",
      "textures/skybox/bottom.png",
      "textures/skybox/front.png",
      "textures/skybox/back.png",
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

    urls.forEach((url, i) => {
      const image = new Image();
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        gl.texImage2D(targets[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      };
      image.src = url;
    });

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

    gl.depthFunc(gl.LEQUAL);

    gl.uniformMatrix4fv(this.viewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(this.projectionMatrixLocation, false, projectionMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    gl.uniform1i(this.skyboxLocation, 0);
    gl.uniform1f(this.timeLocation, time);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    gl.depthFunc(gl.LESS);
  }
}
