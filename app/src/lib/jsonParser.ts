import type { BRollClip, ScriptJson, ScriptBlock } from './types'

// ============================================================
// PAM.ON Script JSON Parser
// ============================================================

/**
 * Strip HTML tags from narrationHtml and clean whitespace
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Extract plain text from any block (tries multiple field names)
 */
function getBlockText(block: ScriptBlock): string {
  const raw =
    block.narrationHtml ??
    block.text ??
    block.content ??
    block.title ??
    ''
  return stripHtml(String(raw))
}

/**
 * Parse PAM.ON script JSON and extract:
 * - title
 * - theme context (concatenation of presenter + slide texts)
 * - B-roll clips with context
 */
export function parseScript(json: ScriptJson): {
  title: string
  themeContext: string
  clips: BRollClip[]
} {
  // Normalize: find the blocks array
  const rawBlocks: ScriptBlock[] = Array.isArray(json.blocks)
    ? json.blocks
    : Array.isArray(json.sections)
    ? json.sections
    : []

  if (rawBlocks.length === 0) {
    throw new Error(
      'JSON inválido: nenhuma propriedade "blocks" ou "sections" encontrada. ' +
      'Verifique se você está fazendo upload do arquivo correto.'
    )
  }

  const title =
    String(json.title ?? json.name ?? 'Tema sem título').trim()

  // ---- Build theme context from presenter + slide blocks ----
  const contextParts: string[] = []
  for (const block of rawBlocks) {
    if (block.type === 'presenter' || block.type === 'slide') {
      const text = getBlockText(block)
      if (text) contextParts.push(text)
    }
  }
  const themeContext = contextParts.join('\n\n').trim()

  // ---- Extract B-roll clips ----
  const clips: BRollClip[] = []
  let currentSection = 'Seção Inicial'
  let clipCounter = 0

  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i]

    if (block.type === 'section') {
      currentSection = getBlockText(block) || `Seção ${i + 1}`
      continue
    }

    if (block.type === 'video') {
      clipCounter++

      const narration = getBlockText(block)

      // Look for a 🎬 note immediately after this video block
      let visualReference = ''
      if (i + 1 < rawBlocks.length && rawBlocks[i + 1].type === 'note') {
        const noteText = getBlockText(rawBlocks[i + 1])
        if (noteText.includes('🎬')) {
          visualReference = noteText
            .replace(/^.*?🎬\s*(Ref\.\s*vídeo\s*:?\s*)?/i, '')
            .trim()
          i++ // skip the note block
        }
      }

      // Also check if the note is 2 blocks ahead
      if (!visualReference && i + 2 < rawBlocks.length && rawBlocks[i + 2]?.type === 'note') {
        const noteText = getBlockText(rawBlocks[i + 2])
        if (noteText.includes('🎬')) {
          visualReference = noteText
            .replace(/^.*?🎬\s*(Ref\.\s*vídeo\s*:?\s*)?/i, '')
            .trim()
        }
      }

      // Look for adjacent presenter blocks (context 2 before, 2 after)
      const adjacentParts: string[] = []

      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (rawBlocks[j].type === 'presenter') {
          const t = getBlockText(rawBlocks[j])
          if (t) adjacentParts.push(`[ANTES] ${t}`)
        }
      }
      for (let j = i + 1; j < Math.min(rawBlocks.length, i + 4); j++) {
        if (rawBlocks[j].type === 'presenter') {
          const t = getBlockText(rawBlocks[j])
          if (t) adjacentParts.push(`[DEPOIS] ${t}`)
        }
      }

      clips.push({
        id: `clip-${clipCounter}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        clipNumber: clipCounter,
        sectionName: currentSection,
        narration,
        visualReference,
        adjacentContext: adjacentParts.join('\n\n'),
        status: 'pending',
        selected: true,
      })
    }
  }

  if (clips.length === 0) {
    throw new Error(
      'Nenhum bloco de vídeo (type: "video") encontrado no roteiro. ' +
      `O arquivo contém ${rawBlocks.length} bloco(s). ` +
      'Verifique se este é um roteiro PAM.ON com blocos B-roll.'
    )
  }

  return { title, themeContext, clips }
}

/**
 * Validate and parse a JSON string, returning a typed ScriptJson
 */
export function parseScriptJson(raw: string): ScriptJson {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Arquivo inválido: não é um JSON válido. Verifique o formato do arquivo.')
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Estrutura inválida: o JSON deve ser um objeto com propriedade "blocks".')
  }

  return parsed as ScriptJson
}
