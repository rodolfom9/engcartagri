import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course, Prerequisite, CurriculumData } from '@/types/curriculum';
import { loadCurriculumData, loadCurriculumDataAsync, deleteCourse, removePrerequisite, updatePrerequisiteType } from '@/lib/curriculumStorage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CourseForm from './CourseForm';
import PrerequisiteForm from './PrerequisiteForm';

interface ManageCurriculumProps {
  onDataChange: () => void;
}

const ManageCurriculum: React.FC<ManageCurriculumProps> = ({ onDataChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [curriculumData, setCurriculumData] = useState<CurriculumData>({ 
    courses: [], 
    prerequisites: [],
    completedCourses: []
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'course' | 'prerequisite'>('course');
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const [editingPrerequisite, setEditingPrerequisite] = useState<Prerequisite | null>(null);
  const [editPrerequisiteDialogOpen, setEditPrerequisiteDialogOpen] = useState(false);

  // Load data on mount and setup realtime subscription
  useEffect(() => {
    loadAndSetData();
    
    // Set up realtime subscriptions for Supabase
    const subscriptions = [
      supabase
        .channel('manage-changes-courses')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'disciplinas' },
          (payload) => {
            console.log('Courses change detected:', payload);
            loadAndSetData();
          }
        )
        .subscribe(),
      
      supabase
        .channel('manage-changes-prerequisites')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'prerequisitos' },
          (payload) => {
            console.log('Prerequisites change detected:', payload);
            loadAndSetData();
          }
        )
        .subscribe(),
      
      supabase
        .channel('manage-changes-horarios')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'horarios' },
          (payload) => {
            console.log('Schedules change detected:', payload);
            loadAndSetData();
          }
        )
        .subscribe()
    ];
    
    return () => {
      // Cleanup all subscriptions
      subscriptions.forEach(subscription => {
        supabase.removeChannel(subscription);
      });
    };
  }, []);

  const loadAndSetData = async () => {
    try {
      const data = await loadCurriculumDataAsync();
      setCurriculumData(data);
    } catch (error) {
      console.error('Error loading data:', error);
      const localData = loadCurriculumData();
      setCurriculumData(localData);
    }
  };

  const handleOpenAddCourse = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar autenticado para adicionar disciplinas",
        variant: "destructive"
      });
      return;
    }
    
    setDialogType('course');
    setEditingCourse(undefined);
    setDialogOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar autenticado para editar disciplinas",
        variant: "destructive"
      });
      return;
    }
    
    setDialogType('course');
    setEditingCourse(course);
    setDialogOpen(true);
  };

  const handleOpenAddPrerequisite = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar autenticado para adicionar pré-requisitos",
        variant: "destructive"
      });
      return;
    }
    
    setDialogType('prerequisite');
    setDialogOpen(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar autenticado para excluir disciplinas",
        variant: "destructive"
      });
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir esta disciplina?')) {
      try {
        await deleteCourse(courseId);
        loadAndSetData();
        onDataChange();
        toast({
          title: "Sucesso",
          description: "Disciplina excluída com sucesso"
        });
      } catch (error: any) {
        toast({
          title: "Erro ao excluir disciplina",
          description: error.message || "Ocorreu um erro ao excluir a disciplina",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeletePrerequisite = async (from: string, to: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar autenticado para excluir pré-requisitos",
        variant: "destructive"
      });
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir este pré-requisito?')) {
      try {
        await removePrerequisite(from, to);
        loadAndSetData();
        onDataChange();
        toast({
          title: "Sucesso",
          description: "Pré-requisito excluído com sucesso"
        });
      } catch (error: any) {
        toast({
          title: "Erro ao excluir pré-requisito",
          description: error.message || "Ocorreu um erro ao excluir o pré-requisito",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveCourse = (course: Course) => {
    setDialogOpen(false);
    loadAndSetData();
    onDataChange();
  };

  const handleSavePrerequisite = (prerequisite: Prerequisite) => {
    setDialogOpen(false);
    loadAndSetData();
    onDataChange();
  };
  
  const handleEditPrerequisite = (prereq: Prerequisite) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar autenticado para editar pré-requisitos",
        variant: "destructive"
      });
      return;
    }
    
    setEditingPrerequisite(prereq);
    setEditPrerequisiteDialogOpen(true);
  };

  const handleUpdatePrerequisiteType = async (tipo: number) => {
    if (!editingPrerequisite) return;

    try {
      await updatePrerequisiteType(editingPrerequisite.from, editingPrerequisite.to, tipo);
      loadAndSetData();
      onDataChange();
      setEditPrerequisiteDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Tipo de pré-requisito atualizado com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar pré-requisito",
        description: error.message || "Ocorreu um erro ao atualizar o tipo do pré-requisito",
        variant: "destructive"
      });
    }
  };
  
  // Find course name by ID
  const getCourseName = (courseId: string) => {
    return curriculumData.courses.find(c => c.id === courseId)?.name || courseId;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="courses">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="courses">Disciplinas</TabsTrigger>
          <TabsTrigger value="prerequisites">Pré-requisitos</TabsTrigger>
        </TabsList>
        
        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Gerenciar Disciplinas</h3>
            <Button onClick={handleOpenAddCourse}>Adicionar Disciplina</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {curriculumData.courses
              .sort((a, b) => a.period - b.period || a.row - b.row)
              .map(course => (
                <Card key={course.id}>
                  <CardHeader className={`pb-2 ${
                    course.type === 'NB' ? 'bg-course-nb/50' : 
                    course.type === 'NP' ? 'bg-course-np/50' : 
                    course.type === 'NE' ? 'bg-course-ne/50' : 
                    'bg-course-optional/50'
                  }`}>
                    <CardTitle className="text-base">{course.name}</CardTitle>
                    <CardDescription>Período {course.period}, Linha {course.row}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 pb-2 text-sm">
                    <div className="flex justify-between">
                      <span>Horas: {course.hours}</span>
                      <span>Tipo: {course.type}</span>
                      <span>Créditos: {course.credits}</span>
                    </div>
                    {course.professor && (
                      <div className="mt-2">
                        <span>Professor: {course.professor}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 pt-0">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditCourse(course)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                      Excluir
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        {/* Prerequisites Tab */}
        <TabsContent value="prerequisites" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Gerenciar Pré-requisitos</h3>
            <Button onClick={handleOpenAddPrerequisite}>Adicionar Pré-requisito</Button>
          </div>
          
          {curriculumData.prerequisites.length > 0 ? (
            <div className="space-y-2">
              {curriculumData.prerequisites.map(prereq => (
                <Card key={`${prereq.from}-${prereq.to}`}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center">
                      <span className="font-medium">{getCourseName(prereq.from)}</span>
                      <span className="mx-3">→</span>
                      <span className="font-medium">{getCourseName(prereq.to)}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({prereq.tipo === 1 ? 'Pré-requisito' : prereq.tipo === 2 ? 'Có-requisito' : 'Pré-requisito flexível'})
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPrerequisite(prereq)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeletePrerequisite(prereq.from, prereq.to)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Nenhum pré-requisito definido ainda. Clique em "Adicionar Pré-requisito" para criar um.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Dialog for adding/editing courses or prerequisites */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'course' ? 
                (editingCourse ? 'Editar Disciplina' : 'Adicionar Disciplina') : 
                'Adicionar Pré-requisito'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'course' ? 
                (editingCourse ? 'Edite os detalhes da disciplina abaixo.' : 'Preencha os detalhes da nova disciplina abaixo.') : 
                'Selecione as disciplinas para criar um novo pré-requisito.'}
            </DialogDescription>
          </DialogHeader>
          
          {dialogType === 'course' ? (
            <CourseForm 
              initialCourse={editingCourse}
              onSave={handleSaveCourse}
              onCancel={() => setDialogOpen(false)}
            />
          ) : (
            <PrerequisiteForm 
              courses={curriculumData.courses}
              onSave={handleSavePrerequisite}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for editing prerequisite type */}
      <Dialog open={editPrerequisiteDialogOpen} onOpenChange={setEditPrerequisiteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Pré-requisito</DialogTitle>
            <DialogDescription>
              Selecione o novo tipo de pré-requisito para a relação entre{' '}
              {editingPrerequisite && (
                <>
                  <strong>{getCourseName(editingPrerequisite.from)}</strong> e{' '}
                  <strong>{getCourseName(editingPrerequisite.to)}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Select
              value={editingPrerequisite?.tipo.toString()}
              onValueChange={(value) => handleUpdatePrerequisiteType(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Pré-requisito</SelectItem>
                <SelectItem value="2">Có-requisito</SelectItem>
                <SelectItem value="3">Pré-requisito flexível</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCurriculum;
