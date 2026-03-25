import type { Request, Response } from 'express'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const TIMEOUT_MS = 90_000  // increased for vision + generation

// Content part for multimodal messages (vision)
type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } }

export interface GenerateRequest {
  apiKey: string
  model: string
  messages: Array<{ role: string; content: string | ContentPart[] }>
  temperature?: number
  top_p?: number
  top_k?: number
  frequency_penalty?: number
  presence_penalty?: number
  repetition_penalty?: number
  min_p?: number
  top_a?: number
  seed?: number
  max_tokens?: number
  stop?: string[]
  response_format?: { type: string }
  provider?: Record<string, unknown>
  plugins?: Array<{ id: string; [key: string]: unknown }>
}

function extractApiError(body: unknown): string {
  if (typeof body === 'object' && body !== null) {
    const b = body as Record<string, unknown>
    if (b.error && typeof b.error === 'object') {
      const err = b.error as Record<string, unknown>
      if (typeof err.message === 'string') return err.message
    }
    if (typeof b.message === 'string') return b.message
  }
  return 'Erro desconhecido na API'
}

function mapErrorCode(status: number, message: string): string {
  switch (status) {
    case 401:
      return `Chave de API inválida ou sem saldo suficiente. ${message}`
    case 402:
      return `Créditos insuficientes na conta OpenRouter. ${message}`
    case 403:
      return `Conteúdo bloqueado pelos filtros de segurança do provider. ${message}`
    case 408:
      return `Timeout: o modelo demorou mais de 60 segundos para responder. ${message}`
    case 429:
      return `Rate limit atingido. Aguarde alguns segundos antes de tentar novamente. ${message}`
    case 502:
      return `Provider indisponível (Bad Gateway). Tente outro modelo ou provider. ${message}`
    case 503:
      return `Serviço temporariamente indisponível. Tente novamente em alguns instantes. ${message}`
    default:
      return `Erro ${status}: ${message}`
  }
}

export async function proxyGenerate(req: Request, res: Response): Promise<void> {
  const body = req.body as GenerateRequest

  if (!body.apiKey) {
    res.status(400).json({ error: 'Chave de API não fornecida' })
    return
  }

  const {
    apiKey,
    model,
    messages,
    temperature,
    top_p,
    top_k,
    frequency_penalty,
    presence_penalty,
    repetition_penalty,
    min_p,
    top_a,
    seed,
    max_tokens,
    stop,
    response_format,
    provider,
    plugins,
  } = body

  // Build payload — omit undefined values
  const payload: Record<string, unknown> = { model, messages }
  if (temperature !== undefined) payload.temperature = temperature
  if (top_p !== undefined) payload.top_p = top_p
  if (top_k !== undefined && top_k > 0) payload.top_k = top_k
  if (frequency_penalty !== undefined) payload.frequency_penalty = frequency_penalty
  if (presence_penalty !== undefined) payload.presence_penalty = presence_penalty
  if (repetition_penalty !== undefined && repetition_penalty !== 1) payload.repetition_penalty = repetition_penalty
  if (min_p !== undefined && min_p > 0) payload.min_p = min_p
  if (top_a !== undefined && top_a > 0) payload.top_a = top_a
  if (seed !== undefined) payload.seed = seed
  if (max_tokens !== undefined) payload.max_tokens = max_tokens
  if (stop && stop.length > 0) payload.stop = stop
  if (response_format) payload.response_format = response_format
  if (provider && Object.keys(provider).length > 0) {
    // Sanitize provider object — remove default values that might cause 400 errors
    const sanitizedProvider: Record<string, unknown> = { ...provider }
    
    if (sanitizedProvider.sort === 'default') delete sanitizedProvider.sort
    if (sanitizedProvider.data_collection === 'allow') delete sanitizedProvider.data_collection
    if (sanitizedProvider.allow_fallbacks === true) delete sanitizedProvider.allow_fallbacks
    if (sanitizedProvider.require_parameters === false) delete sanitizedProvider.require_parameters
    if (sanitizedProvider.zdr === false) delete sanitizedProvider.zdr
    
    if (Object.keys(sanitizedProvider).length > 0) {
      payload.provider = sanitizedProvider
    }
  }
  if (plugins && plugins.length > 0) payload.plugins = plugins

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    // console.log('Payload to OpenRouter:', JSON.stringify(payload, null, 2))
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3456',
        'X-Title': 'Kling Prompter PAM.ON',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const data = await response.json() as unknown

    if (!response.ok) {
      const message = extractApiError(data)
      const friendlyMessage = mapErrorCode(response.status, message)
      res.status(response.status).json({ error: friendlyMessage })
      return
    }

    res.json(data)
  } catch (err: unknown) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      res.status(408).json({ error: 'Timeout: o modelo demorou mais de 60 segundos. Tente um modelo mais rápido.' })
    } else {
      const msg = err instanceof Error ? err.message : 'Erro de conexão desconhecido'
      res.status(500).json({ error: `Erro ao conectar ao OpenRouter: ${msg}` })
    }
  }
}

export async function proxyModels(req: Request, res: Response): Promise<void> {
  const apiKey = req.headers['x-api-key'] as string | undefined

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3456',
      'X-Title': 'Kling Prompter PAM.ON',
    }
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

    const response = await fetch(`${OPENROUTER_BASE}/models`, { headers })
    const data = await response.json() as unknown
    res.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    res.status(500).json({ error: `Erro ao buscar modelos: ${msg}` })
  }
}

export async function proxyValidateKey(req: Request, res: Response): Promise<void> {
  const { apiKey } = req.body as { apiKey: string }

  if (!apiKey) {
    res.status(400).json({ valid: false, error: 'Chave não fornecida' })
    return
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3456',
      },
    })

    if (response.ok) {
      res.json({ valid: true })
    } else {
      res.json({ valid: false, error: `Chave inválida (HTTP ${response.status})` })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro de conexão'
    res.json({ valid: false, error: msg })
  }
}
