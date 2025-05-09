import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CurriculumData } from '@/types/curriculum';
import { loadCurriculumData, importCurriculumData } from '@/lib/curriculumStorage';
import { useToast } from '@/components/ui/use-toast';

interface ImportExportProps {
  onImport: () => void;
}

const ImportExport: React.FC<ImportExportProps> = ({ onImport }) => {
  const { toast } = useToast();
  const [importData, setImportData] = useState('');

  const handleExport = () => {
    const data = loadCurriculumData();
    const jsonString = JSON.stringify(data, null, 2);
    setImportData(jsonString);

    // Also copy to clipboard
    navigator.clipboard.writeText(jsonString)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The curriculum data has been copied to your clipboard"
        });
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Please manually copy the text from the box below",
          variant: "destructive"
        });
      });
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importData) as CurriculumData;
      
      // Basic validation
      if (!data.courses || !Array.isArray(data.courses) || 
          !data.prerequisites || !Array.isArray(data.prerequisites)) {
        throw new Error("Invalid data format");
      }

      importCurriculumData(data);
      onImport();
      
      toast({
        title: "Import successful",
        description: `Imported ${data.courses.length} courses and ${data.prerequisites.length} prerequisites`
      });
      
      setImportData('');
    } catch (error) {
      toast({
        title: "Import failed",
        description: "The data format is invalid. Please check and try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import/Export Curriculum Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-4">
          <Button onClick={handleExport} className="flex-1">Export Data</Button>
          <Button onClick={handleImport} disabled={!importData} className="flex-1">Import Data</Button>
        </div>
        <Textarea
          placeholder="Paste curriculum data here to import, or export to see the data..."
          value={importData}
          onChange={e => setImportData(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Use this feature to backup your curriculum data or share it with others.
      </CardFooter>
    </Card>
  );
};

export default ImportExport;
