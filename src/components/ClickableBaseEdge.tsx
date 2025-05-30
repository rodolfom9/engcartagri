import type { BaseEdgeProps } from '@xyflow/react';

const ClickableBaseEdge = ({
  id,
  path,
  style,
  markerEnd,
  markerStart,
  interactionWidth = 20,
  onClick,
  onContextMenu,
}: BaseEdgeProps) => {
  return (
    <>
      <path
        id={id}
        style={style}
        d={path}
        fill="none"
        className="react-flow__edge-path"
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
      {interactionWidth && (
        <path
          d={path}
          fill="none"
          strokeOpacity={0}
          strokeWidth={interactionWidth}
          className="react-flow__edge-interaction"
          onClick={onClick}
          onContextMenu={onContextMenu}
        />
      )}
    </>
  );
};

ClickableBaseEdge.displayName = "BaseEdge";

export default ClickableBaseEdge; 