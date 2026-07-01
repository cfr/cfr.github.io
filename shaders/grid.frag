
precision mediump float;

varying vec2 vUV;
uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;

const float pi = 3.1416;
const float N = 32.0;

vec2 flipy(vec2 uv) {
    return vec2(uv.x, 1.0 - uv.y);
}

vec2 getPoint(vec2 corner, float size, vec2 time, float l) {
    vec2 point = corner + size * 0.5;
    vec2 t = mod(time, 2.0*pi);
    float x = sin(t.x + pi*0.5);
    float y = sin(2.0 * t.y);
    float a = 0.2*size * l;
    point += a * vec2(x, y);
    return point;
}

bool donut(vec2 pt, vec2 uv, float inner, float outer) {
    float d = distance(pt, uv);
    return d > inner && d < outer;
}

void main() {
    vec2 uv = vUV;
    const float size = 1.0 / N;
    vec2 corner = floor(uv.xy * N)*size;
    const float tmax = pi / 4.0;
    const float adj = 3.0;
    for (float x = -adj; x <= adj; x += 1.0) {
        for (float y = -adj; y <= adj; y += 1.0) {
            vec2 adjCorner = corner + vec2(x,y)*size;
            vec4 tex = texture2D(uTexture, flipy(adjCorner));

            float lum = length(tex.rgb);
            vec2 t = mix(vec2(uTime), uMouse * pi, uHover);
            vec2 pt = getPoint(adjCorner, size, t, lum);

            float ptSize = size * lum * lum / 3.0;
            ptSize = max(size / 3.0, ptSize);

            if (donut(pt, uv, ptSize*0.3, ptSize) && lum > 0.2) {
                gl_FragColor = tex;
                return;
            }
        }
    }
    gl_FragColor = vec4(0.0);
}

