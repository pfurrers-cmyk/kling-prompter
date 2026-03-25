import { useState } from 'react'
import type { BRollClip, GeneratedPrompt } from '../lib/types'
import { countWords, validatePrompt } from '../lib/promptTemplate'
import KlingWorkflowGuide from './KlingWorkflowGuide'

interface Props {
  clip: BRollClip
  onUpdatePrompt: (updates: Partial<GeneratedPrompt>) => void
  onUpdateClip: (updates: Partial<BRollClip>) => void
  onRegenerate: () => void
}

function ConfidenceBar({ score }: { score: number }) {
  const pct = (score / 10) * 100
  const color =
    score >= 8 ? 'bg-emerald-500' :
    score >= 5 ? 'bg-amber-500' :
    'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold ${
        score >= 8 ? 'text-emerald-400' :
        score >= 5 ? 'text-amber-400' :
        'text-red-400'
      }`}>
        {score}/10
      </span>
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} className="btn-ghost text-xs py-1 px-2">
      {copied ? '✓ Copiado!' : `📋 ${label}`}
    </button>
  )
}

// ---- Pending State: rich preparation panel ----
function PreparationPanel({
  clip,
  onUpdateClip,
  onRegenerate,
}: {
  clip: BRollClip
  onUpdateClip: (u: Partial<BRollClip>) => void
  onRegenerate: () => void
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="section-header">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">
            B-roll #{clip.clipNumber}
          </span>
          <span className="text-slate-600 text-xs">—</span>
          <span className="text-xs text-slate-400 truncate max-w-[220px]">{clip.sectionName}</span>
        </div>
        <span className="tag-gray text-[10px]">aguardando geração</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Narration preview */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1.5">🎙️ Narração que acompanha este B-roll</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {clip.narration || <span className="text-slate-600 italic">Sem narração especificada</span>}
          </p>
          {clip.visualReference && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <div className="text-xs text-slate-500 mb-0.5">🎬 Referência visual do roteiro</div>
              <p className="text-xs text-slate-400 italic">{clip.visualReference}</p>
            </div>
          )}
          {clip.imageReference && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <div className="text-xs text-slate-500 mb-0.5">🖼️ Imagem de referência configurada</div>
              <a href={clip.imageReference} target="_blank" rel="noopener noreferrer"
                className="text-xs text-sky-500 underline break-all">{clip.imageReference}</a>
              <div className="text-[10px] text-emerald-400 mt-0.5">🧠 Claude analisará a imagem via visão</div>
            </div>
          )}
        </div>

        {/* Extra Context — PROMINENT area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-200">
              💬 Contexto adicional
              <span className="ml-1.5 text-xs text-slate-500 font-normal">(opcional, mas melhora muito o resultado)</span>
            </label>
            {clip.extraContext && (
              <span className="tag-green text-[10px]">preenchido</span>
            )}
          </div>
          <textarea
            value={clip.extraContext ?? ''}
            onChange={(e) => onUpdateClip({ extraContext: e.target.value || undefined })}
            placeholder={`Adicione aqui qualquer contexto que ajude a gerar um prompt mais preciso.

Exemplos:
• "O tacógrafo mostrado é o modelo Continental VDO DTCO 3.0, tela LCD azul"
• "A cena deve mostrar close-up frontal do painel com o display iluminado"
• "Câmera deve começar afastada e fazer dolly push-in para o equipamento"
• "O motorista visível ao fundo deve estar uniformizado com colete azul PAM.ON"
• "Cena diurna, luz natural lateral, interior de cabine Scania R450 2022"

Este texto é passado diretamente ao Claude como instrução de alta prioridade.`}
            rows={10}
            className="textarea text-xs leading-relaxed font-mono"
            spellCheck={false}
          />
          <div className="text-[10px] text-slate-600 mt-1">
            Boas dicas: modelo exato do equipamento · perspectiva de câmera desejada · cores e materiais · contexto de cena · marcas e roupas visíveis
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={onRegenerate}
          className="btn-primary w-full justify-center py-3 text-sm"
        >
          ✨ Gerar Prompt para este clipe
        </button>

        {/* Hint about image reference */}
        {!clip.imageReference && (
          <div className="bg-sky-900/10 border border-sky-800/20 rounded-lg p-3 text-xs text-slate-500">
            <div className="text-sky-400 font-medium mb-1">💡 Dica: imagem de referência</div>
            <p>Cole a URL de uma foto real do equipamento no card deste clipe (coluna do meio) para que o Claude veja e descreva com precisão. Use a mesma URL depois no Kling como "Image/Subject Reference".</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PromptEditor({ clip, onUpdatePrompt, onUpdateClip, onRegenerate }: Props) {
  const gp = clip.generatedPrompt
  const wordCount = gp ? countWords(gp.prompt) : 0
  const validation = gp ? validatePrompt(gp.prompt) : null
  const [showExtraContext, setShowExtraContext] = useState(false)

  function buildFullCopyText(): string {
    if (!gp) return ''
    return [
      `## B-roll #${clip.clipNumber} — ${clip.sectionName}`,
      '',
      `**Prompt (colar no Kling):**`,
      gp.prompt,
      '',
      `**Negative Prompt (colar no Kling):**`,
      gp.negative_prompt,
      '',
      `**Configurações no site Kling:**`,
      `- Modelo: ${gp.model_recommendation}`,
      `- Qualidade (Mode): ${gp.resolution_recommendation}`,
      `- Duração: ${gp.duration_recommendation}`,
      `- Ratio: 16:9`,
      `- Native Audio: ${gp.audio_recommendation.toUpperCase()}`,
      `- Câmera: ${gp.camera_movement}`,
      '',
      `**Score de confiança:** ${gp.confidence_score}/10`,
      gp.notes ? `**Notas:** ${gp.notes}` : '',
    ].filter(Boolean).join('\n')
  }

  // --- Pending state: show rich preparation panel ---
  if (clip.status === 'pending') {
    return <PreparationPanel clip={clip} onUpdateClip={onUpdateClip} onRegenerate={onRegenerate} />
  }

  if (clip.status === 'generating') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-spin">⏳</div>
          <div className="text-sm text-slate-400">Gerando prompt para B-roll #{clip.clipNumber}…</div>
          <div className="text-xs text-slate-600">Claude está analisando o contexto{clip.imageReference ? ' e a imagem de referência' : ''}…</div>
        </div>
      </div>
    )
  }

  if (clip.status === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <div className="text-4xl">❌</div>
        <div className="text-sm text-red-400 text-center max-w-sm leading-relaxed">
          {clip.error ?? 'Erro desconhecido ao gerar o prompt.'}
        </div>
        <button onClick={onRegenerate} className="btn-primary">
          🔄 Tentar novamente
        </button>
      </div>
    )
  }

  if (!gp) return null

  const motionLabel =
    gp.motion_intensity <= 0.5 ? 'sutil'
    : gp.motion_intensity <= 1.2 ? 'moderado'
    : gp.motion_intensity <= 2.0 ? 'energético'
    : 'intenso'

  // Official pricing: credits/second
  const durationSec = parseInt(gp.duration_recommendation.replace('s', ''))
  const is1080p = gp.resolution_recommendation.includes('1080p')
  const audioOn = gp.audio_recommendation === 'on'
  const finalRate = is1080p ? (audioOn ? 12 : 8) : (audioOn ? 9 : 6)
  const finalCredits = durationSec * finalRate
  const testCredits = 5 * 6

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="section-header">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">
            B-roll #{clip.clipNumber}
          </span>
          <span className="text-slate-600 text-xs">—</span>
          <span className="text-xs text-slate-400 truncate max-w-[180px]">{clip.sectionName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CopyButton text={gp.prompt} label="Prompt" />
          <CopyButton text={gp.negative_prompt} label="Neg." />
          <CopyButton text={buildFullCopyText()} label="Tudo" />
          <button onClick={onRegenerate} className="btn-ghost text-xs py-1 px-2">
            🔄 Regenerar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Confidence + word count */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-1">Score de confiança</div>
            <ConfidenceBar score={gp.confidence_score} />
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">Palavras</div>
            <span className={`text-sm font-bold ${
              wordCount >= 80 && wordCount <= 150 ? 'text-emerald-400' :
              wordCount < 80 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {wordCount}
            </span>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">Ideal</div>
            <span className="text-xs text-slate-500">80–150</span>
          </div>
        </div>

        {/* Validation warnings */}
        {validation && !validation.valid && (
          <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-3 space-y-1">
            {validation.warnings.map((w, i) => (
              <div key={i} className="text-xs text-amber-300 flex items-start gap-2">
                <span>⚠️</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main prompt */}
        <div>
          <label className="label">Prompt principal — colar no Kling (inglês, 80–150 palavras)</label>
          <textarea
            value={gp.prompt}
            onChange={(e) => onUpdatePrompt({ prompt: e.target.value })}
            className="textarea-mono min-h-[160px]"
            rows={8}
            spellCheck={false}
          />
        </div>

        {/* Negative prompt */}
        <div>
          <label className="label">Negative Prompt — colar no campo "Negative" do Kling (5–10 keywords, sem "no"/"not")</label>
          <textarea
            value={gp.negative_prompt}
            onChange={(e) => onUpdatePrompt({ negative_prompt: e.target.value })}
            className="textarea text-xs"
            rows={2}
            spellCheck={false}
          />
        </div>

        {/* ===== KLING WEBSITE SETTINGS ===== */}
        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-slate-700/30 border-b border-slate-700 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">🎬 Configurações no site Kling</span>
            <span className="tag-blue text-[10px]">defina antes de gerar</span>
          </div>
          <div className="p-3 space-y-3">

            {/* Model */}
            <div>
              <label className="label">Modelo</label>
              <select
                value={gp.model_recommendation}
                onChange={(e) => onUpdatePrompt({ model_recommendation: e.target.value })}
                className="select text-xs"
              >
                <option value="VIDEO 3.0">VIDEO 3.0 — B-roll padrão (recomendado)</option>
                <option value="VIDEO 3.0 Omni">VIDEO 3.0 Omni — Elements / Áudio com voz</option>
              </select>
            </div>

            {/* Resolution + Duration + Audio */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Qualidade</label>
                <select
                  value={gp.resolution_recommendation}
                  onChange={(e) => onUpdatePrompt({ resolution_recommendation: e.target.value })}
                  className="select text-xs"
                >
                  <option value="720p (test)">720p — Teste</option>
                  <option value="1080p (final)">1080p — Final</option>
                </select>
              </div>
              <div>
                <label className="label">Duração</label>
                <select
                  value={gp.duration_recommendation}
                  onChange={(e) => onUpdatePrompt({ duration_recommendation: e.target.value })}
                  className="select text-xs"
                >
                  {['3s','4s','5s','6s','7s','8s','9s','10s','11s','12s','13s','14s','15s'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Native Audio</label>
                <select
                  value={gp.audio_recommendation}
                  onChange={(e) => onUpdatePrompt({ audio_recommendation: e.target.value })}
                  className="select text-xs"
                >
                  <option value="off">OFF (B-roll)</option>
                  <option value="on">ON (c/ som)</option>
                </select>
              </div>
            </div>

            {/* Fixed settings */}
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-700/30 rounded p-2 text-center">
                <div className="text-[10px] text-slate-500 mb-0.5">Ratio</div>
                <div className="text-xs font-bold text-slate-300">16:9</div>
              </div>
              <div className="flex-1 bg-slate-700/30 rounded p-2 text-center">
                <div className="text-[10px] text-slate-500 mb-0.5">Output</div>
                <div className="text-xs font-bold text-slate-300">1</div>
              </div>
              <div className="flex-1 bg-slate-700/30 rounded p-2 text-center">
                <div className="text-[10px] text-slate-500 mb-0.5">Multi-Shot</div>
                <div className="text-xs font-bold text-red-400">OFF</div>
              </div>
            </div>

            {/* Camera + motion info */}
            <div>
              <label className="label">Câmera (já na 1ª frase do prompt)</label>
              <input
                type="text"
                value={gp.camera_movement}
                onChange={(e) => onUpdatePrompt({ camera_movement: e.target.value })}
                className="input text-xs"
              />
            </div>
            <div className="bg-slate-700/20 border border-slate-700/50 rounded-lg p-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Intensidade de movimento do prompt</div>
                <span className="text-xs font-bold text-sky-400">{gp.motion_intensity} — {motionLabel}</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500/60 rounded-full" style={{ width: `${(gp.motion_intensity / 3.0) * 100}%` }} />
              </div>
              <div className="text-[10px] text-slate-600 mt-1">Embutida no prompt — não é slider no site Kling</div>
            </div>
          </div>
        </div>

        {/* Extra context — collapsible section for re-generation */}
        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowExtraContext(o => !o)}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-700/30 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">💬 Contexto adicional</span>
              {clip.extraContext
                ? <span className="tag-green text-[10px]">preenchido</span>
                : <span className="text-[10px] text-slate-600">não preenchido</span>
              }
            </div>
            <span className="text-slate-500 text-xs">{showExtraContext ? '▼' : '▶'}</span>
          </button>
          {showExtraContext && (
            <div className="border-t border-slate-700 p-3">
              <textarea
                value={clip.extraContext ?? ''}
                onChange={(e) => onUpdateClip({ extraContext: e.target.value || undefined })}
                placeholder="Adicione contexto específico sobre este clipe antes de regenerar…"
                rows={4}
                className="textarea text-xs"
                spellCheck={false}
              />
              <div className="text-[10px] text-slate-600 mt-1">Este contexto é incluído na próxima geração. Clique em 🔄 Regenerar após editar.</div>
            </div>
          )}
        </div>

        {/* Notes */}
        {gp.notes && (
          <div className="bg-slate-700/30 border border-slate-700 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1.5 font-medium">💡 Notas da IA</div>
            <p className="text-xs text-slate-400 leading-relaxed">{gp.notes}</p>
          </div>
        )}

        {/* Credit estimate */}
        <div className="bg-slate-700/20 border border-slate-700/50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1.5 font-medium">💰 Estimativa de custo Kling</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
            <div className="text-slate-500">Teste (720p / 5s / sem áudio):</div>
            <div className="text-amber-400 font-medium">{testCredits} créditos</div>
            <div className="text-slate-500">Final ({gp.resolution_recommendation.replace(' (test)', '').replace(' (final)', '')} / {gp.duration_recommendation} / {audioOn ? 'áudio' : 'sem áudio'}):</div>
            <div className="text-sky-400 font-medium">{finalCredits} créditos</div>
          </div>
          <div className="text-[10px] text-slate-600 mt-2 pt-1.5 border-t border-slate-700/50">
            720p sem áudio = 6 cr/s · com áudio = 9 cr/s · 1080p sem áudio = 8 cr/s · com áudio = 12 cr/s
          </div>
        </div>

        {/* Kling Workflow Guide */}
        <KlingWorkflowGuide gp={gp} clip={clip} />

      </div>
    </div>
  )
}
