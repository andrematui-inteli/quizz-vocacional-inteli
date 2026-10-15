# v4 — 9 perguntas gerais + bloco final entre os dois cursos mais próximos

Quarta versão do modelo, derivada da v3 (12 afirmações). Isolada de `main`, `teste-piloto`, `v2` e `v3`, que continuam intocados como registro do que foi medido em cada rodada. Histórico rodada a rodada de redação, viés e escala em [`../v3/questions.js`](../v3/questions.js) e em [`../DocumentosRef/Inteli_Quiz_v2_Diagnostico_e_Revisao_Perguntas.md`](../DocumentosRef/Inteli_Quiz_v2_Diagnostico_e_Revisao_Perguntas.md).

## O que mudou, e por quê

| Mudança | Motivo |
| --- | --- |
| **12 → 9 perguntas gerais (3 por eixo)** | Itens redundantes medem o mesmo traço, na mesma direção, só trocando o cenário, e contam duas vezes uma única informação. Detalhe abaixo. |
| **5 itens trocados por temas novos** | Na revisão dos temas de cada pergunta, `A1`, `A4` e `C2` repetiam o tema Especialista, `M4` repetia o tema Entender e `M1` repetia `C1` (investigar o que falhou). Entraram 5 itens de temas que o banco ainda não tinha. |
| **Bloco final de 3 afirmações específicas** | Depois das 9 gerais, o aluno responde 3 afirmações sobre o conteúdo que separa os dois cursos mais próximos do perfil dele. O bloco decide qual dos dois é o curso indicado. |
| **`LIMIAR` conferido** | Continua 0,093 / 1,157 / 1,534: a distribuição dos estados só depende do número de itens por eixo e do módulo dos pesos, não do sinal. |

`SCALE`, `EIXOS`, `ANCORAS`, `PESO`, `FAIXA`, `CENTRO` e a fórmula do `PASSO` **não mudaram**. Quatro itens (`C1`, `M2`, `A3`, `C4`) mantêm o texto da v3. Os cinco novos têm ids novos (`C5`, `A5`, `A6`, `M5`, `M6`) para que respostas gravadas antes da troca, com `C2`, `A1`, `A4`, `M1` e `M4`, não sejam confundidas com as atuais.

## Os 9 itens

Sem a planilha de respostas no repositório não deu para medir correlação entre itens, então a revisão é por **conteúdo**. Cada item tem um tema (rótulo usado para conferir se dois itens falam da mesma coisa).

| Eixo | Id | Tema | Concordar leva a | Origem |
| --- | --- | --- | --- | --- |
| Camada | `C1` | Investigar | alto | v3 |
| Camada | `C5` | Infraestrutura | alto | novo, no lugar de `C2` |
| Camada | `C4` | Técnico x Financeiro | alto | v3 |
| Amplitude | `A5` | Integrador | **baixo** (invertido) | novo, no lugar de `A1` |
| Amplitude | `A3` | Especialista | alto | v3 |
| Amplitude | `A6` | Aperfeiçoar | alto | novo, no lugar de `A4` |
| Modo | `M6` | Porquê do acerto | alto | novo, no lugar de `M1` |
| Modo | `M2` | Explicar | alto | v3 |
| Modo | `M5` | Organização | **baixo** (invertido) | novo, no lugar de `M4` |

**Cortados por redundância** (4 itens por eixo na v3, 3 agora):

| Removida | Redundante com | Por quê |
| --- | --- | --- |
| `C3` | `C4` | Os dois medem se a atenção vai para o lado técnico de um projeto (C3: "como vai ser construído"; C4: "detalhes técnicos"). `C4` fica por ser o único item que ancora o polo de negócio (custo/receita). `C3` tinha peso 0,8 e estava sinalizado para revisão desde a v3. |
| `A2` | `A1` | Mesmo item com o cenário trocado: escolher um curso vs. escolher um projeto, nos dois "aprofundar um tema vs. passar por vários". |
| `M3` | `M1` | Os dois são "entender a causa do problema antes de seguir" (M1 individual, M3 em grupo). `M3` já tinha sido reescrito duas vezes por vazamento de método de projeto (PBL) e tinha peso 0,8. |

**Trocados por repetirem o tema de outro:**

| Saiu | Repetia | Entrou | Por quê |
| --- | --- | --- | --- |
| `A1`, `A4` | Especialista (`A3`) | `A5` Integrador, `A6` Aperfeiçoar | Os três itens de Amplitude descreviam só o polo Especialista, e nenhum descrevia o Integrador. `A5` descreve o Integrador (conectar áreas); `A6` mede aprimorar o que já domina em vez de explorar o novo, uma forma de ser especialista que não é "aprofundar um assunto". |
| `C2` | Especialista | `C5` Infraestrutura | O caminho da informação até a tela é um campo novo de Camada, diferente de depurar (`C1`) e de custo (`C4`). |
| `M1` | Investigar (`C1`) | `M6` Porquê do acerto | Nos dois, algo falhou e a pessoa vai atrás da causa; o `M1` só troca "o sistema que trava" por "o projeto que não saiu como esperado". O `M6` mantém a vontade de entender, num cenário de acerto. Direta, para Modo seguir com 2 diretos e 1 invertido. |
| `M4` | Entender (`M1`) | `M5` Organização | Mede planejar antes de agir, não entender o problema. Está na chave invertida porque "planejar antes" soa como a resposta madura e tende a puxar concordância, como já aconteceu com `M1` (6 de 7 respostas reais concordaram). |

Todos os pesos de item são ±1,0, então `SOMA_PESOS` = 3 em cada eixo e o `PASSO` fica 0,167 (camada), 0,111 (amplitude) e 0,111 (modo).

**Chaves:** Amplitude e Modo têm 2 itens diretos e 1 invertido, o que limita o efeito de quem concorda com tudo. **Camada tem 3 diretos e nenhum invertido** (já era assim na v3). Quem concorda com tudo é empurrado para Camada alta, e `Tecnologia como meio` ("Gosto de usar a tecnologia como ferramenta para fazer outras coisas acontecerem...") foi a candidata de item invertido que ficou de fora.

## Bloco final

Depois da 9ª pergunta geral, o modelo geral ordena os 5 cursos por distância. Os dois primeiros formam o par, e o aluno responde as 3 afirmações do bloco desse par (mesma escala de concordância de 7 níveis). Nenhuma afirmação cita nome de curso.

**Por que o conteúdo e não os eixos.** Os eixos já foram medidos pelas 9 gerais. Se o bloco voltasse a perguntar "fundo ou amplo", "por dentro ou por fora", repetiria o que o modelo já sabe, que é a mesma redundância que acabou de ser removida. As afirmações do bloco são sobre o que se constrói e com que tipo de problema se trabalha, tirado dos projetos da grade de cada curso (`Inteli_Quiz_Contexto_Completo.md`, seção 4).

**Quais pares têm bloco.** Enumeração exaustiva das 7⁹ = 40.353.607 combinações de resposta: só 7 dos 10 pares possíveis chegam a ser (1º, 2º). Confirmado com 2 milhões de perfis aleatórios e com os 19.683 cantos do espaço (±3 e 0 em cada item): nenhum ficou sem bloco.

| Par | Frequência | Curso com 2 itens |
| --- | --- | --- |
| ADM Tech × SI | 21,1% | SI |
| SI × ES | 20,2% | ES |
| ES × EC | 20,0% | EC |
| EC × CC | 16,8% | CC |
| SI × EC | 7,6% | SI |
| ADM Tech × EC | 7,2% | EC |
| ADM Tech × CC | 7,1% | ADM Tech |

ADM Tech × ES, SI × CC e ES × CC nunca aparecem com as âncoras atuais. Frequências com peso uniforme sobre as combinações de resposta, não previsão de comportamento real. Se as âncoras forem recalibradas, reverificar. Se um par sem bloco aparecer, o app cai no resultado geral em vez de quebrar.

**Pontuação.** Cada afirmação tem `favorece`: o curso para o qual concordar empurra (discordar empurra para o outro). Pontos = soma de (resposta × sinal), de −9 a +9. Positivo vence o 1º curso do par, negativo vence o 2º. Os 3 itens pesam igual, nenhum decide sozinho. **Zero não desempata**: vale o 1º colocado do modelo geral, e a devolutiva diz isso.

**Viés de aquiescência.** Cada bloco tem 2 itens de um curso e 1 do outro (o "sozinho" no meio). Assim quem concorda com tudo não é empurrado sempre para o mesmo lado, e o desbalanço máximo é de 3 dos 9 pontos. O curso com 2 itens alterna entre os pares (tabela acima), para que cada curso tenha 2 itens em cerca de metade dos pares em que aparece. O efeito que sobra existe: no teste ponta a ponta, um perfil que respondeu "Concordo totalmente" em tudo ficou em EC > CC no modelo geral e o bloco virou para CC, o curso com 2 itens.

**Devolutiva.** Os textos só afirmam desempate quando ele aconteceu: confirmou o 1º geral, virou para o 2º, ou empatou e manteve o 1º geral. Perfil órfão mantém o texto de sempre.

**Dados gravados.** `resultado` (tipo, gap, ranking, distâncias) continua sendo do modelo geral. `cursoIndicado` é o curso final. `acertou_geral` diz se o 1º do modelo geral sozinho teria acertado, e `acertou` se o curso final acertou. A comparação das duas colunas mede se o bloco melhora ou piora o resultado.

## Limiares de classificação

Re-derivados por enumeração das 7⁹ combinações (mesmo método da v3, agrupando por soma por eixo: 19 × 19 × 19 = 6.859 estados). O método foi validado reproduzindo os limiares da v3 com as 12 perguntas.

| Limiar | v3 (12 perguntas) | v4 (9 perguntas) | Origem |
| --- | --- | --- | --- |
| `gapFronteira` | 0,083 | 0,093 | percentil 12 dos gaps |
| `d1Ancora` | 1,182 | 1,157 | percentil 50 das distâncias ao curso mais próximo |
| `d1Orfao` | 1,522 | 1,534 | percentil 90 |

A classificação descreve o **perfil geral** e alimenta a devolutiva. Quem escolhe o curso indicado é o bloco.

## Rodar localmente

Servidor estático na raiz do repositório e abrir `/v4/`. Sem dependências.

## Antes de enviar para respondentes

1. A planilha é a da v3 com 8 colunas a mais no final (`curso_geral_*`, `acertou_geral`, `bloco_*`). Dá para reaproveitar a da v3 ou da v2: o `Code.gs` completa o cabeçalho sozinho. Se preferir manter os dados separados, crie uma planilha nova.
2. Colar [`apps-script/Code.gs`](apps-script/Code.gs) no Apps Script da planilha, rodar `configurar` e `testarEnvio` no editor (cria a aba e grava uma linha "TESTE (apagar)") e publicar como App da Web. O passo a passo curto está no comentário do topo do `Code.gs`; o completo, em [`../teste-piloto/apps-script/README.md`](../teste-piloto/apps-script/README.md). Em planilha reaproveitada, o `Code.gs` novo precisa ser implantado (nova versão) para valer. O script também bloqueia texto que começaria fórmula (`=`, `+`, `-`, `@`) e usa trava contra envios simultâneos, porque o endereço é público.
3. Colar a URL em [`config.js`](config.js).

Sem `GAS_URL` configurado, o quiz não trava: baixa um `.json` com a resposta no navegador de quem responde.

## O que ainda não foi validado

**Nenhum número desta versão foi validado contra alunos.** O que foi verificado é estrutural: enumeração de combinações, varredura aleatória com as funções reais e o fluxo completo no navegador (avanço, voltar, empate, virada, par sem bloco, curso "Outro", envio). Não prevê comportamento real.

## Pendências conhecidas

- **Os 5 itens novos (`C5`, `A5`, `A6`, `M5`, `M6`) não foram testados** e não são comparáveis com respostas anteriores da v4. Os dois testes do solicitante usaram conjuntos diferentes: o primeiro com `C2`, `A1`, `A4` e `M4`; o segundo com `C5`, `A5`, `A6` e `M5`, ainda com `M1`.
- **Os 21 textos do bloco são rascunho** e precisam de revisão. Aplicam as mesmas regras de estilo das gerais (sem "Num", sem travessão).
- **O bloco sempre decide, mesmo contra um resultado geral de alta confiança.** Um perfil "âncora-adjacente" com gap grande pode virar por 3 respostas. Alternativa: somar o gap do modelo geral à pontuação do bloco, o que exige calibrar uma conversão entre as duas escalas, sem dados hoje. Comparar `acertou` com `acertou_geral` nas primeiras respostas mostra se vale a pena.
- **Correlação entre itens.** Com a planilha exportada dá para calcular a correlação item a item e confirmar (ou trocar) os três cortes.
- O formulário de feedback não pergunta especificamente sobre as 3 perguntas finais.
- Herdadas da v3: recalibração de âncoras (hipótese em aberto) e a dimensão de intenção/objetivo futuro que ficou de fora.
