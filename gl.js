
function initGL(doc, fragmentShader) {
    const container = doc.getElementById('container');
    const fallbackImg = doc.getElementById('fallback-img');
    if (!container || !fallbackImg) return;

    const canvas = doc.createElement('canvas');
    var cssWidth = 128;
    var cssHeight = 128;
    var devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width  = cssWidth * devicePixelRatio;
    canvas.height = cssHeight * devicePixelRatio;
    canvas.style.width  = cssWidth + "px";
    canvas.style.height = cssHeight + "px";

    container.appendChild(canvas);

    const gl = canvas.getContext('webgl', { alpha: true });
    if (!gl) { fallbackImg.style.display = 'block'; return; }

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

    function setupProgram(fsSrc) {
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let mouseX = 0.0;
    let mouseY = 0.0;
    let hover = 0.0;

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = (e.clientY - rect.top) / rect.height;
        hover = 1.0;
    });

    canvas.addEventListener('mouseleave', () => {
        hover = 0.0;
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        fallbackImg.style.display = 'none';
    };
    img.onerror = () => { fallbackImg.style.display = 'block'; };
    img.src = 'invader-128.png';

    function render() {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(timeLoc, performance.now() / 1000);
        gl.uniform2f(mouseLoc, mouseX, (1.0 - mouseY));
        gl.uniform1f(hoverLoc, hover);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    return setupProgram;
}
