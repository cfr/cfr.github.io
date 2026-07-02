precision mediump float;

varying vec2 vUV;
uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;

float tex(sampler2D t, vec2 uv) {
    return length(texture2D(t, uv).rgb);
}

vec3 normal(sampler2D t, vec2 px, vec2 uv) {
    vec2 du = vec2(px.x, 0.0);
    vec2 dv = vec2(0.0, px.y);

    float r = tex(t, uv + du);
    float l = tex(t, uv - du);
    float u = tex(t, uv + dv);
    float d = tex(t, uv - dv);

    float dx = (r - l) / (2.0*du.x);
    float dy = (u - d) / (2.0*dv.y);
    float dz = 100.0;

    vec3 n = vec3(-dx, -dy, dz);
    return normalize(n);
}

float phong(vec2 uv, vec3 n, vec3 ldir) {
    float nl = dot(n, ldir);
    float diff = max(nl, 0.0);

    vec3 eye = vec3(0.0, 0.0, 0.0);
    vec3 pt = vec3(uv - 0.5, -1.0);
    vec3 eyedir = normalize(eye - pt);
    vec3 halfvec = normalize(ldir + eyedir);
    float nh = dot(n, halfvec);
    float shiny = 30.0;
    float spec = pow(max(nh, 0.0), shiny);

    return diff + spec;
}

void main() {
    vec2 px = vec2(0.0039); // 1/texsize = 1/256
    vec2 uv = vUV;
    vec4 tex = texture2D(uTexture, uv);
    if (tex.a < 0.1) {
        gl_FragColor = tex;
        return;
    }

    vec3 n = normal(uTexture, px, uv);
    vec2 aTime = 0.3*vec2(sin(2.0*uTime), cos(2.0*uTime) + 0.5);
    vec2 a = mix(aTime, 1.0 - uMouse, uHover);
    vec3 ldir = normalize(vec3(a - 0.5, 0.1));
    float p = phong(uv, n, ldir);
    gl_FragColor = vec4(vec3(p), 1.0);
}

