
import React, { useState, useEffect } from 'react';
import { Course } from '@/types/curriculum';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ScheduleGridProps {
  courses: Course[];
  schedule: Record<string, Record<string, Course | null>>;
  onRemoveCourse: (day: string, time: string) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  courses,
  schedule,
  onRemoveCourse
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [horarios, setHorarios] = useState<any[]>([]);
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const times = ['07:00', '08:45', '10:15'];

  useEffect(() => {
    // Initial fetch of horarios
    const fetchHorarios = async () => {
      try {
        const { data, error } = await supabase
          .from('horarios')
          .select('*');
          
        if (error) throw error;
        setHorarios(data || []);
      } catch (error) {
        console.error('Error fetching horarios:', error);
      }
    };
    
    fetchHorarios();

    // Set up real-time subscription
    const horarioSubscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'horarios'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setHorarios((current) => [...current, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setHorarios((current) => current.filter(h => h.id !== payload.old.id));
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(horarioSubscription);
    };
  }, []);

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
                        {course.professor && (
                          <div className="text-sm text-gray-500">
                            Prof. {course.professor}
                          </div>
                        )}
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
