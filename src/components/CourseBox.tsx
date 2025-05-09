import React from 'react';
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
}

const CourseBox: React.FC<CourseBoxProps> = ({ 
  course, 
  position, 
  isCompleted,
  canTake,
  onToggleCompletion,
  onClick,
  isFlowTab = true
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
      className="absolute w-[155px] bg-white border border-gray-300 rounded shadow-sm overflow-hidden animate-fade-in cursor-pointer"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
      onClick={onClick}
    >
      <div 
        className={`p-2 relative text-center font-medium text-gray-800 flex flex-col items-center justify-center ${getCourseTypeClass(course.type)}`}
        style={{ minHeight: '80px' }}
      >
        <div className="text-sm">{course.name}</div>
        {course.professor && (
          <div className="text-xs text-gray-600 mt-1">
            Prof. {course.professor}
          </div>
        )}
        {isFlowTab && (
          <Button
            variant="outline"
            size="sm" 
            className={`mt-1 py-0 h-6 px-2 text-xs ${isCompleted ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompletion(course.id);
            }}
            disabled={!canTake}
          >
            {isCompleted ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                <span>Concluída</span>
              </>
            ) : (
              'Marcar como concluída'
            )}
          </Button>
        )}
      </div>
      
      <div className="flex justify-between bg-gray-100 p-1 text-xs">
        <span>{course.hours}</span>
        <span className="font-semibold">{course.type}</span>
        <span>{course.credits}</span>
      </div>
    </div>
  );
};

export default CourseBox;
