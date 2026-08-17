# Mapa de Variáveis · Planilha de Resultados do Piloto

Dicionário de dados da planilha gerada pela versão de teste do Quiz Vocacional Inteli (`teste-piloto/`), escrito para ser lido por um modelo de IA junto com o `Inteli_Quiz_Contexto_Completo.md`.

**Objetivo do piloto:** alunos de graduação já matriculados no Inteli respondem o quiz; compara-se o curso indicado com o curso que eles realmente fazem, para recalibrar os pesos das perguntas. Essa recalibração pós-piloto está prevista nas seções 7.2 e 8.2 do contexto completo.

> **Instrução de leitura para a IA:** este documento descreve o comportamento **do código efetivamente implantado**, verificado por execução. Onde ele divergir do `Inteli_Quiz_Contexto_Completo.md`, **este documento prevalece** — o contexto completo descreve a fase de modelagem (36 perfis discretos), e a implementação real é contínua. As divergências conhecidas estão listadas na seção 8.

---

## 1. Formato do dataset

- Uma planilha do Google, aba **`Respostas`**, alimentada por um Google Apps Script.
- **Uma linha por envio de formulário**, acrescentada no momento do envio.
- **23 colunas**, na ordem fixa da seção 4.
- Não há identificador único de respondente. A mesma pessoa pode enviar mais de uma vez (existe um botão "Responder novamente"), então trate `nome` + `timestamp` como chave e verifique duplicatas antes de agregar.

---

## 2. O modelo em uma página

Necessário para interpretar as colunas. Detalhamento pedagógico das dimensões está no contexto completo, seções 3 a 5.

### 2.1 Escala de resposta

Toda pergunta é um dilema A/B com 4 opções. **Não existe opção neutra:**

| Opção exibida | Valor gravado |
|---|---|
| Totalmente A | `-2` |
| Mais para A | `-1` |
| Mais para B | `+1` |
| Totalmente B | `+2` |

O **sinal** indica o polo (negativo = A, positivo = B); o **módulo** indica a intensidade.

### 2.2 As três dimensões, como implementadas

| Eixo | Tipo | Início | Fórmula de atualização | Limites |
|---|---|---|---|---|
| `foco` | contínuo | `1.0` | `foco + valor × peso × 0.35` | truncado em `[0, 2]` |
| `camada` | contínuo | `1.5` | `camada + valor × peso × 0.5` | truncado em `[0, 3]` |
| `estiloIntegrador` | acumulador | `0` | `+= valor × peso` | sem limite |
| `estiloConstrutor` | acumulador | `0` | `+= valor × peso` | sem limite |

O **estilo** não é um eixo numérico: é uma categoria derivada dos dois acumuladores por uma regra hierárquica.

```
se estiloIntegrador  < 0  ->  "Integrador"
senão, se estiloConstrutor <= 0  ->  "Construtor"
senão  ->  "Investigador"
```

Note que só o **sinal** dos acumuladores importa — o módulo é descartado (ver seção 8.3).

### 2.3 Pesos por pergunta

Estes são os números que o piloto quer recalibrar.

| Pergunta | Eixos movimentados (peso) |
|---|---|
| `q1` | foco (1.0) |
| `q2` | foco (0.6), camada (1.0) |
| `q3` | camada (1.0) |
| `q4` | estiloIntegrador (1.0) |
| `q5` | estiloConstrutor (1.0) |
| `q6` | foco (0.6), camada (0.6) |
| `adaptA` (ADM Tech ↔ SI) | camada (0.6) |
| `adaptB` (ES ↔ EC) | camada (0.6) |
| `adaptC` (EC ↔ CC) | estiloConstrutor (0.7) |
| `adaptD` (SI ↔ ES) | estiloIntegrador (0.5), camada (0.4) |

### 2.4 Âncoras dos 5 cursos

| Curso | foco | estilo | camada |
|---|---|---|---|
| ADM Tech | 0 | Integrador | 0 |
| SI | 0 | Integrador | 1 |
| ES | 1 | Construtor | 2 |
| EC | 1 | Construtor | 3 |
| CC | 2 | Investigador | 3 |

### 2.5 Métrica de distância

```
distância = |Δfoco| × 1.0  +  (0 se estilo igual, 1 se diferente) × 1.3  +  |Δcamada| × 1.2
```

A componente de estilo é **binária**: contribui 0 ou 1.3, nunca um valor intermediário.

### 2.6 Regras de classificação

Avaliadas **nesta ordem**, com `d1` = distância ao curso mais próximo e `gap` = `d2 − d1`:

| Ordem | Condição | `tipo_classificacao` |
|---|---|---|
| 1º | `d1 ≤ 2.2` **e** `gap < 0.8` | `fronteira` |
| 2º | `d1 ≤ 1.5` **e** `gap ≥ 0.8` | `âncora-adjacente` |
| 3º | `d1 < 2.8` | `adjacente-distante` |
| 4º | resto | `órfão` |

A ordem importa: um perfil com `d1 ≤ 1.5` mas `gap < 0.8` é classificado como `fronteira`, não como `âncora-adjacente`.

### 2.7 Fluxo

1. 6 perguntas núcleo (`q1`–`q6`), todos respondem.
2. Classifica-se o perfil. Se der `fronteira` **e** existir pergunta adaptativa para aquele par, uma 7ª pergunta é feita.
3. Após a adaptativa, **as distâncias e a classificação são recalculadas do zero** sobre o estado atualizado.

---

## 3. Como as colunas são produzidas

```
respostas (q1..q6 [+ adaptX])
        │
        ├──> foco, camada, estilo_integrador, estilo_construtor        (colunas 18–21)
        │           │
        │           └──> estilo categórico (NÃO gravado — derive pela regra 2.2)
        │                       │
        │                       └──> distancias_json: distância aos 5 cursos   (coluna 23)
        │                                   │
        │                                   ├──> curso_indicado, curso_indicado_2,
        │                                   │    tipo_classificacao, gap        (colunas 5–8)
        │                                   │
        │                                   └──> cruzamento com curso_real:
        │                                        acertou, rank_curso_real,
        │                                        dist_perfil_*, delta_erro_modelo,
        │                                        dist_entre_ancoras              (colunas 9–14)
        │
        └──> respostas_raw_json  (coluna 22) — a fonte para reprocessar pesos
```

**Consequência prática:** só as colunas 22 (`respostas_raw_json`), 3 (`curso_real`) e 15–17 (feedback) são dados primários. Todo o resto é derivado e pode ser **recalculado com pesos diferentes** a partir da coluna 22. É exatamente isso que permite testar pesos alternativos offline, sem pedir para ninguém responder de novo.

---

## 4. Dicionário de colunas

| # | Coluna | Tipo | Domínio / faixa | O que é |
|---|---|---|---|---|
| 1 | `timestamp` | texto ISO 8601 UTC | — | Momento do envio, gerado pelo **relógio do navegador do respondente** (não do servidor). Pode estar errado se o relógio da máquina estiver desregulado. |
| 2 | `nome` | texto livre | — | Nome digitado pelo respondente. Sem validação; grafias variadas da mesma pessoa são possíveis. |
| 3 | `curso_real` | categórico | `ADM Tech`, `SI`, `ES`, `EC`, `CC`, `Outro` | **Verdade de campo do piloto.** Curso que o aluno declara já fazer. |
| 4 | `curso_real_outro` | texto livre | vazio, exceto se `curso_real = "Outro"` | Curso escrito à mão quando fora dos 5. |
| 5 | `curso_indicado` | categórico | os 5 cursos | Curso mais próximo do perfil (`d1`). É a "resposta" do quiz. |
| 6 | `curso_indicado_2` | categórico | os 5 cursos | Segundo mais próximo (`d2`). |
| 7 | `tipo_classificacao` | categórico | `âncora-adjacente`, `fronteira`, `adjacente-distante`, `órfão` | Confiança do modelo (regra 2.6). **Valor pós-adaptativa** — ver seção 8.5. |
| 8 | `gap` | decimal ≥ 0 | **0 – 2.3** | `d2 − d1`. Mede **confiança do modelo em si mesmo**, não acerto. Não confundir com `delta_erro_modelo`. |
| 9 | `acertou` | booleano | `TRUE`, `FALSE`, vazio | `curso_indicado == curso_real`. **Vazio** quando `curso_real = "Outro"`. |
| 10 | `rank_curso_real` | inteiro | 1 – 5, ou vazio | Posição do curso real no ranking de proximidade do aluno. `1` = o quiz acertou. **O sinal de acurácia mais direto e mais robusto que `acertou`**, porque distingue "errou por pouco" de "errou feio". |
| 11 | `dist_perfil_curso_indicado` | decimal ≥ 0 | **0 – 3.36** | Distância do perfil até o curso indicado. É o `d1`. Zero significa que o aluno caiu exatamente sobre a âncora. Faixa estreita porque, por definição, é sempre o curso mais próximo. |
| 12 | `dist_perfil_curso_real` | decimal ≥ 0 | 0 – 6.9 | Distância do perfil até o curso que ele realmente faz. |
| 13 | `delta_erro_modelo` | decimal ≥ 0 | 0 – 6.9 | `dist_perfil_curso_real − dist_perfil_curso_indicado`. **Zero quando acerta.** Quanto maior, mais o modelo errou em escala contínua. Igual a `gap` se e somente se `rank_curso_real = 2`. |
| 14 | `dist_entre_ancoras` | decimal ≥ 0 | ver matriz 5.1 | Distância entre as âncoras do curso indicado e do curso real. **Independe das respostas** — é uma constante do par de cursos. Distingue erro entre vizinhos de erro grosseiro. |
| 15 | `fb_comparacao` | texto longo | obrigatório | Resposta aberta: o resultado acertou ou errou, e em quais pontos. |
| 16 | `fb_perguntas` | texto longo | obrigatório | Resposta aberta: as perguntas instigaram reflexão / abordaram temas relevantes. |
| 17 | `fb_comentario` | texto longo | opcional, pode ser vazio | Comentário livre. |
| 18 | `foco` | decimal | `[0, 2]` | Posição final no eixo Foco de Impacto. `0` = Pessoas/Decisão, `2` = Descoberta/Capacidades. |
| 19 | `camada` | decimal | `[0, 3]` | Posição final no eixo Camada Técnica. `0` = Negócio, `3` = Hardware/Fundamentos. |
| 20 | `estilo_integrador` | decimal | `[-2, 2]`; `[-3, 3]` se `adaptD` disparou | Acumulador. **Negativo → estilo = Integrador.** No fluxo base vem só de `q4`, então assume apenas `-2, -1, 1, 2`. |
| 21 | `estilo_construtor` | decimal | `[-2, 2]`; `[-3.4, 3.4]` se `adaptC` disparou | Acumulador. Se `estilo_integrador ≥ 0`: `≤ 0` → Construtor, `> 0` → Investigador. No fluxo base vem só de `q5`. |
| 22 | `respostas_raw_json` | JSON | ver abaixo | **A coluna mais importante para o fine-tuning.** Resposta bruta por pergunta. |
| 23 | `distancias_json` | JSON | array de 5 objetos | `[{"curso": "...", "dist": n}, ...]` já ordenado do mais próximo ao mais distante. |

### 4.1 Estrutura de `respostas_raw_json`

```json
{"q1":-2,"q2":-1,"q3":2,"q4":1,"q5":-1,"q6":2}
```

- As chaves `q1`–`q6` estão **sempre** presentes.
- **No máximo uma** chave adaptativa (`adaptA`, `adaptB`, `adaptC` ou `adaptD`) pode aparecer, e só quando o perfil caiu em `fronteira` num par coberto.
- Valores sempre em `{-2, -1, 1, 2}`. **O valor `0` nunca ocorre** — se aparecer, é corrupção de dados.
- A presença de uma chave `adapt*` é o **único** indício de que uma pergunta extra foi feita.

### 4.2 O estilo categórico não é gravado

Nenhuma coluna contém `"Integrador"` / `"Construtor"` / `"Investigador"`. Derive com a regra da seção 2.2 a partir das colunas 20 e 21. Isso é necessário para qualquer análise do eixo estilo, que é o de maior peso na distância (1.3).

---

## 5. Tabelas de referência

### 5.1 Matriz de distância entre âncoras (valores possíveis de `dist_entre_ancoras`)

| | ADM Tech | SI | ES | EC | CC |
|---|---|---|---|---|---|
| **ADM Tech** | 0 | **1.2** | 4.7 | 5.9 | 6.9 |
| **SI** | 1.2 | 0 | **3.5** | 4.7 | 5.7 |
| **ES** | 4.7 | 3.5 | 0 | **1.2** | 3.5 |
| **EC** | 5.9 | 4.7 | 1.2 | 0 | **2.3** |
| **CC** | 6.9 | 5.7 | 3.5 | 2.3 | 0 |

Leitura: `1.2` = cursos vizinhos (erro compreensível). `6.9` = extremos opostos do espaço (erro grave, provavelmente uma pergunta medindo o eixo errado).

### 5.2 Distância máxima possível até cada curso

Assimetria estrutural importante: **as distâncias não são comparáveis entre cursos sem normalizar.**

| Curso | Distância máxima possível |
|---|---|
| ADM Tech | 6.9 |
| CC | 6.9 |
| EC | 5.9 |
| SI | 5.7 |
| **ES** | **4.7** |

ES ocupa posição central: nenhum perfil consegue ficar muito longe dele. ADM Tech e CC são cantos do espaço.

### 5.3 Linha de base do modelo (null model)

Enumeração exaustiva das **4096** combinações possíveis de resposta (4⁶) ao núcleo, com peso uniforme. É o que o modelo produziria se as pessoas respondessem ao acaso.

**Distribuição do curso indicado:**

| Curso | % das combinações | Rank médio | `delta_erro_modelo` médio | Nunca fica em… |
|---|---|---|---|---|
| ES | **27.1%** | 2.22 | 1.17 | 5º (e 4º em só 0.4%) |
| SI | **27.0%** | 2.49 | 1.29 | 5º |
| ADM Tech | 19.2% | 3.44 | 1.99 | — |
| CC | 16.6% | 3.58 | 2.31 | — |
| EC | **10.2%** | 3.26 | 1.86 | — |

**Distribuição do tipo de classificação:**

| Tipo | % das combinações |
|---|---|
| `fronteira` | **43.1%** |
| `âncora-adjacente` | 33.3% |
| `adjacente-distante` | 21.6% |
| `órfão` | 2.1% |

**Distribuição do estilo:** Integrador **50.0%**, Construtor 25.0%, Investigador 25.0%.

---

## 6. Como avaliar a acurácia corretamente

**Esta é a instrução analítica mais importante deste documento.**

A taxa bruta de acerto (`% acertou = TRUE`) é enganosa, porque a chance a priori de cada curso é muito diferente (seção 5.3). Comparar contra 20% (= 1/5) está **errado**.

### 6.1 Linha de base correta

Para uma amostra de alunos, a acurácia esperada sob respostas aleatórias é:

```
baseline = Σ_curso  [ proporção da amostra nesse curso ] × [ % a priori do modelo para esse curso ]
```

Exemplo: se a amostra for metade ES e metade EC, `baseline = 0.5 × 27.1% + 0.5 × 10.2% = 18.7%`.

### 6.2 Avalie por curso, não no agregado

O mesmo resultado tem forças de evidência muito diferentes:

- Um aluno de **ES** com `rank_curso_real = 1` é evidência **fraca**: o acaso já entrega isso 27.1% das vezes.
- Um aluno de **EC** com `rank_curso_real = 1` é evidência **forte**: o acaso entrega 10.2%.
- Um aluno de **ES** com `rank_curso_real = 3` é evidência **negativa**: 48.5% das combinações aleatórias colocam ES em 3º, e ES nunca vai para 5º. Ou seja, ES em 3º é pior que o acaso.

Compare sempre `rank_curso_real` e `delta_erro_modelo` observados contra as colunas "Rank médio" e "delta médio" da tabela 5.3, **do curso daquele aluno**.

### 6.3 Interpretação cruzada das métricas de erro

| `delta_erro_modelo` | `dist_entre_ancoras` | Diagnóstico provável |
|---|---|---|
| baixo (< 1) | baixo (≤ 1.2) | Quase acertou entre vizinhos. **Peso mal calibrado**, ajuste fino. |
| alto (> 3) | baixo (≤ 1.2) | Inconsistente — investigar como caso individual. |
| baixo (< 1) | alto (≥ 4.7) | O perfil está numa região ambígua entre cursos distantes. Suspeitar da **geometria das âncoras**. |
| alto (> 3) | alto (≥ 4.7) | Erro grosseiro. Alguma pergunta está medindo o **eixo errado**, ou o aluno interpretou o dilema de forma oposta à intencionada. Ler `fb_comparacao`. |

---

## 7. Roteiro de análise sugerido

1. **Higienizar:** remover linhas de teste (`nome` contendo "TESTE"), verificar duplicatas por `nome`, checar `curso_real = "Outro"` (métricas 9–14 vazias nesses casos).
2. **Acurácia calibrada:** taxa de acerto e distribuição de `rank_curso_real` por curso, sempre contra a linha de base 5.3.
3. **Matriz de confusão:** `curso_real` × `curso_indicado`. Comparar cada linha com a distribuição a priori — o interesse está no **desvio** em relação a ela, não no valor absoluto.
4. **Diagnóstico por eixo:** para os alunos que o modelo errou, comparar `foco` e `camada` observados com os valores da âncora do curso real. Se os alunos de um curso erram sistematicamente para o mesmo lado num eixo, o peso das perguntas daquele eixo está desregulado — e o sinal do desvio diz a direção do ajuste.
5. **Testar a hipótese pré-registrada:** a seção 8.2 do contexto completo levanta que os pesos podem estar enviesados em favor da **Camada baixa** (negócio). Teste direto: os alunos de ES/EC/CC têm `camada` sistematicamente **abaixo** da âncora do curso deles?
6. **Reprocessamento offline (o objetivo do piloto):** a partir de `respostas_raw_json` + `curso_real`, recalcular tudo variando os pesos e otimizar. Função-objetivo recomendada: **minimizar a média de `rank_curso_real`** (ou maximizar acerto no top-1), em vez de minimizar `delta_erro_modelo` — este último é manipulável só encolhendo a escala das distâncias, sem melhorar a ordenação.
   - Parâmetros ajustáveis: os 3 pesos da métrica (`1.0` / `1.3` / `1.2`), os pesos por pergunta (2.3), os passos `0.35` e `0.5`, as posições das âncoras (2.4) e os limiares de classificação (2.6).
   - **Cuidado com overfitting:** o piloto terá poucas dezenas de linhas e há muitos parâmetros livres. Prefira ajustar poucos pesos por vez e reportar o quanto do ganho sobrevive a validação cruzada leave-one-out.
7. **Cruzar quantitativo com qualitativo:** ler `fb_comparacao` dos casos com `rank_curso_real ≥ 4` — é onde o aluno explica em que ponto o modelo o leu errado. E `fb_perguntas` para identificar perguntas percebidas como confusas ou irrelevantes, que são candidatas a reescrita antes de recalibrar peso.

---

## 8. Artefatos do modelo e ressalvas conhecidas

Tudo verificado por execução do código implantado. Um modelo que analise os dados sem saber destes pontos vai chegar a conclusões erradas.

### 8.1 O eixo estilo é decidido por 2 perguntas, e é o de maior peso

`q4` sozinha decide se a pessoa é **Integrador** (é a única pergunta que move `estiloIntegrador` no fluxo base), e `q5` sozinha decide **Construtor vs. Investigador**. Como estilo contribui com o maior peso da métrica (1.3, binário), **2 das 6 perguntas controlam a maior componente isolada da distância**. É o ponto de maior alavancagem — e de maior fragilidade — do modelo.

Consequência: ser Integrador (o que restringe o resultado praticamente a ADM Tech e SI, os dois únicos cursos com esse estilo) depende do sinal de uma única resposta.

### 8.2 Metade das combinações cai em "Integrador"

Como `q4` tem 2 valores negativos entre 4 possíveis, **50%** das combinações viram Integrador (seção 5.3), contra 25% para cada um dos outros dois estilos. Há um viés estrutural em favor de ADM Tech + SI, coerente com o sinal de atenção já registrado na seção 8.2 do contexto completo.

### 8.3 A intensidade das respostas de `q4` e `q5` é descartada

Só o **sinal** dos acumuladores de estilo é lido. Responder "Totalmente A" ou "Mais para A" em `q4` produz **exatamente o mesmo resultado**. Já `foco` e `camada` usam a intensidade. Essa assimetria joga fora informação em 2 das 6 perguntas — e é uma candidata óbvia a correção na v2 (ex.: tornar o estilo contínuo).

### 8.4 A implementação real gera muito mais "fronteira" que a modelagem previa

| | `fronteira` |
|---|---|
| Simulação dos 36 perfis discretos (contexto completo, §8) | 8% |
| Implementação contínua, 4096 combinações | **43.1%** |

Os limiares da seção 2.6 foram calibrados para o espaço discreto e ficaram largos demais para o espaço contínuo. Não trate os 8% do contexto completo como expectativa para os dados do piloto. Os limiares são candidatos diretos a recalibração.

### 8.5 `tipo_classificacao` é o valor pós-adaptativa

Quando uma adaptativa dispara, a classificação é recalculada do zero depois dela. A planilha guarda apenas o valor **final**. A classificação que *disparou* a adaptativa não é registrada — então uma linha com `tipo_classificacao = "âncora-adjacente"` e uma chave `adapt*` presente significa "era fronteira e a pergunta extra resolveu". Isso é sinal de que a adaptativa funcionou, e vale ser contabilizado.

### 8.6 "Fronteira" no dado final significa sempre que o empate NÃO foi resolvido

Fato central para interpretar a coluna 7: a classificação é recalculada **depois** da adaptativa. Logo, `tipo_classificacao = "fronteira"` numa linha significa, por construção, que o empate **persistiu** — independentemente de a pergunta extra ter sido feita ou não. Se a adaptativa tivesse resolvido, o tipo teria virado outro (`âncora-adjacente`, etc.).

Distinga os dois subcasos pela presença de chave `adapt*` em `respostas_raw_json`:

| `tipo_classificacao` | Chave `adapt*` | Significado |
|---|---|---|
| `fronteira` | ausente | Empate num par **sem adaptativa disponível**. Nenhum desempate foi tentado. |
| `fronteira` | presente | Adaptativa foi feita e **não bastou** para desempatar. |
| outro | presente | Era fronteira e a adaptativa **resolveu**. Sinal de que ela funcionou. |

> **Correção aplicada.** Até a versão anterior, a devolutiva de fronteira afirmava *"A pergunta extra que você respondeu ajudou a desempatar"* em **todos** esses casos — falso quando nenhuma pergunta foi feita, e enganoso quando foi feita mas não resolveu. Foi corrigido nas duas versões (principal e piloto): o texto agora nunca afirma desempate, e só menciona a pergunta extra quando ela de fato ocorreu. Nenhuma linha de aluno foi coletada antes da correção.

### 8.6.1 As adaptativas resolvem menos da metade dos empates

Enumerando os 1536 casos de fronteira com adaptativa disponível × 4 respostas possíveis = **6144 cenários**:

| Desfecho | Cenários | % |
|---|---|---|
| Saiu de fronteira (desempatou) | 2702 | **44.0%** |
| Continuou em fronteira | 3442 | **56.0%** |
| …destes, terminou empatado num **par diferente** do que a adaptativa endereçava | 682 | 19.8% dos que persistiram |

Os pesos das adaptativas (0.4 a 0.7) são pequenos frente ao limiar de fronteira (`gap < 0.8`), então frequentemente não movem o perfil o suficiente. Candidatos a recalibração: **aumentar o peso das adaptativas** ou **estreitar o limiar de gap**. Os 682 casos que migram de par sugerem ainda que uma única pergunta de desempate pode ser insuficiente por desenho.

### 8.6.2 Três pares de fronteira não têm pergunta adaptativa

Só 4 pares têm adaptativa: ADM Tech↔SI (`adaptA`), ES↔EC (`adaptB`), EC↔CC (`adaptC`), SI↔ES (`adaptD`). Mas a enumeração exaustiva mostra que a fronteira ocorre em **7** pares distintos:

| Par em fronteira | % das 4096 combinações | Adaptativa |
|---|---|---|
| ADM Tech / SI | 12.0% | `adaptA` |
| SI / ES | 11.7% | `adaptD` |
| ES / EC | 7.3% | `adaptB` |
| EC / CC | 6.4% | `adaptC` |
| **CC / ES** | **4.3%** | **nenhuma** |
| **ADM Tech / ES** | **0.9%** | **nenhuma** |
| **EC / SI** | **0.4%** | **nenhuma** |

**228 das 4096 combinações (5.6%, ou 13% de todas as fronteiras)** caem em fronteira sem adaptativa disponível — sobretudo o par **CC / ES** (4.3% de todas as combinações). Nesses casos nenhum desempate é tentado. É uma lacuna de cobertura do modelo, não um defeito de código: criar as adaptativas faltantes é trabalho de conteúdo pedagógico, e o par CC↔ES é o candidato prioritário.

### 8.7 Divergências entre este documento e o contexto completo

| Ponto | Contexto completo (§7) | Código implantado |
|---|---|---|
| Limiar de `órfão` | "≥ 2.8", e adjacente-distante "entre 1.5 e 2.5" | `adjacente-distante` se `d1 < 2.8`; `órfão` caso contrário. A faixa 2.5–2.8 do contexto é uma lacuna inexistente no código. |
| Estilo | 3 níveis discretos (0/1/2) | 2 acumuladores + regra hierárquica (2.2). Não há escala de 3 níveis. |
| Espaço de perfis | 36 pontos discretos | contínuo em foco e camada |

### 8.7.1 A tela mostra afinidade; a planilha grava distância

Na interface, a lista dos 5 cursos é exibida como **afinidade de 0 a 5** (maior = mais compatível), porque distância era contraintuitivo para o respondente — o curso mais compatível tinha distância 0 e portanto barra de largura zero. A planilha continua gravando **distância bruta** em todas as colunas; nenhum dado mudou.

A conversão é puramente de exibição:

```
afinidade = 5 × (1 − distância / 6.9)        (truncado em [0, 5])
distância = 6.9 × (1 − afinidade / 5)
```

| Distância | Afinidade exibida |
|---|---|
| 0.0 | 5.0 |
| 1.2 | 4.1 |
| 2.3 | 3.3 |
| 3.5 | 2.5 |
| 4.7 | 1.6 |
| 6.9 | 0.0 |

A normalização é **absoluta** (contra o máximo teórico 6.9), não relativa ao máximo de cada respondente. Isso é intencional: um perfil `órfão` recebe cerca de 3.0 no primeiro colocado em vez de 5.0, o que mantém a coerência com a devolutiva que diz que nenhum curso atende bem.

**Implicação para a análise:** se um aluno citar números em `fb_comparacao` (ex. "me deu 4.1 em SI"), ele está falando de **afinidade**, não de distância. Converta antes de cruzar com as colunas.

O bloco "sugestão × realidade" da tela de feedback continua exibindo **distâncias** — é onde vivem `delta` e `dist_entre_ancoras`, que só fazem sentido como distância. A tela avisa isso explicitamente ao respondente.

### 8.8 Ressalvas de leitura dos dados

- **Vírgula decimal:** a planilha está em locale pt-BR e exibe `6,9`. Ao exportar CSV, o separador decimal pode sair como vírgula — converta antes de fazer conta.
- **Ruído de ponto flutuante:** os JSONs contêm valores como `6.8999999999999995`. Arredonde para 2 casas antes de comparar ou agrupar.
- **Endpoint público:** o Apps Script aceita POST de qualquer origem, então em teoria linhas espúrias podem existir. Cheque plausibilidade de `nome` e `timestamp`.
- **Não há registro de abandono:** só quem chegou ao fim e enviou aparece na planilha. Não é possível medir taxa de desistência a partir destes dados.
- **Autosseleção:** os respondentes são alunos convidados diretamente, já matriculados e já sabendo qual curso fazem. Isso pode enviesar as respostas em direção ao curso que eles já cursam (racionalização a posteriori) — um efeito que **infla** a acurácia aparente em relação ao público real do quiz, que são candidatos do ensino médio.
