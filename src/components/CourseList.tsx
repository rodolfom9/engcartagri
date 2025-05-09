import React from 'react';
import { Course } from '@/types/curriculum';
import { isCourseCompleted } from '@/lib/curriculumStorage';
import { Checkbox } from '@/components/ui/checkbox';

interface CourseListProps {
  courses: Course[];
  onToggleCompletion: (courseId: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onToggleCompletion }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Disciplinas</h2>
      <div className="space-y-2">
        {courses.map(course => (
          <div
            key={course.id}
            className={`p-3 rounded-lg border ${
              isCourseCompleted(course.id)
                ? 'bg-green-100 border-green-500 text-green-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isCourseCompleted(course.id)}
                  onCheckedChange={() => onToggleCompletion(course.id)}
                  className="h-4 w-4"
                />
                <div>
                  <h3 className="font-semibold">{course.name}</h3>
                  <p className="text-sm text-gray-600">
                    {course.type} - {course.hours} - {course.credits} créditos
                  </p>
                </div>
              </div>
              <div className="text-sm">
                {isCourseCompleted(course.id) ? (
                  <span className="text-green-600 font-medium">Concluída</span>
                ) : (
                  <span className="text-gray-500">Pendente</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
