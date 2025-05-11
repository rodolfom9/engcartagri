# Curricular Flow Builder

Um sistema web para gerenciamento e visualização do fluxo curricular do curso de Engenharia Cartográfica e de Agrimensura do IFG.

## Estrutura do Projeto

### Diretório `/src`

#### Componentes (`/src/components`)
- `CourseForm.tsx`: Formulário para adicionar/editar disciplinas, incluindo campos para nome, período, créditos, professor e horários
- `CourseList.tsx`: Lista todas as disciplinas do curso, agrupadas por período, com opção de marcar como concluídas
- `CurriculumFlow.tsx`: Componente principal que gerencia o fluxo curricular, incluindo visualização, edição e pré-requisitos
- `ManageCurriculum.tsx`: Interface administrativa para gerenciar o currículo
- `PrerequisiteForm.tsx`: Formulário para adicionar/remover pré-requisitos entre disciplinas
- `ScheduleGrid.tsx`: Grade de horários das disciplinas, mostrando aulas por dia e horário

#### Contextos (`/src/contexts`)
- `AuthContext.tsx`: Gerencia o estado de autenticação do usuário usando Supabase

#### Dados (`/src/data`)
- `courses.ts`: Dados padrão das disciplinas do curso, incluindo informações como nome, período, créditos, etc.

#### Hooks (`/src/hooks`)
- `use-toast.ts`: Hook personalizado para exibir notificações toast na interface

#### Integrações (`/src/integrations`)
- `supabase/client.ts`: Configuração e instância do cliente Supabase

#### Biblioteca (`/src/lib`)
- `curriculumStorage.ts`: Funções para manipulação dos dados do currículo no localStorage
- `supabaseService.ts`: Serviços para interação com o Supabase, incluindo CRUD de disciplinas, pré-requisitos e horários

#### Tipos (`/src/types`)
- `curriculum.ts`: Definições de tipos TypeScript para disciplinas, pré-requisitos e dados do currículo

### Banco de Dados (Supabase)

#### Tabelas
- `disciplinas`: Armazena informações das disciplinas
  - Colunas: id, name, period, row, hours, type, credits, professor, user_id, created_at, updated_at

- `horarios`: Armazena os horários das disciplinas
  - Colunas: id, disciplina_id, day1, time1, day2, time2, day3, time3, created_at

- `prerequisitos`: Armazena os pré-requisitos entre disciplinas
  - Colunas: id, from_disciplina, to_disciplina, created_at

- `disciplinas_concluidas`: Registra as disciplinas concluídas por cada usuário
  - Colunas: id, disciplina_id, user_id, created_at

## Funcionalidades

1. **Gestão de Disciplinas**
   - Adicionar/Editar/Remover disciplinas
   - Definir nome, período, créditos, professor
   - Gerenciar horários de aula

2. **Fluxo Curricular**
   - Visualização do fluxo curricular por período
   - Gerenciamento de pré-requisitos
   - Marcação de disciplinas concluídas

3. **Grade de Horários**
   - Visualização dos horários de aula
   - Detecção de conflitos de horário
   - Organização por dia e horário

4. **Autenticação**
   - Login/Registro de usuários via Supabase
   - Persistência de dados por usuário
   - Controle de acesso baseado em autenticação

## Tecnologias Utilizadas

- React
- TypeScript
- Supabase (Banco de dados e Autenticação)
- Tailwind CSS (Estilização)
- Shadcn/ui (Componentes de UI)

## Políticas de Segurança (RLS)

### Tabela `disciplinas`
- Visualização: Permitida para todos
- Inserção: Permitida para usuários autenticados
- Atualização: Permitida para proprietários ou disciplinas sem proprietário
- Exclusão: Permitida para proprietários

### Tabela `horarios`
- Operações vinculadas às permissões da tabela `disciplinas`

### Tabela `prerequisitos`
- Visualização: Permitida para todos
- Modificação: Permitida para usuários autenticados

### Tabela `disciplinas_concluidas`
- Operações restritas ao próprio usuário

## Como Executar

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```
4. Execute o projeto:
   ```bash
   npm run dev
   ```

## Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das suas alterações
4. Envie um pull request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
bbb