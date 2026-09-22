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

*Redação intermediária, ainda no formato A/B — superada em forma (não em raciocínio) pela decisão da seção 8-bis, que reescreveu essas três correções já como afirmação única.*

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

## 8. Plano original (seção substituída pela decisão da seção 8-bis)

1. ~~Reformular as perguntas `C1`, `C2` e `M3` em `v2/questions.js`, conforme a seção 6.~~
2. ~~Rodar o teste novamente com um grupo de alunos — idealmente os mesmos que já testaram, para obter dado pareado.~~
3. ~~Avaliar se houve melhora real antes de mexer na escala.~~
4. ~~Se validado, aplicar a granularidade como refinamento incremental separado, para isolar o efeito de cada mudança.~~
5. ~~Se não validado, iterar mais na redação antes de considerar a granularidade.~~

Esse plano faseado (redação primeiro, granularidade depois, só se validado) foi a recomendação registrada nas seções 3–7. A equipe decidiu não seguir a fase separada — ver seção 8-bis.

## 8-bis. Decisão final: afirmação única + escala de concordância de 6 níveis

Depois de revisar este documento, a decisão tomada foi combinar as duas mudanças — reformulação de redação e aumento de granularidade — numa única revisão, e também mudar o **formato** da pergunta: em vez de dilema A/B, cada pergunta passou a ser uma **afirmação única**, respondida numa escala de concordância de 6 níveis sem ponto neutro:

`Discordo totalmente` · `Discordo` · `Discordo parcialmente` / `Concordo parcialmente` · `Concordo` · `Concordo totalmente`

**Trade-off registrado:** isso torna impossível isolar, no próximo teste, se uma eventual melhora veio da correção de redação (seção 4–5) ou do aumento de granularidade (seção 7) — os dois efeitos ficam combinados num único teste. A equipe optou por aceitar esse trade-off em troca de velocidade (um ciclo de teste em vez de dois) e por conta do câmbio de formato: como a pergunta deixou de ser um dilema entre dois polos redigidos separadamente e virou uma única afirmação, as três reformulações da seção 6 tiveram que ser reescritas de qualquer forma nesse novo formato — não fazia sentido revisar a redação duas vezes (uma para o formato A/B, outra para o formato de afirmação).

**As 8 afirmações finais** (implementadas em `v3/questions.js` — ver seção 8-ter), todas redigidas para que concordar mova o eixo para o polo "alto" (equivalente ao antigo polo B) e discordar para o polo "baixo" (antigo polo A):

| id | eixo (peso) | Afirmação |
|---|---|---|
| `C1` | camada (1,0) | "Quando um app que uso trava, prefiro investigar a causa técnica raiz — no código, no hardware ou na conexão — a só identificar o que está incomodando quem usa." |
| `A1` | amplitude (1,0) | "Entre dois projetos possíveis, eu prefiro um que entra fundo em um problema só — onde eu precise dominar bem aquele assunto — a um que passa por várias áreas diferentes." |
| `M1` | modo (1,0) | "Diante de um problema difícil, meu primeiro impulso é parar para entender a causa a fundo antes de construir qualquer coisa — não colocar a mão na massa direto." |
| `C2` | camada (1,0) | "Quando vou aprender uma ferramenta nova, quero entender como ela funciona por dentro — isso me dá controle real sobre o que estou fazendo, não só aprender o suficiente para usá-la." |
| `M2` | modo (1,0) | "No fim de um projeto, o que me deixa mais satisfeito é ter entendido por que o problema acontecia e qual era o melhor jeito de resolver — mais do que só ver a solução funcionando." |
| `A2` | amplitude (1,0) | "No fim de um ano, prefiro poder dizer que fiquei muito bom numa coisa difícil a dizer que estudei muitos assuntos diferentes." |
| `C3` | camada (0,8) | "Numa conversa sobre um projeto novo, a parte que mais me chama atenção é como ele vai ser construído tecnicamente para funcionar de verdade — mais do que quem ele vai afetar." |
| `M3` | modo (0,8) | "Num trabalho em grupo que travou, meu impulso costuma ser parar a produção e investigar a causa do travamento antes de continuar — mesmo que isso atrase o grupo." |

**Consequências técnicas implementadas:**

- `PASSO` generalizado de `faixa / (4 × soma_pesos)` para `faixa / (2 × SCALE_MAX × soma_pesos)`, com `SCALE_MAX = 3` (módulo máximo da nova escala), preservando a mesma propriedade de calibração da v2 original: concordar/discordar totalmente em todos os itens de um eixo, no mesmo sentido, chega exatamente ao extremo da faixa.
- `LIMIAR` (`gapFronteira`, `d1Ancora`, `d1Orfao`) re-derivado por enumeração exaustiva das 6⁸ = 1.679.616 combinações possíveis (mesmo método da calibração original, escalado para a nova escala): `gapFronteira` = 0,095 (era 0,114), `d1Ancora` = 1,165 (era 1,168), `d1Orfao` = 1,590 (era 1,634). Números próximos aos anteriores — a granularidade maior suaviza a distribuição, mas não muda a geometria do espaço, que depende das âncoras, não da escala de resposta.
- `ANCORAS`, `PESO`, `FAIXA`, `CENTRO` **não foram alterados** — são posições no espaço contínuo dos eixos, independentes da escala de resposta usada para chegar até elas. A hipótese de recalibrar âncoras (seção 10) segue em aberto.
- UI (`app.js`, `style.css`): removida a renderização dos dois polos lado a lado (`poles`/`pole`/`pole-label`); a pergunta agora mostra só a afirmação (`question-text`) e 6 botões de resposta.

## 8-ter. Onde a mudança foi implementada: nova pasta `v3/`

Seguindo o mesmo padrão já estabelecido entre `main` (v1) → `teste-piloto` → `v2` — cada versão testada isolada, sem sobrescrever a anterior —, a implementação da seção 8-bis foi colocada numa pasta nova, `v3/`, e não dentro de `v2/`. `v2/` foi revertida ao estado do dilema A/B de 4 níveis e permanece intocada como referência e registro do que foi diagnosticado nas seções 3–5. `v3/README.md` documenta a mudança no mesmo formato do `v2/README.md` ("O que mudou, e por quê").

Escopo: mudança aplicada **apenas na v3**. `main` (v1), `teste-piloto` e `v2` permanecem intocados, como registro do que foi medido em cada rodada.

## 9. Plano de validação atualizado

1. **Rodar o teste com um grupo de alunos**, usando `v3/`, idealmente os mesmos que já testaram informalmente a v2 — para obter dado pareado com o teste anterior (mesma lógica da recalibração v1→v2, documentada no `v2/README.md`).
2. **Avaliar a taxa de acerto do curso indicado** (curso1 = curso real) e o `delta_erro_modelo` dos casos que ainda errarem, comparando com a v2 anterior (formato A/B, 4 níveis).
3. **Se a melhora for insuficiente:** como redação e granularidade mudaram juntas, não dá para saber qual delas (ou se as duas) foi insuficiente. Nesse cenário, o próximo passo é revisitar a hipótese de recalibração de âncoras (seção 5) — não repetir a mesma mudança de nível de resposta, que já é a mais granular considerada até aqui sem reintroduzir ponto neutro.

## 9-bis. Primeiros resultados reais da v3

Quatro respostas completas coletadas na v3 até agora, todas de alunos de **Engenharia de Computação (EC)** — três colegas testados em bloco, mais um reteste do próprio solicitante (que na v2 tinha caído em ADM Tech, ver seção 3):

| # | Estado (camada / amplitude / modo) | Curso indicado | 2º lugar | Curso real | Resultado | gap |
|---|---|---|---|---|---|---|
| 1 | 2,71 / 1,83 / 0,57 | EC | ES | EC | ✅ acertou | 0,705 |
| 2 | 2,50 / 1,00 / 1,76 | CC | EC | EC | ❌ errou | 0,978 |
| 3 | 2,50 / 0,67 / 1,17 | EC | CC | EC | ✅ acertou | 0,712 |
| 4 (solicitante) | 1,79 / 1,17 / 1,55 | CC | EC | EC | ❌ errou (mas tipo "adjacente-distante", EC como 2º muito próximo) | 0,431 |

**2 de 4 corretos** — melhora clara sobre a v2, onde o único caso com dado completo (seção 3) errou com alta confiança (âncora-adjacente, gap 0,777) e o curso real ficou em 4º lugar. Na v3, mesmo os dois casos que erraram deixaram de errar "com confiança falsa": o caso 4 caiu em "adjacente-distante" (reconhece tensão) em vez de âncora-adjacente, e o curso real aparece como 2º colocado em ambos os erros, não distante no ranking.

**Padrão nos dois erros:** os dois casos que erraram (#2 e #4) têm Modo alto (1,76 e 1,55 — fortemente "investigador"), o que os empurra para a âncora de Modo da CC (1,73), mais alta que a do EC (1,03, o eixo de maior peso do modelo — 1,5). Os dois que acertaram têm Modo mais baixo ou central (0,57 e 1,17).

**Teste de sensibilidade da âncora `EC.modo`** (varredura contra os 4 casos acima, sem alterar o código): não existe um valor único que acerte os 4.

| `EC.modo` testado | Caso 1 | Caso 2 | Caso 3 | Caso 4 |
|---|---|---|---|---|
| 1,03 (atual) | ✅ | ❌ CC | ✅ | ❌ CC |
| **1,40** | ✅ (gap 0,15) | ❌ CC (gap 0,42) | ✅ | **✅ (gap 0,12)** |
| 1,73 (= âncora CC) | ❌ ES | ✅ (fronteira) | ✅ (fronteira) | ✅ (fronteira) |

Subir a âncora para ~1,40 resolveria o caso 4 sem quebrar 1 e 3, mas não resolve o caso 2 — que só vira correto perto de 1,73, ponto em que o eixo Modo deixa de discriminar EC de CC (âncoras praticamente iguais) e o caso 1 (o mais "construtor" dos quatro) passa a errar para ES. Isto é, o caso 2 pode não ser um problema de calibração fina, e sim um sinal de que Modo, como definido hoje, não separa EC de CC tão bem quanto o modelo assume — alunos reais de EC parecem ocupar quase a mesma faixa de Modo que se esperaria de CC.

**Por que não mexer na âncora ainda:** toda a varredura acima foi otimizada só contra os 4 pontos de EC — nenhum dado de aluno de CC até agora. Subir a âncora de Modo do EC sem checar contra CC arrisca resolver estes 4 casos às custas de começar a indicar EC para quem é de CC de verdade, um erro que não há como enxergar com os dados atuais.

## 10. Em aberto

- Nenhuma das hipóteses de causa raiz das seções 4–5 foi validada com mais de um respondente completo na v2 (o único caso com dado completo é o da seção 3). Os 4 pontos da v3 (seção 9-bis) são o começo dessa validação, mas ainda não cobrem os outros 4 cursos.
- **Recalibração da âncora `EC.modo`** (levantada na seção 5 como hipótese geral, testada concretamente na seção 9-bis): subir para ~1,40 resolveria 3 dos 4 casos conhecidos sem quebrar os outros dois, mas não resolve o 4º — que parece exigir repensar se Modo discrimina EC↔CC tão bem quanto assumido, não só recalibrar um número. Bloqueado por falta de dados de alunos de CC.
- `C3` está sinalizada para revisão condicional (seção 5), não decidida.
- Nenhum teste da v3 ainda cobriu ADM Tech, SI, ES ou CC — só há dado de EC até agora.

---

*Fim do documento. Ver [`v3/questions.js`](../v3/questions.js) para a implementação atual do modelo, [`v3/README.md`](../v3/README.md) para o resumo da mudança v2→v3, e [`v2/README.md`](../v2/README.md) para o histórico de recalibração v1→v2.*
