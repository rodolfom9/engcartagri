
import React from 'react';

interface Position {
  left: number;
  top: number;
}

interface PrerequisiteArrowProps {
  fromPosition: Position;
  toPosition: Position;
  isDirectConnection: boolean;
}

const PrerequisiteArrow: React.FC<PrerequisiteArrowProps> = ({
  fromPosition,
  toPosition,
  isDirectConnection
}) => {
  if (isDirectConnection) {
    // Direct connection - simple horizontal line
    return (
      <>
        {/* Horizontal line */}
        <div
          className="absolute bg-arrow h-[2px] z-10"
          style={{
            left: `${fromPosition.left}px`,
            top: `${fromPosition.top}px`,
            width: `${toPosition.left - fromPosition.left}px`,
          }}
        />
        
        {/* Arrow tip */}
        <div
          className="absolute w-0 h-0 z-20"
          style={{
            left: `${toPosition.left - 10}px`,
            top: `${toPosition.top - 5}px`,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: '10px solid #ff5722',
          }}
        />
      </>
    );
  } else {
    // Complex connection with curves
    const midX = fromPosition.left + 30;
    const midY1 = fromPosition.top + 40;
    const midX2 = toPosition.left - 35;
    
    return (
      <>
        {/* Line from source */}
        <div
          className="absolute bg-arrow h-[2px] z-10"
          style={{
            left: `${fromPosition.left}px`,
            top: `${fromPosition.top}px`,
            width: `30px`,
          }}
        />
        
        {/* Vertical line down */}
        <div
          className="absolute bg-arrow w-[2px] z-10"
          style={{
            left: `${midX}px`,
            top: `${Math.min(fromPosition.top, midY1)}px`,
            height: `${Math.abs(midY1 - fromPosition.top)}px`,
          }}
        />
        
        {/* Horizontal line connecting */}
        <div
          className="absolute bg-arrow h-[2px] z-10"
          style={{
            left: `${midX}px`,
            top: `${midY1}px`,
            width: `${midX2 - midX}px`,
          }}
        />
        
        {/* Vertical line up/down to destination level */}
        <div
          className="absolute bg-arrow w-[2px] z-10"
          style={{
            left: `${midX2}px`,
            top: `${Math.min(midY1, toPosition.top)}px`,
            height: `${Math.abs(toPosition.top - midY1)}px`,
          }}
        />
        
        {/* Final horizontal line to destination */}
        <div
          className="absolute bg-arrow h-[2px] z-10"
          style={{
            left: `${midX2}px`,
            top: `${toPosition.top}px`,
            width: `${toPosition.left - midX2}px`,
          }}
        />
        
        {/* Arrow tip */}
        <div
          className="absolute w-0 h-0 z-20"
          style={{
            left: `${toPosition.left - 10}px`,
            top: `${toPosition.top - 5}px`,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: '10px solid #ff5722',
          }}
        />
      </>
    );
  }
};

export default PrerequisiteArrow;
