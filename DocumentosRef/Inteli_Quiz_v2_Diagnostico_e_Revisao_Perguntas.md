# Diagnóstico do Piloto v2 · Hipóteses de Revisão das Perguntas

**Registro de discussão técnica**
V01 — Setembro 2026

Este documento registra a sessão de diagnóstico aberta depois do primeiro teste manual do modelo v2: o quiz continuou indicando o curso errado como primeira opção — inclusive para quem já testou informalmente com outros alunos —, ainda que com distâncias mais próximas do que a v1 produzia. Consolida a hipótese original levantada pelo solicitante (granularidade da escala de resposta), o diagnóstico feito em cima de um caso real completo, as hipóteses de causa raiz encontradas, e o plano de validação acordado. Complementa [`Inteli_Quiz_Contexto_Completo.md`](Inteli_Quiz_Contexto_Completo.md) e o [`v2/README.md`](../v2/README.md), que já documenta a redução de saturação e a recalibração de limiares feita na v2.

---

## 1. Contexto e problema observado

A v2 corrigiu o problema estrutural da v1 (três eixos colineares, ver `v2/README.md`), mas um teste manual completo e outros testes informais com alunos continuaram apontando o curso errado como primeira opção — com uma diferença importante em relação à v1: as distâncias entre o curso indicado e o curso real ficaram bem mais próximas (na v1, um teste chegou a opor 4,1/5 contra 0,8/5; na v2, os casos observados ficam na faixa de poucos pontos de diferença). Isso sugere que a v2 melhorou a distribuição geral do espaço, mas ainda erra a direção para perfis específicos.

Não há dados estruturados dos outros testes informais — apenas o relato de que o padrão de erro se repetiu. O diagnóstico abaixo foi feito em cima do único caso com dados completos disponíveis.

## 2. Hipótese inicial: granularidade da escala de resposta

Hipótese trazida pelo solicitante: inspirada em testes de personalidade no formato Likert (Concordo totalmente / Concordo / Concordo parcialmente / discordo em três graus simétricos), a proposta foi expandir a escala de 4 pontos (`Totalmente A`, `Mais para A`, `Mais para B`, `Totalmente B`) para 6 pontos (`Totalmente A`, `Mais para A`, `Um pouco A`, `Um pouco B`, `Mais para B`, `Totalmente B`), mantendo o formato forçado sem opção neutra.

Racional original: mais níveis de resposta permitiriam ao aluno nivelar melhor o quanto uma resposta reflete o viés institucional tecnologia+liderança (ver seção 5), em vez de ser forçado para um dos dois polos com a mesma intensidade.

## 3. Diagnóstico com dados reais (caso completo)

Dados do teste manual: curso real informado = **Engenharia de Computação (EC)**; curso indicado pelo modelo = **ADM Tech**.

**Estado final nos 3 eixos:**

| Eixo | Valor |
|---|---|
| Camada | 0,911 |
| Amplitude | 0,500 |
| Modo | 1,643 |

**Distâncias calculadas (menor = mais compatível):**

| Curso | Distância | Afinidade exibida (0–5) |
|---|---|---|
| ADM Tech (indicado) | 1,041 | 4,1 |
| SI | 1,818 | 3,5 |
| CC | 2,330 | 3,0 |
| **EC (curso real)** | **3,047** | **2,4** |
| ES | 3,537 | 2,0 |

**Bloco sugestão × realidade:** posição do curso real no ranking = 4º de 5; distância perfil→indicado = 1,0; distância perfil→real = 3,0; delta (erro do modelo) = 2,0; distância entre as âncoras ADM Tech↔EC = 3,2.

**Quebra por eixo (contribuição de cada eixo para a distância até EC vs. até ADM Tech):**

| Eixo (peso) | Você | EC (real) | dist. até EC | ADM Tech (indicado) | dist. até ADM |
|---|---|---|---|---|---|
| Camada (0,8) | 0,91 | 2,72 | 1,45 | 0,24 | 0,54 |
| Amplitude (0,8) | 0,50 | 1,35 | 0,68 | 0,40 | 0,08 |
| Modo (1,5) | 1,64 | 1,03 | 0,92 | 1,36 | 0,42 |
| **Total** | | | **3,05** | | **1,04** |

**Conclusão do diagnóstico:** os três eixos — não apenas um — empurram o perfil para longe de EC e perto de ADM Tech. O erro é classificado como âncora-adjacente de alta confiança (gap de 0,777, bem acima do limiar de fronteira de 0,114) e o `delta_erro_modelo` (2,0) é alto junto com a `dist_entre_ancoras` (3,2) — segundo o próprio critério documentado em `teste-piloto/README.md`, essa combinação indica que **alguma pergunta está medindo o eixo errado**, não que os pesos entre cursos próximos estão mal calibrados. Como o perfil não está numa fronteira, mais resolução na escala não teria mudado o sinal de nenhuma resposta nem revertido o resultado — a hipótese de granularidade foi descartada como correção primária a partir desse ponto (retomada com mais profundidade na seção 6).

## 4. Hipóteses de causa raiz nas perguntas

Releitura das 8 perguntas núcleo da v2 (`v2/questions.js`) com o objetivo de encontrar itens que capturam um traço diferente do eixo que deveriam medir.

**Hipótese A — `C2` mede curiosidade abstrata, não profundidade real.**
O polo alto de Camada é definido como "entender como funciona por dentro, mesmo que você não precise disso pra usar" (curiosidade sem função), e o polo baixo como "ficar muito bom em usar pra resolver problemas de verdade" (pragmatismo). Isso é uma falsa dicotomia para perfis de engenharia: gente tecnicamente profunda pode não se identificar como "curiosa por curiosidade", e se ver como "quero dominar isso pra resolver coisa difícil de verdade" — que a redação atual classifica como Camada **baixa**, quando deveria ser **alta**.

**Hipótese B — `C1` tem teto baixo, não alcança "hardware/fundamentos".**
O polo B ("descobrir onde estão os problemas que fazem o app travar") descreve debug de aplicação — nível 2 da escala (Aplicação digital), nunca nível 3 (Hardware/Fundamentos). A pergunta não dá margem para diferenciar quem tende a ES de quem tende a EC/CC; todo perfil tecnicamente inclinado converge no mesmo lugar.

**Hipótese C — `M3` mede liderança/coordenação, não investigação.**
O polo B ("organizar o que falta ser feito e definir com o grupo qual caminho seguir") é rotulado como Investigador (Modo alto), mas descreve comportamento de coordenação de equipe — não "entender a fundo antes de agir". Essa é a hipótese mais forte porque bate diretamente com o caso diagnosticado na seção 3: a resposta a `M3` foi +2 (fortemente polo B).

## 5. Viés institucional: tecnologia + liderança

Informação trazida pelo solicitante durante a discussão: o Inteli tem "tecnologia e liderança" no próprio nome, com liderança presente nos 5 cursos (10% da grade curricular, ver seção 1 de `Inteli_Quiz_Contexto_Completo.md`). Isso faz com que alunos do Inteli **raramente respondam 100% tecnologia ou 100% liderança** — o perfil real tende a ser mais misto do que as âncoras dos cursos, que foram posicionadas a partir do conteúdo curricular de cada curso, não do perfil de personalidade observado em alunos já matriculados.

Isso refina o mecanismo da Hipótese C: não é que "liderança" puxe especificamente para ADM Tech — é que liderança é um traço **compartilhado por toda a base de alunos do Inteli** via PBL (trabalho em equipe, projeto multidisciplinar, pitch), então qualquer pergunta que capture esse traço tende a deslocar o eixo Modo **sistematicamente para cima em qualquer curso**, não apenas ruído aleatório. Como as âncoras de Modo não são uniformes entre os cursos — CC 1,73, ADM Tech 1,36, EC 1,03, SI 0,65, ES 0,17 — um deslocamento sistemático para cima favorece CC e ADM Tech (âncoras altas) em relação a SI e ES (âncoras baixas), independentemente do perfil real do respondente. Isso é coerente com o caso diagnosticado: o erro apontou para ADM Tech, a segunda âncora de Modo mais alta.

`C3` foi avaliada sob o mesmo filtro (foco em "quem o projeto afeta" pode soar como preocupação social presente em todo PBL do Inteli) e não foi reformulada agora, mas fica sinalizada para monitorar se o padrão de erro persistir depois do ajuste em `M3`.

## 6. Reformulações propostas

| Pergunta | Texto atual (polo problemático) | Texto proposto | Motivo |
|---|---|---|---|
| `C1` | poloB: "Descobrir onde estão os problemas que estão fazendo o app travar." | "Descobrir a causa raiz — seja no código, no hardware do aparelho ou na rede —, mesmo que isso signifique ir bem além do app em si." | Estica o polo até hardware/fundamentos, dando à pergunta alcance para separar ES de EC/CC (Hipótese B). |
| `C2` | poloA: "Ficar muito bom em usá-la para resolver problemas de verdade." / poloB: "Entender como ela funciona por dentro, mesmo que você não precise disso para usá-la." | poloA: "Aprender o suficiente pra aplicar bem numa tarefa real, sem se aprofundar além disso." / poloB: "Aprender a fundo como ela funciona por dentro, porque isso te dá controle real sobre o que está fazendo." | Troca "curiosidade sem função" por "profundidade com função", separando Camada do traço "curioso vs. pragmático" que hoje vaza de Modo (Hipótese A). |
| `M3` | poloB: "Organizar o que falta ser feito e definir com o grupo qual caminho seguir." | "Parar a produção, investigar por que travou antes de continuar, mesmo que isso atrase o grupo." | Remove a linguagem de coordenação/liderança (comum a todo aluno do Inteli via PBL) e deixa só o núcleo de "investigar antes de agir" (Hipótese C + seção 5). |

`A1`, `A2`, `M1`, `M2` foram revisadas e mantidas sem alteração — cada uma isola um contraste técnico específico sem linguagem de liderança/equipe.

## 7. Por que a granularidade não é a correção primária

Retomando a hipótese da seção 2: ela ataca a **amplitude do ruído** (quanto uma resposta pesa), não a **direção do viés** (para que lado a resposta empurra, e se isso tem relação com curso). O deslocamento identificado na seção 5 é sistemático, não aleatório — mais níveis de resposta (`Um pouco A/B`) permitiriam escolher uma opção mais fraca em vez de `Mais para B`, o que reduziria a magnitude do empurrão, mas não mudaria sua direção: perfis continuariam sendo puxados para CC/ADM Tech em vez de SI/ES, só que um pouco menos. A correção de redação remove a fonte do deslocamento; a granularidade apenas o atenua.

Depois que os itens estiverem medindo o eixo certo, a granularidade volta a ter função genuína: dar nuance a quem está de fato ambivalente dentro do contraste pretendido. Nesse ponto ela refina posição, não corrige direção.

Custo de implementação a considerar quando chegar essa etapa: redefinir `SCALE` com 6 valores, recalcular `PASSO` para a nova amplitude de resposta, e re-rodar a enumeração exaustiva de combinações (sobe de 65.536 para ≈1,68 milhão com 6 níveis em 8 perguntas) para confirmar que a saturação continua em 0% e re-derivar os limiares de classificação (`gapFronteira`, `d1Ancora`, `d1Orfao`), hoje calculados sobre a distribuição da escala de 4 pontos.

## 8. Plano acordado

1. **Reformular as perguntas** `C1`, `C2` e `M3` em `v2/questions.js`, conforme a seção 6.
2. **Rodar o teste novamente** com um grupo de alunos — idealmente os mesmos que já testaram, para obter dado pareado (mesma lógica já usada na recalibração v1→v2, ver `v2/README.md`).
3. **Avaliar se houve melhora real** na taxa de acerto do curso indicado (curso1 = curso real) e no `delta_erro_modelo` dos casos que ainda errarem.
4. **Se validado:** aplicar a mudança de granularidade da escala de resposta (seção 7) como refinamento incremental sobre um modelo já com os eixos corretos — não em paralelo com o passo 1, para conseguir isolar o efeito de cada mudança.
5. **Se não validado:** iterar mais na redação das perguntas (ou revisitar posicionamento de âncoras, ver hipótese levantada na seção 5) antes de considerar a granularidade.

## 9. Em aberto

- Nenhuma das hipóteses de causa raiz (seções 4–5) foi validada com dados de mais de um respondente completo — os relatos de outros testes existem, mas sem estado/distâncias registrados.
- Não foi decidido se as âncoras de curso (posicionadas a partir da grade curricular, seção 5 de `Inteli_Quiz_Contexto_Completo.md`) precisam ser ajustadas para refletir o perfil misto real dos alunos do Inteli, em vez do conteúdo curricular "puro" de cada curso — fica como hipótese complementar caso a reformulação de perguntas não resolva sozinha.
- `C3` está sinalizada para revisão condicional (seção 5), não decidida.

---

*Fim do documento. Ver [`v2/questions.js`](../v2/questions.js) para a implementação atual do modelo e [`v2/README.md`](../v2/README.md) para o histórico de recalibração v1→v2.*
