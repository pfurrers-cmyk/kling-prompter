import type { VercelRequest, VercelResponse } from '@vercel/node'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const apiKey = req.headers['x-api-key'] as string | undefined

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'HTTP-Referer': `https://${req.headers.host ?? 'kling-prompter.vercel.app'}`,
      'X-Title': 'Kling Prompter PAM.ON',
    }
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

    const response = await fetch(`${OPENROUTER_BASE}/models`, { headers })
    const data = await response.json()
    res.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    res.status(500).json({ error: `Erro ao buscar modelos: ${msg}` })
  }
}
