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
  const arrowColor = '#ea384c';
  const arrowWidth = '2px';
  
  if (isDirectConnection) {
    return (
      <>
        <div
          className="absolute z-10"
          style={{
            left: `${fromPosition.left}px`,
            top: `${fromPosition.top}px`,
            width: `${toPosition.left - fromPosition.left}px`,
            height: arrowWidth,
            background: `linear-gradient(to right, ${arrowColor}80, ${arrowColor})`,
          }}
        />
        
        <div
          className="absolute w-0 h-0 z-20"
          style={{
            left: `${toPosition.left - 8}px`,
            top: `${toPosition.top - 3}px`,
            borderTop: '3px solid transparent',
            borderBottom: '3px solid transparent',
            borderLeft: `8px solid ${arrowColor}`,
            filter: 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.1))',
          }}
        />
      </>
    );
  } else {
    const midX = fromPosition.left + 20;
    const midY1 = fromPosition.top + 60;
    const midX2 = toPosition.left - 25;
    
    return (
      <>
        <div
          className="absolute z-10"
          style={{
            left: `${fromPosition.left}px`,
            top: `${fromPosition.top}px`,
            width: `20px`,
            height: arrowWidth,
            background: arrowColor,
          }}
        />
        
        <div
          className="absolute z-10"
          style={{
            left: `${midX}px`,
            top: `${Math.min(fromPosition.top, midY1)}px`,
            width: arrowWidth,
            height: `${Math.abs(midY1 - fromPosition.top)}px`,
            background: arrowColor,
          }}
        />
        
        <div
          className="absolute z-10"
          style={{
            left: `${Math.min(midX, midX2)}px`,
            top: `${midY1}px`,
            width: `${Math.abs(midX2 - midX)}px`,
            height: arrowWidth,
            background: arrowColor,
            backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 15px, white 15px, white 20px)',
            backgroundSize: '100% 100%',
          }}
        />
        
        <div
          className="absolute z-10"
          style={{
            left: `${midX2}px`,
            top: `${Math.min(midY1, toPosition.top)}px`,
            width: arrowWidth,
            height: `${Math.abs(toPosition.top - midY1)}px`,
            background: arrowColor,
          }}
        />
        
        <div
          className="absolute z-10"
          style={{
            left: `${midX2}px`,
            top: `${toPosition.top}px`,
            width: `${toPosition.left - midX2}px`,
            height: arrowWidth,
            background: `linear-gradient(to right, ${arrowColor}, ${arrowColor})`,
          }}
        />
        
        <div
          className="absolute w-0 h-0 z-20"
          style={{
            left: `${toPosition.left - 8}px`,
            top: `${toPosition.top - 3}px`,
            borderTop: '3px solid transparent',
            borderBottom: '3px solid transparent',
            borderLeft: `8px solid ${arrowColor}`,
            filter: 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.1))',
          }}
        />
      </>
    );
  }
};

export default PrerequisiteArrow;
