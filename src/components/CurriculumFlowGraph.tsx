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

// Componente para renderizar uma linha personalizada com um caminho ortogonal
const CustomElectroLine: React.FC<EdgeProps> = ({ 
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}) => {
  // Criar um caminho ortogonal (com ângulos de 90°) com múltiplos segmentos
  
  // 1. Calculamos a distância horizontal entre os pontos de origem e destino
  const horizontalDistance = targetX - sourceX;
  
  // 2. Definimos quanto queremos estender horizontalmente antes de descer
  const initialExtend = 40; // Estende 40px para a direita antes de descer
  
  // 3. Calculamos a posição da linha horizontal entre as rows 1 e 2
  // Considerando que a row 1 está em y=0 e a row 2 em y=150, queremos algo entre elas
  const middleRowY = Math.min(sourceY, targetY) + 75; // Meio do caminho entre as rows
  
  // 4. Calculamos quanto precisamos nos aproximar horizontalmente do destino antes de subir
  const approachDistance = 40; // Aproxima 40px do destino antes de subir
  
  // 5. Construímos o caminho ponto a ponto
  // Ponto inicial (em Física)
  const p1 = { x: sourceX, y: sourceY };
  
  // Ponto após ir reto para a direita
  const p2 = { x: sourceX + initialExtend, y: sourceY };
  
  // Ponto após descer
  const p3 = { x: sourceX + initialExtend, y: middleRowY };
  
  // Ponto após virar à direita e ir até próximo do destino
  const p4 = { x: targetX - approachDistance, y: middleRowY };
  
  // Ponto após subir
  const p5 = { x: targetX - approachDistance, y: targetY };
  
  // Ponto final (em Eletricidade)
  const p6 = { x: targetX, y: targetY };
  
  // Criar um path SVG com os segmentos da linha
  const pathString = `M ${p1.x},${p1.y} 
                      L ${p2.x},${p2.y} 
                      L ${p3.x},${p3.y} 
                      L ${p4.x},${p4.y} 
                      L ${p5.x},${p5.y} 
                      L ${p6.x},${p6.y}`;
  
  return (
    <>
      {/* Linha principal com o caminho ortogonal */}
      <path
        id={id}
        d={pathString}
        style={style}
        className="react-flow__edge-path"
        markerEnd={markerEnd}
      />
      
      {/* Pontos de controle para debugging visual (opcional) */}
      {[p1, p2, p3, p4, p5, p6].map((point, index) => (
        <circle
          key={`${id}-point-${index}`}
          cx={point.x}
          cy={point.y}
          r={3}
          fill={index === 0 || index === 5 ? "transparent" : "#888"}
          stroke={index === 0 || index === 5 ? "transparent" : "#888"}
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
    electroLine: CustomElectroLine,
  };

  // Identificar IDs dos cursos específicos
  // Como não temos acesso direto aos IDs, usaremos informações no código para identificá-los
  let electroMagneticCourseId = null;
  let appliedElectricityCourseId = null;

  // Criar nós
  const nodes: Node[] = courses.map((course) => {
    // Identificar os cursos pelo nome
    if (course.name.includes("Física: Eletromagnetismo")) {
      electroMagneticCourseId = course.id;
    } else if (course.name.includes("Eletricidade Aplicada à Geomática")) {
      appliedElectricityCourseId = course.id;
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
    
    return {
      id: `${prereq.from}-${prereq.to}`,
      source: prereq.from,
      target: prereq.to,
      // Usar tipo personalizado apenas para a conexão específica
      type: isElectroConnection ? 'electroLine' : 'smoothstep',
      animated: true,
      style: { 
        stroke: isPrereqCompleted ? '#22C55E' : '#EF4444',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isPrereqCompleted ? '#22C55E' : '#EF4444',
      },
      // Adicionar dados extras para debugging
      data: {
        isCustom: isElectroConnection,
        fromName: courses.find(c => c.id === prereq.from)?.name,
        toName: courses.find(c => c.id === prereq.to)?.name,
      }
    };
  });

  // Para debugging
  console.log("Eletro IDs:", { 
    from: electroMagneticCourseId, 
    to: appliedElectricityCourseId,
    fromName: courses.find(c => c.id === electroMagneticCourseId)?.name,
    toName: courses.find(c => c.id === appliedElectricityCourseId)?.name 
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
          type: 'smoothstep',
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