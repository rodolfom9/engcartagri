import { supabase } from '../integrations/supabase/client';
import { Course, Prerequisite, CurriculumData } from '../types/curriculum';
import { defaultCurriculumData } from '../data/courses';

// Carregar dados do currículo do Supabase
export const loadCurriculumDataFromSupabase = async (): Promise<CurriculumData> => {
  // Carregar disciplinas
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('*');

  if (coursesError) {
    console.error('Erro ao carregar disciplinas:', coursesError);
    return defaultCurriculumData;
  }

  // Carregar pré-requisitos
  const { data: prerequisites, error: prerequisitesError } = await supabase
    .from('prerequisites')
    .select('*');

  if (prerequisitesError) {
    console.error('Erro ao carregar pré-requisitos:', prerequisitesError);
    return {
      ...defaultCurriculumData,
      courses: courses as Course[]
    };
  }

  // Carregar cursos concluídos
  const { data: completedCourses, error: completedCoursesError } = await supabase
    .from('completed_courses')
    .select('course_id');

  if (completedCoursesError) {
    console.error('Erro ao carregar cursos concluídos:', completedCoursesError);
    return {
      courses: courses as Course[],
      prerequisites: prerequisites as Prerequisite[],
      completedCourses: []
    };
  }

  // Carregar horários das disciplinas
  const { data: schedules, error: schedulesError } = await supabase
    .from('course_schedules')
    .select('*');

  if (schedulesError) {
    console.error('Erro ao carregar horários:', schedulesError);
  } else if (schedules) {
    // Adicionar horários às disciplinas
    courses.forEach((course: any) => {
      const courseSchedules = schedules.filter(
        (schedule: any) => schedule.course_id === course.id
      );
      
      if (courseSchedules.length > 0) {
        course.schedules = courseSchedules.map((schedule: any) => ({
          day: schedule.day,
          time: schedule.time
        }));
      }
    });
  }

  return {
    courses: courses as Course[],
    prerequisites: prerequisites.map((prereq: any) => ({
      from: prereq.from,
      to: prereq.to
    })),
    completedCourses: completedCourses.map((item: any) => item.course_id)
  };
};

// Salvar disciplina no Supabase
export const saveCourseToSupabase = async (course: Course): Promise<boolean> => {
  // Verificar se a disciplina já existe
  const { data: existingCourse, error: checkError } = await supabase
    .from('courses')
    .select('id')
    .eq('id', course.id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Erro ao verificar disciplina:', checkError);
    return false;
  }

  const now = new Date().toISOString();

  // Upsert da disciplina (insert ou update)
  const { error } = await supabase
    .from('courses')
    .upsert({
      id: course.id,
      name: course.name,
      period: course.period,
      row: course.row,
      hours: course.hours,
      type: course.type,
      credits: course.credits,
      professor: course.professor || null,
      updated_at: now,
      created_at: existingCourse ? undefined : now
    });

  if (error) {
    console.error('Erro ao salvar disciplina:', error);
    return false;
  }

  // Se houver horários, salvar ou atualizar
  if (course.schedules && course.schedules.length > 0) {
    // Primeiro remover horários existentes
    await supabase
      .from('course_schedules')
      .delete()
      .eq('course_id', course.id);

    // Inserir novos horários
    const schedulesData = course.schedules.map(schedule => ({
      course_id: course.id,
      day: schedule.day,
      time: schedule.time,
      created_at: now
    }));

    const { error: scheduleError } = await supabase
      .from('course_schedules')
      .insert(schedulesData);

    if (scheduleError) {
      console.error('Erro ao salvar horários:', scheduleError);
      return false;
    }
  }

  return true;
};

// Excluir disciplina do Supabase
export const deleteCourseFromSupabase = async (courseId: string): Promise<boolean> => {
  // Excluir horários primeiro (restrição de chave estrangeira)
  const { error: scheduleError } = await supabase
    .from('course_schedules')
    .delete()
    .eq('course_id', courseId);

  if (scheduleError) {
    console.error('Erro ao excluir horários:', scheduleError);
    return false;
  }

  // Excluir disciplina
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) {
    console.error('Erro ao excluir disciplina:', error);
    return false;
  }

  return true;
};

// Adicionar pré-requisito no Supabase
export const addPrerequisiteToSupabase = async (
  from: string,
  to: string
): Promise<boolean> => {
  const { error } = await supabase.from('prerequisites').insert({
    from,
    to,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error('Erro ao adicionar pré-requisito:', error);
    return false;
  }

  return true;
};

// Remover pré-requisito do Supabase
export const removePrerequisiteFromSupabase = async (
  from: string,
  to: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('prerequisites')
    .delete()
    .eq('from', from)
    .eq('to', to);

  if (error) {
    console.error('Erro ao remover pré-requisito:', error);
    return false;
  }

  return true;
};

// Marcar disciplina como concluída no Supabase
export const markCourseCompletedInSupabase = async (
  courseId: string
): Promise<boolean> => {
  const { error } = await supabase.from('completed_courses').insert({
    course_id: courseId,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error('Erro ao marcar disciplina como concluída:', error);
    return false;
  }

  return true;
};

// Desmarcar disciplina como concluída no Supabase
export const unmarkCourseCompletedInSupabase = async (
  courseId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('completed_courses')
    .delete()
    .eq('course_id', courseId);

  if (error) {
    console.error('Erro ao desmarcar disciplina como concluída:', error);
    return false;
  }

  return true;
};

// Inicializar dados no Supabase (usado quando não há dados)
export const initializeSupabaseData = async (): Promise<boolean> => {
  // Verificar se já existem dados
  const { data: existingCourses, error: checkError } = await supabase
    .from('courses')
    .select('id')
    .limit(1);

  if (checkError) {
    console.error('Erro ao verificar dados existentes:', checkError);
    return false;
  }

  // Se já existirem dados, não inicializar
  if (existingCourses && existingCourses.length > 0) {
    return true;
  }

  const now = new Date().toISOString();

  // Inserir disciplinas
  const coursesData = defaultCurriculumData.courses.map(course => ({
    ...course,
    created_at: now,
    updated_at: now
  }));

  const { error: coursesError } = await supabase
    .from('courses')
    .insert(coursesData);

  if (coursesError) {
    console.error('Erro ao inicializar disciplinas:', coursesError);
    return false;
  }

  // Inserir pré-requisitos
  const prerequisitesData = defaultCurriculumData.prerequisites.map(prereq => ({
    ...prereq,
    created_at: now
  }));

  const { error: prerequisitesError } = await supabase
    .from('prerequisites')
    .insert(prerequisitesData);

  if (prerequisitesError) {
    console.error('Erro ao inicializar pré-requisitos:', prerequisitesError);
    return false;
  }

  return true;
}; 