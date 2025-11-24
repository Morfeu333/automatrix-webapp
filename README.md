# Automatrix WebApp - Frontend Implementation

## 🚀 Visão Geral

Este é o webapp completo da Automatrix, uma plataforma de automação com IA que inclui:

- **Landing Page** com VSL e sistema de qualificação por quiz
- **AI Store** para workflows de automação pré-construídos  
- **Agents Page** com interface de chat para 10 agentes especializados
- **Admin Panel** para gestão de usuários e dados

## 📁 Estrutura do Projeto

```
automatrix-new-webapp/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # Componentes base (shadcn/ui)
│   │   ├── Header.tsx      # Header principal
│   │   ├── QuizModal.tsx   # Modal do quiz de qualificação
│   │   ├── OptionsModal.tsx # Modal das 3 opções pós-quiz
│   │   ├── ShoppingCart.tsx # Carrinho de compras
│   │   ├── AgentSidebar.tsx # Sidebar dos agentes
│   │   └── ChatInterface.tsx # Interface de chat
│   ├── pages/              # Páginas principais
│   │   ├── LandingPage.tsx # Página inicial com VSL
│   │   ├── ShopPage.tsx    # Loja de workflows
│   │   ├── AgentsPage.tsx  # Interface dos agentes de IA
│   │   └── AdminPanel.tsx  # Painel administrativo
│   ├── contexts/           # Contextos React
│   │   └── UserContext.tsx # Estado global do usuário
│   ├── data/              # Dados mockados
│   │   ├── quizQuestions.ts # Perguntas do quiz
│   │   ├── workflows.ts    # Workflows disponíveis
│   │   └── agents.ts       # Agentes de IA
│   ├── types/             # Tipos TypeScript
│   │   └── index.ts       # Definições de tipos
│   └── lib/               # Utilitários
│       └── utils.ts       # Funções auxiliares
├── docs/                  # Documentação completa
│   ├── landing-page-pt.md # Documentação da Landing Page
│   ├── shop-page-pt.md    # Documentação da Shop Page
│   ├── agents-page-pt.md  # Documentação da Agents Page
│   ├── user-flow-pt.md    # Fluxo completo do usuário
│   ├── backend-instructions-pt.md # Instruções para backend
│   └── video-scripts/     # Scripts dos vídeos
│       ├── vsl-main-script.md
│       ├── vsl-options-script.md
│       └── quiz-intro-script.md
└── package.json           # Dependências do projeto
```

## 🎯 Funcionalidades Implementadas

### Landing Page
- ✅ VSL principal com placeholder (8:45 min)
- ✅ Quiz de qualificação com 6 perguntas estratégicas
- ✅ Modal de opções pós-quiz com segundo VSL (4:30 min)
- ✅ Sistema de registro e autenticação
- ✅ Três caminhos: Meeting, Shop, Community

### Shop Page (AI Store)
- ✅ 12 workflows pré-construídos com preços de $1,000
- ✅ Sistema de filtros por categoria
- ✅ Carrinho de compras funcional
- ✅ Checkout integrado com nas.io
- ✅ Placeholders para vídeos de demonstração

### Agents Page
- ✅ 10 agentes especializados com cores únicas
- ✅ Interface de chat estilo ChatGPT
- ✅ Sidebar retrátil com histórico
- ✅ Sistema de upload de arquivos
- ✅ Controle de acesso (apenas usuários registrados)

### Admin Panel
- ✅ Dashboard com métricas principais
- ✅ Gestão de usuários e respostas do quiz
- ✅ Visualização de arquivos enviados
- ✅ Monitoramento de sessões de chat
- ✅ Interface para CRUD de workflows

## 🛠 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Context

## 🚀 Como Executar

1. **Instalar dependências:**
```bash
cd automatrix-new-webapp
npm install
```

2. **Executar em desenvolvimento:**
```bash
npm run dev
```

3. **Acessar a aplicação:**
```
http://localhost:3000
```

## 🎨 Design System

### Cores Principais
- **Automatrix Blue**: #3B82F6
- **Automatrix Purple**: #8B5CF6  
- **Dark Background**: #0F172A
- **Gray Background**: #1E293B

### Agentes e Cores
- **N8N Expert**: Rosa/Rose gradient
- **Claude Assistant**: Laranja/Amber gradient
- **Hostinger Helper**: Roxo/Violet gradient
- **DigitalOcean Pro**: Azul/Cyan gradient
- **Supabase Specialist**: Verde/Emerald gradient
- **Lovable Developer**: Azul para Laranja gradient
- **Augment Agent**: Cinza/Slate gradient
- **Gemini AI**: Azul para Vermelho gradient
- **AI Tools Expert**: Preto/Gray gradient
- **General Agent**: Automatrix gradient

## 📱 Responsividade

- **Mobile**: Layout otimizado para dispositivos móveis
- **Tablet**: Interface adaptada para tablets
- **Desktop**: Experiência completa para desktop

## 🔐 Controle de Acesso

### Estados do Usuário
1. **Visitante**: Acesso apenas à Landing Page
2. **Quiz Completado**: Acesso ao modal de opções
3. **Registrado**: Acesso completo aos agentes e funcionalidades

### Fluxo de Desbloqueio
1. Usuário completa quiz → Opções desbloqueadas
2. Usuário escolhe opção → Registro obrigatório
3. Usuário se registra → Agentes desbloqueados

## 📊 Workflows Disponíveis

1. **Instagram DM Automation** (Popular)
2. **Ad Campaign Optimizer**
3. **Social Media Scraper**
4. **Customer Onboarding**
5. **Social Media Autopost** (Popular)
6. **Agent Creating Agents N8N**
7. **Claude Code Prompts**
8. **FirstWebApp Generator**
9. **Maestra Content AI**
10. **Postiz Social Manager**
11. **Veo3 Video Content Automation**
12. **Carousel Content Generator** (Popular)

## 🤖 Agentes de IA

Cada agente tem especialidade específica e interface personalizada:

- **N8N Expert**: Automação de workflows
- **Claude Assistant**: Coding e análise
- **Hostinger Helper**: Hospedagem web
- **DigitalOcean Pro**: Infraestrutura cloud
- **Supabase Specialist**: Database e backend
- **Lovable Developer**: Desenvolvimento rápido
- **Augment Agent**: Análise de código
- **Gemini AI**: Tarefas multimodais
- **AI Tools Expert**: Ferramentas de IA
- **General Agent**: Assistente versátil

## 📈 Próximos Passos

### Backend Implementation
1. Configurar Supabase com schema completo
2. Implementar APIs para quiz, workflows e chat
3. Integrar com nas.io para pagamentos
4. Configurar Google Drive para arquivos
5. Implementar serviços de IA para agentes

### Integrações
1. **nas.io**: Pagamentos e comunidade
2. **Google Calendar**: Agendamento de reuniões
3. **Email Service**: Automações de email
4. **Analytics**: Tracking de conversões

### Otimizações
1. SEO e meta tags
2. Performance optimization
3. A/B testing setup
4. Analytics implementation

## 📝 Documentação Completa

Consulte a pasta `docs/` para documentação detalhada:

- **landing-page-pt.md**: Documentação completa da Landing Page
- **shop-page-pt.md**: Documentação da loja de workflows
- **agents-page-pt.md**: Documentação da interface de agentes
- **user-flow-pt.md**: Fluxo completo do usuário
- **backend-instructions-pt.md**: Instruções detalhadas para backend
- **video-scripts/**: Scripts completos dos vídeos

## 🎬 Scripts de Vídeo

Todos os scripts estão prontos em `docs/video-scripts/`:

- **VSL Principal** (8:45 min): Introdução completa da Automatrix
- **VSL de Opções** (4:30 min): Explicação personalizada das 3 opções
- **Intro do Quiz** (1:30 min): Explicação do assessment

## ⚠️ Importante

Este é um **frontend completo** com todas as funcionalidades implementadas visualmente, mas **sem integração de backend**. Todos os dados são mockados e as interações são simuladas.

Para implementação completa, siga as instruções em `docs/backend-instructions-pt.md`.

## 🤝 Contribuição

Este projeto foi desenvolvido como uma representação visual completa do webapp Automatrix. Para implementar o backend e integrações, consulte a documentação técnica detalhada.
