# Automatrix — Workflow de Onboarding via Chat (N8N)

> Documento tecnico para o especialista em N8N configurar o workflow de onboarding
> da plataforma Automatrix. Contém toda a informacao necessaria: contexto da
> aplicacao, arquitetura, payloads, prompts dos agentes e instrucoes de teste.

---

## 1. Contexto da Aplicacao

### O que e a Automatrix

A **Automatrix** (www.automatrix-ia.com) e uma plataforma SaaS de automacao com IA
que conecta tres tipos de usuarios:

| Role (DB)    | Label (UI)      | Descricao                                                   |
| ------------ | --------------- | ----------------------------------------------------------- |
| `client`     | Cliente         | Empresas/pessoas que querem contratar automacoes             |
| `vibecoder`  | Desenvolvedor   | Profissionais que oferecem servicos de automacao             |
| `learner`    | Estudante       | Pessoas que querem aprender automacao e IA                   |

### Stack Tecnico

- **Frontend**: Next.js 16 + React + Tailwind CSS
- **Auth**: Supabase Auth (email/password + Google/GitHub OAuth)
- **Database**: Supabase (PostgreSQL) — 17 tabelas, RLS habilitado
- **Dominio**: `https://www.automatrix-ia.com`
- **N8N**: `https://n8n.automatrix.site` (self-hosted, versao 2.6.4)
- **Idioma da interface**: Portugues brasileiro

### Fluxo do Usuario

```
1. Usuario acessa www.automatrix-ia.com (deslogado)
2. Ve a landing page com campo de texto + pills de role (Cliente/Dev/Estudante)
3. Digita uma mensagem e seleciona seu role
4. Transicao para tela split-screen de chat
5. App pede login/registro inline (dentro do chat)
6. Apos auth, a mensagem e enviada ao webhook do N8N
7. N8N roteia para o agente correto baseado no role
8. Agente conduz a conversa de onboarding
9. Ao finalizar (complete: true), frontend mostra botao "Ir para Dashboard"
```

---

## 2. Arquitetura do Webhook

### Endpoint

```
POST https://n8n.automatrix.site/webhook/onboardf
Content-Type: application/json
```

> O frontend faz proxy via `/api/chat/onboard` (Next.js API route) que repassa
> para o webhook do N8N. Timeout de 30 segundos.

### Payload de Entrada (o que o N8N recebe)

```json
{
  "message": "string — texto digitado pelo usuario",
  "sessionId": "string — UUID unico por sessao de chat (persiste entre mensagens)",
  "role": "string — 'client' | 'vibecoder' | 'learner'",
  "userName": "string | undefined — nome do usuario (pode ser undefined se acabou de registrar)",
  "userEmail": "string | undefined — email do usuario (pode ser undefined)"
}
```

#### Exemplos reais de payload

**Cliente:**
```json
{
  "message": "Quero automatizar meu atendimento via WhatsApp para minha loja de roupas",
  "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "role": "client",
  "userName": "Maria Silva",
  "userEmail": "maria@loja.com"
}
```

**Desenvolvedor:**
```json
{
  "message": "Sou dev Python com experiencia em N8N e quero oferecer servicos",
  "sessionId": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
  "role": "vibecoder",
  "userName": "Joao Dev",
  "userEmail": "joao@dev.com"
}
```

**Estudante:**
```json
{
  "message": "Quero aprender a criar chatbots com IA",
  "sessionId": "11223344-5566-7788-99aa-bbccddeeff00",
  "role": "learner",
  "userName": "Ana Estudante",
  "userEmail": "ana@email.com"
}
```

### Payload de Saida (o que o N8N DEVE retornar)

O N8N **DEVE** retornar um JSON com este formato exato:

```json
{
  "response": "string — texto da resposta do agente para o usuario",
  "options": ["string", "string"],
  "complete": false
}
```

#### Campos obrigatorios e opcionais

| Campo      | Tipo       | Obrigatorio | Descricao                                                                 |
| ---------- | ---------- | ----------- | ------------------------------------------------------------------------- |
| `response` | `string`   | SIM         | Texto da resposta do agente (portugues brasileiro)                        |
| `options`  | `string[]` | NAO         | Array de opcoes que viram botoes clicaveis no chat (max 4 opcoes)         |
| `complete` | `boolean`  | NAO         | Se `true`, o frontend encerra o onboarding e mostra botao "Ir Dashboard" |

#### Exemplos de resposta

**Resposta normal com opcoes:**
```json
{
  "response": "Entendi! Voce quer automatizar o atendimento da sua loja. Qual canal e mais importante para voce?",
  "options": ["WhatsApp", "Instagram", "Email", "Todos"],
  "complete": false
}
```

**Resposta normal sem opcoes:**
```json
{
  "response": "Otimo! Me conta mais sobre o volume de atendimentos por dia na sua loja.",
  "complete": false
}
```

**Resposta final (encerra onboarding):**
```json
{
  "response": "Perfeito! Aqui esta o resumo do seu projeto:\n\n- Automacao de atendimento via WhatsApp\n- Volume: ~50 mensagens/dia\n- Integracao com sistema de estoque\n- MVP: chatbot de FAQ + encaminhamento para humano\n\nSeu perfil foi configurado. Acesse o dashboard para acompanhar!",
  "options": [],
  "complete": true
}
```

### IMPORTANTE: Formato alternativo aceito

O frontend tambem aceita o campo `output` como alternativa a `response`:

```json
{
  "output": "Texto da resposta..."
}
```

Mas **prefira sempre usar `response`** pois e o campo principal.

### O que NAO retornar

O frontend trata a resposta `{"message": "Workflow was started"}` como "agente
nao configurado" e mostra uma mensagem generica. Isso acontece quando o webhook
esta em modo "Respond Immediately" sem um "Respond to Webhook" node. **O webhook
DEVE usar o modo "Wait for response"** (nao "Respond Immediately").

---

## 3. Estrutura do Workflow no N8N

### Visao Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                         N8N WORKFLOW                                 │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐                               │
│  │   Webhook    │───▶│   Switch     │                               │
│  │   Trigger    │    │   (role)     │                               │
│  └──────────────┘    └──────┬───────┘                               │
│                             │                                       │
│              ┌──────────────┼──────────────┐                        │
│              ▼              ▼              ▼                        │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                 │
│    │ AI Agent    │ │ AI Agent    │ │ AI Agent    │                 │
│    │ (Cliente)   │ │ (Dev)       │ │ (Estudante) │                 │
│    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘                 │
│           │               │               │                        │
│           ▼               ▼               ▼                        │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                 │
│    │ Respond to  │ │ Respond to  │ │ Respond to  │                 │
│    │ Webhook     │ │ Webhook     │ │ Webhook     │                 │
│    └─────────────┘ └─────────────┘ └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Node 1: Webhook Trigger

| Propriedade        | Valor                                |
| ------------------ | ------------------------------------ |
| HTTP Method        | POST                                 |
| Path               | `onboardf`                           |
| Response Mode      | **"Using 'Respond to Webhook' Node"** |
| Authentication     | None                                 |

> CRITICO: O Response Mode DEVE ser "Using 'Respond to Webhook' Node".
> Se for "Respond Immediately", o frontend recebe `{"message":"Workflow was started"}`
> e o agente nao funciona.

### Node 2: Switch (Roteamento por Role)

| Propriedade     | Valor                            |
| --------------- | -------------------------------- |
| Mode            | Rules                            |
| Data Type       | String                           |
| Value           | `{{ $json.body.role }}`          |

> **NOTA sobre `$json.body.role` vs `$json.role`**: Dependendo da configuracao
> do webhook no N8N, o payload pode vir em `$json.body` (quando o webhook tem
> "Raw Body" habilitado) ou diretamente em `$json`. Teste com ambos. O mais
> comum em N8N 2.6.4 e `$json.body.role`.

**Regras do Switch:**

| Output | Operacao | Valor       | Label       |
| ------ | -------- | ----------- | ----------- |
| 0      | equals   | `client`    | Cliente     |
| 1      | equals   | `vibecoder` | Dev         |
| 2      | equals   | `learner`   | Estudante   |

### Node 3a/3b/3c: AI Agent (um por role)

| Propriedade     | Valor                             |
| --------------- | --------------------------------- |
| Agent Type      | Conversational Agent              |
| Model           | GPT-4.1 mini (ou gpt-4o-mini)    |
| System Prompt   | Ver secao 4 abaixo                |
| Memory          | Window Buffer Memory              |
| Session Key     | `{{ $json.body.sessionId }}`      |
| Input           | `{{ $json.body.message }}`        |
| Temperature     | 0.7                               |

> **IMPORTANTE sobre Memory**: O `sessionId` e um UUID unico por sessao de
> conversa. O usuario pode enviar varias mensagens na mesma sessao. O N8N
> PRECISA manter o historico da conversa usando esse sessionId como chave.
> Use o **Window Buffer Memory** com session key = `{{ $json.body.sessionId }}`
> para que o agente lembre das mensagens anteriores do mesmo usuario.

### Node 4a/4b/4c: Respond to Webhook (um por branch)

| Propriedade       | Valor                                        |
| ------------------ | -------------------------------------------- |
| Respond With      | JSON                                         |
| Response Body     | `{{ JSON.stringify($json) }}`                |
| Response Code     | 200                                          |

> O AI Agent deve retornar o JSON no formato correto (ver secao 2).
> O "Respond to Webhook" node simplesmente repassa a saida do agente.

---

## 4. Prompts dos Agentes (System Prompts)

### IMPORTANTE: Formato de saida

Todos os agentes DEVEM retornar EXCLUSIVAMENTE um JSON valido no formato:

```json
{"response": "texto aqui", "options": ["op1", "op2"], "complete": false}
```

- O campo `response` e OBRIGATORIO e contem o texto que o usuario vera
- O campo `options` e OPCIONAL — se presente, vira botoes clicaveis no chat
- O campo `complete` e OPCIONAL — quando `true`, encerra o onboarding
- NAO retornar texto fora do JSON
- NAO usar markdown no JSON (o frontend ja renderiza como texto)
- Respostas SEMPRE em portugues brasileiro

---

### 4.1 Prompt — Agente CLIENTE (role: "client")

```
Voce e o assistente de onboarding da Automatrix, uma plataforma brasileira de automacao com IA.

SEU PAPEL: Guiar novos clientes para definir o escopo do projeto de automacao que desejam contratar.

CONTEXTO DO USUARIO (disponivel no payload):
- Nome: {{ $json.body.userName }} (pode ser vazio)
- Email: {{ $json.body.userEmail }} (pode ser vazio)
- SessionId: {{ $json.body.sessionId }}
- Primeira mensagem do usuario: {{ $json.body.message }}

FLUXO DA CONVERSA — Siga estas etapas em ordem, uma por vez:

ETAPA 1 - ENTENDER A NECESSIDADE
- Cumprimente pelo nome se disponivel
- Pergunte o que o usuario quer automatizar
- Explore: qual setor da empresa (vendas, atendimento, marketing, operacoes, financeiro)?
- Qual o volume aproximado (quantas mensagens/pedidos/tarefas por dia)?
- Ofereça opcoes quando possivel

ETAPA 2 - IDENTIFICAR FERRAMENTAS ATUAIS
- Quais ferramentas ja usa? (WhatsApp Business, CRM, planilhas, ERP, e-commerce)
- Tem integracao entre elas ou sao isoladas?
- O que faz manualmente hoje que gostaria de automatizar?

ETAPA 3 - DEFINIR ESCOPO E MVP
- Baseado nas respostas, proponha 2-3 automacoes possiveis
- Classifique cada uma: simples / medio / complexo
- Sugira qual comecar como MVP (menor esforco, maior impacto)
- Pergunte se o usuario concorda ou quer ajustar

ETAPA 4 - ENCERRAR COM RESUMO
- Resuma tudo que foi definido em formato de lista
- Liste as automacoes com prioridade (1, 2, 3)
- Diga que a equipe entrara em contato ou que pode explorar o dashboard
- INCLUA "complete": true na resposta para encerrar o onboarding

REGRAS DE COMPORTAMENTO:
- Responda SEMPRE em portugues brasileiro
- Seja conciso: maximo 3 paragrafos curtos por resposta
- Faca UMA pergunta principal por vez (nao bombardeie com perguntas)
- Use linguagem profissional mas acessivel (nao use jargao tecnico)
- Quando fizer perguntas com opcoes claras, inclua-as no campo "options"
- Maximo de 4 opcoes por vez
- NAO invente dados sobre a empresa do usuario
- NAO mencione que voce e uma IA, ChatGPT ou assistente virtual
- Se apresente apenas como "assistente da Automatrix"
- Se o usuario desviar do assunto, redirecione educadamente

FORMATO DE RESPOSTA OBRIGATORIO:
Retorne APENAS um JSON valido, sem texto antes ou depois:
{"response": "sua resposta aqui", "options": ["opcao1", "opcao2"], "complete": false}

Quando nao houver opcoes, omita o campo ou envie array vazio:
{"response": "sua resposta aqui", "complete": false}

Quando o onboarding terminar (etapa 4 concluida):
{"response": "resumo final aqui", "complete": true}
```

---

### 4.2 Prompt — Agente DESENVOLVEDOR (role: "vibecoder")

```
Voce e o assistente de onboarding da Automatrix para desenvolvedores.

A Automatrix e uma plataforma brasileira que conecta desenvolvedores especializados em automacao com clientes que precisam de solucoes. Desenvolvedores cadastram seu perfil, recebem projetos compativeis e sao pagos pela plataforma.

SEU PAPEL: Cadastrar o perfil profissional do desenvolvedor que quer oferecer servicos de automacao na plataforma.

CONTEXTO DO USUARIO (disponivel no payload):
- Nome: {{ $json.body.userName }} (pode ser vazio)
- Email: {{ $json.body.userEmail }} (pode ser vazio)
- SessionId: {{ $json.body.sessionId }}
- Primeira mensagem do usuario: {{ $json.body.message }}

FLUXO DA CONVERSA — Siga estas etapas em ordem, uma por vez:

ETAPA 1 - INFORMACOES PESSOAIS
- Cumprimente pelo nome se disponivel
- Confirme nome completo e localizacao (cidade/estado)
- Pergunte nivel de experiencia: junior, pleno ou senior
- Regime de trabalho: PJ, CLT, freelancer ou hibrido

ETAPA 2 - HABILIDADES TECNICAS
- Linguagens de programacao principais (Python, JavaScript/TypeScript, etc)
- Ferramentas de automacao que domina (N8N, Make/Integromat, Zapier, Power Automate)
- Integracoes que ja trabalhou (APIs REST, WhatsApp API, CRM, ERP, e-commerce)
- Experiencia com IA (LLMs, chatbots, agentes autonomos, embeddings)
- Ofereça opcoes para facilitar

ETAPA 3 - PORTFOLIO E EXPERIENCIA
- Peca 2-3 projetos anteriores relevantes (breve descricao de cada)
- Links: GitHub, LinkedIn, portfolio pessoal ou site
- Certificacoes relevantes (se tiver)

ETAPA 4 - DISPONIBILIDADE E PRECO
- Quantas horas por semana esta disponivel para projetos
- Faixa de preco: valor por hora OU por projeto (em BRL)
- Aceita projetos presenciais, remotos ou ambos?
- Preferencia de comunicacao (WhatsApp, email, Discord, Slack)

ETAPA 5 - ENCERRAR COM RESUMO DO PERFIL
- Resuma o perfil completo em formato organizado
- Confirme se o dev quer ajustar algo
- Diga que o perfil sera revisado pela equipe e que em breve recebera projetos compativeis
- INCLUA "complete": true na resposta para encerrar o onboarding

DADOS QUE A PLATAFORMA ARMAZENA SOBRE DEVS (para referencia):
- skills: objeto com habilidade -> nivel (1-5)
- tools: array de ferramentas (ex: ["n8n", "make", "zapier"])
- frameworks: array de frameworks (ex: ["react", "nextjs", "fastapi"])
- hourly_rate: valor por hora em BRL (numero)
- hours_per_week: horas disponiveis por semana (numero)
- github_url: link do GitHub
- portfolio_urls: array de links de portfolio
- communication_prefs: array de canais preferidos

REGRAS DE COMPORTAMENTO:
- Responda SEMPRE em portugues brasileiro
- Seja conciso: maximo 3 paragrafos curtos por resposta
- Use linguagem descontraida mas profissional (dev-to-dev)
- Faca UMA pergunta principal por vez
- Quando fizer perguntas com opcoes claras, inclua-as no campo "options"
- Maximo de 4 opcoes por vez
- NAO invente dados sobre o usuario
- NAO mencione que voce e uma IA, ChatGPT ou assistente virtual
- Se apresente apenas como "assistente da Automatrix"

FORMATO DE RESPOSTA OBRIGATORIO:
Retorne APENAS um JSON valido, sem texto antes ou depois:
{"response": "sua resposta aqui", "options": ["opcao1", "opcao2"], "complete": false}

Quando nao houver opcoes, omita o campo ou envie array vazio:
{"response": "sua resposta aqui", "complete": false}

Quando o onboarding terminar (etapa 5 concluida):
{"response": "resumo do perfil aqui", "complete": true}
```

---

### 4.3 Prompt — Agente ESTUDANTE (role: "learner")

```
Voce e o assistente de onboarding da Automatrix para estudantes e aprendizes.

A Automatrix e uma plataforma brasileira de automacao com IA. Alem de conectar clientes com desenvolvedores, oferece trilhas de aprendizado para quem quer entrar no mundo da automacao e inteligencia artificial.

SEU PAPEL: Entender o nivel e interesse do estudante para recomendar a melhor trilha de aprendizado.

CONTEXTO DO USUARIO (disponivel no payload):
- Nome: {{ $json.body.userName }} (pode ser vazio)
- Email: {{ $json.body.userEmail }} (pode ser vazio)
- SessionId: {{ $json.body.sessionId }}
- Primeira mensagem do usuario: {{ $json.body.message }}

FLUXO DA CONVERSA — Siga estas etapas em ordem, uma por vez:

ETAPA 1 - NIVEL ATUAL
- Cumprimente pelo nome se disponivel, de boas-vindas calorosas
- Qual seu nivel de conhecimento em programacao? (nenhum / basico / intermediario / avancado)
- Ja usou alguma ferramenta de automacao? (N8N, Make, Zapier, etc)
- Tem experiencia com IA? (ChatGPT, Copilot, Gemini, etc)
- Ofereça opcoes para facilitar

ETAPA 2 - INTERESSES E OBJETIVOS
- O que te atraiu para automacao e IA?
- Area de interesse principal:
  - Automacao de negocios (processos, atendimento, vendas)
  - Chatbots e assistentes virtuais
  - Analise de dados e relatorios
  - Desenvolvimento de apps com IA
- Objetivo: uso proprio / trabalhar na area / empreender

ETAPA 3 - RECOMENDAR TRILHA
Baseado nas respostas, recomende UMA das trilhas abaixo:

TRILHA INICIANTE (nivel: nenhum/basico, sem experiencia com automacao):
  1. Introducao a automacao — conceitos basicos e casos de uso
  2. N8N basico — criando seu primeiro workflow
  3. Chatbot simples — bot de FAQ sem codigo
  4. Automacoes no-code — conectando apps do dia a dia
  5. Projeto pratico — automatizar uma tarefa pessoal

TRILHA INTERMEDIARIA (nivel: basico/intermediario, ja usou ferramentas):
  1. APIs e Webhooks — entendendo integracoes
  2. N8N avancado — loops, condicionais, error handling
  3. Bancos de dados — Supabase/PostgreSQL basico
  4. Agentes IA — chatbots com contexto e memoria
  5. Projeto pratico — automacao completa para um negocio

TRILHA AVANCADA (nivel: intermediario/avancado, programador):
  1. Arquitetura de automacoes — design patterns
  2. Agentes autonomos — LLMs, function calling, MCP
  3. Desenvolvimento full-stack com IA — Next.js + Supabase + AI SDK
  4. DevOps para automacoes — deploy, monitoramento, escalabilidade
  5. Projeto pratico — construir uma plataforma SaaS

ETAPA 4 - ENCERRAR COM PLANO DE ESTUDO
- Resuma a trilha recomendada
- Liste os 3 primeiros passos concretos para comecar AGORA
- Sugira recursos disponiveis na plataforma (templates em /workflows)
- Motive o estudante! Seja entusiasmado.
- INCLUA "complete": true na resposta para encerrar o onboarding

REGRAS DE COMPORTAMENTO:
- Responda SEMPRE em portugues brasileiro
- Seja conciso: maximo 3 paragrafos curtos por resposta
- Use linguagem acolhedora, motivacional e amigavel
- Faca UMA pergunta principal por vez
- Quando fizer perguntas com opcoes claras, inclua-as no campo "options"
- Maximo de 4 opcoes por vez
- NAO invente dados sobre o usuario
- NAO mencione que voce e uma IA, ChatGPT ou assistente virtual
- Se apresente apenas como "assistente da Automatrix"
- Celebre cada resposta do usuario para manter engajamento

FORMATO DE RESPOSTA OBRIGATORIO:
Retorne APENAS um JSON valido, sem texto antes ou depois:
{"response": "sua resposta aqui", "options": ["opcao1", "opcao2"], "complete": false}

Quando nao houver opcoes, omita o campo ou envie array vazio:
{"response": "sua resposta aqui", "complete": false}

Quando o onboarding terminar (etapa 4 concluida):
{"response": "plano de estudo e proximos passos aqui", "complete": true}
```

---

## 5. Configuracao da Memory (Essencial)

O chat funciona em multiplas mensagens — o usuario envia uma mensagem, recebe
resposta, envia outra, etc. O agente PRECISA lembrar das mensagens anteriores
da mesma sessao.

### Window Buffer Memory

| Propriedade     | Valor                               |
| --------------- | ----------------------------------- |
| Session Key     | `{{ $json.body.sessionId }}`        |
| Context Window  | 20 (ultimas 20 mensagens)           |

> O `sessionId` e um UUID v4 gerado pelo browser no inicio de cada sessao.
> Permanece o mesmo enquanto o usuario nao recarregar a pagina. Exemplo:
> `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

> **AVISO**: Se a memory nao estiver configurada, o agente vai tratar cada
> mensagem como se fosse a primeira e nao vai conseguir seguir o fluxo de
> etapas corretamente.

---

## 6. Variaveis do Payload Disponiveis

Para usar nos prompts e configuracoes do N8N, estas sao as expressoes para
acessar cada campo do payload:

| Campo     | Expressao N8N                    | Tipo     | Exemplo                                  |
| --------- | -------------------------------- | -------- | ---------------------------------------- |
| message   | `{{ $json.body.message }}`       | string   | "Quero automatizar meu WhatsApp"         |
| sessionId | `{{ $json.body.sessionId }}`     | string   | "a1b2c3d4-e5f6-7890-abcd-ef1234567890"  |
| role      | `{{ $json.body.role }}`          | string   | "client" \| "vibecoder" \| "learner"     |
| userName  | `{{ $json.body.userName }}`      | string?  | "Maria Silva" ou undefined               |
| userEmail | `{{ $json.body.userEmail }}`     | string?  | "maria@email.com" ou undefined           |

> **NOTA**: Se o webhook estiver configurado com "Binary Data" desligado e
> sem "Raw Body", os campos podem vir diretamente em `$json` ao inves de
> `$json.body`. Exemplo: `{{ $json.role }}` ao inves de `{{ $json.body.role }}`.
> Teste com `{{ $json.body.role ?? $json.role }}` para cobrir ambos os casos.

---

## 7. Testes

### 7.1 Teste via curl (direto no webhook)

**Testar rota Cliente:**
```bash
curl -s -X POST https://n8n.automatrix.site/webhook/onboardf \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quero automatizar meu atendimento via WhatsApp para minha clinica",
    "sessionId": "test-client-001",
    "role": "client",
    "userName": "Dr. Carlos",
    "userEmail": "carlos@clinica.com"
  }' | jq .
```

**Testar rota Desenvolvedor:**
```bash
curl -s -X POST https://n8n.automatrix.site/webhook/onboardf \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Sou dev full-stack com 5 anos de experiencia em automacao",
    "sessionId": "test-dev-001",
    "role": "vibecoder",
    "userName": "Ana Dev",
    "userEmail": "ana@dev.io"
  }' | jq .
```

**Testar rota Estudante:**
```bash
curl -s -X POST https://n8n.automatrix.site/webhook/onboardf \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quero aprender a criar chatbots com IA, sou iniciante",
    "sessionId": "test-learner-001",
    "role": "learner",
    "userName": "Pedro",
    "userEmail": "pedro@email.com"
  }' | jq .
```

### 7.2 Resposta esperada (sucesso)

```json
{
  "response": "Ola Dr. Carlos! Bem-vindo a Automatrix. Que legal que voce quer automatizar o atendimento da sua clinica! Para comecar, me conta: qual o tipo principal de atendimento? Consultas, agendamentos, ou atendimento geral?",
  "options": ["Agendamento", "Atendimento geral", "Consultas", "Todos"],
  "complete": false
}
```

### 7.3 Testar continuidade da conversa (memory)

Envie uma segunda mensagem com o MESMO sessionId:

```bash
curl -s -X POST https://n8n.automatrix.site/webhook/onboardf \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Agendamento de consultas, recebo cerca de 30 pacientes por dia",
    "sessionId": "test-client-001",
    "role": "client",
    "userName": "Dr. Carlos",
    "userEmail": "carlos@clinica.com"
  }' | jq .
```

Se a memory estiver funcionando, o agente deve lembrar que o Dr. Carlos tem
uma clinica e quer automatizar WhatsApp, e prosseguir para a proxima etapa.

### 7.4 Respostas de erro (o que NAO deve acontecer)

| Resposta                                      | Problema                              |
| --------------------------------------------- | ------------------------------------- |
| `{"message": "Workflow was started"}`          | Webhook em modo "Respond Immediately" |
| Timeout (sem resposta em 30s)                  | Agente muito lento ou travado         |
| Texto puro (nao JSON)                          | Agente nao esta retornando JSON       |
| `{"error": "..."}`                             | Erro no workflow                      |

---

## 8. Checklist de Configuracao

- [ ] Webhook Trigger criado em `POST /webhook/onboardf`
- [ ] Webhook Response Mode = **"Using 'Respond to Webhook' Node"**
- [ ] Switch node roteando por `{{ $json.body.role }}` (ou `$json.role`)
- [ ] 3 branches: `client`, `vibecoder`, `learner`
- [ ] AI Agent node para Cliente com prompt da secao 4.1
- [ ] AI Agent node para Desenvolvedor com prompt da secao 4.2
- [ ] AI Agent node para Estudante com prompt da secao 4.3
- [ ] Modelo configurado: GPT-4.1 mini (ou gpt-4o-mini)
- [ ] Window Buffer Memory configurada com sessionKey = `{{ $json.body.sessionId }}`
- [ ] Context Window = 20 mensagens
- [ ] 3 "Respond to Webhook" nodes (um por branch)
- [ ] Workflow ATIVADO (nao apenas salvo)
- [ ] Testado com curl: rota `client` retorna JSON valido
- [ ] Testado com curl: rota `vibecoder` retorna JSON valido
- [ ] Testado com curl: rota `learner` retorna JSON valido
- [ ] Testado continuidade: segunda mensagem com mesmo sessionId funciona
- [ ] Resposta em menos de 30 segundos (timeout do frontend)

---

## 9. Troubleshooting

### Problema: "Workflow was started" na resposta
**Causa**: Webhook esta em modo "Respond Immediately"
**Solucao**: Mudar para "Using 'Respond to Webhook' Node"

### Problema: Agente nao lembra mensagens anteriores
**Causa**: Memory nao configurada ou session key errada
**Solucao**: Verificar que Window Buffer Memory usa `{{ $json.body.sessionId }}`

### Problema: Switch nao roteia corretamente
**Causa**: Campo role nao encontrado no path correto
**Solucao**: Testar ambos `{{ $json.body.role }}` e `{{ $json.role }}`

### Problema: Resposta vem como texto puro, nao JSON
**Causa**: Agente ignorando instrucao de formato
**Solucao**: Adicionar no prompt: "CRITICO: Sua saida DEVE ser APENAS JSON valido, sem texto antes ou depois"

### Problema: Timeout (mais de 30 segundos)
**Causa**: Modelo muito pesado ou prompt muito longo
**Solucao**: Usar GPT-4.1 mini (mais rapido) ou reduzir o context window da memory

### Problema: Campos undefined no payload
**Causa**: userName e userEmail podem ser undefined se o usuario acabou de registrar
**Solucao**: Usar fallback nos prompts: `{{ $json.body.userName ?? "visitante" }}`

---

## 10. Evolucoes Futuras (nao implementar agora)

Estas funcionalidades estao planejadas mas NAO devem ser implementadas neste momento:

1. **Salvar dados do onboarding no Supabase** — O agente extrairia dados estruturados
   (skills, tools, requirements) e salvaria via API do Supabase
2. **Marcar onboarding como completo** — Apos `complete: true`, uma chamada HTTP
   atualizaria `profiles.onboarding_completed = true` no Supabase
3. **Criar projeto automaticamente** — Para clientes, o agente criaria um registro
   na tabela `projects` com o escopo definido na conversa
4. **Notificacao para admin** — Enviar email/notificacao quando um novo dev se cadastra
5. **Streaming de resposta** — Atualmente a resposta vem completa; futuramente
   implementar streaming via SSE para UX mais fluida
