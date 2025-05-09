import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Course, Prerequisite, CurriculumData } from '@/types/curriculum';
import { loadCurriculumData, deleteCourse, removePrerequisite } from '@/lib/curriculumStorage';
import CourseForm from './CourseForm';
import PrerequisiteForm from './PrerequisiteForm';

interface ManageCurriculumProps {
  onDataChange: () => void;
}

const ManageCurriculum: React.FC<ManageCurriculumProps> = ({ onDataChange }) => {
  const [curriculumData, setCurriculumData] = useState<CurriculumData>({ 
    courses: [], 
    prerequisites: [],
    completedCourses: [] 
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'course' | 'prerequisite'>('course');
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);

  // Load data on mount
  useEffect(() => {
    loadAndSetData();
  }, []);

  const loadAndSetData = () => {
    const data = loadCurriculumData();
    setCurriculumData(data);
  };

  const handleOpenAddCourse = () => {
    setDialogType('course');
    setEditingCourse(undefined);
    setDialogOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setDialogType('course');
    setEditingCourse(course);
    setDialogOpen(true);
  };

  const handleOpenAddPrerequisite = () => {
    setDialogType('prerequisite');
    setDialogOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourse(courseId);
      loadAndSetData();
      onDataChange();
    }
  };

  const handleDeletePrerequisite = (from: string, to: string) => {
    if (window.confirm('Are you sure you want to delete this prerequisite?')) {
      removePrerequisite(from, to);
      loadAndSetData();
      onDataChange();
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
  
  // Find course name by ID
  const getCourseName = (courseId: string) => {
    return curriculumData.courses.find(c => c.id === courseId)?.name || courseId;
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
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Manage Courses</h3>
            <Button onClick={handleOpenAddCourse}>Add Course</Button>
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
                    <CardDescription>Period {course.period}, Row {course.row}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 pb-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hours: {course.hours}</span>
                      <span>Type: {course.type}</span>
                      <span>Credits: {course.credits}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 pt-0">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEditCourse(course)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        {/* Prerequisites Tab */}
        <TabsContent value="prerequisites" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Manage Prerequisites</h3>
            <Button onClick={handleOpenAddPrerequisite}>Add Prerequisite</Button>
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
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeletePrerequisite(prereq.from, prereq.to)}
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No prerequisites defined yet. Click "Add Prerequisite" to create one.
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
                (editingCourse ? 'Edit Course' : 'Add Course') : 
                'Add Prerequisite'}
            </DialogTitle>
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
    </div>
  );
};

export default ManageCurriculum;
