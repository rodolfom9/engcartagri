
import { CurriculumData } from '@/types/curriculum';

const CURRICULUM_DATA_KEY = 'curriculumData';

// Function to load curriculum data from local storage
export const loadCurriculumData = (): CurriculumData => {
  try {
    const storedData = localStorage.getItem(CURRICULUM_DATA_KEY);
    if (storedData === null) {
      return defaultData;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Failed to load curriculum data from local storage:", error);
    return defaultData;
  }
};

// Function to save curriculum data to local storage
export const saveCurriculumData = (data: CurriculumData): void => {
  try {
    localStorage.setItem(CURRICULUM_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save curriculum data to local storage:", error);
  }
};

// Function to clear curriculum data from local storage
export const clearCurriculumData = (): void => {
  try {
    localStorage.removeItem(CURRICULUM_DATA_KEY);
  } catch (error) {
    console.error("Failed to clear curriculum data from local storage:", error);
  }
};

// Function to generate course ID from course name
export const generateCourseId = (courseName: string): string => {
  // Create ID from name (simplified version)
  return courseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-6);
};

// Function to add a new course
export const addCourse = (course: any): void => {
  const data = loadCurriculumData();
  data.courses.push(course);
  saveCurriculumData(data);
};

// Function to update an existing course
export const updateCourse = (courseId: string, updatedCourse: any): void => {
  const data = loadCurriculumData();
  data.courses = data.courses.map(course =>
    course.id === courseId ? updatedCourse : course
  );
  saveCurriculumData(data);
};

// Function to delete a course
export const deleteCourse = (courseId: string): void => {
  const data = loadCurriculumData();
  data.courses = data.courses.filter(course => course.id !== courseId);
  data.prerequisites = data.prerequisites.filter(
    prerequisite => prerequisite.from !== courseId && prerequisite.to !== courseId
  );
  saveCurriculumData(data);
};

// Function to add a new prerequisite
export const addPrerequisite = (from: string, to: string): void => {
  const data = loadCurriculumData();
  data.prerequisites.push({ from, to });
  saveCurriculumData(data);
};

// Function to import curriculum data
export const importCurriculumData = (data: CurriculumData): void => {
  saveCurriculumData(data);
};

// Function to remove a prerequisite
export const removePrerequisite = (from: string, to: string): void => {
  const data = loadCurriculumData();
  data.prerequisites = data.prerequisites.filter(
    prerequisite => !(prerequisite.from === from && prerequisite.to === to)
  );
  saveCurriculumData(data);
};

// Default data
export const defaultData: CurriculumData = {
  courses: [],
  prerequisites: [],
  completedCourses: []
};

// Add functions to mark courses as completed or uncompleted
export const markCourseCompleted = (courseId: string): void => {
  const data = loadCurriculumData();
  if (!data.completedCourses) {
    data.completedCourses = [];
  }
  
  if (!data.completedCourses.includes(courseId)) {
    data.completedCourses.push(courseId);
    saveCurriculumData(data);
  }
};

export const unmarkCourseCompleted = (courseId: string): void => {
  const data = loadCurriculumData();
  if (!data.completedCourses) {
    data.completedCourses = [];
  }
  
  data.completedCourses = data.completedCourses.filter(id => id !== courseId);
  saveCurriculumData(data);
};

export const isCourseCompleted = (courseId: string): boolean => {
  const data = loadCurriculumData();
  return data.completedCourses?.includes(courseId) || false;
};

// Course details storage
const COURSE_DETAILS_KEY = 'curriculumCourseDetails';
const courseDetailsCache: { [key: string]: any } = {};

export const getCourseDetails = (courseId: string): any | undefined => {
  return courseDetailsCache[courseId];
};

export const saveCourseDetails = (details: any): void => {
  courseDetailsCache[details.courseId] = details;
  localStorage.setItem(COURSE_DETAILS_KEY, JSON.stringify(courseDetailsCache));
};

export const loadCourseDetails = (): { [key: string]: any } => {
  try {
    const storedData = localStorage.getItem(COURSE_DETAILS_KEY);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      Object.assign(courseDetailsCache, parsed);
    }
    return courseDetailsCache;
  } catch (error) {
    console.error("Failed to load course details from local storage:", error);
    return {};
  }
};

// Initialize course details on module load
loadCourseDetails();
