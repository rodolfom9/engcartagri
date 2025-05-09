
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurriculumData } from '@/types/curriculum';
import { loadCurriculumData } from '@/lib/curriculumStorage';
import ManageCourses from './ManageCourses';
import ManagePrerequisites from './ManagePrerequisites';

interface ManageCurriculumProps {
  onDataChange: () => void;
}

const ManageCurriculum: React.FC<ManageCurriculumProps> = ({ onDataChange }) => {
  const [curriculumData, setCurriculumData] = useState<CurriculumData>({ 
    courses: [], 
    prerequisites: [],
    completedCourses: [] 
  });

  // Load data on mount
  useEffect(() => {
    loadAndSetData();
  }, []);

  const loadAndSetData = () => {
    const data = loadCurriculumData();
    setCurriculumData(data);
  };

  const handleDataChange = () => {
    loadAndSetData();
    onDataChange();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="courses">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
        </TabsList>
        
        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <ManageCourses 
            courses={curriculumData.courses}
            onDataChange={handleDataChange}
          />
        </TabsContent>
        
        {/* Prerequisites Tab */}
        <TabsContent value="prerequisites" className="space-y-4">
          <ManagePrerequisites 
            courses={curriculumData.courses}
            prerequisites={curriculumData.prerequisites}
            onDataChange={handleDataChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageCurriculum;
