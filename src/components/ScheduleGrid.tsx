import React from 'react';
import { Course } from '@/types/curriculum';
import { useToast } from '@/hooks/use-toast';

interface ScheduleGridProps {
  courses: Course[];
  schedule: Record<string, Record<string, Course | null>>;
  onRemoveCourse: (day: string, time: string) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  courses,
  schedule,
  onRemoveCourse,
}) => {
  const { toast } = useToast();
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const times = ['07:00', '08:45', '10:30'];

  const getCourseAtSlot = (day: string, time: string): Course | null => {
    console.log(`Verificando slot ${day} ${time}:`, schedule[day]?.[time]);
    if (!schedule[day]) return null;
    return schedule[day][time] || null;
  };

  // Verificar horários ao montar o componente
  React.useEffect(() => {
    console.log('=== ESTADO ATUAL DA GRADE ===');
    console.log('Schedule:', schedule);
    console.log('Courses:', courses);
    
    // Verificar se todas as disciplinas com horários estão na grade
    courses.forEach(course => {
      if (course.schedules && course.schedules.length > 0) {
        console.log(`Verificando horários da disciplina ${course.id}:`, course.schedules);
        course.schedules.forEach(({ day, time }) => {
          const slotCourse = getCourseAtSlot(day, time);
          if (!slotCourse) {
            console.log(`Horário ${day} ${time} da disciplina ${course.id} não está na grade`);
          }
        });
      }
    });
  }, [schedule, courses]);

  return (
    <div className="w-full">
      <div className="overflow-y-auto">
        <table className="w-full border-collapse table-fixed">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="border p-2 w-[60px]">Horário</th>
              {days.map(day => (
                <th key={day} className="border p-2 w-[120px]">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map(time => (
              <tr key={time}>
                <td className="border p-2 text-center">{time}</td>
                {days.map(day => {
                  const course = getCourseAtSlot(day, time);
                  return (
                    <td key={`${day}-${time}`} className="border p-2">
                      {course && (
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold break-words">{course.name}</span>
                            <span className="text-xs text-gray-500">{course.id}</span>
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleGrid;
