import React, { useState, useEffect, useRef } from 'react';
import { Course, Prerequisite, CurriculumData } from '@/types/curriculum';
import { loadCurriculumData, saveCurriculumData, markCourseCompleted, unmarkCourseCompleted, isCourseCompleted } from '@/lib/curriculumStorage';
import CourseBox from './CourseBox';
import PrerequisiteArrow from './PrerequisiteArrow';
import ScheduleGrid from './ScheduleGrid';
import CourseList from './CourseList';
import ProgressBar from './ProgressBar';
import ZoomControl from './ZoomControl';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CurriculumFlow: React.FC = () => {
  const [curriculumData, setCurriculumData] = useState<CurriculumData>({ 
    courses: [], 
    prerequisites: [],
    completedCourses: []
  });
  const [schedule, setSchedule] = useState<Record<string, Record<string, Course | null>>>({});
  const [activeTab, setActiveTab] = useState('flow');
  const [zoom, setZoom] = useState(70); // Começa com 70% (30% menor que o original)
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [hoveredCourse, setHoveredCourse] = useState<Course | null>(null);

  // On mount, load data from local storage
  useEffect(() => {
    const data = loadCurriculumData();
    setCurriculumData(data);
  }, []);

  // Calculate course position based on period and row
  const calculatePosition = (period: number, row: number) => {
    const periodWidth = 140; // Reduced from 155 by 30%
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
  const toggleCourseCompletion = (courseId: string) => {
    if (isCourseCompleted(courseId)) {
      unmarkCourseCompleted(courseId);
      // Remove o curso do horário se estiver presente
      const newSchedule = { ...schedule };
      Object.keys(newSchedule).forEach(day => {
        Object.keys(newSchedule[day]).forEach(time => {
          if (newSchedule[day][time]?.id === courseId) {
            newSchedule[day][time] = null;
          }
        });
      });
      setSchedule(newSchedule);
    } else {
      markCourseCompleted(courseId);
    }
    setCurriculumData(loadCurriculumData());
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
      Object.keys(newSchedule[day]).forEach(time => {
        if (newSchedule[day][time]?.id === course.id) {
          newSchedule[day][time] = null;
        }
      });
    });
    setSchedule(newSchedule);
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

  return (
    <div className="p-4 text-sm"> {/* Added text-sm to reduce text size by ~30% */}
      <div className="mb-6">
        <ProgressBar 
          percentage={calculateCompletedHours()} 
          label="de Carga Horária Cumprida"
        />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flow">Fluxo do Curso</TabsTrigger>
          <TabsTrigger value="schedule">Grade de Horário</TabsTrigger>
          <TabsTrigger value="courses">Lista de Disciplinas</TabsTrigger>
        </TabsList>

        <TabsContent value="flow">
          <div className="overflow-x-auto overflow-y-hidden bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-end mb-2">
              <ZoomControl zoom={zoom} onZoomChange={setZoom} />
            </div>
            <div 
              className="relative min-w-[840px]" 
              ref={containerRef}
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                width: `${(100 / zoom) * 100}%`
              }}
            >
              {/* Year headers */}
              <div className="flex border border-gray-300 mb-1">
                {Array.from({ length: maxYear }, (_, i) => (
                  <div 
                    key={`year-${i+1}`} 
                    className="flex-1 text-center p-1 font-semibold border-r border-gray-300 last:border-r-0"
                  >
                    {`${i+1}º Ano`}
                  </div>
                ))}
              </div>
              
              {/* Period headers */}
              <div className="flex mb-3">
                {Array.from({ length: maxPeriod }, (_, i) => (
                  <div 
                    key={`period-${i+1}`} 
                    className="w-[108px] mr-[52px] last:mr-0 text-center p-1 bg-white border border-gray-300 rounded-md shadow-sm"
                  >
                    {`${i+1}º Período`}
                  </div>
                ))}
              </div>
              // essa porra ajusta o tamanho do fluxo
              {/* Courses section */}
              <div 
                className="relative"
                style={{ minHeight: `${Math.max(...curriculumData.courses.map(c => c.row)) * 88 + 90}px` }}
              >
                {/* Render course boxes */}
                {curriculumData.courses.map((course) => {
                  const position = calculatePosition(course.period, course.row);
                  return (
                    <CourseBox
                      key={course.id}
                      course={course}
                      position={position}
                      isCompleted={isCourseCompleted(course.id)}
                      canTake={canTakeCourse(course.id)}
                      onToggleCompletion={toggleCourseCompletion}
                      onClick={() => setSelectedCourse(course)}
                      isFlowTab={activeTab === 'flow'}
                    />
                  );
                })}
                
                {/* Render prerequisite arrows */}
                {curriculumData.prerequisites.map((prereq) => {
                  const fromCourse = curriculumData.courses.find(c => c.id === prereq.from);
                  const toCourse = curriculumData.courses.find(c => c.id === prereq.to);
                  
                  if (!fromCourse || !toCourse) return null;
                  
                  const fromPosition = calculatePosition(fromCourse.period, fromCourse.row);
                  const toPosition = calculatePosition(toCourse.period, toCourse.row);
                  
                  return (
                    <PrerequisiteArrow
                      key={`${prereq.from}-${prereq.to}`}
                      fromPosition={{
                        left: fromPosition.left + 155, // Largura total da box
                        top: fromPosition.top + 40   // Metade da altura da box
                      }}
                      toPosition={{
                        left: toPosition.left,       // Início da box
                        top: toPosition.top + 40     // Metade da altura da box
                      }}
                      isDirectConnection={toCourse.period - fromCourse.period === 1 && Math.abs(toCourse.row - fromCourse.row) <= 1}
                      rowDifference={Math.abs(toCourse.row - fromCourse.row)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <CourseList 
              courses={curriculumData.courses}
              onToggleCompletion={toggleCourseCompletion}
              showCheckbox={true}
              hideCompleted={true}
              onCheckboxChange={(course) => {
                // Verifica se o curso já está em algum horário
                let isInSchedule = false;
                Object.keys(schedule).forEach(day => {
                  Object.keys(schedule[day] || {}).forEach(time => {
                    if (schedule[day]?.[time]?.id === course.id) {
                      isInSchedule = true;
                    }
                  });
                });

                // Se estiver na grade, remove; se não estiver, adiciona
                if (isInSchedule) {
                  handleRemoveCourse(course);
                } else {
                  handleAddCourse(course);
                }
              }}
            />
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

      {/* Modal de detalhes do curso */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">{selectedCourse.name}</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Período:</span> {selectedCourse.period}º</p>
              <p><span className="font-semibold">Carga Horária:</span> {selectedCourse.hours}</p>
              <p><span className="font-semibold">Créditos:</span> {selectedCourse.credits}</p>
              <p><span className="font-semibold">Tipo:</span> {selectedCourse.type}</p>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Pré-requisitos:</h3>
                {getPrerequisites(selectedCourse.id).length > 0 ? (
                  <ul className="list-disc pl-5">
                    {getPrerequisites(selectedCourse.id).map(prereq => (
                      <li key={prereq.id} className={isCourseCompleted(prereq.id) ? 'text-green-600' : 'text-red-600'}>
                        {prereq.name} {isCourseCompleted(prereq.id) ? '(Completo)' : '(Pendente)'}
                      </li>
                    ))}
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
