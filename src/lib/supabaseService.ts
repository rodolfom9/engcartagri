import { supabase } from '../integrations/supabase/client';
import { Course, Prerequisite, CurriculumData } from '../types/curriculum';
import { defaultCurriculumData } from '../data/courses';

// Carregar dados do currículo do Supabase
export const loadCurriculumDataFromSupabase = async (): Promise<CurriculumData> => {
  // Carregar disciplinas
  const { data: courses, error: coursesError } = await supabase
    .from('disciplinas')
    .select('*');

  if (coursesError) {
    console.error('Erro ao carregar disciplinas:', coursesError);
    return defaultCurriculumData;
  }

  // Carregar pré-requisitos
  const { data: prerequisites, error: prerequisitesError } = await supabase
    .from('prerequisitos')
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
    .from('disciplinas_concluidas')
    .select('disciplina_id');

  if (completedCoursesError) {
    console.error('Erro ao carregar cursos concluídos:', completedCoursesError);
    return {
      courses: courses as Course[],
      prerequisites: prerequisites.map((prereq: any) => ({
        from: prereq.from_disciplina,
        to: prereq.to_disciplina
      })),
      completedCourses: []
    };
  }

  // Carregar horários das disciplinas
  const { data: schedules, error: schedulesError } = await supabase
    .from('horarios')
    .select('*');

  if (schedulesError) {
    console.error('Erro ao carregar horários:', schedulesError);
  } else if (schedules) {
    // Adicionar horários às disciplinas
    courses.forEach((course: any) => {
      const courseSchedules = schedules.filter(
        (schedule: any) => schedule.disciplina_id === course.id
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
    courses: courses.map((course: any) => ({
      ...course,
      type: course.type as "NB" | "NP" | "NE" | "NA" // Cast to match CourseType
    })) as Course[],
    prerequisites: prerequisites.map((prereq: any) => ({
      from: prereq.from_disciplina,
      to: prereq.to_disciplina
    })),
    completedCourses: completedCourses.map((item: any) => item.disciplina_id)
  };
};

// Salvar disciplina no Supabase
export const saveCourseToSupabase = async (course: Course): Promise<boolean> => {
  // Verificar se a disciplina já existe
  const { data: existingCourse, error: checkError } = await supabase
    .from('disciplinas')
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
    .from('disciplinas')
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
      .from('horarios')
      .delete()
      .eq('disciplina_id', course.id);

    // Inserir novos horários
    const schedulesData = course.schedules.map(schedule => ({
      disciplina_id: course.id,
      day: schedule.day,
      time: schedule.time,
      created_at: now
    }));

    const { error: scheduleError } = await supabase
      .from('horarios')
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
    .from('horarios')
    .delete()
    .eq('disciplina_id', courseId);

  if (scheduleError) {
    console.error('Erro ao excluir horários:', scheduleError);
    return false;
  }

  // Excluir disciplina
  const { error } = await supabase
    .from('disciplinas')
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
  const { error } = await supabase.from('prerequisitos').insert({
    from_disciplina: from,
    to_disciplina: to,
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
    .from('prerequisitos')
    .delete()
    .eq('from_disciplina', from)
    .eq('to_disciplina', to);

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
  try {
    // Get the current authenticated user
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      console.error('Usuário não autenticado ao marcar disciplina como concluída');
      return false;
    }

    const { error } = await supabase.from('disciplinas_concluidas').insert({
      disciplina_id: courseId,
      user_id: session.session.user.id,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Erro ao marcar disciplina como concluída:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao marcar disciplina como concluída:', error);
    return false;
  }
};

// Desmarcar disciplina como concluída no Supabase
export const unmarkCourseCompletedInSupabase = async (
  courseId: string
): Promise<boolean> => {
  try {
    // Get the current authenticated user
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      console.error('Usuário não autenticado ao desmarcar disciplina como concluída');
      return false;
    }
    
    const { error } = await supabase
      .from('disciplinas_concluidas')
      .delete()
      .eq('disciplina_id', courseId)
      .eq('user_id', session.session.user.id);

    if (error) {
      console.error('Erro ao desmarcar disciplina como concluída:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao desmarcar disciplina como concluída:', error);
    return false;
  }
};

// Inicializar dados no Supabase (usado quando não há dados)
export const initializeSupabaseData = async (): Promise<boolean> => {
  // Verificar se já existem dados
  const { data: existingCourses, error: checkError } = await supabase
    .from('disciplinas')
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
    id: course.id,
    name: course.name,
    period: course.period,
    row: course.row,
    hours: course.hours,
    type: course.type,
    credits: course.credits,
    professor: course.professor || null,
    created_at: now,
    updated_at: now
  }));

  const { error: coursesError } = await supabase
    .from('disciplinas')
    .insert(coursesData);

  if (coursesError) {
    console.error('Erro ao inicializar disciplinas:', coursesError);
    return false;
  }

  // Inserir pré-requisitos
  const prerequisitesData = defaultCurriculumData.prerequisites.map(prereq => ({
    from_disciplina: prereq.from,
    to_disciplina: prereq.to,
    created_at: now
  }));

  const { error: prerequisitesError } = await supabase
    .from('prerequisitos')
    .insert(prerequisitesData);

  if (prerequisitesError) {
    console.error('Erro ao inicializar pré-requisitos:', prerequisitesError);
    return false;
  }

  return true;
};

// Função para importar os dados do arquivo diretamente para o Supabase
export const importDefaultDataToSupabase = async (): Promise<boolean> => {
  try {
    console.log('Iniciando importação de dados padrão para o Supabase...');
    
    // Limpar dados existentes antes de importar
    await supabase.from('disciplinas_concluidas').delete().neq('id', '0');
    await supabase.from('horarios').delete().neq('id', '0');
    await supabase.from('prerequisitos').delete().neq('id', '0');
    await supabase.from('disciplinas').delete().neq('id', '0');
    
    const now = new Date().toISOString();
    
    // Preparar dados de disciplinas
    const coursesData = defaultCurriculumData.courses.map(course => ({
      id: course.id,
      name: course.name,
      period: course.period,
      row: course.row,
      hours: course.hours,
      type: course.type,
      credits: course.credits,
      professor: course.professor || null,
      created_at: now,
      updated_at: now
    }));
    
    // Inserir disciplinas
    const { error: coursesError } = await supabase
      .from('disciplinas')
      .insert(coursesData);
    
    if (coursesError) {
      console.error('Erro ao importar disciplinas:', coursesError);
      return false;
    }
    
    // Preparar dados de pré-requisitos
    const prerequisitesData = defaultCurriculumData.prerequisites.map(prereq => ({
      from_disciplina: prereq.from,
      to_disciplina: prereq.to,
      created_at: now
    }));
    
    // Inserir pré-requisitos
    const { error: prerequisitesError } = await supabase
      .from('prerequisitos')
      .insert(prerequisitesData);
    
    if (prerequisitesError) {
      console.error('Erro ao importar pré-requisitos:', prerequisitesError);
      return false;
    }
    
    console.log('Dados padrão importados com sucesso para o Supabase!');
    return true;
  } catch (error) {
    console.error('Erro durante a importação de dados padrão:', error);
    return false;
  }
};
