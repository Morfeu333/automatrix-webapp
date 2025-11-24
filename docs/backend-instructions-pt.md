# Instruções Detalhadas para Backend e Base de Dados - Automatrix

## Visão Geral da Arquitetura

### Stack Tecnológico Recomendado
- **Backend**: Node.js + Express.js ou Next.js API Routes
- **Database**: Supabase (PostgreSQL + Auth + Real-time + Storage)
- **Authentication**: Supabase Auth
- **File Storage**: Google Drive API + Supabase Storage
- **Email**: Resend ou SendGrid
- **Payments**: nas.io Webhooks
- **Calendar**: Google Calendar API
- **Analytics**: Mixpanel ou PostHog

### Arquitetura de Microserviços
```
Frontend (React/TypeScript)
    ↓
API Gateway (Next.js API Routes)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   Auth Service  │  Chat Service   │ Payment Service │
│   (Supabase)    │   (Custom)      │   (nas.io)      │
└─────────────────┴─────────────────┴─────────────────┘
    ↓                    ↓                    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   PostgreSQL    │   File Storage  │   Email Service │
│   (Supabase)    │ (Drive+Supabase)│   (Resend)      │
└─────────────────┴─────────────────┴─────────────────┘
```

## 1. Estrutura da Base de Dados (Supabase)

### Tabela: users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_registered BOOLEAN DEFAULT FALSE,
    selected_option VARCHAR(50), -- 'meeting', 'shop', 'community'
    quiz_completed_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    profile_data JSONB DEFAULT '{}', -- Dados adicionais do perfil
    
    -- Índices
    CONSTRAINT valid_selected_option CHECK (selected_option IN ('meeting', 'shop', 'community'))
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_selected_option ON users(selected_option);
```

### Tabela: quiz_questions
```sql
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'multiple-choice', 'text', 'scale'
    options JSONB, -- Array de opções para multiple-choice
    is_required BOOLEAN DEFAULT TRUE,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_question_type CHECK (question_type IN ('multiple-choice', 'text', 'scale'))
);

-- Índices
CREATE INDEX idx_quiz_questions_order ON quiz_questions(order_index);
CREATE INDEX idx_quiz_questions_active ON quiz_questions(is_active);
```

### Tabela: quiz_answers
```sql
CREATE TABLE quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar respostas duplicadas
    UNIQUE(user_id, question_id)
);

-- Índices
CREATE INDEX idx_quiz_answers_user_id ON quiz_answers(user_id);
CREATE INDEX idx_quiz_answers_question_id ON quiz_answers(question_id);
```

### Tabela: workflows
```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    video_url TEXT,
    specifications JSONB DEFAULT '[]', -- Array de especificações
    requirements JSONB DEFAULT '[]', -- Array de requisitos
    features JSONB DEFAULT '[]', -- Array de features
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadados para SEO e busca
    tags JSONB DEFAULT '[]',
    difficulty_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    estimated_setup_time INTEGER, -- em minutos
    
    CONSTRAINT valid_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))
);

-- Índices
CREATE INDEX idx_workflows_category ON workflows(category);
CREATE INDEX idx_workflows_price ON workflows(price);
CREATE INDEX idx_workflows_popular ON workflows(is_popular);
CREATE INDEX idx_workflows_active ON workflows(is_active);
CREATE INDEX idx_workflows_tags ON workflows USING GIN(tags);
```

### Tabela: agents
```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color_scheme VARCHAR(100), -- CSS class para cores
    icon_emoji VARCHAR(10),
    specialties JSONB DEFAULT '[]', -- Array de especialidades
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Configurações do agente
    system_prompt TEXT, -- Prompt base do agente
    model_config JSONB DEFAULT '{}', -- Configurações do modelo de IA
    max_tokens INTEGER DEFAULT 4000,
    temperature DECIMAL(3,2) DEFAULT 0.7
);

-- Índices
CREATE INDEX idx_agents_active ON agents(is_active);
```

### Tabela: chat_sessions
```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadados da sessão
    message_count INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    session_rating INTEGER, -- 1-5 rating da sessão
    
    CONSTRAINT valid_rating CHECK (session_rating >= 1 AND session_rating <= 5)
);

-- Índices
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_agent_id ON chat_sessions(agent_id);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at);
```

### Tabela: chat_messages
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_user_message BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadados da mensagem
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER, -- Tempo de resposta em ms
    message_rating INTEGER, -- 1-5 rating da mensagem específica
    
    -- Para mensagens do agente
    model_used VARCHAR(100), -- Modelo de IA usado
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    
    CONSTRAINT valid_message_rating CHECK (message_rating >= 1 AND message_rating <= 5)
);

-- Índices
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_is_user ON chat_messages(is_user_message);
```

### Tabela: user_files
```sql
CREATE TABLE user_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    
    -- Informações do arquivo
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL, -- em bytes
    mime_type VARCHAR(100),
    
    -- URLs de armazenamento
    supabase_storage_path TEXT, -- Caminho no Supabase Storage
    google_drive_file_id TEXT, -- ID do arquivo no Google Drive
    google_drive_url TEXT, -- URL compartilhável do Google Drive
    
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status do processamento
    processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    processing_result JSONB DEFAULT '{}', -- Resultado do processamento
    
    CONSTRAINT valid_processing_status CHECK (
        processing_status IN ('pending', 'processing', 'completed', 'failed')
    )
);

-- Índices
CREATE INDEX idx_user_files_user_id ON user_files(user_id);
CREATE INDEX idx_user_files_session_id ON user_files(session_id);
CREATE INDEX idx_user_files_uploaded_at ON user_files(uploaded_at);
CREATE INDEX idx_user_files_status ON user_files(processing_status);
```

### Tabela: orders
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Informações do pedido
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    
    -- Integração com nas.io
    nasio_payment_id TEXT, -- ID do pagamento no nas.io
    nasio_webhook_data JSONB DEFAULT '{}', -- Dados do webhook
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    payment_method VARCHAR(100),
    customer_notes TEXT,
    
    CONSTRAINT valid_order_status CHECK (
        status IN ('pending', 'paid', 'failed', 'refunded')
    )
);

-- Índices
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_nasio_payment_id ON orders(nasio_payment_id);
```

### Tabela: order_items
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Snapshot dos dados do workflow no momento da compra
    workflow_snapshot JSONB NOT NULL, -- Dados completos do workflow
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT positive_quantity CHECK (quantity > 0),
    CONSTRAINT positive_prices CHECK (unit_price > 0 AND total_price > 0)
);

-- Índices
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_workflow_id ON order_items(workflow_id);
```

### Tabela: calendar_bookings
```sql
CREATE TABLE calendar_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    -- Informações do agendamento
    booking_type VARCHAR(50) NOT NULL, -- 'consultation', 'implementation', 'support'
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    
    -- Integração com Google Calendar
    google_calendar_event_id TEXT,
    google_meet_link TEXT,
    
    -- Status do agendamento
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Notas e preparação
    user_notes TEXT,
    admin_notes TEXT,
    preparation_checklist JSONB DEFAULT '[]',
    
    CONSTRAINT valid_booking_type CHECK (
        booking_type IN ('consultation', 'implementation', 'support')
    ),
    CONSTRAINT valid_booking_status CHECK (
        status IN ('scheduled', 'completed', 'cancelled', 'no_show')
    )
);

-- Índices
CREATE INDEX idx_calendar_bookings_user_id ON calendar_bookings(user_id);
CREATE INDEX idx_calendar_bookings_scheduled_at ON calendar_bookings(scheduled_at);
CREATE INDEX idx_calendar_bookings_status ON calendar_bookings(status);
CREATE INDEX idx_calendar_bookings_type ON calendar_bookings(booking_type);
```

## 2. Row Level Security (RLS) Policies

### Políticas para users
```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admins podem ver todos os usuários
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
```

### Políticas para chat_sessions e chat_messages
```sql
-- Habilitar RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas suas próprias sessões
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias sessões
CREATE POLICY "Users can create own chat sessions" ON chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem ver mensagens de suas próprias sessões
CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );
```

## 3. APIs e Endpoints

### Estrutura de Pastas (Next.js API Routes)
```
pages/api/
├── auth/
│   ├── register.ts
│   ├── login.ts
│   └── logout.ts
├── quiz/
│   ├── questions.ts
│   ├── submit.ts
│   └── results.ts
├── workflows/
│   ├── index.ts
│   ├── [id].ts
│   └── categories.ts
├── cart/
│   ├── add.ts
│   ├── remove.ts
│   └── checkout.ts
├── agents/
│   ├── index.ts
│   ├── [id]/
│   │   ├── chat.ts
│   │   └── sessions.ts
│   └── upload.ts
├── orders/
│   ├── index.ts
│   ├── [id].ts
│   └── webhook.ts
├── calendar/
│   ├── availability.ts
│   ├── book.ts
│   └── events.ts
└── admin/
    ├── users.ts
    ├── analytics.ts
    └── files.ts
```

### Exemplo de API: Quiz Submission
```typescript
// pages/api/quiz/submit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, answers } = req.body;

    // Validar dados
    if (!userId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Salvar respostas no banco
    const { data, error } = await supabase
      .from('quiz_answers')
      .upsert(
        answers.map(answer => ({
          user_id: userId,
          question_id: answer.questionId,
          answer_text: answer.answer
        }))
      );

    if (error) throw error;

    // Atualizar status do usuário
    await supabase
      .from('users')
      .update({ quiz_completed_at: new Date().toISOString() })
      .eq('id', userId);

    // Analisar respostas e gerar recomendações
    const recommendations = analyzeQuizAnswers(answers);

    res.status(200).json({
      success: true,
      recommendations
    });

  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function analyzeQuizAnswers(answers: any[]) {
  // Lógica de análise das respostas
  // Retorna recomendações personalizadas
  return {
    recommendedOption: 'shop',
    confidence: 0.85,
    reasoning: 'Based on your responses...'
  };
}
```

## 4. Integrações Externas

### Google Drive API
```typescript
// lib/google-drive.ts
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

export async function uploadToGoogleDrive(
  file: Buffer,
  filename: string,
  mimeType: string
) {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      },
      media: {
        mimeType,
        body: file
      }
    });

    // Tornar arquivo público
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    return {
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink
    };

  } catch (error) {
    console.error('Google Drive upload error:', error);
    throw error;
  }
}
```

### nas.io Webhook Handler
```typescript
// pages/api/orders/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, data } = req.body;

    if (event === 'payment.completed') {
      // Atualizar status do pedido
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          nasio_webhook_data: data
        })
        .eq('nasio_payment_id', data.payment_id);

      if (error) throw error;

      // Enviar email de confirmação
      await sendOrderConfirmationEmail(data.customer_email, data);

      // Agendar implementação se necessário
      if (data.includes_implementation) {
        await scheduleImplementation(data.customer_id);
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
```

## 5. Serviços de IA

### Chat Service
```typescript
// lib/ai-service.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateAgentResponse(
  agentId: string,
  message: string,
  context: any[]
) {
  try {
    // Buscar configuração do agente
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (!agent) throw new Error('Agent not found');

    // Construir prompt com contexto
    const systemPrompt = buildSystemPrompt(agent, context);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...context.map(msg => ({
          role: msg.is_user_message ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ],
      max_tokens: agent.max_tokens,
      temperature: agent.temperature
    });

    return {
      content: response.choices[0].message.content,
      tokens_used: response.usage?.total_tokens || 0,
      model_used: 'gpt-4'
    };

  } catch (error) {
    console.error('AI service error:', error);
    throw error;
  }
}

function buildSystemPrompt(agent: any, context: any[]) {
  return `
    You are ${agent.name}, ${agent.description}
    
    Your specialties include: ${agent.specialties.join(', ')}
    
    ${agent.system_prompt}
    
    Always respond in a helpful, professional manner while staying true to your expertise area.
  `;
}
```

## 6. Email Service
```typescript
// lib/email-service.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    await resend.emails.send({
      from: 'welcome@automatrix.com',
      to: userEmail,
      subject: 'Welcome to Automatrix!',
      html: `
        <h1>Welcome ${userName}!</h1>
        <p>Your AI agents are now unlocked and ready to help you automate your business.</p>
        <a href="${process.env.FRONTEND_URL}/agents">Start Chatting with AI Agents</a>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
  }
}

export async function sendOrderConfirmationEmail(
  userEmail: string, 
  orderData: any
) {
  // Implementar email de confirmação de pedido
}
```

## 7. Deployment e DevOps

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

OPENAI_API_KEY=your_openai_key
GOOGLE_SERVICE_ACCOUNT_KEY=path_to_service_account.json
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id

RESEND_API_KEY=your_resend_key
NASIO_WEBHOOK_SECRET=your_nasio_webhook_secret

FRONTEND_URL=https://your-domain.com
```

### Vercel Deployment
```json
// vercel.json
{
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

## 8. Monitoramento e Analytics

### Métricas Importantes
- Taxa de conversão por etapa do funil
- Tempo de resposta das APIs
- Uso de tokens de IA por agente
- Satisfação do usuário (ratings)
- Performance de upload de arquivos

### Logging Strategy
```typescript
// lib/logger.ts
export function logUserAction(
  userId: string,
  action: string,
  metadata: any = {}
) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    userId,
    action,
    metadata
  }));
  
  // Enviar para serviço de analytics
  // analytics.track(userId, action, metadata);
}
```

Esta documentação fornece uma base sólida para implementar o backend completo do webapp Automatrix. Cada seção pode ser expandida conforme necessário durante o desenvolvimento.
