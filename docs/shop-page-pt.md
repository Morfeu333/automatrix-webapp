# Documentação da Shop Page - Automatrix AI Store

## Visão Geral
A Shop Page é um marketplace de automações pré-construídas, funcionando como um e-commerce especializado em workflows de IA e automação.

## Estrutura da Página

### 1. Header da Loja
- **Título**: "AI Store"
- **Descrição**: Biblioteca de workflows profissionais prontos para implementação
- **Filtros de Categoria**: Navegação por tipo de automação
- **Carrinho**: Indicador visual com contador de itens

### 2. Sistema de Filtros
**Categorias Disponíveis:**
- All Categories (padrão)
- Social Media
- Marketing
- Data Collection
- Customer Success
- AI Automation
- Development
- Content Creation
- Video Production

**Funcionalidades:**
- Filtro ativo destacado visualmente
- Contador de workflows por categoria
- Transições suaves entre filtros

### 3. Grid de Workflows
**Layout**: Grid responsivo (1-3 colunas baseado no dispositivo)

## Workflows Disponíveis

### 1. Instagram DM Automation (Popular)
- **Categoria**: Social Media
- **Preço**: $1,000
- **Descrição**: Automação de DMs personalizadas para novos seguidores
- **Funcionalidades**:
  - Auto-DM para novos seguidores
  - Templates de mensagens personalizadas
  - Tracking de engajamento
  - Automação de respostas
- **Requisitos**:
  - Instagram Business Account
  - Meta Business API access
  - N8N workspace

### 2. Ad Campaign Optimizer
- **Categoria**: Marketing
- **Preço**: $1,000
- **Descrição**: Otimização automática de campanhas publicitárias
- **Funcionalidades**:
  - Otimização multi-plataforma
  - Realocação de orçamento
  - Monitoramento de performance
  - Lances automatizados

### 3. Social Media Scraper
- **Categoria**: Data Collection
- **Preço**: $1,000
- **Descrição**: Extração de dados para pesquisa de mercado e geração de leads
- **Funcionalidades**:
  - Scraping multi-plataforma
  - Limpeza e formatação de dados
  - Export para planilhas
  - Coleta agendada

### 4. Customer Onboarding
- **Categoria**: Customer Success
- **Preço**: $1,000
- **Descrição**: Automação do processo de onboarding de clientes
- **Funcionalidades**:
  - Sequências de email de boas-vindas
  - Automação de tarefas
  - Tracking de progresso
  - Jornadas personalizadas

### 5. Social Media Autopost (Popular)
- **Categoria**: Social Media
- **Preço**: $1,000
- **Descrição**: Agendamento e postagem automática em redes sociais
- **Funcionalidades**:
  - Postagem multi-plataforma
  - Agendamento de conteúdo
  - Otimização de imagens
  - Automação de hashtags

### 6. Agent Creating Agents N8N
- **Categoria**: AI Automation
- **Preço**: $1,000
- **Descrição**: Meta-automação que cria e gerencia outros agentes de IA
- **Funcionalidades**:
  - Criação dinâmica de agentes
  - Gerenciamento de templates
  - Orquestração de agentes
  - Monitoramento de performance

### 7. Claude Code Prompts
- **Categoria**: AI Development
- **Preço**: $1,000
- **Descrição**: Sistema de prompt engineering para geração de código
- **Funcionalidades**:
  - Templates de prompt otimizados
  - Validação de qualidade de código
  - Suporte multi-linguagem
  - Integração com controle de versão

### 8. FirstWebApp Generator
- **Categoria**: Development
- **Preço**: $1,000
- **Descrição**: Geração automática de aplicações web completas
- **Funcionalidades**:
  - Geração full-stack
  - Setup de banco de dados
  - Criação de APIs
  - Scaffolding de frontend

### 9. Maestra Content AI
- **Categoria**: Content Creation
- **Preço**: $1,000
- **Descrição**: Sistema de criação e gerenciamento de conteúdo com IA
- **Funcionalidades**:
  - Conteúdo multi-formato
  - Consistência de voz da marca
  - Otimização SEO
  - Calendário de conteúdo

### 10. Postiz Social Manager
- **Categoria**: Social Media
- **Preço**: $1,000
- **Descrição**: Gerenciamento completo de redes sociais com analytics
- **Funcionalidades**:
  - Dashboard unificado
  - Automação de engajamento
  - Relatórios de analytics
  - Curadoria de conteúdo

### 11. Veo3 Video Content Automation
- **Categoria**: Video Production
- **Preço**: $1,000
- **Descrição**: Automação de criação de conteúdo em vídeo
- **Funcionalidades**:
  - Geração de vídeo com IA
  - Automação de roteiros
  - Customização de marca
  - Export multi-formato

### 12. Carousel Content Generator (Popular)
- **Categoria**: Content Creation
- **Preço**: $1,000
- **Descrição**: Criação automática de posts em carrossel
- **Funcionalidades**:
  - Design baseado em templates
  - Adaptação de conteúdo
  - Dimensionamento multi-plataforma
  - Publicação automatizada

## Card de Workflow

### Elementos Visuais
- **Vídeo Demo**: Placeholder com play button e duração
- **Badge Popular**: Para workflows em destaque
- **Categoria**: Badge com cor da categoria
- **Preço**: Destaque visual com gradiente Automatrix

### Informações Detalhadas
- **Título e Descrição**: Nome e resumo do workflow
- **Key Features**: Lista das 3 principais funcionalidades
- **Requirements**: Badges com pré-requisitos (máximo 2 visíveis + contador)
- **Especificações**: Lista técnica detalhada

### Ações Disponíveis
- **Add to Cart**: Botão principal (muda para "In Cart" quando adicionado)
- **Preview**: Botão para visualizar demo do workflow
- **Quick View**: Modal com informações detalhadas

## Shopping Cart

### Funcionalidades do Carrinho
- **Sidebar Deslizante**: Abre da direita para esquerda
- **Gestão de Quantidade**: Botões +/- para cada item
- **Remoção de Itens**: Botão X individual
- **Clear Cart**: Limpar carrinho completo
- **Cálculo Total**: Soma automática dos valores

### Processo de Checkout
1. **Review Cart**: Verificação dos itens selecionados
2. **Payment**: Redirecionamento para nas.io
3. **Implementation Scheduling**: Agendamento de implementação
4. **Confirmation**: Confirmação da compra

### Integrações de Pagamento
- **nas.io**: Processamento principal de pagamentos
- **Calendar Integration**: Agendamento de implementação
- **Email Confirmation**: Confirmação automática por email

## Estados da Interface

### Estados do Carrinho
- **Vazio**: Mensagem motivacional para continuar comprando
- **Com Itens**: Lista de workflows com controles
- **Loading**: Durante processamento de checkout

### Estados dos Workflows
- **Disponível**: Botão "Add to Cart" ativo
- **No Carrinho**: Botão "In Cart" com check
- **Loading**: Durante adição ao carrinho

## Responsividade

### Breakpoints
- **Mobile**: 1 coluna, carrinho full-screen
- **Tablet**: 2 colunas, carrinho sidebar
- **Desktop**: 3 colunas, carrinho sidebar

### Adaptações Mobile
- Filtros em dropdown
- Cards otimizados para toque
- Carrinho em modal full-screen

## Integrações Técnicas

### Context Management
- **Cart Context**: Estado global do carrinho
- **User Context**: Informações do usuário logado
- **Workflow Data**: Catálogo de workflows disponíveis

### APIs Futuras
- **Payment Processing**: Integração com nas.io
- **Calendar Booking**: Agendamento de implementação
- **Email Service**: Confirmações e notificações
- **Analytics**: Tracking de conversões e comportamento

## Métricas e Analytics

### Eventos de Conversão
1. **Workflow Viewed**: Usuário visualiza um workflow
2. **Category Filtered**: Usuário filtra por categoria
3. **Added to Cart**: Workflow adicionado ao carrinho
4. **Cart Opened**: Usuário abre o carrinho
5. **Checkout Started**: Início do processo de pagamento
6. **Purchase Completed**: Compra finalizada

### KPIs da Loja
- Taxa de conversão por workflow
- Valor médio do carrinho
- Workflows mais populares
- Taxa de abandono do carrinho
- Tempo médio na página

## Otimizações Futuras

### Funcionalidades Avançadas
- **Bundles**: Pacotes de workflows com desconto
- **Recommendations**: Sugestões baseadas no perfil do usuário
- **Reviews**: Sistema de avaliações dos workflows
- **Wishlist**: Lista de desejos para workflows

### Personalizações
- **Dynamic Pricing**: Preços baseados no perfil do usuário
- **Custom Workflows**: Opção de solicitar workflows personalizados
- **Implementation Levels**: Diferentes níveis de suporte

### A/B Tests
- Layout dos cards de workflow
- Posicionamento do carrinho
- Textos dos CTAs
- Ordem dos workflows (popularidade vs. categoria)
