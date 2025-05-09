import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course, CourseType } from '@/types/curriculum';
import { generateCourseId, addCourse, updateCourse } from '@/lib/curriculumStorage';
import { useToast } from '@/components/ui/use-toast';

interface CourseFormProps {
  initialCourse?: Course;
  onSave: (course: Course) => void;
  onCancel: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ initialCourse, onSave, onCancel }) => {
  const { toast } = useToast();
  const [course, setCourse] = useState<Course>(
    initialCourse || {
      id: '',
      name: '',
      period: 1,
      row: 1,
      hours: '',
      type: 'NB' as CourseType,
      credits: 0,
      professor: '',
      schedules: []
    }
  );

  const [scheduleCount, setScheduleCount] = useState(0);

  useEffect(() => {
    // Determinar número de aulas baseado na carga horária
    if (course.hours) {
      const hours = parseInt(course.hours);
      if (hours === 27) setScheduleCount(1);
      else if (hours === 54) setScheduleCount(2);
      else if (hours === 81) setScheduleCount(3);
    }
  }, [course.hours]);

  const isEditing = !!initialCourse;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleTypeChange = (value: string) => {
    setCourse(prev => ({ ...prev, type: value as CourseType }));
  };

  const handleHoursChange = (value: string) => {
    setCourse(prev => ({ ...prev, hours: value }));
    // Atualizar número de aulas baseado na carga horária
    const hours = parseInt(value);
    if (hours === 27) setScheduleCount(1);
    else if (hours === 54) setScheduleCount(2);
    else if (hours === 81) setScheduleCount(3);
    else setScheduleCount(0);
  };

  const handleScheduleChange = (index: number, field: 'day' | 'time', value: string) => {
    setCourse(prev => {
      const newSchedules = [...(prev.schedules || [])];
      if (!newSchedules[index]) {
        newSchedules[index] = { day: '', time: '' };
      }
      newSchedules[index][field] = value;
      return { ...prev, schedules: newSchedules };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!course.name || !course.hours || !course.professor) {
      toast({
        title: "Validation Error",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Validar horários
    if (scheduleCount > 0) {
      const schedules = course.schedules || [];
      if (schedules.length !== scheduleCount || 
          schedules.some(s => !s.day || !s.time)) {
        toast({
          title: "Validation Error",
          description: "Por favor, preencha todos os horários",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      // Generate ID for new courses
      if (!isEditing) {
        course.id = generateCourseId(course.name);
        addCourse(course);
        toast({
          title: "Success",
          description: "Disciplina adicionada com sucesso",
        });
      } else {
        updateCourse(course.id, course);
        toast({
          title: "Success",
          description: "Disciplina atualizada com sucesso",
        });
      }

      onSave(course);
    } catch (error) {
      toast({
        title: "Error",
        description: "Falha ao salvar a disciplina",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Disciplina</Label>
        <Input 
          id="name" 
          name="name" 
          value={course.name} 
          onChange={handleChange}
          placeholder="Digite o nome da disciplina" 
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="period">Período</Label>
          <Input 
            id="period" 
            name="period" 
            type="number" 
            min={1}
            max={12}
            value={course.period} 
            onChange={handleNumberChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="row">Linha</Label>
          <Input 
            id="row" 
            name="row" 
            type="number" 
            min={1}
            max={20}
            value={course.row} 
            onChange={handleNumberChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="professor">Professor</Label>
        <Input 
          id="professor" 
          name="professor" 
          value={course.professor} 
          onChange={handleChange}
          placeholder="Nome do professor" 
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Carga Horária</Label>
          <Select 
            value={course.hours} 
            onValueChange={handleHoursChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="27h">27h (1 aula)</SelectItem>
              <SelectItem value="54h">54h (2 aulas)</SelectItem>
              <SelectItem value="81h">81h (3 aulas)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select 
            value={course.type} 
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NB">NB</SelectItem>
              <SelectItem value="NP">NP</SelectItem>
              <SelectItem value="NE">NE</SelectItem>
              <SelectItem value="NA">NA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {scheduleCount > 0 && (
        <div className="space-y-4">
          <Label>Horários das Aulas</Label>
          {Array.from({ length: scheduleCount }).map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  value={course.schedules?.[index]?.day || ''}
                  onValueChange={(value) => handleScheduleChange(index, 'day', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Dia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Segunda">Segunda</SelectItem>
                    <SelectItem value="Terça">Terça</SelectItem>
                    <SelectItem value="Quarta">Quarta</SelectItem>
                    <SelectItem value="Quinta">Quinta</SelectItem>
                    <SelectItem value="Sexta">Sexta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={course.schedules?.[index]?.time || ''}
                  onValueChange={(value) => handleScheduleChange(index, 'time', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="14:00">14:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Atualizar' : 'Adicionar'} Disciplina
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;
