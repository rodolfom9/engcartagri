
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Course, Prerequisite } from '@/types/curriculum';
import { removePrerequisite } from '@/lib/curriculumStorage';
import PrerequisiteForm from './PrerequisiteForm';

interface ManagePrerequisitesProps {
  courses: Course[];
  prerequisites: Prerequisite[];
  onDataChange: () => void;
}

const ManagePrerequisites: React.FC<ManagePrerequisitesProps> = ({ 
  courses, 
  prerequisites, 
  onDataChange 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenAddPrerequisite = () => {
    setDialogOpen(true);
  };

  const handleDeletePrerequisite = (from: string, to: string) => {
    if (window.confirm('Are you sure you want to delete this prerequisite?')) {
      removePrerequisite(from, to);
      onDataChange();
    }
  };

  const handleSavePrerequisite = (prerequisite: Prerequisite) => {
    setDialogOpen(false);
    onDataChange();
  };
  
  // Find course name by ID
  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.name || courseId;
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Prerequisites</h3>
        <Button onClick={handleOpenAddPrerequisite}>Add Prerequisite</Button>
      </div>
      
      {prerequisites.length > 0 ? (
        <div className="space-y-2 mt-4">
          {prerequisites.map(prereq => (
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
        <Card className="mt-4">
          <CardContent className="p-6 text-center text-gray-500">
            No prerequisites defined yet. Click "Add Prerequisite" to create one.
          </CardContent>
        </Card>
      )}

      {/* Dialog for adding prerequisites */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Prerequisite</DialogTitle>
          </DialogHeader>
          
          <PrerequisiteForm 
            courses={courses}
            onSave={handleSavePrerequisite}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManagePrerequisites;
