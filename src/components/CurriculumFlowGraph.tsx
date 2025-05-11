import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  Handle,
  Position,
  NodeProps,
  ConnectionMode,
  EdgeProps,
  EdgeTypes,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Course } from '@/types/curriculum';

interface CourseNodeProps extends NodeProps {
  data: {
    course: Course;
    isCompleted: boolean;
    canTake: boolean;
    onToggleCompletion: (id: string) => void;
    onClick: (course: Course) => void;
  };
}

const CourseNode = ({ data }: CourseNodeProps) => {
  const { course, isCompleted, canTake, onToggleCompletion, onClick } = data;
  
  const getBgColor = () => {
    if (isCompleted) return 'bg-green-100';
    
    switch (course.type) {
      case 'NB':
        return 'bg-pink-100'; // Rosa claro para NB
      case 'NP':
        return 'bg-blue-100'; // Azul claro para NP
      case 'NE':
        return 'bg-yellow-100'; // Amarelo claro para NE
      default:
        return 'bg-white';
    }
  };

  const getBorderColor = () => {
    if (isCompleted) return 'border-green-500';
    if (!canTake) return 'border-gray-300';
    
    switch (course.type) {
      case 'NB':
        return 'border-pink-400'; // Rosa para NB
      case 'NP':
        return 'border-blue-400'; // Azul para NP
      case 'NE':
        return 'border-yellow-400'; // Amarelo para NE
      default:
        return 'border-gray-400';
    }
  };

  const getTextColor = () => {
    if (isCompleted) return 'text-green-700';
    if (!canTake) return 'text-gray-500';
    
    switch (course.type) {
      case 'NB':
        return 'text-pink-700'; // Rosa escuro para NB
      case 'NP':
        return 'text-blue-700'; // Azul escuro para NP
      case 'NE':
        return 'text-yellow-700'; // Amarelo escuro para NE
      default:
        return 'text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'NB':
        return 'text-pink-600'; // Rosa para NB
      case 'NP':
        return 'text-blue-600'; // Azul para NP
      case 'NE':
        return 'text-yellow-600'; // Amarelo para NE
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className={`p-2 rounded-lg border-2 shadow-sm cursor-pointer ${getBgColor()} ${getBorderColor()}`}
      style={{ 
        width: 160,
        height: 100,
        minHeight: 100,
        maxHeight: 100
      }}
      onClick={() => onClick(course)}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <div className="flex flex-col h-full justify-between">
        <div className={`text-sm font-semibold leading-tight ${getTextColor()}`}>{course.name}</div>
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className={`${getTypeColor(course.type)}`}>{course.type}</span>
            <span className="text-gray-500">{course.id}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>{course.credits} créd.</span>
            <span>{course.hours}h</span>
            <button
              className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold border transition-colors
                ${isCompleted
                  ? 'bg-green-100 text-green-700 border-green-400 cursor-pointer'
                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 hover:text-gray-800 cursor-pointer'}
              `}
              onClick={e => {
                e.stopPropagation();
                onToggleCompletion(course.id);
              }}
              title={isCompleted ? 'Desmarcar como concluído' : 'Marcar como concluído'}
            >
              {isCompleted ? 'Concluído' : 'Concluir'}
            </button>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </div>
  );
};

// Componente para renderizar uma linha ortogonal inteligente
const OrthogonalEdge: React.FC<EdgeProps> = ({ 
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  source,
  target,
  style = {},
  markerEnd,
  data,
}) => {
  // Determinar o tipo de rota com base na posição relativa dos nós
  const isHorizontalFlow = Math.abs(targetY - sourceY) < 50; // Nós aproximadamente na mesma altura
  const isVerticalFlow = Math.abs(targetX - sourceX) < 50; // Nós aproximadamente na mesma coluna
  const isSameRow = Math.abs(targetY - sourceY) < 10; // Nós exatamente na mesma row
  const isLeftToRight = targetX > sourceX;
  const isTopToBottom = targetY > sourceY;
  const horizontalDistance = Math.abs(targetX - sourceX);
  const verticalDistance = Math.abs(targetY - sourceY);
  
  // Identificar se estas são conexões específicas
  const isElectroConnection = data?.isElectroConnection === true;
  const isTopographyConnection = data?.isTopographyConnection === true;
  
  // Calcular os pontos do caminho
  let pathPoints = [];
  
  // Caso especial: conexão Física -> Eletricidade
  if (isElectroConnection) {
    // Usamos os mesmos valores do exemplo anterior
    const initialExtend = 40;
    const approachDistance = 40;
    const middleRowY = Math.min(sourceY, targetY) + 75;
    
    pathPoints = [
      { x: sourceX, y: sourceY }, // Ponto inicial (Física)
      { x: sourceX + initialExtend, y: sourceY }, // Vai reto para a direita
      { x: sourceX + initialExtend, y: middleRowY }, // Desce
      { x: targetX - approachDistance, y: middleRowY }, // Vai para a direita até próximo do destino
      { x: targetX - approachDistance, y: targetY }, // Sobe
      { x: targetX, y: targetY } // Ponto final (Eletricidade)
    ];
  }
  // Caso especial: conexão Topografia -> Levantamentos Especiais
  else if (isTopographyConnection) {
    // Cria uma rota em S mais elaborada
    const quarterX = sourceX + (targetX - sourceX) * 0.25;
    const threeQuarterX = sourceX + (targetX - sourceX) * 0.75;
    const curveControlY = (sourceY + targetY) / 2;
    
    // Pontos para criar uma curva mais suave
    pathPoints = [
      { x: sourceX, y: sourceY }, // Ponto inicial (Topografia)
      { x: quarterX, y: sourceY }, // Primeiro trecho horizontal
      { x: quarterX, y: curveControlY - 30 }, // Desce um pouco
      { x: threeQuarterX, y: curveControlY + 30 }, // Ponto de controle no meio do caminho
      { x: threeQuarterX, y: targetY }, // Sobe para o nível do destino
      { x: targetX, y: targetY } // Ponto final (Levantamentos Especiais)
    ];
  }
  // Fluxo horizontal (mesma linha ou quase)
  else if (isHorizontalFlow) {
    if (isLeftToRight) {
      // De esquerda para direita (fluxo normal)
      pathPoints = [
        { x: sourceX, y: sourceY },
        { x: targetX, y: targetY }
      ];
    } else {
      // De direita para esquerda (precisa de rota mais complexa)
      const midX = (sourceX + targetX) / 2;
      const offsetY = 25; // Offset vertical para evitar sobreposição
      
      pathPoints = [
        { x: sourceX, y: sourceY },
        { x: sourceX + 20, y: sourceY },
        { x: sourceX + 20, y: sourceY - offsetY },
        { x: targetX - 20, y: sourceY - offsetY },
        { x: targetX - 20, y: targetY },
        { x: targetX, y: targetY }
      ];
    }
  }
  // Fluxo vertical (mesma coluna ou quase)
  else if (isVerticalFlow) {
    pathPoints = [
      { x: sourceX, y: sourceY },
      { x: sourceX, y: targetY },
      { x: targetX, y: targetY }
    ];
  }
  // Caso diagonal (fluxo normal, para baixo e para a direita)
  else if (isLeftToRight && isTopToBottom) {
    pathPoints = [
      { x: sourceX, y: sourceY },
      { x: sourceX + 30, y: sourceY },
      { x: sourceX + 30, y: targetY },
      { x: targetX, y: targetY }
    ];
  }
  // Caso diagonal reverso (para cima e para a direita)
  else if (isLeftToRight && !isTopToBottom) {
    // De baixo para cima, da esquerda para a direita
    const midX = sourceX + (targetX - sourceX) * 0.3;
    
    pathPoints = [
      { x: sourceX, y: sourceY },
      { x: midX, y: sourceY },
      { x: midX, y: targetY },
      { x: targetX, y: targetY }
    ];
  }
  // Caso diagonal reverso (para baixo e para a esquerda)
  else if (!isLeftToRight && isTopToBottom) {
    // De cima para baixo, da direita para a esquerda
    const offsetY = 30;
    
    pathPoints = [
      { x: sourceX, y: sourceY },
      { x: sourceX, y: sourceY + offsetY },
      { x: targetX, y: sourceY + offsetY },
      { x: targetX, y: targetY }
    ];
  }
  // Caso diagonal complexo (para cima e para a esquerda)
  else {
    // De baixo para cima, da direita para a esquerda (o mais complexo)
    const middleY = (sourceY + targetY) / 2;
    
    pathPoints = [
      { x: sourceX, y: sourceY },
      { x: sourceX - 30, y: sourceY },
      { x: sourceX - 30, y: middleY },
      { x: targetX - 30, y: middleY },
      { x: targetX - 30, y: targetY },
      { x: targetX, y: targetY }
    ];
  }
  
  if (data?.isCalculusToGeodesyConnection) {
    // Ajuste os valores conforme necessário para o layout do seu grafo
    const initialExtend = 40;
    const firstUp = 60;
    const secondExtend = targetX - (sourceX + initialExtend);
    const secondUp = sourceY - 80; // Ajuste a altura conforme necessário

    pathPoints = [
      { x: sourceX, y: sourceY }, // Ponto inicial
      { x: sourceX + initialExtend, y: sourceY }, // Vai reto para a direita
      { x: sourceX + initialExtend, y: sourceY - firstUp }, // Sobe
      { x: targetX - initialExtend, y: sourceY - firstUp }, // Vai para a direita até próximo do destino
      { x: targetX - initialExtend, y: targetY }, // Sobe
      { x: targetX, y: targetY } // Ponto final
    ];
  }
  
  if (data?.isCalculusToGeodesy2Connection) {
    // Ajuste os valores conforme necessário para o layout do seu grafo
    const periodoWidth = 230; // mesmo valor usado para calcular x dos nós
    const rowHeight = 150;    // mesmo valor usado para calcular y dos nós

    // Ponto inicial
    const startX = sourceX;
    const startY = sourceY;

    // 1. Vai reto para a direita (até o fim do nó)
    const right1X = startX + 40;
    const right1Y = startY;

    // 2. Desce (um pouco, para não colidir com o nó)
    const down1X = right1X;
    const down1Y = startY + 60;

    // 3. Vai para a direita 1 período
    const right2X = right1X + periodoWidth;
    const right2Y = down1Y;

    // 4. Desce até a row 7
    const row7Y = (7 - 1) * rowHeight + 50; // 50 é um ajuste para alinhar ao centro do nó

    // 5. Direita até o destino
    const finalX = targetX;
    const finalY = row7Y; // Alinhar horizontalmente com o destino

    pathPoints = [
      { x: startX, y: startY },         // Ponto inicial
      { x: right1X, y: right1Y },       // Vai reto para a direita
      { x: down1X, y: down1Y },         // Desce
      { x: right2X, y: right2Y },       // Vai para a direita 1 período
      { x: right2X, y: row7Y },         // Desce até a row 7
      { x: finalX, y: row7Y },          // Direita até alinhar com o destino
      { x: finalX, y: finalY }          // Ponto final
    ];
  }
  
  if (data?.isGeodesiaToGeometricaConnection) {
    const periodoWidth = 230;
    const rowHeight = 150;

    const startX = sourceX;
    const startY = sourceY;

    const right1X = startX + 40;
    const right1Y = startY;

    const up1X = right1X;
    const up1Y = (4 - 1) * rowHeight + 120;

    const right2X = (6 - 1) * periodoWidth + -40;
    const right2Y = up1Y;

    const up2X = right2X;
    const up2Y = (2 - 1) * rowHeight + 50;

    const finalX = targetX;

    pathPoints = [
      { x: startX, y: startY },
      { x: right1X, y: right1Y },
      { x: up1X, y: up1Y },
      { x: right2X, y: right2Y },
      { x: up2X, y: up2Y },
      { x: finalX, y: up2Y },
    ];
  }
  
  // Construir o SVG path a partir dos pontos
  const pathString = pathPoints.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x},${point.y}`;
    } else {
      return `${path} L ${point.x},${point.y}`;
    }
  }, '');
  
  return (
    <>
      {/* Caminho principal */}
      <path
        id={id}
        d={pathString}
        style={style}
        className="react-flow__edge-path"
        markerEnd={markerEnd}
      />
      
      {/* Pontos de controle para debugging visual (opcional) */}
      {data?.showControlPoints && pathPoints.map((point, index) => (
        <circle
          key={`${id}-point-${index}`}
          cx={point.x}
          cy={point.y}
          r={3}
          fill={index === 0 || index === pathPoints.length - 1 ? "transparent" : "#888"}
          stroke={index === 0 || index === pathPoints.length - 1 ? "transparent" : "#888"}
          style={{ pointerEvents: 'none' }}
        />
      ))}
    </>
  );
};

interface CurriculumFlowGraphProps {
  courses: Course[];
  prerequisites: Array<{ from: string; to: string; tipo: number }>;
  completedCourses: string[];
  onToggleCompletion: (id: string) => void;
  onCourseClick: (course: Course) => void;
}

const CurriculumFlowGraph: React.FC<CurriculumFlowGraphProps> = ({
  courses,
  prerequisites,
  completedCourses,
  onToggleCompletion,
  onCourseClick,
}) => {
  const nodeTypes = {
    courseNode: CourseNode,
  };

  // Define os tipos de aresta personalizados
  const edgeTypes: EdgeTypes = {
    electroLine: OrthogonalEdge,
    orthogonal: OrthogonalEdge,
  };

  // Identificar IDs dos cursos específicos
  // Como não temos acesso direto aos IDs, usaremos informações no código para identificá-los
  let electroMagneticCourseId = null;
  let appliedElectricityCourseId = null;
  let topographyCourseId = null;
  let specialSurveysCourseId = null;

  // Criar nós
  const nodes: Node[] = courses.map((course) => {
    // Identificar os cursos pelo nome
    if (course.name.includes("Física: Eletromagnetismo")) {
      electroMagneticCourseId = course.id;
    } else if (course.name.includes("Eletricidade Aplicada à Geomática")) {
      appliedElectricityCourseId = course.id;
    } else if (course.name.includes("Topografia: Levantamentos Planialtimétricos")) {
      topographyCourseId = course.id;
    } else if (course.name.includes("Levantamentos especiais")) {
      specialSurveysCourseId = course.id;
    }

    return {
      id: course.id,
      type: 'courseNode',
      position: { 
        x: (course.period - 1) * 230, 
        y: (course.row - 1) * 150 
      },
      data: {
        course,
        isCompleted: completedCourses.includes(course.id),
        canTake: prerequisites
          .filter(p => p.to === course.id)
          .every(p => completedCourses.includes(p.from)),
        onToggleCompletion,
        onClick: onCourseClick,
      },
    };
  });

  // Criar arestas (conexões)
  const edges: Edge[] = prerequisites.map((prereq) => {
    const isPrereqCompleted = completedCourses.includes(prereq.from);
    
    // Verificar se esta é a conexão específica que queremos personalizar
    const isElectroConnection = 
      prereq.from === electroMagneticCourseId && 
      prereq.to === appliedElectricityCourseId;
    
    // Verificar se esta é a conexão entre Topografia e Levantamentos Especiais
    const isTopographyConnection = 
      prereq.from === topographyCourseId && 
      prereq.to === specialSurveysCourseId;

    const isCalculusToGeodesyConnection =
      prereq.from === 'DPAA-2.0024' && prereq.to === 'DPAA-3.0077';

    const isCalculusToGeodesy2Connection =
      prereq.from === 'DPAA-2.0024' && prereq.to === 'DPAA-2.0195';

    const isGeodesiaToGeometricaConnection =
      prereq.from === 'DPAA-3.0054' && prereq.to === 'DPAA-3.0077';

    // Definir cor da aresta conforme o tipo
    let edgeColor = '#EF4444'; // vermelho padrão (pré-requisito)
    if (prereq.tipo === 2) edgeColor = '#3B82F6'; // azul (co-requisito)
    if (prereq.tipo === 3) edgeColor = '#FACC15'; // amarelo (pré-requisito flexível)
    
    return {
      id: `${prereq.from}-${prereq.to}`,
      source: prereq.from,
      target: prereq.to,
      // Usar tipo de aresta ortogonal para todas as conexões
      type: 'orthogonal',
      animated: true,
      style: { 
        stroke: isPrereqCompleted ? '#22C55E' : edgeColor,
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isPrereqCompleted ? '#22C55E' : edgeColor,
      },
      data: {
        isElectroConnection,
        isTopographyConnection,
        isCalculusToGeodesyConnection,
        isCalculusToGeodesy2Connection,
        isGeodesiaToGeometricaConnection,
        showControlPoints: false, // Definir como true para debugging
        fromName: courses.find(c => c.id === prereq.from)?.name,
        toName: courses.find(c => c.id === prereq.to)?.name,
      }
    };
  });

  return (
    <div style={{ width: '100%', height: '70vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: 'orthogonal',
          animated: true,
          style: { stroke: '#EF4444', strokeWidth: 2 },
          markerEnd: { 
            type: MarkerType.ArrowClosed, 
            color: '#EF4444' 
          },
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default CurriculumFlowGraph; 