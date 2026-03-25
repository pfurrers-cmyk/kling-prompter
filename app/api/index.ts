import express from 'express'
import cors from 'cors'
import { proxyGenerate, proxyModels, proxyValidateKey } from './openrouter.js'

const app = express()

// Allow all origins for Vercel deployment, or configure specifically
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Kling Prompter Backend Serverless' })
})

// List available models from OpenRouter
app.get('/api/models', proxyModels)

// Generate prompt via LLM
app.post('/api/generate', proxyGenerate)

// Validate API key
app.post('/api/validate-key', proxyValidateKey)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota nÃ£o encontrada' })
})

export default app
