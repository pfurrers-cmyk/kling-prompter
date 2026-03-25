import { useState } from 'react'
import type { BRollClip, GeneratedPrompt } from '../lib/types'

interface Props {
  gp: GeneratedPrompt
  clip: BRollClip
}

function Step({
  num,
  title,
  children,
}: {
  num: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-none w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {num}
      </div>
      <div className="flex-1 pb-4 border-b border-slate-700/50 last:border-0">
        <div className="text-xs font-semibold text-slate-200 mb-1.5">{title}</div>
        <div className="text-xs text-slate-400 leading-relaxed space-y-1">{children}</div>
      </div>
    </div>
  )
}

function Tag({ children, color = 'sky' }: { children: React.ReactNode; color?: 'sky' | 'amber' | 'green' | 'slate' }) {
  const colors = {
    sky: 'bg-sky-900/40 border-sky-700/40 text-sky-300',
    amber: 'bg-amber-900/40 border-amber-700/40 text-amber-300',
    green: 'bg-emerald-900/40 border-emerald-700/40 text-emerald-300',
    slate: 'bg-slate-700/40 border-slate-600/40 text-slate-300',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border font-medium font-mono text-[11px] ${colors[color]}`}>
      {children}
    </span>
  )
}

function SettingRow({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-slate-700/30 last:border-0 gap-3">
      <span className="text-slate-500 text-[11px] flex-none">{label}</span>
      <div className="text-right">
        <div>{value}</div>
        {note && <div className="text-[10px] text-slate-600 mt-0.5">{note}</div>}
      </div>
    </div>
  )
}

export default function KlingWorkflowGuide({ gp, clip }: Props) {
  const [open, setOpen] = useState(false)
  const clipNumber = clip.clipNumber

  const durationSeconds = parseInt(gp.duration_recommendation.replace('s', ''))
  const is1080p = gp.resolution_recommendation.includes('1080p')
  const audioOn = gp.audio_recommendation === 'on'

  // Official pricing from Kling user guide
  const creditsPerSec720pNoAudio = 6
  const creditsPerSec1080pNoAudio = 8
  const creditsPerSec720pAudio = 9
  const creditsPerSec1080pAudio = 12

  const testCredits = 5 * creditsPerSec720pNoAudio // always 720p/5s/no audio for test
  const finalRate = is1080p
    ? (audioOn ? creditsPerSec1080pAudio : creditsPerSec1080pNoAudio)
    : (audioOn ? creditsPerSec720pAudio : creditsPerSec720pNoAudio)
  const finalCredits = durationSeconds * finalRate

  const motionLabel =
    gp.motion_intensity <= 0.5 ? 'sutil (câmera lenta/close-up estático)'
    : gp.motion_intensity <= 1.2 ? 'moderado (ação controlada)'
    : gp.motion_intensity <= 2.0 ? 'energético (ação rápida)'
    : 'intenso (ação dinâmica)'

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/30">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-700/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🎬</span>
          <span className="text-xs font-semibold text-slate-200">Como gerar este clipe no Kling AI</span>
          <span className="tag-blue text-[10px]">Passo a passo</span>
        </div>
        <span className="text-slate-500 text-xs">{open ? '▼' : '▶'}</span>
      </button>

      {open && (
        <div className="border-t border-slate-700 p-4">

          {/* Quick settings summary */}
          <div className="mb-5 bg-slate-900/60 border border-sky-800/30 rounded-lg p-3">
            <div className="text-xs font-semibold text-sky-400 mb-2">
              ⚙️ Configurações para o B-roll #{clipNumber}
            </div>
            <SettingRow
              label="Modelo"
              value={<Tag color={gp.model_recommendation === 'VIDEO 3.0 Omni' ? 'amber' : 'sky'}>{gp.model_recommendation}</Tag>}
              note={gp.model_recommendation === 'VIDEO 3.0 Omni' ? 'Use para Elements ou Áudio nativo com voz' : 'Recomendado para B-roll padrão'}
            />
            <SettingRow
              label="Qualidade (Mode)"
              value={<Tag color="slate">{gp.resolution_recommendation}</Tag>}
              note="Selecione no dropdown junto ao modelo"
            />
            <SettingRow
              label="Duração"
              value={<Tag color="slate">{gp.duration_recommendation}</Tag>}
              note="Selecione no dropdown de configurações"
            />
            <SettingRow
              label="Ratio"
              value={<Tag color="slate">16:9</Tag>}
              note="Sempre para vídeo B-roll"
            />
            <SettingRow
              label="Output"
              value={<Tag color="slate">1</Tag>}
              note="1 variação por geração"
            />
            <SettingRow
              label="Native Audio"
              value={<Tag color={audioOn ? 'amber' : 'slate'}>{audioOn ? 'ON' : 'OFF'}</Tag>}
              note={audioOn ? 'Áudio nativo recomendado para este clipe' : 'Sem áudio — adicionar em pós-produção'}
            />
            <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-between text-[11px]">
              <span className="text-slate-500">Custo: teste (720p/5s/sem áudio) → final ({gp.resolution_recommendation}/{gp.duration_recommendation}/{gp.audio_recommendation === 'on' ? 'áudio' : 'sem áudio'})</span>
              <span className="text-amber-400">{testCredits} → <span className="text-sky-400 font-semibold">{finalCredits} créditos</span></span>
            </div>
          </div>

          {/* Contexto sobre Multi-Shot */}
          <div className="mb-4 bg-amber-900/10 border border-amber-700/20 rounded-lg p-3 text-xs text-amber-300/80">
            <p className="font-semibold mb-1">📌 Cada clipe B-roll = geração separada</p>
            <p className="text-amber-300/60">O <strong className="text-amber-300">Custom Multi-Shot</strong> cria múltiplas cenas dentro do mesmo vídeo (máx. 6 shots, 10s total). Para B-roll de videoaulas, cada clipe é um <strong className="text-amber-300">vídeo independente</strong> — use <strong className="text-amber-300">Text to Video padrão</strong>, não Multi-Shot.</p>
          </div>

          {/* Steps */}
          <div className="space-y-0">
            <Step num={1} title="Acesse o Kling AI">
              <p>Abra <a href="https://app.klingai.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">app.klingai.com</a> e clique em <strong className="text-slate-300">Generate</strong> na barra lateral esquerda.</p>
              <p>Certifique-se que está na aba <strong className="text-slate-300">Video Generation</strong> (não Image Generation).</p>
            </Step>

            <Step num={2} title="Selecione o modelo">
              <p>No rodapé da página, clique no primeiro dropdown <Tag color="slate">VIDEO 3...</Tag> e selecione <Tag color="sky">{gp.model_recommendation}</Tag>.</p>
              {gp.model_recommendation === 'VIDEO 3.0' ? (
                <p className="text-slate-500 text-[11px] mt-1">VIDEO 3.0: melhor qualidade para B-roll padrão sem personagens recorrentes.</p>
              ) : (
                <p className="text-amber-300/80 text-[11px] mt-1">🔊 VIDEO 3.0 Omni: use quando precisar de consistência de personagens via Elements 3.0 ou áudio nativo com voz/lip-sync.</p>
              )}
            </Step>

            <Step num={3} title="Configure as opções de geração">
              <p>Clique no segundo dropdown <Tag color="slate">720p...</Tag> para abrir as configurações:</p>
              <div className="bg-slate-800 rounded-lg p-2 mt-1 space-y-1">
                <div className="flex justify-between text-[11px]"><span className="text-slate-500">Mode (qualidade):</span><Tag color="slate">{gp.resolution_recommendation.replace(' (test)', '').replace(' (final)', '')}</Tag></div>
                <div className="flex justify-between text-[11px]"><span className="text-slate-500">Duration:</span><Tag color="slate">{gp.duration_recommendation}</Tag></div>
                <div className="flex justify-between text-[11px]"><span className="text-slate-500">Ratio:</span><Tag color="slate">16:9</Tag></div>
                <div className="flex justify-between text-[11px]"><span className="text-slate-500">Output:</span><Tag color="slate">1</Tag></div>
              </div>
              <p className="text-[10px] text-slate-600 mt-1">💡 Comece sempre com 720p para validar o prompt com custo menor. Use 1080p apenas para o render final aprovado.</p>
            </Step>

            <Step num={4} title="Configure o Native Audio">
              <p>No rodapé, localize o botão <Tag color="slate">Native Audio</Tag> e défina como <Tag color={audioOn ? 'amber' : 'slate'}>{audioOn ? 'ON' : 'OFF'}</Tag>.</p>
              {!audioOn && (
                <p className="text-slate-500 text-[11px] mt-1">Para B-roll educativo, áudio nativo deve ficar <strong>OFF</strong> — trilha sonora e narração são adicionadas em pós-produção no editor de vídeo.</p>
              )}
            </Step>

            {/* Image/Subject Reference — only shown when imageReference is provided */}
            {clip.imageReference && (
              <Step num={5} title="⭐ Use a Imagem como Referência Visual no Kling (recomendado)">
                <p className="text-emerald-300/80 font-medium">Você forneceu uma imagem de referência — o Claude a analisou para criar um prompt mais preciso. Use a mesma imagem como âncora visual no Kling:</p>
                <div className="bg-slate-800 rounded p-2 mt-1 space-y-1">
                  <p>1. Na área de upload acima do campo de texto, clique em <strong className="text-slate-300">Image/Video</strong> (+)</p>
                  <p>2. Ou use a aba <strong className="text-slate-300">Image/Subject Reference</strong> na barra superior do painel</p>
                  <p>3. Cole a URL da imagem ou faça upload do arquivo</p>
                  <p className="text-[10px] text-slate-600 mt-1">URL da imagem usada: <a href={clip.imageReference} target="_blank" rel="noopener noreferrer" className="text-sky-500 underline break-all">{clip.imageReference}</a></p>
                </div>
                <p className="text-emerald-300/60 text-[10px] mt-1">Com a imagem como âncora + o prompt gerado, o Kling produz resultados muito mais fieis ao equipamento real do que Text to Video puro.</p>
              </Step>
            )}

            <Step num={clip.imageReference ? 6 : 5} title="Cole o Prompt Principal (campo de texto principal)">
              <p>No campo de texto principal, cole o conteúdo do <strong className="text-slate-300">"Prompt principal"</strong> acima (em inglês).</p>
              <div className="bg-slate-800 rounded p-2 mt-1 text-[10px] text-slate-500">
                <div className="text-amber-300/80 mb-0.5">⚠️ Atenção:</div>
                <div>• A primeira frase DEVE ser a instrução de câmera: <em>{gp.camera_movement}</em></div>
                <div>• Não altere a ordem das 5 camadas do prompt</div>
                <div>• Não traduza — o modelo funciona melhor em inglês</div>
              </div>
              <div className="mt-1 text-[10px] text-slate-600">
                Este prompt descreve movimento com intensidade: <Tag color="slate">{gp.motion_intensity}</Tag> ({motionLabel})
                <br/>Esta intensidade foi embutida na <em>linguagem do prompt</em> — não é um controle separado no site.
              </div>
            </Step>

            <Step num={6} title="Adicione o Negative Prompt (se disponível)">
              <p>Procure o campo ou botão de <strong className="text-slate-300">Negative Prompt</strong> próximo ao campo principal (pode estar oculto ou recolhido).</p>
              <p>Cole as keywords do campo "Negative Prompt" acima — <strong className="text-slate-300">separadas por vírgula, sem "no" ou "not"</strong> antes de cada palavra.</p>
              <p className="text-[10px] text-slate-600">Se o campo não aparecer visível, verifique se há um botão "+" ou "Negative" expandível abaixo do campo de prompt principal.</p>
            </Step>

            <Step num={7} title="Gere e avalie o resultado">
              <p>Clique em <strong className="text-slate-300 text-sm">Generate</strong> (botão verde). A geração em 720p/5s demora tipicamente 30–90 segundos.</p>
              <div className="bg-slate-800 rounded p-2 mt-1 text-[11px] space-y-1">
                <div className="text-slate-400 font-medium mb-1">Checklist de aprovação:</div>
                <div className="text-slate-500">☐ Câmera se move como especificado ({gp.camera_movement})</div>
                <div className="text-slate-500">☐ Ação condiz com o que a narração descreve</div>
                <div className="text-slate-500">☐ Contexto visual correto (rodovia BR, caminhão, ambiente certo)</div>
                <div className="text-slate-500">☐ Sem artefatos: rostos sorridentes, pés deslizando, membros flutuando</div>
                <div className="text-slate-500">☐ Textura realista (não parece 3D render/plástico)</div>
                <div className="text-slate-500">☐ Nenhuma mensagem de texto indesejada no frame</div>
              </div>
            </Step>

            <Step num={8} title="Iteração e render final">
              <p>Se aprovado em 720p/5s → regenere em <Tag color="sky">1080p</Tag> + duração final (<Tag color="sky">{gp.duration_recommendation}</Tag>) para o vídeo final.</p>
              <p className="text-[10px] text-slate-500 mt-1">Custo final: <strong className="text-sky-400">{finalCredits} créditos</strong> ({gp.resolution_recommendation.replace(' (test)', '').replace(' (final)', '')}/{gp.duration_recommendation}/{gp.audio_recommendation === 'on' ? 'áudio' : 'sem áudio'})</p>
              <p className="text-[10px] text-amber-300/80 mt-1">⚠️ Ao iterar: altere apenas <strong>um elemento por vez</strong> no prompt para identificar o que causou o problema.</p>
            </Step>
          </div>

          {/* Pricing reference */}
          <div className="mt-3 bg-slate-900/50 border border-slate-700/40 rounded-lg p-3">
            <div className="text-xs font-semibold text-slate-400 mb-2">💰 Tabela de preços Kling (créditos/segundo)</div>
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              <div className="text-slate-600">Configuração</div>
              <div className="text-slate-600 text-center">Sem Áudio</div>
              <div className="text-slate-600 text-center">Com Áudio</div>
              <div className="text-slate-400">720p</div>
              <div className="text-center text-slate-300">6 cr/s</div>
              <div className="text-center text-slate-300">9 cr/s</div>
              <div className="text-slate-400">1080p</div>
              <div className="text-center text-slate-300">8 cr/s</div>
              <div className="text-center text-slate-300">12 cr/s</div>
            </div>
            <div className="text-[10px] text-slate-600 mt-2">Exemplo: 5s × 8 cr/s = 40 créditos (1080p sem áudio)</div>
          </div>
        </div>
      )}
    </div>
  )
}
