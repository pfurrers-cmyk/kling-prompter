import { useCallback, useState } from 'react'

interface Props {
  onUpload: (jsonString: string) => void
  error?: string | null
  compact?: boolean
}

export default function JsonUploader({ onUpload, error, compact = false }: Props) {
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      // Still try — might be a JSON file without the .json extension
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === 'string') {
        onUpload(content)
      }
    }
    reader.readAsText(file, 'utf-8')
  }, [onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = '' // reset so same file can be uploaded again
  }, [handleFile])

  if (compact) {
    return (
      <div className="space-y-1">
        <label
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileInput}
          />
          <span className="text-base">📂</span>
          <span>Carregar outro roteiro</span>
        </label>
        {error && (
          <p className="text-xs text-red-400 leading-snug">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-medium text-slate-300">Upload do Roteiro</div>

      <label
        className={`
          flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer
          transition-all min-h-[160px]
          ${dragging
            ? 'border-sky-400 bg-sky-900/20 scale-[1.01]'
            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileInput}
        />
        <div className="text-4xl">{dragging ? '📥' : '📄'}</div>
        <div className="text-center">
          <div className="text-sm text-slate-300 font-medium mb-1">
            {dragging ? 'Solte o arquivo aqui' : 'Arraste o JSON do roteiro'}
          </div>
          <div className="text-xs text-slate-500">ou clique para selecionar</div>
        </div>
        <div className="text-xs text-slate-600">Formato: JSON PAM.ON com blocos B-roll</div>
      </label>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
          <span className="text-base">⚠️</span>
          <p className="text-xs text-red-300 leading-relaxed">{error}</p>
        </div>
      )}

      <div className="bg-slate-700/30 rounded-lg p-3 text-xs text-slate-500 space-y-1">
        <div className="font-medium text-slate-400 mb-2">Estrutura esperada:</div>
        <div>• <code className="text-sky-400">blocks[]</code> com tipos: section, presenter, video, slide, note</div>
        <div>• Blocos <code className="text-sky-400">video</code> com <code className="text-sky-400">narrationHtml</code></div>
        <div>• Notas <code className="text-sky-400">🎬 Ref. vídeo:</code> após cada bloco video</div>
      </div>
    </div>
  )
}
