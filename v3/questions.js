/* ============================================================
   Quiz Vocacional Inteli — MODELO v2
   Banco de perguntas e modelo de pontuação.

   Mudanças estruturais em relação à v1 (ver DocumentosRef):
   - "Foco de Impacto" foi aposentado: era 87% redundante com Camada
     (correlação 0,871 nas âncoras) e piorava o resultado nos dados reais.
   - "Estilo de Pensamento" deixou de ser categoria de 3 valores e virou um
     plano contínuo com seus dois contrastes originais — Amplitude
     (Integrador↔Especialista) e Modo (Construtor↔Investigador) — ambos
     aplicados a todos, sem o portão condicional que travava a v1.
   - Um item carrega em um único eixo. Na v1, q2 e q6 carregavam Foco e
     Camada no mesmo sentido, acorrentando os dois eixos algebricamente.
   - Passo de cada eixo é derivado, não escolhido (ver PASSO abaixo).

   Revisão de formato (ver DocumentosRef/Inteli_Quiz_v2_Diagnostico_e_Revisao_Perguntas.md):
   - Perguntas deixaram de ser dilema A/B e viraram afirmação única, respondida
     em escala de concordância de 7 níveis (com ponto neutro, adicionado por
     pedido explícito — ver decisão registrada no documento acima. Ausência de
     neutro era escolha deliberada desde a v1 para evitar efeito de tendência
     central; o trade-off foi aceito conscientemente).
   - Três afirmações (C1, C2, M3) foram reformuladas no mesmo processo para
     corrigir vazamento de eixo identificado no diagnóstico: C1 não alcançava
     o polo de hardware/fundamentos, C2 confundia curiosidade abstrata com
     profundidade técnica real, e M3 media liderança/coordenação (traço
     compartilhado por todo aluno do Inteli via PBL) em vez de investigação.
   - Redação das 8 afirmações revisada de novo para remover contraste textual
     embutido ("a só X" / "mais do que só X"), que enviesava qualquer
     respondente a concordar (viés de aquiescência) independente da disposição
     real — achado do feedback qualitativo de alunos de CC/ES/EC na v3.
   - Reteste pareado das 2 pessoas de EC que já tinham caído em CC mostrou
     um viés na direção oposta: `A2`, ao perder toda comparação (não só o
     "só"), virou afirmação isolada e sem custo — as duas pessoas escalaram
     pra concordância máxima nela, inflando Amplitude perto do teto. `C1` e
     `C2` tinham o mesmo risco (sem custo nem comparação) e foram reforçadas
     por precaução, mesmo sem evidência direta ainda. `A1`, `M2`, `C3`, `M3`
     já tinham algum tipo de âncora implícita e não mostraram esse padrão —
     mantidas como estavam.
   - `M1` reforçado por um motivo diferente: das 7 respostas reais coletadas
     até aqui, 6 concordaram (+2 ou +3) e só 1 discordou — desbalanceamento
     bem maior que `M2`/`M3`. Não é falta de custo no texto (já tinha "antes
     de construir"); é que "entender antes de agir" soa como a resposta
     madura, então tende a puxar concordância mesmo de quem não age assim na
     prática (viés de desejabilidade do próprio conteúdo, não da redação).
     Adicionado um custo que a cultura tech já reconhece como válido
     (aprendizado rápido por tentativa), não só "leva mais tempo".
   ============================================================ */

// Escala de concordância com ponto neutro no centro: sinal indica o polo do
// eixo e módulo a intensidade da concordância; 0 não move o eixo.
const SCALE = [
  { label: "Discordo totalmente", value: -3 },
  { label: "Discordo", value: -2 },
  { label: "Discordo parcialmente", value: -1 },
  { label: "Neutro", value: 0 },
  { label: "Concordo parcialmente", value: 1 },
  { label: "Concordo", value: 2 },
  { label: "Concordo totalmente", value: 3 },
];
const SCALE_MAX = 3; // maior módulo de valor possível na escala acima

/* ------------------------------------------------------------
   Eixos
   camada    0 = trabalha com o resultado da tecnologia .. 3 = trabalha com ela por dentro
   amplitude 0 = Integrador (transita, conecta)          .. 2 = Especialista (mergulha)
   modo      0 = Construtor (mão na massa, itera)        .. 2 = Investigador (entende antes)
   ------------------------------------------------------------ */
const EIXOS = ["camada", "amplitude", "modo"];

const FAIXA = { camada: [0, 3], amplitude: [0, 2], modo: [0, 2] };
const CENTRO = { camada: 1.5, amplitude: 1.0, modo: 1.0 };

const PESO = { camada: 0.8, amplitude: 0.8, modo: 1.5 };

// Âncoras otimizadas dentro de faixas conceituais definidas a priori por curso
// e eixo. Nenhum eixo é monotônico na ordem ADM→CC, e todo par de cursos
// vizinhos tem pelo menos dois separadores.
const ANCORAS = {
  "ADM Tech": { camada: 0.24, amplitude: 0.40, modo: 1.36 },
  "SI":       { camada: 0.80, amplitude: 0.20, modo: 0.65 },
  "ES":       { camada: 1.81, amplitude: 1.26, modo: 0.17 },
  "EC":       { camada: 2.72, amplitude: 1.35, modo: 1.03 },
  "CC":       { camada: 2.56, amplitude: 1.60, modo: 1.73 },
};

const NOME_CURSO = {
  "ADM Tech": "Administração (ADM Tech)",
  "SI": "Sistemas de Informação",
  "ES": "Engenharia de Software",
  "EC": "Engenharia de Computação",
  "CC": "Ciência da Computação",
};

/* ------------------------------------------------------------
   Núcleo: 12 afirmações (4 por eixo), respondidas por todos numa escala de
   concordância. Não há pergunta adaptativa nesta versão — decisão
   deliberada, ver README.

   Cada afirmação está redigida para que concordar mova o eixo para o polo
   "alto" (mesmo sentido que o antigo poloB): camada 3 = hardware/fundamentos,
   amplitude 2 = especialista, modo 2 = investigador. Discordar move para o
   polo "baixo" (antigo poloA) — EXCETO `M4`, que é de chave invertida (ver
   abaixo).

   Redação sem contraste embutido (ver DocumentosRef/Inteli_Quiz_v2_Diagnostico_e_Revisao_Perguntas.md):
   a primeira leva de afirmações usava construções tipo "a só X" / "mais do
   que só X", que rotulavam o polo baixo como insuficiente — corrigido.

   De volta ao estilo direto, sem cláusula de custo ("mesmo que..."): tentar
   blindar cada item individualmente contra viés de desejabilidade (seja via
   "só X", seja via "mesmo que X") sempre acabou sinalizando qual resposta é
   "a correta" de um jeito ou de outro. A correção agora é estrutural, não
   por item: foi de 8 para 12 perguntas (4 por eixo em vez de 2-3), diluindo
   o peso de qualquer item imperfeito sozinho — mesma lógica usada em testes
   de personalidade validados (Big Five/IPIP), que não dependem de nenhum
   item ser perfeitamente neutro.

   `M4` é o primeiro item de "chave invertida" do banco: concordar descreve
   o comportamento CONSTRUTOR (aprender testando na prática), não
   INVESTIGADOR como os outros 3 itens de Modo. Isso veio de um achado
   concreto: em 7 respostas reais coletadas, `M1` teve 6 concordâncias e só
   1 discordância — "entender antes de agir" soa como a resposta madura,
   então o desequilíbrio pode vir do conteúdo em si, não da redação. Um item
   invertido dá ao perfil construtor uma frase pra concordar (em vez de
   depender de discordar de uma frase que soa prudente) — por isso seu peso
   é negativo, ver PASSO abaixo sobre soma de pesos em módulo.
   - `A2`/`A4` reescritos: a versão anterior ("no fim do ano..." / "ser a
     pessoa de referência...") não forçava exclusividade real — dá pra
     aprofundar um assunto E aprender vários outros no mesmo ano, então
     marcar Neutro nelas era a resposta logicamente correta pra quem
     percebeu isso, não indecisão. Isso zera a resposta em vez de puxar
     o eixo, deixando `A1`/`A3` decidirem sozinhas. Agora as 4 perguntas de
     Amplitude forçam escolha sobre um recurso genuinamente limitado (um
     projeto, um curso, um hobby, um papel em grupo — só dá pra escolher um).
   - `C4`, `M1`, `M2`, `M3`, `A3`, `M4` reescritos por redundância de
     conteúdo, não de viés: várias perguntas do mesmo eixo repetiam o mesmo
     cenário ("trava"/"travou") ou o mesmo molde de frase (X só vs. vários Y
     diferentes), então mediam a mesma faceta duas vezes em vez de somar
     sinal independente. Cada uma trocou de domínio — escolha de tarefa num
     projeto, resolver e continuar curioso, explicar pra alguém,
     planejamento em grupo, festa, decisão rápida — mantendo a mesma
     intenção de eixo. `M1` só ficou redundante depois que `M4` migrou pra
     uma formulação mais genérica de "agir rápido vs. entender antes"; `C4`
     precisou de uma segunda rodada porque a primeira reescrita (vídeo)
     trocou só o meio, não o conteúdo — continuava sendo "entender por
     dentro vs. só usar", igual ao `C2`.
   ------------------------------------------------------------ */
const NUCLEO = [
  {
    id: "C1", eixo: "camada", peso: 1.0,
    texto: "Quando o sistema que estou desenvolvendo trava, meu interesse natural é investigar a causa técnica raiz: seja no código, no hardware ou na conexão.",
  },
  {
    id: "A1", eixo: "amplitude", peso: 1.0,
    texto: "Entre dois projetos possíveis, eu escolheria o que entra fundo em um problema, onde eu precisasse dominar bem aquele assunto.",
  },
  {
    id: "M1", eixo: "modo", peso: 1.0,
    texto: "Depois de resolver um problema, tenho vontade de continuar investigando por que a solução funcionou.",
  },
  {
    id: "C2", eixo: "camada", peso: 1.0,
    texto: "Quando vou aprender uma ferramenta nova, quero entender como ela funciona por dentro, indo além das funcionalidades básicas.",
  },
  {
    id: "M2", eixo: "modo", peso: 1.0,
    texto: "Quando alguém me pergunta como resolver algo, prefiro explicar o raciocínio todo por trás da solução a indicar diretamente o que fazer.",
  },
  {
    id: "A2", eixo: "amplitude", peso: 1.0,
    texto: "Se eu tivesse tempo pra fazer apenas um curso extra este semestre, eu escolheria um que aprofunda bastante um assunto só, em vez de um que passa por vários temas diferentes.",
  },
  {
    id: "C3", eixo: "camada", peso: 0.8,
    texto: "Em uma conversa sobre um projeto novo, a parte que mais me chama atenção é como ele vai ser construído tecnicamente.",
  },
  {
    id: "M3", eixo: "modo", peso: 0.8,
    texto: "Num projeto em grupo, prefiro que a gente pare pra mapear o problema todo antes de dividir tarefas e começar a produzir.",
  },
  {
    id: "C4", eixo: "camada", peso: 1.0,
    texto: "Se eu pudesse escolher uma tarefa num projeto, prefiro cuidar da parte técnica — código, hardware ou infraestrutura — a cuidar da parte que exige entender as necessidades de quem vai usar o produto.",
  },
  {
    id: "A3", eixo: "amplitude", peso: 1.0,
    texto: "Numa festa ou evento, prefiro ficar batendo papo a fundo com poucas pessoas sobre um assunto do que circular e trocar uma ideia rápida com várias pessoas diferentes.",
  },
  {
    id: "A4", eixo: "amplitude", peso: 1.0,
    texto: "Em um projeto em grupo, eu escolheria ser a pessoa que domina uma parte técnica específica a fundo, não a pessoa que entende um pouco de cada parte.",
  },
  {
    id: "M4", eixo: "modo", peso: -1.0,
    texto: "Prefiro decidir rápido e ajustar o rumo depois a passar muito tempo reunindo informações antes de agir.",
  },
];

/* ------------------------------------------------------------
   Passo de cada eixo — derivado, não escolhido.

   passo = (faixa / 2) / (SCALE_MAX × soma dos pesos dos itens do eixo, em módulo)

   Soma em módulo porque `M4` tem peso negativo (item de chave invertida):
   o que importa pro alcance máximo do eixo é o quanto cada item PODE
   empurrar, não o sinal de quem empurra pra qual lado.

   O estado começa no centro da faixa (ver CENTRO), então só precisa
   percorrer metade da faixa para alcançar qualquer um dos extremos.
   Isso garante que concordar/discordar totalmente em TODOS os itens do
   eixo, no sentido que empurra pro mesmo lado, chegue exatamente ao
   extremo da faixa — sem ultrapassar e sem saturar antes disso. Na v1 o
   passo era fixo e ±1 já saturava o eixo, o que fazia a escala de 4 pontos
   funcionar como uma de 2 pontos.
   ------------------------------------------------------------ */
const SOMA_PESOS = NUCLEO.reduce((acc, q) => {
  acc[q.eixo] = (acc[q.eixo] || 0) + Math.abs(q.peso);
  return acc;
}, {});

const PASSO = EIXOS.reduce((acc, e) => {
  const amplitudeDaFaixa = FAIXA[e][1] - FAIXA[e][0];
  acc[e] = amplitudeDaFaixa / (2 * SCALE_MAX * SOMA_PESOS[e]);
  return acc;
}, {});

/* ------------------------------------------------------------
   Escala de afinidade exibida (0–5, maior = mais compatível)
   ------------------------------------------------------------ */

// Maior distância possível entre uma posição alcançável e uma âncora.
// Como o passo é calibrado para ±2 chegar exatamente ao extremo, os cantos
// da faixa são alcançáveis, então esta é uma distância real e não um limite
// teórico inalcançável.
const DIST_MAX = Object.keys(ANCORAS).reduce((max, curso) => {
  const d = EIXOS.reduce((s, e) => {
    const a = ANCORAS[curso][e];
    return s + Math.max(Math.abs(FAIXA[e][0] - a), Math.abs(FAIXA[e][1] - a)) * PESO[e];
  }, 0);
  return Math.max(max, d);
}, 0);

const AFINIDADE_MAX = 5;

// Converte distância (menor = mais compatível) em afinidade 0–5 (maior = mais
// compatível), só para exibição — os dados continuam sendo gravados em distância.
// Escala absoluta: um perfil distante de todos os cursos não recebe nota alta no
// primeiro colocado só por ele ser o menos distante.
function afinidade(dist) {
  return clamp(AFINIDADE_MAX * (1 - dist / DIST_MAX), 0, AFINIDADE_MAX);
}

/* ------------------------------------------------------------
   Modelo de pontuação
   ------------------------------------------------------------ */

function novoEstado() {
  return {
    camada: CENTRO.camada,
    amplitude: CENTRO.amplitude,
    modo: CENTRO.modo,
    respostas: {},
  };
}

function aplicarResposta(estado, pergunta, valor) {
  estado.respostas[pergunta.id] = valor;
  const e = pergunta.eixo;
  estado[e] = clamp(estado[e] + valor * pergunta.peso * PASSO[e], FAIXA[e][0], FAIXA[e][1]);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function calcularDistancias(estado) {
  const dists = Object.entries(ANCORAS).map(([curso, ancora]) => {
    const dist = EIXOS.reduce((s, e) => s + Math.abs(estado[e] - ancora[e]) * PESO[e], 0);
    return { curso, dist };
  });
  dists.sort((a, b) => a.dist - b.dist);
  return dists;
}

/* ------------------------------------------------------------
   Classificação — limiares derivados da distribuição real do modelo
   (enumeração exaustiva das 7^12 = 13.841.287.201 combinações de resposta
   possíveis, 4 perguntas por eixo), não escolhidos a olho. Grande demais
   pra listar uma a uma, mas tratável agrupando por soma única por eixo
   (103 × 25 × 103 = 265.225 estados combinados, cada um com sua
   contagem/peso) — mesmo resultado da enumeração completa, sem precisar
   materializar 13,8 bilhões de linhas. Re-derivados depois de: dilema A/B
   (4 níveis, 65.536) → afirmação única sem neutro (6 níveis, 1.679.616) →
   com neutro (7 níveis, 8 perguntas, 5.764.801) → 12 perguntas (atual) —
   ver DocumentosRef/Inteli_Quiz_v2_Diagnostico_e_Revisao_Perguntas.md.
   ------------------------------------------------------------ */
const LIMIAR = {
  gapFronteira: 0.083, // percentil 12 dos gaps  → ~12% em fronteira
  d1Ancora: 1.182,     // percentil 50 das distâncias ao curso mais próximo
  d1Orfao: 1.522,      // percentil 90  → ~10% de órfãos
};

function classificar(dists) {
  const [top1, top2] = dists;
  const gap = top2.dist - top1.dist;
  let tipo;
  if (gap < LIMIAR.gapFronteira) {
    tipo = "fronteira";
  } else if (top1.dist <= LIMIAR.d1Ancora) {
    tipo = "âncora-adjacente";
  } else if (top1.dist <= LIMIAR.d1Orfao) {
    tipo = "adjacente-distante";
  } else {
    tipo = "órfão";
  }
  return { tipo, curso1: top1.curso, curso2: top2.curso, dist1: top1.dist, dist2: top2.dist, gap };
}

/* ------------------------------------------------------------
   Devolutiva
   ------------------------------------------------------------ */

const FEEDBACK_LABEL = {
  "âncora-adjacente": "Alta confiança",
  "fronteira": "Perfil de fronteira",
  "adjacente-distante": "Indicação com nuance",
  "órfão": "Perfil fora do óbvio",
};

function buildInterpretacao(estado) {
  const camadaFrag = estado.camada <= 0.75
    ? "que quer trabalhar com o que a tecnologia entrega, usando ela como ferramenta"
    : estado.camada <= 1.5
    ? "que transita entre o negócio e os sistemas que o sustentam"
    : estado.camada <= 2.25
    ? "que quer construir os produtos digitais que rodam para as pessoas"
    : "que quer entrar fundo na tecnologia por dentro";

  const amplitudeFrag = estado.amplitude <= 0.7
    ? "circulando entre áreas diferentes e ligando as pontas"
    : estado.amplitude <= 1.3
    ? "equilibrando visão de conjunto e profundidade"
    : "mergulhando fundo até dominar um assunto";

  const modoFrag = estado.modo <= 0.7
    ? "aprendendo fazendo, montando e ajustando no caminho"
    : estado.modo <= 1.3
    ? "alternando entre agir e analisar conforme o problema pede"
    : "querendo entender a fundo antes de agir";

  return `Você é alguém ${camadaFrag}, ${amplitudeFrag}, ${modoFrag}.`;
}

function buildDevolutiva(tipo, curso1, curso2) {
  const c1 = NOME_CURSO[curso1];
  const c2 = NOME_CURSO[curso2];

  if (tipo === "âncora-adjacente") {
    return `Esse perfil aponta com clareza para <strong>${c1}</strong>. ${c2} aparece como segunda opção compatível, com nuance distinta — vale conhecer as fronteiras entre os dois.`;
  }
  if (tipo === "fronteira") {
    return `Seu perfil ficou quase empatado entre <strong>${c1}</strong> e <strong>${c2}</strong>. Vale a pena conhecer os dois cursos de perto antes de decidir.`;
  }
  if (tipo === "adjacente-distante") {
    return `O curso mais próximo do seu perfil é <strong>${c1}</strong>, mas seu perfil tem uma tensão interessante — você não está bem no centro do curso. Isso pode virar um diferencial dentro dele.`;
  }
  return `Sua combinação é rara e nenhum dos 5 cursos de graduação atende plenamente todos os lados do seu perfil. Indicamos <strong>${c1}</strong> como o mais próximo, mas reconhecemos abertamente a singularidade — vale muito uma conversa com a equipe de orientação para desenhar um caminho sob medida.`;
}
