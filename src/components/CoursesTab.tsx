
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseTimetable from './CourseTimetable';
import CourseList from './CourseList';

const CoursesTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <CourseTimetable />
        </div>
        <div className="w-full md:w-2/3">
          <CourseList />
        </div>
      </div>
    </div>
  );
};

export default CoursesTab;
