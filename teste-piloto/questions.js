/* ============================================================
   Quiz Vocacional Inteli — banco de perguntas e modelo de pontuação
   Fonte: Inteli_Quiz_Contexto_Completo.md + Inteli_Quiz_Vocacional_Banco_de_Perguntas.docx
   ============================================================ */

// Escala de resposta: Totalmente A(-2) · Mais para A(-1) · Mais para B(+1) · Totalmente B(+2)
const SCALE = [
  { label: "Totalmente A", value: -2 },
  { label: "Mais para A", value: -1 },
  { label: "Mais para B", value: 1 },
  { label: "Totalmente B", value: 2 },
];

// Âncoras dos 5 cursos no espaço de 3 dimensões (seção 5 do contexto)
// foco: 0=Pessoas/Decisão .. 2=Descoberta/Capacidades
// camada: 0=Negócio .. 3=Hardware/Fundamentos
// estilo: categórico (Integrador | Construtor | Investigador)
const ANCORAS = {
  "ADM Tech": { foco: 0, estilo: "Integrador", camada: 0 },
  "SI":       { foco: 0, estilo: "Integrador", camada: 1 },
  "ES":       { foco: 1, estilo: "Construtor", camada: 2 },
  "EC":       { foco: 1, estilo: "Construtor", camada: 3 },
  "CC":       { foco: 2, estilo: "Investigador", camada: 3 },
};

const NOME_CURSO = {
  "ADM Tech": "Administração (ADM Tech)",
  "SI": "Sistemas de Informação",
  "ES": "Engenharia de Software",
  "EC": "Engenharia de Computação",
  "CC": "Ciência da Computação",
};

const PESO_FOCO = 1.0;
const PESO_ESTILO = 1.3;
const PESO_CAMADA = 1.2;

// Núcleo: 6 perguntas respondidas por todos
const NUCLEO = [
  {
    id: "q1",
    fase: "núcleo",
    texto: "O que te enche mais de energia/propósito quando você se imagina trabalhando?",
    poloA: "Resolver um problema que muda como pessoas ou uma empresa funcionam no dia a dia.",
    poloB: "Explorar uma ideia ou tecnologia nova pelo desafio de descobrir até onde ela vai.",
    efeitos: [{ eixo: "foco", peso: 1.0 }],
  },
  {
    id: "q2",
    fase: "núcleo",
    texto: "Entre estes dois elogios, qual você gostaria mais de receber?",
    poloA: "“Você entende de gente e de negócio como ninguém! Posso contar com você para saber o que realmente importa.”",
    poloB: "“Você manda muito bem com tecnologia! Posso contar com você para saber como as coisas funcionam.”",
    efeitos: [{ eixo: "foco", peso: 0.6 }, { eixo: "camada", peso: 1.0 }],
  },
  {
    id: "q3",
    fase: "núcleo",
    texto: "Você vai aprender uma habilidade nova. O que soa mais atraente?",
    poloA: "Como usar ferramentas para resolver um problema real com agilidade e eficiência.",
    poloB: "Entender o que acontece por baixo dos panos — como a tecnologia é construída por dentro.",
    efeitos: [{ eixo: "camada", peso: 1.0 }],
  },
  {
    id: "q4",
    fase: "núcleo",
    texto: "Pensando num cenário ideal, qual o seu jeito preferido de trabalhar?",
    poloA: "Transitar entre muitas áreas e pessoas, conectando as peças e enxergando o todo.",
    poloB: "Ter espaço para mergulhar fundo num assunto e dominá-lo com profundidade.",
    efeitos: [{ eixo: "estiloIntegrador", peso: 1.0 }],
  },
  {
    id: "q5",
    fase: "núcleo",
    texto: "Diante de um problema difícil, qual é o seu primeiro impulso?",
    poloA: "Colocar a mão na massa, montar um protótipo e ir ajustando no caminho.",
    poloB: "Parar para entender a fundo a causa antes de construir qualquer coisa.",
    efeitos: [{ eixo: "estiloConstrutor", peso: 1.0 }],
  },
  {
    id: "q6",
    fase: "núcleo",
    texto: "Um exemplo de problema que você mais gostaria de atacar é:",
    poloA: "Como uma organização toma decisões melhores com seus dados e processos.",
    poloB: "Como criar algo técnico que funcione bem, rápido e em grande escala.",
    efeitos: [{ eixo: "foco", peso: 0.6 }, { eixo: "camada", peso: 0.6 }],
  },
];

// Adaptativas: disparadas condicionalmente quando o núcleo deixa o perfil ambíguo
// entre um par específico de cursos vizinhos (situação de "fronteira")
const ADAPTATIVAS = {
  A: {
    id: "adaptA",
    par: ["ADM Tech", "SI"],
    texto: "Você se imagina mais como a pessoa que:",
    poloA: "Lidera pessoas e decisões de negócio, usando a tecnologia como ferramenta.",
    poloB: "Constrói os sistemas e a estrutura de dados que fazem o negócio rodar.",
    efeitos: [{ eixo: "camada", peso: 0.6 }],
  },
  B: {
    id: "adaptB",
    par: ["ES", "EC"],
    texto: "Se fosse construir algo do zero, o que te empolga mais?",
    poloA: "Software, apps e plataformas digitais que rodam na nuvem e escalam para milhões.",
    poloB: "Sistemas que unem software ao mundo físico — robôs, sensores, dispositivos.",
    efeitos: [{ eixo: "camada", peso: 0.6 }],
  },
  C: {
    id: "adaptC",
    par: ["EC", "CC"],
    texto: "Você tem um problema difícil pela frente. O que te deixaria mais satisfeito?",
    poloA: "Ter uma solução funcionando direitinho, sem travar, resolvendo o problema na prática.",
    poloB: "Entender por que aquilo acontece e descobrir o melhor jeito possível de resolver.",
    efeitos: [{ eixo: "estiloConstrutor", peso: 0.7 }],
  },
  D: {
    id: "adaptD",
    par: ["SI", "ES"],
    texto: "Num projeto de tecnologia, você prefere ser a pessoa que garante:",
    poloA: "Que a solução resolve o problema certo e gera valor para o negócio.",
    poloB: "Que o produto é bem construído, robusto e escalável tecnicamente.",
    efeitos: [{ eixo: "estiloIntegrador", peso: 0.5 }, { eixo: "camada", peso: 0.4 }],
  },
};

// Templates de devolutiva por tipo de perfil (seção 11 do contexto — tom institucional)
const FEEDBACK_LABEL = {
  "âncora-adjacente": "Alta confiança",
  "fronteira": "Perfil de fronteira",
  "adjacente-distante": "Indicação com nuance",
  "órfão": "Perfil fora do óbvio",
};

function buildInterpretacao(foco, estilo, camada) {
  const focoFrag = foco <= 0.66
    ? "movido pelo impacto em pessoas e decisões"
    : foco <= 1.33
    ? "movido por criar coisas que outros usem"
    : "movido por explorar o que ainda não existe";

  const estiloFrag = {
    "Integrador": "que conecta áreas e enxerga o todo",
    "Construtor": "que aprende fazendo, prototipando, iterando",
    "Investigador": "que prefere entender a fundo antes de construir",
  }[estilo];

  const camadaFrag = camada <= 0.75
    ? "atuando na camada de negócio, com a tecnologia como ferramenta"
    : camada <= 1.75
    ? "entre o negócio e os sistemas que o sustentam"
    : camada <= 2.5
    ? "construindo produtos digitais que rodam para usuários"
    : "indo fundo na tecnologia por dentro";

  return `Você é alguém ${focoFrag}, ${estiloFrag}, ${camadaFrag}.`;
}

// houveAdaptativa: se uma pergunta adaptativa foi de fato respondida neste fluxo.
// Importante para o caso "fronteira": como a classificação é recalculada depois da
// adaptativa, um tipo final "fronteira" significa que o empate NÃO foi resolvido —
// seja porque não existe adaptativa para aquele par, seja porque ela não moveu o
// perfil o suficiente. Em nenhum dos dois casos o texto pode afirmar que houve
// desempate.
function buildDevolutiva(tipo, curso1, curso2, gap, houveAdaptativa) {
  const c1 = NOME_CURSO[curso1];
  const c2 = NOME_CURSO[curso2];

  if (tipo === "âncora-adjacente") {
    return `Esse perfil aponta com clareza para <strong>${c1}</strong>. ${c2} aparece como segunda opção compatível, com nuance distinta — vale conhecer as fronteiras entre os dois.`;
  }
  if (tipo === "fronteira") {
    return houveAdaptativa
      ? `Seu perfil ficou quase empatado entre <strong>${c1}</strong> e <strong>${c2}</strong>. Mesmo com a pergunta extra, os dois seguem muito próximos — vale conhecer cada um de perto antes de decidir.`
      : `Seu perfil ficou quase empatado entre <strong>${c1}</strong> e <strong>${c2}</strong>. Vale a pena conhecer os dois cursos de perto antes de decidir.`;
  }
  if (tipo === "adjacente-distante") {
    return `O curso mais próximo do seu perfil é <strong>${c1}</strong>, mas seu perfil tem uma tensão interessante — você não está bem no centro do curso. Isso pode virar um diferencial dentro dele.`;
  }
  return `Sua combinação é rara e nenhum dos 5 cursos de graduação atende plenamente todos os lados do seu perfil. Indicamos <strong>${c1}</strong> como o mais próximo, mas reconhecemos abertamente a singularidade — vale muito uma conversa com a equipe de orientação para desenhar um caminho sob medida.`;
}

/* ============================================================
   Modelo de pontuação
   ============================================================ */

function novoEstado() {
  return {
    foco: 1,      // eixo contínuo 0..2, começa no centro
    camada: 1.5,  // eixo contínuo 0..3, começa no centro
    estiloIntegrador: 0, // negativo = integrador, positivo = especialista
    estiloConstrutor: 0, // negativo = construtor, positivo = investigador
    respostas: {},
  };
}

function aplicarResposta(estado, pergunta, valor) {
  estado.respostas[pergunta.id] = valor;
  pergunta.efeitos.forEach(({ eixo, peso }) => {
    if (eixo === "foco") {
      estado.foco = clamp(estado.foco + valor * peso * 0.35, 0, 2);
    } else if (eixo === "camada") {
      estado.camada = clamp(estado.camada + valor * peso * 0.5, 0, 3);
    } else if (eixo === "estiloIntegrador") {
      estado.estiloIntegrador += valor * peso;
    } else if (eixo === "estiloConstrutor") {
      estado.estiloConstrutor += valor * peso;
    }
  });
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function estiloAtual(estado) {
  if (estado.estiloIntegrador < 0) return "Integrador";
  return estado.estiloConstrutor <= 0 ? "Construtor" : "Investigador";
}

// Distância máxima possível entre um perfil e a âncora de um curso: acontece entre
// os dois extremos opostos do espaço (perfil sobre CC vs. ADM Tech, e vice-versa).
const DIST_MAX = 2 * PESO_FOCO + PESO_ESTILO + 3 * PESO_CAMADA; // 6.9

const AFINIDADE_MAX = 5;

// Converte distância (menor = mais compatível) em afinidade 0–5 (maior = mais
// compatível), só para exibição — os dados continuam sendo gravados em distância.
// A escala é absoluta, contra DIST_MAX, e não relativa ao máximo do respondente:
// assim um perfil distante de todos os cursos não recebe nota alta no primeiro
// colocado só por ele ser o menos distante, o que contradiria a devolutiva.
function afinidade(dist) {
  return clamp(AFINIDADE_MAX * (1 - dist / DIST_MAX), 0, AFINIDADE_MAX);
}

function calcularDistancias(estado) {
  const estilo = estiloAtual(estado);
  const dists = Object.entries(ANCORAS).map(([curso, ancora]) => {
    const dFoco = Math.abs(estado.foco - ancora.foco) * PESO_FOCO;
    const dEstilo = (estilo === ancora.estilo ? 0 : 1) * PESO_ESTILO;
    const dCamada = Math.abs(estado.camada - ancora.camada) * PESO_CAMADA;
    return { curso, dist: dFoco + dEstilo + dCamada };
  });
  dists.sort((a, b) => a.dist - b.dist);
  return dists;
}

function classificar(dists) {
  const [top1, top2] = dists;
  const gap = top2.dist - top1.dist;
  let tipo;
  if (top1.dist <= 2.2 && gap < 0.8) {
    tipo = "fronteira";
  } else if (top1.dist <= 1.5 && gap >= 0.8) {
    tipo = "âncora-adjacente";
  } else if (top1.dist < 2.8) {
    tipo = "adjacente-distante";
  } else {
    tipo = "órfão";
  }
  return { tipo, curso1: top1.curso, curso2: top2.curso, dist1: top1.dist, dist2: top2.dist, gap };
}

// Identifica qual adaptativa corresponde ao par de cursos empatado
function adaptativaParaPar(curso1, curso2) {
  const par = new Set([curso1, curso2]);
  for (const [letra, adapt] of Object.entries(ADAPTATIVAS)) {
    if (adapt.par.every((c) => par.has(c))) return letra;
  }
  return null;
}
