# Contexto Completo · Quiz Vocacional Inteli

**Documento de handoff para desenvolvimento**
V01 — Janeiro 2026

Este documento consolida todo o raciocínio, decisões e artefatos do projeto até o momento, para uso como contexto em uma ferramenta de desenvolvimento. Deve ser lido em conjunto com dois anexos:

- `Inteli_Quiz_Vocacional_Banco_de_Perguntas.docx` — banco de perguntas completo
- `Inteli_Quiz_Mapeamento_Perfis.html` — explorador interativo dos 36 perfis possíveis

---

## 1. Contexto institucional

O Inteli (Instituto de Tecnologia e Liderança) é uma faculdade de tecnologia brasileira, sem fins lucrativos, com nota máxima do MEC em seus 5 cursos de graduação. O currículo é 100% baseado em projetos (Project Based Learning), com competências divididas em computação (70%), negócios (20%) e liderança (10%). Os 5 cursos de graduação são:

- **Administração (ADM Tech)**
- **Sistemas de Informação (SI)**
- **Engenharia de Software (ES)**
- **Engenharia de Computação (EC)**
- **Ciência da Computação (CC)**

O projeto nasce da equipe de Lifelong Learning (LLL) do Inteli, responsável por cursos executivos e MBA, mas o quiz em si é uma ação de **captação de topo de funil** para a graduação, usada em feiras de profissão (via tablets) e no site institucional.

## 2. O problema original

Hoje os tablets usados em feiras de profissão rodam apenas um formulário Typeform para captar dados de contato de alunos interessados — sem nenhum valor pedagógico devolvido ao aluno. A ideia é substituir isso por um **quiz vocacional** que ajude o aluno do ensino médio a entender qual dos 5 cursos mais combina com o perfil dele, ao mesmo tempo em que gera leads mais qualificados para o funil de captação.

### Requisito não negociável definido pelo solicitante

O quiz **não pode seguir a lógica convencional** de "cada resposta soma ponto para um curso, e no final o curso com mais pontos vence". Essa lógica é:

- Previsível pelo respondente no meio do quiz (ele percebe o mecanismo e pode manipular o resultado)
- Pedagogicamente rasa — não constrói um perfil de fato, só conta ocorrências
- Incoerente com o posicionamento de excelência do Inteli

O requisito era construir uma **mecânica de perfilação legítima**: medir características comportamentais da pessoa (não afinidade declarada com cursos) e só then cruzar esse perfil com o curso mais compatível.

## 3. Arquitetura conceitual — as três dimensões

O quiz mede o respondente em **três dimensões independentes dos cursos**. O aluno nunca responde sobre "qual curso prefere" — responde sobre si mesmo, e o sistema é que faz a tradução para curso no final.

### Dimensão 1 · Foco de Impacto
**Pergunta que ela responde:** Onde a pessoa quer ver o resultado do trabalho dela aparecer?
**Natureza:** espectro contínuo (3 níveis discretizados para fins de mapeamento)
**Polos:** Pessoas e decisão organizacional ←→ Produto para usuários ←→ Descoberta e capacidades novas

### Dimensão 2 · Estilo de Pensamento
**Pergunta que ela responde:** Como a mente prefere atacar um problema complexo?
**Natureza:** três modos discretos (não é um espectro — não dá para interpolar entre eles)
**Modos:**
- **Integrador** — conecta áreas, traduz entre mundos, enxerga o todo
- **Construtor** — aprende fazendo, prototipa, itera
- **Investigador** — modela, prova, entende a fundo antes de agir

**Nota metodológica importante:** como o Estilo tem três modos discretos, nenhum dilema binário (A vs. B) sozinho consegue separá-los. A solução usada no banco de perguntas foi usar **dois contrastes diferentes** que, cruzados, triangulam os três modos:
- Contraste 1: Integrador (conectar/transitar) vs. Especialista (aprofundar)
- Contraste 2 (só aplicado a quem marcou "especialista" no contraste 1): Construtor (mão na massa) vs. Investigador (entender a fundo antes)

### Dimensão 3 · Camada Técnica
**Pergunta que ela responde:** Quão "para dentro" da máquina a pessoa quer ir?
**Natureza:** espectro contínuo (4 níveis discretizados para fins de mapeamento)
**Polos:** Negócio sem precisar codar ←→ Negócio/Aplicação ←→ Aplicação digital ←→ Hardware e fundamentos teóricos

### Por que três dimensões e não mais

Foi cogitada uma 4ª dimensão ("tolerância à abstração/incerteza") mas descartada: ao testar contra a grade curricular real do Inteli (ver seção 4), nenhuma dupla de cursos potencialmente confundível ficava sem separação usando apenas as 3 dimensões. Mais dimensões aumentariam o custo de inferência (mais perguntas) sem aumentar o poder discriminativo.

## 4. Validação contra a grade curricular real

As dimensões foram validadas lendo a grade de projetos de 1º a 3º ano de cada curso na apresentação institucional do Inteli (documento fonte: `APRESENTAÇÃO_INSTITUCIONAL_CURTA_-_EP-JAN2026.pdf`). Achados por curso:

- **CC**: grafos, sistemas distribuídos, otimização combinatória, deep learning, PLN, IA generativa, aprendizado por reforço → trilha de algoritmos, IA e fundamentos aplicados (investigação formal)
- **EC**: automação de processos físicos, robótica móvel + visão computacional, manutenção preditiva, robôs autônomos, cidades inteligentes, edge computing → trilha de sistemas físicos, embarcados e infraestrutura
- **ES**: serviços cloud, mobile, comando de voz, arquitetura de software, testes, CI/CD → trilha de construção de produto de software
- **SI**: blockchain, BI, big data, governança empresarial, dashboards, modelos preditivos de negócio → trilha de informação e processos organizacionais
- **ADM Tech**: modelagem financeira, valuation, mercado financeiro, tokenização, growth marketing, people analytics, RPA → trilha de negócio e gestão com tecnologia como instrumento

Essa validação confirmou as 3 dimensões e gerou um refinamento: a Dimensão 2 (Estilo) funciona melhor como 3 modos discretos do que como espectro contínuo, porque os projetos reais mostram padrões nitidamente categóricos (integrador/construtor/investigador), não graduais.

## 5. Mapa dos 5 cursos no espaço de 3 dimensões

Esta é a "âncora" (perfil ideal) de cada curso — usada como referência de distância para classificar qualquer perfil de respondente:

| Curso | Foco | Estilo | Camada |
|---|---|---|---|
| ADM Tech | Pessoas/Decisão | Integrador | Negócio |
| Sistemas de Informação (SI) | Pessoas/Decisão | Integrador | Negócio↔Aplicação |
| Engenharia de Software (ES) | Produto/Usuários | Construtor | Aplicação digital |
| Engenharia de Computação (EC) | Produto/Usuários | Construtor | Hardware/Fundamentos |
| Ciência da Computação (CC) | Descoberta/Capacidades | Investigador | Hardware/Fundamentos |

Nota: ADM Tech e SI compartilham Foco e Estilo, diferindo só na Camada (SI vai um degrau mais fundo tecnicamente). ES e EC compartilham Foco e Estilo, diferindo só na Camada (EC vai ao hardware). EC e CC compartilham Camada, diferindo em Foco e Estilo (EC constrói, CC investiga).

## 6. Mecânica de perguntas — decisões fechadas

- **Formato de resposta:** dilema binário (A vs. B), respondido em **escala de 4 pontos** ("Totalmente A / Mais para A / Mais para B / Totalmente B"). Decisão explícita do solicitante em favor deste formato sobre a alternativa de "4 alternativas por pergunta" — prioriza velocidade de resposta no tablet e coordenadas matematicamente mais limpas.
- **Extensão:** **6 perguntas núcleo** (respondidas por todos) + **2 a 4 perguntas adaptativas** (disparadas condicionalmente quando o núcleo deixa o perfil ambíguo entre duas regiões vizinhas). Tempo médio estimado: 3–5 minutos.
- **Núcleo (6 perguntas):** desenhado para dar pelo menos duas leituras por dimensão, com duas perguntas "diagonais" que cruzam Foco+Camada simultaneamente (mais eficiência por pergunta) e duas perguntas dedicadas a triangular o Estilo (os dois contrastes mencionados na seção 3).
- **Adaptativas (4 perguntas condicionais):** cada uma desenhada para desempatar uma dupla específica de cursos vizinhos:
  - Adaptativa A: ADM Tech vs. SI
  - Adaptativa B: ES vs. EC
  - Adaptativa C: EC vs. CC
  - Adaptativa D: SI vs. ES
- **Conteúdo integral das 10 perguntas** (texto exato, polos, escala, dimensão movimentada, intenção pedagógica) está no arquivo `Inteli_Quiz_Vocacional_Banco_de_Perguntas.docx`, anexo a este contexto.

## 7. Modelo de pontuação — como funciona a inferência

### 7.1 Discretização usada para modelagem e teste

Para simular e testar o modelo antes da implementação real, cada dimensão foi discretizada:

- **Foco**: 3 níveis (0 = Pessoas/Decisão, 1 = Produto/Usuários, 2 = Descoberta/Capacidades)
- **Estilo**: 3 níveis (0 = Integrador, 1 = Construtor, 2 = Investigador)
- **Camada**: 4 níveis (0 = Negócio, 1 = Negócio↔Aplicação, 2 = Aplicação digital, 3 = Hardware/Fundamentos)

Isso gera um espaço de **3 × 3 × 4 = 36 perfis combinatórios possíveis**. Na implementação real, as respostas em escala de 4 pontos devem gerar uma posição contínua (não apenas os 36 pontos discretos) — a discretização foi uma simplificação para fins de validação do modelo, **não é a recomendação final de implementação**. Ver seção 9 (próximos passos) sobre isso.

### 7.2 Métrica de distância

Para cada perfil (respondente ou candidato), a distância até a âncora de cada curso é calculada como:

```
distância = |Δ Foco| × peso_foco + (0 se Estilo igual, 1 se diferente) × peso_estilo + |Δ Camada| × peso_camada
```

**Pesos usados na validação:**
- peso_foco = 1.0
- peso_estilo = 1.3 (mais alto — tratado como traço identitário forte)
- peso_camada = 1.2

Importante: a distância em Estilo é **binária** (0 ou 1), não numérica-contínua, porque os três modos não têm ordem natural entre si (não faz sentido dizer que "Construtor" fica "entre" Integrador e Investigador).

**Estes pesos são estimativas de bom senso, não calibradas com dados reais.** Recomendação explícita: recalibrar após rodar o quiz com alunos reais nas primeiras feiras, comparando recomendação do quiz vs. curso em que o aluno efetivamente se matriculou.

### 7.3 Regras de classificação do perfil

Com as distâncias calculadas para os 5 cursos, ordenadas da menor para a maior, aplica-se:

- **Âncora/Adjacente**: distância até o curso mais próximo ≤ 1.5 **e** gap para o segundo mais próximo ≥ 0.8 → indicação de alta confiança
- **Fronteira**: distância até o mais próximo ≤ 2.2 **e** gap < 0.8 → dois cursos quase empatados, dispara pergunta adaptativa correspondente para desempate
- **Adjacente-distante**: distância até o mais próximo entre 1.5 e 2.5 (não se qualifica como âncora clara, mas também não é órfão) → indicação com nuance, a devolutiva precisa reconhecer a tensão do perfil
- **Órfão**: distância até o curso mais próximo ≥ 2.8 → nenhum curso atende bem, tratamento especial de feedback

## 8. Resultado da simulação com os 36 perfis

Rodando o modelo acima contra todas as 36 combinações possíveis:

| Tipo | Quantidade | % |
|---|---|---|
| Âncora/Adjacente | 21 | 58% |
| Fronteira | 3 | 8% |
| Adjacente-distante | 10 | 28% |
| Órfão | 2 | 6% |

### 8.1 Achados de qualidade do modelo

- **Taxa de órfãos baixa (5,5%)** — sinal de que as dimensões cobrem bem o espaço real de perfis de alunos de ensino médio interessados em tecnologia/negócios.
- **As 3 fronteiras são todas CC vs. EC** (na combinação Camada=Hardware/Fundamentos) — o que bate com a realidade: essa é a distinção mais sutil entre os 5 cursos, mesmo para pessoas do setor.
- **Cada curso tem exatamente um perfil de distância zero (sua própria âncora)** — nenhuma dupla de cursos colapsa no mesmo ponto do espaço, confirmando que as 3 dimensões discriminam todos os 5 cursos.
- **As duas combinações órfãs** são ambas Foco=Descoberta/Capacidades + Camada=Negócio (variando só o Estilo) — ou seja, alguém que quer empurrar a fronteira do conhecimento mas não quer entrar na profundidade técnica nem ficar só na gestão. Um perfil de "pesquisador/estrategista" que nenhum dos 5 cursos de graduação atende bem — mas que pode ser um lead interessante para pós-graduação/MBA.

### 8.2 Desbalanceamento de perfis por curso — análise

Distribuição de âncoras por curso (de 21 total): ES teve a maior concentração, CC a menor. **Conclusão do parecer dado ao solicitante:** esse desbalanceamento é majoritariamente **estrutural, não um defeito do modelo**. Cursos que ocupam posição "central" no espaço tridimensional (SI, ES) têm mais vizinhos possíveis que cursos em posições "de canto" (ADM Tech, CC). Isso reflete a topologia real do portfólio, não um viés de construção das dimensões.

**Sinal de atenção identificado (não bloqueante):** 6 dos 10 perfis "adjacente-distante" apontam para ADM Tech ou SI — sugerindo que, quando há tensão no perfil, ela tende a "cair" para o lado de negócio. Hipóteses: (a) reflexo real da distribuição de perfis de aluno de ensino médio, ou (b) os pesos podem estar levemente desbalanceados em favor da Camada baixa. **Recomendação: não alterar as dimensões agora; recalibrar pesos pós-piloto com dados reais de matrícula.**

### 8.3 Parecer final sobre a qualidade das dimensões

As três dimensões foram avaliadas como **prontas para lançamento**, com base em: cobertura de 94,5% do espaço de perfis razoáveis, ambiguidade concentrada exatamente onde ela existe na realidade (CC↔EC), nenhuma dimensão "morta" (todas as 3 discriminam pelo menos um par de cursos), e nenhuma dupla de cursos colapsando no mesmo perfil-âncora. A recomendação foi lançar com o modelo atual e instrumentar a coleta de dados (recomendação do quiz vs. matrícula real) para calibração de pesos em uma v2, em vez de tentar otimizar mais o modelo antes de ter dados reais de uso.

## 9. Artefatos já produzidos

1. **One-pager de arquitetura** (HTML, visual, sem perguntas) — para apresentação à equipe de marketing, explicando a lógica pedagógica das 3 dimensões, o mapa dos 5 cursos, e os 6 princípios de mecânica do quiz (perguntas indiretas, posicionamento não pontuação, fluxo adaptativo, resultado lê perfil antes do curso, segundo curso compatível honesto, perfis legítimos fora do óbvio).

2. **Banco de perguntas** (`Inteli_Quiz_Vocacional_Banco_de_Perguntas.docx`) — as 6 perguntas núcleo + 4 adaptativas, cada uma com: texto exato do dilema A/B, escala de resposta, dimensão(ões) movimentada(s), intenção pedagógica por escrito, e 4 exemplos de devolutiva final (incluindo um caso de fronteira resolvido e um perfil fora do óbvio).

3. **Mapeamento de perfis** (`Inteli_Quiz_Mapeamento_Perfis.html`) — explorador interativo dos 36 perfis combinatórios possíveis, com seletores de Foco/Estilo/Camada, painel de resultado em tempo real (curso indicado, segunda opção, distâncias para os 5 cursos, interpretação textual, preview de devolutiva por tipo), e grade navegável dos 36 perfis com filtros por tipo (âncora/fronteira/distante/órfão) e por curso indicado.

## 10. O que ainda não foi decidido / próximos passos em aberto

Estes pontos **não têm decisão fechada** e precisam ser resolvidos na fase de desenvolvimento:

- **Como a escala de 4 pontos se traduz em posição contínua no espaço** (não apenas nos 36 pontos discretos usados para validação). A implementação real provavelmente deve tratar cada resposta como um valor numérico (ex.: -2, -1, +1, +2) que desloca a posição do respondente ao longo do eixo daquela dimensão, com uma função de agregação (média ponderada, provavelmente) consolidando múltiplas perguntas na posição final.
- **Especificação técnica completa do modelo de pontuação** para o time de desenvolvimento: fórmula exata de conversão resposta→coordenada, pesos finais de cada dilema por dimensão, coordenadas-centro de cada curso no espaço contínuo (não discretizado), e regras exatas de disparo das perguntas adaptativas (limiares numéricos, não só a descrição qualitativa usada até aqui).
- **Redação final das perguntas** — o texto no banco de perguntas é funcional mas foi sinalizado como rascunho; vale revisão de tom/vocabulário pela equipe de marketing para o público de ensino médio.
- **Devolutivas completas para os 36 perfis (ou consolidadas em famílias)** — até agora existem 4 exemplos ilustrativos no doc de perguntas. Ainda não foi decidido se serão escritas as 36 devolutivas individualmente ou consolidadas em templates por (curso × tipo de perfil), o que daria algo como 5 cursos × 4 tipos = até 20 templates reutilizáveis.
- **Tratamento de UI/UX para os perfis órfãos e adjacentes-distantes** — a diretriz combinada foi "indicar o curso menos distante + reconhecer a singularidade", mas o desenho de tela/fluxo para isso (como isso aparece visualmente, se abre um CTA diferente para "conversar com orientação", etc.) ainda não foi especificado.
- **Calibração de pesos pós-piloto** — os pesos (Foco 1.0, Estilo 1.3, Camada 1.2) são estimativas iniciais; a recomendação é recalibrar depois de coletar dados reais de uso nas primeiras feiras (comparando indicação do quiz com curso de matrícula efetiva).
- **Decisão sobre uso de projetos reais nomeados** (com parceiros de mercado, ex. Gerdau, BTG) vs. descrições genéricas nas devolutivas públicas do site — levantado mas não resolvido.

## 11. Diretrizes de tom e identidade que devem se manter

Para qualquer desenvolvimento futuro (fluxo do quiz, telas de resultado, textos), preservar:

- **Nunca revelar a lógica de pontuação para o respondente** durante o quiz — as perguntas devem parecer sobre autoconhecimento, não sobre "escolher um curso".
- **A devolutiva sempre começa pela leitura do perfil** ("Você é alguém que...") e só depois apresenta o curso — nunca o inverso.
- **Honestidade sobre segunda opção e sobre tensão no perfil** — nunca forçar uma indicação artificialmente confiante quando o perfil é de fronteira ou adjacente-distante.
- **Perfis órfãos/fora do óbvio são tratados como oportunidade, não como falha do sistema** — a devolutiva reconhece a singularidade e direciona para conversa consultiva com a equipe de captação/orientação, em vez de forçar um curso.
- **Identidade visual institucional**: paleta deep purple (#2A1F47) + coral (#EE4B42) + paper/off-white (#ECEDEE), tipografia serifada (Cormorant Garamond / Georgia) para títulos e citações, sans-serif (Inter) para corpo de texto, monospace (JetBrains Mono / Consolas) para tags e metadados técnicos — usada em todos os artefatos visuais produzidos até aqui.

---

*Fim do documento de contexto. Ver anexos para o conteúdo integral das perguntas e o explorador interativo dos perfis.*
