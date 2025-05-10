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
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const times = ['07:00', '08:45', '10:15'];

  const getCourseAtSlot = (day: string, time: string) => {
    return schedule[day]?.[time] || null;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Horário</th>
            {days.map(day => (
              <th key={day} className="border p-2">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map(time => (
            <tr key={time}>
              <td className="border p-2">{time}</td>
              {days.map(day => {
                const course = getCourseAtSlot(day, time);
                return (
                  <td key={`${day}-${time}`} className="border p-2">
                    {course && (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{course.name}</span>
                        <button
                          onClick={() => onRemoveCourse(day, time)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remover
                        </button>
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
  );
};

export default ScheduleGrid;
