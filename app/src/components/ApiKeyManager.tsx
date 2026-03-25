import { useState } from 'react'
import { DEFAULT_API_KEY } from '../lib/types'

interface Props {
  apiKey: string
  apiKeyValid: boolean | null
  onSave: (key: string) => void
  onValidate: (valid: boolean | null) => void
  onClose: () => void
}

export default function ApiKeyManager({ apiKey, apiKeyValid, onSave, onValidate, onClose }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draftKey, setDraftKey] = useState(apiKey)
  const [validating, setValidating] = useState(false)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)

  async function handleValidate(keyToTest = apiKey) {
    setValidating(true)
    setValidationMessage(null)
    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest }),
      })
      const data = await res.json() as { valid: boolean; error?: string }
      if (data.valid) {
        onValidate(true)
        setValidationMessage('✅ Chave válida e funcionando!')
      } else {
        onValidate(false)
        setValidationMessage(`❌ ${data.error ?? 'Chave inválida'}`)
      }
    } catch {
      onValidate(false)
      setValidationMessage('❌ Erro de conexão ao validar a chave')
    }
    setValidating(false)
  }

  function handleSave() {
    const trimmed = draftKey.trim()
    if (!trimmed) return
    onSave(trimmed)
    setEditing(false)
    setValidationMessage(null)
    onValidate(null)
    // Auto-validate after saving
    handleValidate(trimmed)
  }

  function handleRestoreDefault() {
    setDraftKey(DEFAULT_API_KEY)
    onSave(DEFAULT_API_KEY)
    setEditing(false)
    setValidationMessage(null)
    onValidate(null)
    handleValidate(DEFAULT_API_KEY)
  }

  function maskKey(key: string): string {
    if (key.length <= 12) return '••••••••'
    return key.slice(0, 8) + '••••••••••••••••' + key.slice(-6)
  }

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">🔑 API Key OpenRouter</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            A chave é enviada ao backend local e nunca exposta no browser
          </p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
      </div>

      {/* Current key display */}
      <div>
        <label className="label">Chave ativa</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 input font-mono text-xs py-2 truncate text-slate-400">
            {revealed ? apiKey : maskKey(apiKey)}
          </div>
          <button
            onClick={() => setRevealed(r => !r)}
            className="btn-ghost text-xs py-2 px-3 flex-none"
            title={revealed ? 'Ocultar' : 'Revelar chave'}
          >
            {revealed ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      {/* Validation status */}
      <div className="flex items-center gap-2">
        <div className={`text-xs ${
          apiKeyValid === true ? 'text-emerald-400' :
          apiKeyValid === false ? 'text-red-400' :
          'text-slate-500'
        }`}>
          {validationMessage ?? (
            apiKeyValid === true ? '✅ Chave válida' :
            apiKeyValid === false ? '❌ Chave inválida' :
            '— Status não verificado'
          )}
        </div>
        <button
          onClick={() => handleValidate(apiKey)}
          disabled={validating}
          className="btn-ghost text-xs py-1 px-2 ml-auto"
        >
          {validating ? '⏳ Validando…' : '🔄 Testar chave'}
        </button>
      </div>

      {/* Edit key */}
      {editing ? (
        <div className="space-y-2">
          <label className="label">Nova chave OpenRouter</label>
          <input
            type="text"
            value={draftKey}
            onChange={(e) => setDraftKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className="input font-mono text-xs"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!draftKey.trim()}
              className="btn-primary text-xs"
            >
              💾 Salvar e validar
            </button>
            <button
              onClick={() => { setEditing(false); setDraftKey(apiKey) }}
              className="btn-secondary text-xs"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setEditing(true)}
            className="btn-secondary text-xs"
          >
            ✏️ Alterar chave
          </button>
          <button
            onClick={handleRestoreDefault}
            className="btn-ghost text-xs"
            disabled={apiKey === DEFAULT_API_KEY}
          >
            🔄 Restaurar padrão
          </button>
        </div>
      )}

      {/* Info box */}
      <div className="bg-slate-700/30 border border-slate-700 rounded-lg p-3 text-xs text-slate-500 space-y-1.5">
        <div>🔒 <strong className="text-slate-400">Segurança:</strong> A chave é enviada no body das chamadas ao servidor local Express e injetada no header Authorization no backend. Nunca aparece em URLs ou em logs de rede do browser.</div>
        <div>💾 <strong className="text-slate-400">Persistência:</strong> Salva no <code>localStorage</code> do browser. Limpe os dados do browser para remover.</div>
        <div>🔑 <strong className="text-slate-400">Obter chave:</strong> <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">openrouter.ai/keys</a></div>
      </div>
    </div>
  )
}
