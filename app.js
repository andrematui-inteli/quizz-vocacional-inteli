/* ============================================================
   Quiz Vocacional Inteli — motor de fluxo e renderização
   ============================================================ */

const app = document.getElementById("app");

const flow = {
  estado: novoEstado(),
  filaNucleo: [...NUCLEO],
  indice: 0,
  adaptativaAtual: null,
  resultado: null,
};

function totalPerguntasEstimado() {
  return flow.adaptativaAtual ? NUCLEO.length + 1 : NUCLEO.length;
}

function render() {
  app.innerHTML = "";
  if (flow.indice === -1) {
    renderIntro();
  } else if (flow.indice < NUCLEO.length) {
    renderPergunta(NUCLEO[flow.indice], flow.indice + 1);
  } else if (flow.adaptativaAtual && !flow.resultado) {
    renderPergunta(ADAPTATIVAS[flow.adaptativaAtual], NUCLEO.length + 1, true);
  } else {
    renderResultado();
  }
}

function renderHeader(passoAtual, passoTotal) {
  const header = document.createElement("header");
  header.className = "top";
  header.innerHTML = `
    <div>
      <div class="eyebrow">Inteli · Captação de vocação</div>
      <h1>Quiz <em>Vocacional</em></h1>
    </div>
    <div class="header-meta">
      ${passoAtual ? `Pergunta ${passoAtual} de ${passoTotal}` : "3–5 minutos"}
    </div>
  `;
  app.appendChild(header);
}

function renderIntro() {
  renderHeader();
  const card = document.createElement("div");
  card.className = "card intro";
  card.innerHTML = `
    <p class="lead">
      Este quiz não pergunta "qual curso você prefere". Ele te conhece por três ângulos —
      onde você quer ver seu impacto, como sua mente ataca problemas difíceis e o quanto você
      quer entrar por dentro da tecnologia — e só então cruza esse perfil com o curso do Inteli
      que mais combina com você.
    </p>
    <p class="lead">Responda com o que soa mais verdadeiro, não com o que parece "a resposta certa". Não existe resposta errada.</p>
    <button class="btn-primary" id="start-btn">Começar</button>
  `;
  app.appendChild(card);
  document.getElementById("start-btn").addEventListener("click", () => {
    flow.indice = 0;
    render();
  });
}

function renderPergunta(pergunta, passoAtual, isAdaptativa) {
  renderHeader(passoAtual, totalPerguntasEstimado());

  const progress = document.createElement("div");
  progress.className = "progress-track";
  const pct = (passoAtual / totalPerguntasEstimado()) * 100;
  progress.innerHTML = `<div class="progress-fill" style="width:${pct}%"></div>`;
  app.appendChild(progress);

  const card = document.createElement("div");
  card.className = "card question";
  card.innerHTML = `
    ${isAdaptativa ? '<div class="tag-adapt">Uma pergunta extra para entender melhor seu perfil</div>' : ""}
    <div class="question-text">${pergunta.texto}</div>
    <div class="poles">
      <div class="pole pole-a"><span class="pole-label">A</span>${pergunta.poloA}</div>
      <div class="pole pole-b"><span class="pole-label">B</span>${pergunta.poloB}</div>
    </div>
    <div class="scale" id="scale"></div>
  `;
  app.appendChild(card);

  const scaleEl = card.querySelector("#scale");
  SCALE.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "scale-btn";
    btn.textContent = opt.label;
    btn.addEventListener("click", () => {
      aplicarResposta(flow.estado, pergunta, opt.value);
      avancar(isAdaptativa);
    });
    scaleEl.appendChild(btn);
  });
}

function avancar(eraAdaptativa) {
  if (eraAdaptativa) {
    flow.resultado = computarResultado();
    render();
    return;
  }

  flow.indice += 1;

  if (flow.indice >= NUCLEO.length) {
    const dists = calcularDistancias(flow.estado);
    const classificacao = classificar(dists);
    if (classificacao.tipo === "fronteira") {
      const letra = adaptativaParaPar(classificacao.curso1, classificacao.curso2);
      if (letra) {
        flow.adaptativaAtual = letra;
        render();
        return;
      }
    }
    flow.resultado = computarResultado();
  }

  render();
}

function computarResultado() {
  const dists = calcularDistancias(flow.estado);
  const classificacao = classificar(dists);
  return { ...classificacao, dists, estado: flow.estado };
}

function renderResultado() {
  renderHeader();
  const r = flow.resultado;
  const interpretacao = buildInterpretacao(flow.estado.foco, estiloAtual(flow.estado), flow.estado.camada);
  const devolutiva = buildDevolutiva(r.tipo, r.curso1, r.curso2, r.gap, !!flow.adaptativaAtual);
  const maxDist = Math.max(...r.dists.map((d) => d.dist));

  const card = document.createElement("div");
  card.className = "card resultado";
  card.innerHTML = `
    <span class="profile-tag tag-${slug(r.tipo)}">${FEEDBACK_LABEL[r.tipo]}</span>
    <p class="interpretation">“${interpretacao}”</p>

    <div class="verdict-card">
      <div class="label">Curso indicado</div>
      <div class="course">${NOME_CURSO[r.curso1]}</div>
    </div>

    <p class="devolutiva">${devolutiva}</p>

    <div class="distances">
      <h4>Como você se compara aos 5 cursos</h4>
      <div id="distances-list"></div>
    </div>

    <button class="btn-secondary" id="restart-btn">Refazer o quiz</button>
  `;
  app.appendChild(card);

  const distEl = card.querySelector("#distances-list");
  r.dists.forEach((d, i) => {
    const pct = maxDist > 0 ? (d.dist / maxDist) * 100 : 0;
    const cls = i === 0 ? "closest" : i === 1 ? "second" : "other";
    const row = document.createElement("div");
    row.className = "dist-row";
    row.innerHTML = `
      <div class="dist-name">${NOME_CURSO[d.curso]}</div>
      <div class="dist-bar-track"><div class="dist-bar-fill ${cls}" style="width:${pct}%"></div></div>
      <div class="dist-value">${d.dist.toFixed(1)}</div>
    `;
    distEl.appendChild(row);
  });

  document.getElementById("restart-btn").addEventListener("click", () => {
    flow.estado = novoEstado();
    flow.indice = -1;
    flow.adaptativaAtual = null;
    flow.resultado = null;
    render();
  });
}

const TIPO_CLASS = {
  "âncora-adjacente": "ancora",
  "fronteira": "fronteira",
  "adjacente-distante": "distante",
  "órfão": "orfao",
};

function slug(tipo) {
  return TIPO_CLASS[tipo] || "ancora";
}

flow.indice = -1;
render();
