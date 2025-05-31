import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  NodeProps,
  Connection,
  addEdge,
  Handle,
  Position,
  MarkerType,
  useEdgesState,
  ConnectionMode,
} from '@xyflow/react';
import { Course } from '@/types/curriculum';
import PositionableEdge from './PositionableEdge';
import { curriculumEdges, addEdgeToList } from '@/data/curriculumEdges';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  courses: Course[];
  completedCourses: string[];
  onToggleCompletion: (id: string) => void;
  onCourseClick: (course: Course) => void;
}

interface CourseNodeProps extends NodeProps {
  data: {
    course: Course;
    isCompleted: boolean;
    onToggleCompletion: (id: string) => void;
    onClick: (course: Course) => void;
  };
}

const CourseNode = ({ data }: CourseNodeProps) => {
  const { course, isCompleted, onToggleCompletion, onClick } = data;
  
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
    <>
      {/* Handle esquerdo para conexões de entrada */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#555',
          width: 8,
          height: 8,
          border: '2px solid #fff',
        }}
      />
      
      {/* Handle direito para conexões de saída */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#555',
          width: 8,
          height: 8,
          border: '2px solid #fff',
        }}
      />
      
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
    </div>
    </>
  );
};

const nodeTypes = {
  courseNode: CourseNode,
};

const edgeTypes = {
  positionable: PositionableEdge,
};

export default function CurriculumFlowGraph({ 
  courses, 
  completedCourses, 
  onToggleCompletion, 
  onCourseClick 
}: Props) {
  const { user } = useAuth(); // Hook para verificar autenticação
  // Função para garantir que as edges tenham a estrutura correta e aplicar cores baseadas na conclusão
  const sanitizeEdges = (edges: Edge[]): Edge[] => {
    return edges.map(edge => {
      // Verificar se o curso pré-requisito (source) foi concluído
      const isPrerequisiteCompleted = completedCourses.includes(edge.source || '');
      
      // Definir cores baseadas na conclusão do pré-requisito
      const strokeColor = isPrerequisiteCompleted ? '#10b981' : '#ef4444'; // Verde para concluído, vermelho para não concluído
      const markerColor = strokeColor;
      
      return {
        ...edge,
        data: { 
          ...(edge.data || {}), 
          positionHandlers: edge.data?.positionHandlers || [], 
          type: 'smoothstep',
          userAuthenticated: !!user // Passar informação de autenticação para a edge
        },
        type: edge.type || 'positionable',
        style: { 
          ...(edge.style || {}),
          stroke: strokeColor, 
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: markerColor,
        }
      };
    });
  };

  // Inicializar com as edges sanitizadas
  const [edges, setEdges, onEdgesChange] = useEdgesState(sanitizeEdges(curriculumEdges));
  
  // Atualizar cores das edges quando o status de conclusão dos cursos mudar
  useEffect(() => {
    setEdges(sanitizeEdges(curriculumEdges));
  }, [completedCourses, setEdges]);
  
  const onConnect = useCallback(
    (params: Connection) => {
      // Bloquear criação de novas conexões se o usuário não estiver autenticado
      if (!user) {
        return;
      }

      // Garantir que todos os campos obrigatórios estão presentes
      if (!params.source || !params.target) {
        console.error('Conexão inválida: source ou target ausente', params);
        return;
      }

      // Verificar se o curso pré-requisito foi concluído para definir a cor
      const isPrerequisiteCompleted = completedCourses.includes(params.source || '');
      const strokeColor = isPrerequisiteCompleted ? '#10b981' : '#ef4444'; // Verde para concluído, vermelho para não concluído

      const newEdge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: 'positionable',
        style: { stroke: strokeColor, strokeWidth: 2 },
        data: { positionHandlers: [], type: 'smoothstep', userAuthenticated: true },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
        },
      };

      // Verificar se a edge já existe para evitar duplicatas
      const edgeExists = edges.some(e => e.id === newEdge.id);
      if (edgeExists) {
        console.log('Edge já existe, ignorando:', newEdge.id);
        return;
      }

      // Adicionar a nova edge tanto ao estado quanto à lista permanente
      setEdges((eds) => {
        const updatedEdges = addEdge(newEdge, eds);
        // Adicionar à lista permanente
        addEdgeToList(newEdge);
        return updatedEdges;
      });
    },
    [edges, setEdges, completedCourses, user]
  );
  console.log('CurriculumFlowGraph - courses:', courses);
  console.log('CurriculumFlowGraph - completedCourses:', completedCourses);
  
  // Se não há cursos, criar dados de teste
  const testCourses = courses.length === 0 ? [
    {
      id: "CALC1",
      name: "Cálculo I",
      period: 1,
      row: 1,
      hours: "90h",
      type: "NB" as const,
      credits: 6,
      professor: "Prof. Test"
    },
    {
      id: "FISICA1", 
      name: "Física I",
      period: 1,
      row: 2,
      hours: "90h",
      type: "NB" as const,
      credits: 6,
      professor: "Prof. Test"
    },
    {
      id: "CALC2",
      name: "Cálculo II", 
      period: 2,
      row: 1,
      hours: "90h",
      type: "NB" as const,
      credits: 6,
      professor: "Prof. Test"
    }
  ] : courses;
  
  const flowNodes: Node[] = testCourses.map((course) => ({
    id: course.id,
    type: 'courseNode',
    position: { x: (course.period - 1) * 230, y: (course.row - 1) * 150 },
    data: {
      course,
      isCompleted: completedCourses.includes(course.id),
      onToggleCompletion,
      onClick: onCourseClick,
    },
  }));

  // Função para exportar as linhas atuais
  const handleExportEdges = useCallback(() => {
    try {
      // Verificar se há edges para exportar
      if (edges.length === 0) {
        alert('Não há linhas para exportar. Adicione algumas conexões primeiro.');
        return;
      }
      
      // Formatar as linhas para o formato do código
      const edgesCode = edges.map(edge => {
        // Garantir que todos os campos obrigatórios estão presentes
        if (!edge.source || !edge.target) {
          console.error('Edge inválida:', edge);
          return '';
        }
        
        return `  {
    id: '${edge.id}',
    source: '${edge.source}',
    target: '${edge.target}',
    type: 'positionable',
    style: { stroke: '#b1b1b7', strokeWidth: 2 },
    data: { positionHandlers: ${JSON.stringify(edge.data?.positionHandlers || [])}, type: 'smoothstep' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#b1b1b7',
    },
  }`;
      }).filter(Boolean).join(',\n');
      
      // Criar o código completo para o arquivo
      const fileContent = `import { Edge, MarkerType } from '@xyflow/react';\n\n// Definição das linhas (edges) do gráfico de currículo\n// Essas linhas representam os pré-requisitos entre disciplinas\nexport const curriculumEdges: Edge[] = [\n${edgesCode}\n];\n\n// Função para adicionar uma nova linha à lista\nexport const addEdgeToList = (edge: Edge): Edge[] => {\n  // Verificar se a edge já existe para evitar duplicatas\n  const exists = curriculumEdges.some(e => e.id === edge.id);\n  if (!exists) {\n    curriculumEdges.push(edge);\n  }\n  return [...curriculumEdges];\n};\n\n// Função para remover uma linha da lista\nexport const removeEdgeFromList = (edgeId: string): Edge[] => {\n  const index = curriculumEdges.findIndex(edge => edge.id === edgeId);\n  if (index !== -1) {\n    curriculumEdges.splice(index, 1);\n  }\n  return [...curriculumEdges];\n};`;
      
      // Criar um elemento de texto temporário
      const textArea = document.createElement('textarea');
      textArea.value = fileContent;
      document.body.appendChild(textArea);
      textArea.select();
      
      // Copiar para a área de transferência
      document.execCommand('copy');
      
      // Remover o elemento temporário
      document.body.removeChild(textArea);
      
      alert('Código copiado para a área de transferência! Cole-o no arquivo src/data/curriculumEdges.ts');
    } catch (error) {
      console.error('Erro ao exportar linhas:', error);
      alert('Ocorreu um erro ao exportar as linhas. Verifique o console para mais detalhes.');
    }
  }, [edges]);
  
  // Função para exportar como arquivo
  const handleDownloadEdges = useCallback(() => {
    try {
      // Verificar se há edges para exportar
      if (edges.length === 0) {
        alert('Não há linhas para exportar. Adicione algumas conexões primeiro.');
        return;
      }
      
      // Formatar as linhas para o formato do código
      const edgesCode = edges.map(edge => {
        // Garantir que todos os campos obrigatórios estão presentes
        if (!edge.source || !edge.target) {
          console.error('Edge inválida:', edge);
          return '';
        }
        
        return `  {
    id: '${edge.id}',
    source: '${edge.source}',
    target: '${edge.target}',
    type: 'positionable',
    style: { stroke: '#b1b1b7', strokeWidth: 2 },
    data: { positionHandlers: ${JSON.stringify(edge.data?.positionHandlers || [])}, type: 'smoothstep' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#b1b1b7',
    },
  }`;
      }).filter(Boolean).join(',\n');
      
      // Criar o código completo para o arquivo
      const fileContent = `import { Edge, MarkerType } from '@xyflow/react';\n\n// Definição das linhas (edges) do gráfico de currículo\n// Essas linhas representam os pré-requisitos entre disciplinas\nexport const curriculumEdges: Edge[] = [\n${edgesCode}\n];\n\n// Função para adicionar uma nova linha à lista\nexport const addEdgeToList = (edge: Edge): Edge[] => {\n  // Verificar se a edge já existe para evitar duplicatas\n  const exists = curriculumEdges.some(e => e.id === edge.id);\n  if (!exists) {\n    curriculumEdges.push(edge);\n  }\n  return [...curriculumEdges];\n};\n\n// Função para remover uma linha da lista\nexport const removeEdgeFromList = (edgeId: string): Edge[] => {\n  const index = curriculumEdges.findIndex(edge => edge.id === edgeId);\n  if (index !== -1) {\n    curriculumEdges.splice(index, 1);\n  }\n  return [...curriculumEdges];\n};`;
      
      // Criar um elemento de link para download
      const element = document.createElement('a');
      const file = new Blob([fileContent], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = 'curriculumEdges.ts';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Erro ao baixar arquivo de linhas:', error);
      alert('Ocorreu um erro ao baixar o arquivo. Verifique o console para mais detalhes.');
    }
  }, [edges]);

  return (
    <div className="h-full relative">
      {/* Mostrar botões apenas se o usuário estiver logado */}
      {user && (
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <button 
            onClick={handleExportEdges}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            title="Copiar código para a área de transferência"
          >
            Copiar Código das Linhas
          </button>
          <button 
            onClick={handleDownloadEdges}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            title="Baixar arquivo curriculumEdges.ts"
          >
            Baixar Arquivo
          </button>
        </div>
      )}
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        nodesDraggable={true}
        nodesConnectable={!!user} // Só permite conectar nós se o usuário estiver autenticado
        elementsSelectable={true}
        connectionMode={ConnectionMode.Loose}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
