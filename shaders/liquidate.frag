
precision mediump float;

varying vec2 vUV;
uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;

const float pi = 3.1416;

void main() {
    const float timeScale = 0.25;
    vec4 tex = texture2D(uTexture, vUV);
    float time = timeScale*uTime;
    float st = sin(time);
    float ct = cos(time);
    vec2 t = mix(st*vec2(ct, st), uMouse, uHover);
    vec2 uv = vUV + t * tex.rg;
    gl_FragColor = texture2D(uTexture, uv);
}

