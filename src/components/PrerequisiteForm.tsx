
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course, Prerequisite } from '@/types/curriculum';
import { addPrerequisite } from '@/lib/curriculumStorage';
import { useToast } from '@/components/ui/use-toast';

interface PrerequisiteFormProps {
  courses: Course[];
  onSave: (prerequisite: Prerequisite) => void;
  onCancel: () => void;
}

const PrerequisiteForm: React.FC<PrerequisiteFormProps> = ({ courses, onSave, onCancel }) => {
  const { toast } = useToast();
  const [fromCourseId, setFromCourseId] = useState<string>('');
  const [toCourseId, setToCourseId] = useState<string>('');
  const [selectedType, setSelectedType] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromCourseId || !toCourseId) {
      toast({
        title: "Validation Error",
        description: "Please select both courses",
        variant: "destructive"
      });
      return;
    }

    if (fromCourseId === toCourseId) {
      toast({
        title: "Validation Error",
        description: "A course cannot be a prerequisite for itself",
        variant: "destructive"
      });
      return;
    }

    // Check for circular dependency
    const fromCourse = courses.find(c => c.id === fromCourseId);
    const toCourse = courses.find(c => c.id === toCourseId);

    if (fromCourse && toCourse && fromCourse.period >= toCourse.period) {
      toast({
        title: "Logic Error",
        description: "A prerequisite course must be in an earlier period",
        variant: "destructive"
      });
      return;
    }

    try {
      // Correctly use 'tipo' property to match the Prerequisite interface
      const prerequisite = { from: fromCourseId, to: toCourseId, tipo: parseInt(selectedType) };
      addPrerequisite(fromCourseId, toCourseId, parseInt(selectedType));
      onSave(prerequisite);
      toast({
        title: "Success",
        description: "Prerequisite added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add the prerequisite",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fromCourse">Prerequisite Course</Label>
        <Select value={fromCourseId} onValueChange={setFromCourseId}>
          <SelectTrigger id="fromCourse">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses
              .sort((a, b) => a.period - b.period || a.name.localeCompare(b.name))
              .map(course => (
                <SelectItem key={`from-${course.id}`} value={course.id}>
                  {`${course.period}.${course.row} - ${course.name}`}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-center py-2">
        <div className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full">
          →
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="toCourse">Target Course</Label>
        <Select value={toCourseId} onValueChange={setToCourseId}>
          <SelectTrigger id="toCourse">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses
              .sort((a, b) => a.period - b.period || a.name.localeCompare(b.name))
              .map(course => (
                <SelectItem key={`to-${course.id}`} value={course.id}>
                  {`${course.period}.${course.row} - ${course.name}`}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type of Prerequisite</Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Pré-requisito</SelectItem>
            <SelectItem value="2">Có-requisito</SelectItem>
            <SelectItem value="3">Pré-requisito flexível</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Prerequisite
        </Button>
      </div>
    </form>
  );
};

export default PrerequisiteForm;
