import React, { useState, useEffect, useRef } from 'react';
import { Course, Prerequisite, CurriculumData } from '@/types/curriculum';
import { loadCurriculumData, saveCurriculumData } from '@/lib/curriculumStorage';
import CourseBox from './CourseBox';
import PrerequisiteArrow from './PrerequisiteArrow';

const CurriculumFlow: React.FC = () => {
  const [curriculumData, setCurriculumData] = useState<CurriculumData>({ courses: [], prerequisites: [] });
  const containerRef = useRef<HTMLDivElement>(null);

  // On mount, load data from local storage
  useEffect(() => {
    const data = loadCurriculumData();
    setCurriculumData(data);
  }, []);

  // Calculate course position based on period and row
  const calculatePosition = (period: number, row: number) => {
    const periodWidth = 155;
    const periodGap = 75; // Increased from 60 to 75 (25% more)
    const rowHeight = 110;
    const rowGap = 20; // Doubled from 10 to 20
    
    const left = (period - 1) * (periodWidth + periodGap);
    const top = (row - 1) * (rowHeight + rowGap);
    
    return { left, top };
  };

  // Find the max year and period to display headers
  const maxYear = Math.ceil(Math.max(...curriculumData.courses.map(c => c.period)) / 2) || 5;
  const maxPeriod = Math.max(...curriculumData.courses.map(c => c.period)) || 10;

  return (
    <div className="overflow-x-auto overflow-y-auto bg-gray-50 p-4 rounded-lg border">
      <div className="relative min-w-[1200px]" ref={containerRef}>
        {/* Year headers */}
        <div className="flex border border-gray-300 mb-2">
          {Array.from({ length: maxYear }, (_, i) => (
            <div 
              key={`year-${i+1}`} 
              className="flex-1 text-center p-2 font-semibold border-r border-gray-300 last:border-r-0"
            >
              {`${i+1}º Ano`}
            </div>
          ))}
        </div>
        
        {/* Period headers */}
        <div className="flex mb-6">
          {Array.from({ length: maxPeriod }, (_, i) => (
            <div 
              key={`period-${i+1}`} 
              className="w-[155px] mr-[60px] last:mr-0 text-center p-2 bg-white border border-gray-300 rounded-md shadow-sm"
            >
              {`${i+1}º Período`}
            </div>
          ))}
        </div>
        
        {/* Courses section */}
        <div 
          className="relative"
          style={{ minHeight: `${Math.max(...curriculumData.courses.map(c => c.row)) * 120 + 100}px` }}
        >
          {/* Render course boxes */}
          {curriculumData.courses.map((course) => {
            const position = calculatePosition(course.period, course.row);
            return (
              <CourseBox
                key={course.id}
                course={course}
                position={position}
              />
            );
          })}
          
          {/* Render prerequisite arrows */}
          {curriculumData.prerequisites.map((prereq) => {
            const fromCourse = curriculumData.courses.find(c => c.id === prereq.from);
            const toCourse = curriculumData.courses.find(c => c.id === prereq.to);
            
            if (!fromCourse || !toCourse) return null;
            
            const fromPosition = calculatePosition(fromCourse.period, fromCourse.row);
            const toPosition = calculatePosition(toCourse.period, toCourse.row);
            
            return (
              <PrerequisiteArrow
                key={`${prereq.from}-${prereq.to}`}
                fromPosition={{
                  left: fromPosition.left + 155, // End of the course box
                  top: fromPosition.top + 55   // Middle of the course box
                }}
                toPosition={{
                  left: toPosition.left,       // Start of the course box
                  top: toPosition.top + 55     // Middle of the course box
                }}
                isDirectConnection={toCourse.period - fromCourse.period === 1 && toCourse.row === fromCourse.row}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CurriculumFlow;
