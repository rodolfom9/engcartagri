export type CourseType = "NB" | "NP" | "NE" | "NA";

export interface Course {
  id: string;
  name: string;
  period: number;
  row: number;
  hours: string;
  type: CourseType;
  credits: number;
}

export interface Prerequisite {
  from: string;
  to: string;
}

export interface CurriculumData {
  courses: Course[];
  prerequisites: Prerequisite[];
  completedCourses: string[];
}

// Cores para os tipos de curso e elementos visuais
export const courseColors = {
  NB: '#ffcccc', // Rosa claro
  NP: '#cce5ff', // Azul claro
  NE: '#ffffcc', // Amarelo claro
  NA: '#ccffcc', // Verde claro
  arrow: '#ea384c' // Vermelho para setas de pré-requisito
};
