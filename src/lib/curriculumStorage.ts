import { CurriculumData, Course, Prerequisite } from '../types/curriculum';
import { defaultCurriculumData } from '../data/courses';
import {
  loadCurriculumDataFromSupabase,
  saveCourseToSupabase,
  deleteCourseFromSupabase,
  addPrerequisiteToSupabase,
  removePrerequisiteFromSupabase,
  markCourseCompletedInSupabase,
  unmarkCourseCompletedInSupabase,
  initializeSupabaseData
} from './supabaseService';

const STORAGE_KEY = 'curriculum_data';

// Inicializar dados do Supabase
export const initializeData = async (): Promise<void> => {
  try {
    await initializeSupabaseData();
  } catch (error) {
    console.error('Erro ao inicializar dados do Supabase:', error);
  }
};

// Load curriculum data from Supabase or use localStorage as fallback
export const loadCurriculumData = (): CurriculumData => {
  try {
    // Para carregar do Supabase, use a versão assíncrona loadCurriculumDataAsync
    // Aqui retornamos do localStorage como fallback
    if (typeof window === 'undefined') return defaultCurriculumData;
    
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : defaultCurriculumData;
  } catch (error) {
    console.error('Erro ao carregar dados do currículo:', error);
    return defaultCurriculumData;
  }
};

// Versão assíncrona para carregar do Supabase
export const loadCurriculumDataAsync = async (): Promise<CurriculumData> => {
  try {
    const data = await loadCurriculumDataFromSupabase();
    
    // Atualizar o localStorage com os dados do Supabase
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao carregar dados do Supabase:', error);
    return loadCurriculumData(); // Fallback para o localStorage
  }
};

// Save curriculum data to localStorage and Supabase
export const saveCurriculumData = (data: CurriculumData): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  
  // Não precisamos salvar tudo no Supabase aqui,
  // pois as operações individuais já fazem isso
};

// Add a new course to localStorage and Supabase
export const addCourse = (course: Course): CurriculumData => {
  const data = loadCurriculumData();
  data.courses.push(course);
  saveCurriculumData(data);
  
  // Salvar no Supabase (assíncrono)
  saveCourseToSupabase(course).catch(error => {
    console.error('Erro ao salvar curso no Supabase:', error);
  });
  
  return data;
};

// Update an existing course in localStorage and Supabase
export const updateCourse = (courseId: string, updatedCourse: Course): CurriculumData => {
  const data = loadCurriculumData();
  const index = data.courses.findIndex(c => c.id === courseId);
  
  if (index !== -1) {
    data.courses[index] = updatedCourse;
    saveCurriculumData(data);
    
    // Salvar no Supabase (assíncrono)
    saveCourseToSupabase(updatedCourse).catch(error => {
      console.error('Erro ao atualizar curso no Supabase:', error);
    });
  }
  
  return data;
};

// Delete a course and its prerequisites from localStorage and Supabase
export const deleteCourse = (courseId: string): CurriculumData => {
  const data = loadCurriculumData();
  
  // Remove the course
  data.courses = data.courses.filter(c => c.id !== courseId);
  
  // Remove any prerequisites that involve this course
  data.prerequisites = data.prerequisites.filter(
    p => p.from !== courseId && p.to !== courseId
  );
  
  saveCurriculumData(data);
  
  // Deletar do Supabase (assíncrono)
  deleteCourseFromSupabase(courseId).catch(error => {
    console.error('Erro ao deletar curso do Supabase:', error);
  });
  
  return data;
};

// Add a prerequisite relationship to localStorage and Supabase
export const addPrerequisite = (from: string, to: string): CurriculumData => {
  const data = loadCurriculumData();
  
  // Check if this prerequisite already exists
  const exists = data.prerequisites.some(
    p => p.from === from && p.to === to
  );
  
  if (!exists) {
    data.prerequisites.push({ from, to });
    saveCurriculumData(data);
    
    // Adicionar no Supabase (assíncrono)
    addPrerequisiteToSupabase(from, to).catch(error => {
      console.error('Erro ao adicionar pré-requisito no Supabase:', error);
    });
  }

  return data;
};

// Remove a prerequisite relationship from localStorage and Supabase
export const removePrerequisite = (from: string, to: string): CurriculumData => {
  const data = loadCurriculumData();
  
  data.prerequisites = data.prerequisites.filter(
    p => !(p.from === from && p.to === to)
  );
  
  saveCurriculumData(data);
  
  // Remover do Supabase (assíncrono)
  removePrerequisiteFromSupabase(from, to).catch(error => {
    console.error('Erro ao remover pré-requisito do Supabase:', error);
  });
  
  return data;
};

// Import full curriculum data to localStorage and Supabase
export const importCurriculumData = (data: CurriculumData): CurriculumData => {
  saveCurriculumData(data);
  
  // Para o Supabase, seria necessário um processo mais complexo
  // que sincronize todo o conjunto de dados
  
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

// Mark a course as completed in localStorage and Supabase
export const markCourseCompleted = (courseId: string) => {
  const data = loadCurriculumData();
  if (!data.completedCourses.includes(courseId)) {
    data.completedCourses.push(courseId);
    saveCurriculumData(data);
    
    // Marcar como concluído no Supabase (assíncrono)
    markCourseCompletedInSupabase(courseId).catch(error => {
      console.error('Erro ao marcar curso como concluído no Supabase:', error);
    });
  }
};

// Unmark a course as completed in localStorage and Supabase
export const unmarkCourseCompleted = (courseId: string) => {
  const data = loadCurriculumData();
  data.completedCourses = data.completedCourses.filter(id => id !== courseId);
  saveCurriculumData(data);
  
  // Desmarcar como concluído no Supabase (assíncrono)
  unmarkCourseCompletedInSupabase(courseId).catch(error => {
    console.error('Erro ao desmarcar curso como concluído no Supabase:', error);
  });
};
