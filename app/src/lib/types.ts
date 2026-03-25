// ============================================================
// Core Domain Types — Kling Prompter PAM.ON
// ============================================================

// ----- PAM.ON Script JSON format -----

export interface ScriptBlock {
  type: 'section' | 'presenter' | 'video' | 'slide' | 'note'
  narrationHtml?: string
  text?: string
  content?: string
  title?: string
  [key: string]: unknown
}

export interface ScriptJson {
  title?: string
  name?: string
  blocks?: ScriptBlock[]
  sections?: ScriptBlock[]
  [key: string]: unknown
}

// ----- Parsed B-roll clip -----

export type ClipStatus = 'pending' | 'generating' | 'done' | 'error'

export interface BRollClip {
  id: string
  clipNumber: number
  sectionName: string
  narration: string          // cleaned from narrationHtml
  visualReference: string   // from 🎬 note block
  adjacentContext: string   // presenter blocks before + after
  imageReference?: string   // optional URL of reference image for vision (passed to LLM + Kling)
  extraContext?: string      // optional free-text context added by the user before generation
  status: ClipStatus
  selected: boolean
  error?: string
  generatedPrompt?: GeneratedPrompt
}

// ----- AI-Generated Output -----

export interface GeneratedPrompt {
  prompt: string
  negative_prompt: string
  camera_movement: string
  duration_recommendation: string      // "5s" | "10s" | "15s" — set in Kling settings dropdown
  resolution_recommendation: string    // "720p (test)" | "1080p (final)" — set in Kling Mode
  audio_recommendation: string         // "off" | "on" — Native Audio toggle in Kling
  motion_intensity: number             // 0.3–3.0 — INFORMATIONAL: reflects intensity of motion described in the prompt (not a UI slider)
  model_recommendation: string         // "VIDEO 3.0" | "VIDEO 3.0 Omni" — model to select in Kling dropdown
  confidence_score: number             // 1-10
  notes: string
}

// ----- OpenRouter Config -----

export interface ProviderConfig {
  sort?: 'default' | 'price' | 'throughput' | 'latency'
  order?: string[]
  allow_fallbacks?: boolean
  require_parameters?: boolean
  data_collection?: 'allow' | 'deny'
  zdr?: boolean
  only?: string[]
  ignore?: string[]
  quantizations?: string[]
  max_price?: {
    prompt?: number
    completion?: number
    request?: number
    image?: number
  }
  preferred_min_throughput?: number
  preferred_max_latency?: number
}

export interface PluginConfig {
  id: 'web' | 'file-parser' | 'response-healing' | 'context-compression'
  [key: string]: unknown
}

export interface OpenRouterConfig {
  model: string
  temperature: number
  top_p: number
  top_k: number
  frequency_penalty: number
  presence_penalty: number
  repetition_penalty: number
  min_p: number
  top_a: number
  seed?: number
  max_tokens: number
  stop: string[]
  response_format: { type: string }
  provider: ProviderConfig
  plugins: PluginConfig[]
  // model suffix
  modelSuffix: '' | ':nitro' | ':floor' | ':free'
}

// ----- OpenRouter Model from API -----

export interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length: number
  pricing: {
    prompt: string
    completion: string
    image?: string
    request?: string
  }
  architecture?: {
    modality?: string
    input_modalities?: string[]
    output_modalities?: string[]
  }
  supported_parameters?: string[]
  top_provider?: {
    context_length?: number
    max_completion_tokens?: number | null
    is_moderated?: boolean
  }
}

// ----- App State -----

export interface AppState {
  // Script data
  scriptTitle: string
  themeContext: string
  clips: BRollClip[]
  selectedClipId: string | null

  // API
  apiKey: string
  apiKeyValid: boolean | null

  // Config
  config: OpenRouterConfig

  // Available models from OpenRouter
  availableModels: OpenRouterModel[]
  modelsLoading: boolean
  modelsError: string | null

  // Favorite models (stored in localStorage)
  favoriteModels: string[]

  // UI state
  configPanelOpen: boolean
  apiKeyModalOpen: boolean
}

// ----- Default Config -----
// Otimizado para geração de prompts Kling 3.0 (PAM.ON)
// Modelo: claude-sonnet-4-5 — melhor custo/benefício para saída JSON estruturada
// Todos os parâmetros calibrados para máxima qualidade de prompt cinematográfico
// Referências: deep research (OUTPUT_DEEP_RESEARCH_KLING.md) + OPENROUTER_DOCS_INDEX.md

export const DEFAULT_CONFIG: OpenRouterConfig = {
  // ── MODELO ──────────────────────────────────────────────────────────────────
  model: 'anthropic/claude-sonnet-4-5',
  // claude-sonnet-4-5: melhor custo/benefício da família Claude 4 para saída JSON.
  // Alta aderência a instruções estruturadas, excelente vocabulário cinematográfico.
  // Contexto 200K garante que o system prompt completo (deep research) caiba sem truncagem.

  modelSuffix: '',
  // Sem sufixo: roteamento padrão via Anthropic direct (melhor qualidade, sem degradação).
  // Não usar :free (qualidade comprometida) nem :nitro (reduz qualidade de instrução-following).

  // ── SAMPLING PARAMETERS ─────────────────────────────────────────────────────
  temperature: 0.75,
  // 0.75: Sweet spot validado para geração de prompts cinematográficos.
  // Suficientemente criativo para vocabulário rico e variado entre clipes.
  // Suficientemente focado para seguir a fórmula de 5 camadas e produzir JSON válido.
  // Fonte: klingaio.com recomenda 0.65–0.80 para aderência + criatividade balanceadas.

  top_p: 0.9,
  // 0.9: Nucleus sampling corta a cauda longa de tokens improváveis.
  // Melhora coerência do vocabulário cinematográfico sem sacrificar variedade.
  // Combinado com temperature 0.75, garante outputs ricos mas não alucinados.

  top_k: 40,
  // 40: Limita seleção às 40 palavras mais prováveis.
  // Padrão de alta qualidade para modelos Claude quando JSON é esperado.
  // Evita tokens raros que comprometem estrutura JSON e terminologia cinematográfica.

  frequency_penalty: 0.15,
  // 0.15: Penalidade leve para evitar repetição de vocabulário de câmera.
  // Essencial: sem penalidade, o modelo tende a reutilizar "tracking shot" e "dolly"
  // em todos os clipes — com 0.15, usa variedade do vocabulário validado (crane, whip-pan, etc.).

  presence_penalty: 0.1,
  // 0.1: Leve incentivo para introduzir novos descritores visuais por clipe.
  // Evita que todos os prompts pareçam iguais mantendo coerência estrutural.

  repetition_penalty: 1.0,
  // 1.0: Neutro. Claude 4.x ignora este parâmetro nativo de modelos open-source.
  // Mantido em 1.0 para não interferir com frequency/presence_penalty acima.

  min_p: 0.05,
  // 0.05: Remove tokens com probabilidade < 5% do token mais provável.
  // Técnica moderna que complementa top_p sem "podar" criatividade — especialmente
  // eficaz para manter terminologia cinematográfica de baixa frequência mas alta relevância.

  top_a: 0.0,
  // 0.0: Desabilitado. Top-A é redundante quando top_p + min_p já estão configurados.
  // Claude não se beneficia significativamente de top_a além de top_p.

  seed: undefined,
  // undefined: Resultados variados por geração — cada clipe produz um prompt único.
  // Definir uma seed só faz sentido para reprodutibilidade em debugging/testes.

  max_tokens: 2048,
  // 2048: Suficiente para o JSON completo (prompt 150 words + negative + config + notas).
  // JSON típico gerado = ~800-1200 tokens. 2048 garante margem sem custo excessivo.
  // Não aumentar além de 2048: o modelo não gera prompts maiores e o custo aumenta.

  stop: [],
  // Sem stop sequences: deixar o modelo completar o JSON corretamente.

  // ── OUTPUT FORMAT ────────────────────────────────────────────────────────────
  response_format: { type: 'json_object' },
  // OBRIGATÓRIO: O app depende de JSON estruturado para exibir os prompts.
  // claude-sonnet-4-5 tem suporte nativo a json_object com excelente aderência.
  // Combinado com o plugin response-healing abaixo, 99%+ de sucesso de parsing.

  // ── PROVIDER ROUTING ────────────────────────────────────────────────────────
  provider: {
    // sort: omitido (default OpenRouter) — balanceamento otimizado pelo OpenRouter.
    // Para claude-sonnet-4-5, o OpenRouter já roteia para Anthropic direct por padrão.

    allow_fallbacks: true,
    // true: Se o provider Anthropic estiver temporariamente indisponível,
    // o OpenRouter tenta o próximo provider disponível (ex: AWS Bedrock).
    // Garante disponibilidade contínua sem comprometer muito a qualidade.

    require_parameters: false,
    // false: Claude suporta nativamente todos os parâmetros acima.
    // Manter false evita rejeição desnecessária em cenários de fallback.

    data_collection: 'deny',
    // IMPORTANTE: Conteúdo proprietário da PAM.ON não deve ser usado para treinamento.
    // 'deny' exclui providers que coletam dados — protege IP e dados de motoristas.

    zdr: false,
    // false: ZDR implica data_collection: 'deny' que já está ativo.
    // ZDR completo (zero armazenamento) reduz demais a seleção de providers disponíveis.
  },

  // ── PLUGINS ──────────────────────────────────────────────────────────────────
  plugins: [
    { id: 'response-healing' },
    // CRÍTICO ATIVO: Auto-repara JSON malformado antes de entregar ao app.
    // Mesmo claude-sonnet-4-5 ocasionalmente omite vírgulas ou fecha chaves incorretamente.
    // Este plugin salva ~5-10% das gerações que falhariam no parsing.
  ],
}

// ----- API Key -----

export const DEFAULT_API_KEY = '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'

export const STORAGE_KEYS = {
  API_KEY: 'kling_prompter_api_key',
  CONFIG: 'kling_prompter_config',
  FAVORITE_MODELS: 'kling_prompter_favorite_models',
} as const
