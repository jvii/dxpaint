import { Tool, EventHandlerParamsWithEvent, OverlayEventHandlerParamsWithEvent } from './Tool';
import { getMousePos, clearOverlayCanvas, edgeToEdgeCrosshair, isRightMouseButton } from './util';
import { overmind } from '../index';

export class RectangleTool implements Tool {
  public constructor(filled: boolean) {
    this.filled = filled;
  }

  private filled: boolean;

  public reset(canvas: HTMLCanvasElement): void {
    overmind.actions.canvas.storeInvertedCanvas(canvas);
    overmind.actions.tool.rectangleToolStart(null);
    overmind.actions.tool.activeToolToFGFillStyle();
    overmind.actions.brush.toFGBrush();
  }

  public prepare(withBGColor: boolean): void {
    if (withBGColor) {
      overmind.actions.tool.activeToolToBGFillStyle();
      overmind.actions.brush.toBGBrush();
    }
  }

  public onContextMenu(params: EventHandlerParamsWithEvent): void {
    const { event } = params;
    event.preventDefault();
  }

  public onMouseUp(params: EventHandlerParamsWithEvent): void {
    const {
      event,
      ctx,
      ctx: { canvas },
      onPaint,
      undoPoint,
    } = params;

    const startPoint = overmind.state.tool.rectangleTool.start;
    if (!startPoint) {
      return;
    }

    const endPoint = getMousePos(canvas, event);

    if (this.filled) {
      overmind.state.brush.brush.drawFilledRect(ctx, startPoint, endPoint);
    } else {
      overmind.state.brush.brush.drawUnfilledRect(ctx, startPoint, endPoint);
    }
    undoPoint();
    onPaint();
    this.reset(canvas);
  }

  public onMouseDown(params: EventHandlerParamsWithEvent): void {
    const {
      event,
      ctx: { canvas },
    } = params;
    this.prepare(isRightMouseButton(event));
    const mousePos = getMousePos(canvas, event);
    overmind.actions.tool.rectangleToolStart(mousePos);
  }

  public onMouseEnter(params: EventHandlerParamsWithEvent): void {
    const {
      event,
      ctx: { canvas },
    } = params;
    if (!event.buttons) {
      this.reset(canvas);
    }
  }

  // Overlay

  public onMouseMoveOverlay(params: OverlayEventHandlerParamsWithEvent): void {
    const {
      event,
      ctx,
      ctx: { canvas },
      onPaint,
    } = params;
    clearOverlayCanvas(canvas);

    const mousePos = getMousePos(canvas, event);

    const startPoint = overmind.state.tool.rectangleTool.start;
    if (!startPoint) {
      if (!this.filled) {
        // DPaint only draws unfilled shapes with the current brush
        overmind.state.brush.brush.drawDot(ctx, mousePos);
      }
      edgeToEdgeCrosshair(ctx, mousePos);
      onPaint();
      return;
    }

    if (this.filled) {
      overmind.state.brush.brush.drawFilledRect(ctx, startPoint, mousePos);
    } else {
      overmind.state.brush.brush.drawUnfilledRect(ctx, startPoint, mousePos);
    }
    onPaint();
  }

  public onMouseLeaveOverlay(params: OverlayEventHandlerParamsWithEvent): void {
    const {
      ctx: { canvas },
      onPaint,
    } = params;
    clearOverlayCanvas(canvas);
    onPaint();
  }

  public onMouseUpOverlay(params: OverlayEventHandlerParamsWithEvent): void {
    const {
      ctx: { canvas },
      onPaint,
    } = params;
    clearOverlayCanvas(canvas);
    onPaint();
  }
}
