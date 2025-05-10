
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import CurriculumFlow from '../components/CurriculumFlow';
import ManageCurriculum from '../components/ManageCurriculum';
import ImportExport from '../components/ImportExport';
import { loadCurriculumData, loadCurriculumDataAsync } from '../lib/curriculumStorage';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [prerequisitesCount, setPrerequisitesCount] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadCurriculumDataAsync();
        setCoursesCount(data.courses.length);
        setPrerequisitesCount(data.prerequisites.length);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        const localData = loadCurriculumData();
        setCoursesCount(localData.courses.length);
        setPrerequisitesCount(localData.prerequisites.length);
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
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gerenciador de Currículo</h1>
          <div>
            {!loading && (
              user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Button variant="outline" size="sm" onClick={signOut}>Sair</Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button size="sm">Login / Cadastro</Button>
                </Link>
              )
            )}
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Estatísticas</CardTitle>
            <CardDescription>Visão geral do currículo</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Disciplinas</p>
                <p className="text-3xl font-bold">{coursesCount}</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Pré-requisitos</p>
                <p className="text-3xl font-bold">{prerequisitesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Informações</CardTitle>
            <CardDescription>Sobre o gerenciador de currículo</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p>
              Este gerenciador permite visualizar o fluxo do curso, marcar disciplinas como concluídas, 
              visualizar pré-requisitos e gerenciar sua grade de horários.
            </p>
            <p className="mt-2">
              Na aba "Gerenciar Dados" você pode adicionar, editar ou remover disciplinas e pré-requisitos.
              {!user && (
                <span className="text-amber-600 ml-1">
                  Login necessário para editar dados.
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="view" className="flex-1 flex flex-col">
        <div className="container mx-auto px-2">
          <TabsList className="grid grid-cols-3 mb-0">
            <TabsTrigger value="view">View Curriculum</TabsTrigger>
            <TabsTrigger value="manage" disabled={!user}>Manage Data</TabsTrigger>
            <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="view" className="flex-1 pt-0 mt-0">
          <CurriculumFlow key={refreshKey} />
        </TabsContent>
        
        <TabsContent value="manage" className="flex-1">
          <div className="container mx-auto px-4 py-4">
            {user ? (
              <ManageCurriculum onDataChange={handleDataChange} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
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
          <div className="container mx-auto px-4 py-4">
            <ImportExport onImport={handleDataChange} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
