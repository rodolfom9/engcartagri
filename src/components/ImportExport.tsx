import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CurriculumData } from '@/types/curriculum';
import { loadCurriculumData, importCurriculumToSupabase } from '@/lib/curriculumStorage';
import { useToast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
          title: "Copiado para área de transferência",
          description: "Os dados do currículo foram copiados para sua área de transferência"
        });
      })
      .catch(() => {
        toast({
          title: "Falha ao copiar",
          description: "Por favor, copie manualmente o texto da caixa abaixo",
          variant: "destructive"
        });
      });
  };

  const handleExportPDF = async () => {
    try {
      const element = document.querySelector('.curriculum-flow');
      if (!element) {
        throw new Error('Elemento do fluxo curricular não encontrado');
      }

      const canvas = await html2canvas(element as HTMLElement);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('fluxo-curricular.pdf');

      toast({
        title: "PDF exportado com sucesso",
        description: "O fluxo curricular foi salvo como PDF"
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importData) as CurriculumData;
      
      // Basic validation
      if (!data.courses || !Array.isArray(data.courses) || 
          !data.prerequisites || !Array.isArray(data.prerequisites)) {
        throw new Error("Formato de dados inválido");
      }

      const success = await importCurriculumToSupabase(data);
      
      if (success) {
        onImport();
        
        toast({
          title: "Importação bem-sucedida",
          description: `Importadas ${data.courses.length} disciplinas e ${data.prerequisites.length} pré-requisitos`
        });
        
        setImportData('');
      } else {
        toast({
          title: "Falha ao importar para o Supabase",
          description: "Não foi possível salvar os dados no banco. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Falha na importação",
        description: "O formato dos dados é inválido. Verifique e tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar/Exportar Dados do Currículo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-4">
          <Button onClick={handleExport} className="flex-1">Exportar JSON</Button>
          <Button onClick={handleExportPDF} className="flex-1">Exportar PDF</Button>
          <Button onClick={handleImport} disabled={!importData} className="flex-1">Importar</Button>
        </div>
        <Textarea
          placeholder="Cole os dados do currículo aqui para importar, ou exporte para ver os dados..."
          value={importData}
          onChange={e => setImportData(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Use este recurso para fazer backup dos seus dados ou compartilhá-los com outros.
      </CardFooter>
    </Card>
  );
};

export default ImportExport;
