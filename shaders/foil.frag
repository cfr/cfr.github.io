
precision mediump float;

varying vec2 vUV;
uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;

const float pi = 3.1416;

vec2 mixAngle(vec2 base, vec2 target, float k) {
    vec2 diff = mod(target - base + vec2(pi), 2.0 * pi) - pi;
    return base + k * diff;
}

// based on balatro foil shader
vec4 foil(vec4 tex, vec2 uv, vec2 a)
{
    float low      = min(tex.r, min(tex.g, tex.b));
    float high     = max(tex.r, max(tex.g, tex.b));
    float strength = min(high, max(0.5, 1.0 - low));

    float dist  = length(90.0 * uv);
    float dist2 = length(113.1121 * uv);
    float ripplePhase = dist + a.x * 2.0 + 3.0 * (1.0 + 0.8 * cos(dist2 - a.x * 3.121));
    float band1 = clamp(2.0 * sin(ripplePhase) - 1.0 - max(5.0 - dist, 0.0), 0.0, 1.0);

    vec2  axis  = vec2(cos(a.x * 0.1221), sin(a.x * 0.3512));
    float angle = dot(axis, uv) / (length(axis) * length(uv));
    float sweepFreq = 2.2 + 0.9 * sin(a.x * 1.65 + 0.2 * a.y);
    float band2 = clamp(5.0 * cos(a.y * 0.3 + angle * 3.14 * sweepFreq) - 4.0 - max(2.0 - length(20.0 * uv), 0.0), 0.0, 1.0);

    float band3 = 0.3 * clamp(2.0 * sin(a.x * 5.00 + uv.x * 3.0 + 3.0 * (1.0 + 0.5 * cos(a.x * 7.000))) - 1.0, -1.0, 1.0);
    float band4 = 0.3 * clamp(2.0 * sin(a.x * 6.66 + uv.y * 3.8 + 3.0 * (1.0 + 0.5 * cos(a.x * 3.414))) - 1.0, -1.0, 1.0);

    float brightest = max(max(band1, band2), max(max(band3, band4), 0.0));
    float shimmer   = max(brightest + 2.2 * (band1 + band2 + band3 + band4), 0.0);

    tex.r += -strength + strength * shimmer * 0.3;
    tex.g += -strength + strength * shimmer * 0.3;
    tex.b +=             strength * shimmer * 1.9;

    tex.a = min(tex.a, 0.3 * tex.a + 0.9 * min(0.5, shimmer * 0.1));

    return tex;
}

void main() {
    vec2 uv = vUV;
    vec4 tex = texture2D(uTexture, uv);
    vec2 a = mixAngle(vec2(uTime, uTime + pi), uMouse * vec2(3.0, 11.0), uHover);
    gl_FragColor = tex + foil(tex, uv - 0.5, a);
}

