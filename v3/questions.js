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
     em escala de concordância de 6 níveis (sem ponto neutro). O dilema A/B
     escondia mal a lógica de "duas opções" e limitava a escala a 4 pontos;
     a afirmação única com 6 níveis dá mais nuance sem reintroduzir uma opção
     neutra (que gera efeito de tendência central).
   - Três afirmações (C1, C2, M3) foram reformuladas no mesmo processo para
     corrigir vazamento de eixo identificado no diagnóstico: C1 não alcançava
     o polo de hardware/fundamentos, C2 confundia curiosidade abstrata com
     profundidade técnica real, e M3 media liderança/coordenação (traço
     compartilhado por todo aluno do Inteli via PBL) em vez de investigação.
   ============================================================ */

// Escala de concordância: sem opção neutra (evita efeito de tendência central),
// sinal indica o polo do eixo e módulo a intensidade da concordância.
const SCALE = [
  { label: "Discordo totalmente", value: -3 },
  { label: "Discordo", value: -2 },
  { label: "Discordo parcialmente", value: -1 },
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
   Núcleo: 8 afirmações, respondidas por todos numa escala de concordância.
   Não há pergunta adaptativa nesta versão — decisão deliberada, ver README.

   Cada afirmação está redigida para que concordar mova o eixo para o polo
   "alto" (mesmo sentido que o antigo poloB): camada 3 = hardware/fundamentos,
   amplitude 2 = especialista, modo 2 = investigador. Discordar move para o
   polo "baixo" (antigo poloA).
   ------------------------------------------------------------ */
const NUCLEO = [
  {
    id: "C1", eixo: "camada", peso: 1.0,
    texto: "Quando um app que uso trava, prefiro investigar a causa técnica raiz — no código, no hardware ou na conexão — a só identificar o que está incomodando quem usa.",
  },
  {
    id: "A1", eixo: "amplitude", peso: 1.0,
    texto: "Entre dois projetos possíveis, eu prefiro um que entra fundo em um problema só — onde eu precise dominar bem aquele assunto — a um que passa por várias áreas diferentes.",
  },
  {
    id: "M1", eixo: "modo", peso: 1.0,
    texto: "Diante de um problema difícil, meu primeiro impulso é parar para entender a causa a fundo antes de construir qualquer coisa — não colocar a mão na massa direto.",
  },
  {
    id: "C2", eixo: "camada", peso: 1.0,
    texto: "Quando vou aprender uma ferramenta nova, quero entender como ela funciona por dentro — isso me dá controle real sobre o que estou fazendo, não só aprender o suficiente para usá-la.",
  },
  {
    id: "M2", eixo: "modo", peso: 1.0,
    texto: "No fim de um projeto, o que me deixa mais satisfeito é ter entendido por que o problema acontecia e qual era o melhor jeito de resolver — mais do que só ver a solução funcionando.",
  },
  {
    id: "A2", eixo: "amplitude", peso: 1.0,
    texto: "No fim de um ano, prefiro poder dizer que fiquei muito bom numa coisa difícil a dizer que estudei muitos assuntos diferentes.",
  },
  {
    id: "C3", eixo: "camada", peso: 0.8,
    texto: "Numa conversa sobre um projeto novo, a parte que mais me chama atenção é como ele vai ser construído tecnicamente para funcionar de verdade — mais do que quem ele vai afetar.",
  },
  {
    id: "M3", eixo: "modo", peso: 0.8,
    texto: "Num trabalho em grupo que travou, meu impulso costuma ser parar a produção e investigar a causa do travamento antes de continuar — mesmo que isso atrase o grupo.",
  },
];

/* ------------------------------------------------------------
   Passo de cada eixo — derivado, não escolhido.

   passo = (faixa / 2) / (SCALE_MAX × soma dos pesos dos itens do eixo)

   O estado começa no centro da faixa (ver CENTRO), então só precisa
   percorrer metade da faixa para alcançar qualquer um dos extremos.
   Isso garante que concordar/discordar totalmente em TODOS os itens do
   eixo, no mesmo sentido, chegue exatamente ao extremo da faixa — sem
   ultrapassar e sem saturar antes disso. Na v1 o passo era fixo e ±1 já
   saturava o eixo, o que fazia a escala de 4 pontos funcionar como uma
   de 2 pontos.
   ------------------------------------------------------------ */
const SOMA_PESOS = NUCLEO.reduce((acc, q) => {
  acc[q.eixo] = (acc[q.eixo] || 0) + q.peso;
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
   (enumeração das 6^8 = 1.679.616 combinações de resposta possíveis da
   escala de 6 níveis), não escolhidos a olho. Re-derivados depois da
   migração de dilema A/B (4 níveis, 65.536 combinações) para afirmação
   única com escala de concordância (6 níveis) — ver
   DocumentosRef/Inteli_Quiz_v2_Diagnostico_e_Revisao_Perguntas.md.
   ------------------------------------------------------------ */
const LIMIAR = {
  gapFronteira: 0.095, // percentil 12 dos gaps  → ~12% em fronteira
  d1Ancora: 1.165,     // percentil 50 das distâncias ao curso mais próximo
  d1Orfao: 1.590,      // percentil 90  → ~10% de órfãos
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
