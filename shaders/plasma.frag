#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUV;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = vUV;

    float t = mod(uTime, 6283.0) * 0.10;

    float v = 0.0;
    vec2 p = uv * 4.0 - 2.0;
    v += sin(p.x * cos(t / 3.0) + p.y * sin(t / 4.0) + t) * 0.55;
    v += sin(p.y * cos(t / 3.5) + p.x * sin(t / 5.0) - t * 0.7) * 0.40;
    vec2 q = uv * 9.0 - 4.5;
    v += sin(q.y * cos(t / 2.5) + q.x * sin(t / 2.0) + t * 1.2) * 0.35;
    v += sin(length(q) * 2.2 - t * 0.8) * 0.30;
    vec2 r = uv * 13.0 - 6.5;
    v += sin(r.x * 0.7 + r.y * 0.9 + t * 1.6) * 0.18;

    const float amp = 0.55 + 0.40 + 0.35 + 0.30 + 0.18;
    float plasma = clamp(v / amp * 0.5 + 0.5, 0.0, 1.0);

    float dither = (hash(gl_FragCoord.xy + t) - 0.5) / 96.0;
    plasma = clamp(plasma + dither - 0.5, 0.0, 1.0);

    vec3 color = mix(uColor1, uColor2, plasma);
    gl_FragColor = vec4(color, 1.0);
}

