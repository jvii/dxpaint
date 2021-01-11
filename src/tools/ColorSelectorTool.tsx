import { Tool, EventHandlerParamsWithEvent } from './Tool';
import { getMousePos } from './util/util';
import { overmind } from '../index';
import { getColorIndexForPixel } from '../colorIndex/ColorIndexer';

export class ColorSelectorTool implements Tool {
  public constructor(foregroundColor: boolean) {
    this.foregroundColor = foregroundColor;
  }
  private foregroundColor: boolean;

  public onClick(params: EventHandlerParamsWithEvent): void {
    const {
      event,
      ctx: { canvas },
    } = params;
    const mousePos = getMousePos(canvas, event);
    const colorIndex = getColorIndexForPixel(mousePos);
    if (!colorIndex) {
      return;
    }
    if (this.foregroundColor) {
      overmind.actions.palette.setForegroundColor(colorIndex.toString());
      overmind.actions.toolbox.toggleForegroundColorSelectionMode();
    } else {
      overmind.actions.palette.setBackgroundColor(colorIndex.toString());
      overmind.actions.toolbox.toggleBackgroundColorSelectionMode();
    }
  }

  public onContextMenu(params: EventHandlerParamsWithEvent): void {
    const { event } = params;
    event.preventDefault();
  }

  // No overlay
}
