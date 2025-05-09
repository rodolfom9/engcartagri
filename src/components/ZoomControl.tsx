import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZoomControlProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const ZoomControl: React.FC<ZoomControlProps> = ({ zoom, onZoomChange }) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 10, 100));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 10, 50));
  };

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomOut}
        disabled={zoom <= 50}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[4rem] text-center">
        {zoom}%
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={handleZoomIn}
        disabled={zoom >= 100}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ZoomControl; 