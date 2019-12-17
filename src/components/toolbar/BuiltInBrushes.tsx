import React from 'react';
import { useOvermind } from '../../overmind';
import { BuiltInBrushId } from '../../brush/BuiltInBrushes';
import './BuiltInBrushes.css';

export function BuiltInBrushes(): JSX.Element {
  return (
    <div className="BuiltInBrushes">
      <BrushButton brushId={1} />
      <BrushButton brushId={2} />
      <BrushButton brushId={3} />
      <BrushButton brushId={4} />
    </div>
  );
}

interface ButtonProps {
  brushId: BuiltInBrushId;
}

function BrushButton({ brushId }: ButtonProps): JSX.Element {
  const { state, actions } = useOvermind();
  const onClick = (): void => {
    actions.brush.selectBuiltInBrush(brushId);
  };
  const isSelected = state.brush.selectedBuiltInBrushId === brushId;
  return (
    <button
      className={'BuiltInBrush ' + 'Brush' + brushId.toString() + (isSelected ? 'Selected' : '')}
      onClick={onClick}
    ></button>
  );
}
