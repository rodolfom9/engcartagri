
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CurriculumData } from '@/types/curriculum';
import { loadCurriculumData, importCurriculumToSupabase } from '@/lib/curriculumStorage';
import { useToast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

interface ImportExportProps {
  onImport: () => void;
}

const ImportExport: React.FC<ImportExportProps> = ({ onImport }) => {
  const { toast } = useToast();
  const [importData, setImportData] = useState('');

  const handleExport = () => {
    const data = loadCurriculumData();
    // Only export completed courses
    const exportData = {
      completedCourses: data.completedCourses
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    setImportData(jsonString);

    // Also copy to clipboard
    navigator.clipboard.writeText(jsonString)
      .then(() => {
        toast({
          title: "Copiado para área de transferência",
          description: "As disciplinas concluídas foram copiadas para sua área de transferência"
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
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    try {
      const importedData = JSON.parse(importData);
      
      // Check if it's the new format (only completed courses) or the old format (full curriculum)
      let completedCoursesToImport: string[] = [];
      
      if (importedData.completedCourses && Array.isArray(importedData.completedCourses)) {
        // New format: only completed courses
        completedCoursesToImport = importedData.completedCourses;
      } else if (importedData.courses && importedData.prerequisites && importedData.completedCourses) {
        // Old format: full curriculum data - extract only completed courses
        completedCoursesToImport = importedData.completedCourses;
      } else {
        throw new Error("Formato de dados inválido");
      }

      // Get current curriculum data and update only completed courses
      const currentData = loadCurriculumData();
      const updatedData = {
        ...currentData,
        completedCourses: completedCoursesToImport
      };

      // Verificar se o usuário está autenticado
      const { data: userData } = await supabase.auth.getSession();
      
      if (userData?.session?.user) {
        // Usuário autenticado - importar para o Supabase
        const success = await importCurriculumToSupabase(updatedData);
        
        if (success) {
          onImport();
          
          toast({
            title: "Importação bem-sucedida",
            description: `Importadas ${completedCoursesToImport.length} disciplinas concluídas`
          });
          
          setImportData('');
        } else {
          toast({
            title: "Falha ao importar para o Supabase",
            description: "Não foi possível salvar os dados no banco. Tente novamente.",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Usuário não autenticado - salvar no localStorage para persistir após recarregar a página
        localStorage.setItem('curriculum_data', JSON.stringify({
          ...currentData,
          completedCourses: completedCoursesToImport
        }));
        
        // Também atualizar o sessionStorage para uso imediato
        sessionStorage.setItem('completed_courses_session', JSON.stringify(completedCoursesToImport));
        
        // Disparar evento para atualizar a UI
        window.dispatchEvent(new CustomEvent('curriculumDataChanged'));
        
        onImport();
        
        toast({
          title: "Importação bem-sucedida",
          description: `Importadas ${completedCoursesToImport.length} disciplinas concluídas`
        });
        
        setImportData('');
      }
    } catch (error) {
      console.error("Erro na importação:", error);
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
        <div className="flex flex-col md:flex-row gap-2 md:space-x-4">
          <Button onClick={handleExport} className="flex-1">Exportar JSON</Button>
          <Button onClick={handleExportPDF} className="flex-1">Exportar PDF</Button>
          <Button onClick={handleImport} disabled={!importData} className="flex-1">Importar</Button>
        </div>
        <Textarea
          placeholder="Cole os dados das disciplinas concluídas aqui para importar, ou exporte para ver os dados..."
          value={importData}
          onChange={e => setImportData(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Use este recurso para fazer backup das suas disciplinas concluídas ou compartilhá-las com outros.
      </CardFooter>
    </Card>
  );
};

export default ImportExport;
