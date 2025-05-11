import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ZoomControlProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const ZoomControl: React.FC<ZoomControlProps> = ({ zoom, onZoomChange }) => {
  // Convertendo o zoom atual (70% = 100%)
  const displayZoom = Math.round((zoom / 70) * 100);

  const handleZoomIn = () => {
    // Aumenta 10% do zoom base (7% do zoom real)
    const newZoom = Math.min(zoom + 7, 91); // 91% real = 130% display
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    // Diminui 10% do zoom base (7% do zoom real)
    const newZoom = Math.max(zoom - 7, 56); // 56% real = 80% display
    onZoomChange(newZoom);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomOut}
        disabled={zoom <= 56} // Desabilita quando atingir 80% do display
        className="h-6 w-6 p-0"
      >
        <ZoomOut className="h-3 w-3" />
      </Button>
      <span className="min-w-[3rem] text-center text-xs">{displayZoom}%</span>
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomIn}
        disabled={zoom >= 91} // Desabilita quando atingir 130% do display
        className="h-6 w-6 p-0"
      >
        <ZoomIn className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ZoomControl; 