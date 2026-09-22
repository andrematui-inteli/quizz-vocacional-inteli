# v3 — afirmação única + escala de concordância

Terceira versão do modelo, redesenhada a partir do diagnóstico de um teste manual da v2 (curso real errado como primeira opção, apesar de distâncias mais próximas que a v1). Isolada de `main`, `teste-piloto` e `v2`, que continuam intocados como referência e registro do que foi medido em cada rodada. Raciocínio completo do diagnóstico em [`../DocumentosRef/Inteli_Quiz_v2_Diagnostico_e_Revisao_Perguntas.md`](../DocumentosRef/Inteli_Quiz_v2_Diagnostico_e_Revisao_Perguntas.md).

## O que mudou, e por quê

O diagnóstico de um caso completo mostrou que os três eixos da v2 (não só um) empurravam o perfil para longe do curso real — delta de erro alto (2,0) junto com distância entre âncoras alta (3,2), padrão que o próprio `teste-piloto/README.md` associa a "pergunta medindo o eixo errado", não a peso mal calibrado entre cursos vizinhos.

| Mudança | Motivo |
| --- | --- |
| **Dilema A/B virou afirmação única** | O par de polos escondia mal a lógica de "duas opções" e limitava a escala a 4 pontos. Uma afirmação única respondida por concordância abre espaço para mais níveis sem reintroduzir um ponto neutro (que gera efeito de tendência central). |
| **Escala de 4 para 6 níveis** | `Discordo totalmente / Discordo / Discordo parcialmente / Concordo parcialmente / Concordo / Concordo totalmente`, sem opção neutra. Decidido em conjunto com a reescrita das afirmações — como o formato mudou, as correções de redação abaixo já nasceram no formato novo, então não fazia sentido testar as duas mudanças em rodadas separadas. |
| **`C1` reformulada** | Na v2, o polo alto de Camada nunca alcançava "hardware/fundamentos" — só chegava a debug de aplicação. Isso não separava quem tende a ES de quem tende a EC/CC. A nova afirmação estica o polo até hardware/conexão. |
| **`C2` reformulada** | Definia o polo alto de Camada como "curiosidade sem função" e o polo baixo como pragmatismo — uma falsa dicotomia para perfis técnicos, que podem querer profundidade *com* função. A nova afirmação liga profundidade a controle real sobre o que se está fazendo. |
| **`M3` reformulada** | O polo "investigador" descrevia coordenação de equipe ("organizar o que falta, definir caminho com o grupo") — comportamento de liderança que todo aluno do Inteli pratica via PBL, não um traço que diferencia curso. Isso empurrava sistematicamente o eixo Modo para cima em qualquer curso, favorecendo as âncoras de Modo mais altas (CC, ADM Tech) independente do perfil real. A nova afirmação isola só "investigar antes de agir". |
| **`PASSO` generalizado** | `passo = (faixa/2) / (SCALE_MAX × soma dos pesos do eixo)`, com `SCALE_MAX = 3`. Mesma propriedade da v2: concordar/discordar totalmente em todos os itens de um eixo, no mesmo sentido, chega exatamente ao extremo da faixa. |

`ANCORAS`, `PESO`, `FAIXA`, `CENTRO`, o número de perguntas (8) e a ausência de pergunta adaptativa **não mudaram** — ver `v2/README.md` para o raciocínio original por trás desses pontos.

## Trade-off assumido

Redação e granularidade mudaram juntas nesta versão. Isso significa que, se o próximo teste mostrar melhora, **não vai dar para saber se foi a correção de redação, o aumento de granularidade, ou os dois** — os efeitos ficam combinados. Aceito conscientemente em troca de um ciclo de teste só em vez de dois; se a melhora for insuficiente, o próximo passo é revisitar as âncoras dos cursos (hipótese em aberto, ver seção 10 do documento de diagnóstico), não repetir a mudança de escala.

## Limiares de classificação

Re-derivados por enumeração exaustiva das 6⁸ = 1.679.616 combinações de resposta possíveis (mesmo método da v2, escalado para a escala de 6 níveis):

| Limiar | Valor | Origem |
| --- | --- | --- |
| `gapFronteira` | 0,095 | percentil 12 dos gaps |
| `d1Ancora` | 1,165 | percentil 50 das distâncias ao curso mais próximo |
| `d1Orfao` | 1,590 | percentil 90 |

Próximos dos valores da v2 (0,114 / 1,168 / 1,634) — a granularidade maior suaviza a distribuição, mas não muda a geometria do espaço, que depende das âncoras, não da escala de resposta.

## Rodar localmente

Servidor estático na raiz do repositório e abrir `/v3/`. Sem dependências.

## Antes de enviar para respondentes

1. As colunas da planilha são as mesmas da v2 (`camada`/`amplitude`/`modo`, ids `C1`–`M3`), então dá para reaproveitar a planilha da v2 — o campo `versao_modelo` já distingue as linhas por versão. Se preferir manter os dados separados, crie uma planilha nova.
2. Colar [`apps-script/Code.gs`](apps-script/Code.gs) no Apps Script da planilha (nova ou reaproveitada) e publicar como App da Web, se ainda não estiver publicado. Passo a passo em [`../teste-piloto/apps-script/README.md`](../teste-piloto/apps-script/README.md).
3. Colar a URL em [`config.js`](config.js).

Sem `GAS_URL` configurado, o quiz não trava: baixa um `.json` com a resposta no navegador de quem responde.

## O que ainda não foi validado

**Nenhum número desta versão foi validado contra alunos.** O plano de validação (seção 9 do documento de diagnóstico) é reconvidar os mesmos alunos que já testaram a v2 — dado pareado, mesma lógica usada na recalibração v1→v2.

Toda a verificação acima é estrutural: enumeração de combinações com peso uniforme, referência neutra, não previsão de comportamento real.

## Pendências conhecidas

- **Recalibração de âncoras** — hipótese em aberto se a reformulação de redação não for suficiente: as âncoras foram posicionadas a partir da grade curricular de cada curso, não do perfil de personalidade misto que alunos do Inteli de fato têm (viés tecnologia + liderança, ver documento de diagnóstico).
- **`C3`** ficou sinalizada para revisão condicional — não reformulada nesta rodada, mas deve ser revisitada se o padrão de erro persistir depois deste teste.
- Herdadas da v2, ainda não endereçadas: CC com a menor taxa de perfis-âncora (canto do espaço), e a dimensão de intenção/objetivo futuro que ficou de fora por decisão (ver `v2/README.md`).
