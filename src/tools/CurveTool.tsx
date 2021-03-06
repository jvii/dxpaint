import {
  Tool,
  EventHandlerParamsWithEvent,
  OverlayEventHandlerParamsWithEvent,
  EventHandlerParams,
} from './Tool';
import {
  getMousePos,
  clearOverlayCanvas,
  isRightMouseButton,
  isLeftOrRightMouseButton,
  omit,
} from './util/util';
import { Throttle } from './util/Throttle';
import { overmind } from '../index';

export class CurveTool implements Tool {
  private throttle = new Throttle(50);

  private prepareToPaint(withBGColor: boolean): void {
    if (withBGColor) {
      overmind.actions.tool.activeToolToBGFillStyle();
      overmind.actions.brush.toBGBrush();
    }
  }

  public onInit(params: EventHandlerParams): void {
    overmind.actions.tool.curveToolReset();
    overmind.actions.tool.activeToolToFGFillStyle();
    overmind.actions.brush.toFGBrush();
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
      undoPoint,
      onPaint,
    } = params;

    const startPoint = overmind.state.tool.curveTool.start;
    if (!startPoint) {
      return;
    }

    const mousePos = getMousePos(canvas, event);
    const endPoint = overmind.state.tool.curveTool.end;

    if (endPoint) {
      overmind.state.brush.brush.drawCurve(ctx, startPoint, endPoint, mousePos);
      undoPoint();
      onPaint();
      this.onInit(omit(params, 'event'));
    } else {
      overmind.actions.tool.curveToolEnd(mousePos);
    }
  }

  public onMouseDown(params: EventHandlerParamsWithEvent): void {
    const {
      event,
      ctx: { canvas },
    } = params;

    if (!overmind.state.tool.curveTool.end) {
      this.prepareToPaint(isRightMouseButton(event));
      const mousePos = getMousePos(canvas, event);
      overmind.actions.tool.curveToolStart(mousePos);
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
    const mousePos = getMousePos(canvas, event);

    const startPoint = overmind.state.tool.curveTool.start;
    if (!startPoint) {
      clearOverlayCanvas(canvas);
      overmind.state.brush.brush.drawDot(ctx, mousePos);
      onPaint();
      return;
    }

    const endPoint = overmind.state.tool.curveTool.end;
    if (endPoint) {
      this.throttle.call((): void => {
        clearOverlayCanvas(canvas);
        overmind.state.brush.brush.drawCurve(ctx, startPoint, endPoint, mousePos);
      });
    } else if (isLeftOrRightMouseButton(event)) {
      this.throttle.call((): void => {
        clearOverlayCanvas(canvas);
        overmind.state.brush.brush.drawLine(ctx, startPoint, mousePos);
      });
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
}
