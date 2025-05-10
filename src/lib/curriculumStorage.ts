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
    const courses = defaultCurriculumData.courses.map(course => ({
      id: course.id,
      name: course.name,
      period: course.period,
      row: course.row,
      hours: course.hours,
      type: course.type,
      credits: course.credits,
      professor: course.professor || null,
    }));

    // Insert courses
    const { error: coursesError } = await supabase
      .from('disciplinas')
      .upsert(courses);

    if (coursesError) throw coursesError;

    // Format prerequisites for Supabase insert
    const prerequisites = defaultCurriculumData.prerequisites.map(prereq => ({
      from_disciplina: prereq.from,
      to_disciplina: prereq.to,
    }));

    // Insert prerequisites
    const { error: prerequisitesError } = await supabase
      .from('prerequisitos')
      .upsert(prerequisites);

    if (prerequisitesError) throw prerequisitesError;

    // Insert course schedules if available
    const schedules = [];
    for (const course of defaultCurriculumData.courses) {
      if (course.schedules && course.schedules.length > 0) {
        for (const schedule of course.schedules) {
          schedules.push({
            disciplina_id: course.id,
            day: schedule.day,
            time: schedule.time,
          });
        }
      }
    }

    if (schedules.length > 0) {
      const { error: schedulesError } = await supabase
        .from('horarios')
        .upsert(schedules);

      if (schedulesError) throw schedulesError;
    }

    console.log('Default data imported to Supabase successfully');
  } catch (error) {
    console.error('Error importing default data to Supabase:', error);
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
      const courseSchedules = schedules
        .filter(s => s.disciplina_id === course.id)
        .map(s => ({ day: s.day, time: s.time }));

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

// Import full curriculum data 
export const importCurriculumData = async (data: CurriculumData): Promise<CurriculumData> => {
  saveCurriculumData(data);
  
  try {
    const { data: userData } = await supabase.auth.getSession();
    
    // Import to Supabase if user is authenticated
    if (userData?.session?.user) {
      // Format courses for Supabase
      const courses = data.courses.map(course => ({
        id: course.id,
        name: course.name,
        period: course.period,
        row: course.row,
        hours: course.hours,
        type: course.type,
        credits: course.credits,
        professor: course.professor || null,
        user_id: userData.session.user.id
      }));
      
      // Clear existing data first (if user has permission)
      await supabase
        .from('disciplinas')
        .delete()
        .filter('user_id', 'eq', userData.session.user.id);
      
      // Insert new courses
      const { error: coursesError } = await supabase
        .from('disciplinas')
        .insert(courses);
      
      if (coursesError) throw coursesError;
      
      // Format and insert prerequisites
      const prerequisites = data.prerequisites.map(prereq => ({
        from_disciplina: prereq.from,
        to_disciplina: prereq.to
      }));
      
      if (prerequisites.length > 0) {
        const { error: prerequisitesError } = await supabase
          .from('prerequisitos')
          .insert(prerequisites);
        
        if (prerequisitesError) throw prerequisitesError;
      }
      
      // Format and insert schedules
      const schedules = [];
      for (const course of data.courses) {
        if (course.schedules && course.schedules.length > 0) {
          for (const schedule of course.schedules) {
            schedules.push({
              disciplina_id: course.id,
              day: schedule.day,
              time: schedule.time
            });
          }
        }
      }
      
      if (schedules.length > 0) {
        const { error: schedulesError } = await supabase
          .from('horarios')
          .insert(schedules);
        
        if (schedulesError) throw schedulesError;
      }
      
      // Mark completed courses
      const completedCourses = data.completedCourses.map(courseId => ({
        disciplina_id: courseId,
        user_id: userData.session.user.id
      }));
      
      if (completedCourses.length > 0) {
        const { error: completedCoursesError } = await supabase
          .from('disciplinas_concluidas')
          .insert(completedCourses);
        
        if (completedCoursesError) throw completedCoursesError;
      }
    }
  } catch (error) {
    console.error('Error importing data to Supabase:', error);
  }
  
  return data;
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
