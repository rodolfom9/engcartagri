
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course } from '@/types/curriculum';
import { loadCourseDetails, saveCourseDetails } from '@/lib/curriculumStorage';
import { useToast } from '@/components/ui/use-toast';

interface CourseDetailsFormProps {
  courseId: string;
  onSave: () => void;
  onCancel: () => void;
}

const CourseDetailsForm: React.FC<CourseDetailsFormProps> = ({ courseId, onSave, onCancel }) => {
  const { toast } = useToast();
  const existingDetails = loadCourseDetails()[courseId] || {
    courseId,
    professor: '',
    code: '',
    schedules: []
  };

  const [details, setDetails] = useState(existingDetails);
  const [newSchedule, setNewSchedule] = useState({
    day: 'monday',
    period: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleDayChange = (value: string) => {
    setNewSchedule(prev => ({ ...prev, day: value as any }));
  };

  const handlePeriodChange = (value: string) => {
    setNewSchedule(prev => ({ ...prev, period: parseInt(value) as any }));
  };

  const addSchedule = () => {
    setDetails(prev => ({
      ...prev,
      schedules: [...(prev.schedules || []), newSchedule]
    }));
  };

  const removeSchedule = (index: number) => {
    setDetails(prev => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      saveCourseDetails({
        ...details,
        courseId
      });
      
      toast({
        title: "Success",
        description: "Course details saved successfully",
      });

      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save course details",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Course Code</Label>
        <Input 
          id="code" 
          name="code" 
          value={details.code || ''} 
          onChange={handleChange}
          placeholder="e.g. CS101" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="professor">Professor</Label>
        <Input 
          id="professor" 
          name="professor" 
          value={details.professor || ''} 
          onChange={handleChange}
          placeholder="Professor name" 
        />
      </div>

      <div className="border p-4 rounded-md space-y-4">
        <h3 className="text-sm font-medium">Class Schedule</h3>
        
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="day">Day</Label>
            <Select value={newSchedule.day} onValueChange={handleDayChange}>
              <SelectTrigger id="day">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="period">Period</Label>
            <Select value={newSchedule.period.toString()} onValueChange={handlePeriodChange}>
              <SelectTrigger id="period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button type="button" onClick={addSchedule} className="w-full">Add</Button>
          </div>
        </div>
        
        <div className="space-y-2">
          {details.schedules && details.schedules.length > 0 ? (
            <div className="border rounded-md divide-y">
              {details.schedules.map((schedule, index) => (
                <div key={index} className="p-2 flex justify-between items-center">
                  <span>
                    {schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1)}, 
                    Period {schedule.period}
                  </span>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeSchedule(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No schedules added yet</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Details
        </Button>
      </div>
    </form>
  );
};

export default CourseDetailsForm;
