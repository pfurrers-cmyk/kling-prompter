import { useState } from 'react'
import type { BRollClip } from '../lib/types'

interface Props {
  clips: BRollClip[]
  scriptTitle: string
  modelId: string
}

function buildMarkdown(clips: BRollClip[], scriptTitle: string, modelId: string): string {
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const doneClips = clips.filter(c => c.status === 'done' && c.generatedPrompt)

  const lines: string[] = [
    `# Prompts Kling AI — ${scriptTitle}`,
    `Gerado em: ${now}`,
    `Modelo utilizado: ${modelId}`,
    `Total de clipes: ${doneClips.length}`,
    '',
    '---',
    '',
  ]

  for (const clip of doneClips) {
    const gp = clip.generatedPrompt!
    lines.push(`## B-roll #${clip.clipNumber} — ${clip.sectionName}`)
    lines.push('')
    lines.push('**Prompt:**')
    lines.push(gp.prompt)
    lines.push('')
    lines.push('**Negative Prompt:**')
    lines.push(gp.negative_prompt)
    lines.push('')
    lines.push('**Configuração recomendada:**')
    lines.push(`- Resolução: ${gp.resolution_recommendation}`)
    lines.push(`- Duração: ${gp.duration_recommendation}`)
    lines.push(`- Áudio nativo: ${gp.audio_recommendation}`)
    lines.push(`- Câmera: ${gp.camera_movement}`)
    lines.push(`- Aspect ratio: 16:9`)
    lines.push('')
    lines.push(`**Score de confiança:** ${gp.confidence_score}/10`)
    if (gp.notes) {
      lines.push(`**Notas:** ${gp.notes}`)
    }
    lines.push('')
    lines.push('**Contexto (narração associada):**')
    if (clip.narration) {
      lines.push(`> ${clip.narration.replace(/\n/g, '\n> ')}`)
    }
    if (clip.visualReference) {
      lines.push('')
      lines.push(`**Referência visual:** ${clip.visualReference}`)
    }
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  lines.push(`_Gerado por Kling Prompter PAM.ON — https://github.com/pamonprompt_`)

  return lines.join('\n')
}

function buildJson(clips: BRollClip[], scriptTitle: string, modelId: string): string {
  const now = new Date().toISOString()
  const doneClips = clips.filter(c => c.status === 'done' && c.generatedPrompt)

  const output = {
    meta: {
      scriptTitle,
      modelId,
      generatedAt: now,
      totalClips: doneClips.length,
    },
    clips: doneClips.map(clip => ({
      clipNumber: clip.clipNumber,
      sectionName: clip.sectionName,
      narration: clip.narration,
      visualReference: clip.visualReference,
      generatedAt: now,
      ...clip.generatedPrompt,
    })),
  }

  return JSON.stringify(output, null, 2)
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function PromptExporter({ clips, scriptTitle, modelId }: Props) {
  const [exported, setExported] = useState<'md' | 'json' | null>(null)
  const doneClips = clips.filter(c => c.status === 'done' && c.generatedPrompt)

  function handleExportMd() {
    const content = buildMarkdown(clips, scriptTitle, modelId)
    const safeName = scriptTitle.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)
    downloadFile(content, `kling-prompts-${safeName}.md`, 'text/markdown')
    setExported('md')
    setTimeout(() => setExported(null), 2000)
  }

  function handleExportJson() {
    const content = buildJson(clips, scriptTitle, modelId)
    const safeName = scriptTitle.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)
    downloadFile(content, `kling-prompts-${safeName}.json`, 'application/json')
    setExported('json')
    setTimeout(() => setExported(null), 2000)
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs text-slate-500">
        📥 Exportar <span className="text-slate-400 font-medium">{doneClips.length}</span> prompt{doneClips.length !== 1 ? 's' : ''} gerado{doneClips.length !== 1 ? 's' : ''}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportMd}
          className="btn-secondary text-xs py-1.5"
          disabled={doneClips.length === 0}
        >
          {exported === 'md' ? '✓ Exportado!' : '📥 Exportar .md'}
        </button>
        <button
          onClick={handleExportJson}
          className="btn-secondary text-xs py-1.5"
          disabled={doneClips.length === 0}
        >
          {exported === 'json' ? '✓ Exportado!' : '📥 Exportar .json'}
        </button>
      </div>
    </div>
  )
}
