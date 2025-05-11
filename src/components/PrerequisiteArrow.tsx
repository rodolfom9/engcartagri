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
  tipo?: number;               // 1: Pré-requisito, 2: Có-requisito, 3: Pré-requisito flexível
  allBoxes?: { left: number, top: number, width: number, height: number }[]; // Todas as caixas para desvio inteligente
}

/**
 * Componente que renderiza uma seta de pré-requisito entre duas disciplinas
 * com estilo visual similar ao Lucidchart (rotas ortogonais com cantos arredondados)
 */
const PrerequisiteArrow: React.FC<PrerequisiteArrowProps> = ({
  fromPosition,
  toPosition,
  isDirectConnection,
  rowDifference = 0,
  boxWidth,
  tipo = 1,
  allBoxes = []
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
  const startY = fromPosition.top;
  const endX = toPosition.left;
  const endY = toPosition.top;
  
  // Largura e altura do SVG para conter os elementos
  const svgWidth = Math.max(1000, Math.abs(endX - startX) + 200);
  const svgHeight = Math.max(800, Math.abs(endY - startY) + 200);
  
  // Raio para os cantos arredondados (estilo Lucidchart)
  const cornerRadius = 10;
  
  // Função utilitária para detectar colisão entre um segmento e uma caixa
  function segmentIntersectsBox(x1: number, y1: number, x2: number, y2: number, box: {left: number, top: number, width: number, height: number}) {
    // Checa se o segmento cruza o retângulo da caixa
    const boxLeft = box.left;
    const boxRight = box.left + box.width;
    const boxTop = box.top;
    const boxBottom = box.top + box.height;
    // Segmento completamente à esquerda/direita/acima/abaixo
    if ((x1 < boxLeft && x2 < boxLeft) || (x1 > boxRight && x2 > boxRight) || (y1 < boxTop && y2 < boxTop) || (y1 > boxBottom && y2 > boxBottom)) {
      return false;
    }
    // Para simplificação, só checa se cruza a área da caixa (não precisa ser perfeito)
    // Checa se algum ponto está dentro
    if ((x1 >= boxLeft && x1 <= boxRight && y1 >= boxTop && y1 <= boxBottom) ||
        (x2 >= boxLeft && x2 <= boxRight && y2 >= boxTop && y2 <= boxBottom)) {
      return true;
    }
    // Pode adicionar checagem de interseção mais precisa se necessário
    return false;
  }
  
  // Gerar caminho ortogonal com cantos arredondados (estilo Lucidchart)
  const generatePathData = () => {
    // Para conexão direta, usar linha reta
    if (isDirectConnection) {
      // Checa colisão com caixas
      let collision = false;
      for (const box of allBoxes) {
        if (segmentIntersectsBox(startX, startY, endX, endY, box)) {
          collision = true;
          break;
        }
      }
      if (!collision) {
        return `M ${startX} ${startY} L ${endX} ${endY}`;
      }
      // Se colidir, faz um desvio simples (pode ser melhorado)
      const offset = 30;
      return `M ${startX} ${startY} L ${startX + offset} ${startY} L ${startX + offset} ${endY} L ${endX} ${endY}`;
    }
    
    // Para conexões entre linhas diferentes, criar um caminho ortogonal
    const isLeftToRight = endX > startX;
    
    // Decisão de roteamento: preferimos primeiro ir para baixo/cima e depois para os lados
    // pois isso é o padrão do Lucidchart para diagramas de fluxo
    
    // Ponto médio vertical entre as duas disciplinas
    const midY = (startY + endY) / 2;
    
    // Construir o caminho SVG com comandos de linha e arco para cantos arredondados
    let path = `M ${startX} ${startY}`;
    
    // Se estamos indo para a direita, primeiro vamos para baixo/cima e depois para a direita
    if (isLeftToRight) {
      // 1. Linha vertical saindo da origem até o ponto médio Y
      // Verifica se precisa de arcos arredondados
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
      
      // 2. Linha horizontal até próximo do destino
      const lineEndX = endX - cornerRadius;
      path += ` L ${lineEndX} ${midY}`;
      
      // 3. Arco para começar a subir/descer para o destino
      const arcSweep = midY < endY ? 0 : 1;
      path += ` A ${cornerRadius} ${cornerRadius} 0 0 ${arcSweep} ${endX} ${midY + (midY < endY ? cornerRadius : -cornerRadius)}`;
      
      // 4. Linha final vertical até o destino
      path += ` L ${endX} ${endY}`;
    } 
    // Se estamos indo para a esquerda, é mais complexo
    else {
      // Precisamos de um caminho com 3 cantos
      // Cria um desvio para contornar a caixa de origem 
      const offsetX = 30; // Desvio lateral
      
      // 1. Linha vertical curta saindo da origem
      const firstSegY = startY < endY ? startY + cornerRadius : startY - cornerRadius;
      path += ` L ${startX} ${firstSegY}`;
      
      // 2. Primeiro arco - virando para o lado
      const firstArcSweep = startY < endY ? 1 : 0;
      path += ` A ${cornerRadius} ${cornerRadius} 0 0 ${firstArcSweep} ${startX - cornerRadius} ${startY < endY ? startY + 2*cornerRadius : startY - 2*cornerRadius}`;
      
      // 3. Linha horizontal para a esquerda (desvio)
      const deviationY = startY < endY ? startY + 2*cornerRadius : startY - 2*cornerRadius;
      path += ` L ${startX - offsetX} ${deviationY}`;
      
      // 4. Segundo arco - virando para cima/baixo
      const secondArcSweep = startY < endY ? 0 : 1;
      path += ` A ${cornerRadius} ${cornerRadius} 0 0 ${secondArcSweep} ${startX - offsetX - cornerRadius} ${deviationY + (startY < endY ? cornerRadius : -cornerRadius)}`;
      
      // 5. Linha vertical até o ponto médio
      path += ` L ${startX - offsetX - cornerRadius} ${midY}`;
      
      // 6. Terceiro arco - virando para a esquerda em direção ao destino
      const thirdArcSweep = 0;
      path += ` A ${cornerRadius} ${cornerRadius} 0 0 ${thirdArcSweep} ${startX - offsetX - 2*cornerRadius} ${midY}`;
      
      // 7. Linha horizontal até próximo do destino
      path += ` L ${endX + cornerRadius} ${midY}`;
      
      // 8. Quarto arco - virando para o destino
      const fourthArcSweep = midY < endY ? 0 : 1;
      path += ` A ${cornerRadius} ${cornerRadius} 0 0 ${fourthArcSweep} ${endX} ${midY + (midY < endY ? cornerRadius : -cornerRadius)}`;
      
      // 9. Linha final vertical até o destino
      path += ` L ${endX} ${endY}`;
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
