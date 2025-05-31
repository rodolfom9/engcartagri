import React, { useRef, useEffect, useState } from 'react';
import { Course } from '@/types/curriculum';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { isCourseCompleted } from '@/lib/curriculumStorage';

interface CourseBoxProps {
  course: Course;
  position: { left: number; top: number };
  isCompleted: boolean;
  canTake: boolean;
  onToggleCompletion: (courseId: string) => void;
  onClick: () => void;
  isFlowTab?: boolean;
  width?: number;
}

const CourseBox: React.FC<CourseBoxProps> = ({ 
  course, 
  position, 
  isCompleted,
  canTake,
  onToggleCompletion,
  onClick,
  isFlowTab = true,
  width = 155
}) => {
  // Map course type to CSS class
  const getCourseTypeClass = (type: string) => {
    if (isCompleted) return 'bg-green-200 text-green-800'; // Green when completed
    
    switch (type) {
      case 'NB': return 'bg-course-nb';
      case 'NP': return 'bg-course-np';
      case 'NE': return 'bg-course-ne';
      case 'NA': return 'bg-course-optional';
      default: return 'bg-white';
    }
  };

  return (
    <div
      className="absolute bg-white border border-gray-300 rounded shadow-sm overflow-hidden animate-fade-in cursor-pointer touch-manipulation"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        width: `${width}px`
      }}
      onClick={onClick}
    >
      <div 
        className={`p-1 md:p-2 relative text-center font-medium text-gray-800 flex flex-col items-center justify-center ${getCourseTypeClass(course.type)}`}
        style={{ minHeight: '60px' }}
      >
        <div className="text-xs md:text-sm leading-tight">{course.name}</div>
      </div>
      
      <div className="flex justify-between items-center bg-gray-100 p-1 text-xs">
        <span className="text-xs">{course.hours}</span>
        <span className="font-semibold text-xs">{course.type}</span>
        <div className="flex items-center gap-1">
          <span className="text-xs">{course.credits}</span>
          {isFlowTab && (
            <Button
              variant="ghost"
              size="sm" 
              className={`py-0 h-4 md:h-5 px-1 text-[9px] md:text-[10px] ${
                isCompleted 
                  ? 'text-green-700 hover:text-green-800 hover:bg-green-100' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 animate-pulse shadow-lg'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompletion(course.id);
              }}
              disabled={!canTake}
            >
              <span className="hidden md:inline">{isCompleted ? 'Concluído' : 'Concluir'}</span>
              <span className="md:hidden">{isCompleted ? '✓' : '○'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseBox;
