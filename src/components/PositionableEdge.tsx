import { FC } from 'react';
import {
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  useReactFlow,
} from '@xyflow/react';

import ClickableBaseEdge from "./ClickableBaseEdge";
import "./PositionableEdge.css";

type positionHandler = {
  x: number;
  y: number;
  active?: number;
};

const PositionableEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const reactFlowInstance = useReactFlow();
  
  // Garantir que data sempre existe com valores padrão
  const edgeData = data || { positionHandlers: [], type: 'smoothstep', userAuthenticated: false };
  const positionHandlers = (edgeData.positionHandlers as Array<positionHandler>) ?? [];
  const type = edgeData.type ?? "smoothstep";
  const userAuthenticated = edgeData.userAuthenticated ?? false;
  const edgeSegmentsCount = positionHandlers.length + 1;
  const edgeSegmentsArray = [];

  let pathFunction;
  //console.log(type);
  switch (type) {
    case "straight":
      pathFunction = getStraightPath;
      break;
    case "smoothstep":
      pathFunction = getSmoothStepPath;
      break;
    default:
      pathFunction = getSmoothStepPath; // Default para smoothstep
  }

  // calculate the origin and destination of all the segments
  for (let i = 0; i < edgeSegmentsCount; i++) {
    let segmentSourceX, segmentSourceY, segmentTargetX, segmentTargetY;

    if (i === 0) {
      segmentSourceX = sourceX;
      segmentSourceY = sourceY;
    } else {
      const handler = positionHandlers[i - 1];
      segmentSourceX = handler.x;
      segmentSourceY = handler.y;
    }

    if (i === edgeSegmentsCount - 1) {
      segmentTargetX = targetX;
      segmentTargetY = targetY;
    } else {
      const handler = positionHandlers[i];
      segmentTargetX = handler.x;
      segmentTargetY = handler.y;
    }

    const [edgePath, labelX, labelY] = pathFunction({
      sourceX: segmentSourceX,
      sourceY: segmentSourceY,
      sourcePosition,
      targetX: segmentTargetX,
      targetY: segmentTargetY,
      targetPosition,
    });
    edgeSegmentsArray.push({ edgePath, labelX, labelY });
  }

  return (
    <>
      {edgeSegmentsArray.map(({ edgePath }, index) => (
        <ClickableBaseEdge
          onClick={userAuthenticated ? (event) => {
            //console.log("OnClick");
            const position = reactFlowInstance.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });

            const edges = reactFlowInstance.getEdges();
            const new_edges = edges.map((x) => x);
            const edgeIndex = new_edges.findIndex((edge) => edge.id === id);
            //console.log(edges[edgeIndex].data);
            if (new_edges[edgeIndex] && new_edges[edgeIndex].data) {
              if (!new_edges[edgeIndex].data.positionHandlers) {
                new_edges[edgeIndex].data.positionHandlers = [];
              }
              (
                new_edges[edgeIndex].data
                  ?.positionHandlers as Array<positionHandler>
              ).splice(index, 0, {
                x: position.x,
                y: position.y,
                active: -1,
              });
            }
            reactFlowInstance.setEdges(new_edges);
          } : undefined}
          onContextMenu={userAuthenticated ? (event) => {
            event.preventDefault();
            const edges = reactFlowInstance.getEdges();
            let new_edges = edges.map((x) => x);
            new_edges = new_edges.filter((edge) => edge.id !== id);
            reactFlowInstance.setEdges(new_edges);
          } : undefined}
          key={`edge${id}_segment${index}`}
          path={edgePath}
          markerEnd={index === edgeSegmentsArray.length - 1 ? markerEnd : undefined}
          style={style}
        />
      ))}
      {userAuthenticated && positionHandlers.map(({ x, y, active }, handlerIndex) => (
        <EdgeLabelRenderer key={`edge${id}_handler${handlerIndex}`}>
          <div
            className="nopan positionHandlerContainer"
            style={{
              transform: `translate(-50%, -50%) translate(${x}px,${y}px)`,
            }}
          >
            <div
              className={`positionHandlerEventContainer ${active} ${
                `${active ?? -1}` !== "-1" ? "active" : ""
              }`}
              data-active={active ?? -1}
              // mouse move is used to move the handler when its been mousedowned on
              onMouseMove={(event) => {
                //console.log("On Move");
                let activeEdge = -1;
                activeEdge = parseInt(
                  (event.target as HTMLButtonElement).dataset.active ?? "-1"
                );
                //console.log("On Move with event.target=");
                //console.log(event.target);
                //console.log("On Move with event.target.dataset.active=");
                //console.log((event.target as HTMLButtonElement).dataset.active);
                //console.log("On Move with edge="+String(activeEdge));
                if (activeEdge === -1) {
                  return;
                }
                const position = reactFlowInstance.screenToFlowPosition({
                  x: event.clientX,
                  y: event.clientY,
                });
                const edges = reactFlowInstance.getEdges();
                const new_edges = edges.map((x) => x);
                new_edges[activeEdge].id = String(Math.random());
                //console.log("Gen new ID=" + new_edges[activeEdge].id);
                if (new_edges[activeEdge] && new_edges[activeEdge].data && new_edges[activeEdge].data.positionHandlers) {
                  (
                    new_edges[activeEdge].data
                      ?.positionHandlers as Array<positionHandler>
                  )[handlerIndex] = {
                    x: position.x,
                    y: position.y,
                    active: activeEdge,
                  };
                }
                //console.log(new_edges);
                reactFlowInstance.setEdges(new_edges);
              }}
              // mouse up is used to release all the handlers
              onMouseUp={() => {
                //console.log("On MouseUp");
                const edges = reactFlowInstance.getEdges();
                const new_edges = edges.map((x) => x);
                // const edgeIndex = edges.findIndex((edge) => edge.id === id);
                for (let i = 0; i < new_edges.length; i++) {
                  let handlersLength = 0;
                  if (new_edges[i] && new_edges[i].data && new_edges[i].data.positionHandlers) {
                    handlersLength = (
                      new_edges[i].data
                        ?.positionHandlers as Array<positionHandler>
                    ).length;
                  }
                  for (let j = 0; j < handlersLength; j++) {
                    if (new_edges[i].data?.positionHandlers) {
                      (
                        new_edges[i].data
                          ?.positionHandlers as Array<positionHandler>
                      )[j].active = -1;
                    }
                  }
                }
                reactFlowInstance.setEdges(new_edges);
              }}
            >
              <button
                className="positionHandler"
                data-active={active ?? -1}
                // mouse down is used to activate the handler
                style={{
                  backgroundColor: style.stroke,
                  width: Number(style.strokeWidth) + 2,
                  height: Number(style.strokeWidth) + 2,
                  border: "5px transparent",
                }}
                onMouseDown={() => {
                  //console.log("####### OnMouseDown");
                  const edges = reactFlowInstance.getEdges();
                  const new_edges = edges.map((x) => x);
                  const edgeIndex = new_edges.findIndex(
                    (edge) => edge.id === id
                  );
                  //console.log("EdgeIndex=" + String(edgeIndex));
                  //console.log("HandlerIndex=" + String(handlerIndex));
                  if (new_edges[edgeIndex] && new_edges[edgeIndex].data && new_edges[edgeIndex].data.positionHandlers) {
                    (
                      new_edges[edgeIndex].data
                        ?.positionHandlers as Array<positionHandler>
                    )[handlerIndex].active = edgeIndex;
                  }
                  reactFlowInstance.setEdges(new_edges);
                }}
                // right click is used to delete the handler
                onContextMenu={(event) => {
                  event.preventDefault();
                  const edges = reactFlowInstance.getEdges();
                  const new_edges = edges.map((x) => x);
                  const edgeIndex = new_edges.findIndex(
                    (edge) => edge.id === id
                  );
                  new_edges[edgeIndex].id = String(Math.random());
                  if (new_edges[edgeIndex] && new_edges[edgeIndex].data && new_edges[edgeIndex].data.positionHandlers) {
                    (
                      new_edges[edgeIndex].data
                        ?.positionHandlers as Array<positionHandler>
                    ).splice(handlerIndex, 1);
                  }
                  reactFlowInstance.setEdges(new_edges);
                }}
              ></button>
            </div>
          </div>
        </EdgeLabelRenderer>
      ))}
    </>
  );
};

export default PositionableEdge; 