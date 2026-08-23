
function initBG(doc, fragmentShader) {
    const container = doc.getElementById('bg');
    if (!container) return;

    const canvas = doc.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    function getCanvasSize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        return {
            w: Math.min(Math.max(1, Math.round(window.innerWidth * dpr)), 2560),
            h: Math.min(Math.max(1, Math.round(window.innerHeight * dpr)), 2560),
        };
    }

    const initialSize = getCanvasSize();
    canvas.width = initialSize.w;
    canvas.height = initialSize.h;

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

    const vsSrc = `
        attribute vec2 aPosition;
        attribute vec2 aUV;
        varying vec2 vUV;
        void main() {
            gl_Position = vec4(aPosition, 0.0, 1.0);
            vUV = aUV;
        }
    `;

    const quadData = new Float32Array([
        -1, -1,  1, 1,
         1, -1,  0, 1,
        -1,  1,  1, 0,
        -1,  1,  1, 0,
         1, -1,  0, 1,
         1,  1,  0, 0,
    ]);

    const compile = (src, type) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error('BG shader error:', gl.getShaderInfoLog(s));
            gl.deleteShader(s);
            return null;
        }
        return s;
    };

    let vs = null, buf = null;
    let prog = null, fs = null;
    let posLoc, uvLoc, timeLoc, c1Loc, c2Loc;
    let currentSrc = fragmentShader;

    function setupProgram(fsSrc) {
        if (!vs) return false;

        const newFs = compile(fsSrc, gl.FRAGMENT_SHADER);
        if (!newFs) return false;

        const newProg = gl.createProgram();
        gl.attachShader(newProg, vs);
        gl.attachShader(newProg, newFs);
        gl.linkProgram(newProg);
        if (!gl.getProgramParameter(newProg, gl.LINK_STATUS)) {
            console.error('BG program link error:', gl.getProgramInfoLog(newProg));
            gl.deleteProgram(newProg);
            gl.deleteShader(newFs);
            return false;
        }

        if (prog) gl.deleteProgram(prog);
        if (fs) gl.deleteShader(fs);
        prog = newProg;
        fs = newFs;
        currentSrc = fsSrc;

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

        return true;
    }

    function initResources() {
        prog = null;
        fs = null;

        vs = compile(vsSrc, gl.VERTEX_SHADER);

        buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, quadData, gl.STATIC_DRAW);

        gl.viewport(0, 0, canvas.width, canvas.height);

        setupProgram(currentSrc);
    }

    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }, false);
    canvas.addEventListener('webglcontextrestored', () => { initResources(); }, false);

    initResources();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (gl.isContextLost()) return;
            const size = getCanvasSize();
            if (size.w !== canvas.width || size.h !== canvas.height) {
                canvas.width = size.w;
                canvas.height = size.h;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
        }, 100);
    });

    let color1 = [0.0, 0.0, 0.0];
    let color2 = [0.0, 0.0, 0.0];

    const period = 6283.0;

    function render() {
        requestAnimationFrame(render);
        if (gl.isContextLost() || !prog) return;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(timeLoc, (performance.now() / 1000) % period);
        gl.uniform3fv(c1Loc, color1);
        gl.uniform3fv(c2Loc, color2);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(render);

    return {
        setColors: (c1, c2) => { color1 = c1; color2 = c2; },
    };
}
