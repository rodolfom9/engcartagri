
import React, { useState } from 'react';
import { Course, courseColors } from '@/types/curriculum';
import { Button } from './ui/button';
import { Check } from 'lucide-react';

interface CourseBoxProps {
  course: Course;
  position: { left: number; top: number };
}

const CourseBox: React.FC<CourseBoxProps> = ({ course, position }) => {
  const [completed, setCompleted] = useState(false);
  
  // Map course type to CSS class
  const getCourseTypeClass = (type: string) => {
    if (completed) return 'bg-green-200 text-green-800'; // Green when completed
    
    switch (type) {
      case 'NB': return 'bg-course-nb';
      case 'NP': return 'bg-course-np';
      case 'NE': return 'bg-course-ne';
      case 'NA': return 'bg-course-optional';
      default: return 'bg-white';
    }
  };
  
  const handleMarkCompleted = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleted(!completed);
  };

  return (
    <div
      className="absolute w-[155px] bg-white border border-gray-300 rounded shadow-sm overflow-hidden animate-fade-in"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
    >
      <div 
        className={`p-2 relative text-center font-medium text-gray-800 flex flex-col items-center justify-center ${getCourseTypeClass(course.type)}`}
        style={{ height: '80px' }}
      >
        {course.name}
        <Button
          variant="outline"
          size="sm" 
          className={`mt-1 py-0 h-6 px-2 text-xs ${completed ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200'}`}
          onClick={handleMarkCompleted}
        >
          {completed ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              <span>Concluída</span>
            </>
          ) : (
            'Marcar como concluída'
          )}
        </Button>
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
