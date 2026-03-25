# Project Brief — Kling Prompter

## Visão Geral

App local (web) que recebe o JSON de roteiros de videoaulas para motoristas de caminhão (programa PAM.ON), extrai os blocos de vídeo B-roll, e gera automaticamente prompts otimizados para a plataforma Kling AI 3.0 (text-to-video) usando IA via OpenRouter API.

## Problema

A produção de vídeos B-roll para videoaulas exige a escrita manual de prompts complexos para o Kling AI 3.0, seguindo uma fórmula de 5 camadas com vocabulário cinematográfico específico. Isso é lento, sujeito a erros, e exige conhecimento técnico que nem todos no time possuem. Cada prompt mal escrito queima créditos ($) da plataforma Kling.

## Solução

Um app que automatiza a geração de prompts Kling AI 3.0 a partir do JSON do roteiro, usando todo o conhecimento da deep research (60+ fontes, fórmula-mestra, anti-padrões, negative prompts, vieses do modelo) embutido como system prompt de uma IA acessada via OpenRouter.

## Prioridades (em ordem decrescente)

1. **Precisão prompt → output** — maximizar aderência entre intenção e vídeo gerado
2. **Controle de presença/ausência** — elementos obrigatórios aparecem; indesejados são suprimidos
3. **Economia de créditos** — acertar na primeira tentativa; prompts assertivos desde o início

## Arquivos de Referência na Workspace

- `PROMPT_KLING.md` — Prompt original da deep research (briefing estratégico, 112+ fontes)
- `OUTPUT_DEEP_RESEARCH_KLING.md` — Relatório técnico-operacional da deep research (fórmula-mestra, anti-padrões, vieses, economia, workflows)
- `MEGAPROMPT_ROO_KLING_PROMPTER.md` — Especificação completa do app (arquitetura, componentes, system prompt, fluxo do usuário, checklist)

## Stack

- Frontend: React (Vite) + Tailwind CSS (dark mode)
- Backend: Node.js (Express) — servidor local mínimo em localhost:3456
- IA: OpenRouter API (compatível OpenAI SDK)
- Linguagem: TypeScript
- Sem banco de dados — localStorage para configurações

## API Key Padrão

`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`

(Substituível pela interface do app)

## Requisito Especial — Passo 0

ANTES de qualquer código, o Roo DEVE ler toda a documentação do OpenRouter (https://openrouter.ai/docs/quickstart e TODAS as abas) e gerar `OPENROUTER_DOCS_INDEX.md` na workspace com todos os endpoints, parâmetros, modelos, opções de routing, plugins, etc. Este índice é a base para construir o seletor completo de modelos e configurações.
