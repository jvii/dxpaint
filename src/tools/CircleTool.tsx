import {
  Tool,
  EventHandlerParamsWithEvent,
  OverlayEventHandlerParamsWithEvent,
  EventHandlerParams,
} from './Tool';
import { getMousePos, clearOverlayCanvas, isRightMouseButton, omit } from './util/util';
import { distance } from '../algorithm/shape';
import { overmind } from '../index';
import { selection } from './util/SelectionIndicator';
import { brushHistory } from '../brush/BrushHistory';
import { paintingCanvasController } from '../canvas/paintingCanvas/PaintingCanvasController';
import { overlayCanvasController } from '../canvas/overlayCanvas/OverlayCanvasController';

export class CircleTool implements Tool {
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
    const {
      ctx: { canvas },
    } = params;
    selection.prepare(canvas);
    overmind.actions.tool.circleToolOrigin(null);
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
      ctx: { canvas },
      undoPoint,
    } = params;

    const origin = overmind.state.tool.circleTool.origin;
    if (!origin) {
      return;
    }

    const mousePos = getMousePos(canvas, event);
    const radius = Math.round(distance(origin, mousePos));

    if (this.filled) {
      brushHistory.current.drawFilledCircle(origin, radius, paintingCanvasController);
    } else {
      brushHistory.current.drawUnfilledCircle(origin, radius, paintingCanvasController);
    }
    undoPoint();
    this.onInit(omit(params, 'event'));
  }

  public onMouseDown(params: EventHandlerParamsWithEvent): void {
    const {
      event,
      ctx: { canvas },
    } = params;
    this.prepareToPaint(isRightMouseButton(event));
    const mousePos = getMousePos(canvas, event);
    overmind.actions.tool.circleToolOrigin(mousePos);
  }

  public onMouseEnter(params: EventHandlerParamsWithEvent): void {
    const { event } = params;
    if (!event.buttons) {
      this.onInit(omit(params, 'event'));
    }
  }

  // Overlay

  public onMouseMoveOverlay(params: EventHandlerParamsWithEvent): void {
    const {
      event,
      ctx,
      ctx: { canvas },
    } = params;

    const mousePos = getMousePos(canvas, event);

    const origin = overmind.state.tool.circleTool.origin;

    // If no origin has been set, we are still in origin selection mode.
    // In this case we only need to render the crosshair (and the brush for unfilled cirle).

    if (!origin) {
      clearOverlayCanvas(canvas);
      if (!this.filled) {
        // DPaint only draws unfilled shapes with the current brush.
        // For filled circles we only render the croshair.
        brushHistory.current.drawPoint(mousePos, overlayCanvasController);
      }
      selection.edgeToEdgeCrosshair(ctx, mousePos);
      return;
    }

    // Origin is set, so we render a preview of the cicle

    const radius = Math.round(distance(origin, mousePos));
    if (this.filled) {
      brushHistory.current.drawFilledCircle(origin, radius, overlayCanvasController);
    } else {
      brushHistory.current.drawUnfilledCircle(origin, radius, overlayCanvasController);
    }
  }

  public onMouseLeaveOverlay(params: OverlayEventHandlerParamsWithEvent): void {
    overlayCanvasController.clear();
  }

  public onMouseUpOverlay(params: OverlayEventHandlerParamsWithEvent): void {
    overlayCanvasController.clear();
  }
}
