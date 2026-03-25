// Quick end-to-end AI generation test — run with: node test-generate.mjs
// Tests the /api/generate endpoint with clip #1 from the test roteiro

const API_KEY = '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'
const BACKEND = 'http://localhost:3456'

const systemPrompt = `You are Kling Prompter. Generate a Kling 3.0 text-to-video prompt for a Brazilian truck driver safety training B-roll clip. 

Follow the 5-layer formula: [Camera+Movement] → [Subject+Physics] → [Environment+Lighting] → [Texture+Details] → [Style/Atmosphere]

Rules:
- Write prompt in English, 80-150 words
- Camera instruction MUST be first sentence
- Describe HOW things move (physics), not just THAT they move
- Anchor hands/feet to objects
- Use physical textures (film grain, road grime, etc.)
- Negative prompt: 5-10 keywords, NO "no"/"not" prefix

Respond ONLY with this JSON:
{
  "prompt": "...",
  "negative_prompt": "...",
  "camera_movement": "...",
  "duration_recommendation": "5s",
  "resolution_recommendation": "720p (test)",
  "audio_recommendation": "off",
  "confidence_score": 8,
  "notes": "..."
}`

const userPrompt = `
## TEMA: Distância de Seguimento Segura

## CLIPE B-ROLL #1
Seção: Introdução — O que é distância de seguimento
Narração: Observe agora uma simulação em pista seca mostrando a diferença entre distância segura e insegura. Repare no espaço entre os veículos e como isso afeta a capacidade de frenagem.
Referência visual: Tomada aérea de rodovia BR-116 mostrando dois caminhões em sequência — um com distância adequada (6+ carros) e outro muito próximo (1-2 carros). Câmera drone de cima para baixo, luz do dia.

Generate the Kling 3.0 prompt. Respond ONLY with JSON.`

console.log('🚀 Testando geração via API...')
console.log('   Modelo: anthropic/claude-sonnet-4')
console.log('   Backend:', BACKEND)
console.log('')

const start = Date.now()

try {
  const res = await fetch(`${BACKEND}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: API_KEY,
      model: 'anthropic/claude-sonnet-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })
  })

  const elapsed = Date.now() - start
  const data = await res.json()

  if (!res.ok) {
    console.error('❌ Erro HTTP', res.status, ':', data.error)
    process.exit(1)
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) {
    console.error('❌ Resposta vazia')
    process.exit(1)
  }

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch {
    console.error('❌ JSON malformado:', content.slice(0, 200))
    process.exit(1)
  }

  console.log(`✅ Geração bem-sucedida em ${elapsed}ms\n`)
  console.log('='.repeat(70))
  console.log('PROMPT:')
  console.log(parsed.prompt)
  console.log('')
  console.log('NEGATIVE PROMPT:', parsed.negative_prompt)
  console.log('CÂMERA:', parsed.camera_movement)
  console.log('DURAÇÃO:', parsed.duration_recommendation)
  console.log('RESOLUÇÃO:', parsed.resolution_recommendation)
  console.log('ÁUDIO:', parsed.audio_recommendation)
  console.log('SCORE:', parsed.confidence_score, '/10')
  console.log('NOTAS:', parsed.notes)
  console.log('='.repeat(70))

  // Validate word count
  const words = parsed.prompt.trim().split(/\s+/).filter(Boolean).length
  console.log(`\nValidação: ${words} palavras no prompt (target: 80-150)`)
  if (words >= 80 && words <= 150) {
    console.log('✅ PASS: Palavra count OK')
  } else {
    console.log(`⚠️ WARN: ${words} palavras (fora do range ideal)`)
  }

  // Check camera in first sentence
  const firstSentence = parsed.prompt.split(/[.!?]/)[0].toLowerCase()
  const cameraTerms = ['shot', 'camera', 'drone', 'aerial', 'tripod', 'dolly', 'tracking']
  const hasCam = cameraTerms.some(t => firstSentence.includes(t))
  if (hasCam) {
    console.log('✅ PASS: Câmera na primeira frase')
  } else {
    console.log('⚠️ WARN: Câmera não detectada na primeira frase')
  }

  const negTerms = parsed.negative_prompt.split(',').map(t => t.trim()).filter(Boolean)
  console.log(`✅ Negative prompt: ${negTerms.length} termos`)

} catch (err) {
  console.error('❌ Erro de conexão:', err.message)
  console.error('   Certifique-se que o backend está rodando em', BACKEND)
}
