import React, { useEffect, useRef } from 'react';
import { Canvas } from './Canvas';
import { CanvasState, CanvasStateAction } from './CanvasState';
import { ToolbarState } from '../toolbar/ToolbarState';
import { PaletteState } from '../palette/PaletteState';
import { UndoState, UndoStateAction } from './UndoState';
import { useScrollToFocusPoint } from './hooks';
import './Canvas.css';

interface Props {
  canvasDispatch: React.Dispatch<CanvasStateAction>;
  canvasState: CanvasState;
  toolbarState: ToolbarState;
  paletteState: PaletteState;
  undoState: UndoState;
  undoDispatch: React.Dispatch<UndoStateAction>;
}

export function MainCanvas({
  canvasDispatch,
  canvasState,
  toolbarState,
  paletteState,
  undoState,
  undoDispatch,
}: Props): JSX.Element {
  const canvasDivRef = useRef<HTMLDivElement>(document.createElement('div'));

  useEffect((): void => {
    canvasDispatch({
      type: 'setCanvasResolution',
      canvasResolution: { width: window.innerWidth - 50, height: window.innerHeight - 3 },
    });
  }, [canvasDispatch]);

  useScrollToFocusPoint(canvasDivRef.current, canvasState.scrollFocusPoint);

  return (
    <div className="MainCanvasDiv" ref={canvasDivRef}>
      <Canvas
        canvasDispatch={canvasDispatch}
        canvasState={canvasState}
        toolbarState={toolbarState}
        paletteState={paletteState}
        undoState={undoState}
        undoDispatch={undoDispatch}
        isZoomCanvas={false}
      />
    </div>
  );
}

export default MainCanvas;
