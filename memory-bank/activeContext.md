# Active Context

This file tracks the project's current status, including recent changes, current goals, and open questions.

## Current Focus

2026-03-25 22:23:00 - Session 2 complete. App fully updated with Kling workflow guide, enhanced prompt editor, new Kling website config fields, and optimized DEFAULT_CONFIG using claude-sonnet-4-5.

## Recent Changes

2026-03-25 18:00:00 - Project workspace created, memory bank initialized
2026-03-25 21:57:00 - APP FULLY IMPLEMENTED. All 26 tasks. Running at http://localhost:5173. Backend at http://localhost:3456.
2026-03-25 22:04:00 - FIXED: CSS error (resize-vertical → resize-y), server 404 root fixed, provider.sort='default' causing 400 error on OpenRouter fixed via server-side sanitization
2026-03-25 22:13:00 - ADDED: Settings Guide panel in ConfigPanel with full explanation of all config items
2026-03-25 22:17:00 - ENHANCED: GeneratedPrompt type now includes motion_intensity, mode_recommendation, model_recommendation, creativity_relevance
2026-03-25 22:18:00 - UPDATED: systemPrompt.ts OUTPUT FORMAT to include 4 new fields with full documentation
2026-03-25 22:18:00 - UPDATED: promptTemplate.ts parseGeneratedPrompt and buildUserPrompt to explain new fields
2026-03-25 22:20:00 - CREATED: KlingWorkflowGuide.tsx — 10-step guide to using each generated prompt on Kling website
2026-03-25 22:20:00 - UPDATED: PromptEditor.tsx — full Kling website settings section with Motion Intensity + Creativity sliders
2026-03-25 22:22:00 - UPDATED: DEFAULT_CONFIG — now uses claude-sonnet-4-5, temp 0.75, top_p 0.9, top_k 40, freq 0.15, min_p 0.05, data_collection 'deny', response-healing ON
2026-03-25 22:23:00 - FIXED: App.tsx config merge now deep-merges provider and plugins to avoid old localStorage values wiping new defaults

## Open Questions/Issues

- Test scripts (test-parser.mjs, test-generate.mjs) and models.json left in app/ — can be deleted if not needed
- `anthropic/claude-sonnet-4-5` — user should verify this model ID is available in their OpenRouter account
- Streaming not implemented (optional per spec) — could be a future enhancement
- future: could add Motion Brush instructions in the guide (drawing motion paths on specific frame areas)
