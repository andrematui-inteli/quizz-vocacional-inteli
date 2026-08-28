# v2 — modelo redesenhado

Segunda versão do modelo, redesenhada a partir do diagnóstico do piloto (13 respostas de alunos de graduação). Isolada de `main` e de `teste-piloto`, que continuam intocados como referência e como registro do que foi medido.

## O que mudou, e por quê

O piloto mostrou que o modelo v1 não tinha dimensões faltando — tinha **três dimensões que ordenavam os cinco cursos exatamente da mesma maneira** (ADM Tech → SI → ES → EC → CC). Correlação Foco × Camada de 0,871 nas âncoras e 0,755 nos alunos reais. Três eixos que ordenam igual não são três eixos.

| Mudança | Motivo |
| --- | --- |
| **Foco de Impacto aposentado** | 87% redundante com Camada. Nos dados reais, remover Foco *melhorava* o resultado (3/13 → 4/13); usar só Camada era melhor que os três eixos juntos (5/13). |
| **Estilo virou plano contínuo** | Era categoria de 3 valores decidida pelo *sinal de uma única pergunta* (q4), com penalidade binária de 1,3 — maior que a distância entre cursos vizinhos (1,2). Agora são dois eixos contínuos: **Amplitude** (Integrador↔Especialista) e **Modo** (Construtor↔Investigador), que são os dois contrastes já previstos no documento de contexto original. O defeito da v1 foi tornar o segundo *condicional* ao primeiro. |
| **Um item, um eixo** | Na v1, `q2` e `q6` carregavam Foco e Camada no mesmo sentido, acorrentando os dois eixos algebricamente — nenhum posicionamento de âncora os tornaria independentes. |
| **Passo derivado, não escolhido** | `passo = faixa ÷ (4 × soma dos pesos do eixo)`. Na v1, responder "Mais para A" nas três perguntas de Camada levava de 1,5 a **0,2** — quase o extremo. A escala de 4 pontos funcionava como uma de 2. |
| **Âncoras reposicionadas** | Otimizadas numericamente dentro de faixas conceituais definidas a priori por curso e eixo. Nenhum eixo é monotônico na ordem ADM→CC, e todo par de cursos vizinhos tem ≥2 separadores. |
| **8 perguntas em vez de 6** | 3 Camada, 2 Amplitude, 3 Modo. Nenhum eixo pode ser decidido por um único item. |
| **Sem pergunta adaptativa** | Ver abaixo. |

## Resultado medido

Enumeração completa das 65.536 combinações de resposta possíveis, comparada com a v1:

| Métrica | v1 | v2 |
| --- | --- | --- |
| Saturação da escala | ±1 já saturava | **0%** |
| Eixos colineares entre si | 3 de 3 | **0 de 3** |
| Pares vizinhos com 1 só separador | 3 de 4 | **0 de 4** |
| Perfis em fronteira | 43,1% | **12,0%** |
| Perfis de alta confiança | 33,3% | **48,3%** |
| Desbalanceamento entre cursos | 2,66× | **1,97×** |
| EC (curso mais faminto na v1) | 10,2% | 25,0% |

Distribuição por curso na v2: ADM Tech 20,8% · SI 23,7% · ES 17,7% · EC 25,0% · CC 12,7%.

## Por que não há pergunta adaptativa

Decisão deliberada para esta rodada. Na v1, o limiar de fronteira (`gap < 0,8`) caía exatamente na **mediana** da distribuição de gaps, o que jogava 43% dos perfis em "empate" e chamava as adaptativas para arbitrar quase metade dos respondentes — que elas não conseguiam resolver (só 44% de sucesso, porque pesos de 0,4–0,7 não vencem um limiar de 0,8). Além disso, três pares podiam empatar sem ter adaptativa disponível.

Com fronteira em 12% e os limiares recalibrados, o desempate deixa de ser urgente. Duas das antigas adaptativas foram promovidas ao núcleo, no eixo correto:

- `adaptC` (EC↔CC) → **M2**, no eixo Modo
- `adaptA` (ADM↔SI) → **M3**, no eixo Modo — a otimização mostrou independentemente que esse contraste é justamente o que melhor separa esse par, e na v1 ele estava pontuado em Camada

Reintroduzir uma camada adaptativa é opcional e fica para depois de medir esta versão.

## Limiares de classificação

Derivados da distribuição real do modelo, não escolhidos a olho:

| Limiar | Valor | Origem |
| --- | --- | --- |
| `gapFronteira` | 0,114 | percentil 12 dos gaps |
| `d1Ancora` | 1,168 | percentil 50 das distâncias ao curso mais próximo |
| `d1Orfao` | 1,634 | percentil 90 |

## Rodar localmente

Servidor estático na raiz do repositório e abrir `/v2/`. Sem dependências.

## Antes de enviar para respondentes

1. Criar uma planilha **nova** (não reusar a do piloto: as colunas mudaram — grava `camada`/`amplitude`/`modo` em vez de `foco`/`camada`/`estilo`, e os ids das respostas são `C1`–`M3` em vez de `q1`–`q6`).
2. Colar [`apps-script/Code.gs`](apps-script/Code.gs) no Apps Script da planilha e publicar como App da Web. Passo a passo igual ao da v1, em [`../teste-piloto/apps-script/README.md`](../teste-piloto/apps-script/README.md).
3. Colar a URL em [`config.js`](config.js).

Sem `GAS_URL` configurado, o quiz não trava: baixa um `.json` com a resposta no navegador de quem responde.

## O que ainda não foi validado

**Nenhum número desta versão foi validado contra alunos.** Os eixos novos exigem perguntas que não existiam, então as 13 respostas do piloto não podem ser reprocessadas nesta versão — elas não contêm respostas para `A1`, `A2`, `C1`, `C3`, `M3`.

Toda a verificação acima é estrutural: enumeração de combinações com peso uniforme, que é uma referência neutra e não uma previsão de comportamento real. A validação depende de uma nova rodada de respostas — e a via mais barata é reconvidar os mesmos 13 respondentes, o que dá dados emparelhados (mais poder estatístico que uma amostra nova do mesmo tamanho) e permite perguntar diretamente se esta versão descreveu melhor.

## Pendências conhecidas

- **CC ficou em 12,7%**, o mais baixo dos cinco. É o espelho do problema antigo: CC agora é um canto do espaço, e cantos são mais difíceis de alcançar por combinação de respostas que o centro.
- **A antiga `q1`** (*"o que te enche mais de energia"*) ficou órfã: ela só carregava Foco. Pode ser reaproveitada como quarto item de Amplitude ou Modo, mas a redação atual não serve direto para nenhum dos dois.
- **A dimensão de intenção/objetivo futuro** que dois alunos pediram continua fora, por decisão: ela reprova no critério de independência (ordena os cursos na mesma fila) e o público-alvo real do quiz — candidatos de ensino médio — provavelmente não tem essa clareza formada. Vale endereçar no texto da devolutiva, não no modelo.
