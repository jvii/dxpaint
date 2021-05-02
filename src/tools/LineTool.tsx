/* eslint-disable no-undef */
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
  isLeftMouseButton,
  omit,
} from './util/util';
import { Throttle } from './util/Throttle';
import { overmind } from '../index';
import { brushHistory } from '../brush/BrushHistory';
import { paintingCanvasController } from '../canvas/paintingCanvas/PaintingCanvasController';
import { overlayCanvasController } from '../canvas/overlayCanvas/OverlayCanvasController';

export class LineTool implements Tool {
  private throttle = new Throttle(50);

  private prepareToPaint(withBGColor: boolean): void {
    if (withBGColor) {
      overmind.actions.tool.activeToolToBGFillStyle();
      overmind.actions.brush.toBGBrush();
    }
  }

  public onInit(params: EventHandlerParams): void {
    overmind.actions.tool.lineToolStart(null);
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

    if (!overmind.state.tool.lineTool.start) {
      return;
    }

    const mousePos = getMousePos(canvas, event);
    const start = overmind.state.tool.lineTool.start;
    const end = mousePos;
    brushHistory.current.drawLine(start, end, paintingCanvasController);
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
    overmind.actions.tool.lineToolStart(mousePos);
  }

  // Overlay

  public onMouseMoveOverlay(params: OverlayEventHandlerParamsWithEvent): void {
    const {
      event,
      ctx: { canvas },
    } = params;
    const mousePos = getMousePos(canvas, event);

    if (
      overmind.state.tool.lineTool.start &&
      (isLeftMouseButton(event) || isRightMouseButton(event))
    ) {
      const start = overmind.state.tool.lineTool.start;
      const end = mousePos;
      this.throttle.call((): void => {
        clearOverlayCanvas(canvas);
        brushHistory.current.drawLine(start, end, overlayCanvasController);
      });
    } else {
      clearOverlayCanvas(canvas);
      brushHistory.current.drawPoint(mousePos, overlayCanvasController);
    }
  }

  public onMouseLeaveOverlay(params: OverlayEventHandlerParamsWithEvent): void {
    overlayCanvasController.clear();
  }
}
