
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
}
