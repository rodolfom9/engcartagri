
import React from 'react';
import { Course } from '@/types/curriculum';

interface CourseBoxProps {
  course: Course;
  position: { left: number; top: number };
}

const CourseBox: React.FC<CourseBoxProps> = ({ course, position }) => {
  // Map course type to CSS class
  const getCourseTypeClass = (type: string) => {
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
      className="absolute w-[155px] bg-white border border-gray-300 rounded shadow-sm overflow-hidden animate-fade-in"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
    >
      <div className={`p-2 text-center font-medium text-gray-800 h-[80px] flex items-center justify-center ${getCourseTypeClass(course.type)}`}>
        {course.name}
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
