import { CurriculumData, Course, Prerequisite } from '../types/curriculum';
import { defaultCurriculumData } from '../data/courses';
import { supabase } from '../integrations/supabase/client';
import { saveCourseToSupabase } from './supabaseService';

const STORAGE_KEY = 'curriculum_data';

// Inicializar dados do Supabase
export const initializeData = async (): Promise<void> => {
  try {
    const { data: existingCourses, error } = await supabase
      .from('disciplinas')
      .select('id')
      .limit(1);

    if (error) throw error;

    // If no courses exist, initialize with default data
    if (!existingCourses || existingCourses.length === 0) {
      await importDefaultDataToSupabase();
    }
  } catch (error) {
    console.error('Erro ao inicializar dados do Supabase:', error);
  }
};

// Import default data to Supabase
const importDefaultDataToSupabase = async (): Promise<void> => {
  try {
    // Format courses for Supabase insert
    const coursesForInsert = defaultCurriculumData.courses.map(course => ({
      ...course,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert courses
    const { error: coursesError } = await supabase
      .from('disciplinas')
      .insert(coursesForInsert);

    if (coursesError) throw coursesError;

    // Format prerequisites for Supabase insert
    const prerequisitesForInsert = defaultCurriculumData.prerequisites.map(prereq => ({
      from_disciplina: prereq.from,
      to_disciplina: prereq.to,
      created_at: new Date().toISOString()
    }));

    // Insert prerequisites
    const { error: prerequisitesError } = await supabase
      .from('prerequisitos')
      .insert(prerequisitesForInsert);

    if (prerequisitesError) throw prerequisitesError;

    // Format schedules for horarios table with new schema
    const schedulesForInsert = defaultCurriculumData.courses
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

    // Insert schedules if any
    if (schedulesForInsert.length > 0) {
      const { error: schedulesError } = await supabase
        .from('horarios')
        .insert(schedulesForInsert);

      if (schedulesError) throw schedulesError;
    }

    console.log('Default data imported to Supabase successfully');
  } catch (error) {
    console.error('Error importing default data to Supabase:', error);
    throw error;
  }
};

// Load curriculum data from Supabase
export const loadCurriculumDataAsync = async (): Promise<CurriculumData> => {
  try {
    // Fetch courses
    const { data: courses, error: coursesError } = await supabase
      .from('disciplinas')
      .select('*');

    if (coursesError) throw coursesError;

    // Fetch prerequisites
    const { data: prerequisites, error: prerequisitesError } = await supabase
      .from('prerequisitos')
      .select('*');

    if (prerequisitesError) throw prerequisitesError;

    // Fetch schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from('horarios')
      .select('*');

    if (schedulesError) throw schedulesError;

    // Fetch completed courses
    const { data: completedCourses, error: completedCoursesError } = await supabase
      .from('disciplinas_concluidas')
      .select('disciplina_id');

    if (completedCoursesError) throw completedCoursesError;

    // Map the data to match our application's structure
    const mappedCourses = courses.map(course => {
      // Encontrar horário correspondente na nova estrutura da tabela
      const courseSchedule = schedules.find(s => s.disciplina_id === course.id);
      let courseSchedules = [];
      
      if (courseSchedule) {
        // Adicionar cada par de dia/horário se existir
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
        type: course.type as "NB" | "NP" | "NE" | "NA", // Cast to CourseType
        credits: course.credits,
        professor: course.professor,
        schedules: courseSchedules.length > 0 ? courseSchedules : undefined
      };
    });

    const mappedPrerequisites = prerequisites.map(prereq => ({
      from: prereq.from_disciplina,
      to: prereq.to_disciplina
    }));

    const mappedCompletedCourses = completedCourses.map(c => c.disciplina_id);

    // Store the data in localStorage for offline access
    const data = {
      courses: mappedCourses as Course[],
      prerequisites: mappedPrerequisites,
      completedCourses: mappedCompletedCourses
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    if (typeof window === 'undefined') return defaultCurriculumData;
    
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : defaultCurriculumData;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return defaultCurriculumData;
  }
};

// Save data to localStorage and optionally to Supabase
export const saveCurriculumData = (data: CurriculumData): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
  // Update in localStorage
  const data = loadCurriculumData();
  const index = data.courses.findIndex(c => c.id === courseId);
  
  if (index !== -1) {
    data.courses[index] = updatedCourse;
    saveCurriculumData(data);
    
    try {
      console.log('Updating course with schedules:', updatedCourse);
      // Use the saveCourseToSupabase function which handles schedules properly
      await saveCourseToSupabase(updatedCourse);
    } catch (error) {
      console.error('Error updating course in Supabase:', error);
    }
  }
  
  return data;
};

// Delete a course
export const deleteCourse = async (courseId: string): Promise<CurriculumData> => {
  const data = loadCurriculumData();
  
  data.courses = data.courses.filter(c => c.id !== courseId);
  data.prerequisites = data.prerequisites.filter(
    p => p.from !== courseId && p.to !== courseId
  );
  
  saveCurriculumData(data);
  
  try {
    const { data: userData } = await supabase.auth.getSession();
    
    // Delete from Supabase if user is authenticated
    if (userData?.session?.user) {
      // Supabase will handle cascade deleting related records due to ON DELETE CASCADE
      const { error } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error deleting course from Supabase:', error);
  }
  
  return data;
};

// Add a prerequisite
export const addPrerequisite = async (from: string, to: string): Promise<CurriculumData> => {
  const data = loadCurriculumData();
  
  // Check if already exists
  const exists = data.prerequisites.some(
    p => p.from === from && p.to === to
  );
  
  if (!exists) {
    data.prerequisites.push({ from, to });
    saveCurriculumData(data);
    
    try {
      const { data: userData } = await supabase.auth.getSession();
      
      // Add to Supabase if user is authenticated
      if (userData?.session?.user) {
        const { error } = await supabase
          .from('prerequisitos')
          .insert({
            from_disciplina: from,
            to_disciplina: to
          });
        
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
    saveCurriculumData(data);
    
    try {
      const { data: userData } = await supabase.auth.getSession();
      
      // Mark as completed in Supabase if user is authenticated
      if (userData?.session?.user) {
        const { error } = await supabase
          .from('disciplinas_concluidas')
          .insert({
            disciplina_id: courseId,
            user_id: userData.session.user.id
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error marking course as completed in Supabase:', error);
    }
  }
};

// Unmark a course as completed
export const unmarkCourseCompleted = async (courseId: string): Promise<void> => {
  const data = loadCurriculumData();
  data.completedCourses = data.completedCourses.filter(id => id !== courseId);
  saveCurriculumData(data);
  
  try {
    const { data: userData } = await supabase.auth.getSession();
    
    // Unmark as completed in Supabase if user is authenticated
    if (userData?.session?.user) {
      const { error } = await supabase
        .from('disciplinas_concluidas')
        .delete()
        .eq('disciplina_id', courseId)
        .eq('user_id', userData.session.user.id);
      
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error unmarking course as completed in Supabase:', error);
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
    
    await supabase
      .from('prerequisitos')
      .delete()
      .eq('from_disciplina', coursesForInsert.map(c => c.id));
      
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

// Utility function to generate a unique ID for new courses
export const generateCourseId = (courseName: string): string => {
  const baseId = courseName
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '')
    .substring(0, 10);
  
  const data = loadCurriculumData();
  const existingIds = new Set(data.courses.map(c => c.id));
  
  let id = baseId;
  let counter = 1;
  
  while (existingIds.has(id)) {
    id = `${baseId}${counter}`;
    counter++;
  }
  
  return id;
};

// Check if a course is completed
export const isCourseCompleted = (courseId: string): boolean => {
  const data = loadCurriculumData();
  return data.completedCourses.includes(courseId);
};
