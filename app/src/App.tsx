import { useState, useEffect, useCallback } from 'react'
import { parseScriptJson, parseScript } from './lib/jsonParser'
import { buildUserPrompt, parseGeneratedPrompt } from './lib/promptTemplate'
import { SYSTEM_PROMPT } from './lib/systemPrompt'
import {
  DEFAULT_CONFIG,
  DEFAULT_API_KEY,
  STORAGE_KEYS,
  type BRollClip,
  type OpenRouterConfig,
  type OpenRouterModel,
  type GeneratedPrompt,
} from './lib/types'
import JsonUploader from './components/JsonUploader'
import ThemeContextPanel from './components/ThemeContext'
import VideoBlockList from './components/VideoBlockList'
import PromptEditor from './components/PromptEditor'
import PromptExporter from './components/PromptExporter'
import ConfigPanel from './components/ConfigPanel'
import ApiKeyManager from './components/ApiKeyManager'

// ============================================================
// App — Main State and Orchestration
// ============================================================

export default function App() {
  // ----- Script / Clips State -----
  const [scriptTitle, setScriptTitle] = useState('')
  const [themeContext, setThemeContext] = useState('')
  const [clips, setClips] = useState<BRollClip[]>([])
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)

  // ----- API / Config State -----
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY)
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null)
  const [config, setConfig] = useState<OpenRouterConfig>(DEFAULT_CONFIG)

  // ----- Models State -----
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)

  // ----- UI State -----
  const [configOpen, setConfigOpen] = useState(false)
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // ----- Load persisted settings -----
  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY)
    if (savedKey) setApiKey(savedKey)

    const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG)
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig) as OpenRouterConfig
        // Deep merge: ensure new DEFAULT_CONFIG fields (e.g. data_collection, top_k, min_p)
        // are applied even when an old stored config is present
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          // Deep merge nested objects so new defaults don't get wiped by old stored values
          provider: { ...DEFAULT_CONFIG.provider, ...(parsed.provider ?? {}) },
          plugins: parsed.plugins?.length ? parsed.plugins : DEFAULT_CONFIG.plugins,
        })
      } catch { /* ignore */ }
    }
  }, [])

  // ----- Fetch models on mount -----
  useEffect(() => {
    fetchModels()
  }, [apiKey]) // re-fetch when key changes

  async function fetchModels() {
    setModelsLoading(true)
    try {
      const res = await fetch('/api/models', {
        headers: { 'x-api-key': apiKey },
      })
      if (res.ok) {
        const data = await res.json() as { data?: OpenRouterModel[] }
        if (Array.isArray(data.data)) {
          setAvailableModels(data.data)
        }
      }
    } catch { /* silent fail */ }
    finally { setModelsLoading(false) }
  }

  // ----- JSON Upload Handler -----
  function handleJsonUpload(jsonString: string) {
    setUploadError(null)
    try {
      const jsonData = parseScriptJson(jsonString)
      const { title, themeContext: ctx, clips: parsedClips } = parseScript(jsonData)
      setScriptTitle(title)
      setThemeContext(ctx)
      setClips(parsedClips)
      setSelectedClipId(parsedClips[0]?.id ?? null)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro ao processar o arquivo')
    }
  }

  // ----- Generate single clip -----
  const generateClip = useCallback(async (clipId: string) => {
    const clip = clips.find(c => c.id === clipId)
    if (!clip) return

    setClips(prev => prev.map(c =>
      c.id === clipId ? { ...c, status: 'generating', error: undefined } : c
    ))

    const fullModel = config.model + config.modelSuffix
    const userText = buildUserPrompt(scriptTitle, themeContext, clip)

    // Build messages: multimodal (vision) when imageReference is provided
    const userMessageContent = clip.imageReference
      ? [
          { type: 'text' as const, text: userText },
          {
            type: 'image_url' as const,
            image_url: { url: clip.imageReference, detail: 'high' as const },
          },
        ]
      : userText

    const requestBody = {
      apiKey,
      model: fullModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessageContent },
      ],
      temperature: config.temperature,
      top_p: config.top_p,
      top_k: config.top_k > 0 ? config.top_k : undefined,
      frequency_penalty: config.frequency_penalty,
      presence_penalty: config.presence_penalty,
      repetition_penalty: config.repetition_penalty !== 1 ? config.repetition_penalty : undefined,
      min_p: config.min_p > 0 ? config.min_p : undefined,
      top_a: config.top_a > 0 ? config.top_a : undefined,
      seed: config.seed,
      max_tokens: config.max_tokens,
      stop: config.stop.length > 0 ? config.stop : undefined,
      response_format: config.response_format,
      provider: config.provider,
      plugins: config.plugins.length > 0 ? config.plugins : undefined,
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await res.json() as {
        error?: string
        choices?: Array<{ message: { content: string } }>
      }

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `Erro HTTP ${res.status}`)
      }

      const content = data.choices?.[0]?.message?.content ?? ''
      if (!content) throw new Error('Resposta vazia da IA')

      const generated = parseGeneratedPrompt(content)

      setClips(prev => prev.map(c =>
        c.id === clipId
          ? { ...c, status: 'done', generatedPrompt: generated }
          : c
      ))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setClips(prev => prev.map(c =>
        c.id === clipId ? { ...c, status: 'error', error: message } : c
      ))
    }
  }, [apiKey, clips, config, scriptTitle, themeContext])

  // ----- Generate all selected clips -----
  async function generateAll() {
    const toGenerate = clips.filter(c => c.selected && c.status !== 'generating')
    if (toGenerate.length === 0) return

    setIsGeneratingAll(true)
    for (const clip of toGenerate) {
      await generateClip(clip.id)
    }
    setIsGeneratingAll(false)
  }

  // ----- Update a clip's narration/visual ref (user edit) -----
  function updateClip(clipId: string, updates: Partial<BRollClip>) {
    setClips(prev => prev.map(c => c.id === clipId ? { ...c, ...updates } : c))
  }

  // ----- Update generated prompt (user edit) -----
  function updateGeneratedPrompt(clipId: string, updates: Partial<GeneratedPrompt>) {
    setClips(prev => prev.map(c =>
      c.id === clipId && c.generatedPrompt
        ? { ...c, generatedPrompt: { ...c.generatedPrompt, ...updates } }
        : c
    ))
  }

  // ----- Save config to localStorage -----
  function saveConfig(newConfig: OpenRouterConfig) {
    setConfig(newConfig)
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig))
  }

  // ----- Save API key -----
  function saveApiKey(key: string) {
    setApiKey(key)
    localStorage.setItem(STORAGE_KEYS.API_KEY, key)
    setApiKeyValid(null)
  }

  // ----- Derived state -----
  const selectedClip = clips.find(c => c.id === selectedClipId) ?? null
  const doneCount = clips.filter(c => c.status === 'done').length
  const totalSelected = clips.filter(c => c.selected).length

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      {/* ===== HEADER ===== */}
      <header className="flex-none flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gradient">🎬 Kling Prompter</span>
          <span className="text-slate-600 text-sm hidden sm:block">PAM.ON</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfigOpen(true)}
            className="btn-ghost"
            title="Configurações avançadas"
          >
            ⚙️ <span className="hidden md:inline">Config</span>
          </button>
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className={`btn-ghost ${apiKeyValid === false ? 'text-red-400' : apiKeyValid === true ? 'text-emerald-400' : ''}`}
            title="Gerenciar API Key"
          >
            🔑 <span className="hidden md:inline">API Key</span>
            {apiKeyValid === true && <span className="text-emerald-400">✓</span>}
            {apiKeyValid === false && <span className="text-red-400">✗</span>}
          </button>
        </div>
      </header>

      {/* ===== MAIN 3-COLUMN LAYOUT ===== */}
      <main className="flex-1 flex overflow-hidden">

        {/* ===== COLUMN 1 — Upload + Context ===== */}
        <div className="w-72 flex-none flex flex-col border-r border-slate-700 overflow-hidden">
          {clips.length === 0 ? (
            <div className="flex-1 flex flex-col p-3">
              <JsonUploader
                onUpload={handleJsonUpload}
                error={uploadError}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ThemeContextPanel
                title={scriptTitle}
                context={themeContext}
                clipCount={clips.length}
                onReset={() => {
                  setClips([])
                  setScriptTitle('')
                  setThemeContext('')
                  setSelectedClipId(null)
                  setUploadError(null)
                }}
              />
              {/* Re-upload area below context when already uploaded */}
              <div className="p-3 border-t border-slate-700">
                <JsonUploader
                  onUpload={handleJsonUpload}
                  error={uploadError}
                  compact
                />
              </div>
            </div>
          )}
        </div>

        {/* ===== COLUMN 2 — B-roll clip cards ===== */}
        <div className="w-80 flex-none flex flex-col border-r border-slate-700 overflow-hidden">
          {clips.length > 0 ? (
            <VideoBlockList
              clips={clips}
              selectedClipId={selectedClipId}
              isGeneratingAll={isGeneratingAll}
              onSelectClip={setSelectedClipId}
              onGenerateClip={generateClip}
              onGenerateAll={generateAll}
              onUpdateClip={updateClip}
              onToggleSelect={(id) => updateClip(id, { selected: !clips.find(c => c.id === id)?.selected })}
              doneCount={doneCount}
              totalSelected={totalSelected}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600">
              <div className="text-center p-6">
                <div className="text-4xl mb-3">🎞️</div>
                <div className="text-sm">Faça upload de um roteiro JSON<br />para ver os clipes B-roll</div>
              </div>
            </div>
          )}
        </div>

        {/* ===== COLUMN 3 — Prompt Editor + Exporter ===== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedClip ? (
            <>
              <PromptEditor
                clip={selectedClip}
                onUpdatePrompt={(updates) => updateGeneratedPrompt(selectedClip.id, updates)}
                onUpdateClip={(updates) => updateClip(selectedClip.id, updates)}
                onRegenerate={() => generateClip(selectedClip.id)}
              />
              {clips.filter(c => c.status === 'done').length > 0 && (
                <div className="flex-none border-t border-slate-700 p-3">
                  <PromptExporter
                    clips={clips}
                    scriptTitle={scriptTitle}
                    modelId={config.model + config.modelSuffix}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600">
              <div className="text-center p-8">
                <div className="text-5xl mb-4">✨</div>
                <div className="text-sm leading-relaxed">
                  {clips.length > 0
                    ? 'Selecione um clipe na lista\ne clique em "Gerar Prompt"'
                    : 'Faça upload do JSON do roteiro\npara começar'
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="flex-none flex items-center justify-between px-4 py-1.5 bg-slate-800 border-t border-slate-700 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>Modelo: <span className="text-slate-400">{config.model}{config.modelSuffix || ''}</span></span>
          <span className="text-slate-700">|</span>
          <span>Temp: <span className="text-slate-400">{config.temperature}</span></span>
        </div>
        <div className="flex items-center gap-3">
          {clips.length > 0 && (
            <span>{doneCount}/{clips.length} prompts gerados</span>
          )}
          <span className="text-slate-700">|</span>
          <span>
            {modelsLoading
              ? '⏳ Carregando modelos...'
              : `${availableModels.length} modelos disponíveis`
            }
          </span>
        </div>
      </footer>

      {/* ===== MODALS ===== */}
      {configOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfigOpen(false)}
          />
          <div className="relative w-full max-w-xl h-full bg-slate-800 shadow-2xl border-l border-slate-700 overflow-y-auto">
            <ConfigPanel
              config={config}
              availableModels={availableModels}
              modelsLoading={modelsLoading}
              onClose={() => setConfigOpen(false)}
              onSave={saveConfig}
            />
          </div>
        </div>
      )}

      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setApiKeyModalOpen(false)}
          />
          <div className="relative w-full max-w-md mx-4">
            <ApiKeyManager
              apiKey={apiKey}
              apiKeyValid={apiKeyValid}
              onSave={saveApiKey}
              onValidate={setApiKeyValid}
              onClose={() => setApiKeyModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
