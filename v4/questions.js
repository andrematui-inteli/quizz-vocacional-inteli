/* ============================================================
   Quiz Vocacional Inteli — MODELO v4
   Banco de perguntas e modelo de pontuação.

   Mudanças em relação à v3 (o histórico rodada a rodada de redação, viés e
   escala continua em ../v3/questions.js e em
   DocumentosRef/Inteli_Quiz_v2_Diagnostico_e_Revisao_Perguntas.md):
   - De 12 para 9 perguntas gerais (3 por eixo), removendo as redundâncias
     de conteúdo descritas em NUCLEO abaixo. 4 dos 9 itens (C1, M2, A3, C4)
     mantêm o texto da v3. Os outros 5 (C5, A5, A6, M5, M6) são novos, de
     temas que ainda não estavam no banco, no lugar de itens que repetiam o
     tema de outro. Têm ids novos para que respostas antigas gravadas com
     C2, A1, A4, M1 e M4 não sejam confundidas com as destas.
   - Novo bloco final de 3 perguntas específicas entre os dois cursos mais
     próximos do perfil geral (ver BLOCOS). O bloco decide qual dos dois
     é o curso indicado.
   - Escala, eixos, âncoras, pesos de eixo e fórmula do passo: iguais à v3.
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
   Núcleo: 9 afirmações (3 por eixo), respondidas por todos numa escala de
   concordância. Concordar move o eixo para o polo "alto" (camada 3 =
   hardware/fundamentos, amplitude 2 = especialista, modo 2 = investigador),
   EXCETO `A5` e `M5`, de chave invertida: concordar descreve o polo baixo
   (A5: Integrador; M5: Construtor), por isso seus pesos são negativos.
   Camada não tem item invertido.

   Cada item tem um tema (comentário ao lado), que é o rótulo usado para
   conferir se dois itens do banco falam da mesma coisa.

   Origem dos 9 itens (a v3 tinha 4 por eixo). Sem a planilha de respostas
   não deu para medir correlação entre itens, então a revisão é por
   conteúdo: dois itens redundantes medem o mesmo traço na mesma direção,
   só trocando o cenário, e por isso contam duas vezes uma única informação.

   Cortados por redundância com outro item:
   - `C3` sobrepõe `C4`: os dois medem se a atenção vai para o lado técnico
     de um projeto/tecnologia. `C4` fica porque também é o único item que
     ancora o polo de negócio (custo/receita), que separa ADM Tech/SI dos
     demais. `C3` tinha peso 0,8 e estava sinalizado para revisão.
   - `A2` é o mesmo item que `A1` com o cenário trocado (curso vs. projeto).
   - `M3` sobrepõe `M1`: os dois são "entender a causa do problema antes de
     seguir". `M3` também já tinha sido reescrito duas vezes por vazamento
     de método de projeto (PBL) e tinha peso 0,8.

   Trocados depois da revisão dos temas (um item repetia o tema de outro):
   - `A1` e `A4` repetiam o tema Especialista de `A3`, e `C2` também era lido
     como Especialista. Entraram `A5` (Integrador, o polo que nenhum item de
     Amplitude descrevia) e `A6` (Aperfeiçoar), e `C5` (Infraestrutura) no
     lugar de `C2`.
   - `M4` repetia o tema Entender de `M1`. Entrou `M5` (Organização), que
     mede planejar antes de agir. Na chave invertida, porque "planejar antes"
     soa como a resposta madura e tende a puxar concordância, como já
     aconteceu com `M1` (6 de 7 respostas reais concordaram).
   - `M1` repetia `C1`: nos dois algo falhou e a pessoa vai atrás da causa
     (C1: o sistema que trava; M1: o projeto que não saiu como esperado).
     Entrou `M6` (Porquê do acerto), a mesma vontade de entender mas num
     cenário de acerto e não de falha. Direta (Investigador): com `M2`
     direto e `M5` invertido, Modo segue com 2 diretos e 1 invertido.

   Todos os pesos de item são ±1,0 (os únicos com 0,8 eram `C3` e `M3`).
   ------------------------------------------------------------ */
const NUCLEO = [
  { // Investigar
    id: "C1", eixo: "camada", peso: 1.0,
    texto: "Quando o sistema que estou desenvolvendo trava, meu interesse natural é investigar a causa técnica raiz: seja no código, no hardware ou na conexão.",
  },
  { // Integrador
    id: "A5", eixo: "amplitude", peso: -1.0,
    texto: "Quando estudo um assunto, me incomoda não saber como ele se liga a outras áreas.",
  },
  { // Porquê do acerto
    id: "M6", eixo: "modo", peso: 1.0,
    texto: "Quando algo dá certo sem eu saber por quê, fico querendo descobrir o motivo.",
  },
  { // Infraestrutura
    id: "C5", eixo: "camada", peso: 1.0,
    texto: "Em um projeto, gosto de pensar sobre o caminho que a informação percorre até o resultado aparecer na tela do usuário.",
  },
  { // Explicar
    id: "M2", eixo: "modo", peso: 1.0,
    texto: "Quando alguém me pergunta como resolver algo, prefiro explicar o raciocínio todo por trás da solução a indicar diretamente o que fazer.",
  },
  { // Especialista
    id: "A3", eixo: "amplitude", peso: 1.0,
    texto: "Prefiro ser conhecido(a) por saber muito sobre um assunto específico a ser conhecido(a) por se virar bem em áreas bem diferentes.",
  },
  { // Técnico x Financeiro
    id: "C4", eixo: "camada", peso: 1.0,
    texto: "Fico mais curioso(a) sobre os detalhes técnicos de uma tecnologia do que sobre quanto ela custa pra desenvolver ou quanto pode gerar de receita.",
  },
  { // Aperfeiçoar
    id: "A6", eixo: "amplitude", peso: 1.0,
    texto: "Com uma semana livre, prefiro aperfeiçoar algo que já sei fazer a testar algo totalmente novo.",
  },
  { // Organização
    id: "M5", eixo: "modo", peso: -1.0,
    texto: "Prefiro um dia em aberto, decidindo o que fazer conforme as coisas surgem, a um dia com tudo marcado.",
  },
];

/* ------------------------------------------------------------
   Bloco final: 3 afirmações específicas entre os dois cursos mais próximos
   do perfil geral. Quem decide o curso indicado é o bloco, não a ordem das
   distâncias do modelo geral.

   Por que existe um bloco por par e não um único conjunto: os eixos já
   foram medidos pelas 9 perguntas gerais. Se o bloco voltasse a perguntar
   "fundo ou amplo", "por dentro ou por fora", só repetiria o que o modelo já
   sabe. Aqui as afirmações são sobre o CONTEÚDO que separa os dois cursos
   (o que se constrói, com que tipo de problema se trabalha), tirado dos
   projetos da grade de cada um (ver Inteli_Quiz_Contexto_Completo.md, seção 4).
   Nenhuma afirmação cita nome de curso.

   Quais pares têm bloco: enumeração exaustiva das 7^9 = 40.353.607
   combinações de resposta das perguntas gerais mostra que só 7 dos 10 pares
   possíveis chegam a ser (1º, 2º) do modelo geral. ADM Tech×ES, SI×CC e
   ES×CC nunca aparecem, então não têm bloco. Frequência de cada par (peso
   uniforme, não previsão de comportamento real):
     ADM Tech×SI 21,1% · SI×ES 20,2% · ES×EC 20,0% · EC×CC 16,8%
     SI×EC 7,6% · ADM Tech×EC 7,2% · ADM Tech×CC 7,1%
   Se as âncoras forem recalibradas, essa lista precisa ser reverificada;
   `blocoParaPar` devolve null para par sem bloco e o app cai no resultado
   geral em vez de quebrar.

   Cada afirmação tem `favorece`: o curso para o qual CONCORDAR empurra.
   Discordar empurra para o outro curso do par. Os itens são 2 de um curso
   e 1 do outro, com o item "sozinho" no meio, para que quem concorda com
   tudo (viés de aquiescência) não seja empurrado sempre para o mesmo lado:
   o desbalanço fica limitado a 3 dos 9 pontos possíveis. Qual curso fica com
   2 itens alterna entre os pares, de modo que cada curso tenha 2 itens em
   cerca de metade dos pares em que aparece:
     ADM×SI → SI(2) · SI×ES → ES(2) · ES×EC → EC(2) · EC×CC → CC(2)
     SI×EC → SI(2) · ADM×EC → EC(2) · ADM×CC → ADM(2)

   Pontuação do bloco: soma de (resposta × sinal), sinal = +1 se o item
   favorece `cursos[0]` e −1 se favorece `cursos[1]`. Faixa −9..+9. Positivo
   vence `cursos[0]`, negativo vence `cursos[1]`. Zero (Neutro em tudo, ou
   respostas que se cancelam) não desempata: vale o 1º colocado do modelo
   geral. Os três itens pesam igual; nenhum item sozinho decide.

   Textos: rascunho para revisão, nas mesmas regras de estilo das perguntas
   gerais (sem "Num", sem travessão, sem flexão de gênero).
   ------------------------------------------------------------ */
const BLOCOS = [
  {
    cursos: ["ADM Tech", "SI"],
    itens: [
      { id: "B01", favorece: "SI", texto: "Me interessa organizar os dados de uma empresa e montar painéis que mostram, em tempo real, como o negócio está indo." },
      { id: "B02", favorece: "ADM Tech", texto: "Me atrai analisar mercado, finanças e clientes para decidir onde uma empresa deve investir e como ela pode crescer." },
      { id: "B03", favorece: "SI", texto: "Gosto de entender como os processos de uma empresa funcionam e de pensar em como os sistemas podem conectá-los." },
    ],
  },
  {
    cursos: ["SI", "ES"],
    itens: [
      { id: "B04", favorece: "ES", texto: "Me empolga a ideia de criar um aplicativo ou uma plataforma que muita gente vai usar todos os dias." },
      { id: "B05", favorece: "SI", texto: "Me interessa usar os dados que os sistemas de uma empresa geram para entender e melhorar o funcionamento dela." },
      { id: "B06", favorece: "ES", texto: "Me interessa pensar em como organizar um software para que ele continue funcionando bem quando cada vez mais gente passa a usá-lo." },
    ],
  },
  {
    cursos: ["ES", "EC"],
    itens: [
      { id: "B07", favorece: "EC", texto: "Me atrai criar algo que une programação e peças físicas, como um robô, um sensor ou uma máquina automatizada." },
      { id: "B08", favorece: "ES", texto: "Me empolga colocar um produto digital no ar e ir melhorando ele toda semana a partir de como as pessoas o usam." },
      { id: "B09", favorece: "EC", texto: "Me interessa descobrir como fazer um programa rodar bem em um aparelho com limites de energia, memória ou tempo de resposta." },
    ],
  },
  {
    cursos: ["EC", "CC"],
    itens: [
      { id: "B10", favorece: "CC", texto: "Me interessa entender a matemática e a lógica por trás de como uma inteligência artificial aprende." },
      { id: "B11", favorece: "EC", texto: "Me empolga ver meu trabalho acontecendo no mundo real, em objetos que se movem, reagem ou controlam alguma coisa." },
      { id: "B12", favorece: "CC", texto: "Me atrai criar um jeito mais eficiente de resolver um problema muito difícil, como achar o melhor caminho entre milhares de opções." },
    ],
  },
  {
    cursos: ["SI", "EC"],
    itens: [
      { id: "B13", favorece: "SI", texto: "Me interessa descobrir padrões nos dados de uma empresa para ajudar a prever o que vai acontecer com o negócio." },
      { id: "B14", favorece: "EC", texto: "Me empolga a ideia de trabalhar com robôs, sensores ou máquinas que interagem com o mundo físico." },
      { id: "B15", favorece: "SI", texto: "Me atrai ajudar uma empresa a organizar seus sistemas e processos para que ela funcione de forma mais segura e eficiente." },
    ],
  },
  {
    cursos: ["ADM Tech", "EC"],
    itens: [
      { id: "B16", favorece: "EC", texto: "Me interessa entender como funcionam os componentes de um equipamento eletrônico, como sensores e processadores, e programá-los." },
      { id: "B17", favorece: "ADM Tech", texto: "Me atrai analisar o que um mercado quer e montar uma estratégia para uma empresa vender mais e crescer." },
      { id: "B18", favorece: "EC", texto: "Me empolga a ideia de automatizar processos do mundo físico, como uma fábrica, uma plantação ou o trânsito de uma cidade." },
    ],
  },
  {
    cursos: ["ADM Tech", "CC"],
    itens: [
      { id: "B19", favorece: "ADM Tech", texto: "Me interessa entender como pessoas e números de uma empresa podem ser usados para ela tomar decisões melhores." },
      { id: "B20", favorece: "CC", texto: "Me interessa desenvolver algoritmos e modelos de inteligência artificial, e a matemática por trás deles." },
      { id: "B21", favorece: "ADM Tech", texto: "Me atrai analisar investimentos, preços e mercados para decidir onde vale a pena colocar dinheiro." },
    ],
  },
];

// Bloco do par (1º, 2º) do modelo geral, em qualquer ordem. null = sem bloco.
function blocoParaPar(cursoA, cursoB) {
  return BLOCOS.find((b) => b.cursos.includes(cursoA) && b.cursos.includes(cursoB)) || null;
}

function pontuarBloco(bloco, respostas) {
  return bloco.itens.reduce((soma, item) => {
    const sinal = item.favorece === bloco.cursos[0] ? 1 : -1;
    return soma + (respostas[item.id] || 0) * sinal;
  }, 0);
}

// Junta o resultado do modelo geral com o do bloco. Sem bloco (par sem
// cobertura), o resultado geral vale como está.
function resolverCursoFinal(geral, bloco, respostasBloco) {
  if (!bloco) {
    return { curso1: geral.curso1, curso2: geral.curso2, virou: false, bloco: null };
  }
  const pontos = pontuarBloco(bloco, respostasBloco);
  const empate = pontos === 0;
  const curso1 = empate ? geral.curso1 : pontos > 0 ? bloco.cursos[0] : bloco.cursos[1];
  const curso2 = curso1 === geral.curso1 ? geral.curso2 : geral.curso1;
  return {
    curso1,
    curso2,
    virou: curso1 !== geral.curso1,
    bloco: { cursos: bloco.cursos, pontos, empate },
  };
}

/* ------------------------------------------------------------
   Passo de cada eixo — derivado, não escolhido.

   passo = (faixa / 2) / (SCALE_MAX × soma dos pesos dos itens do eixo, em módulo)

   Soma em módulo porque `A5` e `M5` têm peso negativo (itens de chave invertida):
   o que importa pro alcance máximo do eixo é o quanto cada item PODE
   empurrar, não o sinal de quem empurra pra qual lado.

   O estado começa no centro da faixa (ver CENTRO), então só precisa
   percorrer metade da faixa para alcançar qualquer um dos extremos.
   Isso garante que concordar/discordar totalmente em TODOS os itens do
   eixo, no sentido que empurra pro mesmo lado, chegue exatamente ao
   extremo da faixa — sem ultrapassar e sem saturar antes disso.
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
   Classificação do perfil GERAL — limiares derivados da distribuição real
   do modelo (enumeração exaustiva das 7^9 = 40.353.607 combinações de
   resposta possíveis, 3 perguntas por eixo), não escolhidos a olho. Mesmo
   método da v3: agrupa por soma única por eixo (19 × 19 × 19 = 6.859
   estados combinados, cada um com sua contagem), que dá o mesmo resultado
   da enumeração completa. O método foi validado reproduzindo os limiares
   da v3 com as 12 perguntas (0,083 / 1,182 / 1,522).

   A classificação descreve o perfil geral (o quanto ele está perto de um
   curso, entre dois ou longe de todos). Quem escolhe o curso indicado é o
   bloco final; o tipo continua alimentando a devolutiva.
   ------------------------------------------------------------ */
const LIMIAR = {
  gapFronteira: 0.093, // percentil 12 dos gaps  → ~12% em fronteira
  d1Ancora: 1.157,     // percentil 50 das distâncias ao curso mais próximo
  d1Orfao: 1.534,      // percentil 90  → ~10% de órfãos
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

// curso1/curso2: curso indicado (já decidido pelo bloco) e o outro do par.
// `refinamento`: { virou, empate } vindo de resolverCursoFinal, ou null se o
// par não teve bloco. Os textos só afirmam desempate quando ele aconteceu.
function buildDevolutiva(tipo, curso1, curso2, refinamento) {
  const c1 = NOME_CURSO[curso1];
  const c2 = NOME_CURSO[curso2];

  if (tipo === "órfão") {
    return `Sua combinação é rara e nenhum dos 5 cursos de graduação atende plenamente todos os lados do seu perfil. Indicamos <strong>${c1}</strong> como o mais próximo, mas reconhecemos abertamente a singularidade. Vale muito uma conversa com a equipe de orientação para desenhar um caminho sob medida.`;
  }
  if (refinamento && refinamento.virou) {
    return `Pelas perguntas gerais, o curso mais próximo do seu perfil era <strong>${c2}</strong>. Mas nas três perguntas finais, que separam esses dois cursos, você se identificou mais com <strong>${c1}</strong>. Vale conhecer os dois de perto antes de decidir.`;
  }
  if (refinamento && refinamento.empate) {
    return `As três perguntas finais não desempataram entre <strong>${c1}</strong> e <strong>${c2}</strong>, então mantivemos ${c1}, o mais próximo do seu perfil pelas perguntas gerais. Vale conhecer os dois cursos de perto antes de decidir.`;
  }
  const confirmada = refinamento ? ", e as três perguntas finais confirmaram essa leitura" : "";

  if (tipo === "âncora-adjacente") {
    return `Esse perfil aponta com clareza para <strong>${c1}</strong>${confirmada}. ${c2} aparece como segunda opção compatível, com nuance distinta. Vale conhecer as fronteiras entre os dois.`;
  }
  if (tipo === "fronteira") {
    return refinamento
      ? `Seu perfil geral ficou quase empatado entre <strong>${c1}</strong> e <strong>${c2}</strong>, e as três perguntas finais desempataram a favor de <strong>${c1}</strong>. ${c2} continua muito próximo. Vale conhecer os dois cursos de perto.`
      : `Seu perfil ficou quase empatado entre <strong>${c1}</strong> e <strong>${c2}</strong>. Vale a pena conhecer os dois cursos de perto antes de decidir.`;
  }
  return `O curso mais próximo do seu perfil é <strong>${c1}</strong>${confirmada}, mas seu perfil tem uma tensão interessante: você não está bem no centro do curso. Isso pode virar um diferencial dentro dele.`;
}
