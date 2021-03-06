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
  pointEquals,
  omit,
} from './util/util';
import { overmind } from '../index';
import { Throttle } from './util/Throttle';
import { unfilledPolygon } from '../algorithm/draw';
import { PixelBrush } from '../brush/PixelBrush';

export class PolygonTool implements Tool {
  private throttle = new Throttle(20);
  public constructor(filled: boolean) {
    this.filled = filled;
  }
  private filled: boolean;

  private prepareToPaint(withBGColor: boolean): void {
    if (withBGColor) {
      overmind.actions.tool.activeToolToBGFillStyle();
      overmind.actions.brush.toBGBrush();
    }
  }

  public onInit(params: EventHandlerParams): void {
    overmind.actions.tool.polygonToolReset();
    overmind.actions.tool.activeToolToFGFillStyle();
    overmind.actions.brush.toFGBrush();
  }

  public onContextMenu(params: EventHandlerParamsWithEvent): void {
    const { event } = params;
    event.preventDefault();
  }

  public onMouseDown(params: EventHandlerParamsWithEvent): void {
    const {
      event,
      ctx,
      ctx: { canvas },
      undoPoint,
      onPaint,
    } = params;
    const mousePos = getMousePos(canvas, event);

    // first click (left or right) determines polygon fill color
    if (!overmind.state.tool.polygonTool.vertices.length) {
      this.prepareToPaint(isRightMouseButton(event));
      overmind.actions.tool.polygonToolAddVertice(mousePos);
      return;
    }

    // complete polygon on right click or if starting point reselected
    if (
      isRightMouseButton(event) ||
      pointEquals(overmind.state.tool.polygonTool.vertices[0], mousePos)
    ) {
      if (this.filled) {
        overmind.state.brush.brush.drawFilledPolygon(ctx, overmind.state.tool.polygonTool.vertices);
      } else {
        overmind.state.brush.brush.drawUnfilledPolygon(
          ctx,
          overmind.state.tool.polygonTool.vertices
        );
      }
      undoPoint();
      onPaint();
      this.onInit(omit(params, 'event'));
      return;
    }

    // otherwise just add new vertice
    overmind.actions.tool.polygonToolAddVertice(mousePos);
  }

  // Overlay

  public onMouseDownOverlay(params: OverlayEventHandlerParamsWithEvent): void {
    const {
      ctx,
      ctx: { canvas },
      onPaint,
    } = params;
    clearOverlayCanvas(canvas);

    if (overmind.state.tool.polygonTool.vertices.length > 1) {
      if (this.filled) {
        unfilledPolygon(ctx, new PixelBrush(), overmind.state.tool.polygonTool.vertices, false);
      } else {
        overmind.state.brush.brush.drawUnfilledPolygon(
          ctx,
          overmind.state.tool.polygonTool.vertices,
          false
        );
      }
    }
    onPaint();
  }

  public onMouseMoveOverlay(params: OverlayEventHandlerParamsWithEvent): void {
    const {
      event,
      ctx,
      ctx: { canvas },
      onPaint,
    } = params;

    const mousePos = getMousePos(canvas, event);

    if (!overmind.state.tool.polygonTool.vertices.length) {
      clearOverlayCanvas(canvas);
      overmind.state.brush.brush.drawDot(ctx, mousePos);
      onPaint();
      return;
    }

    if (this.filled) {
      this.throttle.call((): void => {
        clearOverlayCanvas(canvas);
        unfilledPolygon(
          ctx,
          new PixelBrush(),
          overmind.state.tool.polygonTool.vertices.slice().concat(mousePos),
          false
        );
      });
    } else {
      this.throttle.call((): void => {
        clearOverlayCanvas(canvas);
        overmind.state.brush.brush.drawUnfilledPolygon(
          ctx,
          overmind.state.tool.polygonTool.vertices.slice().concat(mousePos),
          false
        );
      });
    }
    onPaint();
  }

  public onMouseLeaveOverlay(params: OverlayEventHandlerParamsWithEvent): void {
    const {
      ctx,
      ctx: { canvas },
      onPaint,
    } = params;

    clearOverlayCanvas(canvas);

    if (overmind.state.tool.polygonTool.vertices.length > 0) {
      if (this.filled) {
        unfilledPolygon(ctx, new PixelBrush(), overmind.state.tool.polygonTool.vertices, false);
      } else {
        overmind.state.brush.brush.drawUnfilledPolygon(
          ctx,
          overmind.state.tool.polygonTool.vertices,
          false
        );
      }
      onPaint();
    }
  }
}
