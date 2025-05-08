
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course, CourseType } from '@/types/curriculum';
import { generateCourseId, addCourse, updateCourse } from '@/lib/curriculumStorage';
import { useToast } from '@/components/ui/use-toast';

interface CourseFormProps {
  initialCourse?: Course;
  onSave: (course: Course) => void;
  onCancel: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ initialCourse, onSave, onCancel }) => {
  const { toast } = useToast();
  const [course, setCourse] = useState<Course>(
    initialCourse || {
      id: '',
      name: '',
      period: 1,
      row: 1,
      hours: '',
      type: 'NB' as CourseType,
      credits: 0,
    }
  );

  const isEditing = !!initialCourse;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleTypeChange = (value: string) => {
    setCourse(prev => ({ ...prev, type: value as CourseType }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!course.name || !course.hours) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate ID for new courses
      if (!isEditing) {
        course.id = generateCourseId(course.name);
        addCourse(course);
        toast({
          title: "Success",
          description: "Course added successfully",
        });
      } else {
        updateCourse(course.id, course);
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      }

      onSave(course);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the course",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Course Name</Label>
        <Input 
          id="name" 
          name="name" 
          value={course.name} 
          onChange={handleChange}
          placeholder="Enter course name" 
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="period">Period</Label>
          <Input 
            id="period" 
            name="period" 
            type="number" 
            min={1}
            max={12}
            value={course.period} 
            onChange={handleNumberChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="row">Row</Label>
          <Input 
            id="row" 
            name="row" 
            type="number" 
            min={1}
            max={20}
            value={course.row} 
            onChange={handleNumberChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hours">Hours</Label>
          <Input 
            id="hours" 
            name="hours" 
            value={course.hours} 
            onChange={handleChange}
            placeholder="e.g. 60h"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select 
            value={course.type} 
            onValueChange={handleTypeChange}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NB">NB</SelectItem>
              <SelectItem value="NP">NP</SelectItem>
              <SelectItem value="NE">NE</SelectItem>
              <SelectItem value="NA">NA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="credits">Credits</Label>
          <Input 
            id="credits" 
            name="credits" 
            type="number" 
            min={0}
            value={course.credits} 
            onChange={handleNumberChange}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update' : 'Add'} Course
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;
