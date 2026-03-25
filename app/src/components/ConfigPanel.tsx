import { useState } from 'react'
import type { OpenRouterConfig, OpenRouterModel } from '../lib/types'
import { DEFAULT_CONFIG, STORAGE_KEYS } from '../lib/types'
import ModelSelector from './ModelSelector'

interface Props {
  config: OpenRouterConfig
  availableModels: OpenRouterModel[]
  modelsLoading: boolean
  onClose: () => void
  onSave: (config: OpenRouterConfig) => void
}

interface SectionProps {
  title: string
  tooltip?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function Section({ title, tooltip, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-700/40 hover:bg-slate-700/60 transition-colors text-left"
        title={tooltip}
      >
        <span className="text-sm font-medium text-slate-200">{title}</span>
        <span className="text-slate-500 text-xs">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="p-4 space-y-4 bg-slate-800/50">
          {children}
        </div>
      )}
    </div>
  )
}

interface SliderProps {
  label: string
  tooltip: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  disabled?: boolean
}

function SliderField({ label, tooltip, value, min, max, step, onChange, disabled }: SliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-slate-400" title={tooltip}>{label} <span className="text-slate-600">(?)</span></label>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-20 bg-slate-700 border border-slate-600 text-slate-300 rounded px-2 py-0.5 text-xs text-right"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full accent-sky-500 disabled:opacity-40"
      />
      <div className="flex justify-between text-xs text-slate-700 mt-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export default function ConfigPanel({ config, availableModels, modelsLoading, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<OpenRouterConfig>({ ...config })
  const [favoriteModels, setFavoriteModels] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITE_MODELS) ?? '[]') as string[] }
    catch { return [] }
  })

  function update<K extends keyof OpenRouterConfig>(key: K, value: OpenRouterConfig[K]) {
    setDraft(d => ({ ...d, [key]: value }))
  }

  function updateProvider(key: string, value: unknown) {
    setDraft(d => ({ ...d, provider: { ...d.provider, [key]: value } }))
  }

  function togglePlugin(id: string, enabled: boolean) {
    setDraft(d => {
      const basePlugin = id === 'web'
        ? { id: id as 'web', max_results: 3 }
        : { id: id as 'file-parser' | 'response-healing' | 'context-compression' }
      const plugins = enabled
        ? [...d.plugins.filter(p => p.id !== id), basePlugin]
        : d.plugins.filter(p => p.id !== id)
      return { ...d, plugins }
    })
  }

  function hasPlugin(id: string): boolean {
    return draft.plugins.some(p => p.id === id)
  }

  function handleSave() {
    onSave(draft)
    onClose()
  }

  function handleReset() {
    setDraft({ ...DEFAULT_CONFIG })
  }

  function handleToggleFavorite(modelId: string) {
    const next = favoriteModels.includes(modelId)
      ? favoriteModels.filter(m => m !== modelId)
      : [...favoriteModels, modelId]
    setFavoriteModels(next)
    localStorage.setItem(STORAGE_KEYS.FAVORITE_MODELS, JSON.stringify(next))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <div>
          <h2 className="text-base font-semibold text-slate-100">⚙️ Configurações</h2>
          <p className="text-xs text-slate-500 mt-0.5">Modelo, parâmetros, roteamento e plugins</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {/* ===== SETTINGS GUIDE ===== */}
        <Section title="📖 Guia de Configurações">
          <div className="space-y-4 text-xs text-slate-400 leading-relaxed">

            {/* Config defaults banner */}
            <div className="bg-sky-900/20 border border-sky-800/30 rounded-lg p-2.5">
              <p className="text-sky-300 font-medium text-[11px] mb-1">⚙️ Configuração padrão atual (otimizada para prompts Kling PAM.ON)</p>
              <p className="text-slate-500 text-[11px]">
                Modelo <code className="text-sky-400">claude-sonnet-4-5</code> · Temp <code className="text-sky-400">0.75</code> · Top P <code className="text-sky-400">0.9</code> · Top K <code className="text-sky-400">40</code> · Freq Pen <code className="text-sky-400">0.15</code> · Min P <code className="text-sky-400">0.05</code> · Max Tokens <code className="text-sky-400">2048</code> · data_collection <code className="text-sky-400">deny</code> · response-healing <code className="text-sky-400">ON</code>
              </p>
            </div>

            {/* Kling website clarification */}
            <div className="bg-amber-900/15 border border-amber-700/25 rounded-lg p-2.5">
              <p className="text-amber-300 font-medium text-[11px] mb-1">📌 Importante: este painel configura o LLM gerador de prompts — não o Kling</p>
              <p className="text-slate-500 text-[11px]">
                As configurações aqui definem como o <strong className="text-slate-300">Claude</strong> gera os prompts textuais.
                Já as configurações do <strong className="text-slate-300">Kling AI</strong> (modelo VIDEO 3.0, duração, resolução, áudio) são
                exibidas e gerenciadas no painel de cada clipe gerado (coluna direita), após clicar em "Gerar Prompt".
              </p>
            </div>

            <div>
              <h4 className="text-sky-400 font-medium mb-1">🤖 Modelo do LLM e Sufixos</h4>
              <p>O <strong className="text-slate-200">claude-sonnet-4-5</strong> é o padrão: excelente instrução-following para JSON estruturado, vocabulário cinematográfico rico, contexto 200K. Ideal para seguir a fórmula de 5 camadas do Kling.</p>
              <p className="mt-1">Sufixos de roteamento (modificam qual servidor processa a chamada):</p>
              <ul className="list-disc ml-4 mt-0.5 space-y-0.5">
                <li><code className="text-slate-200">:nitro</code> — Mais rápido, pode usar servidor de qualidade levemente inferior.</li>
                <li><code className="text-slate-200">:floor</code> — Mais barato, sem garantia de qualidade igual.</li>
                <li><code className="text-slate-200">:free</code> — Gratuito, resultados piores para linguagem cinematográfica.</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sky-400 font-medium mb-1">🎛️ Parâmetros de Geração do LLM</h4>
              <ul className="space-y-1.5">
                <li><strong className="text-slate-200">Temperature 0.75:</strong> Criativo o suficiente para variar vocabulário entre clipes (dolly, crane, whip-pan), estruturado o suficiente para produzir JSON válido sempre.</li>
                <li><strong className="text-slate-200">Top P 0.9:</strong> Corta tokens improváveis, melhora coerência do vocabulário cinematográfico.</li>
                <li><strong className="text-slate-200">Top K 40:</strong> Limita às 40 melhores opções — complementa Top P para saída confiável.</li>
                <li><strong className="text-slate-200">Frequency Penalty 0.15:</strong> Força variação de câmera entre clipes — evita que todos usem "tracking shot" e "dolly push".</li>
                <li><strong className="text-slate-200">Min P 0.05:</strong> Remove tokens muito improváveis sem "podar" criatividade como Top P às vezes faz.</li>
                <li><strong className="text-slate-200">Max Tokens 2048:</strong> Suficiente para o JSON completo (800–1200 tokens reais na prática).</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sky-400 font-medium mb-1">🔀 Roteamento de Providers (OpenRouter)</h4>
              <ul className="list-disc ml-4 space-y-0.5">
                <li><strong className="text-slate-200">data_collection: deny:</strong> Conteúdo PAM.ON é proprietário. Bloqueia uso do material para treinamento de modelos pelos providers.</li>
                <li><strong className="text-slate-200">allow_fallbacks: true:</strong> Se a Anthropic estiver fora do ar, tenta automaticamente AWS Bedrock ou equivalente.</li>
                <li><strong className="text-slate-200">Sort (Padrão):</strong> OpenRouter balanceia preço e disponibilidade automaticamente para o modelo selecionado.</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sky-400 font-medium mb-1">🔌 Response Healing (sempre ativo)</h4>
              <p>Claude 4.x ocasionalmente omite vírgulas ou fecha chaves incorretamente em JSONs longos. Este plugin repara automaticamente antes de entregar ao app — salva ~5-10% das gerações que falhariam no parsing.</p>
            </div>
          </div>
        </Section>

        {/* ===== MODEL SELECTOR ===== */}
        <Section title="🤖 Modelo" defaultOpen={true}>
          {/* Model suffix */}
          <div>
            <label className="label">Sufixo de roteamento</label>
            <div className="flex flex-wrap gap-2">
              {(['', ':nitro', ':floor', ':free'] as const).map(suffix => (
                <button
                  key={suffix}
                  onClick={() => update('modelSuffix', suffix)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    draft.modelSuffix === suffix
                      ? 'border-sky-500 bg-sky-900/30 text-sky-300'
                      : 'border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {suffix === '' ? 'Padrão' : suffix}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-600 mt-1.5">
              {draft.modelSuffix === ':nitro' && '⚡ Prioriza throughput (velocidade)'}
              {draft.modelSuffix === ':floor' && '💰 Prioriza menor preço'}
              {draft.modelSuffix === ':free' && '🆓 Apenas endpoints gratuitos'}
              {draft.modelSuffix === '' && '⚖️ Balanceamento padrão OpenRouter'}
            </div>
          </div>

          <ModelSelector
            selectedModel={draft.model}
            models={availableModels}
            loading={modelsLoading}
            favoriteModels={favoriteModels}
            onSelect={(id) => update('model', id)}
            onToggleFavorite={handleToggleFavorite}
          />
        </Section>

        {/* ===== SAMPLING PARAMETERS ===== */}
        <Section title="🎛️ Parâmetros de Geração">
          <SliderField
            label="Temperatura (Temperature)"
            tooltip="Controla a criatividade. Menor = mais previsível e focado; maior = mais criativo e variado. Recomendado: 0.7 a 1.0."
            value={draft.temperature}
            min={0} max={2} step={0.05}
            onChange={(v) => update('temperature', v)}
          />
          <SliderField
            label="Top P (Nucleus sampling)"
            tooltip="Considera apenas as palavras com probabilidade acumulada até P. 1.0 = desabilitado (considera todas)."
            value={draft.top_p}
            min={0} max={1} step={0.05}
            onChange={(v) => update('top_p', v)}
          />
          <SliderField
            label="Top K (0 = desabilitado)"
            tooltip="Limita a seleção às K palavras mais prováveis. 0 = desabilitado."
            value={draft.top_k}
            min={0} max={100} step={1}
            onChange={(v) => update('top_k', v)}
          />
          <SliderField
            label="Penalidade de Frequência (Frequency Penalty)"
            tooltip="Penaliza palavras que já aparecem frequentemente no texto. Reduz repetições de palavras comuns."
            value={draft.frequency_penalty}
            min={-2} max={2} step={0.1}
            onChange={(v) => update('frequency_penalty', v)}
          />
          <SliderField
            label="Penalidade de Presença (Presence Penalty)"
            tooltip="Penaliza palavras que já apareceram pelo menos uma vez. Encoraja a IA a falar sobre novos tópicos."
            value={draft.presence_penalty}
            min={-2} max={2} step={0.1}
            onChange={(v) => update('presence_penalty', v)}
          />
          <SliderField
            label="Penalidade de Repetição (Repetition Penalty)"
            tooltip="Penaliza repetições em geral. 1.0 = neutro. Útil para modelos open-source evitarem loops."
            value={draft.repetition_penalty}
            min={0.5} max={2} step={0.05}
            onChange={(v) => update('repetition_penalty', v)}
          />
          <SliderField
            label="Min P (0 = desabilitado)"
            tooltip="Probabilidade mínima relativa à palavra mais provável. Remove opções muito improváveis de forma dinâmica."
            value={draft.min_p}
            min={0} max={1} step={0.05}
            onChange={(v) => update('min_p', v)}
          />
          <SliderField
            label="Top A (0 = desabilitado)"
            tooltip="Top-A dinâmico: remove opções improváveis baseado na confiança da IA na melhor opção."
            value={draft.top_a}
            min={0} max={1} step={0.05}
            onChange={(v) => update('top_a', v)}
          />

          {/* Max tokens */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-400" title="Máximo de tokens na resposta. 2000 é suficiente para o JSON de prompt.">
                Max Tokens <span className="text-slate-600">(?)</span>
              </label>
              <input
                type="number"
                value={draft.max_tokens}
                min={100}
                max={8000}
                step={100}
                onChange={(e) => update('max_tokens', parseInt(e.target.value))}
                className="w-24 bg-slate-700 border border-slate-600 text-slate-300 rounded px-2 py-0.5 text-xs text-right"
              />
            </div>
          </div>

          {/* Seed */}
          <div>
            <label className="label" title="Semente para reprodutibilidade. Deixe vazio para resultados variados.">
              Seed (vazio = aleatório) <span className="text-slate-600">(?)</span>
            </label>
            <input
              type="number"
              value={draft.seed ?? ''}
              placeholder="Nenhum (aleatório)"
              onChange={(e) => update('seed', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input"
            />
          </div>

          {/* Stop sequences */}
          <div>
            <label className="label" title="Sequências de texto que fazem o modelo parar de gerar.">
              Stop sequences (uma por linha) <span className="text-slate-600">(?)</span>
            </label>
            <textarea
              value={draft.stop.join('\n')}
              placeholder="Deixe vazio para não usar"
              onChange={(e) => update('stop', e.target.value ? e.target.value.split('\n').filter(s => s.trim()) : [])}
              className="textarea text-xs"
              rows={2}
            />
          </div>
        </Section>

        {/* ===== PROVIDER ROUTING ===== */}
        <Section title="🔀 Roteamento de Providers">
          {/* Sort */}
          <div>
            <label className="label" title="Como o OpenRouter deve escolher entre diferentes servidores que oferecem o mesmo modelo.">
              Ordenação de providers (Sort) <span className="text-slate-600">(?)</span>
            </label>
            <select
              value={draft.provider.sort ?? 'default'}
              onChange={(e) => updateProvider('sort', e.target.value)}
              className="select"
            >
              <option value="default">⚖️ Balanceamento padrão (OpenRouter)</option>
              <option value="price">💰 Menor preço primeiro</option>
              <option value="throughput">⚡ Maior velocidade (Tokens/s)</option>
              <option value="latency">🚀 Menor latência (Tempo de resposta)</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            {[
              { key: 'allow_fallbacks', label: 'Permitir Fallbacks (Recomendado)', tooltip: 'Se o servidor principal estiver offline, tenta outros automaticamente para não interromper o serviço.' },
              { key: 'require_parameters', label: 'Exigir suporte a parâmetros', tooltip: 'Usa apenas servidores que suportam todos os parâmetros configurados acima (ex: Top K).' },
              { key: 'zdr', label: 'Zero Data Retention (ZDR)', tooltip: 'Privacidade total: usa apenas servidores que garantem não armazenar seus dados.' },
            ].map(({ key, label, tooltip }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer" title={tooltip}>
                <input
                  type="checkbox"
                  checked={Boolean(draft.provider[key as keyof typeof draft.provider])}
                  onChange={(e) => updateProvider(key, e.target.checked)}
                  className="accent-sky-500"
                />
                <span className="text-xs text-slate-400">{label} <span className="text-slate-600">(?)</span></span>
              </label>
            ))}
          </div>

          {/* Data collection */}
          <div>
            <label className="label" title="Controla se providers que coletam dados para treinamento são permitidos.">
              Coleta de dados <span className="text-slate-600">(?)</span>
            </label>
            <select
              value={draft.provider.data_collection ?? 'allow'}
              onChange={(e) => updateProvider('data_collection', e.target.value)}
              className="select"
            >
              <option value="allow">Permitir (padrão)</option>
              <option value="deny">Negar (somente providers sem coleta)</option>
            </select>
          </div>

          {/* Quantizations */}
          <div>
            <label className="label" title="Filtra por quantização do modelo. Deixe vazio para aceitar qualquer.">
              Quantizações aceitas <span className="text-slate-600">(?)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['int4', 'int8', 'fp8', 'fp16', 'bf16', 'fp32'].map(q => {
                const selected = draft.provider.quantizations?.includes(q) ?? false
                return (
                  <button
                    key={q}
                    onClick={() => {
                      const current = draft.provider.quantizations ?? []
                      updateProvider('quantizations', selected
                        ? current.filter(x => x !== q)
                        : [...current, q]
                      )
                    }}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      selected
                        ? 'border-sky-500 bg-sky-900/30 text-sky-300'
                        : 'border-slate-600 text-slate-500 hover:border-slate-500'
                    }`}
                  >
                    {q}
                  </button>
                )
              })}
              {(draft.provider.quantizations?.length ?? 0) > 0 && (
                <button
                  onClick={() => updateProvider('quantizations', [])}
                  className="text-xs text-slate-600 hover:text-slate-400 px-2 py-1"
                >
                  Limpar
                </button>
              )}
            </div>
            {(draft.provider.quantizations?.length ?? 0) === 0 && (
              <div className="text-xs text-slate-600 mt-1">Qualquer quantização aceita</div>
            )}
          </div>

          {/* Max price */}
          <div>
            <label className="label" title="Preço máximo por milhão de tokens. Deixe vazio para sem limite.">
              Preço máximo ($/M tokens) <span className="text-slate-600">(?)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-slate-600 mb-1">Input</div>
                <input
                  type="number"
                  placeholder="Sem limite"
                  min={0}
                  step={0.1}
                  value={draft.provider.max_price?.prompt ?? ''}
                  onChange={(e) => updateProvider('max_price', {
                    ...draft.provider.max_price,
                    prompt: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="input text-xs"
                />
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">Output</div>
                <input
                  type="number"
                  placeholder="Sem limite"
                  min={0}
                  step={0.1}
                  value={draft.provider.max_price?.completion ?? ''}
                  onChange={(e) => updateProvider('max_price', {
                    ...draft.provider.max_price,
                    completion: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  className="input text-xs"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ===== PLUGINS ===== */}
        <Section title="🔌 Plugins">
          <div className="space-y-3">
            {[
              {
                id: 'response-healing',
                label: 'Correção de Resposta (Response Healing)',
                desc: 'Tenta corrigir automaticamente erros de sintaxe no JSON gerado pela IA. Essencial para o funcionamento do app.',
                recommended: true,
              },
              {
                id: 'context-compression',
                label: 'Compressão de Contexto',
                desc: 'Comprime o histórico e instruções para economizar tokens em conversas longas.',
                recommended: false,
              },
              {
                id: 'web',
                label: 'Busca Web (Web Search)',
                desc: 'Quando ativado, o Claude pesquisa na web ANTES de gerar o prompt — ideal para equipamentos técnicos específicos (tacógrafo digital, ERP, limitadores de velocidade). Permite descrever o equipamento real com precisão visual, não genérica. Recomendado para clipes com equipamentos menos conhecidos.',
                recommended: false,
              },
              {
                id: 'file-parser',
                label: 'Leitor de Arquivos (File Parser)',
                desc: 'Permite que a IA leia PDFs e documentos enviados via link.',
                recommended: false,
              },
            ].map(({ id, label, desc, recommended }) => (
              <label key={id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPlugin(id)}
                  onChange={(e) => togglePlugin(id, e.target.checked)}
                  className="accent-sky-500 mt-0.5"
                />
                <div>
                  <div className="text-xs text-slate-300 flex items-center gap-1.5">
                    {label}
                    {recommended && <span className="tag-green text-[10px]">Recomendado</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </Section>

        {/* ===== RESPONSE FORMAT ===== */}
        <Section title="📋 Formato de Resposta">
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.response_format.type === 'json_object'}
                onChange={(e) => update('response_format', {
                  type: e.target.checked ? 'json_object' : 'text'
                })}
                className="accent-sky-500 mt-0.5"
              />
              <div>
                <div className="text-xs text-slate-300">Forçar Modo JSON</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Ativa o <code className="text-sky-400">json_object</code> nativo do provider.
                  <strong className="text-amber-400"> OBRIGATÓRIO:</strong> O app depende de uma resposta estruturada para exibir os prompts.
                </div>
              </div>
            </label>
          </div>
        </Section>

      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 gap-3">
        <button onClick={handleReset} className="btn-ghost text-xs">
          ↩️ Restaurar padrões
        </button>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} className="btn-primary">💾 Salvar</button>
        </div>
      </div>
    </div>
  )
}
