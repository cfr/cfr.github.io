
precision mediump float;

varying vec2 vUV;
uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;

const float pi = 3.1416;

void main() {
    vec2 uv = vUV;
    float folds = 3.5 + max(0.0, 5.0*uMouse.y*uHover);
    const float speed = 2.0;
    const float amplitude = 0.07;
    float x = 1.0 - uv.x;
    float t = mix(uTime * speed, uMouse.x * pi * folds, uHover);
    float phase = x * pi * folds + t;
    float wave = sin(phase) * x;
    uv.y += wave * amplitude;
    uv.x += x * cos(phase) * amplitude * 0.2;
    float light = 1.0 + 0.25 * cos(phase);
    vec4 color = texture2D(uTexture, uv);
    gl_FragColor = vec4(light * color.rgb, color.a);
}

