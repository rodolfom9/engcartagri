import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CurriculumFlow from '@/components/CurriculumFlow';
import ManageCurriculum from '@/components/ManageCurriculum';
import ImportExport from '@/components/ImportExport';
import { loadCurriculumData } from '@/lib/curriculumStorage';

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  const data = loadCurriculumData();
  const courseCount = data.courses.length;
  const prerequisiteCount = data.prerequisites.length;

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold mb-2">Curricular Flow Builder</h1>
          <p className="text-lg text-gray-600">
            Create, visualize and manage your curriculum structure
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Courses</CardTitle>
              <CardDescription>Total registered courses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{courseCount}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Prerequisites</CardTitle>
              <CardDescription>Total prerequisite connections</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{prerequisiteCount}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Course Types</CardTitle>
              <CardDescription>Classification colors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-course-nb"></span>
                  <span>NB (Basic)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-course-np"></span>
                  <span>NP (Professional)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-course-ne"></span>
                  <span>NE (Specific)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-course-optional"></span>
                  <span>NA (Optional)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="view" className="flex-1 flex flex-col">
        <div className="container mx-auto px-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="view">View Curriculum</TabsTrigger>
            <TabsTrigger value="manage">Manage Data</TabsTrigger>
            <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="view" className="flex-1">
          <CurriculumFlow key={refreshKey} />
        </TabsContent>
        
        <TabsContent value="manage" className="flex-1">
          <div className="container mx-auto px-4 py-4">
            <ManageCurriculum onDataChange={handleDataChange} />
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
