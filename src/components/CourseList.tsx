
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { loadCurriculumData, markCourseCompleted, unmarkCourseCompleted, isCourseCompleted, loadCourseDetails } from '@/lib/curriculumStorage';
import CourseDetailsForm from './CourseDetailsForm';

const CourseList: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const data = loadCurriculumData();
  const courseDetails = loadCourseDetails();
  
  const handleToggleCompleted = (courseId: string) => {
    if (isCourseCompleted(courseId)) {
      unmarkCourseCompleted(courseId);
    } else {
      markCourseCompleted(courseId);
    }
    setRefreshKey(prev => prev + 1);
  };
  
  const openDetailsDialog = (courseId: string) => {
    setSelectedCourseId(courseId);
  };
  
  const closeDetailsDialog = () => {
    setSelectedCourseId(null);
  };
  
  const handleDetailsSaved = () => {
    setSelectedCourseId(null);
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Period/Row</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.courses
                .sort((a, b) => a.period - b.period || a.row - b.row)
                .map(course => {
                  const completed = isCourseCompleted(course.id);
                  const details = courseDetails[course.id] || { professor: '-', code: '-' };
                  return (
                    <TableRow key={course.id} className={completed ? 'bg-green-50' : ''}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.type}</TableCell>
                      <TableCell>{details.code || '-'}</TableCell>
                      <TableCell>{details.professor || '-'}</TableCell>
                      <TableCell>{`P${course.period}/R${course.row}`}</TableCell>
                      <TableCell>{course.hours}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>{completed ? 'Completed' : 'Pending'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant={completed ? "outline" : "default"} 
                            size="sm"
                            onClick={() => handleToggleCompleted(course.id)}
                          >
                            {completed ? "Undo" : "Complete"}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openDetailsDialog(course.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Course Details Dialog */}
      <Dialog open={!!selectedCourseId} onOpenChange={() => selectedCourseId && closeDetailsDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
          </DialogHeader>
          {selectedCourseId && (
            <CourseDetailsForm
              courseId={selectedCourseId}
              onSave={handleDetailsSaved}
              onCancel={closeDetailsDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseList;
