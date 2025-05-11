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
  tipo?: number;
}

const PrerequisiteArrow: React.FC<PrerequisiteArrowProps> = ({
  fromPosition,
  toPosition,
  isDirectConnection,
  rowDifference,
  boxWidth,
  tipo = 1
}) => {
  // Determinar a cor da seta baseado no tipo
  const getArrowColor = () => {
    switch (tipo) {
      case 2: return '#FFD700'; // Amarelo para có-requisito
      case 3: return '#3B82F6'; // Azul para pré-requisito flexível
      default: return '#EF4444'; // Vermelho para pré-requisito normal
    }
  };

  const arrowColor = getArrowColor();

  // Configurações visuais padrão para todas as setas
  const arrowWidth = '2.5px';   // Espessura consistente para todas as setas
  
  if (isDirectConnection) {
    // Para conexões na mesma linha, usa uma seta horizontal simples
    return (
      <>
        {/* Linha horizontal principal com gradiente suave */}
        <div
          className="absolute z-10"
          style={{
            left: `${fromPosition.left + boxWidth}px`,
            top: `${fromPosition.top}px`,
            width: `${toPosition.left - fromPosition.left - boxWidth}px`,
            height: arrowWidth,
            background: `linear-gradient(to right, ${arrowColor}80, ${arrowColor})`,
          }}
        />
        
        {/* Ponta da seta triangular no final da linha */}
        <div
          className="absolute w-0 h-0 z-20"
          style={{
            left: `${toPosition.left - 10}px`,
            top: `${toPosition.top - 4}px`,
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            borderLeft: `10px solid ${arrowColor}`,
            filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.2))', // Sombra suave para dar profundidade
          }}
        />
      </>
    );
  } else {
    // Para conexões entre linhas diferentes, cria um caminho com múltiplos segmentos
    
    // Define os pontos de controle para o caminho da seta
    const midX = fromPosition.left + 30;    // Ponto médio horizontal inicial
    const midY1 = fromPosition.top + 80;    // Ponto médio vertical (abaixo da box de origem)
    const midX2 = toPosition.left - 35;     // Ponto médio horizontal final
    
    return (
      <>
        {/* 1. Linha inicial horizontal saindo da origem */}
        <div
          className="absolute z-10"
          style={{
            left: `${fromPosition.left + boxWidth}px`,
            top: `${fromPosition.top}px`,
            width: `30px`,
            height: arrowWidth,
            background: arrowColor,
          }}
        />
        
        {/* 2. Linha vertical descendo da origem */}
        <div
          className="absolute z-10"
          style={{
            left: `${midX}px`,
            top: `${Math.min(fromPosition.top, midY1)}px`,
            width: arrowWidth,
            height: `${Math.abs(midY1 - fromPosition.top)}px`,
            background: arrowColor,
          }}
        />
        
        {/* 3. Linha horizontal conectora entre as disciplinas */}
        <div
          className="absolute z-10"
          style={{
            left: `${Math.min(midX, midX2)}px`,
            top: `${midY1}px`,
            width: `${Math.abs(midX2 - midX)}px`,
            height: arrowWidth,
            background: arrowColor,
          }}
        />
        
        {/* 4. Linha vertical subindo até o destino */}
        <div
          className="absolute z-10"
          style={{
            left: `${midX2}px`,
            top: `${Math.min(midY1, toPosition.top)}px`,
            width: arrowWidth,
            height: `${Math.abs(toPosition.top - midY1)}px`,
            background: arrowColor,
          }}
        />
        
        {/* 5. Linha horizontal final chegando no destino */}
        <div
          className="absolute z-10"
          style={{
            left: `${midX2}px`,
            top: `${toPosition.top}px`,
            width: `${toPosition.left - midX2}px`,
            height: arrowWidth,
            background: `linear-gradient(to right, ${arrowColor}, ${arrowColor})`,
          }}
        />
        
        {/* 6. Ponta da seta no final do caminho */}
        <div
          className="absolute w-0 h-0 z-20"
          style={{
            left: `${toPosition.left - 10}px`,
            top: `${toPosition.top - 4}px`,
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            borderLeft: `10px solid ${arrowColor}`,
            filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.2))',
          }}
        />
      </>
    );
  }
};

export default PrerequisiteArrow;
