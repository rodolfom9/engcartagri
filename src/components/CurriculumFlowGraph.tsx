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
    
    return {
      id: `${prereq.from}-${prereq.to}`,
      source: prereq.from,
      target: prereq.to,
      // Usar tipo de aresta ortogonal para todas as conexões
      type: 'orthogonal',
      animated: true,
      style: { 
        stroke: isPrereqCompleted ? '#22C55E' : '#EF4444',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isPrereqCompleted ? '#22C55E' : '#EF4444',
      },
      data: {
        isElectroConnection,
        isTopographyConnection,
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