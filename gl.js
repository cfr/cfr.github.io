
function initGL(doc, fragmentShader) {
    const container = doc.getElementById('container');
    const fallbackImg = doc.getElementById('fallback-img');
    if (!container || !fallbackImg) return;

    const canvas = doc.createElement('canvas');
    var devicePixelRatio = window.devicePixelRatio || 1;

    function getCanvasSize() {
        const rect = container.getBoundingClientRect();
        return {
            w: Math.round((rect.width || 256) * devicePixelRatio),
            h: Math.round((rect.height || 256) * devicePixelRatio),
        };
    }

    const initialSize = getCanvasSize();
    canvas.width  = initialSize.w;
    canvas.height = initialSize.h;
    canvas.style.width  = '100%';
    canvas.style.height = '100%';

    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';

    container.appendChild(canvas);

    function getGLContext(c) {
        const attrs = { alpha: true, premultipliedAlpha: false, failIfMajorPerformanceCaveat: false };
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
    if (!gl) { fallbackImg.style.display = 'block'; return; }

    canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
    }, false);

    canvas.addEventListener('webglcontextrestored', () => {
        setupProgram(fragmentShader);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        if (img.complete && img.naturalWidth > 0) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));
        }
    }, false);

    const vertexShaderSrc = `
        attribute vec2 aPosition;
        attribute vec2 aUV;
        varying vec2 vUV;
        void main() {
            gl_Position = vec4(aPosition, 0.0, 1.0);
            vUV = aUV;
        }
    `;

    const compileShader = (src, type) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader error:', gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };

    const vs = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);

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

    let prog, fs, posLoc, uvLoc, texLoc, timeLoc, mouseLoc, hoverLoc;
    let mouseX = 0.0;
    let mouseY = 0.0;
    let hoverTarget = 0.0;
    let hover = 0.0;
    const hoverRate = 3.0;

    function setupProgram(fsSrc) {
        hover = 0.0;
        hoverTarget = 0.0;
        if (prog) gl.deleteProgram(prog);
        if (fs) gl.deleteShader(fs);

        prog = gl.createProgram();
        gl.attachShader(prog, vs);
        fs = compileShader(fsSrc, gl.FRAGMENT_SHADER);
        if (!fs) return;
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        gl.useProgram(prog);

        posLoc = gl.getAttribLocation(prog, 'aPosition');
        uvLoc  = gl.getAttribLocation(prog, 'aUV');
        texLoc  = gl.getUniformLocation(prog, 'uTexture');
        timeLoc = gl.getUniformLocation(prog, 'uTime');
        mouseLoc = gl.getUniformLocation(prog, 'uMouse');
        hoverLoc = gl.getUniformLocation(prog, 'uHover');
        gl.uniform1i(texLoc, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(posLoc);
        gl.enableVertexAttribArray(uvLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(uvLoc,  2, gl.FLOAT, false, 16, 8);
    }

    setupProgram(fragmentShader);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,0]));

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = (e.clientY - rect.top) / rect.height;
        hoverTarget = 1.0;
    });

    canvas.addEventListener('mouseleave', () => {
        hoverTarget = 0.0;
    });

    canvas.addEventListener('touchstart', (e) => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mouseX = (touch.clientX - rect.left) / rect.width;
        mouseY = (touch.clientY - rect.top) / rect.height;
        hoverTarget = 1.0;
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mouseX = (touch.clientX - rect.left) / rect.width;
        mouseY = (touch.clientY - rect.top) / rect.height;
        hoverTarget = 1.0;
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
        hoverTarget = 0.0;
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        fallbackImg.style.display = 'none';
    };
    img.onerror = () => { fallbackImg.style.display = 'block'; };
    img.src = 'invader-256.png';

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const size = getCanvasSize();
            if (size.w !== canvas.width || size.h !== canvas.height) {
                canvas.width = size.w;
                canvas.height = size.h;
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
        }, 100);
    });

    let lastFrameTime = performance.now();
    const period = 8.0 * Math.PI;

    function render() {
        requestAnimationFrame(render);
        if (gl.isContextLost()) return;

        const now = performance.now();
        const dt = Math.min(0.1, (now - lastFrameTime) / 1000);
        lastFrameTime = now;

        const easeAmount = 1.0 - Math.exp(-hoverRate * dt);
        hover += (hoverTarget - hover) * easeAmount;

        const wrappedTime = (now / 1000) % period;

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(timeLoc, wrappedTime);
        gl.uniform2f(mouseLoc, mouseX, (1.0 - mouseY));
        gl.uniform1f(hoverLoc, hover);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(render);

    return setupProgram;
}
