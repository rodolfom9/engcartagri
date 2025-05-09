
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { isCourseCompleted, markCourseCompleted, unmarkCourseCompleted } from '@/lib/curriculumStorage';

interface CourseBoxProps {
  id: string;
  name: string;
  type: string;
  onStatusChange?: () => void;
}

const CourseBox: React.FC<CourseBoxProps> = ({ id, name, type, onStatusChange }) => {
  const completed = isCourseCompleted(id);
  
  const typeColor = 
    type === 'NB' ? 'bg-course-nb' : 
    type === 'NP' ? 'bg-course-np' : 
    type === 'NE' ? 'bg-course-ne' : 'bg-course-optional';
  
  // If completed, override the background color to green
  const bgColor = completed ? 'bg-green-200' : typeColor;
  
  const toggleCompleted = () => {
    if (completed) {
      unmarkCourseCompleted(id);
    } else {
      markCourseCompleted(id);
    }
    if (onStatusChange) onStatusChange();
  };
  
  return (
    <div className={`rounded-md ${bgColor} p-3 shadow flex flex-col h-full`}>
      <div className="flex-1 overflow-hidden">
        <h3 className="text-sm font-bold truncate" title={name}>
          {name}
        </h3>
        <p className="text-xs opacity-80">{type}</p>
      </div>
      <div className="flex justify-end mt-2">
        <Button 
          size="sm" 
          variant={completed ? "outline" : "default"} 
          className="h-7 w-7 p-0 rounded-full"
          onClick={toggleCompleted}
          title={completed ? "Mark as incomplete" : "Mark as completed"}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CourseBox;
