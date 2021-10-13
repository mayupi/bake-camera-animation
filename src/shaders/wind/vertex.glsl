
uniform float uTime;

void main() {
  vec3 pos = position;
  float z = clamp(pos.z, -2.0, 2.0);
  float dy = sin(z + uTime * 3.0) * 0.35 * z;
  pos.y += dy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}