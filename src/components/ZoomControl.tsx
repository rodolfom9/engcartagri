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
    <div className="flex items-center gap-1 bg-white p-1 rounded-md shadow-sm text-xs">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        disabled={zoom <= 50}
        className="h-5 w-5 p-0"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="font-medium min-w-[2.5rem] text-center">
        {zoom}%
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        disabled={zoom >= 100}
        className="h-5 w-5 p-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ZoomControl; 