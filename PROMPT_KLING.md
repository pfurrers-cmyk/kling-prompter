# DEEP RESEARCH — Megaprompt para Geração de Vídeos na Kling AI 3.0

> **Objetivo**: Deep Research exaustiva para embasar a criação de um **Megaprompt padrão reutilizável** voltado à geração de vídeos na plataforma **Kling AI**, especificamente na **string de geração text-to-video do modelo Kling 3.0**.

---

Preciso de uma **deep research exaustiva e minuciosa** que produza um relatório técnico-operacional completo para alicerçar a construção de um **megaprompt padrão reutilizável** voltado à geração de vídeos na plataforma **Kling AI**, especificamente na **string de geração text-to-video do modelo Kling 3.0**.

**Referência oficial da plataforma:** <https://app.klingai.com/global/quickstart/klingai-video-3-model-user-guide>

---

## 1. Prioridades (em ordem decrescente de importância)

1. **Precisão prompt → output** — Maximizar a aderência entre a intenção descrita no prompt e o vídeo efetivamente gerado, minimizando a distância entre expectativa e resultado.
2. **Controle absoluto de presença/ausência** — Garantir que todos os elementos obrigatórios apareçam exatamente como descritos e que elementos indesejados sejam rigorosamente suprimidos (incluindo uso correto de *negative prompts*).
3. **Economia de créditos** — Reduzir re-gerações ao mínimo absoluto por meio de prompts altamente assertivos já na primeira tentativa, otimizando o custo operacional em um fluxo de produção contínua.

---

## 2. Escopo da pesquisa — Seja exaustivo

Pesquise **o mais ampla e profundamente possível**, cobrindo no mínimo as seguintes categorias de fontes:

### Fontes obrigatórias

- **Documentação oficial** da Kling AI (guias, changelogs, tutoriais da plataforma).
- **Guias especializados em prompt engineering para vídeo generativo** (blogs técnicos, tutoriais, benchmarks, comparativos entre modelos).
- **Comunidades e fóruns de usuários Kling** — incluindo, **com atenção especial**, as **comunidades chinesas** (Weibo, Xiaohongshu/RED, Bilibili, Zhihu, WeChat groups, fóruns Baidu Tieba, etc.), dado que a Kling AI é um produto da Kuaishou e **a base de usuários mais avançada e experiente é predominantemente chinesa**. Muitos dos melhores workflows, dicas de prompt e técnicas avançadas circulam primeiro nesses ambientes antes de chegar ao público ocidental. Busque ativamente nesses canais.
- **Literatura técnica** sobre modelos de difusão de vídeo, arquitetura do Kling e papers relacionados.
- **Criadores de conteúdo e power-users** que documentaram publicamente seus workflows (YouTube, Twitter/X, Reddit r/KlingAI, Discord servers, etc.).

### Fontes desejáveis

- Comparativos de resultados entre diferentes estruturas de prompt (A/B tests documentados pela comunidade).
- Análises de custo-benefício de parâmetros (resolução, duração, modo) e seu impacto em créditos.

### Fontes sugeridas (exemplificativas, não taxativas)

Abaixo, 112+ fontes pré-selecionadas organizadas em 13 categorias. Cada fonte foi escolhida por cobrir ao menos um dos eixos do briefing (estrutura de prompt, capacidades do 3.0, boas práticas, anti-padrões, economia de créditos, validação de workflow). **Você não está limitado a estas fontes** — use-as como ponto de partida e expanda a partir delas.

---

#### CATEGORIA 1 — Documentação Oficial Kling AI (Kuaishou)

Fontes primárias e insubstituíveis. Devem ser lidas integralmente antes de qualquer outra fonte.

| # | Fonte | URL | Relevância |
|---|-------|-----|------------|
| 1 | Kling VIDEO 3.0 Model User Guide | <https://app.klingai.com/global/quickstart/klingai-video-3-model-user-guide> | Referência-mestra do briefing. Sintaxe oficial de prompts, parâmetros, exemplos canônicos, limites de duração e resolução. |
| 2 | Kling VIDEO 3.0 Omni Model User Guide | <https://app.klingai.com/global/quickstart/klingai-video-3-omni-model-user-guide> | Diferenças entre 3.0 Standard e 3.0 Omni; modo multi-shot, áudio nativo, Elements 3.0. |
| 3 | Kling Video O1 User Guide | <https://app.klingai.com/global/quickstart/klingai-video-o1-user-guide> | Modelo unificado de geração + edição; referência para entender a evolução da arquitetura Kling. |
| 4 | Kling VIDEO 2.6 Audio User Guide | <https://app.klingai.com/global/quickstart/klingai-video-26-audio-user-guide> | Base de comparação para entender o que mudou de 2.6 → 3.0 em áudio e lip-sync. |
| 5 | Kling AI API Documentation — Product Introduction & Overview | <https://app.klingai.com/global/dev/document-api/quickStart/productIntroduction/overview> | Parâmetros da API, créditos por geração, limites de resolução e duração — essencial para a seção de economia de créditos. |
| 6 | Kling AI Official Pricing Page | <https://klingai.com> (seção de pricing) | Valores de créditos por plano, custo por segundo, custo por resolução — fundamenta toda a seção D do briefing. |
| 7 | Kling AI — Plataforma Chinesa (可灵) | <https://klingai.com/cn/> | Interface em chinês; contém exemplos de prompts em mandarim e funcionalidades que podem diferir da versão global. |
| 8 | Kuaishou Press Release — Kling 3.0 Launch (Fev 2026) | <https://ir.kuaishou.com/news-releases/news-release-details/kuaishou-unveils-proprietary-video-generation-model-kling> | Comunicado oficial da Kuaishou sobre arquitetura DiT, 3D VAE, mecanismo de atenção espaço-temporal. |

---

#### CATEGORIA 2 — Artigos Técnicos e Papers Acadêmicos (arXiv / Conferências)

Fundamentação científica para entender por que certas estratégias de prompt funcionam no nível arquitetural.

| # | Fonte | URL | Relevância |
|---|-------|-----|------------|
| 9 | Kling-Omni Technical Report (arXiv:2512.16776) | <https://arxiv.org/html/2512.16776v1> | Report oficial da Kuaishou sobre a arquitetura unificada Kling-Omni: Prompt Enhancement via RL, 3D Spacetime Joint Attention, cascaded VSR. Explica por que prompts detalhados geram resultados melhores. |
| 10 | Kling-Avatar: Grounding Multimodal Instructions (arXiv:2509.09595) | <https://arxiv.org/html/2509.09595v1> | Pipeline de avatar com MLLM Director; mostra como o modelo processa instruções de personagem, emoção, e storyline template. |
| 11 | SemanticGen: Video Generation in Semantic Space (Kling Team, Kuaishou) | <https://www.alphaxiv.org/overview/2512.20619v1> | Framework de duas etapas (semântico → VAE) do time Kling; explica convergência rápida e consistência temporal em vídeos longos. |
| 12 | Improving Video Generation with Human Feedback (VideoReward, Flow-DPO) | <https://arxiv.org/html/2501.13918v1> | Alinhamento de modelos de vídeo via reward models; explica como Kling otimiza aderência ao prompt via RLHF. |
| 13 | VideoTetris: Towards Compositional T2V Generation (NeurIPS 2024, Kuaishou & PKU) | <https://github.com/YangLing0818/VideoTetris> | Composição espaço-temporal de elementos em vídeo; fundamento para entender multi-objeto e multi-shot. |
| 14 | Diffusion as Shader: 3D-aware Video Diffusion (arXiv:2501.03847) | <https://arxiv.org/html/2501.03847v1> | Controle 3D de câmera em modelos de difusão de vídeo; contexto técnico para instruções de câmera no Kling. |
| 15 | REDUCIO! Generating 1K Video with Compressed Motion Latents | <https://arxiv.org/html/2411.13552v3> | Compressão de latentes de vídeo; explica trade-off resolução × custo computacional — relevante para economia de créditos. |
| 16 | Stable Video Diffusion (Blattmann et al., 2023) | <https://arxiv.org/abs/2311.15127> | Paper fundacional de difusão de vídeo latente; base teórica para todos os modelos da família. |
| 17 | CogVideoX: Text-to-Video with Expert Transformer (ICLR 2025) | <https://arxiv.org/abs/2408.06072> | Arquitetura Expert Transformer rival ao Kling; benchmark de comparação para prompt adherence. |
| 18 | Jailbreaking Text-to-Video Generative Models (arXiv:2505.06679) | <https://arxiv.org/html/2505.06679v1> | Análise de safety filters e robustez de Kling vs. competidores; Kling mostra menor ASR (34.7%), relevante para entender restrições de conteúdo. |
| 19 | Kling-Foley: Multimodal Diffusion for Video-to-Audio Generation | Referência em Wang et al. 2025a (arXiv:2506.19774) | Pipeline de áudio nativo Kling; explica como áudio e vídeo são co-gerados. |
| 20 | VABench: A Comprehensive Benchmark for Audio-Video Generation | <https://arxiv.org/html/2512.09299v1> | Benchmark de qualidade áudio-vídeo; inclui avaliação de Kling em dimensões de realismo sonoro e consistência A-V. |

---

#### CATEGORIA 3 — Benchmarks e Leaderboards de Vídeo Generativo

Dados quantitativos sobre desempenho do Kling 3.0 em comparação com concorrentes.

| # | Fonte | URL | Relevância |
|---|-------|-----|------------|
| 21 | Artificial Analysis — Text-to-Video Leaderboard | <https://artificialanalysis.ai/video/leaderboard/text-to-video> | ELO scores do Kling 3.0 (1248 sem áudio, 1099 com áudio); ranking comparativo em tempo real. |
| 22 | Artificial Analysis — Image-to-Video Leaderboard | <https://artificialanalysis.ai/video/leaderboard/image-to-video> | Posição do Kling 3.0 Omni no I2V; comparação com Seedance 2.0, PixVerse V6, Grok Imagine. |
| 23 | Artificial Analysis — Video Models & Providers Comparisons | <https://artificialanalysis.ai/video/models> | Dados de preço, velocidade e qualidade por modelo; fundamenta seção de economia de créditos. |
| 24 | VBench: Comprehensive Benchmark (CVPR 2024 Highlight) — GitHub | <https://github.com/Vchitect/VBench> | 16 dimensões de avaliação (subject consistency, motion smoothness, etc.); inclui Kling nos resultados. |
| 25 | VBench Project Page | <https://vchitect.github.io/VBench-project/> | Visualizações interativas e radar charts dos modelos avaliados. |
| 26 | VBench-2.0: Advancing Video Generation Benchmark (arXiv:2503.21755) | <https://arxiv.org/html/2503.21755v1> | Avaliação de Kling 1.6 como "well-rounded" em todas as dimensões; padrão para avaliar qualidade de vídeo. |
| 27 | VBench Paper (CVPR 2024 — PDF) | <https://openaccess.thecvf.com/content/CVPR2024/papers/Huang_VBench_Comprehensive_Benchmark_Suite_for_Video_Generative_Models_CVPR_2024_paper.pdf> | Paper completo com metodologia de 16 dimensões e prompt suites. |
| 28 | Video-Bench: Human-Aligned Video Generation Benchmark — GitHub | <https://github.com/Video-Bench/Video-Bench> | Benchmark alternativo com avaliação via MLLM; inclui Kling nos modelos avaliados. |
| 29 | VBench Leaderboard (Hugging Face Space) | <https://huggingface.co/spaces/Vchitect/VBench_Leaderboard> | Leaderboard interativo com submissão de resultados. |
| 30 | Artificial Analysis Video Arena Leaderboard (Hugging Face) | <https://huggingface.co/spaces/ArtificialAnalysis/Video-Generation-Arena-Leaderboard> | Arena de votação cega para comparação de modelos de vídeo. |
| 31 | GMI Cloud — How to Choose the Best Video AI Model in 2026 | <https://www.gmicloud.ai/blog/modelmatch-technical-overview> | Framework de benchmark comercial com 6 dimensões; inclui Kling I2V Master. |
| 32 | VC-Bench: Video Connecting Benchmark (OpenReview) | <https://openreview.net/forum?id=Ws8HwWHf8N> | Benchmark de transição entre clipes; relevante para multi-shot e consistência de cena. |

---

#### CATEGORIA 4 — Guias de Prompt Engineering Especializados em Kling 3.0

Fontes com fórmulas, templates e exemplos testados específicos para o modelo 3.0.

| # | Fonte | URL | Relevância |
|---|-------|-----|------------|
| 33 | fal.ai — Kling 3.0 Prompting Guide | <https://blog.fal.ai/kling-3-0-prompting-guide/> | Guia técnico de referência: multi-shot, subject consistency, motion instructions, áudio nativo. |
| 34 | KlingAIO — Kling 3.0 Prompt Guide: The Ultimate AI Video Tutorial 2026 | <https://klingaio.com/blogs/kling-3-prompt-guide> | Fórmula de 5 camadas, 5 templates testados, negative prompt strategy, troubleshooting. Paradigma "DoP, não fotógrafo". |
| 35 | Atlabs AI — Kling 3.0 Prompt Guide: Master AI Video Generation in 2026 | <https://www.atlabs.ai/blog/kling-3-0-prompting-guide-master-ai-video-generation> | $1000 gastos em testes; 5-layer structure; exemplos de diálogo com tags de personagem. |
| 36 | Seedance AI — Kling 3.0 Prompt Complete Guide | <https://seadanceai.com/blog/kling-3-0-prompt-complete-guide> | 7 core elements; técnicas avançadas de character consistency; "Director Memory" e 3D Spacetime Joint Attention. |
| 37 | VEED — Kling 3.0 Prompting Guide: Get Better Videos in 5 Steps | <https://www.veed.io/learn/kling-3-0-prompts> | 5-element prompt structure; motion intensity numérica (0.0–1.0); multi-shot prompting; troubleshooting. |
| 38 | VEED — Kling AI Prompts: Complete Guide 2025 | <https://www.veed.io/learn/kling-ai-prompting-guide> | Diferenças por modelo (1.6, 2.5 Turbo, 2.6, 3.0); limites de complexidade por versão; 5 common failures. |
| 39 | Cliprise — Kling 3.0 Prompt Examples: 50 Production-Ready Prompts | <https://www.cliprise.app/learn/guides/model-guides/kling-3-0-prompts> | 50 prompts copy-paste organizados por use case. Framework Camera → Subject → Environment → Light & Style → Audio → Negative. |
| 40 | Leonardo.ai — Kling AI Prompt Guide: Tips & Examples | <https://leonardo.ai/news/kling-ai-prompts/> | Foco em camera motion com intenção narrativa; "motivated motion" vs. motion vazia. |
| 41 | DataCamp — Kling 3.0: A Comprehensive Guide to AI Video Generation | <https://www.datacamp.com/tutorial/kling-3-0> | Tutorial com testes reais; custo por geração detalhado; character building com Elements. |
| 42 | Cliprise/Medium — Kling 3.0 Tutorial: Complete Guide to 4K AI Video Generation 2026 | <https://medium.com/@cliprise/kling-3-0-tutorial-the-complete-guide-to-4k-ai-video-generation-in-2026-0e8cfed0e042> | Tabela de use case × resolução × FPS × duração; comparação Kling 3.0 vs. Sora 2 vs. Veo 3.1. |
| 43 | Higgsfield — Kling 3.0 User Guide (Scene-Based Generation) | <https://higgsfield.ai/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation> | Workflow de 5 passos; start-and-end-frame control; scene-based editing; duração de 3–15s por cena. |
| 44 | invideo — Kling 3.0: Complete Guide to Features, Pricing & How to Access | <https://invideo.io/blog/kling-3-0-complete-guide/> | Kling como "AI Director"; pipeline de produção integrada; créditos e custos. |

---

#### CATEGORIA 5 — Guias de Negative Prompts e Anti-Padrões

Fontes focadas em o que NÃO fazer e como usar negative prompts eficazmente.

| # | Fonte | URL | Relevância |
|---|-------|-----|------------|
| 45 | Pollo AI — Kling AI Best Negative Prompts: The Full List | <https://pollo.ai/hub/kling-ai-best-negative-prompts> | Lista categorizada: picture quality, composition, color, lighting, subjects, emotion. Regra: não usar "no" — apenas a palavra a evitar. |
| 46 | Artlist Blog — Negative Prompts for Kling, Veo, and Wan | <https://artlist.io/blog/negative-prompts-ai-video/> | Comparação cross-model de negative prompts; Kling tende a adicionar drift de câmera e energia extra. |
| 47 | Dreamlux AI — What Not to Add: A Simple Guide to Kling AI Negative Prompts | <https://dreamlux.ai/blog/kling-ai-negative-prompts> | Exemplos por categoria; erros comuns (usar "no" em vez da palavra direta; termos genéricos vs. específicos). |
| 48 | Filmora/Wondershare — Quick Guide on How to Use Kling AI Negative Prompts | <https://filmora.wondershare.com/ai-prompt/kling-ai-negative-prompt.html> | Exemplos por use case: cinematic, animation, product, model/fashion, fantasy world. |
| 49 | AgeOfLLMs — Kling AI Prompt Guide (Negative Prompt Field & Limitations) | <https://ageofllms.com/ai-howto-prompts/ai-fun/kling-ai-promp-guide> | Experiência real: negative prompt field nem sempre funciona; Kling tem viés para slow motion e smiling; contornos práticos. |

---

#### CATEGORIA 6 — Comunidades Chinesas e Fontes em Mandarim

O Kling é produto da Kuaishou (China); comunidades chinesas frequentemente descobrem técnicas antes das ocidentais.

| # | Fonte | URL | Relevância |
|---|-------|-----|------------|
| 50 | 知乎 (Zhihu) — 可灵和可图里里外外说明白 | <https://zhuanlan.zhihu.com/p/708551333> | Fórmula oficial chinesa: Prompt = (镜头语言+光影) + 主体(描述) + 主体运动 + 场景(描述) + (氛围). |
| 51 | CSDN — 视频生成AI-可灵的具体使用方法（含提示词撰写方式） | <https://blog.csdn.net/Xhz181888/article/details/140845107> | Guia detalhado em chinês; fórmula de prompt; dicas para 图生视频 e 延长视频; limitações com números e múltiplos objetos. |
| 52 | CSDN — 快手可灵AI视频提示词不会写？记住这1个公式就够了 | <https://blog.csdn.net/u011886447/article/details/140592170> | Fórmula simplificada; exemplos de prompts em chinês com tradução; 22 termos de câmera; tips de prompt para I2V. |
| 53 | CSDN — 零基础用AI—快手可灵AI全功能实操指南 | <https://blog.csdn.net/qq_43792385/article/details/145697708> | Tutorial completo de funcionalidades com exemplos; DeepSeek + 可灵 workflow. |
| 54 | 53AI — 可灵(Kling) AI 视频保姆级教程 | <https://www.53ai.com/news/qianyanjishu/2024070641750.html> | Tutorial step-by-step para iniciantes na plataforma chinesa; acesso via 快影 App. |
| 55 | 猫目 AI导航 — 可灵AI 详情 | <https://maomu.com/p/klingai-kuaishou-com> | Descrição técnica em chinês: 3D时空联合注意力, Diffusion Transformer, DeepSeek-R1 integration, 灵感词库 (Inspiration Word Bank). |
| 56 | AIG123 AI工具导航 — 可灵大模型 | <https://www.aig123.com/sites/2891.html> | Overview técnico da plataforma chinesa; 3D VAE, variável resolução, tecnologia de reconstrução facial 3D. |
| 57 | 创艺提示符 (CaPrompt) — Tag: Kling | <https://www.caprompt.com/tag/kling> | Biblioteca de prompts curados para Kling com exemplos visuais; atualizado com 可灵 1.5, 1.6, e recursos de Motion Brush. |
| 58 | Atlas Cloud Blog (zh) — 可灵 3.0 视频模型震撼上线 | <https://www.atlascloud.ai/zh/blog/guides/Kling-3-0-Live-on-Atlas-Cloud-The-All-in-One-AI-Video-Generator-with-Smart-Storyboarding-Native-Lip-Sync> | Exemplos em chinês de multi-shot com @personagem; formato de prompt bilíngue; tabela de créditos. |

---

#### CATEGORIA 7 — Reviews, Comparações e Rankings de Modelos de Vídeo AI

Contexto competitivo e análises independentes.

| # | Fonte | URL | Relevância |
|---|-------|-----|------------|
| 59 | VO3 AI Blog — Kling 3.0 vs Sora 2 vs Grok Imagine vs Veo3 Compared 2026 | <https://www.vo3ai.com/blog/kling-30-vs-sora-2-vs-grok-imagine-vs-veo3-best-ai-text-to-video-model-for-comme-2026-03-06> | Comparação com ELO scores; Kling #1 em T2V. |
| 60 | Digital Journal — Kling AI 3.0 Review: Is It the #1 Text-to-Video Model in 2026? | <https://www.digitaljournal.com/pr/news/vehement-media/kling-ai-3-0-review-1-1759575677.html> | ELO 1243; 7 modelos Kling no top 15; análise de multi-shot, character consistency, text rendering, áudio. |
| 61 | ArtSmart — Top 4 New AI Video Tools You Need to Try in 2026 | <https://artsmart.ai/blog/top-ai-video-tools-2026/> | Kling 3.0 a $0.10/segundo; 60fps → 24fps slow-motion trick; Curious Refuge score 8.1/10. |
| 62 | Class Central — "I Ranked Every AI Video Generator in 2026" (Tao Prompts) | <https://www.classcentral.com/course/youtube-i-ranked-every-ai-video-generator-in-2026-517710> | Vídeo-tutorial de 29min comparando múltiplos modelos. |
| 63 | eesel.ai — How to Use Kling AI: A Beginner's Guide for 2026 | <https://www.eesel.ai/blog/kling-ai> | Guia para iniciantes; aspect ratios por plataforma; expectativas realistas de qualidade. |
| 64 | YouMind Blog — Kling 3.0 Masterclass: Solo Creators & Studio-Quality AI Videos | <https://youmind.com/blog/kling-3-0-guide-individual-creator-ad-quality-ai-video> | Workflow comprovado: Script → First Frame → Elements → Multi-Shot → Iteração; "Golden Templates" concept; dica de promptar em inglês. |

---

#### CATEGORIA 8 — Repositórios GitHub e Ferramentas Open Source

Código, datasets, e recursos técnicos abertos.

| # | Fonte | URL | Relevância |
|---|-------|-----|------------|
| 65 | showlab/Awesome-Video-Diffusion | <https://github.com/showlab/Awesome-Video-Diffusion> | Lista curada de todos os papers e modelos de difusão de vídeo. |
| 66 | Vchitect/VBench — GitHub | <https://github.com/Vchitect/VBench> | Código de avaliação em 16 dimensões; prompt suites usados em benchmarks oficiais. |
| 67 | Video-Bench/Video-Bench — GitHub | <https://github.com/Video-Bench/Video-Bench> | Benchmark com avaliação via MLLM; suporte para avaliação customizada de prompts. |
| 68 | VBench — PyPI Package | <https://pypi.org/project/vbench/> | Pacote pip para avaliação local de vídeos gerados; ferramenta de QA para testar outputs do megaprompt. |
| 69 | YangLing0818/VideoTetris — GitHub (Kuaishou & PKU) | <https://github.com/YangLing0818/VideoTetris> | Framework de composição espaço-temporal; código para manipulação de attention maps. |

---

#### CATEGORIA 9 — Cinematografia e Linguagem de Câmera (Referências de Domínio)

Fontes que ajudam a traduzir intenção narrativa em vocabulário cinematográfico compreendido pelo modelo.

| # | Fonte | URL | Relevância |
|---|-------|-----|------------|
| 70 | Leonardo.ai — Motivated Camera Motion (Pan, Tilt, Dolly, Crane, Boom) | <https://leonardo.ai/news/kling-ai-prompts/> | Vocabulário cinematográfico aplicado a prompts de vídeo AI; "motivated motion" vs. motion arbitrária. |

---

#### CATEGORIA 10 — Fontes sobre Workflow de Produção Contínua e Template-Based Prompting (Eixo E)

Fontes específicas para validar ou refutar a arquitetura proposta de **"Megaprompt Padrão + Contexto Variável"** como fluxo de produção em escala.

| # | Fonte | URL | Relevância |
|---|-------|-----|------------|
| 71 | YouMind Blog — "Golden Templates" para produção contínua | <https://youmind.com/blog/kling-3-0-guide-individual-creator-ad-quality-ai-video> | Conceito de "Golden Templates" reutilizáveis; workflow Script → First Frame → Elements → Multi-Shot → Iteração; validação empírica de template fixo + variável. |
| 72 | Cliprise — 50 Production-Ready Prompts (template-based) | <https://www.cliprise.app/learn/guides/model-guides/kling-3-0-prompts> | 50 templates organizados por use case — evidência de que a comunidade trabalha com templates prontos preenchidos com contexto variável. |
| 73 | Atlabs AI — "After $1000 in testing" workflow documentation | <https://www.atlabs.ai/blog/kling-3-0-prompting-guide-master-ai-video-generation> | Workflow documentado com gastos reais; 5-layer structure como template padrão; evidência de iteração eficiente. |
| 74 | Seedance AI — "Director Memory" e consistência entre gerações | <https://seadanceai.com/blog/kling-3-0-prompt-complete-guide> | "Director Memory" como mecanismo do modelo para manter coerência entre gerações; relevante para template + contexto. |
| 75 | Higgsfield — Scene-Based Canvas Workflow | <https://higgsfield.ai/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation> | Workflow canvas com cenas modulares; cada cena = template fixo + conteúdo variável; validação da arquitetura modular. |
| 76 | CSDN — DeepSeek + 可灵 workflow de produção | <https://blog.csdn.net/qq_43792385/article/details/145697708> | Workflow chinês usando LLM (DeepSeek) para gerar prompts a partir de template → 可灵; validação da abordagem template-based na comunidade chinesa. |
| 77 | Kling-Avatar Technical Report — Storyline Templates | <https://arxiv.org/html/2509.09595v1> | MLLM Director usando storyline templates internamente; evidência arquitetural de que o modelo é otimizado para receber inputs estruturados em formato de template. |
| 78 | Kling-Omni — Prompt Enhancement via RL | <https://arxiv.org/html/2512.16776v1> | O modelo internamente re-escreve prompts curtos para prompts detalhados (Prompt Enhancement); evidência de que prompts estruturados detalhados são o formato ótimo. |
| 79 | fal.ai — Multi-shot como mini-storyboard modular | <https://blog.fal.ai/kling-3-0-prompting-guide/> | Cada shot como módulo independente com câmera, ação e áudio próprios; arquitetura modular validada. |
| 80 | DataCamp — Custo por geração e estratégia de iteração | <https://www.datacamp.com/tutorial/kling-3-0> | Análise de custo que justifica o uso de templates para reduzir falhas na primeira tentativa. |

---

#### CATEGORIA 11 — Fontes sobre Prompt Engineering Genérico e Abordagens de Metaprompting

Fontes que tratam da ciência de construir prompts reutilizáveis e sistemas de metaprompting aplicáveis a qualquer modelo generativo.

| # | Fonte | URL | Relevância |
|---|-------|-----|------------|
| 81 | Anthropic — Prompt Engineering Guide | <https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering> | Princípios gerais de prompt engineering (clareza, estrutura, exemplos) aplicáveis ao design do megaprompt. |
| 82 | OpenAI — Prompt Engineering Best Practices | <https://platform.openai.com/docs/guides/prompt-engineering> | Técnicas de few-shot, chain-of-thought, e structured output aplicáveis ao design de templates reutilizáveis. |
| 83 | Google DeepMind — "Prompting is Programming" (2023) | Pesquisar em scholar.google.com | Framework teórico de prompts como programas parametrizados; fundamento para a lógica template + variáveis. |
| 84 | Medium/Towards AI — "Meta-Prompting: The Art of Prompts That Write Prompts" | Pesquisar em medium.com/towards-ai | Técnicas de metaprompting relevantes para construir um megaprompt que é, em si, um template parametrizado. |

---

## 3. Eixos que o relatório DEVE cobrir em profundidade

### A. Estrutura e sintaxe de prompt para Kling 3.0

- A **fórmula-mestra** documentada pela comunidade: `[Câmera/Movimento] + [Sujeito & Física da Ação] + [Ambiente/Iluminação] + [Textura & Detalhes] + [Áudio/Emoção]`.
- A abordagem de **cinco camadas sequenciais**: **Cena → Personagens → Ação → Câmera → Áudio & Estilo**.
- A fórmula chinesa documentada em Zhihu e CSDN: `Prompt = (镜头语言+光影) + 主体(描述) + 主体运动 + 场景(描述) + (氛围)` — compare com a fórmula ocidental e identifique convergências e divergências.
- O paradigma de "pensar como **Diretor de Fotografia (DoP)**, não como fotógrafo" — descrever *como as coisas se movem no tempo*, não apenas como parecem estaticamente.
- Ordem de leitura que o modelo prioriza internamente (se houver evidência disso nas fontes técnicas, em especial no report Kling-Omni sobre Prompt Enhancement via RL).
- Comprimento ideal de prompt: existe um ponto de retorno decrescente? A partir de quantos tokens/caracteres o modelo começa a ignorar instruções?
- Diferença de comportamento entre prompts em inglês vs. mandarim vs. outros idiomas.

### B. Capacidades específicas do Kling 3.0 a explorar

- Narrativas nativas de até **15 segundos** com ações evolutivas em um único prompt.
- **Áudio nativo e lip-sync**: atribuição de diálogos, tons emocionais e vozes a personagens distintos via `[Character: Descrição, Tom de Voz]`.
- **Multi-shot storytelling**: divisão explícita em shots (`Shot 1:`, `Shot 2:`, `Cut to:`) para cortes cinematográficos automáticos.
- **Elements 3.0**: uso de imagens de referência para travar consistência de personagens e objetos.
- **Controle de câmera cinematográfico**: tracking, pan, FPV drone, dolly, push-in, orbit, crane, boom, truck, etc.
- **Renderização de texto legível** em cena (marcas, letreiros), com instrução para manter texto "stable and readable throughout the motion".
- **Prompt Enhancement interno**: o modelo reescreve prompts curtos internamente (documentado no report Kling-Omni) — como isso afeta a estratégia de prompt? Devemos escrever prompts que "colaborem" com esse sistema?
- **Motion intensity** como parâmetro numérico (0.0–1.0) — como usar efetivamente?
- Quaisquer **funcionalidades adicionais ou ocultas** (undocumented features) que a comunidade tenha descoberto, especialmente nas comunidades chinesas (灵感词库 / Inspiration Word Bank, por exemplo).

### C. Boas práticas e anti-padrões comprovados

- **Ações como timeline** (sequenciais, não empilhadas): uso de marcadores temporais, passos decompostos, física realista (ex.: "heel-first, weight transfer" para evitar *sliding feet*).
- **Ancorar mãos e membros a objetos** para evitar artefatos de morfismo (ex.: "Her fingers firmly grip the edge of the ceramic coffee cup" em vez de "She moves her hands").
- **Texturas físicas** para evitar aspecto plástico: film grain, skin pores, sweat, fabric creases, condensation.
- **Negative prompts** eficazes: `smiling, cartoonish, 3D render, smooth plastic skin, floating limbs, sliding feet, text morphing` — e quaisquer outros termos validados pela comunidade. Regra importante: **não usar "no"** no negative prompt — apenas a palavra a evitar.
- Evitar "word salad"; preferir frases com ordem lógica e cláusulas encadeadas.
- Promptar em **inglês** para máxima aderência ao vocabulário cinematográfico do modelo (validar se isso se mantém ou se prompts bilíngues EN/ZH são mais eficazes).
- Evitar palavras abstratas isoladas ("beautiful", "cinematic") sem especificadores concretos.
- Listar os **erros mais comuns** de quem começa e como evitá-los.
- Vieses conhecidos do modelo (tendência a slow motion, smiling, câmera drift) e como contorná-los.
- Cues estilísticos que a comunidade validou como eficazes (ex.: "shot on 35mm film", "shot on virtual anamorphic lens", "shallow depth of field").

### D. Economia de créditos e eficiência operacional

- Estratégias para acertar na **primeira geração**: clareza, especificidade, testes A/B prévios de estrutura.
- Quando usar 5s vs. 10s vs. 15s para o tipo de conteúdo.
- Parâmetros de configuração (resolução, modo, aspect ratio, FPS, etc.) e seu impacto em custo vs. qualidade.
- Técnicas de **iteração eficiente**: como refinar um prompt sem desperdiçar créditos (ex.: testar em 5s antes de gerar em 15s; testar em resolução menor antes de gerar em alta).
- Trick de 60fps → 24fps para slow-motion sem custo adicional de créditos.
- Custo comparativo: plataforma Kling direta vs. APIs de terceiros (fal.ai, Atlas Cloud, AIML, etc.).
- Tabela ideal: **use case × resolução × duração × créditos estimados**.

### E. ⚠️ Validação da arquitetura de fluxo proposta

**Este eixo é o mais crítico e precisa de investigação aprofundada.** Minha hipótese de fluxo de trabalho para produção contínua de vídeos é:

```
Megaprompt Padrão (template fixo com boas práticas embutidas)  
      +  
Contexto Específico do Vídeo (preenchido pelo operador humano para cada vídeo)  
      =  
Prompt final → inserido na string text-to-video Kling 3.0
```

**Preciso que você investigue ativamente se essa lógica de "template fixo + contexto variável" é de fato o melhor approach** para um fluxo de **produção contínua, em escala**, voltado a vídeos **bem específicos e altamente realistas**. Especificamente:

1. **Validação empírica**: Essa arquitetura é validada pela comunidade e/ou por power-users? Há quem trabalhe assim e documente resultados? Busque evidências tanto nas comunidades ocidentais quanto nas chinesas.
2. **Abordagens alternativas ou complementares**: Existem workflows que produzam resultados mais consistentes em escala? Exemplos a investigar:
   - Biblioteca de prompts modulares (cada módulo = um aspecto do vídeo).
   - Cadeia de prompts encadeados (prompt 1 gera base → prompt 2 refina → prompt 3 adiciona áudio).
   - Uso de **image-to-video como âncora** (gerar first frame com IA de imagem → usar como input para o Kling).
   - Uso de **LLM como gerador de prompts** a partir de briefing (ex.: DeepSeek + 可灵 workflow documentado no CSDN).
   - **"Golden Templates"** como documentado no YouMind (templates que provaram funcionar e são reutilizados com variações mínimas).
3. **Riscos e limitações de um template fixo**:
   - O modelo pode "viciar" em padrões repetitivos? Certas instruções fixas podem conflitar com contextos específicos?
   - O Prompt Enhancement interno do Kling pode conflitar com instruções fixas do template?
   - Há perda de qualidade ou criatividade ao usar sempre a mesma estrutura?
4. **Workflow dos power-users chineses**: Como os usuários mais produtivos da comunidade chinesa organizam seu workflow de geração em escala? Há algum padrão documentado (Bilibili, Zhihu, CSDN)?
5. **Conclusão fundamentada**: Se a abordagem de megaprompt padrão for a correta, quais são os elementos que **obrigatoriamente devem ser fixos** e quais **obrigatoriamente devem ser variáveis**? Se **NÃO for a melhor abordagem**, qual é? Proponha uma alternativa fundamentada e justifique com evidências.

---

## 4. Entregáveis

| Etapa | Output | Observação |
|-------|--------|------------|
| **1. Deep Research** | Relatório técnico detalhado cobrindo **todos os eixos acima (A–E)**, com citação de fontes sempre que possível | 1 única geração |
| **2. Megaprompt Padrão** | Template genérico reutilizável (ou a estrutura alternativa que a pesquisa indicar como superior), contendo *placeholders* claramente marcados para os campos variáveis | 1 única geração |

**Para cada vídeo subsequente (uso recorrente):**

> `Megaprompt Padrão (ou estrutura validada)` + `contexto específico do vídeo` → prompt final pronto para inserir na string text-to-video Kling 3.0.

### O megaprompt (ou estrutura final) deve incluir:

- Todos os **campos obrigatórios** que o operador humano precisa fornecer, marcados como placeholders (ex.: `{{CENA}}`, `{{PERSONAGENS}}`, `{{AÇÃO_TIMELINE}}`, `{{CÂMERA}}`, `{{ÁUDIO}}`, `{{NEGATIVE_PROMPT}}`).
- **Instruções fixas** de boas práticas já embutidas (negative prompt padrão, instrução mínima de câmera, formato de diálogo, texturas anti-plástico, etc.) — ou seja, o operador não precisa lembrar das regras, elas já estão no template.
- **Notas inline curtas** explicando o porquê de cada seção e como preenchê-la corretamente.
- **Exemplos de preenchimento** para pelo menos 2 cenários diferentes (ex.: um vídeo de produto comercial e um vídeo narrativo com personagens).

---

## 5. Diretrizes para a pesquisa

- **Não economize na busca.** Prefiro um relatório longo e completo a um resumido e superficial.
- **Cite fontes** sempre que possível (links, nomes de criadores, títulos de posts/vídeos).
- **Priorize evidência empírica** (resultados demonstrados) sobre teoria.
- **Se houver contradição entre fontes**, apresente ambos os lados e indique qual tem mais evidência a favor.
- **Dê atenção especial ao conteúdo em mandarim/chinês**, mesmo que precise traduzir ou resumir — essas comunidades são a fronteira do conhecimento sobre Kling AI.
- **Priorize sempre fontes que sejam posteriores ao lançamento da string específica do Kling 3.0**, a fim de garantir que as técnicas de prompt, limitações de modelo e documentação de features (como *multi-shot*, *native audio* ou controle explícito de câmera) reflitam as capacidades atualizadas do sistema atual em detrimento de modelos legados.
- **Ao final do relatório**, inclua uma seção de **"Lacunas de Conhecimento"** — pontos que não foi possível verificar e que merecem teste empírico pelo operador.
- **Use as 112+ fontes sugeridas como ponto de partida**, mas **não se limite a elas**. Se encontrar fontes adicionais relevantes durante a pesquisa, inclua-as.
- **Para o Eixo E especificamente**, busque evidências concretas (screenshots de workflows, posts de power-users, documentação de estúdios) e não apenas opinião teórica.
