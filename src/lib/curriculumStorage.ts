
import { CurriculumData, Course, Prerequisite } from '@/types/curriculum';

// Default data for initial app state
const defaultCurriculumData: CurriculumData = {
  courses: [
    { id: "calc1", name: "Cálculo I", period: 1, row: 1, hours: "60h", type: "NB", credits: 4 },
    { id: "prog1", name: "Programação I", period: 1, row: 2, hours: "60h", type: "NB", credits: 4 },
    { id: "calc2", name: "Cálculo II", period: 2, row: 1, hours: "60h", type: "NB", credits: 4 },
    { id: "prog2", name: "Programação II", period: 2, row: 2, hours: "60h", type: "NB", credits: 4 }
  ],
  prerequisites: [
    { from: "calc1", to: "calc2" },
    { from: "prog1", to: "prog2" }
  ]
};

const STORAGE_KEY = 'curriculum_data';

// Load curriculum data from localStorage or use default
export const loadCurriculumData = (): CurriculumData => {
  if (typeof window === 'undefined') return defaultCurriculumData;
  
  const savedData = localStorage.getItem(STORAGE_KEY);
  return savedData ? JSON.parse(savedData) : defaultCurriculumData;
};

// Save curriculum data to localStorage
export const saveCurriculumData = (data: CurriculumData): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Add a new course
export const addCourse = (course: Course): CurriculumData => {
  const data = loadCurriculumData();
  data.courses.push(course);
  saveCurriculumData(data);
  return data;
};

// Update an existing course
export const updateCourse = (courseId: string, updatedCourse: Course): CurriculumData => {
  const data = loadCurriculumData();
  const index = data.courses.findIndex(c => c.id === courseId);
  
  if (index !== -1) {
    data.courses[index] = updatedCourse;
    saveCurriculumData(data);
  }
  
  return data;
};

// Delete a course and its prerequisites
export const deleteCourse = (courseId: string): CurriculumData => {
  const data = loadCurriculumData();
  
  // Remove the course
  data.courses = data.courses.filter(c => c.id !== courseId);
  
  // Remove any prerequisites that involve this course
  data.prerequisites = data.prerequisites.filter(
    p => p.from !== courseId && p.to !== courseId
  );
  
  saveCurriculumData(data);
  return data;
};

// Add a prerequisite relationship
export const addPrerequisite = (from: string, to: string): CurriculumData => {
  const data = loadCurriculumData();
  
  // Check if this prerequisite already exists
  const exists = data.prerequisites.some(
    p => p.from === from && p.to === to
  );
  
  if (!exists) {
    data.prerequisites.push({ from, to });
    saveCurriculumData(data);
  }
  
  return data;
};

// Remove a prerequisite relationship
export const removePrerequisite = (from: string, to: string): CurriculumData => {
  const data = loadCurriculumData();
  
  data.prerequisites = data.prerequisites.filter(
    p => !(p.from === from && p.to === to)
  );
  
  saveCurriculumData(data);
  return data;
};

// Import full curriculum data
export const importCurriculumData = (data: CurriculumData): CurriculumData => {
  saveCurriculumData(data);
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
