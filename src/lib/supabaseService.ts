import { supabase } from '../integrations/supabase/client';
import { Course, Prerequisite, CurriculumData } from '../types/curriculum';

// Função para gerar UUID v4 caso crypto.randomUUID não esteja disponível
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Create empty default data structure
const createEmptyDataStructure = () => {
  return {
    courses: [],
    prerequisites: [],
    completedCourses: []
  };
};

// Carregar dados do currículo do Supabase
export const loadCurriculumDataFromSupabase = async (): Promise<CurriculumData> => {
  // Carregar disciplinas
  const { data: courses, error: coursesError } = await supabase
    .from('disciplinas')
    .select('*');

  if (coursesError) {
    console.error('Erro ao carregar disciplinas:', coursesError);
    return createEmptyDataStructure();
  }

  // Carregar pré-requisitos
  const { data: prerequisites, error: prerequisitesError } = await supabase
    .from('prerequisitos')
    .select('*');

  if (prerequisitesError) {
    console.error('Erro ao carregar pré-requisitos:', prerequisitesError);
    return {
      ...createEmptyDataStructure(),
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
        to: prereq.to_disciplina,
        tipo: prereq.tipo ?? 1
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
    console.log('=== CARREGANDO HORÁRIOS ===');
    console.log('Horários encontrados:', schedules);
    
    // Adicionar horários às disciplinas
    courses.forEach((course: any) => {
      // Buscar o registro de horário correspondente a esta disciplina
      const courseSchedule = schedules.find(
        (schedule: any) => schedule.disciplina_id === course.id
      );
      
      if (courseSchedule) {
        console.log(`Processando horários para disciplina ${course.id}:`, courseSchedule);
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
          console.log(`Horários atribuídos à disciplina ${course.id}:`, scheduleArray);
        } else {
          course.schedules = undefined;
          console.log(`Nenhum horário válido encontrado para disciplina ${course.id}`);
        }
      } else {
        course.schedules = undefined;
        console.log(`Nenhum registro de horário encontrado para disciplina ${course.id}`);
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
      to: prereq.to_disciplina,
      tipo: prereq.tipo ?? 1
    })),
    completedCourses: completedCourses.map((item: any) => item.disciplina_id)
  };
};

// Salvar disciplina no Supabase
export const saveCourseToSupabase = async (course: Course): Promise<boolean> => {
  try {
    console.log('=== INÍCIO DO PROCESSO DE SALVAMENTO ===');
    
    // Get the current authenticated user
    const { data: userData } = await supabase.auth.getSession();
    
    if (!userData?.session?.user) {
      console.error('Usuário não autenticado ao salvar disciplina');
      return false;
    }

    console.log('Dados recebidos:', { 
      id: course.id,
      oldId: course.oldId,
      name: course.name,
      schedules: course.schedules,
      type: course.type,
      period: course.period,
      row: course.row,
      hours: course.hours,
      credits: course.credits,
      professor: course.professor
    });
    
    const now = new Date().toISOString();

    // Preparar dados da disciplina
    const courseData = {
      id: course.id,
      name: course.name,
      period: course.period,
      row: course.row,
      hours: course.hours,
      type: course.type,
      credits: course.credits,
      professor: course.professor || null,
      user_id: userData.session.user.id,
      updated_at: now,
      created_at: now
    };

    console.log('Dados preparados para salvamento:', courseData);

    // Se temos um oldId, significa que estamos atualizando o ID da disciplina
    if (course.oldId && course.oldId !== course.id) {
      console.log('=== INICIANDO PROCESSO DE ATUALIZAÇÃO DE ID ===');
      
      // Primeiro verificar se o novo ID já existe
      const { data: existingWithNewId, error: checkError } = await supabase
        .from('disciplinas')
        .select('id')
        .eq('id', course.id)
        .single();

      if (existingWithNewId) {
        console.error('Já existe uma disciplina com o novo ID:', course.id);
        return false;
      }

      // Primeiro criar a nova entrada com o novo ID
      console.log('Criando nova entrada com o novo ID...');
      const { error: insertError } = await supabase
        .from('disciplinas')
        .insert(courseData);

      if (insertError) {
        console.error('Erro ao criar nova entrada:', insertError);
        return false;
      }

      // Atualizar referências
      console.log('Iniciando atualização de referências...');
      const updatePromises = [];

      // Atualizar horários
      updatePromises.push(
        supabase
          .from('horarios')
          .update({ disciplina_id: course.id })
          .eq('disciplina_id', course.oldId)
      );

      // Atualizar pré-requisitos (from)
      updatePromises.push(
        supabase
          .from('prerequisitos')
          .update({ from_disciplina: course.id })
          .eq('from_disciplina', course.oldId)
      );

      // Atualizar pré-requisitos (to)
      updatePromises.push(
        supabase
          .from('prerequisitos')
          .update({ to_disciplina: course.id })
          .eq('to_disciplina', course.oldId)
      );

      // Atualizar disciplinas concluídas
      updatePromises.push(
        supabase
          .from('disciplinas_concluidas')
          .update({ disciplina_id: course.id })
          .eq('disciplina_id', course.oldId)
      );

      // Executar todas as atualizações de referência
      const results = await Promise.all(updatePromises);
      const errors = results.filter(r => r.error).map(r => r.error);
      
      if (errors.length > 0) {
        console.error('Erros ao atualizar referências:', errors);
        return false;
      }

      // Por fim, excluir a entrada antiga
      console.log('Excluindo entrada antiga...');
      const { error: deleteError } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', course.oldId);

      if (deleteError) {
        console.error('Erro ao excluir entrada antiga:', deleteError);
        return false;
      }

      console.log('Atualização de ID concluída com sucesso');
      return true;
    } else {
      console.log('=== REALIZANDO ATUALIZAÇÃO NORMAL ===');
      // Atualização normal sem mudança de ID
      const { error: upsertError } = await supabase
        .from('disciplinas')
        .upsert(courseData)
        .select();

      if (upsertError) {
        console.error('Erro ao atualizar/inserir disciplina:', upsertError);
        return false;
      }

      // Tratar os horários apenas se não for uma atualização de ID
      if (course.schedules && course.schedules.length > 0) {
        console.log('=== ATUALIZANDO HORÁRIOS ===');
        
        // Primeiro, excluir horários existentes
        const { error: deleteSchedulesError } = await supabase
          .from('horarios')
          .delete()
          .eq('disciplina_id', course.id);

        if (deleteSchedulesError) {
          console.error('Erro ao excluir horários existentes:', deleteSchedulesError);
          return false;
        }

        // Preparar dados dos horários no formato correto da tabela
        const scheduleData = {
          disciplina_id: course.id,
          created_at: now,
          day1: course.schedules[0]?.day || null,
          time1: course.schedules[0]?.time || null,
          day2: course.schedules[1]?.day || null,
          time2: course.schedules[1]?.time || null,
          day3: course.schedules[2]?.day || null,
          time3: course.schedules[2]?.time || null,
          id: uuidv4()
        };

        console.log('Inserindo novos horários:', scheduleData);

        // Inserir novos horários
        const { error: insertSchedulesError } = await supabase
          .from('horarios')
          .insert([scheduleData]);

        if (insertSchedulesError) {
          console.error('Erro ao inserir horários:', insertSchedulesError);
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Erro não tratado ao salvar disciplina:', error);
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

  // Como não temos mais os dados padrão definidos estaticamente,
  // simplesmente retornamos true, já que o usuário deverá importar dados
  // ou criar manualmente no Supabase
  console.log('Nenhum dado padrão disponível para inicialização. O usuário precisará importar dados.');
  return true;
};
