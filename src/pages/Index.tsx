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
      <div className="container mx-auto px-4 py-2">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold mb-1">Curricular Flow Builder</h1>
          <p className="text-sm text-gray-600">
            Create, visualize and manage your curriculum structure
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card className="flex flex-row items-center h-22 py-0">
            <CardHeader className="pb-0 pt-0 pr-0">
              <CardTitle className="text-sm">Courses</CardTitle>
              <CardDescription className="text-xs">Total registered courses</CardDescription>
            </CardHeader>
            <CardContent className="py-0 flex items-center">
              <p className="text-xl font-bold">{courseCount}</p>
            </CardContent>
          </Card>
          
          <Card className="flex flex-row items-center h-22 py-0">
            <CardHeader className="pb-0 pt-0 pr-0">
              <CardTitle className="text-sm">Prerequisites</CardTitle>
              <CardDescription className="text-xs">Total prerequisite connections</CardDescription>
            </CardHeader>
            <CardContent className="py-0 flex items-center">
              <p className="text-xl font-bold">{prerequisiteCount}</p>
            </CardContent>
          </Card>
          
          <Card className="h-22 py-0">
            <CardHeader className="pb-0 pt-1">
              <CardTitle className="text-sm">Course Types</CardTitle>
              <CardDescription className="text-xs">Classification colors</CardDescription>
            </CardHeader>
            <CardContent className="py-0 grid grid-cols-2 gap-x-2 gap-y-0">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-course-nb"></span>
                <span className="text-xs">NB (Basic)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-course-np"></span>
                <span className="text-xs">NP (Professional)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-course-ne"></span>
                <span className="text-xs">NE (Specific)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-course-optional"></span>
                <span className="text-xs">NA (Optional)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="view" className="flex-1 flex flex-col">
        <div className="container mx-auto px-2">
          <TabsList className="grid grid-cols-3 mb-0">
            <TabsTrigger value="view">View Curriculum</TabsTrigger>
            <TabsTrigger value="manage">Manage Data</TabsTrigger>
            <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="view" className="flex-1 pt-0 mt-0">
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
