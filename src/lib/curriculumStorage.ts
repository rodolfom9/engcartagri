import { CurriculumData, Course, Prerequisite } from '../types/curriculum';
import { supabase } from '../integrations/supabase/client';
import { saveCourseToSupabase, deleteCourseFromSupabase, addPrerequisiteToSupabase, removePrerequisiteFromSupabase, markCourseCompletedInSupabase, unmarkCourseCompletedInSupabase } from './supabaseService';

const STORAGE_KEY = 'curriculum_data';
const SESSION_STORAGE_KEY = 'curriculum_data_session';

// Default empty curriculum data structure when nothing is available
const defaultEmptyCurriculumData = {
  courses: [],
  prerequisites: [],
  completedCourses: []
};

// Inicializar dados do Supabase
export const initializeData = async (): Promise<void> => {
  try {
    const { data: existingCourses, error } = await supabase
      .from('disciplinas')
      .select('id')
      .limit(1);

    if (error) throw error;

    // If no courses exist, initialize with data from Supabase
    if (!existingCourses || existingCourses.length === 0) {
      await importDefaultDataToSupabase();
    }
  } catch (error) {
    console.error('Erro ao inicializar dados do Supabase:', error);
  }
};

// Import default data to Supabase (now gets data from Supabase or creates empty structure)
const importDefaultDataToSupabase = async (): Promise<void> => {
  try {
    // Simply initialize empty structures if needed
    console.log('Default empty data structure created');
  } catch (error) {
    console.error('Error importing default data to Supabase:', error);
    throw error;
  }
};

export const loadCurriculumDataAsync = async (): Promise<CurriculumData> => {
  try {
    console.log('🔍 loadCurriculumDataAsync: Iniciando carregamento dos dados...');
    
    // Fetch courses
    const { data: courses, error: coursesError } = await supabase
      .from('disciplinas')
      .select('*');

    console.log('📚 loadCurriculumDataAsync: courses from supabase:', courses);
    console.log('❌ loadCurriculumDataAsync: coursesError:', coursesError);
    console.log('📊 loadCurriculumDataAsync: total de disciplinas encontradas:', courses?.length || 0);
    
    if (coursesError) {
      console.error('💥 Erro ao carregar disciplinas:', coursesError);
      // Retornar dados vazios se houver erro
      return {
        courses: [],
        prerequisites: [],
        completedCourses: []
      };
    }

    // Se não há cursos, retornar dados vazios
    if (!courses || courses.length === 0) {
      console.log('⚠️ Nenhuma disciplina encontrada no banco de dados');
      return {
        courses: [],
        prerequisites: [],
        completedCourses: []
      };
    }

    // Fetch prerequisites
    const { data: prerequisites, error: prerequisitesError } = await supabase
      .from('prerequisitos')
      .select('from_disciplina, to_disciplina, tipo');

    if (prerequisitesError) throw prerequisitesError;

    // Fetch schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from('horarios')
      .select('*');

    if (schedulesError) throw schedulesError;

    // Fetch completed courses - handle differently for authenticated vs non-authenticated users
    let completedCourses: any[] = [];
    const { data: userData } = await supabase.auth.getSession();
    
    if (userData?.session?.user) {
      // User is authenticated, fetch their completed courses from Supabase
      const { data: userCompletedCourses, error: completedCoursesError } = await supabase
        .from('disciplinas_concluidas')
        .select('disciplina_id')
        .eq('user_id', userData.session.user.id);

      if (completedCoursesError) throw completedCoursesError;
      completedCourses = userCompletedCourses || [];
    } else {
      // User is not authenticated, check sessionStorage for temporary completed courses
      // This preserves progress during navigation but clears on page reload (F5)
      try {
        const sessionCompletedCourses = sessionStorage.getItem('completed_courses_session');
        if (sessionCompletedCourses) {
          const courseIds = JSON.parse(sessionCompletedCourses);
          completedCourses = courseIds.map((courseId: string) => ({ disciplina_id: courseId }));
        }
      } catch (error) {
        console.error('Error loading completed courses from sessionStorage:', error);
        completedCourses = [];
      }
    }

    // Map the data to match our application's structure
    const mappedCourses = courses.map(course => {
      const courseSchedule = schedules.find(s => s.disciplina_id === course.id);
      const courseSchedules = [];
      
      if (courseSchedule) {
        if (courseSchedule.day1 && courseSchedule.time1) {
          courseSchedules.push({ day: courseSchedule.day1, time: courseSchedule.time1 });
        }
        if (courseSchedule.day2 && courseSchedule.time2) {
          courseSchedules.push({ day: courseSchedule.day2, time: courseSchedule.time2 });
        }
        if (courseSchedule.day3 && courseSchedule.time3) {
          courseSchedules.push({ day: courseSchedule.day3, time: courseSchedule.time3 });
        }
      }

      return {
        id: course.id,
        name: course.name,
        period: course.period,
        row: course.row,
        hours: course.hours,
        type: course.type as "NB" | "NP" | "NE" | "NA",
        credits: course.credits,
        professor: course.professor,
        schedules: courseSchedules.length > 0 ? courseSchedules : undefined
      };
    });

    let mappedPrerequisites: Prerequisite[] = [];
    if (Array.isArray(prerequisites)) {
      mappedPrerequisites = prerequisites.map((prereq: any) => ({
        from: prereq.from_disciplina,
        to: prereq.to_disciplina,
        tipo: prereq.tipo ?? 1
      }));
    }

    const mappedCompletedCourses = completedCourses.map(c => c.disciplina_id);

    // Store the data in localStorage for offline access
    const data = {
      courses: mappedCourses as Course[],
      prerequisites: mappedPrerequisites,
      completedCourses: mappedCompletedCourses
    };
    
    if (typeof window !== 'undefined') {
      if (userData?.session?.user) {
        // User is authenticated, save everything to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        // User not authenticated, save only courses and prerequisites to localStorage
        // Completed courses go to sessionStorage (lost on F5)
        const dataForLocalStorage = {
          courses: data.courses,
          prerequisites: data.prerequisites,
          completedCourses: [] // Don't persist completed courses for non-authenticated users
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataForLocalStorage));
        
        // Save completed courses to sessionStorage only
        if (data.completedCourses.length > 0) {
          sessionStorage.setItem('completed_courses_session', JSON.stringify(data.completedCourses));
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    return loadCurriculumData(); // Fallback to localStorage
  }
};

// Load curriculum data from localStorage (fallback)
export const loadCurriculumData = (): CurriculumData => {
  try {
    if (typeof window === 'undefined') return defaultEmptyCurriculumData;
    
    // Try to load from localStorage first
    const savedData = localStorage.getItem(STORAGE_KEY);
    const data = savedData ? JSON.parse(savedData) : defaultEmptyCurriculumData;
    
    // Use sessionStorage for temporary changes during session if available
    const sessionCompletedCourses = sessionStorage.getItem('completed_courses_session');
    
    if (sessionCompletedCourses) {
      // Prioriza sessionStorage porque contém alterações mais recentes
      return {
        ...data,
        completedCourses: JSON.parse(sessionCompletedCourses)
      };
    }
    
    // Se não houver dados no sessionStorage, usa os dados do localStorage
    return data;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return defaultEmptyCurriculumData;
  }
};

// Save data to localStorage and optionally to Supabase
export const saveCurriculumData = (data: CurriculumData): void => {
  if (typeof window === 'undefined') return;
  
  // Sempre salva os dados completos no localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  
  // Também salva completed courses no sessionStorage para compatibilidade com código existente
  sessionStorage.setItem('completed_courses_session', JSON.stringify(data.completedCourses));
};

// Add a course to Supabase and localStorage
export const addCourse = async (course: Course): Promise<CurriculumData> => {
  // Save to localStorage
  const data = loadCurriculumData();
  data.courses.push(course);
  saveCurriculumData(data);
  
  try {
    console.log('Adding course with schedules:', course);
    // Use the saveCourseToSupabase function which handles schedules properly
    await saveCourseToSupabase(course);
  } catch (error) {
    console.error('Error saving course to Supabase:', error);
  }
  
  return data;
};

// Update an existing course
export const updateCourse = async (courseId: string, updatedCourse: Course): Promise<CurriculumData> => {
  console.log('=== INICIANDO PROCESSO DE ATUALIZAÇÃO ===');
  console.log('Dados recebidos:', {
    courseId,
    updatedCourse
  });
  
  try {
    // Se o ID mudou, incluir o oldId antes de qualquer operação
    if (courseId !== updatedCourse.id) {
      console.log('Detectada mudança de ID:', {
        oldId: courseId,
        newId: updatedCourse.id
      });
      updatedCourse.oldId = courseId;
    }

    // Verificar se a disciplina existe no Supabase usando o ID correto
    const { data: existingCourse, error: checkError } = await supabase
      .from('disciplinas')
      .select('*')
      .eq('id', updatedCourse.oldId || courseId)
      .single();

    console.log('Disciplina existente no Supabase:', existingCourse);
    
    if (checkError) {
      console.error('Erro ao verificar disciplina:', checkError);
      throw new Error('Erro ao verificar disciplina no Supabase');
    }

    if (!existingCourse) {
      console.error('Disciplina não encontrada no Supabase:', courseId);
      throw new Error('Disciplina não encontrada no Supabase');
    }

    // Update in localStorage
    const data = loadCurriculumData();
    const index = data.courses.findIndex(c => c.id === courseId);
    
    console.log('Índice encontrado no localStorage:', index);
    
    // Atualizar no localStorage
    if (index !== -1) {
      data.courses[index] = updatedCourse;
    } else {
      console.warn('Disciplina não encontrada no localStorage, adicionando como nova');
      data.courses.push(updatedCourse);
    }
    saveCurriculumData(data);
    
    console.log('Enviando atualização para o Supabase:', {
      oldId: courseId,
      newId: updatedCourse.id,
      course: updatedCourse
    });
    
    // Use the saveCourseToSupabase function which handles schedules properly
    const success = await saveCourseToSupabase(updatedCourse);
    
    console.log('Resultado do salvamento:', success);
    
    if (!success) {
      console.error('Erro ao atualizar disciplina no Supabase');
      throw new Error('Erro ao atualizar disciplina no Supabase');
    }

    return data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Delete a course
export const deleteCourse = async (courseId: string): Promise<CurriculumData> => {
  const data = loadCurriculumData();
  
  data.courses = data.courses.filter(c => c.id !== courseId);
  data.prerequisites = data.prerequisites.filter(
    p => p.from !== courseId && p.to !== courseId
  );
  data.completedCourses = data.completedCourses.filter(id => id !== courseId);
  
  saveCurriculumData(data);
  
  try {
    const { data: userData } = await supabase.auth.getSession();
    
    // Delete from Supabase if user is authenticated
    if (userData?.session?.user) {
      console.log(`Tentando excluir disciplina ${courseId} do Supabase...`);
      
      // Usar a função deleteCourseFromSupabase que lida com restrições de chave estrangeira
      const success = await deleteCourseFromSupabase(courseId);
      if (!success) {
        console.error('Erro ao excluir disciplina no Supabase');
        throw new Error('Erro ao excluir disciplina no Supabase. Verifique o console para mais detalhes.');
      }
      
      console.log(`Disciplina ${courseId} excluída com sucesso do Supabase`);
    } else {
      console.warn('Usuário não autenticado. Disciplina excluída apenas localmente.');
    }
  } catch (error) {
    console.error('Error deleting course from Supabase:', error);
    throw error; // Propagar o erro para tratamento adequado no componente
  }
  
  return data;
};

// Add a prerequisite
export const addPrerequisite = async (from: string, to: string, tipo: number = 1): Promise<CurriculumData> => {
  const data = loadCurriculumData();
  
  // Check if already exists
  const exists = data.prerequisites.some(
    p => p.from === from && p.to === to
  );
  
  if (!exists) {
    data.prerequisites.push({ from, to, tipo });
    saveCurriculumData(data);
    
    try {
      const { data: userData } = await supabase.auth.getSession();
      
      // Add to Supabase if user is authenticated
      if (userData?.session?.user) {
        const insertObj: any = {
          from_disciplina: from,
          to_disciplina: to
        };
        if (typeof tipo !== 'undefined') insertObj.tipo = tipo;
        const { error } = await supabase
          .from('prerequisitos')
          .insert(insertObj);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error adding prerequisite to Supabase:', error);
    }
  }

  return data;
};

// Remove a prerequisite
export const removePrerequisite = async (from: string, to: string): Promise<CurriculumData> => {
  const data = loadCurriculumData();
  
  data.prerequisites = data.prerequisites.filter(
    p => !(p.from === from && p.to === to)
  );
  
  saveCurriculumData(data);
  
  try {
    const { data: userData } = await supabase.auth.getSession();
    
    // Remove from Supabase if user is authenticated
    if (userData?.session?.user) {
      const { error } = await supabase
        .from('prerequisitos')
        .delete()
        .eq('from_disciplina', from)
        .eq('to_disciplina', to);
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error removing prerequisite from Supabase:', error);
  }
  
  return data;
};

// Mark a course as completed
export const markCourseCompleted = async (courseId: string): Promise<void> => {
  const data = loadCurriculumData();
  
  if (!data.completedCourses.includes(courseId)) {
    data.completedCourses.push(courseId);
    
    // Check if user is authenticated to determine storage strategy
    try {
      const { data: userData } = await supabase.auth.getSession();
      
      if (userData?.session?.user) {
        // User is authenticated, save to both localStorage and Supabase for persistence
        saveCurriculumData(data);
        
        const { error } = await supabase
          .from('disciplinas_concluidas')
          .insert({
            disciplina_id: courseId,
            user_id: userData.session.user.id
          });
        
        if (error) {
          console.error('Error marking course as completed in Supabase:', error);
          // Don't throw error here - local marking still works
        }
      } else {
        // User not authenticated, save only to sessionStorage (lost on F5)
        sessionStorage.setItem('completed_courses_session', JSON.stringify(data.completedCourses));
        console.log('Usuário não autenticado. Disciplina marcada temporariamente (será perdida ao recarregar a página).');
      }
    } catch (error) {
      console.error('Error checking authentication or saving:', error);
      // Fallback to sessionStorage for non-authenticated users
      sessionStorage.setItem('completed_courses_session', JSON.stringify(data.completedCourses));
    }
  }
};

// Unmark a course as completed
export const unmarkCourseCompleted = async (courseId: string): Promise<void> => {
  const data = loadCurriculumData();
  data.completedCourses = data.completedCourses.filter(id => id !== courseId);
  
  // Check if user is authenticated to determine storage strategy
  try {
    const { data: userData } = await supabase.auth.getSession();
    
    if (userData?.session?.user) {
      // User is authenticated, save to both localStorage and remove from Supabase
      saveCurriculumData(data);
      
      const { error } = await supabase
        .from('disciplinas_concluidas')
        .delete()
        .eq('disciplina_id', courseId)
        .eq('user_id', userData.session.user.id);
      
      if (error) {
        console.error('Error unmarking course as completed in Supabase:', error);
        // Don't throw error here - local unmarking still works
      }
    } else {
      // User not authenticated, save only to sessionStorage (lost on F5)
      sessionStorage.setItem('completed_courses_session', JSON.stringify(data.completedCourses));
      console.log('Usuário não autenticado. Disciplina desmarcada temporariamente.');
    }
  } catch (error) {
    console.error('Error checking authentication or removing:', error);
    // Fallback to sessionStorage for non-authenticated users
    sessionStorage.setItem('completed_courses_session', JSON.stringify(data.completedCourses));
  }
};

// Import curriculum data to Supabase
export const importCurriculumToSupabase = async (data: CurriculumData): Promise<boolean> => {
  try {
    // Get user authentication data
    const { data: userData } = await supabase.auth.getSession();
    
    if (!userData?.session?.user) {
      console.error('User not authenticated');
      return false;
    }
    
    // Import to Supabase if user is authenticated
    
    // Format courses for Supabase
    const coursesForInsert = data.courses.map(course => ({
      ...course,
      user_id: userData.session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Insert all courses
    await supabase
      .from('disciplinas')
      .delete()
      .eq('user_id', userData.session.user.id);
      
    const { error: coursesError } = await supabase
      .from('disciplinas')
      .insert(coursesForInsert);
      
    if (coursesError) throw coursesError;
    
    // Format and insert prerequisites
    const prerequisitesForInsert = data.prerequisites.map(prereq => ({
      from_disciplina: prereq.from,
      to_disciplina: prereq.to,
      created_at: new Date().toISOString()
    }));
    
    // Excluir pré-requisitos existentes
    if (coursesForInsert.length > 0) {
      await supabase
        .from('prerequisitos')
        .delete()
        .in('from_disciplina', coursesForInsert.map(c => c.id));
    }
      
    if (prerequisitesForInsert.length > 0) {
      const { error: prerequisitesError } = await supabase
        .from('prerequisitos')
        .insert(prerequisitesForInsert);
        
      if (prerequisitesError) throw prerequisitesError;
    }
    
    // Format and insert schedules
    const schedulesForInsert = data.courses
      .filter(course => course.schedules && course.schedules.length > 0)
      .map(course => {
        const scheduleData: any = {
          disciplina_id: course.id,
          nome: course.name,
          num_aulas: course.schedules ? course.schedules.length : 0,
          created_at: new Date().toISOString()
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
    
    // Delete existing schedules and insert new ones
    await supabase
      .from('horarios')
      .delete()
      .in('disciplina_id', data.courses.map(c => c.id));
      
    if (schedulesForInsert.length > 0) {
      const { error: schedulesError } = await supabase
        .from('horarios')
        .insert(schedulesForInsert);
        
      if (schedulesError) throw schedulesError;
    }
    
    // Format and insert completed courses
    if (data.completedCourses.length > 0) {
      // Delete existing completed courses
      await supabase
        .from('disciplinas_concluidas')
        .delete()
        .eq('user_id', userData.session.user.id);
        
      const completedCoursesForInsert = data.completedCourses.map(courseId => ({
        disciplina_id: courseId,
        user_id: userData.session.user.id,
        created_at: new Date().toISOString()
      }));
      
      const { error: completedCoursesError } = await supabase
        .from('disciplinas_concluidas')
        .insert(completedCoursesForInsert);
        
      if (completedCoursesError) throw completedCoursesError;
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data to Supabase:', error);
    return false;
  }
};

// Check if a course is completed
export const isCourseCompleted = (courseId: string): boolean => {
  const data = loadCurriculumData();
  return data.completedCourses.includes(courseId);
};

// Atualizar tipo de pré-requisito
export const updatePrerequisiteType = async (from: string, to: string, tipo: number): Promise<CurriculumData> => {
  console.log('[DEBUG] updatePrerequisiteType chamada:', { from, to, tipo });
  const data = loadCurriculumData();
  
  // Atualizar no estado local
  const prereq = data.prerequisites.find(p => p.from === from && p.to === to);
  if (prereq) {
    prereq.tipo = tipo;
    saveCurriculumData(data);
    console.log('[DEBUG] Pré-requisito atualizado localmente:', prereq);
  } else {
    console.warn('[DEBUG] Pré-requisito não encontrado localmente:', { from, to });
  }
  
  try {
    const { data: userData } = await supabase.auth.getSession();
    
    // Atualizar no Supabase se o usuário estiver autenticado
    if (userData?.session?.user) {
      const updateObj: any = {};
      if (typeof tipo !== 'undefined') updateObj.tipo = tipo;
      console.log('[DEBUG] Enviando update para Supabase:', updateObj);
      const { error } = await supabase
        .from('prerequisitos')
        .update(updateObj)
        .eq('from_disciplina', from)
        .eq('to_disciplina', to);
      
      if (error) {
        console.error('[DEBUG] Erro ao atualizar tipo de pré-requisito no Supabase:', error);
      } else {
        console.log('[DEBUG] Update de tipo de pré-requisito realizado com sucesso no Supabase');
      }
    } else {
      console.warn('[DEBUG] Usuário não autenticado, update não enviado ao Supabase');
    }
  } catch (error) {
    console.error('[DEBUG] Erro geral ao atualizar tipo de pré-requisito:', error);
  }
  
  return data;
};
