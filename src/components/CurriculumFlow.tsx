import React, { useState, useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Course, Prerequisite, CurriculumData } from '../types/curriculum';
import { 
  loadCurriculumData, 
  loadCurriculumDataAsync, 
  markCourseCompleted, 
  unmarkCourseCompleted, 
  isCourseCompleted,
  initializeData
} from '../lib/curriculumStorage';
import CourseBox from './CourseBox';
import ScheduleGrid from './ScheduleGrid';
import CourseList from './CourseList';
import ProgressBar from './ProgressBar';
import ZoomControl from './ZoomControl';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';
import CurriculumFlowGraph from './CurriculumFlowGraph';

const CurriculumFlow: React.FC = () => {
  const [curriculumData, setCurriculumData] = useState<CurriculumData>({ 
    courses: [], 
    prerequisites: [],
    completedCourses: []
  });
  const [schedule, setSchedule] = useState<Record<string, Record<string, Course | null>>>({});
  const [activeTab, setActiveTab] = useState('flow');
  const [zoom, setZoom] = useState(70); // Valor base que será exibido como 100%
  const [periodWidth, setPeriodWidth] = useState(160); // Estado para controlar a largura dos períodos
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [hoveredCourse, setHoveredCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, load data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        await initializeData();
        const data = await loadCurriculumDataAsync();
        setCurriculumData(data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        const localData = loadCurriculumData();
        setCurriculumData(localData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up realtime subscription for Supabase
    const subscription = supabase
      .channel('curriculum-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'disciplinas' },
          (payload) => {
            console.log('Courses change detected:', payload);
            loadCurriculumDataAsync().then(data => setCurriculumData(data));
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'prerequisitos' },
          (payload) => {
            console.log('Prerequisites change detected:', payload);
            loadCurriculumDataAsync().then(data => setCurriculumData(data));
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'disciplinas_concluidas' },
          (payload) => {
            console.log('Completed courses change detected:', payload);
            loadCurriculumDataAsync().then(data => setCurriculumData(data));
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'horarios' },
          (payload) => {
            console.log('Schedules change detected:', payload);
            loadCurriculumDataAsync().then(data => setCurriculumData(data));
          }
        )
      .subscribe();
    
    return () => {
      // Cleanup subscription
        supabase.removeChannel(subscription);
    };
  }, []);

  // Calculate course position based on period and row
  const calculatePosition = (period: number, row: number) => {
    const periodGap = 70; // Reduced from 75 by 30%
    const rowHeight = 100; // Reduced from 110 by 30%
    const rowGap = 45; // Reduced from 50 by 30%
    
    const left = (period - 1) * (periodWidth + periodGap);
    const top = (row - 1) * (rowHeight + rowGap);
    
    return { left, top };
  };

  // Find the max year and period to display headers
  const maxYear = Math.ceil(Math.max(...curriculumData.courses.map(c => c.period)) / 2) || 5;
  const maxPeriod = Math.max(...curriculumData.courses.map(c => c.period)) || 10;

  // Função para verificar se um curso pode ser cursado
  const canTakeCourse = (courseId: string): boolean => {
    const prerequisites = curriculumData.prerequisites.filter(p => p.to === courseId);
    return prerequisites.every(p => isCourseCompleted(p.from));
  };

  // Função para marcar/desmarcar um curso como completo
  const toggleCourseCompletion = async (courseId: string) => {
    try {
      if (isCourseCompleted(courseId)) {
        await unmarkCourseCompleted(courseId);
        // Remove o curso do horário se estiver presente
        const newSchedule = { ...schedule };
        Object.keys(newSchedule).forEach(day => {
          Object.keys(newSchedule[day] || {}).forEach(time => {
            if (newSchedule[day]?.[time]?.id === courseId) {
              newSchedule[day][time] = null;
            }
          });
        });
        setSchedule(newSchedule);
      } else {
        await markCourseCompleted(courseId);
      }
      
      // Update local state - this is now handled by the realtime subscription
      // But we keep it for immediate UI feedback
      setCurriculumData(loadCurriculumData());
    } catch (error) {
      console.error('Error toggling course completion:', error);
    }
  };

  // Função para adicionar curso ao horário
  const handleAddCourse = (course: Course) => {
    // Verifica se o curso já está concluído
    if (isCourseCompleted(course.id)) {
      return;
    }

    // Verifica se o curso tem horários definidos
    if (!course.schedules || course.schedules.length === 0) {
      return;
    }

    // Verifica se há conflito de horários
    const hasConflict = course.schedules.some(({ day, time }) => {
      const existingCourse = schedule[day]?.[time];
      return existingCourse !== null && existingCourse !== undefined;
    });

    if (hasConflict) {
      toast({
        title: "Erro",
        description: `Não foi possível adicionar "${course.name}" pois há conflito de horário`,
        variant: "destructive"
      });
      return;
    }

    // Adiciona o curso em todos os seus horários
    const newSchedule = { ...schedule };
    course.schedules.forEach(({ day, time }) => {
      if (!newSchedule[day]) {
        newSchedule[day] = {};
      }
      newSchedule[day][time] = course;
    });
    setSchedule(newSchedule);
  };

  // Função para remover curso do horário
  const handleRemoveCourse = (course: Course) => {
    const newSchedule = { ...schedule };
    Object.keys(newSchedule).forEach(day => {
      Object.keys(newSchedule[day] || {}).forEach(time => {
        if (newSchedule[day][time]?.id === course.id) {
          newSchedule[day][time] = null;
        }
      });
    });
    setSchedule(newSchedule);
  };

  // Função para lidar com clique no curso
  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
  };

  // Função para marcar/desmarcar curso como completo (alias para compatibilidade)
  const handleMarkCourseCompleted = (courseId: string) => {
    toggleCourseCompletion(courseId);
  };

  // Função para obter a cor de fundo do curso
  const getCourseBackground = (course: Course): string => {
    if (isCourseCompleted(course.id)) {
      return 'bg-green-100 dark:bg-green-900';
    }
    if (!canTakeCourse(course.id)) {
      return 'bg-gray-100 dark:bg-gray-800';
    }
    return 'bg-white dark:bg-gray-700';
  };

  // Função para obter a cor da borda do curso
  const getCourseBorder = (course: Course): string => {
    if (isCourseCompleted(course.id)) {
      return 'border-green-500';
    }
    if (!canTakeCourse(course.id)) {
      return 'border-gray-300 dark:border-gray-600';
    }
    return 'border-blue-500';
  };

  // Função para obter a cor do texto do curso
  const getCourseText = (course: Course): string => {
    if (isCourseCompleted(course.id)) {
      return 'text-green-700 dark:text-green-300';
    }
    if (!canTakeCourse(course.id)) {
      return 'text-gray-500 dark:text-gray-400';
    }
    return 'text-gray-900 dark:text-gray-100';
  };

  // Função para obter a cor do tipo do curso
  const getCourseTypeColor = (type: string): string => {
    switch (type) {
      case 'NB':
        return 'text-blue-600 dark:text-blue-400';
      case 'NP':
        return 'text-green-600 dark:text-green-400';
      case 'NE':
        return 'text-purple-600 dark:text-purple-400';
      case 'NA':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Função para obter os pré-requisitos de um curso
  const getPrerequisites = (courseId: string): Course[] => {
    return curriculumData.prerequisites
      .filter(p => p.to === courseId)
      .map(p => curriculumData.courses.find(c => c.id === p.from))
      .filter((c): c is Course => c !== undefined);
  };

  // Função para obter os cursos que dependem de um curso
  const getDependentCourses = (courseId: string): Course[] => {
    return curriculumData.prerequisites
      .filter(p => p.from === courseId)
      .map(p => curriculumData.courses.find(c => c.id === p.to))
      .filter((c): c is Course => c !== undefined);
  };

  // Função para calcular a porcentagem de carga horária concluída
  const calculateCompletedHours = (): number => {
    const totalHours = curriculumData.courses.reduce((acc: number, course: Course) => acc + parseInt(course.hours || '0', 10), 0);
    const completedHours = curriculumData.courses
      .filter(course => isCourseCompleted(course.id))
      .reduce((acc: number, course: Course) => acc + parseInt(course.hours || '0', 10), 0);
    
    return totalHours === 0 ? 0 : (completedHours / totalHours) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados do currículo...</span>
      </div>
    );
  }

  return (
    <div className="px-2 py-0 text-sm">
      <div className="mb-2">
        <ProgressBar 
          percentage={calculateCompletedHours()} 
          label="Porcentagem de Carga Horária Cumprida"
        />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-1">
          <TabsTrigger value="flow">Fluxo do Curso</TabsTrigger>
          <TabsTrigger value="schedule">Grade de Horário</TabsTrigger>
          <TabsTrigger value="courses">Lista de Disciplinas</TabsTrigger>
        </TabsList>

        <TabsContent value="flow" className="h-[80vh] flex flex-col">
          <ReactFlowProvider>
            <CurriculumFlowGraph
              courses={curriculumData.courses}  
              completedCourses={curriculumData.completedCourses}
              onToggleCompletion={(id) => handleMarkCourseCompleted(id)}
              onCourseClick={handleCourseClick}
            />
          </ReactFlowProvider>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="grid grid-cols-1 lg:grid-cols-[800px,1fr] gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm max-h-[600px] overflow-hidden">
              <ScheduleGrid
                courses={curriculumData.courses.filter(course => !isCourseCompleted(course.id))}
                schedule={schedule}
                onRemoveCourse={(day, time) => {
                  const course = schedule[day]?.[time];
                  if (course) {
                    handleRemoveCourse(course);
                  }
                }}
              />
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm max-h-[600px] overflow-y-auto">
              <CourseList 
                courses={curriculumData.courses}
                onToggleCompletion={toggleCourseCompletion}
                showCheckbox={true}
                hideCompleted={true}
                schedule={schedule}
                onCheckboxChange={(course) => {
                  const isInSchedule = course.schedules?.some(({ day, time }) => 
                    schedule[day]?.[time]?.id === course.id
                  );

                  if (isInSchedule) {
                    handleRemoveCourse(course);
                  } else {
                    handleAddCourse(course);
                  }
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <CourseList 
            courses={curriculumData.courses}
            onToggleCompletion={toggleCourseCompletion}
            hideCompleted={false}
          />
        </TabsContent>
      </Tabs>

      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">{selectedCourse.name}</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">ID:</span> {selectedCourse.id}</p>
              <p><span className="font-semibold">Período:</span> {selectedCourse.period}º</p>
              <p><span className="font-semibold">Carga Horária:</span> {selectedCourse.hours}</p>
              <p><span className="font-semibold">Créditos:</span> {selectedCourse.credits}</p>
              <p><span className="font-semibold">Tipo:</span> {selectedCourse.type}</p>
              {selectedCourse.professor && (
                <p><span className="font-semibold">Professor:</span> {selectedCourse.professor}</p>
              )}
              
              {selectedCourse.schedules && selectedCourse.schedules.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Horários:</h3>
                  <ul className="list-disc pl-5">
                    {selectedCourse.schedules.map((schedule, index) => (
                      <li key={index}>
                        {schedule.day} às {schedule.time}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Pré-requisitos:</h3>
                {getPrerequisites(selectedCourse.id).length > 0 ? (
                  <ul className="list-disc pl-5">
                    {getPrerequisites(selectedCourse.id).map(prereq => {
                      // Encontrar o tipo do pré-requisito
                      const prereqInfo = curriculumData.prerequisites.find(
                        p => p.from === prereq.id && p.to === selectedCourse.id
                      );
                      const prereqType = prereqInfo?.tipo || 1;
                      const prereqTypeName = 
                        prereqType === 2 ? 'Có-requisito' : 
                        prereqType === 3 ? 'Pré-requisito flexível' : 
                        'Pré-requisito';
                        
                      return (
                        <li key={prereq.id} 
                            className={isCourseCompleted(prereq.id) ? 'text-green-600' : 'text-red-600'}>
                          {prereq.name} - <span className="font-semibold">({prereqTypeName})</span>{' '}
                          {isCourseCompleted(prereq.id) ? '(Completo)' : '(Pendente)'}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-gray-500">Nenhum pré-requisito</p>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Cursos que dependem deste:</h3>
                {getDependentCourses(selectedCourse.id).length > 0 ? (
                  <ul className="list-disc pl-5">
                    {getDependentCourses(selectedCourse.id).map(dep => (
                      <li key={dep.id}>{dep.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Nenhum curso depende deste</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedCourse(null)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumFlow;
