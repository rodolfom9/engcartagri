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
      // Buscar o registro de horário correspondente a esta disciplina
      const courseSchedule = schedules.find(
        (schedule: any) => schedule.disciplina_id === course.id
      );
      
      if (courseSchedule) {
        // Converter o formato da tabela para o formato usado no front-end
        const scheduleArray = [];
        
        // Verificar e adicionar cada par de dia/horário se existir
        if (courseSchedule.day1 && courseSchedule.time1) {
          scheduleArray.push({
            day: courseSchedule.day1,
            time: courseSchedule.time1
          });
        }
        
        if (courseSchedule.day2 && courseSchedule.time2) {
          scheduleArray.push({
            day: courseSchedule.day2,
            time: courseSchedule.time2
          });
        }
        
        if (courseSchedule.day3 && courseSchedule.time3) {
          scheduleArray.push({
            day: courseSchedule.day3,
            time: courseSchedule.time3
          });
        }
        
        // Atribuir os horários à disciplina apenas se houver horários válidos
        if (scheduleArray.length > 0) {
          course.schedules = scheduleArray;
        } else {
          course.schedules = undefined;
        }
      } else {
        course.schedules = undefined;
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
  try {
    // Get the current authenticated user
    const { data: userData } = await supabase.auth.getSession();
    
    if (!userData?.session?.user) {
      console.error('Usuário não autenticado ao salvar disciplina');
      return false;
    }

    const now = new Date().toISOString();

    // Preparar dados da disciplina
    const courseData: {
      id: string;
      name: string;
      period: number;
      row: number;
      hours: string;
      type: Course['type'];
      credits: number;
      professor: string | null;
      user_id: string;
      updated_at: string;
      created_at?: string;
    } = {
      id: course.id,
      name: course.name,
      period: course.period,
      row: course.row,
      hours: course.hours,
      type: course.type,
      credits: course.credits,
      professor: course.professor || null,
      user_id: userData.session.user.id,
      updated_at: now
    };

    console.log('Dados da disciplina a serem salvos:', courseData);

    // Verificar se a disciplina já existe
    const { data: existingCourse, error: checkError } = await supabase
      .from('disciplinas')
      .select('id, user_id')
      .eq('id', course.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar disciplina existente:', checkError);
      return false;
    }

    if (existingCourse) {
      // Se existir, atualizar
      const { error: updateError } = await supabase
        .from('disciplinas')
        .update(courseData)
        .eq('id', course.id);

      if (updateError) {
        console.error('Erro ao atualizar disciplina:', updateError);
        return false;
      }
    } else {
      // Se não existir, inserir
      courseData.created_at = now;
      const { error: insertError } = await supabase
        .from('disciplinas')
        .insert([courseData]);

      if (insertError) {
        console.error('Erro ao inserir disciplina:', insertError);
        return false;
      }
    }

    // Tratar os horários
    if (course.schedules && course.schedules.length > 0) {
      // Primeiro, excluir horários existentes
      const { error: deleteSchedulesError } = await supabase
        .from('horarios')
        .delete()
        .eq('disciplina_id', course.id);

      if (deleteSchedulesError) {
        console.error('Erro ao excluir horários existentes:', deleteSchedulesError);
        return false;
      }

      // Preparar dados dos horários
      const schedulesData = {
        disciplina_id: course.id,
        num_aulas: course.schedules.length,
        created_at: now,
        day1: course.schedules[0]?.day || null,
        time1: course.schedules[0]?.time || null,
        day2: course.schedules[1]?.day || null,
        time2: course.schedules[1]?.time || null,
        day3: course.schedules[2]?.day || null,
        time3: course.schedules[2]?.time || null,
        id: crypto.randomUUID()
      };

      // Inserir novos horários
      const { error: insertSchedulesError } = await supabase
        .from('horarios')
        .insert([schedulesData]);

      if (insertSchedulesError) {
        console.error('Erro ao inserir horários:', insertSchedulesError);
        return false;
      }
    } else {
      // Se não houver horários, remover registros existentes
      const { error: deleteSchedulesError } = await supabase
        .from('horarios')
        .delete()
        .eq('disciplina_id', course.id);

      if (deleteSchedulesError) {
        console.error('Erro ao limpar horários:', deleteSchedulesError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Erro geral ao salvar disciplina:', error);
    return false;
  }
};

// Excluir disciplina do Supabase
export const deleteCourseFromSupabase = async (courseId: string): Promise<boolean> => {
  try {
    // Verificar autenticação do usuário
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      console.error('Usuário não autenticado ao excluir disciplina');
      return false;
    }

    const userId = session.session.user.id;

    // Excluir disciplinas concluídas primeiro (restrição de chave estrangeira)
    const { error: completedCoursesError } = await supabase
      .from('disciplinas_concluidas')
      .delete()
      .eq('disciplina_id', courseId);

    if (completedCoursesError) {
      console.error('Erro ao excluir disciplinas concluídas:', completedCoursesError);
      return false;
    }

    // Excluir pré-requisitos relacionados a esta disciplina (restrição de chave estrangeira)
    const { error: prerequisitesFromError } = await supabase
      .from('prerequisitos')
      .delete()
      .eq('from_disciplina', courseId);

    if (prerequisitesFromError) {
      console.error('Erro ao excluir pré-requisitos (from):', prerequisitesFromError);
      return false;
    }

    const { error: prerequisitesToError } = await supabase
      .from('prerequisitos')
      .delete()
      .eq('to_disciplina', courseId);

    if (prerequisitesToError) {
      console.error('Erro ao excluir pré-requisitos (to):', prerequisitesToError);
      return false;
    }

    // Excluir horários (restrição de chave estrangeira)
    const { error: scheduleError } = await supabase
      .from('horarios')
      .delete()
      .eq('disciplina_id', courseId);

    if (scheduleError) {
      console.error('Erro ao excluir horários:', scheduleError);
      return false;
    }

    // Finalmente, excluir a disciplina
    const { error } = await supabase
      .from('disciplinas')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.error('Erro ao excluir disciplina:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro geral ao excluir disciplina:', error);
    return false;
  }
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
    ...course,
    created_at: now,
    updated_at: now
  }));

  // Inserir disciplinas
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
  
  // Formatar e inserir horários com a nova estrutura
  const schedulesData = defaultCurriculumData.courses
    .filter(course => course.schedules && course.schedules.length > 0)
    .map(course => {
      const scheduleData: any = {
        disciplina_id: course.id,
        num_aulas: course.schedules ? course.schedules.length : 0,
        created_at: now
      };

      // Adicionar campos de dia e hora, se houver
      if (course.schedules && course.schedules.length > 0) {
        if (course.schedules[0]) {
          scheduleData.day1 = course.schedules[0].day;
          scheduleData.time1 = course.schedules[0].time;
        }
        
        if (course.schedules[1]) {
          scheduleData.day2 = course.schedules[1].day;
          scheduleData.time2 = course.schedules[1].time;
        }
        
        if (course.schedules[2]) {
          scheduleData.day3 = course.schedules[2].day;
          scheduleData.time3 = course.schedules[2].time;
        }
      }
      
      return scheduleData;
    });

  if (schedulesData.length > 0) {
    const { error: schedulesError } = await supabase
      .from('horarios')
      .insert(schedulesData);

    if (schedulesError) {
      console.error('Erro ao inicializar horários:', schedulesError);
      return false;
    }
  }

  return true;
};
