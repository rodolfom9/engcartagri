
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { loadCurriculumData, loadCourseDetails, isCourseCompleted } from '@/lib/curriculumStorage';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = [1, 2, 3];

const CourseTimetable: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  
  const data = loadCurriculumData();
  const courseDetails = loadCourseDetails();
  
  // Get all courses that are not completed
  const availableCourses = data.courses.filter(
    course => !isCourseCompleted(course.id)
  );
  
  // Build timetable data
  const timetable: { [key: string]: { [key: number]: string } } = {};
  
  weekdays.forEach(day => {
    timetable[day] = {};
    periods.forEach(period => {
      timetable[day][period] = '';
    });
  });
  
  // Fill timetable with scheduled courses
  Object.values(courseDetails).forEach(details => {
    if (details.schedules) {
      details.schedules.forEach(schedule => {
        const day = schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1);
        const course = data.courses.find(c => c.id === details.courseId);
        if (course && !isCourseCompleted(course.id)) {
          timetable[day][schedule.period] = course.name;
        }
      });
    }
  });
  
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Period</TableHead>
                {weekdays.map(day => (
                  <TableHead key={day}>{day}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map(period => (
                <TableRow key={period}>
                  <TableCell className="font-medium">{period}</TableCell>
                  {weekdays.map(day => (
                    <TableCell key={`${day}-${period}`} className={timetable[day][period] ? 'bg-blue-50' : ''}>
                      {timetable[day][period]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseTimetable;
