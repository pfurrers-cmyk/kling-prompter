import type { VercelRequest, VercelResponse } from '@vercel/node'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { apiKey } = req.body as { apiKey: string }

  if (!apiKey) {
    return res.status(400).json({ valid: false, error: 'Chave não fornecida' })
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': `https://${req.headers.host ?? 'kling-prompter.vercel.app'}`,
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
