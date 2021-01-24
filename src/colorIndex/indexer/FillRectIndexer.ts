import { canvasToWebGLCoordX, canvasToWebGLCoordY } from '../util';

export class FillRectIndexer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private currentColor = 0;

  public constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.initShaders();
  }

  public indexFillRect(
    x: number,
    y: number,
    width: number,
    heigth: number,
    colorIndex: number
  ): void {
    const gl = this.gl;

    if (!this.program) {
      return;
    }
    if (gl.getParameter(gl.CURRENT_PROGRAM) !== this.program) {
      console.log('switching webgl program');
      gl.useProgram(this.program);
    }

    if (colorIndex !== this.currentColor) {
      console.log('updating color index uniform');
      this.currentColor = colorIndex;
      const u_colorIndex = gl.getUniformLocation(this.program, 'u_colorIndex');
      gl.uniform1f(u_colorIndex, colorIndex);
    }

    /*   console.log('fillRect');
    console.log('x: ' + x + ', x(gl): ' + canvasToWebGLCoordX(gl, x));
    console.log('y: ' + y + ', y(gl): ' + canvasToWebGLCoordY(gl, y));
    console.log('width: ' + width);
    console.log('heigth: ' + heigth); */

    if (width === 1 && heigth === 1) {
      this.fillRectPoint(x, y);
    } else {
      this.fillRectQuad(x, y, width, heigth);
    }
  }

  private fillRectPoint(x: number, y: number): void {
    const gl = this.gl;

    const vertices = new Float32Array(2);
    vertices[0] = canvasToWebGLCoordX(gl, x);
    vertices[1] = canvasToWebGLCoordY(gl, y);

    this.gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    this.gl.drawArrays(gl.POINTS, 0, 1);
  }

  private fillRectQuad(x: number, y: number, width: number, heigth: number): void {
    const gl = this.gl;

    const xLeft = canvasToWebGLCoordX(gl, x);
    const xRight = canvasToWebGLCoordX(gl, x + width);
    const yTop = canvasToWebGLCoordY(gl, y);
    const yBottom = canvasToWebGLCoordY(gl, y + heigth);

    const vertices = new Float32Array(8);
    vertices[0] = xLeft;
    vertices[1] = yTop;

    vertices[2] = xLeft;
    vertices[3] = yBottom;

    vertices[4] = xRight;
    vertices[5] = yTop;

    vertices[6] = xRight;
    vertices[7] = yBottom;

    this.gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    this.gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private initShaders(): void {
    const vertexShader = `
    attribute vec4 a_Position;

    void main () {
      gl_Position = a_Position;
      gl_PointSize = 1.0;
    }
    `;

    const fragmentShader = `
    precision mediump float;

    uniform float u_colorIndex;

    void main () {
      gl_FragColor = vec4(u_colorIndex/255.0, 0.0, 0.0, 1.0);
    }
    `;

    const gl = this.gl;

    const vs = gl.createShader(gl.VERTEX_SHADER);
    if (!vs) {
      return;
    }
    gl.shaderSource(vs, vertexShader);
    gl.compileShader(vs);

    // Catch some possible errors on vertex shader
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(vs));
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fs) {
      return;
    }
    gl.shaderSource(fs, fragmentShader);
    gl.compileShader(fs);

    // Catch some possible errors on fragment shader
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(fs));
    }

    // Compile to program
    const program = gl.createProgram();
    if (!program) {
      return;
    }
    this.program = program;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    // Catch some possible errors on program
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }
    console.log('Program ready (FillRectIndexer)');

    // Create a buffer object for vertex coordinates
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object ');
      return;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    const a_Position = gl.getAttribLocation(program, 'a_Position');

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  }
}
