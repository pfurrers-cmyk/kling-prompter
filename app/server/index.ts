import express from 'express'
import cors from 'cors'
import { proxyGenerate, proxyModels, proxyValidateKey } from './openrouter.js'

const app = express()
const PORT = 3456

app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Kling Prompter Backend', port: PORT })
})

// Root route info
app.get('/', (_req, res) => {
  res.send(`
    <div style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: #f1f5f9; height: 100vh;">
      <h1>🎬 Kling Prompter Backend</h1>
      <p>O backend está rodando corretamente na porta ${PORT}.</p>
      <p>Para acessar a interface do usuário, utilize o link do frontend:</p>
      <a href="http://localhost:5173" style="color: #38bdf8; font-weight: bold; text-decoration: none; font-size: 1.2rem;">👉 http://localhost:5173</a>
      <hr style="margin: 2rem 0; border: 0; border-top: 1px solid #334155;">
      <p style="font-size: 0.8rem; color: #94a3b8;">API endpoints: /api/health, /api/models, /api/generate</p>
    </div>
  `)
})

// List available models from OpenRouter
app.get('/api/models', proxyModels)

// Generate prompt via LLM
app.post('/api/generate', proxyGenerate)

// Validate API key
app.post('/api/validate-key', proxyValidateKey)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

app.listen(PORT, () => {
  console.log(`\n🎬 Kling Prompter Backend rodando em http://localhost:${PORT}`)
  console.log(`   Frontend: http://localhost:5173`)
  console.log(`   API health: http://localhost:${PORT}/api/health\n`)
})
