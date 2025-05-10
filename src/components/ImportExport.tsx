import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ImportDefaultData from './ImportDefaultData';
import { useToast } from './ui/use-toast';

const ImportExport = ({ onImport }) => {
  const [importFile, setImportFile] = useState(null);
  const { toast } = useToast();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setImportFile(file);
  };

  const handleImport = () => {
    if (!importFile) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo para importar.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        localStorage.setItem('curriculum_data', JSON.stringify(jsonData));
        onImport();
        toast({
          title: 'Sucesso',
          description: 'Currículo importado com sucesso!',
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao importar o currículo. Verifique o formato do arquivo.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(importFile);
  };

  const handleExport = () => {
    const data = localStorage.getItem('curriculum_data');
    if (!data) {
      toast({
        title: 'Erro',
        description: 'Não há dados para exportar.',
        variant: 'destructive',
      });
      return;
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'curriculum_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Importar/Exportar dados do currículo</CardTitle>
          <CardDescription>
            Você pode importar ou exportar os dados do currículo em formato JSON.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="import">
            <TabsList className="mb-4">
              <TabsTrigger value="import">Importar</TabsTrigger>
              <TabsTrigger value="export">Exportar</TabsTrigger>
            </TabsList>
            <TabsContent value="import">
              <div className="flex flex-col space-y-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Selecionar Arquivo
                </label>
                <Button onClick={handleImport}>Importar Currículo</Button>
              </div>
            </TabsContent>
            <TabsContent value="export">
              <Button onClick={handleExport}>Exportar Currículo</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importar dados padrão</CardTitle>
          <CardDescription>
            Importe os dados padrão do currículo diretamente para o Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportDefaultData />
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExport;
