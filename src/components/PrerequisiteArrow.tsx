
import React from 'react';

// Define o tipo para as coordenadas de posição
interface Position {
  left: number;  // Posição horizontal em pixels
  top: number;   // Posição vertical em pixels
}

// Props do componente de seta
interface PrerequisiteArrowProps {
  fromPosition: Position;      // Posição inicial da seta (disciplina de origem)
  toPosition: Position;        // Posição final da seta (disciplina de destino)
  isDirectConnection: boolean; // Indica se é uma conexão direta (mesma linha) ou não
  rowDifference?: number;      // Diferença entre as linhas (opcional)
  boxWidth: number;            // Largura da caixa da disciplina
  boxHeight?: number;          // Altura da caixa da disciplina (opcional, adicionado para melhor cálculo de rotas)
  tipo?: number;               // 1: Pré-requisito, 2: Có-requisito, 3: Pré-requisito flexível
  obstaclePositions?: Position[]; // Posições de outras disciplinas (obstáculos) para evitar
}

/**
 * Componente que renderiza uma seta de pré-requisito entre duas disciplinas
 * com estilo visual similar ao Lucidchart (rotas ortogonais com cantos arredondados)
 * e inteligente o suficiente para desviar de obstáculos
 */
const PrerequisiteArrow: React.FC<PrerequisiteArrowProps> = ({
  fromPosition,
  toPosition,
  isDirectConnection,
  rowDifference = 0,
  boxWidth,
  boxHeight = 100, // Altura padrão se não for fornecida
  tipo = 1,
  obstaclePositions = []
}) => {
  // Determinar a cor da seta baseado no tipo
  const getArrowColor = () => {
    switch (tipo) {
      case 2: return '#FFD700'; // Amarelo para có-requisito
      case 3: return '#3B82F6'; // Azul para pré-requisito flexível
      default: return '#4040F2'; // Azul escuro para pré-requisito normal (estilo Lucidchart)
    }
  };

  const arrowColor = getArrowColor();
  
  // Pontos iniciais e finais da seta
  const startX = fromPosition.left + boxWidth;
  const startY = fromPosition.top + boxHeight / 2;
  const endX = toPosition.left;
  const endY = toPosition.top + boxHeight / 2;
  
  // Largura e altura do SVG para conter os elementos
  const svgWidth = Math.max(1000, Math.abs(endX - startX) + 200);
  const svgHeight = Math.max(800, Math.abs(endY - startY) + 200);
  
  // Raio para os cantos arredondados (estilo Lucidchart)
  const cornerRadius = 10;
  
  // Função para verificar se um ponto de caminho colidirá com algum obstáculo
  const willCollideWithObstacle = (x: number, y: number): boolean => {
    // Margem de segurança ao redor das caixas
    const safetyMargin = 15;
    
    for (const obstacle of obstaclePositions) {
      // Verificar se o ponto está dentro da área de uma caixa de disciplina
      if (
        x >= obstacle.left - safetyMargin && 
        x <= obstacle.left + boxWidth + safetyMargin &&
        y >= obstacle.top - safetyMargin && 
        y <= obstacle.top + boxHeight + safetyMargin
      ) {
        return true;
      }
    }
    
    return false;
  };
  
  // Função para encontrar um caminho alternativo se houver colisão
  const findAlternativePath = (x1: number, y1: number, x2: number, y2: number): { x: number, y: number }[] => {
    // Caso básico: linha reta sem obstáculos
    if (!willCollideWithObstacle((x1 + x2) / 2, (y1 + y2) / 2)) {
      return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    }
    
    // Estratégia: tentar contornar o obstáculo acima ou abaixo
    const offsetY = boxHeight * 1.5;
    const midX = (x1 + x2) / 2;
    
    // Tentar caminho pelo topo
    const topPath = [
      { x: x1, y: y1 },
      { x: midX, y: y1 },
      { x: midX, y: Math.min(y1, y2) - offsetY },
      { x: x2, y: Math.min(y1, y2) - offsetY },
      { x: x2, y: y2 }
    ];
    
    // Verificar se o caminho pelo topo é livre
    const topPathClear = topPath.every(point => !willCollideWithObstacle(point.x, point.y));
    
    if (topPathClear) {
      return topPath;
    }
    
    // Tentar caminho pelo fundo
    const bottomPath = [
      { x: x1, y: y1 },
      { x: midX, y: y1 },
      { x: midX, y: Math.max(y1, y2) + offsetY },
      { x: x2, y: Math.max(y1, y2) + offsetY },
      { x: x2, y: y2 }
    ];
    
    // Verificar se o caminho pelo fundo é livre
    const bottomPathClear = bottomPath.every(point => !willCollideWithObstacle(point.x, point.y));
    
    if (bottomPathClear) {
      return bottomPath;
    }
    
    // Se ambos falharem, tente um caminho mais longo
    const farOffset = offsetY * 2;
    
    return [
      { x: x1, y: y1 },
      { x: x1 + boxWidth / 2, y: y1 },
      { x: x1 + boxWidth / 2, y: y1 < y2 ? y1 - farOffset : y1 + farOffset },
      { x: x2 - boxWidth / 2, y: y1 < y2 ? y1 - farOffset : y1 + farOffset },
      { x: x2 - boxWidth / 2, y: y2 },
      { x: x2, y: y2 }
    ];
  };
  
  // Gerar caminho ortogonal com cantos arredondados e desvio de obstáculos
  const generatePathData = () => {
    // Para conexão direta, usar linha reta se não houver obstáculos
    if (isDirectConnection && !willCollideWithObstacle((startX + endX) / 2, (startY + endY) / 2)) {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }
    
    // Para conexões entre linhas diferentes ou com obstáculos, criar um caminho inteligente
    const isLeftToRight = endX > startX;
    
    // Decisão de roteamento: preferimos primeiro ir para baixo/cima e depois para os lados
    // pois isso é o padrão do Lucidchart para diagramas de fluxo
    
    // Ponto médio vertical entre as duas disciplinas
    const midY = (startY + endY) / 2;
    
    // Se estamos indo para a direita e sem obstáculos no caminho padrão
    if (isLeftToRight) {
      // 1. Verificar se o caminho padrão está livre de obstáculos
      const standardPoints = [
        { x: startX, y: startY },
        { x: startX + cornerRadius, y: startY },
        { x: startX + cornerRadius, y: midY },
        { x: endX - cornerRadius, y: midY },
        { x: endX - cornerRadius, y: endY },
        { x: endX, y: endY }
      ];
      
      const pathIsClear = standardPoints.every(point => !willCollideWithObstacle(point.x, point.y));
      
      if (pathIsClear) {
        // Construir o caminho SVG com comandos padrão
        let path = `M ${startX} ${startY}`;
        
        // Se estamos indo para a direita, primeiro vamos para baixo/cima e depois para a direita
        // Verificar se precisa de arcos arredondados
        if (startY !== midY) {
          // Ajustar o ponto final da linha para começar o arco
          const lineEndY = startY < midY ? midY - cornerRadius : midY + cornerRadius;
          path += ` L ${startX} ${lineEndY}`;
          
          // Adicionar arco no canto
          const arcSweep = startY < midY ? 0 : 1;
          path += ` A ${cornerRadius} ${cornerRadius} 0 0 ${arcSweep} ${startX + cornerRadius} ${midY}`;
        } else {
          path += ` L ${startX} ${midY}`;
        }
        
        // Linha horizontal até próximo do destino
        const lineEndX = endX - cornerRadius;
        path += ` L ${lineEndX} ${midY}`;
        
        // Arco para começar a subir/descer para o destino
        const arcSweep = midY < endY ? 0 : 1;
        path += ` A ${cornerRadius} ${cornerRadius} 0 0 ${arcSweep} ${endX} ${midY + (midY < endY ? cornerRadius : -cornerRadius)}`;
        
        // Linha final vertical até o destino
        path += ` L ${endX} ${endY}`;
        
        return path;
      }
    }
    
    // Se o caminho padrão não estiver livre ou estivermos indo para a esquerda
    // Vamos encontrar um caminho alternativo
    const pathPoints = findAlternativePath(startX, startY, endX, endY);
    
    // Converter os pontos em um caminho SVG
    let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    
    for (let i = 1; i < pathPoints.length; i++) {
      path += ` L ${pathPoints[i].x} ${pathPoints[i].y}`;
    }
    
    return path;
  };
  
  // Função para renderizar os conectores (quadrados) nos pontos de junção
  const renderConnectors = () => {
    // Tamanho do conector (metade da largura/altura)
    const connectorSize = 3;
    const connectors = [];
    
    // Origem
    connectors.push(
      <rect
        key="start-connector"
        x={startX - connectorSize}
        y={startY - connectorSize}
        width={connectorSize * 2}
        height={connectorSize * 2}
        fill="#fff"
        stroke={arrowColor}
        strokeWidth={1}
      />
    );
    
    // Pontos intermediários - simplificado para demonstração
    // Em uma implementação mais sofisticada, calcularíamos os pontos de junção precisos
    const midY = (startY + endY) / 2;
    
    if (!isDirectConnection) {
      if (endX > startX) {
        // Conector no ponto de mudança de direção (vertical -> horizontal)
        connectors.push(
          <rect
            key="mid-connector-1"
            x={startX - connectorSize}
            y={midY - connectorSize}
            width={connectorSize * 2}
            height={connectorSize * 2}
            fill="#fff"
            stroke={arrowColor}
            strokeWidth={1}
          />
        );
        
        // Conector no ponto de mudança de direção (horizontal -> vertical)
        connectors.push(
          <rect
            key="mid-connector-2"
            x={endX - connectorSize}
            y={midY - connectorSize}
            width={connectorSize * 2}
            height={connectorSize * 2}
            fill="#fff"
            stroke={arrowColor}
            strokeWidth={1}
          />
        );
      } else {
        // Para setas da direita para a esquerda, adicionar conectores nos pontos de dobra
        const offsetX = 30;
        const deviationY = startY < endY ? startY + 2*cornerRadius : startY - 2*cornerRadius;
        
        // Primeiro ponto de dobra
        connectors.push(
          <rect
            key="mid-connector-1"
            x={startX - offsetX - connectorSize}
            y={deviationY - connectorSize}
            width={connectorSize * 2}
            height={connectorSize * 2}
            fill="#fff"
            stroke={arrowColor}
            strokeWidth={1}
          />
        );
        
        // Segundo ponto de dobra
        connectors.push(
          <rect
            key="mid-connector-2"
            x={startX - offsetX - connectorSize}
            y={midY - connectorSize}
            width={connectorSize * 2}
            height={connectorSize * 2}
            fill="#fff"
            stroke={arrowColor}
            strokeWidth={1}
          />
        );
        
        // Terceiro ponto de dobra
        connectors.push(
          <rect
            key="mid-connector-3"
            x={endX - connectorSize}
            y={midY - connectorSize}
            width={connectorSize * 2}
            height={connectorSize * 2}
            fill="#fff"
            stroke={arrowColor}
            strokeWidth={1}
          />
        );
      }
    }
    
    return connectors;
  };
  
  // Gerar o caminho SVG
  const pathData = generatePathData();
  
  return (
    <svg
      className="absolute z-10"
      width={svgWidth}
      height={svgHeight}
      style={{ top: 0, left: 0, pointerEvents: 'none' }}
    >
      {/* Definição da ponta da seta (estilo Lucidchart) */}
      <defs>
        <marker
          id={`arrowhead-${tipo}`}
          markerWidth="12"
          markerHeight="10"
          refX="10"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M0,0 L10,5 L0,10 Z"
            fill="#000000" // Preto para a ponta da seta (padrão Lucidchart)
          />
        </marker>
      </defs>
      
      {/* Caminho principal da seta */}
      <path
        d={pathData}
        fill="none"
        stroke={arrowColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={tipo === 3 ? "8,4" : "none"} // Tracejado para tipo 3 (pré-requisito flexível)
        markerEnd={`url(#arrowhead-${tipo})`}
      />
      
      {/* Conectores nos pontos de junção */}
      {renderConnectors()}
    </svg>
  );
};

export default PrerequisiteArrow;
