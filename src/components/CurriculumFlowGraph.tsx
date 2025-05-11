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
import PrerequisiteArrow from './PrerequisiteArrow';

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

// Componente de borda personalizada que usa o componente PrerequisiteArrow
const SmartArrowEdge: React.FC<EdgeProps> = ({ 
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  style = {},
  data,
}) => {
  const nodeWidth = 160; // Largura padrão do nó
  const nodeHeight = 100; // Altura padrão do nó
  
  // Ajuste para posicionar corretamente a flecha com base na posição das alças
  const fromPosition = {
    left: sourceX,
    top: sourceY - nodeHeight / 2 // Centralizar verticalmente
  };

  const toPosition = {
    left: targetX,
    top: targetY - nodeHeight / 2 // Centralizar verticalmente
  };

  // Determina se é uma conexão na mesma linha horizontal
  const isDirectConnection = Math.abs(sourceY - targetY) < 10;
  
  // Calcula a diferença de linhas
  const rowDifference = Math.round((targetY - sourceY) / 150); // Assumindo 150px entre linhas
  
  // Verifica se há informações de tipo de pré-requisito
  const tipo = data?.tipo || 1;
  
  // Extrai as posições de obstáculos dos dados da aresta, se disponíveis
  const obstaclePositions = data?.obstaclePositions || [];

  return (
    <PrerequisiteArrow
      fromPosition={fromPosition}
      toPosition={toPosition}
      isDirectConnection={isDirectConnection}
      rowDifference={rowDifference}
      boxWidth={nodeWidth}
      boxHeight={nodeHeight}
      tipo={tipo}
      obstaclePositions={obstaclePositions}
    />
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
    smartArrow: SmartArrowEdge,
  };

  // Criar nós
  const nodes: Node[] = courses.map((course) => {
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

  // Criar posições de todos os nós para detecção de obstáculos
  const nodePositions = nodes.map(node => ({
    left: node.position.x,
    top: node.position.y
  }));

  // Criar arestas (conexões) com informações de obstáculos
  const edges: Edge[] = prerequisites.map((prereq) => {
    const isPrereqCompleted = completedCourses.includes(prereq.from);
    
    // Encontrar os nós fonte e alvo
    const sourceNode = nodes.find(n => n.id === prereq.from);
    const targetNode = nodes.find(n => n.id === prereq.to);
    
    // Calcular obstáculos (excluindo os nós fonte e alvo)
    const obstacles = nodePositions.filter(pos => {
      // Excluir os nós fonte e alvo
      return (
        !(pos.left === sourceNode?.position.x && pos.top === sourceNode?.position.y) &&
        !(pos.left === targetNode?.position.x && pos.top === targetNode?.position.y)
      );
    });
    
    return {
      id: `${prereq.from}-${prereq.to}`,
      source: prereq.from,
      target: prereq.to,
      type: 'smartArrow',
      animated: true,
      style: { 
        stroke: isPrereqCompleted ? '#22C55E' : '#EF4444',
        strokeWidth: 2,
      },
      data: {
        tipo: prereq.tipo,
        fromName: courses.find(c => c.id === prereq.from)?.name,
        toName: courses.find(c => c.id === prereq.to)?.name,
        obstaclePositions: obstacles
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
          type: 'smartArrow',
          animated: true,
          style: { stroke: '#EF4444', strokeWidth: 2 },
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default CurriculumFlowGraph;
