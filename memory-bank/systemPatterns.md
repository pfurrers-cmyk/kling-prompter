# System Patterns

This file documents recurring patterns and standards used in the project.

2026-03-25 18:00:00 - Initial patterns established from project specification.

## Coding Patterns

- **TypeScript strict mode** — all files use `.ts` / `.tsx` with strict type checking
- **Functional React components** with hooks (useState, useEffect, useCallback)
- **Tailwind CSS utility classes** — no custom CSS files except `globals.css` for base setup
- **Dark mode by default** — use Tailwind's dark: prefix or CSS variables
- **PT-BR UI strings** — hardcoded in components, no i18n library
- **English for LLM prompts** — system prompt, user prompt template, and generated Kling prompts are all in English
- **JSON response format** — all LLM calls enforce `response_format: { type: "json_object" }` by default

## Architectural Patterns

- **Proxy pattern:** Frontend → Express (localhost:3456) → OpenRouter API. API key never touches the browser.
- **Separation of concerns:**
  - `server/` — Express backend, OpenRouter API wrapper
  - `src/lib/` — Business logic (system prompt, prompt template, JSON parser)
  - `src/components/` — React UI components
- **System prompt as constant:** The entire deep research knowledge base is embedded in `src/lib/systemPrompt.ts` as a single exported string constant. This is the "brain" of the app.
- **User prompt as template function:** `src/lib/promptTemplate.ts` exports a function that assembles the user message from theme context + clip data.
- **JSON parser as pure function:** `src/lib/jsonParser.ts` takes raw JSON, returns typed arrays of clips with context.
- **Sequential generation:** "Gerar Todos" processes clips one by one (not parallel) to avoid rate limiting and allow progress tracking per card.
- **localStorage for persistence:** API key, selected model, sampling parameters, and favorited models persist across sessions.

## Testing Patterns

- **Manual testing with reference JSON:** Use the "Distância de Seguimento" roteiro JSON as the primary test case (4 B-roll blocks expected)
- **Prompt validation checklist:** Each generated prompt must pass: 80-150 words, camera in first sentence, English, 5-layer structure, negative prompt present (5-10 terms)
- **API key validation:** GET `/api/v1/models` to test key validity on startup and on key change
