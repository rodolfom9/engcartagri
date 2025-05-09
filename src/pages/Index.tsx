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
      <div className="container mx-auto px-2 py-2">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold">Curricular Flow Builder</h1>
          <p className="text-sm text-gray-600">
            Create, visualize and manage your curriculum structure
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Card className="p-0">
            <CardHeader className="p-2">
              <CardTitle className="text-sm">Courses</CardTitle>
              <CardDescription className="text-xs">Total registered</CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <p className="text-xl font-bold">{courseCount}</p>
            </CardContent>
          </Card>
          
          <Card className="p-0">
            <CardHeader className="p-2">
              <CardTitle className="text-sm">Prerequisites</CardTitle>
              <CardDescription className="text-xs">Total connections</CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <p className="text-xl font-bold">{prerequisiteCount}</p>
            </CardContent>
          </Card>
          
          <Card className="p-0">
            <CardHeader className="p-2">
              <CardTitle className="text-sm">Course Types</CardTitle>
              <CardDescription className="text-xs">Colors</CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-course-nb"></span>
                  <span>NB</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-course-np"></span>
                  <span>NP</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-course-ne"></span>
                  <span>NE</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-course-optional"></span>
                  <span>NA</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="view" className="flex-1 flex flex-col">
        <div className="container mx-auto px-2">
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="view" className="text-sm py-1">View Curriculum</TabsTrigger>
            <TabsTrigger value="manage" className="text-sm py-1">Manage Data</TabsTrigger>
            <TabsTrigger value="import-export" className="text-sm py-1">Import/Export</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="view" className="flex-1">
          <CurriculumFlow key={refreshKey} />
        </TabsContent>
        
        <TabsContent value="manage" className="flex-1">
          <div className="container mx-auto px-2">
            <ManageCurriculum onDataChange={handleDataChange} />
          </div>
        </TabsContent>
        
        <TabsContent value="import-export" className="flex-1">
          <div className="container mx-auto px-2">
            <ImportExport onImport={handleDataChange} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
