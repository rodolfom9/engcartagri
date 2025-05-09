
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { isCourseCompleted, markCourseCompleted, unmarkCourseCompleted } from '@/lib/curriculumStorage';
import { Course } from '@/types/curriculum';

interface CourseBoxProps {
  id?: string;
  name?: string;
  type?: string;
  course?: Course;
  position?: { left: number; top: number };
  onStatusChange?: () => void;
}

const CourseBox: React.FC<CourseBoxProps> = ({ id, name, type, course, position, onStatusChange }) => {
  // Use course object props if provided, otherwise use individual props
  const courseId = course ? course.id : id || '';
  const courseName = course ? course.name : name || '';
  const courseType = course ? course.type : type || '';
  
  const completed = isCourseCompleted(courseId);
  
  const typeColor = 
    courseType === 'NB' ? 'bg-course-nb' : 
    courseType === 'NP' ? 'bg-course-np' : 
    courseType === 'NE' ? 'bg-course-ne' : 'bg-course-optional';
  
  // If completed, override the background color to green
  const bgColor = completed ? 'bg-green-200' : typeColor;
  
  const toggleCompleted = () => {
    if (completed) {
      unmarkCourseCompleted(courseId);
    } else {
      markCourseCompleted(courseId);
    }
    if (onStatusChange) onStatusChange();
  };
  
  if (position) {
    // Render in curriculum flow with positioning
    return (
      <div 
        className={`rounded-md ${bgColor} p-3 shadow-md absolute w-[155px]`}
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
          height: '110px'
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <h3 className="text-sm font-bold truncate" title={courseName}>
              {courseName}
            </h3>
            <p className="text-xs opacity-80">{courseType}</p>
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
      </div>
    );
  }
  
  // Regular box without positioning
  return (
    <div className={`rounded-md ${bgColor} p-3 shadow flex flex-col h-full`}>
      <div className="flex-1 overflow-hidden">
        <h3 className="text-sm font-bold truncate" title={courseName}>
          {courseName}
        </h3>
        <p className="text-xs opacity-80">{courseType}</p>
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
