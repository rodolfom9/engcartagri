import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook que mantém o Supabase ativo fazendo requisições periódicas
 * Evita que o projeto pause por inatividade (normalmente após 1 semana)
 */
export const useSupabaseHeartbeat = () => {
  useEffect(() => {
    // Intervalo em milissegundos: 1 dia (86400000ms)
    // Isso garante que sempre há atividade antes da pausa de 1 semana
    const HEARTBEAT_INTERVAL = 24 * 60 * 60 * 1000; // 1 dia

    const sendHeartbeat = async () => {
      try {
        // Fazer uma requisição simples ao Supabase para manter ativo
        // Uma simples query que não modifica nada é suficiente
        const { data, error } = await supabase
          .from('disciplinas')
          .select('id')
          .limit(1);

        if (error) {
          console.warn('Heartbeat - Erro ao conectar com Supabase:', error.message);
        } else {
          console.log('❤️ Heartbeat - Supabase ainda está ativo');
        }
      } catch (err) {
        console.warn('Heartbeat - Erro na requisição:', err);
      }
    };

    // Enviar heartbeat imediatamente na primeira vez
    sendHeartbeat();

    // Configurar intervalo para enviar heartbeat periodicamente
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Limpar intervalo ao desmontar o componente
    return () => clearInterval(interval);
  }, []);
};
