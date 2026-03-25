import type { BRollClip } from './types'

// ============================================================
// User Prompt Template Builder — Kling Prompter PAM.ON
// ============================================================

/**
 * Builds the user message sent to the LLM for each B-roll clip.
 * The LLM already has the full Kling 3.0 knowledge base as system prompt.
 * This function assembles the contextual data specific to each clip.
 */
export function buildUserPrompt(
  themeTitle: string,
  themeContext: string,
  clip: BRollClip
): string {
  // Truncate themeContext to avoid excessive token usage
  // ~2000 chars ≈ ~500 tokens, sufficient for theme understanding
  const contextSnippet =
    themeContext.length > 2000
      ? themeContext.slice(0, 1950) + '\n\n[...contexto abreviado para economizar tokens]'
      : themeContext

  const adjacentContextSection = clip.adjacentContext
    ? `### Contexto narrativo adjacente (o que vem antes/depois na aula):
${clip.adjacentContext}`
    : `### Contexto narrativo adjacente:
Nenhum contexto narrativo adjacente disponível para este clipe.`

  const visualRefSection = clip.visualReference
    ? `### Referência visual sugerida pelo roteirista:
${clip.visualReference}`
    : `### Referência visual sugerida pelo roteirista:
Sem referência visual específica — inferir a partir da narração e contexto.`

  return `## TEMA DA VIDEOAULA
${themeTitle}

## CONTEXTO GERAL DO TEMA (o que a aula inteira aborda)
${contextSnippet}

---

## CLIPE B-ROLL #${clip.clipNumber}

### Seção do roteiro:
${clip.sectionName}

### Narração que acompanha este vídeo (o que o apresentador diz ENQUANTO este B-roll é exibido):
${clip.narration || 'Narração não especificada — inferir do contexto da seção.'}

${visualRefSection}

${adjacentContextSection}
${clip.extraContext ? `
---

### CONTEXTO ADICIONAL FORNECIDO PELO OPERADOR (prioridade alta):
${clip.extraContext}

Este contexto adicional foi inserido pelo usuário que conhece o material de origem. Incorpore TODAS essas informações no prompt gerado — sobrepõem-se às inferências baseadas apenas na narração ou referência visual.` : ''}

---

Gere o prompt otimizado para Kling AI 3.0 para este clipe B-roll.

Lembre-se das regras críticas:
1. Câmera na PRIMEIRA frase, sempre
2. 80 a 150 palavras no campo "prompt"
3. Inglês no campo "prompt"
4. Descrever COMO as coisas se movem (física), não apenas QUE se movem
5. Ancorar mãos e pés a objetos físicos
6. Incluir texturas físicas (asphalt grain, fabric creases, etc.)
7. Negative prompt: apenas keywords, SEM "no" ou "not", máximo 10 termos
8. Este é conteúdo de treinamento para motoristas de caminhão brasileiros — realismo documental, sem dramatização

Para os campos adicionais:
- motion_intensity: valor informacional 0.3-3.0 refletindo a intensidade de movimento DESCRITA no prompt (não é um slider no site Kling). Use 0.3-0.5 para cenas estáticas, 0.5-1.0 para ações moderadas, 1.5-2.5 para energéticas, 2.5-3.0 para intensas. B-roll educativo: tipicamente 0.5-1.2.
- model_recommendation: "VIDEO 3.0" para B-roll padrão; "VIDEO 3.0 Omni" APENAS se consistência de personagem via Elements ou voz/lip-sync for necessário.
${clip.imageReference ? `
IMAGEM DE REFERÊNCIA VISUAL FORNECIDA: Analise CUIDADOSAMENTE a imagem incluída nesta mensagem.
- Descreva os elementos visuais específicos que você vê (cores, materiais, formatos, marcas, condições de uso)
- Use esses detalhes para criar um prompt extremamente preciso e específico
- Descreva o que ESTÁ NA IMAGEM, não uma versão genérica do equipamento
- A imagem pode ser usada diretamente no Kling como "Image/Subject Reference" para ancorar a geração visualmente` : ''}

Responda APENAS com o JSON especificado no seu system prompt. Nenhum texto fora do JSON.`
}

/**
 * Parse the raw LLM response, extracting JSON even from markdown code blocks.
 * Returns the parsed GeneratedPrompt or throws a descriptive error.
 */
export function parseGeneratedPrompt(rawContent: string): {
  prompt: string
  negative_prompt: string
  camera_movement: string
  duration_recommendation: string
  resolution_recommendation: string
  audio_recommendation: string
  motion_intensity: number
  model_recommendation: string
  confidence_score: number
  notes: string
} {
  let jsonString = rawContent.trim()

  // Strip markdown code blocks: ```json ... ``` or ``` ... ```
  if (jsonString.startsWith('```')) {
    const lines = jsonString.split('\n')
    lines.shift() // remove ```json or ```
    if (lines[lines.length - 1].trim() === '```') lines.pop()
    jsonString = lines.join('\n').trim()
  }

  // Try to extract JSON object from mixed content
  if (!jsonString.startsWith('{')) {
    const match = jsonString.match(/\{[\s\S]*\}/)
    if (match) {
      jsonString = match[0]
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error(
      `A IA retornou uma resposta que não é JSON válido. ` +
      `Tente regenerar ou verifique o modelo selecionado.\n\n` +
      `Resposta recebida (primeiros 200 chars):\n${rawContent.slice(0, 200)}`
    )
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Resposta da IA não é um objeto JSON válido.')
  }

  const obj = parsed as Record<string, unknown>

  // Validate and extract required fields with fallbacks
  const result = {
    prompt: String(obj.prompt ?? ''),
    negative_prompt: String(obj.negative_prompt ?? ''),
    camera_movement: String(obj.camera_movement ?? ''),
    duration_recommendation: String(obj.duration_recommendation ?? '5s'),
    resolution_recommendation: String(obj.resolution_recommendation ?? '720p (test)'),
    audio_recommendation: String(obj.audio_recommendation ?? 'off'),
    motion_intensity: Number(obj.motion_intensity ?? 0.5),
    model_recommendation: String(obj.model_recommendation ?? 'VIDEO 3.0'),
    confidence_score: Number(obj.confidence_score ?? 5),
    notes: String(obj.notes ?? ''),
  }

  if (!result.prompt) {
    throw new Error('A IA retornou um prompt vazio. Verifique o modelo e tente novamente.')
  }

  return result
}

/**
 * Count words in an English prompt string
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Validate a generated prompt against the 5-layer formula rules
 */
export function validatePrompt(prompt: string): {
  valid: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  const words = countWords(prompt)

  if (words < 80) {
    warnings.push(`Prompt muito curto: ${words} palavras (mínimo: 80)`)
  }
  if (words > 200) {
    warnings.push(`Prompt muito longo: ${words} palavras (máximo recomendado: 150)`)
  }

  const cameraKeywords = [
    'shot', 'camera', 'tripod', 'dolly', 'tracking', 'handheld', 'steadicam',
    'drone', 'crane', 'pan', 'tilt', 'zoom', 'push', 'pull', 'orbit', 'locked'
  ]
  const firstSentence = prompt.split(/[.!?]/)[0].toLowerCase()
  const hasCameraFirst = cameraKeywords.some(kw => firstSentence.includes(kw))

  if (!hasCameraFirst) {
    warnings.push('A primeira frase não parece conter instrução de câmera (crítico para evitar camera drift)')
  }

  return {
    valid: warnings.length === 0,
    warnings,
  }
}
