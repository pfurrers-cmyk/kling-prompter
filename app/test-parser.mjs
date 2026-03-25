// Quick parser test — run with: node test-parser.mjs
import { readFileSync } from 'fs'

// Inline the parser logic since we can't import TypeScript directly
function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function getBlockText(block) {
  const raw = block.narrationHtml ?? block.text ?? block.content ?? block.title ?? ''
  return stripHtml(String(raw))
}

function parseScript(json) {
  const rawBlocks = Array.isArray(json.blocks) ? json.blocks : []
  if (rawBlocks.length === 0) throw new Error('No blocks found')

  const title = String(json.title ?? 'Sem título').trim()

  const contextParts = []
  for (const block of rawBlocks) {
    if (block.type === 'presenter' || block.type === 'slide') {
      const text = getBlockText(block)
      if (text) contextParts.push(text)
    }
  }
  const themeContext = contextParts.join('\n\n').trim()

  const clips = []
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

      let visualReference = ''
      if (i + 1 < rawBlocks.length && rawBlocks[i + 1].type === 'note') {
        const noteText = getBlockText(rawBlocks[i + 1])
        if (noteText.includes('🎬')) {
          visualReference = noteText.replace(/^.*?🎬\s*(Ref\.\s*vídeo\s*:?\s*)?/i, '').trim()
          i++
        }
      }

      clips.push({ clipNumber: clipCounter, sectionName: currentSection, narration, visualReference })
    }
  }

  return { title, themeContext, clips }
}

const raw = readFileSync('./public/test-roteiro.json', 'utf-8')
const json = JSON.parse(raw)
const { title, themeContext, clips } = parseScript(json)

console.log('✅ Título:', title)
console.log('✅ Clipes B-roll encontrados:', clips.length)
console.log('✅ Contexto do tema (primeiros 200 chars):', themeContext.slice(0, 200))
console.log('')

clips.forEach(c => {
  console.log(`📹 B-roll #${c.clipNumber}:`)
  console.log('   Seção:', c.sectionName)
  console.log('   Narração:', c.narration.slice(0, 100) + '...')
  console.log('   Ref. visual:', c.visualReference.slice(0, 100) + (c.visualReference.length > 100 ? '...' : ''))
  console.log('')
})

if (clips.length === 4) {
  console.log('✅ PASS: 4 clipes B-roll identificados (esperado: 4)')
} else {
  console.log(`❌ FAIL: ${clips.length} clipes encontrados (esperado: 4)`)
}
