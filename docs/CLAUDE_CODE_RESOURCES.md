---https://www.youtube.com/watch?v=-1K_ZWDKpU0
Pronto! O documento de instrucoes completo foi criado. Aqui esta o resumo do
  que foi gerado:

  Documento criado: docs/AGENCY_OS_IMPLEMENTATION_GUIDE.md

  15 secoes cobrindo tudo que voce precisa para restartar o chat:

  1. Contexto do Projeto - Stack, estado do git, convencoes
  2. O que implementar - Agency OS completo, decisoes ja tomadas
  3. Database - Mapeamento completo: 10 tabelas novas + 4 junction tables +
  enums + triggers + views + RLS + indexes
  4. Design System - Cores dark theme, status colors, tipografia
  5. Estrutura de Arquivos - Todas as novas rotas e componentes planejados
  6. Fluxos de Usuario - Visitante→Cliente e Admin/Vibecoder
  7. Painel Direito - Como evoluir de ProjectScopeCard para Client Portal
  8. Ordem de Implementacao - 8 sprints sequenciais
  9. Arquivos-chave - Tabela com todos os arquivos importantes
  10. API Proxy N8N - Como funciona a integracao
  11. Stripe - Config completa
  12. Config externa - O que falta configurar
  13. Tools & Plugins recomendados - Skills, MCP servers, subagent strategy
  14. Testing Checklist - DB, frontend, E2E
  15. Reference Files - Paths dos arquivos de especificacao

  Para usar no proximo chat:

  Leia o arquivo docs/AGENCY_OS_IMPLEMENTATION_GUIDE.md para contexto completo
  do projeto,
  depois comece pela implementacao do Sprint 1 (Database + Types + Migration).

  O MEMORY.md tambem foi atualizado para refletir o estado atual do projeto.
---
# Claude Code - Recursos Disponiveis

Documento aberto. Agora os caminhos completos de todos os arquivos de         
  configuracao/instrucoes:                                  
                                                                                
  ---                                                                        
  Arquivos de Configuracao do Claude Code                                       
                                                                              
  Configs Globais                                                               
                                                                                
  /Users/lucasautomatrix/.claude/CLAUDE.md                    ← Instrucoes      
  globais (todas as sessoes)                                                    
  /Users/lucasautomatrix/.claude/settings.json                ← Plugins         
  habilitados + MCPs inline + permissions                                       
  /Users/lucasautomatrix/.claude/settings.local.json          ← Settings locais 
  (override)                                                                    
  /Users/lucasautomatrix/.claude/mcp.json                     ← MCP servers (22
  configurados)
  /Users/lucasautomatrix/.claude/project-config.json          ← Config de
  projetos

  Memory (Projeto Automatrix)

  /Users/lucasautomatrix/.claude/projects/-Users-lucasautomatrix-Projects-workin
  g-automatrix-automatrix-webapp/memory/MEMORY.md
  /Users/lucasautomatrix/.claude/projects/-Users-lucasautomatrix-Projects-workin
  g-automatrix-automatrix-webapp/memory/codebase-structure.md
  /Users/lucasautomatrix/.claude/projects/-Users-lucasautomatrix-Projects-workin
  g-automatrix-automatrix-webapp/memory/sprint-2-completion.md

  Settings Locais do Projeto

  /Users/lucasautomatrix/Projects/working/automatrix/automatrix-webapp/.claude/s
  ettings.local.json  ← Permissions pre-aprovadas

  Plugin Configs (principais)

  /Users/lucasautomatrix/.claude/plugins/marketplaces/railway-skills/CLAUDE.md
  /Users/lucasautomatrix/.claude/plugins/marketplaces/claude-plugins-official/pl
  ugins/hookify/hooks/hooks.json
  /Users/lucasautomatrix/.claude/plugins/marketplaces/claude-plugins-official/pl
  ugins/security-guidance/hooks/hooks.json
  /Users/lucasautomatrix/.claude/plugins/marketplaces/claude-code-settings/setti
  ngs.json

  Docs do Projeto (referencia para instrucoes)

  /Users/lucasautomatrix/Projects/working/automatrix/automatrix-webapp/docs/AGEN
  CY_OS_IMPLEMENTATION_GUIDE.md
  /Users/lucasautomatrix/Projects/working/automatrix/automatrix-webapp/docs/CLAU
  DE_CODE_RESOURCES.md
  /Users/lucasautomatrix/Projects/working/automatrix/automatrix-webapp/docs/N8N_
  ONBOARDING_WORKFLOW.md

  Instrucoes Externas (referenciadas no CLAUDE.md global)

  /Users/lucasautomatrix/Projects/tools/openLM/open-notebook/claude-instructions
  /OPEN_NOTEBOOK_AGENT_INSTRUCTIONS.md
  /Users/lucasautomatrix/Projects/tools/openLM/open-notebook/claude-instructions
  /SERENA_CLAUDE_CODE_GUIDE.md
----


> Lista completa de todos os MCPs, plugins, skills, subagents e ferramentas
> disponiveis nesta instalacao do Claude Code.

---

## MCP Servers (22 configurados em mcp.json)

| Server | Status | Descricao |
|--------|--------|-----------|
| **n8n-mcp** | Ativo | N8N workflows (automatrix.site) - 42 tools |
| **n8n-hub** | Ativo | N8N hub (mesmo endpoint, duplicado) |
| **supabase** | Ativo | Supabase MCP (project autoapp) - 20 tools |
| **github** | Ativo | GitHub repos/PRs - 26 tools |
| **notion** | Ativo | Notion workspace - 21 tools |
| **mem0** | Ativo | Memoria AI persistente - 9 tools |
| **sequential-thinking** | Ativo | Raciocinio estruturado - 1 tool |
| **context7** | Ativo | Documentacao de libs - 2 tools |
| **sqlite** | Ativo | Database local - 6 tools |
| **whatsapp** | Ativo | WhatsApp messaging |
| **pencil** | Ativo | Design editor (.pen files) - 15 tools |
| **anytype** | Ativo | Knowledge base management |
| **gupy** | Ativo | RH/Recrutamento - 36 tools |
| **hostinger** | Ativo | VPS/Hosting management |
| **cloudflare-bindings** | Ativo | Cloudflare Workers |
| **cloudflare-builds** | Ativo | Cloudflare Builds |
| **langfuse** | Ativo | LLM observability |
| **youtube-transcript** | Ativo | YouTube transcriptions |
| **instagram-video-analyzer** | Ativo | Instagram video analysis |
| **notebooklm** | Ativo | NotebookLM integration |
| **automation** | Ativo | Automation tools |
| **open8n-mcp** | DISABLED | (desativado) |

### MCPs conectados via Plugins (nao em mcp.json)
| Server | Plugin | Descricao |
|--------|--------|-----------|
| **Serena** | serena@claude-plugins-official | Semantic code tools (find_symbol, replace_symbol, etc.) |
| **Chrome Extension** | (standalone) | Browser automation (navigate, click, screenshot, etc.) |
| **Postiz** | (cloud MCP) | Social media scheduling |
| **Notion MCP** | Notion@claude-plugins-official | Notion workspace (plugin layer) |

---

## Plugins (13 instalados)

| Plugin | Status | Skills incluidas |
|--------|--------|-----------------|
| **serena** | ON | Semantic code editing, symbol search, memory |
| **typescript-lsp** | ON | TypeScript language server |
| **code-review** | ON | Code review (1 skill) |
| **frontend-design** | ON | Frontend design generation (1 skill) |
| **Notion** | ON | Notion workspace skills (6 skills) |
| **commit-commands** | ON | Git commit/push/PR (3 skills) |
| **pr-review-toolkit** | ON | PR review agents (1 skill) |
| **hookify** | ON | Hook creation/management (5 skills) |
| **vercel** | ON | Deploy to Vercel (3 skills) |
| **railway** | ON | Deploy to Railway (13 skills) |
| **spec-kit-skill** | ON | Spec-driven development (1 skill) |
| **stripe** | ON | Stripe integration (3 skills) |
| **security-guidance** | OFF | Security best practices |

---

## Skills (agrupadas - 50+)

| Grupo | Qtd | Exemplos |
|-------|-----|----------|
| **BMAD Method** | 15 | prd, architecture, sprint-planning, dev-story, create-ux-design, tech-spec, brainstorm, research |
| **N8N** | 7 | node-configuration, code-javascript, code-python, expression-syntax, validation-expert, mcp-tools-expert, workflow-patterns |
| **Railway** | 13 | deploy, new, status, projects, environment, database, templates, service, domain, metrics, deployment, central-station, docs |
| **Notion** | 6 | search, find, create-page, create-database-row, create-task, database-query |
| **Commit/PR** | 5 | commit, commit-push-pr, clean_gone, code-review, review-pr |
| **Hookify** | 5 | help, list, configure, hookify, writing-rules |
| **Vercel** | 3 | deploy, setup, logs |
| **Stripe** | 3 | explain-error, test-cards, stripe-best-practices |
| **Others** | 5 | frontend-design, supabase-expert, assemblyai, hostinger, anytype |
| **Meta** | 3 | find-skills, keybindings-help, spec-kit-skill |

---

## Subagents (Task tool)

| Agent | Quando usar |
|-------|-------------|
| **Explore** | Explorar codebase (quick/medium/thorough) |
| **Plan** | Planejar implementacao |
| **general-purpose** | Pesquisa multi-step |
| **Bash** | Git, npm, terminal |
| **code-reviewer** | Review de codigo |
| **code-simplifier** | Simplificar codigo |
| **silent-failure-hunter** | Encontrar error handling inadequado |
| **comment-analyzer** | Verificar acuracia de comentarios |
| **pr-test-analyzer** | Analise de test coverage |
| **type-design-analyzer** | Qualidade de design de tipos |
| **conversation-analyzer** | Analisar conversa para criar hooks |
| **statusline-setup** | Configurar status line |
| **claude-code-guide** | Ajuda com features do Claude Code |

---

## Tools Nativos (built-in)

| Tool | Descricao |
|------|-----------|
| **Read** | Ler arquivos (texto, imagens, PDFs, notebooks) |
| **Write** | Criar/sobrescrever arquivos |
| **Edit** | Editar arquivos (find-replace) |
| **Glob** | Buscar arquivos por pattern |
| **Grep** | Buscar conteudo em arquivos (ripgrep) |
| **Bash** | Executar comandos no terminal |
| **WebSearch** | Buscar na web |
| **WebFetch** | Buscar conteudo de URLs |
| **Task** | Lancar subagents |
| **NotebookEdit** | Editar Jupyter notebooks |
| **Skill** | Invocar skills instaladas |
| **ToolSearch** | Descobrir tools deferred dos MCPs |
| **AskUserQuestion** | Perguntar ao usuario |
| **EnterPlanMode** | Entrar em modo de planejamento |
| **ExitPlanMode** | Sair do modo de planejamento |
| **TaskCreate/Update/Get/List** | Gerenciar todo list |

---

## Deferred Tools (precisa ToolSearch antes de usar)

| MCP | Tools disponiveis |
|-----|-------------------|
| **Pencil** | batch_design, batch_get, find_empty_space, get_editor_state, get_guidelines, get_screenshot, get_style_guide, get_variables, open_document, replace_all_matching, search_all_unique, set_variables, snapshot_layout |
| **Magic (21st)** | component_builder, logo_search, component_inspiration, component_refiner |
| **Serena** | read_file, create_text_file, list_dir, find_file, replace_content, search_for_pattern, get_symbols_overview, find_symbol, find_referencing_symbols, replace_symbol_body, insert_after/before_symbol, rename_symbol, write/read/list/delete/edit_memory, execute_shell_command, activate_project, switch_modes, onboarding, think_about_* |
| **Chrome** | javascript_tool, read_page, find, form_input, computer, navigate, resize_window, gif_creator, upload_image, get_page_text, tabs_context/create, update_plan, read_console/network, shortcuts_list/execute, switch_browser |
| **Postiz** | integrationList, integrationSchema, triggerTool, schedulePost, generateVideoOptions, videoFunction, generateVideo, generateImage, ask_postiz |
| **Notion (cloud)** | search, fetch, create-pages, update-page, move-pages, duplicate-page, create-database, update-data-source, create-comment, get-comments, get-teams, get-users |
