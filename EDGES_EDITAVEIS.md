# Funcionalidade de Edges Editáveis

## Visão Geral

Foi implementada uma funcionalidade de edges (arestas) editáveis no fluxo do currículo, baseada no projeto de referência em `/home/kde/Downloads/reactflow`. Esta funcionalidade permite aos usuários editar visualmente as conexões entre disciplinas, adicionando pontos de controle que podem ser movidos para personalizar o caminho das conexões.

## Componentes Implementados

### 1. ClickableBaseEdge.tsx
- Componente base que torna as edges clicáveis
- Permite adicionar eventos de clique e menu de contexto
- Estende `BaseEdgeProps` do ReactFlow

### 2. PositionableEdge.tsx
- Componente principal para edges editáveis
- Permite adicionar, mover e remover pontos de controle
- Suporta diferentes tipos de caminhos: straight, smoothstep
- Renderiza handlers visuais para manipulação dos pontos

### 3. PositionableEdge.css
- Estilos específicos para os elementos editáveis
- Define aparência dos handlers de controle
- Inclui efeitos hover e estados ativos

## Funcionalidades

### Interações Disponíveis

1. **Adicionar Pontos de Controle**
   - Clique em qualquer ponto de uma edge editável
   - Um novo ponto de controle será adicionado na posição clicada

2. **Mover Pontos de Controle**
   - Clique e arraste qualquer ponto de controle existente
   - O caminho da edge será atualizado em tempo real

3. **Remover Pontos de Controle**
   - Clique direito em um ponto de controle para removê-lo

4. **Remover Edge Completa**
   - Clique direito na linha da edge (não nos pontos) para remover toda a conexão

### Controle de Ativação

- Botão "Habilitar/Desabilitar Edges Editáveis" no canto superior direito
- Quando habilitado, apenas edges específicas (conexões especiais) se tornam editáveis
- Inclui instruções de uso quando ativado

## Edges Editáveis Configuradas

As seguintes conexões foram configuradas como editáveis:

1. **Conexões Eletromagnéticas**
   - Física: Eletromagnetismo → Eletricidade Aplicada à Geomática

2. **Conexões Topográficas**
   - Topografia: Levantamentos Planialtimétricos → Levantamentos Especiais

3. **Conexões de Cálculo**
   - Cálculo → Geodésia
   - Cálculo → Geodésia 2

4. **Conexões Geodésicas**
   - Geodésia → Geometria

## Configuração Técnica

### Tipos de Edge
```typescript
const edgeTypes: EdgeTypes = {
  electroLine: OrthogonalEdge,
  orthogonal: OrthogonalEdge,
  positionableedge: PositionableEdge, // Novo tipo editável
};
```

### Estrutura de Dados
```typescript
type positionHandler = {
  x: number;
  y: number;
  active?: number;
};

// Dados da edge editável
data: {
  type: "straight" | "smoothstep",
  positionHandlers: positionHandler[],
  // ... outros dados
}
```

### Pontos de Controle Iniciais

Algumas edges são configuradas com pontos de controle iniciais para demonstração:

```typescript
const getInitialHandlers = (fromId: string, toId: string) => {
  if (fromId === 'DPAA-2.0024' && toId === 'DPAA-3.0077') {
    return [{ x: 350, y: 100 }];
  }
  // ... outras configurações
};
```

## Como Usar

1. **Ativar Funcionalidade**
   - Clique no botão "Habilitar Edges Editáveis" no canto superior direito

2. **Editar Conexões**
   - Clique em qualquer ponto de uma edge especial (destacada) para adicionar um ponto de controle
   - Arraste os pontos circulares para reposicionar
   - Clique direito nos pontos para remover

3. **Tipos de Caminho**
   - As edges editáveis suportam dois tipos de caminho:
   - "straight": Linha reta entre os pontos
   - "smoothstep": Curva suave com aceleração/desaceleração

## Benefícios

1. **Visualização Personalizada**
   - Permite ajustar visualmente o layout das conexões
   - Evita sobreposições e melhora a legibilidade

2. **Interatividade**
   - Interface intuitiva para edição
   - Feedback visual imediato

3. **Flexibilidade**
   - Suporte a múltiplos tipos de caminho
   - Configuração granular por edge

## Extensões Futuras

1. **Persistência**
   - Salvar configurações de pontos de controle
   - Carregar layouts personalizados

2. **Mais Tipos de Edge**
   - Implementar tipos de caminho adicionais
   - Suporte a curvas personalizadas

3. **Interface de Configuração**
   - Painel para configurar quais edges são editáveis
   - Opções de estilo e comportamento

4. **Exportação**
   - Exportar layouts como imagem
   - Compartilhar configurações personalizadas 