import React, { useEffect } from 'react';
import { Canvas } from './Canvas';
import { CanvasState, CanvasStateAction } from './CanvasState';
import { ToolbarState } from '../toolbar/ToolbarState';
import { PaletteState } from '../palette/PaletteState';
import './Canvas.css';

interface Props {
  canvasDispatch: React.Dispatch<CanvasStateAction>;
  canvasState: CanvasState;
  toolbarState: ToolbarState;
  paletteState: PaletteState;
}

export function MainCanvas({
  canvasDispatch,
  canvasState,
  toolbarState,
  paletteState,
}: Props): JSX.Element {
  useEffect((): void => {
    canvasDispatch({
      type: 'setCanvasResolution',
      canvasResolution: { width: window.innerWidth - 50, height: window.innerHeight - 3 },
    });
  }, [canvasDispatch]);

  return (
    <div className="MainCanvasDiv">
      <Canvas
        canvasDispatch={canvasDispatch}
        canvasState={canvasState}
        toolbarState={toolbarState}
        paletteState={paletteState}
        isZoomCanvas={false}
        zoomFactor={1}
      />
    </div>
  );
}

export default MainCanvas;