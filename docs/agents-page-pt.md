# Documentação da Agents Page - Interface de Chat com IA

## Visão Geral
A Agents Page é uma interface de chat estilo ChatGPT que permite aos usuários interagir com múltiplos agentes de IA especializados, cada um com expertise específica.

## Controle de Acesso
**Requisitos para Acesso:**
- Usuário deve estar registrado (`user.isRegistered = true`)
- Usuário deve ter selecionado uma opção (`user.selectedOption` não pode ser null)

**Estado Bloqueado:**
- Exibe card com ícone de cadeado
- Mensagem explicativa sobre requisitos
- Botão para retornar à homepage

## Layout da Interface

### 1. Sidebar de Agentes (Retrátil)
**Largura**: 320px (aberta) / 64px (fechada)
**Posição**: Esquerda, não sobrepõe o header
**Funcionalidades**:
- Toggle de abertura/fechamento
- Lista de agentes disponíveis
- Histórico de conversas recentes
- Responsivo (overlay em mobile)

### 2. Área Principal de Chat
**Layout**: Flexível, ocupa espaço restante
**Componentes**:
- Header com informações do agente ativo
- Área de mensagens com scroll
- Input de mensagem com anexos
- Indicadores de digitação

## Agentes Disponíveis

### 1. N8N Expert
- **Cor**: Rosa/Rose gradient (`agent-n8n`)
- **Ícone**: 🔗
- **Especialidade**: Automação de workflows N8N, configuração de nodes, integrações avançadas
- **Casos de Uso**: Setup de workflows, troubleshooting, otimização de automações

### 2. Claude Assistant
- **Cor**: Laranja/Amber gradient (`agent-claude`)
- **Ícone**: 🧠
- **Especialidade**: Assistente de IA avançado para coding, análise e resolução de problemas complexos
- **Casos de Uso**: Programação, análise de dados, brainstorming, revisão de código

### 3. Hostinger Helper
- **Cor**: Roxo/Violet gradient (`agent-hostinger`)
- **Ícone**: 🌐
- **Especialidade**: Hospedagem web, gerenciamento de domínios, deploy de websites
- **Casos de Uso**: Configuração de hosting, problemas de DNS, otimização de performance

### 4. DigitalOcean Pro
- **Cor**: Azul/Cyan gradient (`agent-digitalocean`)
- **Ícone**: ☁️
- **Especialidade**: Infraestrutura cloud, droplets, databases e serviços DigitalOcean
- **Casos de Uso**: Deploy de aplicações, configuração de servidores, scaling

### 5. Supabase Specialist
- **Cor**: Verde/Emerald gradient (`agent-supabase`)
- **Ícone**: 🗄️
- **Especialidade**: Database e backend com Supabase, auth, real-time features
- **Casos de Uso**: Setup de banco de dados, autenticação, APIs, real-time subscriptions

### 6. Lovable Developer
- **Cor**: Azul para Laranja gradient (`agent-lovable`)
- **Ícone**: 💝
- **Especialidade**: Desenvolvimento assistido por IA, prototipagem rápida, criação de apps
- **Casos de Uso**: Desenvolvimento rápido, MVPs, prototipagem

### 7. Augment Agent
- **Cor**: Cinza/Slate gradient (`agent-augment`)
- **Ícone**: ⚡
- **Especialidade**: Análise e melhoria de código usando ferramentas Augment
- **Casos de Uso**: Code review, refactoring, otimização de performance

### 8. Gemini AI
- **Cor**: Azul para Vermelho gradient (`agent-gemini`)
- **Ícone**: 💎
- **Especialidade**: IA avançada do Google para tarefas multimodais, análise e soluções criativas
- **Casos de Uso**: Análise de imagens, tarefas criativas, pesquisa avançada

### 9. AI Tools Expert
- **Cor**: Preto/Gray gradient (`agent-aitools`)
- **Ícone**: 🛠️
- **Especialidade**: Conhecimento abrangente de ferramentas de IA, APIs e estratégias de integração
- **Casos de Uso**: Seleção de ferramentas, integração de APIs, arquitetura de IA

### 10. General Agent
- **Cor**: Automatrix gradient (azul para roxo) (`agent-general`)
- **Ícone**: 🤖
- **Especialidade**: Assistente versátil para tarefas gerais, perguntas e automação de negócios
- **Casos de Uso**: Consultas gerais, planejamento, suporte geral

## Interface de Chat

### Header do Chat
**Elementos**:
- Botão toggle da sidebar (mobile)
- Avatar do agente com cor específica
- Nome e descrição do agente
- Botão "New Chat"

### Área de Mensagens
**Layout**:
- Mensagens do usuário: Alinhadas à direita, fundo azul
- Mensagens do agente: Alinhadas à esquerda, avatar colorido
- Timestamp em cada mensagem
- Ações nas mensagens do agente: Copy, Like, Dislike, More

**Funcionalidades**:
- Scroll automático para novas mensagens
- Indicador de digitação animado
- Formatação de texto (markdown básico)
- Suporte a quebras de linha

### Input de Mensagem
**Componentes**:
- Campo de texto expansível
- Botão de anexo (📎)
- Botão de envio (✈️)
- Suporte a Enter para enviar
- Shift+Enter para nova linha

**Funcionalidades**:
- Upload de arquivos (placeholder)
- Validação de mensagem não vazia
- Estado desabilitado durante resposta do agente

## Sidebar Detalhada

### Lista de Agentes
**Elementos por Agente**:
- Avatar circular com cor específica
- Nome do agente
- Descrição resumida
- Indicador de seleção ativo
- Estado de bloqueio (se aplicável)

**Estados**:
- **Ativo**: Destacado com fundo secundário
- **Disponível**: Hover effect
- **Bloqueado**: Overlay com cadeado (funcionalidade futura)

### Histórico de Conversas
**Funcionalidades**:
- Lista das conversas recentes
- Título da conversa
- Timestamp da última atividade
- Avatar do agente usado
- Botão "View All Chats"

**Dados Mockados**:
- "N8N Workflow Setup" (2 hours ago)
- "Database Schema Design" (1 day ago)
- "Cloud Deployment Help" (2 days ago)
- "Code Review Session" (3 days ago)

## Funcionalidades Técnicas

### Gerenciamento de Estado
**Context Management**:
- Estado do agente selecionado
- Histórico de mensagens por agente
- Estado da sidebar (aberta/fechada)
- Estado de digitação

**Persistência**:
- Mensagens salvas por sessão
- Preferência de sidebar
- Último agente selecionado

### Simulação de IA
**Resposta Automática**:
- Delay de 1.5 segundos para simular processamento
- Mensagem personalizada baseada no agente
- Indicador de digitação durante resposta

**Personalização por Agente**:
- Mensagem de boas-vindas específica
- Estilo de resposta característico
- Menção da especialidade

### Upload de Arquivos
**Funcionalidades Planejadas**:
- Suporte a múltiplos tipos de arquivo
- Preview de arquivos enviados
- Integração com Google Drive (admin)
- Processamento por agente específico

## Responsividade

### Mobile (< 768px)
- Sidebar em overlay full-screen
- Header compacto
- Input otimizado para toque
- Mensagens com largura máxima reduzida

### Tablet (768px - 1024px)
- Sidebar retrátil
- Layout adaptado para toque
- Área de chat otimizada

### Desktop (> 1024px)
- Layout completo
- Sidebar sempre visível
- Atalhos de teclado
- Hover effects

## Integrações Futuras

### APIs de IA
- **OpenAI GPT**: Para agentes gerais
- **Claude API**: Para Claude Assistant
- **Gemini API**: Para Gemini AI
- **Custom APIs**: Para agentes especializados

### Armazenamento
- **Supabase**: Persistência de conversas
- **Google Drive**: Armazenamento de arquivos
- **Redis**: Cache de sessões ativas

### Analytics
- **Uso por Agente**: Popularidade e eficácia
- **Tempo de Sessão**: Duração das conversas
- **Satisfação**: Likes/dislikes nas respostas
- **Upload de Arquivos**: Tipos e frequência

## Métricas e KPIs

### Engajamento
- Mensagens por sessão
- Tempo médio de conversa
- Agentes mais utilizados
- Taxa de retorno às conversas

### Qualidade
- Rating das respostas (likes/dislikes)
- Tempo de resposta percebido
- Taxa de abandono de conversa
- Feedback qualitativo

## Otimizações Futuras

### UX Enhancements
- **Sugestões de Perguntas**: Prompts iniciais por agente
- **Quick Actions**: Ações rápidas contextuais
- **Voice Input**: Entrada por voz
- **Dark/Light Mode**: Temas personalizáveis

### Funcionalidades Avançadas
- **Multi-Agent Conversations**: Conversas com múltiplos agentes
- **Agent Handoff**: Transferência entre agentes
- **Conversation Templates**: Templates de conversa
- **Export Conversations**: Exportar conversas em PDF/MD

### Personalizações
- **Custom Agents**: Agentes personalizados por usuário
- **Agent Training**: Treinamento com dados específicos
- **Workflow Integration**: Integração direta com N8N
- **API Access**: Acesso programático aos agentes
