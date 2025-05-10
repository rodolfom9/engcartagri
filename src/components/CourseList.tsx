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
  schedule?: Record<string, Record<string, Course | null>>;
}

const CourseList: React.FC<CourseListProps> = ({ 
  courses, 
  onToggleCompletion,
  showCheckbox = false,
  onCheckboxChange,
  hideCompleted = false,
  schedule = {}
}) => {
  const [expandedPeriods, setExpandedPeriods] = useState<number[]>([1]);

  // Função para verificar se um curso está na grade
  const isInSchedule = (course: Course): boolean => {
    if (!course.schedules) return false;
    return course.schedules.some(({ day, time }) => 
      schedule[day]?.[time]?.id === course.id
    );
  };

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
                              checked={isInSchedule(course)}
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{course.name}</span>
                              <span className="text-xs text-gray-500">({course.id})</span>
                              {course.schedules && course.schedules.length > 0 && (
                                <span className="text-xs text-gray-600">
                                  {course.schedules.map((s, i) => 
                                    `${s.day} ${s.time}${i < course.schedules!.length - 1 ? ', ' : ''}`
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {course.professor && <span>Prof. {course.professor}</span>}
                            </div>
                          </div>
                        </div>
                        {onToggleCompletion && (
                          <button
                            onClick={() => onToggleCompletion(course.id)}
                            className={`text-sm px-2 py-1 rounded ${
                              isCourseCompleted(course.id)
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {isCourseCompleted(course.id) ? 'Concluída' : 'Marcar como concluída'}
                          </button>
                        )}
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
