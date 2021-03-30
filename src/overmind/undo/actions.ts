import { Action } from 'overmind';
import { paintingCanvasController } from '../../canvas/PaintingCanvasController';
import { undoBuffer } from './UndoBuffer';

export const setUndoPoint: Action<HTMLCanvasElement> = ({ state }): void => {
  //const colorIndex = paintingCanvasController.colorIndexer?.getIndex();
  const colorIndex = new Uint8Array(); // temp
  if (!colorIndex) {
    console.log('no index');
    return;
  }
  if (state.undo.currentIndex === null) {
    undoBuffer.setBuffer([colorIndex]);
    state.undo.currentIndex = 0;
  } else {
    undoBuffer.setBuffer(
      undoBuffer
        .getBuffer()
        .slice(0, state.undo.currentIndex + 1)
        .concat(colorIndex)
    );
    state.undo.currentIndex = ++state.undo.currentIndex;
  }
};

export const undo: Action = ({ state }): void => {
  if (!state.undo.currentIndex) {
    return;
  }
  state.undo.currentIndex = --state.undo.currentIndex;
  state.undo.lastUndoRedoTime = Date.now();
};

export const redo: Action = ({ state }): void => {
  if (state.undo.currentIndex === undoBuffer.getBuffer().length - 1) {
    return;
  }
  state.undo.currentIndex = state.undo.currentIndex === null ? 0 : ++state.undo.currentIndex;
  state.undo.lastUndoRedoTime = Date.now();
};
