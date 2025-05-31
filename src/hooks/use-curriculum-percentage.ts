import { useState, useEffect } from 'react';
import { loadCurriculumDataAsync, loadCurriculumData } from '../lib/curriculumStorage';

export const useCurriculumPercentage = (refreshKey: number) => {
  const [percentage, setPercentage] = useState(0);

  // Função para calcular a porcentagem de carga horária concluída
  const calculateCompletedHours = (courses: any[], completedCourses: string[]) => {
    const totalHours = courses.reduce((acc, course) => acc + parseInt(course.hours || '0', 10), 0);
    const completedHours = courses
      .filter(course => completedCourses.includes(course.id))
      .reduce((acc, course) => acc + parseInt(course.hours || '0', 10), 0);
    
    return totalHours === 0 ? 0 : (completedHours / totalHours) * 100;
  };

  useEffect(() => {
    const fetchPercentage = async () => {
      try {
        const data = await loadCurriculumDataAsync();
        setPercentage(calculateCompletedHours(data.courses, data.completedCourses));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        const localData = loadCurriculumData();
        setPercentage(calculateCompletedHours(localData.courses, localData.completedCourses));
      }
    };
    
    fetchPercentage();
  }, [refreshKey]);

  return percentage;
};
