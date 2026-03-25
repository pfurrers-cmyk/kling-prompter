# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md and all other available project-related information in the working directory.

2026-03-25 18:00:00 - Initial context established from projectBrief.md and MEGAPROMPT_ROO_KLING_PROMPTER.md.

## Project Goal

Build a local web app ("Kling Prompter") that automates the generation of optimized Kling AI 3.0 text-to-video prompts from PAM.ON truck driver training video scripts (JSON format). The app must embed the full knowledge base from the deep research (60+ sources) as a system prompt, and use OpenRouter API for LLM access with complete model/parameter configurability.

## Key Features

- **JSON Upload & Parsing:** Drag-and-drop upload of PAM.ON script JSONs. Parser extracts video B-roll blocks, narrative context, visual references, and section structure automatically.
- **AI-Powered Prompt Generation:** Each B-roll block is sent to an LLM (via OpenRouter) with the full theme context + deep research knowledge embedded as system prompt. Output is a structured JSON with prompt (80-150 words, 5-layer formula), negative prompt, config recommendations, confidence score.
- **Complete OpenRouter Configuration:** Searchable model selector (live from /api/v1/models), all sampling parameters (temperature, top_p, top_k, frequency_penalty, presence_penalty, repetition_penalty, min_p, top_a, seed, max_tokens, stop, verbosity), all provider routing options (sort, order, fallbacks, quantizations, max_price, throughput/latency thresholds, ZDR, data_collection), plugins, response format, model suffixes (:nitro, :floor, :free).
- **Editable Prompts:** Generated prompts are editable before export. Users can regenerate individual clips.
- **Export:** All prompts exportable as formatted .md or .json file.
- **API Key Management:** Hardcoded default key with UI to substitute/restore.
- **Interface in Portuguese (pt-BR)**, dark mode default, collapsible advanced panels.

## Overall Architecture

- 3-column layout: (1) JSON upload + theme context, (2) B-roll clip cards with status, (3) generated prompt editor + export
- Express backend (localhost:3456) proxies all OpenRouter calls (API key never exposed to browser)
- Vite dev server for frontend, proxied through Express or run concurrently
- System prompt in `src/lib/systemPrompt.ts` contains the entire deep research knowledge base
- User prompt template in `src/lib/promptTemplate.ts` assembles theme context + clip-specific data
- JSON parser in `src/lib/jsonParser.ts` handles PAM.ON script structure

2026-03-25 18:00:00 - Initial context from project specification.
