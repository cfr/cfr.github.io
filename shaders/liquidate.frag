
precision mediump float;
varying vec2 vUV;
uniform sampler2D uTexture;
uniform float uTime;

void main() {
    const float timeScale = 0.1;
    vec4 tex = texture2D(uTexture, vUV);
    float st = sin(uTime*timeScale);
    float ct = cos(uTime*timeScale);
    vec2 uv = vUV + st*vec2(ct, st) * tex.rg;
    gl_FragColor = texture2D(uTexture, uv);
}

