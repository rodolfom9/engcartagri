import React from 'react';
import { Course } from '@/types/curriculum';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ScheduleGridProps {
  courses: Course[];
  onAddCourse: (course: Course, day: string, time: string) => void;
  onRemoveCourse: (day: string, time: string) => void;
  schedule: Record<string, Record<string, Course | null>>;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  courses,
  onAddCourse,
  onRemoveCourse,
  schedule
}) => {
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const times = ['08:00', '10:00', '14:00'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Grade de Horário</h2>
      <div className="grid grid-cols-6 gap-2">
        {/* Cabeçalho */}
        <div className="col-span-1"></div>
        {days.map(day => (
          <div key={day} className="text-center font-semibold p-2 bg-gray-100 dark:bg-gray-700 rounded">
            {day}
          </div>
        ))}

        {/* Grade de horários */}
        {times.map(time => (
          <React.Fragment key={time}>
            <div className="text-center font-semibold p-2 bg-gray-100 dark:bg-gray-700 rounded">
              {time}
            </div>
            {days.map(day => {
              const course = schedule[day]?.[time];
              return (
                <div
                  key={`${day}-${time}`}
                  className="border rounded p-2 min-h-[100px] relative"
                >
                  {course ? (
                    <div className="h-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => onRemoveCourse(day, time)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="mt-4">
                        <div className="font-semibold">{course.name}</div>
                        <div className="text-sm text-gray-500">
                          {course.type} - {course.hours}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Vazio
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ScheduleGrid; 