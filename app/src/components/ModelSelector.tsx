import { useState, useMemo } from 'react'
import type { OpenRouterModel } from '../lib/types'

interface Props {
  selectedModel: string
  models: OpenRouterModel[]
  loading: boolean
  favoriteModels: string[]
  onSelect: (modelId: string) => void
  onToggleFavorite: (modelId: string) => void
}

function formatPrice(priceStr: string): string {
  const price = parseFloat(priceStr) * 1_000_000 // convert to $/M tokens
  if (price === 0) return 'Grátis'
  if (price < 0.01) return `$${(price * 100).toFixed(3)}¢/M`
  if (price < 1) return `$${price.toFixed(3)}/M`
  return `$${price.toFixed(2)}/M`
}

function getModalityIcon(model: OpenRouterModel): string {
  const modality = model.architecture?.modality ?? ''
  if (modality.includes('image')) return '👁️'
  if (modality.includes('audio')) return '🔊'
  if (modality.includes('video')) return '🎬'
  return '💬'
}

export default function ModelSelector({ selectedModel, models, loading, favoriteModels, onSelect, onToggleFavorite }: Props) {
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [filterFree, setFilterFree] = useState(false)

  const filteredModels = useMemo(() => {
    let list = models
    const q = search.trim().toLowerCase()

    if (q) {
      list = list.filter(m =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q)
      )
    }

    if (filterFree) {
      list = list.filter(m =>
        parseFloat(m.pricing.prompt) === 0 && parseFloat(m.pricing.completion) === 0
      )
    }

    // Sort: favorites first, then by context length desc
    return list.sort((a, b) => {
      const aFav = favoriteModels.includes(a.id) ? -1 : 0
      const bFav = favoriteModels.includes(b.id) ? -1 : 0
      if (aFav !== bFav) return aFav - bFav
      return b.context_length - a.context_length
    })
  }, [models, search, filterFree, favoriteModels])

  const displayedModels = showAll ? filteredModels : filteredModels.slice(0, 20)
  const selectedModelObj = models.find(m => m.id === selectedModel)

  return (
    <div className="space-y-3">
      {/* Current selection */}
      {selectedModelObj && (
        <div className="bg-sky-900/20 border border-sky-700/40 rounded-lg p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-medium text-sky-300 truncate">{selectedModelObj.name}</div>
              <div className="text-xs text-slate-500 truncate font-mono">{selectedModelObj.id}</div>
            </div>
            <div className="text-right flex-none text-xs text-slate-500">
              <div>In: {formatPrice(selectedModelObj.pricing.prompt)}</div>
              <div>Out: {formatPrice(selectedModelObj.pricing.completion)}</div>
            </div>
          </div>
          {selectedModelObj.context_length && (
            <div className="text-xs text-slate-600 mt-1">
              Contexto: {(selectedModelObj.context_length / 1000).toFixed(0)}K tokens
            </div>
          )}
        </div>
      )}

      {/* Search + filters */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Buscar modelos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-300">
            <input
              type="checkbox"
              checked={filterFree}
              onChange={(e) => setFilterFree(e.target.checked)}
              className="accent-sky-500"
            />
            Apenas grátis
          </label>
          {loading && <span className="text-amber-400">⏳ Carregando…</span>}
          {!loading && <span className="text-slate-600">{filteredModels.length} modelos</span>}
        </div>
      </div>

      {/* Model list */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {displayedModels.length === 0 && (
          <div className="text-xs text-slate-600 text-center py-4">
            {loading ? 'Carregando modelos…' : 'Nenhum modelo encontrado'}
          </div>
        )}

        {displayedModels.map(model => {
          const isSelected = model.id === selectedModel
          const isFav = favoriteModels.includes(model.id)
          const isFree = parseFloat(model.pricing.prompt) === 0

          return (
            <div
              key={model.id}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                isSelected
                  ? 'bg-sky-900/40 border border-sky-700/60'
                  : 'hover:bg-slate-700/50 border border-transparent'
              }`}
              onClick={() => onSelect(model.id)}
            >
              <span className="text-sm">{getModalityIcon(model)}</span>
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${isSelected ? 'text-sky-300' : 'text-slate-300'}`}>
                  {model.name}
                </div>
                <div className="text-slate-600 truncate font-mono text-[10px]">{model.id}</div>
              </div>
              <div className="flex-none text-right space-y-0.5">
                {isFree ? (
                  <span className="tag-green">Grátis</span>
                ) : (
                  <div className="text-slate-500">{formatPrice(model.pricing.completion)}</div>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(model.id) }}
                className={`flex-none text-sm transition-colors ${isFav ? 'text-amber-400' : 'text-slate-700 hover:text-slate-500'}`}
                title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                ★
              </button>
            </div>
          )
        })}

        {!showAll && filteredModels.length > 20 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full text-xs text-slate-500 hover:text-slate-300 py-2 text-center transition-colors"
          >
            Mostrar mais {filteredModels.length - 20} modelos…
          </button>
        )}
      </div>
    </div>
  )
}
