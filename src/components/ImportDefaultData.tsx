
import { useState } from 'react';
import { Button } from './ui/button';
import { importDefaultDataToSupabase } from '../lib/supabaseService';
import { toast } from './ui/use-toast';
import { Loader2 } from 'lucide-react';

const ImportDefaultData = () => {
  const [isImporting, setIsImporting] = useState(false);

  const handleImportDefaultData = async () => {
    try {
      setIsImporting(true);
      const success = await importDefaultDataToSupabase();
      
      if (success) {
        toast({
          title: 'Importação concluída',
          description: 'Os dados padrão foram importados com sucesso para o Supabase.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Erro na importação',
          description: 'Ocorreu um erro ao importar os dados padrão.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao importar dados padrão:', error);
      toast({
        title: 'Erro na importação',
        description: 'Ocorreu um erro inesperado ao importar os dados padrão.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleImportDefaultData}
        disabled={isImporting}
        className="w-full"
      >
        {isImporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importando dados padrão...
          </>
        ) : (
          'Importar dados padrão para Supabase'
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Isso importará todas as disciplinas e pré-requisitos para o Supabase.
        Os dados existentes serão substituídos.
      </p>
    </div>
  );
};

export default ImportDefaultData;
