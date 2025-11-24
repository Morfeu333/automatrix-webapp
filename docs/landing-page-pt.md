# Documentação da Landing Page - Automatrix

## Visão Geral
A Landing Page é o ponto de entrada principal do webapp Automatrix, projetada para converter visitantes em usuários registrados através de um processo de qualificação inteligente.

## Estrutura da Página

### 1. Seção Hero
- **Título Principal**: "Transform Your Business with AI Automation"
- **Subtítulo**: Descrição dos benefícios da automação com IA
- **VSL Principal**: Vídeo de vendas introdutório (placeholder: 8:45 min)
- **CTA Principal**: "Get Started - Take Our Quick Assessment"

### 2. Vídeo de Vendas (VSL)
**Conteúdo do VSL Principal:**
- Introdução à Automatrix e seus serviços
- Demonstração de casos de uso reais
- Benefícios da automação com IA
- Chamada para ação para completar o assessment

### 3. Seção de Funcionalidades
Três cards principais destacando:
- **Custom Solutions**: Soluções personalizadas de IA
- **Premade Automations**: Workflows prontos para uso
- **Expert Support**: Suporte especializado

### 4. Social Proof
- Indicação de "1000+ Businesses Worldwide"
- Placeholders para logos de empresas clientes

## Fluxo de Interação

### 1. Quiz/Assessment Modal
**Objetivo**: Qualificar leads e entender necessidades específicas

**Perguntas do Quiz:**
1. **Business Size**: Tamanho da empresa (Individual a Enterprise)
2. **Technical Knowledge**: Nível técnico (Beginner a Expert)
3. **Automation Experience**: Experiência com automação
4. **Primary Goal**: Objetivo principal com automação
5. **Budget Range**: Faixa de orçamento mensal
6. **Implementation Preference**: Preferência de implementação

**Funcionalidades:**
- Barra de progresso visual
- Navegação entre perguntas
- Validação de respostas obrigatórias
- Design responsivo

### 2. Options Modal (Pós-Quiz)
**Aparece após completar o quiz**

**Segundo VSL**: Vídeo personalizado explicando as opções (4:30 min)

**Três Opções Principais:**

#### Opção 1: Schedule a Meeting
- **Ícone**: Calendar
- **Benefícios**: 
  - Sessão de estratégia de 30 minutos
  - Roadmap de automação personalizado
  - Timeline de implementação
  - Projeções de ROI
- **CTA**: "Book Free Consultation"

#### Opção 2: Hire Premade Automations (Recomendada)
- **Ícone**: ShoppingBag
- **Benefícios**:
  - 12+ workflows comprovados
  - Implementação instantânea
  - Documentação completa
  - 30 dias de suporte incluído
- **CTA**: "Browse AI Store"
- **Destaque visual**: Border especial indicando recomendação

#### Opção 3: Join the Community
- **Ícone**: Users
- **Benefícios**:
  - Templates de automação gratuitos
  - Sessões ao vivo semanais
  - Rede de suporte entre pares
  - Conteúdo exclusivo
- **CTA**: "Join Community"
- **Ação**: Redirecionamento direto para nas.io

### 3. Registration Flow
**Aparece após selecionar Opção 1 ou 2**

**Campos do Formulário:**
- Nome completo
- Email
- Senha

**Funcionalidades:**
- Validação em tempo real
- Indicadores visuais de benefícios
- Confirmação de desbloqueio dos agentes
- Termos de serviço

**Pós-Registro:**
- Usuário é marcado como registrado
- Agentes são desbloqueados
- Redirecionamento baseado na opção escolhida:
  - Meeting: Calendar booking
  - Shop: Página da loja

## Componentes Técnicos

### Estados de Usuário
- **Visitante**: Acesso apenas à landing page
- **Quiz Completado**: Acesso ao modal de opções
- **Registrado**: Acesso completo aos agentes e funcionalidades

### Integração com Context
- **UserContext**: Gerencia estado do usuário e respostas do quiz
- **Quiz Answers**: Armazenadas para personalização futura
- **Selected Option**: Determina fluxo pós-registro

### Responsividade
- Design mobile-first
- Breakpoints otimizados para tablet e desktop
- Modais adaptáveis ao tamanho da tela

## Placeholders de Conteúdo

### Vídeos
- **VSL Principal**: `/placeholder-vsl-main.mp4`
- **VSL Opções**: `/placeholder-vsl-options.mp4`

### Imagens
- **Hero Background**: Gradiente automatrix
- **Company Logos**: Placeholders numerados
- **Feature Icons**: Lucide React icons

## Métricas e Analytics

### Eventos de Conversão
1. **Quiz Started**: Usuário abre o modal do quiz
2. **Quiz Completed**: Usuário completa todas as perguntas
3. **Option Selected**: Usuário escolhe uma das 3 opções
4. **Registration Completed**: Usuário completa o cadastro
5. **Agents Unlocked**: Usuário acessa a página de agentes

### KPIs Principais
- Taxa de conversão Quiz → Registro
- Distribuição de opções escolhidas
- Tempo médio para completar o quiz
- Taxa de abandono por pergunta

## Otimizações Futuras

### A/B Tests Sugeridos
- Diferentes CTAs no botão principal
- Variações no texto do VSL
- Ordem das opções no modal
- Cores e design dos cards de opções

### Personalizações
- Conteúdo do segundo VSL baseado nas respostas do quiz
- Recomendações específicas por perfil de usuário
- Workflows sugeridos baseados no orçamento e experiência

## Considerações de UX

### Princípios de Design
- **Clareza**: Cada etapa tem objetivo claro
- **Progressão**: Usuário sempre sabe onde está no processo
- **Confiança**: Social proof e benefícios claros
- **Simplicidade**: Mínimo de fricção para conversão

### Acessibilidade
- Contraste adequado para leitura
- Navegação por teclado
- Textos alternativos para imagens
- Indicadores de progresso claros
