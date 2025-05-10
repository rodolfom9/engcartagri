// Script para verificar usuários cadastrados no Supabase

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = "https://vcqmpvfgepruwgxzfjzu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcW1wdmZnZXBydXdneHpmanp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NTc5MDgsImV4cCI6MjA2MjMzMzkwOH0.avZUr0--1hm-jrvApfy5LDsZhUgjGIpYaiSEGhuir-g";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkAuthStatus() {
  try {
    // Verificar status de autenticação atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Erro ao verificar sessão:', sessionError);
      return;
    }
    
    if (session && session.user) {
      console.log('Usuário autenticado:');
      console.log('ID:', session.user.id);
      console.log('Email:', session.user.email);
      console.log('Criado em:', new Date(session.user.created_at).toLocaleString());
    } else {
      console.log('Nenhum usuário autenticado no momento');
      
      // Listar as disciplinas para ver quais IDs de usuários estão associados
      const { data: disciplinas, error: disciplinasError } = await supabase
        .from('disciplinas')
        .select('user_id')
        .limit(20);
      
      if (disciplinasError) {
        console.error('Erro ao buscar disciplinas:', disciplinasError);
      } else if (disciplinas && disciplinas.length > 0) {
        // Coletar IDs de usuários únicos
        const userIds = [...new Set(disciplinas.map(d => d.user_id).filter(id => id))];
        console.log('IDs de usuários encontrados nas disciplinas:', userIds);
      } else {
        console.log('Nenhuma disciplina encontrada');
      }
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
  }
}

checkAuthStatus(); 