# OpenRouter API — Índice Completo de Documentação

> Gerado em: 2026-03-25 | Fonte: https://openrouter.ai/docs + https://openrouter.ai/api/v1/models
> Este documento é a referência completa para construção do ModelSelector e ConfigPanel do Kling Prompter.

---

## 1. ENDPOINTS PRINCIPAIS

### Base URL
```
https://openrouter.ai/api/v1
```

### Endpoints Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/chat/completions` | POST | Geração de texto/chat (compatível OpenAI) |
| `/completions` | POST | Geração de texto (legacy, completions) |
| `/models` | GET | Lista todos os modelos disponíveis |
| `/generation` | GET | Status/info de uma geração específica |
| `/auth/key` | GET | Info sobre a API key atual |
| `/embeddings` | POST | Geração de embeddings |

---

## 2. AUTENTICAÇÃO

### Via Header HTTP
```
Authorization: Bearer sk-or-v1-xxxxxxxxxxxx
```

### Via Parâmetro de Query (não recomendado para produção)
```
?api_key=sk-or-v1-xxxxxxxxxxxx
```

### Cabeçalhos Opcionais Recomendados
```
HTTP-Referer: https://seusite.com   # Para rastreamento de uso no dashboard
X-Title: Kling Prompter             # Nome do app no dashboard OpenRouter
```

---

## 3. PARÂMETROS COMPLETOS — POST /chat/completions

### Request Body (JSON)

```typescript
{
  // === OBRIGATÓRIO ===
  model: string,           // Ex: "anthropic/claude-sonnet-4", "openai/gpt-4o"
  messages: Message[],     // Array de mensagens {role, content}

  // === SAMPLING PARAMETERS ===
  temperature?: number,         // 0.0–2.0 | Default: 1.0 | Criatividade
  top_p?: number,               // 0.0–1.0 | Default: 1.0 | Nucleus sampling
  top_k?: number,               // 1–∞     | Default: 0 (off) | Top-K sampling
  frequency_penalty?: number,   // -2.0–2.0 | Default: 0.0 | Penaliza freq. de repetição
  presence_penalty?: number,    // -2.0–2.0 | Default: 0.0 | Penaliza presença de repetição
  repetition_penalty?: number,  // 0.0–2.0  | Default: 1.0 | Penalidade geral de repetição
  min_p?: number,               // 0.0–1.0  | Default: 0.0 | Probabilidade mínima relativa
  top_a?: number,               // 0.0–1.0  | Default: 0.0 | Top-A sampling dinâmico
  seed?: number,                // Qualquer int | Reprodutibilidade (não garantida entre providers)
  max_tokens?: number,          // 1–(context_length) | Default: varia por modelo
  stop?: string[],              // Sequências de parada | Ex: ["\n\n", "###"]
  logit_bias?: Record<string, number>, // Ajuste de logits por token ID
  logprobs?: boolean,           // Retorna log-probabilidades dos tokens
  top_logprobs?: number,        // 0–20 | Quantidade de top logprobs por token

  // === OUTPUT FORMAT ===
  response_format?: {
    type: "text" | "json_object" | "json_schema",
    json_schema?: {             // Apenas para type: "json_schema"
      name: string,
      strict: boolean,
      schema: object           // JSON Schema válido
    }
  },

  // === STREAMING ===
  stream?: boolean,             // true = SSE streaming | Default: false
  stream_options?: {
    include_usage?: boolean     // Inclui usage no chunk final do stream
  },

  // === TOOLS (Function Calling) ===
  tools?: Tool[],
  tool_choice?: "none" | "auto" | { type: "function", function: { name: string } },
  parallel_tool_calls?: boolean,

  // === TRANSFORMS (OpenRouter-specific) ===
  transforms?: string[],        // Ex: ["middle-out"] para compressão de contexto

  // === PROVIDER ROUTING ===
  provider?: ProviderRoutingConfig,

  // === PLUGINS ===
  plugins?: PluginConfig[],

  // === METADATA ===
  user?: string,                // ID do usuário final (para rate limiting por usuário)
}
```

### Estrutura Message

```typescript
interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string | ContentPart[];   // ContentPart para multimodal
  name?: string;                     // Para role: "tool"
  tool_call_id?: string;             // Para role: "tool"
}

interface ContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;                     // URL ou base64 data URL
    detail?: "auto" | "low" | "high";
  };
}
```

---

## 4. PROVIDER ROUTING — Parâmetro `provider`

```typescript
interface ProviderRoutingConfig {
  // === ORDENAÇÃO / SELEÇÃO ===
  sort?: "price" | "throughput" | "latency" | "default";
  // "price" = menor custo primeiro
  // "throughput" = maior throughput (tokens/s) primeiro
  // "latency" = menor latência (TTFT) primeiro
  // "default" = balanceamento padrão OpenRouter

  order?: string[];
  // Lista ordenada de providers preferidos
  // Ex: ["Anthropic", "AWS Bedrock", "Together"]
  // OpenRouter tentará cada um em sequência

  // === FILTROS ===
  only?: string[];
  // Usar APENAS estes providers
  // Ex: ["Anthropic", "Azure"]

  ignore?: string[];
  // Ignorar estes providers
  // Ex: ["Together", "Hyperbolic"]

  allow_fallbacks?: boolean;
  // true (default): tenta outros providers se o principal falhar
  // false: falha se o provider preferido não estiver disponível

  require_parameters?: boolean;
  // false (default): usa providers mesmo sem suporte a todos os parâmetros
  // true: filtra providers que não suportam os parâmetros enviados

  // === QUALIDADE / CUANTIZAÇÃO ===
  quantizations?: Array<"int4" | "int8" | "fp4" | "fp6" | "fp8" | "fp16" | "bf16" | "fp32" | "unknown">;
  // Filtra por quantização do modelo

  // === PRIVACIDADE ===
  data_collection?: "allow" | "deny";
  // "allow" (default): permite providers que coletam dados para treinamento
  // "deny": usa apenas providers com política de não-treinamento

  zdr?: boolean;
  // Zero Data Retention: usa apenas providers com confirmação de não-armazenamento
  // Implica: data_collection: "deny"

  enforce_distillable_text?: boolean;
  // Garante que o output seja texto distilável (útil para fine-tuning)

  // === LIMITES DE PREÇO ===
  max_price?: {
    prompt?: number;        // $/M tokens de input (Ex: 0.5 = $0.50/M)
    completion?: number;    // $/M tokens de output
    request?: number;       // $ por request
    image?: number;         // $ por imagem (para modelos multimodais)
  };

  // === LIMITES DE PERFORMANCE ===
  preferred_min_throughput?: number | {
    // Throughput mínimo em tokens/segundo
    value: number;
    percentile?: "p50" | "p75" | "p90" | "p99";
  };

  preferred_max_latency?: number | {
    // Latência máxima em segundos (TTFT = Time To First Token)
    value: number;
    percentile?: "p50" | "p75" | "p90" | "p99";
  };
}
```

---

## 5. PLUGINS — Parâmetro `plugins`

```typescript
type PluginConfig = {
  id: "web" | "file-parser" | "response-healing" | "context-compression";
  // Configurações específicas por plugin:
}

// Plugin: Web Search
{
  id: "web",
  max_results?: number,      // Número máximo de resultados de busca
  search_prompt?: string     // Prompt customizado para a busca
}

// Plugin: File Parser
{
  id: "file-parser"
  // Permite upload de PDFs, documentos, etc. via URLs nas mensagens
}

// Plugin: Response Healing
{
  id: "response-healing"
  // Auto-reparo de respostas JSON malformadas
  // Recomendado ON quando response_format: { type: "json_object" }
}

// Plugin: Context Compression
{
  id: "context-compression",
  ratio?: number  // 0.0–1.0, quanto comprimir (default: 0.5)
}
```

---

## 6. MODEL SUFFIXES (Atalhos de Roteamento)

Sufixos podem ser adicionados ao ID do modelo para modificar o roteamento:

| Sufixo | Efeito |
|--------|--------|
| `:nitro` | Prioriza providers com maior throughput (velocidade) |
| `:floor` | Prioriza providers com menor preço por token |
| `:free` | Usa apenas endpoints gratuitos (quando disponíveis) |
| `:extended` | Usa variante com contexto estendido (se disponível) |
| `:thinking` | Usa variante com reasoning/thinking habilitado |
| `:online` | Habilita web search nativo (equivale ao plugin web) |

**Exemplos:**
```
anthropic/claude-sonnet-4:nitro     # Claude Sonnet com máximo throughput
openai/gpt-4o:floor                 # GPT-4o no provider mais barato
meta-llama/llama-3.1-8b:free        # Llama 8B gratuito
google/gemini-pro-1.5:extended      # Gemini com contexto de 2M tokens
deepseek/deepseek-r1:thinking       # DeepSeek R1 com chain-of-thought
perplexity/sonar:online             # Perplexity com busca web
```

---

## 7. RESPONSE FORMAT

### Chat Completion Response

```typescript
{
  id: string,
  model: string,            // Modelo que efetivamente processou a request
  object: "chat.completion",
  created: number,          // Unix timestamp
  choices: [{
    index: number,
    message: {
      role: "assistant",
      content: string,      // Resposta do modelo
      tool_calls?: ToolCall[]
    },
    finish_reason: "stop" | "length" | "tool_calls" | "content_filter" | null,
    logprobs?: object
  }],
  usage: {
    prompt_tokens: number,
    completion_tokens: number,
    total_tokens: number,
    prompt_tokens_details?: object,
    completion_tokens_details?: object
  },
  // Headers adicionais OpenRouter:
  // X-RateLimit-Remaining: tokens restantes
}
```

### Streaming Response (SSE)
```
data: {"id":"...","choices":[{"delta":{"content":"..."}}]}
data: {"id":"...","choices":[{"delta":{"content":"..."}}]}
data: [DONE]
```

---

## 8. ERROS E CÓDIGOS

| Código HTTP | Código OpenRouter | Descrição |
|-------------|------------------|-----------|
| 400 | 400 | Bad Request — parâmetro inválido |
| 401 | 401 | Unauthorized — API key inválida ou sem fundos |
| 402 | 402 | Payment Required — sem créditos suficientes |
| 403 | 403 | Forbidden — conteúdo bloqueado por filtros |
| 408 | 408 | Request Timeout — modelo demorou demais |
| 429 | 429 | Too Many Requests — rate limit atingido |
| 502 | 502 | Bad Gateway — provider indisponível |
| 503 | 503 | Service Unavailable — manutenção |

### Estrutura de Erro
```json
{
  "error": {
    "code": 401,
    "message": "No auth credentials found",
    "metadata": {}
  }
}
```

---

## 9. RATE LIMITS

- **Free tier:** 20 requests/minuto, 200 requests/dia
- **Com créditos:** 500 requests/minuto (varia por modelo)
- **Por modelo:** alguns providers têm seus próprios limits
- **Header de resposta:** `X-RateLimit-Remaining` indica tokens restantes
- **429 handling:** aguardar `Retry-After` header ou backoff exponencial

---

## 10. GET /models — Estrutura de Modelo

```typescript
interface ModelInfo {
  id: string;                          // Ex: "anthropic/claude-sonnet-4"
  canonical_slug?: string;             // Slug canônico
  name: string;                        // Nome legível
  created: number;                     // Unix timestamp
  description: string;
  context_length: number;              // Máximo de tokens de contexto
  architecture: {
    modality: string;                  // Ex: "text->text", "text+image->text"
    input_modalities: string[];        // ["text", "image", "audio", "video"]
    output_modalities: string[];       // ["text"]
    tokenizer: string;
    instruct_type: string | null;
  };
  pricing: {
    prompt: string;                    // $/token de input (string float)
    completion: string;                // $/token de output
    image?: string;                    // $/imagem
    request?: string;                  // $/request
    input_cache_read?: string;         // $/token de cache read
    input_cache_write?: string;        // $/token de cache write
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number | null;
    is_moderated: boolean;
  };
  supported_parameters: string[];      // Lista de params suportados pelo modelo
  per_request_limits: object | null;
}
```

---

## 11. MODELOS RECOMENDADOS PARA GERAÇÃO DE PROMPTS

> Nota: Lista baseada em consulta ao `/api/v1/models` em 2026-03-25. Preços em $/M tokens.

### Tier 1 — Melhor Qualidade (para produção)

| Modelo | ID OpenRouter | Contexto | Input $/M | Output $/M |
|--------|--------------|---------|-----------|-----------|
| Claude Sonnet 4 | `anthropic/claude-sonnet-4` | 200K | $3.00 | $15.00 |
| Claude Opus 4 | `anthropic/claude-opus-4` | 200K | $15.00 | $75.00 |
| GPT-4o | `openai/gpt-4o` | 128K | $2.50 | $10.00 |
| Gemini 2.5 Pro | `google/gemini-2.5-pro-preview` | 1M | $1.25 | $10.00 |

### Tier 2 — Equilíbrio Custo/Qualidade (recomendado default)

| Modelo | ID OpenRouter | Contexto | Input $/M | Output $/M |
|--------|--------------|---------|-----------|-----------|
| Claude Haiku 3.5 | `anthropic/claude-haiku-3-5` | 200K | $0.80 | $4.00 |
| GPT-4o Mini | `openai/gpt-4o-mini` | 128K | $0.15 | $0.60 |
| Gemini Flash 2.0 | `google/gemini-flash-2.0` | 1M | $0.10 | $0.40 |
| DeepSeek v3 | `deepseek/deepseek-chat` | 64K | $0.27 | $1.10 |

### Tier 3 — Econômico (testes rápidos)

| Modelo | ID OpenRouter | Contexto | Input $/M | Output $/M |
|--------|--------------|---------|-----------|-----------|
| DeepSeek R1 (grátis) | `deepseek/deepseek-r1:free` | 64K | $0 | $0 |
| Llama 3.1 8B | `meta-llama/llama-3.1-8b-instruct:free` | 32K | $0 | $0 |
| Gemma 3 27B | `google/gemma-3-27b-it:free` | 128K | $0 | $0 |

**Modelo padrão do app:** `anthropic/claude-sonnet-4` — melhor suporte a JSON mode e instrução técnica cinematográfica.

---

## 12. CACHING E PERFORMANCE

### Prompt Caching
- Anthropic e OpenAI suportam caching automático de prefixos repetidos
- System prompts longos (como o do Kling Prompter) se beneficiam muito
- Custo de cache read: ~10% do custo normal
- Ativado automaticamente em providers suportados

### Otimizações de Latência
1. Usar modelos com suporte a streaming (`stream: true`) para feedback imediato
2. Prefixar cache com system prompt fixo
3. Usar `:nitro` suffix para priorizar throughput
4. `provider.sort: "latency"` para minimizar TTFT

---

## 13. PARÂMETROS VERBOSITY (OpenRouter-specific)

O parâmetro `verbosity` controla a quantidade de metadata retornada:

| Valor | Descrição |
|-------|-----------|
| `"low"` | Resposta mínima — apenas o content |
| `"medium"` | Padrão — content + usage |
| `"high"` | Content + usage + provider info + model usado |
| `"max"` | Tudo — inclui timing, routing decisions, etc. |

---

## 14. AUTENTICAÇÃO AVANÇADA

### BYOK (Bring Your Own Key)
Permite enviar a key do provider diretamente, bypassando o OpenRouter:
```
X-Provider-Key: [provider-specific-key]
```

### OAuth (para apps públicos)
- Não relevante para o Kling Prompter (app local)

### Zero Data Retention Providers
Providers que confirmam não armazenar dados:
- Anthropic Direct (via BYOK)
- Azure OpenAI
- AWS Bedrock
- Google Vertex AI
- Alguns providers privados com acordo NDA

---

## 15. EXEMPLOS DE REQUEST COMPLETOS

### Request Mínimo
```json
{
  "model": "anthropic/claude-sonnet-4",
  "messages": [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "Hello"}
  ]
}
```

### Request Completo (Kling Prompter)
```json
{
  "model": "anthropic/claude-sonnet-4",
  "messages": [
    {"role": "system", "content": "[system prompt da deep research]"},
    {"role": "user", "content": "[user prompt com contexto do clipe]"}
  ],
  "temperature": 0.7,
  "top_p": 1.0,
  "top_k": 0,
  "frequency_penalty": 0.0,
  "presence_penalty": 0.0,
  "repetition_penalty": 1.0,
  "max_tokens": 2000,
  "response_format": {"type": "json_object"},
  "stream": false,
  "provider": {
    "sort": "default",
    "allow_fallbacks": true,
    "data_collection": "allow",
    "require_parameters": false
  },
  "plugins": [
    {"id": "response-healing"}
  ]
}
```

---

## 16. PARÂMETROS NÃO SUPORTADOS POR TODOS OS MODELOS

Lista de parâmetros e quais modelos/providers os suportam:

| Parâmetro | Suporte |
|-----------|---------|
| `response_format: json_object` | GPT-4o, Claude, Gemini, DeepSeek (maioria) |
| `response_format: json_schema` | GPT-4o, alguns Gemini |
| `tools` / `tool_choice` | GPT-4o, Claude, Gemini, Qwen |
| `top_k` | Claude, Gemini, alguns open-source |
| `repetition_penalty` | Open-source (Llama, Mistral, etc.) — NÃO Claude/GPT |
| `min_p` | Open-source principalmente |
| `top_a` | Open-source principalmente |
| `logprobs` | GPT-4o, alguns outros |
| `seed` | GPT-4o, alguns (não garante reproducibilidade cross-provider) |
| `stream` | Maioria dos modelos |

**Usar `provider.require_parameters: true`** para filtrar apenas providers que suportam todos os parâmetros enviados.
