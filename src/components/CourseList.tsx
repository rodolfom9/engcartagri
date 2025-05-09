import React, { useState } from 'react';
import { Course } from '@/types/curriculum';
import { isCourseCompleted } from '@/lib/curriculumStorage';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CourseListProps {
  courses: Course[];
  onToggleCompletion: (courseId: string) => void;
  showCheckbox?: boolean;
  onCheckboxChange?: (course: Course) => void;
  hideCompleted?: boolean;
}

const CourseList: React.FC<CourseListProps> = ({ 
  courses, 
  onToggleCompletion,
  showCheckbox = false,
  onCheckboxChange,
  hideCompleted = false
}) => {
  const [expandedPeriods, setExpandedPeriods] = useState<number[]>([1]);

  // Agrupar cursos por período
  const coursesByPeriod = courses.reduce((acc, course) => {
    if (hideCompleted && isCourseCompleted(course.id)) {
      return acc;
    }
    if (!acc[course.period]) {
      acc[course.period] = [];
    }
    acc[course.period].push(course);
    return acc;
  }, {} as Record<number, Course[]>);

  const togglePeriod = (period: number) => {
    setExpandedPeriods(prev => 
      prev.includes(period) 
        ? prev.filter(p => p !== period)
        : [...prev, period]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Disciplinas</h2>
      <div className="space-y-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(period => {
          const periodCourses = coursesByPeriod[period] || [];
          if (periodCourses.length === 0) return null;

          return (
            <div key={period} className="border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center p-3 hover:bg-gray-50"
                onClick={() => togglePeriod(period)}
              >
                <span className="font-semibold">{period}º Período</span>
                {expandedPeriods.includes(period) ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
              
              {expandedPeriods.includes(period) && (
                <div className="divide-y">
                  {periodCourses.map(course => (
                    <div
                      key={course.id}
                      className={`p-3 ${
                        isCourseCompleted(course.id)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          {showCheckbox && onCheckboxChange && (
                            <input
                              type="checkbox"
                              className="mt-1"
                              onChange={() => onCheckboxChange(course)}
                            />
                          )}
                          <div>
                            <h3 className="font-semibold">{course.name}</h3>
                            <p className="text-sm text-gray-600">
                              {course.type} - {course.hours} - {course.credits} créditos
                            </p>
                            {course.professor && (
                              <p className="text-sm text-gray-600">
                                Professor: {course.professor}
                              </p>
                            )}
                            {course.schedules && course.schedules.length > 0 && (
                              <div className="text-sm text-gray-600 mt-1">
                                <p>Horários:</p>
                                <ul className="list-disc list-inside">
                                  {course.schedules.map((schedule, index) => (
                                    <li key={index}>
                                      {schedule.day} às {schedule.time}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseList;
