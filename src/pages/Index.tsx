import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import CurriculumFlow from '../components/CurriculumFlow';
import ManageCurriculum from '../components/ManageCurriculum';
import ImportExport from '../components/ImportExport';
import { loadCurriculumData, loadCurriculumDataAsync } from '../lib/curriculumStorage';
import { useCurriculumPercentage } from '../hooks/use-curriculum-percentage';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [prerequisitesCount, setPrerequisitesCount] = useState(0);
  const [completedCoursesCount, setCompletedCoursesCount] = useState(0);
  
  // Usar o hook personalizado para calcular a porcentagem
  const completedPercentage = useCurriculumPercentage(refreshKey);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadCurriculumDataAsync();
        setCoursesCount(data.courses.length);
        setPrerequisitesCount(data.prerequisites.length);
        setCompletedCoursesCount(data.completedCourses.length);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        const localData = loadCurriculumData();
        setCoursesCount(localData.courses.length);
        setPrerequisitesCount(localData.prerequisites.length);
        setCompletedCoursesCount(localData.completedCourses.length);
      }
    };
    
    fetchData();
  }, [refreshKey]);
  
  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto p-2 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gerenciador de Grade Curricular da Engenharia Cartográfica e de Agrimensura - IFG.</h1>
          <div>
            {!loading && (
              user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={signOut}>Sair</Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button size="sm">Login</Button>
                </Link>
              )
            )}
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-2 py-2">
        <Tabs defaultValue="view" className="flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-4 items-start mb-4">
            <Card>
              <CardContent className="p-2 pt-2">
                <div className="grid grid-cols-4 gap-2">
                  <div className="border rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Disciplinas</p>
                    <p className="text-xl font-bold">{coursesCount}</p>
                  </div>
                  <div className="border rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Pré-requisitos</p>
                    <p className="text-xl font-bold">{prerequisitesCount}</p>
                  </div>
                  <div className="border rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Concluídas</p>
                    <p className="text-xl font-bold">{completedCoursesCount}</p>
                  </div>
                  <div className="border rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">% Concluída</p>
                    <p className="text-xl font-bold">{completedPercentage.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex items-center">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="view">Visualizar Grade</TabsTrigger>
                <TabsTrigger value="manage" disabled={!user}>Manage Data</TabsTrigger>
                <TabsTrigger value="import-export">Import/Export</TabsTrigger>
              </TabsList>
            </div>
          </div>
        
        <TabsContent value="view" className="flex-1 pt-0 mt-0">
          <CurriculumFlow key={refreshKey} />
        </TabsContent>
        
        <TabsContent value="manage" className="flex-1">
          <div className="container mx-auto px-2 py-2">
            {user ? (
              <ManageCurriculum onDataChange={handleDataChange} />
            ) : (
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-medium mb-4">Login necessário</p>
                  <p className="text-gray-500 mb-4">
                    Você precisa estar autenticado para gerenciar os dados do currículo.
                  </p>
                  <Link to="/auth">
                    <Button>Login / Cadastro</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="import-export" className="flex-1">
          <div className="container mx-auto px-2 py-2">
            <ImportExport onImport={handleDataChange} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
};

export default Index;
