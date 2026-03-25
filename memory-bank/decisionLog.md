# Decision Log

This file records architectural and implementation decisions using a list format.

## Decisions

2026-03-25 18:00:00 - **Stack choice: React + Vite + Express + TypeScript + Tailwind**
- Rationale: Lightweight, fast to scaffold, runs locally without complex infra. TypeScript for type safety on API payloads. Tailwind for rapid dark-mode UI.
- Implication: Single `npm run dev` command to start everything.

2026-03-25 18:00:00 - **OpenRouter over direct provider APIs**
- Rationale: Unified endpoint for hundreds of models. User can switch models without code changes. Fallback routing built-in. Team members can use different models per preference.
- Implication: All LLM calls go through `https://openrouter.ai/api/v1/chat/completions`. API key management required.

2026-03-25 18:00:00 - **API key proxied through Express backend, never sent to browser**
- Rationale: Minimal security layer. Even though it's a local app, prevents accidental key exposure in frontend code or browser DevTools.
- Implication: Frontend calls Express at localhost:3456, Express forwards to OpenRouter with the key.

2026-03-25 18:00:00 - **System prompt embeds entire deep research knowledge base**
- Rationale: The deep research (OUTPUT_DEEP_RESEARCH_KLING.md) contains the 5-layer formula, anti-patterns, negative prompt rules, model biases, camera vocabulary, and PAM.ON context. Embedding it as system prompt ensures every generation benefits from this knowledge without user intervention.
- Implication: System prompt will be ~3000-4000 tokens. This is acceptable for most models but impacts cost per call.

2026-03-25 18:00:00 - **Passo 0 obrigatório: Index OpenRouter docs before coding**
- Rationale: The ConfigPanel must expose ALL OpenRouter parameters. Without reading the full docs first, parameters will be missed or incorrectly implemented.
- Implication: First task is to fetch and index all OpenRouter documentation pages into OPENROUTER_DOCS_INDEX.md.

2026-03-25 18:00:00 - **JSON response format enforced by default**
- Rationale: The AI must return structured JSON (prompt, negative_prompt, config, score, notes). Using `response_format: { type: "json_object" }` ensures parseable output. `response-healing` plugin recommended as fallback.
- Implication: Models that don't support JSON mode will need special handling or exclusion from defaults.

2026-03-25 18:00:00 - **Interface in Portuguese (pt-BR), prompts/system in English**
- Rationale: Users are Brazilian (PAM.ON team). But Kling AI 3.0 performs best with English prompts, and the deep research knowledge base is in English. So: UI labels/tooltips in PT-BR, LLM system+user prompts in EN, generated Kling prompts in EN.
- Implication: No i18n library needed — just hardcode PT-BR strings in components.

2026-03-25 21:52:00 - **React/react-dom must be in `dependencies`, not `devDependencies`**
- Discovered during first npm run dev attempt — Vite couldn't resolve react/react-dom
- Rationale: Even though frontend is bundled, Vite needs react/react-dom as real deps during dev
- Fix: Moved both to `dependencies` alongside express/cors

2026-03-25 21:52:00 - **CORS updated from single origin to regex allowing all localhost ports**
- Rationale: Vite auto-increments port (5173 → 5174 etc.) if port is in use. Hardcoding 5173 broke CORS when port changed.
- Fix: `cors({ origin: /^http:\/\/localhost:\d+$/ })` — allows any local port

2026-03-25 21:52:00 - **Generation logic embedded in App.tsx, not a separate PromptGenerator component**
- Rationale: The generation logic requires access to apiKey, config, clips, themeContext, scriptTitle — all top-level state. A separate component would require either prop drilling everything or context. Embedding in App.tsx is cleaner.
- Implication: App.tsx is ~250 lines but each function is clearly bounded.

2026-03-25 21:57:00 - **End-to-end test validated: anthropic/claude-sonnet-4 confirmed as correct default model**
- Test generated 94-word English prompt with camera-first sentence, Brazilian highway context, physical textures, 8/10 confidence
- The full system prompt (deep research KB) works correctly as the "brain" of the app
