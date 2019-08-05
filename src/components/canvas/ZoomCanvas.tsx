import React, { useState } from 'react';
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

export function ZoomCanvas({
  canvasDispatch,
  canvasState,
  toolbarState,
  paletteState,
}: Props): JSX.Element {
  const [zoomFactor, setZoomFactor] = useState(20);

  const zoomIn = (): void => {
    setZoomFactor(zoomFactor + 2);
  };

  const zoomOut = (): void => {
    if (zoomFactor <= 2) {
      return;
    }
    setZoomFactor(zoomFactor - 2);
  };

  const visible = toolbarState.zoomModeOn && canvasState.zoomFocusPoint;

  return (
    <>
      <div className="ZoomCanvasSideBar" style={{ display: visible ? 'initial' : 'none' }}>
        <button className="ButtonPlus" onClick={zoomIn}>
          +
        </button>
        <button className="ButtonMinus" onClick={zoomOut}>
          -
        </button>
      </div>
      <div className="ZoomCanvasDiv" style={{ display: visible ? 'initial' : 'none' }}>
        <Canvas
          canvasDispatch={canvasDispatch}
          canvasState={canvasState}
          toolbarState={toolbarState}
          paletteState={paletteState}
          isZoomCanvas={true}
          zoomFactor={zoomFactor}
        />
      </div>
    </>
  );
}

export default ZoomCanvas;