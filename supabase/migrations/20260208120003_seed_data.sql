-- ============================================================
-- AUTOMATRIX PLATFORM v2 - Seed Data
-- Migration: 20260208120003_seed_data.sql
-- Description: Initial blog posts and sample workflows
-- ============================================================

-- ============================================================
-- BLOG POSTS (matching frontend mock data)
-- ============================================================

INSERT INTO blog_posts (title, slug, excerpt, content, author, category, tags, status, read_time, published_at) VALUES
(
  'Como Comecar com N8N: Guia Completo para Iniciantes',
  'como-comecar-n8n-automacao',
  'Aprenda a instalar, configurar e criar suas primeiras automacoes com N8N. Este guia cobre desde a instalacao ate a criacao de workflows complexos.',
  '## Introducao ao N8N

N8N e uma ferramenta de automacao de workflows open-source que permite conectar diferentes servicos e APIs sem precisar escrever codigo complexo.

### Por que usar N8N?

- **Open Source**: Voce pode hospedar no seu proprio servidor
- **Visual**: Interface drag-and-drop intuitiva
- **Extensivel**: Mais de 400 integracoes nativas
- **Self-hosted**: Seus dados ficam com voce

### Instalacao

A forma mais rapida de comecar e usando Docker:

```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

Acesse `http://localhost:5678` e voce vera a interface do N8N.',
  'Automatrix Team',
  'Tutorial',
  ARRAY['n8n', 'automacao', 'tutorial', 'iniciante'],
  'published',
  '10 min',
  NOW() - INTERVAL '3 days'
),
(
  'Top 10 Automacoes que Todo Negocio Precisa em 2026',
  'top-10-automacoes-negocio',
  'Descubra as automacoes mais impactantes que podem economizar horas do seu dia e transformar a produtividade da sua equipe.',
  '## As Automacoes Essenciais

Em 2026, nao ter automacoes e como nao ter email nos anos 2000. Aqui estao as 10 automacoes que todo negocio precisa.

### 1. Onboarding Automatizado de Clientes
### 2. Notificacoes Inteligentes
### 3. Sincronizacao de CRM
### 4. Email Marketing Automatizado
### 5. Relatorios Automaticos
### 6. Backup de Dados
### 7. Monitoramento de Redes Sociais
### 8. Gestao de Leads
### 9. Agendamento Automatico
### 10. Chatbot de Atendimento',
  'Lucas',
  'Negocio',
  ARRAY['negocio', 'produtividade', 'automacao'],
  'published',
  '8 min',
  NOW() - INTERVAL '5 days'
),
(
  'Integrando Supabase com N8N: Banco de Dados Automatizado',
  'integracao-supabase-n8n',
  'Como conectar Supabase ao N8N para criar automacoes poderosas com banco de dados em tempo real.',
  '## Supabase + N8N = Poder

Supabase e o backend-as-a-service open-source que oferece banco de dados PostgreSQL, autenticacao, storage e realtime. Combinado com N8N, voce pode criar automacoes poderosas.

### Configurando a Integracao

1. Crie um projeto no Supabase
2. Gere uma API key
3. No N8N, adicione o node Supabase
4. Configure a URL e a key

### Casos de Uso

- Webhook que salva dados no Supabase
- Trigger de banco de dados que dispara workflow
- Sincronizacao de dados entre sistemas',
  'Automatrix Team',
  'Tutorial',
  ARRAY['supabase', 'n8n', 'integracao', 'banco-de-dados'],
  'published',
  '12 min',
  NOW() - INTERVAL '7 days'
),
(
  'Construindo um Marketplace com Stripe Connect',
  'stripe-connect-marketplace',
  'Guia tecnico de como implementar pagamentos split com Stripe Connect para seu marketplace.',
  '## Stripe Connect para Marketplaces

Stripe Connect permite que voce processe pagamentos em nome de terceiros e distribua os valores automaticamente.

### Express vs Standard vs Custom

Para a maioria dos marketplaces, **Express** e a melhor opcao:
- Onboarding rapido para vendedores
- Stripe cuida da compliance
- Dashboard simplificado

### Implementacao

1. Crie uma conta Stripe Connect
2. Configure o Express onboarding
3. Implemente o payment intent com transfer
4. Configure webhooks para reconciliacao',
  'Lucas',
  'Tecnico',
  ARRAY['stripe', 'pagamentos', 'marketplace', 'fintech'],
  'published',
  '15 min',
  NOW() - INTERVAL '11 days'
),
(
  'Agentes IA: Como Usar para Aumentar sua Produtividade',
  'ai-agents-produtividade',
  'Explore como agentes de IA como Claude, GPT e outros podem transformar sua produtividade no dia a dia.',
  '## O Futuro do Trabalho com IA

Agentes de IA estao revolucionando como trabalhamos. Diferente de chatbots simples, agentes podem executar tarefas complexas de forma autonoma.

### Tipos de Agentes

1. **Assistentes de Codigo** - Claude Code, GitHub Copilot
2. **Agentes de Pesquisa** - Perplexity, Claude
3. **Agentes de Automacao** - N8N AI nodes
4. **Agentes de Dados** - Analise automatica

### Como Comecar

O segredo e comecar com tarefas repetitivas e ir expandindo gradualmente.',
  'Automatrix Team',
  'IA',
  ARRAY['ia', 'agentes', 'produtividade', 'claude'],
  'published',
  '7 min',
  NOW() - INTERVAL '14 days'
),
(
  'Guia do Vibecoder: Como se Tornar um Freelancer de Automacao',
  'vibecoder-guia-freelancer',
  'Tudo que voce precisa saber para comecar a vender servicos de automacao e IA como Vibecoder na plataforma.',
  '## Seja um Vibecoder

O mercado de automacao e IA esta em explosao. Como Vibecoder na Automatrix, voce pode:

### Vantagens

- Acesso a projetos qualificados
- Pagamentos seguros via Stripe Connect
- Matching automatico por skills
- Suporte da comunidade

### Como Comecar

1. Crie sua conta como Vibecoder
2. Complete seu perfil com skills e portfolio
3. Aguarde aprovacao da equipe
4. Comece a receber missoes no Mission Board

### Skills em Alta

- N8N workflow development
- Supabase backend
- AI agent integration
- Claude/GPT API integration',
  'Lucas',
  'Carreira',
  ARRAY['vibecoder', 'freelancer', 'carreira', 'automacao'],
  'published',
  '9 min',
  NOW() - INTERVAL '17 days'
);

-- ============================================================
-- SAMPLE WORKFLOWS (matching frontend mock data)
-- ============================================================

INSERT INTO workflows (filename, name, description, category, trigger_type, complexity, node_count, integrations, tags, active, download_count) VALUES
('telegram-notification-bot.json', 'Telegram Notification Bot', 'Bot de notificacoes via Telegram com triggers personalizaveis e formatacao rica de mensagens.', 'Messaging', 'webhook', 'beginner', 5, ARRAY['Telegram', 'HTTP'], ARRAY['telegram', 'bot', 'notificacao'], true, 342),
('gmail-auto-responder.json', 'Gmail Auto-Responder', 'Resposta automatica para emails no Gmail com filtros inteligentes e templates personalizaveis.', 'Email', 'email', 'beginner', 7, ARRAY['Gmail', 'Google Sheets'], ARRAY['gmail', 'email', 'auto-resposta'], true, 256),
('slack-channel-monitor.json', 'Slack Channel Monitor', 'Monitore canais do Slack e receba alertas para palavras-chave especificas.', 'Messaging', 'webhook', 'intermediate', 9, ARRAY['Slack', 'Webhook'], ARRAY['slack', 'monitoramento', 'alertas'], true, 189),
('google-sheets-data-sync.json', 'Google Sheets Data Sync', 'Sincronize dados entre Google Sheets e outros servicos automaticamente.', 'Cloud Storage', 'schedule', 'beginner', 6, ARRAY['Google Sheets', 'Airtable'], ARRAY['google-sheets', 'sync', 'dados'], true, 421),
('instagram-post-scheduler.json', 'Instagram Post Scheduler', 'Agende posts no Instagram com preview e agendamento automatico.', 'Social Media', 'schedule', 'intermediate', 11, ARRAY['Instagram', 'HTTP', 'Google Drive'], ARRAY['instagram', 'social', 'agendamento'], true, 567),
('stripe-payment-handler.json', 'Stripe Payment Handler', 'Processe pagamentos via Stripe com webhooks e notificacoes automaticas.', 'E-commerce', 'webhook', 'advanced', 13, ARRAY['Stripe', 'Email', 'Slack'], ARRAY['stripe', 'pagamento', 'webhook'], true, 298),
('openai-content-generator.json', 'OpenAI Content Generator', 'Gere conteudo automaticamente usando OpenAI com templates e workflows de revisao.', 'AI/ML', 'manual', 'intermediate', 8, ARRAY['OpenAI', 'Google Docs'], ARRAY['openai', 'ia', 'conteudo'], true, 634),
('discord-moderation-bot.json', 'Discord Moderation Bot', 'Bot de moderacao para Discord com filtros automaticos e sistema de warns.', 'Messaging', 'webhook', 'advanced', 15, ARRAY['Discord', 'HTTP'], ARRAY['discord', 'moderacao', 'bot'], true, 178),
('hubspot-crm-sync.json', 'HubSpot CRM Sync', 'Sincronize contatos e deals entre HubSpot e suas ferramentas de automacao.', 'CRM', 'schedule', 'intermediate', 10, ARRAY['HubSpot', 'Google Sheets', 'Slack'], ARRAY['hubspot', 'crm', 'sync'], true, 223),
('shopify-order-processor.json', 'Shopify Order Processor', 'Processe pedidos do Shopify automaticamente com notificacoes e atualizacao de estoque.', 'E-commerce', 'webhook', 'advanced', 14, ARRAY['Shopify', 'Email', 'Google Sheets'], ARRAY['shopify', 'e-commerce', 'pedidos'], true, 445),
('airtable-automation.json', 'Airtable Automation', 'Automacoes para Airtable com triggers de campo e integracoes externas.', 'Database', 'webhook', 'beginner', 6, ARRAY['Airtable', 'Slack'], ARRAY['airtable', 'automacao', 'database'], true, 312),
('notion-database-sync.json', 'Notion Database Sync', 'Sincronize databases do Notion com outras ferramentas e servicos.', 'Project Management', 'schedule', 'intermediate', 9, ARRAY['Notion', 'Google Sheets'], ARRAY['notion', 'sync', 'database'], true, 287),
('linkedin-lead-scraper.json', 'LinkedIn Lead Scraper', 'Colete leads do LinkedIn automaticamente com filtros e exportacao para CRM.', 'Marketing', 'schedule', 'advanced', 12, ARRAY['LinkedIn', 'Google Sheets', 'HubSpot'], ARRAY['linkedin', 'leads', 'scraping'], true, 523),
('webhook-data-processor.json', 'Webhook Data Processor', 'Processe dados de webhooks com transformacao, validacao e roteamento.', 'Development', 'webhook', 'beginner', 5, ARRAY['Webhook', 'HTTP'], ARRAY['webhook', 'dados', 'processamento'], true, 198),
('pdf-report-generator.json', 'PDF Report Generator', 'Gere relatorios em PDF automaticamente a partir de dados de diferentes fontes.', 'Development', 'schedule', 'intermediate', 10, ARRAY['Google Sheets', 'PDF', 'Email'], ARRAY['pdf', 'relatorio', 'automacao'], true, 367),
('email-campaign-tracker.json', 'Email Campaign Tracker', 'Rastreie campanhas de email com metricas de abertura, clique e conversao.', 'Marketing', 'webhook', 'intermediate', 8, ARRAY['Mailchimp', 'Google Sheets', 'Slack'], ARRAY['email', 'campanha', 'marketing'], true, 234),
('twitter-auto-poster.json', 'Twitter/X Auto-Poster', 'Publique automaticamente no Twitter/X com agendamento e analytics.', 'Social Media', 'schedule', 'beginner', 6, ARRAY['Twitter', 'Google Sheets'], ARRAY['twitter', 'social', 'auto-post'], true, 412),
('supabase-realtime-handler.json', 'Supabase Realtime Handler', 'Processe eventos realtime do Supabase com triggers e notificacoes.', 'Database', 'webhook', 'advanced', 11, ARRAY['Supabase', 'Slack', 'Email'], ARRAY['supabase', 'realtime', 'database'], true, 156),
('github-issue-tracker.json', 'GitHub Issue Tracker', 'Rastreie issues do GitHub com notificacoes e integracao com project boards.', 'Development', 'webhook', 'beginner', 7, ARRAY['GitHub', 'Slack', 'Notion'], ARRAY['github', 'issues', 'desenvolvimento'], true, 289),
('google-calendar-sync.json', 'Google Calendar Sync', 'Sincronize Google Calendar com outras ferramentas e envie lembretes automaticos.', 'Project Management', 'schedule', 'beginner', 6, ARRAY['Google Calendar', 'Slack', 'Email'], ARRAY['google-calendar', 'agenda', 'sync'], true, 378),
('whatsapp-business-bot.json', 'WhatsApp Business Bot', 'Bot para WhatsApp Business com respostas automaticas e integracao com CRM.', 'Messaging', 'webhook', 'advanced', 16, ARRAY['WhatsApp', 'HTTP', 'HubSpot'], ARRAY['whatsapp', 'bot', 'atendimento'], true, 687),
('jira-sprint-reporter.json', 'Jira Sprint Reporter', 'Gere relatorios de sprint automaticamente a partir do Jira com metricas e graficos.', 'Project Management', 'schedule', 'intermediate', 9, ARRAY['Jira', 'Google Sheets', 'Slack'], ARRAY['jira', 'sprint', 'relatorio'], true, 145),
('mailchimp-subscriber-sync.json', 'Mailchimp Subscriber Sync', 'Sincronize subscribers do Mailchimp com seu CRM e outras ferramentas.', 'Marketing', 'webhook', 'beginner', 6, ARRAY['Mailchimp', 'Google Sheets', 'HubSpot'], ARRAY['mailchimp', 'email', 'sync'], true, 267),
('s3-file-processor.json', 'S3 File Processor', 'Processe arquivos do Amazon S3 automaticamente com transformacao e notificacao.', 'Cloud Storage', 'webhook', 'intermediate', 8, ARRAY['AWS S3', 'HTTP', 'Slack'], ARRAY['s3', 'aws', 'arquivos'], true, 198);
