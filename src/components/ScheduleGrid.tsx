import React, { useState, useEffect } from 'react';
import { Course } from '@/types/curriculum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ScheduleGridProps {
  courses: Course[];
  schedule: Record<string, Record<string, Course | null>>;
  onRemoveCourse: (day: string, time: string) => void;
  onUpdateCourseId?: (oldId: string, newId: string) => Promise<void>;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  courses,
  schedule,
  onRemoveCourse,
  onUpdateCourseId
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const times = ['07:00', '08:45', '10:15'];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newId, setNewId] = useState<string>('');

  const getCourseAtSlot = (day: string, time: string) => {
    return schedule[day]?.[time] || null;
  };

  const handleEditId = async (course: Course) => {
    if (!onUpdateCourseId) return;
    
    if (!newId.trim()) {
      toast({
        title: "Erro",
        description: "O ID não pode estar vazio",
        variant: "destructive"
      });
      return;
    }

    if (newId === course.id) {
      setEditingId(null);
      setNewId('');
      return;
    }

    try {
      await onUpdateCourseId(course.id, newId.trim());
      setEditingId(null);
      setNewId('');
      toast({
        title: "Sucesso",
        description: "ID da disciplina atualizado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o ID da disciplina",
        variant: "destructive"
      });
    }
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
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{course.name}</span>
                          {editingId === course.id ? (
                            <form 
                              className="flex items-center gap-1"
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleEditId(course);
                              }}
                            >
                              <Input
                                value={newId}
                                onChange={(e) => setNewId(e.target.value)}
                                className="h-6 w-24 text-xs"
                                placeholder="Novo ID"
                                autoFocus
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 py-0"
                              >
                                OK
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 py-0"
                                onClick={() => {
                                  setEditingId(null);
                                  setNewId('');
                                }}
                              >
                                Cancelar
                              </Button>
                            </form>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">({course.id})</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 py-0"
                                onClick={() => {
                                  setEditingId(course.id);
                                  setNewId(course.id);
                                }}
                              >
                                Editar ID
                              </Button>
                            </div>
                          )}
                        </div>
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
