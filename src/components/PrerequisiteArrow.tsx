
import React from 'react';

interface Position {
  left: number;
  top: number;
}

interface PrerequisiteArrowProps {
  fromPosition: Position;
  toPosition: Position;
  isDirectConnection: boolean;
}

const PrerequisiteArrow: React.FC<PrerequisiteArrowProps> = ({
  fromPosition,
  toPosition,
  isDirectConnection
}) => {
  // Using a consistent arrowWidth for all types of connections
  const arrowColor = '#ea384c'; // Vermelho vibrante
  const arrowWidth = '2.5px'; // Consistent width for all arrows
  
  if (isDirectConnection) {
    // Conexão direta - linha horizontal simples com gradiente
    return (
      <>
        {/* Linha horizontal com gradiente */}
        <div
          className="absolute z-10"
          style={{
            left: `${fromPosition.left}px`,
            top: `${fromPosition.top}px`,
            width: `${toPosition.left - fromPosition.left}px`,
            height: arrowWidth,
            background: `linear-gradient(to right, ${arrowColor}80, ${arrowColor})`,
          }}
        />
        
        {/* Ponta da seta centralizada verticalmente */}
        <div
          className="absolute w-0 h-0 z-20"
          style={{
            left: `${toPosition.left - 10}px`,
            top: `${toPosition.top - 4}px`, // Ajuste para centralização da seta
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            borderLeft: `10px solid ${arrowColor}`,
            filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.2))',
          }}
        />
      </>
    );
  } else {
    // Conexão complexa com curvas ajustadas para evitar passar pelas disciplinas
    const midX = fromPosition.left + 30;
    
    // Ajuste para evitar que as linhas passem pelo meio das disciplinas
    // Criando uma meia lua no ponto de cruzamento
    const midY1 = fromPosition.top + 90; // Increased for a more pronounced curve
    const midX2 = toPosition.left - 35;
    
    const curveHeight = 20; // Height of the half-moon curve
    
    return (
      <>
        {/* Linha do ponto de origem */}
        <div
          className="absolute z-10"
          style={{
            left: `${fromPosition.left}px`,
            top: `${fromPosition.top}px`,
            width: `30px`,
            height: arrowWidth,
            background: arrowColor,
          }}
        />
        
        {/* Linha vertical para baixo */}
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
        
        {/* Linha horizontal conectora com efeito de meia-lua onde as linhas se cruzam */}
        <div
          className="absolute z-10"
          style={{
            left: `${Math.min(midX, midX2)}px`,
            top: `${midY1}px`,
            width: `${Math.abs(midX2 - midX)}px`,
            height: arrowWidth,
            background: arrowColor,
            borderRadius: '50%', // Create curved appearance
            borderTop: `${curveHeight}px solid transparent`, // Create curve effect
          }}
        />
        
        {/* Linha vertical para cima/baixo até o nível do destino */}
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
        
        {/* Linha horizontal final até o destino */}
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
        
        {/* Ponta da seta centralizada verticalmente */}
        <div
          className="absolute w-0 h-0 z-20"
          style={{
            left: `${toPosition.left - 10}px`,
            top: `${toPosition.top - 4}px`, // Ajuste para centralização da seta
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
