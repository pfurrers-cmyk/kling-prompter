import { useState } from 'react'
import type { BRollClip } from '../lib/types'

interface Props {
  clips: BRollClip[]
  selectedClipId: string | null
  isGeneratingAll: boolean
  onSelectClip: (id: string) => void
  onGenerateClip: (id: string) => void
  onGenerateAll: () => void
  onUpdateClip: (id: string, updates: Partial<BRollClip>) => void
  onToggleSelect: (id: string) => void
  doneCount: number
  totalSelected: number
}

function StatusBadge({ status }: { status: BRollClip['status'] }) {
  switch (status) {
    case 'pending':
      return <span className="tag-gray">⬜ Pendente</span>
    case 'generating':
      return <span className="tag-yellow">⏳ Gerando…</span>
    case 'done':
      return <span className="tag-green">✅ Pronto</span>
    case 'error':
      return <span className="tag-red">❌ Erro</span>
  }
}

interface ClipCardProps {
  clip: BRollClip
  isSelected: boolean
  onSelect: () => void
  onGenerate: () => void
  onToggleSelect: () => void
  onUpdateClip: (updates: Partial<BRollClip>) => void
}

function ClipCard({ clip, isSelected, onSelect, onGenerate, onToggleSelect, onUpdateClip }: ClipCardProps) {
  const [editingNarration, setEditingNarration] = useState(false)
  const [editingRef, setEditingRef] = useState(false)

  return (
    <div
      className={`rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'border-sky-500 bg-slate-700/80'
          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
      }`}
      onClick={onSelect}
    >
      {/* Card Header */}
      <div className="flex items-start gap-2 p-3">
        <input
          type="checkbox"
          checked={clip.selected}
          onChange={(e) => { e.stopPropagation(); onToggleSelect() }}
          className="mt-0.5 accent-sky-500"
          title="Selecionar para geração em lote"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-sky-400">B-roll #{clip.clipNumber}</span>
            <StatusBadge status={clip.status} />
          </div>
          <div className="text-xs text-slate-500 truncate mt-0.5" title={clip.sectionName}>
            📁 {clip.sectionName}
          </div>
        </div>
      </div>

      {/* Narration */}
      <div className="px-3 pb-2">
        <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
          <span>🎙️ Narração</span>
          <button
            onClick={(e) => { e.stopPropagation(); setEditingNarration(e => !e) }}
            className="text-slate-600 hover:text-slate-400 text-xs"
          >
            {editingNarration ? '✓' : '✏️'}
          </button>
        </div>
        {editingNarration ? (
          <textarea
            value={clip.narration}
            onChange={(e) => onUpdateClip({ narration: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="textarea text-xs min-h-[60px]"
            rows={3}
          />
        ) : (
          <p className="text-xs text-slate-300 leading-snug line-clamp-3">
            {clip.narration || <span className="text-slate-600 italic">Sem narração</span>}
          </p>
        )}
      </div>

      {/* Visual Reference */}
      {(clip.visualReference || editingRef) && (
        <div className="px-3 pb-2">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>🎬 Ref. visual</span>
            <button
              onClick={(e) => { e.stopPropagation(); setEditingRef(e => !e) }}
              className="text-slate-600 hover:text-slate-400 text-xs"
            >
              {editingRef ? '✓' : '✏️'}
            </button>
          </div>
          {editingRef ? (
            <textarea
              value={clip.visualReference}
              onChange={(e) => onUpdateClip({ visualReference: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="textarea text-xs"
              rows={2}
            />
          ) : (
            <p className="text-xs text-slate-400 italic line-clamp-2">{clip.visualReference}</p>
          )}
        </div>
      )}

      {/* Image Reference URL — vision input for LLM + Kling anchor */}
      <div className="px-3 pb-2" onClick={(e) => e.stopPropagation()}>
        <div className="text-xs text-slate-600 mb-1 flex items-center gap-1.5">
          <span>🖼️</span>
          <span>Imagem de referência</span>
          {clip.imageReference && (
            <span className="tag-blue text-[10px]">✓ Ativa</span>
          )}
        </div>
        <input
          type="url"
          value={clip.imageReference ?? ''}
          placeholder="URL de foto real do equipamento (opcional)"
          onChange={(e) => onUpdateClip({ imageReference: e.target.value || undefined })}
          onClick={(e) => e.stopPropagation()}
          className="input text-xs"
        />
        <div className="text-[10px] text-slate-600 mt-0.5">
          {clip.imageReference
            ? '🧠 Claude analisará a imagem para prompts mais precisos · use a mesma URL no Kling como "Image/Subject Reference"'
            : 'Cole URL de foto real → Claude "vê" a imagem e descreve o conteúdo com precisão'}
        </div>
      </div>

      {/* Error message */}
      {clip.status === 'error' && clip.error && (
        <div className="mx-3 mb-2 p-2 bg-red-900/30 border border-red-700/50 rounded text-xs text-red-300 leading-snug">
          {clip.error}
        </div>
      )}

      {/* Actions */}
      <div className="px-3 pb-3" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onGenerate}
          disabled={clip.status === 'generating'}
          className="btn-primary w-full text-xs py-1.5 justify-center"
        >
          {clip.status === 'generating' ? (
            <>⏳ Gerando…</>
          ) : clip.status === 'done' ? (
            <>🔄 Regenerar</>
          ) : (
            <>✨ Gerar Prompt</>
          )}
        </button>
      </div>
    </div>
  )
}

export default function VideoBlockList({
  clips,
  selectedClipId,
  isGeneratingAll,
  onSelectClip,
  onGenerateClip,
  onGenerateAll,
  onUpdateClip,
  onToggleSelect,
  doneCount,
  totalSelected,
}: Props) {
  const allSelected = clips.every(c => c.selected)

  function handleSelectAll() {
    const newVal = !allSelected
    clips.forEach(c => onUpdateClip(c.id, { selected: newVal }))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="section-header">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">Clipes B-roll</span>
          <span className="tag-blue">{clips.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSelectAll}
            className="btn-ghost text-xs py-1 px-2"
            title={allSelected ? 'Desselecionar todos' : 'Selecionar todos'}
          >
            {allSelected ? '☑ Todos' : '☐ Todos'}
          </button>
        </div>
      </div>

      {/* Generate All Button */}
      <div className="p-3 border-b border-slate-700">
        <button
          onClick={onGenerateAll}
          disabled={isGeneratingAll || totalSelected === 0}
          className="btn-primary w-full justify-center"
        >
          {isGeneratingAll ? (
            <>⏳ Gerando {doneCount}/{totalSelected}…</>
          ) : (
            <>🚀 Gerar Todos os Prompts ({totalSelected} selecionado{totalSelected !== 1 ? 's' : ''})</>
          )}
        </button>

        {doneCount > 0 && (
          <div className="mt-2 text-center text-xs text-slate-500">
            {doneCount}/{clips.length} prompts gerados
          </div>
        )}
      </div>

      {/* Clip Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {clips.map(clip => (
          <ClipCard
            key={clip.id}
            clip={clip}
            isSelected={clip.id === selectedClipId}
            onSelect={() => onSelectClip(clip.id)}
            onGenerate={() => onGenerateClip(clip.id)}
            onToggleSelect={() => onToggleSelect(clip.id)}
            onUpdateClip={(updates) => onUpdateClip(clip.id, updates)}
          />
        ))}
      </div>
    </div>
  )
}
