
precision mediump float;

varying vec2 vUV;
uniform sampler2D uTexture;
uniform float uTime;

const float pi = 3.14;
const float N = 8.0;

vec2 flipy(vec2 uv) {
    return vec2(uv.x, 1.0 - uv.y);
}

vec2 getPoint(vec2 corner, float size, float time, float l) {
    vec2 point = corner + size * 0.5;
    float t = 3.0 * mod(time, 2.0*pi);
    float x = sin(t + pi*0.5);
    float y = sin(2.0 * t);
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
            vec2 pt = getPoint(adjCorner, size, uTime*0.3, lum);

            float ptSize = size * lum * lum / 4.0;
            ptSize = max(size / 5.0, ptSize);

            if (donut(pt, uv, ptSize*0.3, ptSize) && lum > 0.5) {
                gl_FragColor = tex;
                return;
            }
        }
    }
    gl_FragColor.a = 0.0;
}

