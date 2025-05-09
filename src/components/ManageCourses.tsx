
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Course } from '@/types/curriculum';
import { deleteCourse } from '@/lib/curriculumStorage';
import CourseForm from './CourseForm';

interface ManageCoursesProps {
  courses: Course[];
  onDataChange: () => void;
}

const ManageCourses: React.FC<ManageCoursesProps> = ({ courses, onDataChange }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);

  const handleOpenAddCourse = () => {
    setEditingCourse(undefined);
    setDialogOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setDialogOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteCourse(courseId);
      onDataChange();
    }
  };

  const handleSaveCourse = (course: Course) => {
    setDialogOpen(false);
    onDataChange();
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Courses</h3>
        <Button onClick={handleOpenAddCourse}>Add Course</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {courses
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

      {/* Dialog for adding/editing courses */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Add Course'}
            </DialogTitle>
          </DialogHeader>
          
          <CourseForm 
            initialCourse={editingCourse}
            onSave={handleSaveCourse}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageCourses;
