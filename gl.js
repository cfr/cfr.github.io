
function initGL(doc, fragmentShader) {
    const container = doc.getElementById('container');
    const fallbackImg = doc.getElementById('fallback-img');
    if (!container || !fallbackImg) return;

    const canvas = doc.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl', { alpha: true });
    if (!gl) { fallbackImg.style.display = 'block'; return; }

    const vertexShader = `
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

    const prog = gl.createProgram();
    gl.attachShader(prog, compileShader(vertexShader, gl.VERTEX_SHADER));
    gl.attachShader(prog, compileShader(fragmentShader, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

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

    const posLoc = gl.getAttribLocation(prog, 'aPosition');
    const uvLoc  = gl.getAttribLocation(prog, 'aUV');
    gl.enableVertexAttribArray(posLoc);
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(uvLoc,  2, gl.FLOAT, false, 16, 8);

    const texLoc  = gl.getUniformLocation(prog, 'uTexture');
    const timeLoc = gl.getUniformLocation(prog, 'uTime');
    gl.uniform1i(texLoc, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
