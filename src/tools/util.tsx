import { Point, Color } from '../types';

export function colorToRGBString(color: Color): string {
  return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
}

export function drawLineNoAliasing(
  canvas: HTMLCanvasElement,
  color: Color,
  start: Point,
  end: Point
): void {
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    return;
  }
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = colorToRGBString(color);
  const dist = distance(start, end);
  for (let i = 0; i < dist; i++) {
    ctx.fillRect(
      Math.floor(start.x + ((end.x - start.x) / dist) * i), // round for perfect pixels
      Math.floor(start.y + ((end.y - start.y) / dist) * i), // thus no aliasing
      1,
      1
    );
  }
}

function distance(start: Point, end: Point): number {
  return Math.sqrt((end.x - start.x) * (end.x - start.x) + (end.y - start.y) * (end.y - start.y));
}

export function drawLine(canvas: HTMLCanvasElement, color: Color, start: Point, end: Point): void {
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    return;
  }

  ctx.strokeStyle = colorToRGBString(color);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

export function drawDot(canvas: HTMLCanvasElement, color: Color, point: Point): void {
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    return;
  }
  ctx.fillStyle = colorToRGBString(color);
  ctx.fillRect(Math.floor(point.x), Math.floor(point.y), 1, 1);
}

export function getMousePos(
  canvas: HTMLCanvasElement,
  event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
): Point {
  const rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

  return {
    x: (event.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    y: (event.clientY - rect.top) * scaleY, // been adjusted to be relative to element
  };
}

export function clearCanvas(canvas: HTMLCanvasElement | null, color: Color): void {
  if (canvas === null) {
    return;
  }
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    return;
  }

  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = colorToRGBString(color);
  ctx.fill();
}