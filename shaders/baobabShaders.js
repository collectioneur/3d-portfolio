export const vertexSource = `
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
  if (a_position.y > 0.0) {
    pos.x += sin(u_time) * a_position.y * 0.05;
    pos.z += cos(u_time) * a_position.y * 0.1;
  }
    vec4 worldPos = u_model * pos;
    v_texcoord = a_texcoord;
    v_normal = mat3(u_model) * a_normal;
    gl_Position = u_proj * u_view  * worldPos;
  }
`;

export const fragmentSource = `
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
    gl_FragColor.rgb *= light * 0.8 + 0.2;
  }
`;
