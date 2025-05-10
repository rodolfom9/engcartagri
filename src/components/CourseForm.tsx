import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course, CourseType } from '@/types/curriculum';
import { addCourse, updateCourse } from '@/lib/curriculumStorage';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Determine number of classes based on course hours
    if (course.hours) {
      const hours = parseInt(course.hours);
      if (hours === 27) setScheduleCount(1);
      else if (hours === 54) setScheduleCount(2);
      else if (hours === 81) setScheduleCount(3);
      else setScheduleCount(0);
    }
    
    // Initialize schedules array if it doesn't exist
    if (!course.schedules) {
      setCourse(prev => ({ ...prev, schedules: [] }));
    }
  }, [course.hours]);

  // Initialize scheduleCount based on initialCourse hours or schedules
  useEffect(() => {
    if (initialCourse) {
      if (initialCourse.hours) {
        const hours = parseInt(initialCourse.hours);
        if (hours === 27) setScheduleCount(1);
        else if (hours === 54) setScheduleCount(2);
        else if (hours === 81) setScheduleCount(3);
      } else if (initialCourse.schedules) {
        setScheduleCount(initialCourse.schedules.length);
      }
    }
  }, [initialCourse]);

  const isEditing = !!initialCourse;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTypeChange = (value: string) => {
    setCourse(prev => ({ ...prev, type: value as CourseType }));
  };

  const handleHoursChange = (value: string) => {
    setCourse(prev => ({ ...prev, hours: value }));
    // Update number of classes based on hours
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
      
      // Clear schedule errors
      if (errors[`schedule-${index}`]) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[`schedule-${index}`];
          return newErrors;
        });
      }
      
      return { ...prev, schedules: newSchedules };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!course.id) newErrors.id = "O ID da disciplina é obrigatório";
    if (!course.name) newErrors.name = "O nome da disciplina é obrigatório";
    if (!course.hours) newErrors.hours = "A carga horária é obrigatória";
    
    // ID format validation
    if (course.id && !/^[A-Za-z0-9\-\.]+$/.test(course.id)) {
      newErrors.id = "O ID deve conter apenas letras, números, pontos e hífens";
    }
    
    // Professor validation (at least 3 characters)
    if (course.professor && course.professor.length < 3) {
      newErrors.professor = "O nome do professor deve ter pelo menos 3 caracteres";
    }
    
    // Schedule validation
    if (scheduleCount > 0) {
      const schedules = course.schedules || [];
      for (let i = 0; i < scheduleCount; i++) {
        const schedule = schedules[i];
        if (!schedule || !schedule.day || !schedule.time) {
          newErrors[`schedule-${i}`] = "Horário incompleto";
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Check authentication
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para salvar disciplinas",
          variant: "destructive"
        });
        return;
      }
      
      // Ensure the schedules array is properly set up based on scheduleCount
      const updatedCourse = { ...course };
      
      // Trim schedules array to match the scheduleCount
      if (updatedCourse.schedules && scheduleCount > 0) {
        updatedCourse.schedules = updatedCourse.schedules.slice(0, scheduleCount);
      }
      
      console.log('Submitting course with schedules:', updatedCourse);
      
      // Check if ID already exists (for new courses)
      if (!isEditing) {
        const { data: existingCourse } = await supabase
          .from('disciplinas')
          .select('id')
          .eq('id', updatedCourse.id)
          .single();

        if (existingCourse) {
          toast({
            title: "Erro",
            description: "Já existe uma disciplina com este ID",
            variant: "destructive"
          });
          return;
        }

        await addCourse(updatedCourse);
        toast({
          title: "Sucesso",
          description: "Disciplina adicionada com sucesso",
        });
      } else {
        await updateCourse(updatedCourse.id, updatedCourse);
        toast({
          title: "Sucesso",
          description: "Disciplina atualizada com sucesso",
        });
      }

      onSave(updatedCourse);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar a disciplina",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Disciplina</Label>
          <Input 
            id="name" 
            name="name" 
            value={course.name} 
            onChange={handleChange}
            placeholder="Digite o nome da disciplina" 
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="id">ID da Disciplina</Label>
          <Input 
            id="id" 
            name="id" 
            value={course.id} 
            onChange={handleChange}
            placeholder="Digite o ID da disciplina" 
            className={errors.id ? "border-red-500" : ""}
          />
          {errors.id && <p className="text-xs text-red-500">{errors.id}</p>}
        </div>
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
            className={errors.period ? "border-red-500" : ""}
          />
          {errors.period && <p className="text-xs text-red-500">{errors.period}</p>}
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
            className={errors.row ? "border-red-500" : ""}
          />
          {errors.row && <p className="text-xs text-red-500">{errors.row}</p>}
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
          className={errors.professor ? "border-red-500" : ""}
        />
        {errors.professor && <p className="text-xs text-red-500">{errors.professor}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Carga Horária</Label>
          <Select 
            value={course.hours} 
            onValueChange={handleHoursChange}
          >
            <SelectTrigger className={errors.hours ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="27h">27h (1 aula)</SelectItem>
              <SelectItem value="54h">54h (2 aulas)</SelectItem>
              <SelectItem value="81h">81h (3 aulas)</SelectItem>
            </SelectContent>
          </Select>
          {errors.hours && <p className="text-xs text-red-500">{errors.hours}</p>}
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
                  <SelectTrigger className={errors[`schedule-${index}`] ? "border-red-500" : ""}>
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
                  <SelectTrigger className={errors[`schedule-${index}`] ? "border-red-500" : ""}>
                    <SelectValue placeholder="Horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="07:00">07:00</SelectItem>
                    <SelectItem value="08:45">08:45</SelectItem>
                    <SelectItem value="10:30">10:30</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors[`schedule-${index}`] && (
                <p className="text-xs text-red-500 col-span-2">{errors[`schedule-${index}`]}</p>
              )}
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
