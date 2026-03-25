import { useState } from 'react'

interface Props {
  title: string
  context: string
  clipCount: number
  onReset: () => void
}

export default function ThemeContextPanel({ title, context, clipCount, onReset }: Props) {
  const [expanded, setExpanded] = useState(false)

  const previewLines = context.split('\n').slice(0, 5).join('\n')
  const hasMore = context.split('\n').length > 5

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Title + reset */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2 gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 mb-0.5">Roteiro carregado</div>
          <h2 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2">
            {title}
          </h2>
        </div>
        <button
          onClick={onReset}
          className="flex-none text-slate-600 hover:text-slate-400 transition-colors text-lg"
          title="Remover roteiro"
        >
          ✕
        </button>
      </div>

      {/* Clip count badge */}
      <div className="px-4 pb-2">
        <span className="tag-blue">
          🎞️ {clipCount} clipe{clipCount !== 1 ? 's' : ''} B-roll identificado{clipCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Context section */}
      <div className="flex-1 px-4 pb-3 overflow-hidden">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2 w-full text-left"
        >
          <span className="text-base">{expanded ? '▼' : '▶'}</span>
          <span className="font-medium">Contexto do tema</span>
          {!expanded && hasMore && <span className="text-slate-600">(ver mais)</span>}
        </button>

        {context ? (
          <div className={`text-xs text-slate-400 leading-relaxed whitespace-pre-wrap overflow-hidden ${expanded ? 'overflow-y-auto max-h-64' : 'max-h-20'}`}>
            {expanded ? context : previewLines}
            {!expanded && hasMore && (
              <span className="text-slate-600"> …</span>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-600 italic">
            Nenhum contexto textual encontrado nos blocos presenter/slide.
          </div>
        )}
      </div>
    </div>
  )
}
