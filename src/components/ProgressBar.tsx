import React from 'react';

interface ProgressBarProps {
  percentage: number;
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, label }) => {
  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{percentage.toFixed(2)}%</span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full">
        <div 
          className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar; 