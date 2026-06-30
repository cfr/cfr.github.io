
function initBG(doc, fragmentShader) {
    const container = doc.getElementById('bg');
    if (!container) return;

    const canvas = doc.createElement('canvas');
    var w = Math.min(window.innerWidth, 1280);
    var h = Math.min(window.innerHeight, 1280);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    function getGLContext(c) {
        const attrs = { alpha: true, failIfMajorPerformanceCaveat: false };
        const names = ['webgl', 'experimental-webgl', 'webgl2'];
        for (const name of names) {
            try {
                const ctx = c.getContext(name, attrs);
                if (ctx) return ctx;
            } catch (e) { /* try next */ }
        }
        return null;
    }

    const gl = getGLContext(canvas);
    if (!gl) return;

    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }, false);
    canvas.addEventListener('webglcontextrestored', () => {
        setupProgram(fragmentShader);
    }, false);

    const vsSrc = `
        attribute vec2 aPosition;
        attribute vec2 aUV;
        varying vec2 vUV;
        void main() {
            gl_Position = vec4(aPosition, 0.0, 1.0);
            vUV = aUV;
        }
    `;

    const compile = (src, type) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error('BG shader error:', gl.getShaderInfoLog(s));
            return null;
        }
        return s;
    };

    const vs = compile(vsSrc, gl.VERTEX_SHADER);

    const data = new Float32Array([
        -1, -1,  1, 1,
         1, -1,  0, 1,
        -1,  1,  1, 0,
        -1,  1,  1, 0,
         1, -1,  0, 1,
         1,  1,  0, 0,
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    let prog, fs, posLoc, uvLoc, timeLoc, c1Loc, c2Loc;

    function setupProgram(fsSrc) {
        if (prog) gl.deleteProgram(prog);
        if (fs) gl.deleteShader(fs);

        prog = gl.createProgram();
        gl.attachShader(prog, vs);
        fs = compile(fsSrc, gl.FRAGMENT_SHADER);
        if (!fs) return;
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        gl.useProgram(prog);

        posLoc = gl.getAttribLocation(prog, 'aPosition');
        uvLoc  = gl.getAttribLocation(prog, 'aUV');
        timeLoc = gl.getUniformLocation(prog, 'uTime');
        c1Loc = gl.getUniformLocation(prog, 'uColor1');
        c2Loc = gl.getUniformLocation(prog, 'uColor2');

        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(posLoc);
        gl.enableVertexAttribArray(uvLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(uvLoc,  2, gl.FLOAT, false, 16, 8);
    }

    setupProgram(fragmentShader);

    let color1 = [0.0, 0.0, 0.0];
    let color2 = [0.0, 0.0, 0.0];

    function render() {
        requestAnimationFrame(render);
        if (gl.isContextLost()) return;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(timeLoc, performance.now() / 1000);
        gl.uniform3fv(c1Loc, color1);
        gl.uniform3fv(c2Loc, color2);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(render);

    return {
        setColors: (c1, c2) => { color1 = c1; color2 = c2; },
    };
}
