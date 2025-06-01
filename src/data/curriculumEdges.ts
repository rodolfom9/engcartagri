import { Edge, MarkerType } from '@xyflow/react';

// Definição das linhas (edges) do gráfico de currículo
// Essas linhas representam os pré-requisitos entre disciplinas
export const curriculumEdges: Edge[] = [
  {
    id: '0.6991442044466698',
    source: 'DPAA-4.0018',
    target: 'DPAA-3.0070',
    type: 'positionable',
    style: { stroke: '#b1b1b7', strokeWidth: 2 },
    data: { positionHandlers: [{"x":264.4553762103023,"y":719.0124628491689,"active":-1},{"x":401.8526077926811,"y":719.6178378437558,"active":-1},{"x":843.9399270902616,"y":719.5347599867216,"active":-1}], type: 'smoothstep' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#b1b1b7',
    },
  },
  {
    id: '0.21497275352496992',
    source: 'DPAA-2.0302',
    target: 'DPAA-2.0035',
    type: 'positionable',
    style: { stroke: '#b1b1b7', strokeWidth: 2 },
    data: { positionHandlers: [{"x":209.13258740757445,"y":282.3376651353146,"active":-1},{"x":410.37033556780983,"y":282.3376651353146,"active":-1}], type: 'smoothstep' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#b1b1b7',
    },
  },
  {
    id: 'edge-DPAA-3.0072-DPAA-3.0001',
    source: 'DPAA-3.0072',
    target: 'DPAA-3.0001',
    type: 'positionable',
    style: { stroke: '#b1b1b7', strokeWidth: 2 },
    data: { positionHandlers: [], type: 'smoothstep' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#b1b1b7',
    },
  },
  {
    id: 'edge-DPAA-2.0024-DPAA-3.0077',
    source: 'DPAA-2.0024',
    target: 'DPAA-3.0077',
    type: 'positionable',
    style: { stroke: '#b1b1b7', strokeWidth: 2 },
    data: { positionHandlers: [{"x":332.68469131501666,"y":265.6368426286379,"active":-1}], type: 'smoothstep' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#b1b1b7',
    },
  },
  {
    id: 'edge-DPAA-2.0303-DPAA-3.0061',
    source: 'DPAA-2.0303',
    target: 'DPAA-3.0061',
    type: 'positionable',
    style: { stroke: '#b1b1b7', strokeWidth: 2 },
    data: { positionHandlers: [{"x":413.83181939225227,"y":538.9739534945093,"active":-1}], type: 'smoothstep' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#b1b1b7',
    },
  }
];

// Função para adicionar uma nova linha à lista
export const addEdgeToList = (edge: Edge): Edge[] => {
  // Verificar se a edge já existe para evitar duplicatas
  const exists = curriculumEdges.some(e => e.id === edge.id);
  if (!exists) {
    curriculumEdges.push(edge);
  }
  return [...curriculumEdges];
};

// Função para remover uma linha da lista
export const removeEdgeFromList = (edgeId: string): Edge[] => {
  const index = curriculumEdges.findIndex(edge => edge.id === edgeId);
  if (index !== -1) {
    curriculumEdges.splice(index, 1);
  }
  return [...curriculumEdges];
};