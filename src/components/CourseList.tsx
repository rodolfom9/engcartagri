
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { loadCurriculumData, markCourseCompleted, unmarkCourseCompleted, isCourseCompleted } from '@/lib/curriculumStorage';

const CourseList: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const data = loadCurriculumData();
  
  const handleToggleCompleted = (courseId: string) => {
    if (isCourseCompleted(courseId)) {
      unmarkCourseCompleted(courseId);
    } else {
      markCourseCompleted(courseId);
    }
    setRefreshKey(prev => prev + 1);
  };
  
  return (
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
                return (
                  <TableRow key={course.id} className={completed ? 'bg-green-50' : ''}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>{course.type}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{`P${course.period}/R${course.row}`}</TableCell>
                    <TableCell>{course.hours}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>{completed ? 'Completed' : 'Pending'}</TableCell>
                    <TableCell>
                      <Button 
                        variant={completed ? "outline" : "default"} 
                        size="sm"
                        onClick={() => handleToggleCompleted(course.id)}
                      >
                        {completed ? "Undo" : "Complete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CourseList;
