
precision mediump float;
varying vec2 vUV;
uniform sampler2D uTexture;
uniform float uTime;
const float PI = 3.14159265359;

void main() {
    vec2 uv = vUV;
    const float folds = 3.5;
    const float speed = 2.0;
    const float amplitude = 0.07;
    float x = 1.0 - uv.x;
    float phase = x * PI * folds + uTime * speed;
    float wave = sin(phase) * x;
    uv.y += wave * amplitude;
    uv.x += x * cos(phase) * amplitude * 0.2;
    float light = 1.0 + 0.25 * cos(phase);
    vec4 color = texture2D(uTexture, uv);
    gl_FragColor = vec4(light * color.rgb, color.a);
}

