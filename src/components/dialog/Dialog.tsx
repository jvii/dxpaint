import React, { useRef } from 'react';
import './Dialog.css';
import { useOvermind } from '../../overmind';

interface Props {
  header: string;
  prompt?: string;
  children: React.ReactNode;
}

export function Dialog({ header, prompt, children }: Props): JSX.Element | null {
  const { state, actions } = useOvermind();
  const overlayRef = useRef<HTMLDivElement>(document.createElement('div'));

  return (
    <>
      <div className="modal-overlay" ref={overlayRef}>
        <div className="modal">
          <div className="modal-header">
            <p>{header}</p>
          </div>
          <p className="modal-description">{prompt}</p>
          {children}
        </div>
      </div>
    </>
  );
}
