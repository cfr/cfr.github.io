
precision mediump float;

varying vec2 vUV;
uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;

const float pi = 3.1416;

vec3 hsl2rgb3(vec3 hsl) {
    vec3 rgb = clamp(abs(mod(hsl.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return hsl.z + hsl.y * (rgb - 0.5) * (1.0 - abs(2.0 * hsl.z - 1.0));
}

vec4 hsl2rgb(vec4 hsl) {
    return vec4(hsl2rgb3(hsl.xyz), hsl.w);
}

vec3 rgb2hsl3(vec3 rgb) {
    float cMax = max(rgb.r, max(rgb.g, rgb.b));
    float cMin = min(rgb.r, min(rgb.g, rgb.b));
    float delta = cMax - cMin;
    float L = (cMax + cMin) * 0.5;
    float H = 0.0;
    float S = 0.0;
    if (delta > 0.0) {
        if (cMax == rgb.r) {
            H = mod((rgb.g - rgb.b) / delta, 6.0);
        } else if (cMax == rgb.g) {
            H = (rgb.b - rgb.r) / delta + 2.0;
        } else {
            H = (rgb.r - rgb.g) / delta + 4.0;
        }
        H /= 6.0;
        if (H < 0.0) H += 1.0;
        float denom = 1.0 - abs(2.0 * L - 1.0);
        S = (denom > 0.0) ? delta / denom : 0.0;
    }
    return vec3(H, S, L);
}

vec4 rgb2hsl(vec4 rgb) {
    return vec4(rgb2hsl3(rgb.xyz), rgb.w);
}

// based on balatro polychrome shader
vec4 poly(vec4 tex, vec2 uv, vec2 a)
{
    float low    = min(tex.r, min(tex.g, tex.b));
    float high   = max(tex.r, max(tex.g, tex.b));
    float chroma = high - low;

    float desaturate = 1.0 - max(0.0, 0.05 * (1.1 - chroma));
    vec4 hsl = rgb2hsl(vec4(tex.r * desaturate, tex.g * desaturate, tex.b, tex.a));

    float t = a.y * 2.221;

    vec2 p1 = uv + 50.0 * vec2(sin(-t / 143.6340), cos(-t / 99.4324));
    vec2 p2 = uv + 50.0 * vec2(cos( t /  53.1532), cos( t / 61.4532));
    vec2 p3 = uv + 50.0 * vec2(sin(-t /  87.5322), sin(-t / 49.0000));

    float plasma = (1.0 + (
          cos(length(p1) / 19.483)
        + sin(length(p2) / 33.155) * cos(p2.y / 15.73)
        + cos(length(p3) / 27.193) * sin(p3.x / 21.92)
        )) / 2.0;

    float hueShift = 0.5 + 0.5 * cos(a.x * 2.612 + (plasma - 0.5) * 3.14);

    hsl.x += hueShift + a.y * 0.04;
    hsl.y  = min(0.6, hsl.y + 0.5);

    tex.rgb = hsl2rgb(hsl).rgb;

    return tex;
}

void main() {
    vec2 uv = vUV;
    vec4 tex = texture2D(uTexture, uv);
    float time = uTime * 0.4;
    vec2 a = mix(vec2(time, fract(time) + pi), uMouse, uHover);
    gl_FragColor = poly(tex, uv - 0.5, a);
}

