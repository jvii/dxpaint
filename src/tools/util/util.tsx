import { Point, Color } from '../../types';
import { Tool, EventHandlerParams, EventHandlerParamsOverlay } from '../Tool';
import { CustomBrush } from '../../brush/CustomBrush';
import { overmind } from '../../index';

export function colorToRGBString(color: Color): string {
  return 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
}

export function getMousePos(
  canvas: HTMLCanvasElement,
  event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
): Point {
  const rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

  return {
    x: Math.floor((event.clientX - rect.left) * scaleX), // scale mouse coordinates after they have
    y: Math.floor((event.clientY - rect.top) * scaleY), // been adjusted to be relative to element
  };
}

export function pointEquals(point1: Point, point2: Point): boolean {
  return point1.x === point2.x && point1.y === point2.y;
}

export function points8Connected(point1: Point, point2: Point): boolean {
  return Math.abs(point1.x - point2.x) <= 1 && Math.abs(point1.y - point2.y) <= 1;
}

export function clearCanvas(canvas: HTMLCanvasElement, color: Color): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.rect(0, 0, canvas.width, canvas.height);
  const oldFillStyle = ctx.fillStyle;
  ctx.fillStyle = colorToRGBString(color);
  ctx.fill();
  ctx.fillStyle = oldFillStyle;
}

export function clearOverlayCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function getEventHandler(
  tool: Tool,
  eventHandlerName:
    | 'onClick'
    | 'onContextMenu'
    | 'onMouseMove'
    | 'onMouseUp'
    | 'onMouseDown'
    | 'onMouseLeave'
    | 'onMouseEnter',
  eventHandlerParams: EventHandlerParams
): (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void {
  if (hasKey(tool, eventHandlerName)) {
    return (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void =>
      tool[eventHandlerName]!({ event: event, ...eventHandlerParams });
  }
  return (): void => {};
}

export function getEventHandlerOverlay(
  tool: Tool,
  eventHandlerName:
    | 'onMouseMoveOverlay'
    | 'onMouseLeaveOverlay'
    | 'onMouseEnterOverlay'
    | 'onMouseUpOverlay'
    | 'onMouseDownOverlay'
    | 'onClickOverlay',
  eventHandlerParams: EventHandlerParamsOverlay
): (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void {
  if (hasKey(tool, eventHandlerName)) {
    return (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void =>
      tool[eventHandlerName]!({ event: event, ...eventHandlerParams });
  }
  return (): void => {};
}

function hasKey<O>(obj: O, key: keyof any): key is keyof O {
  return key in obj;
}

export function isRightMouseButton(
  event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
): boolean {
  return event.button === 2 || event.buttons === 2;
}

export function isLeftMouseButton(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): boolean {
  return event.button === 1 || event.buttons === 1;
}

export function isLeftOrRightMouseButton(
  event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
): boolean {
  return isLeftMouseButton(event) || isRightMouseButton(event);
}

// adapted from https://stackoverflow.com/questions/11472273/how-to-edit-pixels-and-remove-white-background-in-a-canvas-image-in-html5-and-ja
export function extractBrush(
  sourceCanvas: HTMLCanvasElement,
  start: Point,
  width: number,
  height: number
): CustomBrush {
  const bufferCanvas = document.createElement('canvas');

  bufferCanvas.width = Math.abs(width);
  bufferCanvas.height = Math.abs(height);

  const bufferCanvasCtx = bufferCanvas.getContext('2d');
  if (!bufferCanvasCtx) {
    throw 'Error retrieving Context for buffer Canvas while extracting brush';
  }

  bufferCanvasCtx.drawImage(
    sourceCanvas,
    start.x,
    start.y,
    width,
    height,
    0,
    0,
    bufferCanvas.width,
    bufferCanvas.height
  );

  const backgroundColor =
    overmind.state.palette.backgroundColor.r * 0x00000001 +
    overmind.state.palette.backgroundColor.g * 0x00000100 +
    overmind.state.palette.backgroundColor.b * 0x00010000 +
    255 * 0x01000000;

  const imageData = bufferCanvasCtx.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
  const imageDataBufferTMP = new ArrayBuffer(imageData.data.length);
  const imageDataClamped8TMP = new Uint8ClampedArray(imageDataBufferTMP);
  const imageDataUint32TMP = new Uint32Array(imageDataBufferTMP);

  imageDataClamped8TMP.set(imageData.data);

  let n = imageDataUint32TMP.length;
  while (n--) {
    if (imageDataUint32TMP[n] === backgroundColor) {
      imageDataUint32TMP[n] = 0x00000000; // make it transparent
    }
  }

  imageData.data.set(imageDataClamped8TMP);
  bufferCanvasCtx.putImageData(imageData, 0, 0);

  return new CustomBrush(bufferCanvas.toDataURL());
}

interface Omit {
  <T extends object, K extends [...(keyof T)[]]>(obj: T, ...keys: K): {
    [K2 in Exclude<keyof T, K[number]>]: T[K2];
  };
}

export const omit: Omit = (obj, ...keys) => {
  const ret = {} as {
    [K in keyof typeof obj]: typeof obj[K];
  };
  let key: keyof typeof obj;
  for (key in obj) {
    if (!keys.includes(key)) {
      ret[key] = obj[key];
    }
  }
  return ret;
};
