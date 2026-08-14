/* ============================================================
   Quiz Vocacional Inteli — PILOTO DE TESTE
   Fluxo: intro → dados pessoais → núcleo → adaptativa condicional
          → resultado → feedback estruturado → envio
   ============================================================ */

const app = document.getElementById("app");

const CURSOS_OPCOES = ["ADM Tech", "SI", "ES", "EC", "CC"];

const flow = {
  etapa: "intro", // intro | dados | perguntas | resultado | feedback | enviado | erro
  estado: novoEstado(),
  nome: "",
  cursoReal: "",
  cursoRealOutro: "",
  filaNucleo: [...NUCLEO],
  indice: 0,
  adaptativaAtual: null,
  resultado: null,
  feedback: { precisao: null, relevancia: null, comentario: "" },
};

function totalPerguntasEstimado() {
  return flow.adaptativaAtual ? NUCLEO.length + 1 : NUCLEO.length;
}

function render() {
  app.innerHTML = "";
  switch (flow.etapa) {
    case "intro":
      renderIntro();
      break;
    case "dados":
      renderDados();
      break;
    case "perguntas":
      if (flow.indice < NUCLEO.length) {
        renderPergunta(NUCLEO[flow.indice], flow.indice + 1);
      } else {
        renderPergunta(ADAPTATIVAS[flow.adaptativaAtual], NUCLEO.length + 1, true);
      }
      break;
    case "resultado":
      renderResultado();
      break;
    case "feedback":
      renderFeedback();
      break;
    case "enviado":
      renderEnviado();
      break;
  }
}

function renderHeader(passoAtual, passoTotal) {
  const header = document.createElement("header");
  header.className = "top";
  header.innerHTML = `
    <div>
      <div class="eyebrow">Inteli · Piloto de teste</div>
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
    <p class="lead"><strong>Essa é uma versão de teste.</strong> Vamos te pedir seu nome e o curso que você já faz no Inteli para comparar com o resultado do quiz, e no final um feedback rápido. Isso ajuda a calibrar o modelo — obrigado por participar!</p>
    <button class="btn-primary" id="start-btn">Começar</button>
  `;
  app.appendChild(card);
  document.getElementById("start-btn").addEventListener("click", () => {
    flow.etapa = "dados";
    render();
  });
}

function renderDados() {
  renderHeader();
  const card = document.createElement("div");
  card.className = "card dados";
  card.innerHTML = `
    <div class="question-text">Antes de começar</div>
    <div class="field">
      <label for="input-nome">Seu nome</label>
      <input type="text" id="input-nome" placeholder="Nome completo" value="${escapeAttr(flow.nome)}">
    </div>
    <div class="field">
      <label for="input-curso">Curso que você já faz no Inteli</label>
      <select id="input-curso">
        <option value="">Selecione...</option>
        ${CURSOS_OPCOES.map((c) => `<option value="${c}" ${flow.cursoReal === c ? "selected" : ""}>${NOME_CURSO[c]}</option>`).join("")}
        <option value="Outro" ${flow.cursoReal === "Outro" ? "selected" : ""}>Outro</option>
      </select>
    </div>
    <div class="field" id="campo-curso-outro" style="display:${flow.cursoReal === "Outro" ? "block" : "none"}">
      <label for="input-curso-outro">Qual?</label>
      <input type="text" id="input-curso-outro" placeholder="Nome do curso" value="${escapeAttr(flow.cursoRealOutro)}">
    </div>
    <div class="field-error" id="dados-erro"></div>
    <button class="btn-primary" id="dados-continuar">Continuar</button>
  `;
  app.appendChild(card);

  const inputNome = card.querySelector("#input-nome");
  const inputCurso = card.querySelector("#input-curso");
  const campoOutro = card.querySelector("#campo-curso-outro");
  const inputCursoOutro = card.querySelector("#input-curso-outro");

  inputCurso.addEventListener("change", () => {
    campoOutro.style.display = inputCurso.value === "Outro" ? "block" : "none";
  });

  card.querySelector("#dados-continuar").addEventListener("click", () => {
    const nome = inputNome.value.trim();
    const curso = inputCurso.value;
    const cursoOutro = inputCursoOutro.value.trim();
    const erroEl = card.querySelector("#dados-erro");

    if (!nome) {
      erroEl.textContent = "Preencha seu nome para continuar.";
      return;
    }
    if (!curso) {
      erroEl.textContent = "Selecione o curso que você já faz.";
      return;
    }
    if (curso === "Outro" && !cursoOutro) {
      erroEl.textContent = "Diga qual curso você faz.";
      return;
    }

    flow.nome = nome;
    flow.cursoReal = curso;
    flow.cursoRealOutro = curso === "Outro" ? cursoOutro : "";
    flow.etapa = "perguntas";
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
    flow.etapa = "resultado";
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
    flow.etapa = "resultado";
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
  const devolutiva = buildDevolutiva(r.tipo, r.curso1, r.curso2, r.gap);
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

    <button class="btn-primary" id="feedback-btn">Continuar para o feedback</button>
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

  document.getElementById("feedback-btn").addEventListener("click", () => {
    flow.etapa = "feedback";
    render();
  });
}

const RATING_PRECISAO = [
  { value: 1, label: "Nada a ver" },
  { value: 2, label: "Pouco a ver" },
  { value: 3, label: "Mais ou menos" },
  { value: 4, label: "Bastante a ver" },
  { value: 5, label: "Exatamente" },
];

const RATING_RELEVANCIA = [
  { value: 1, label: "Nada relevantes" },
  { value: 2, label: "Pouco relevantes" },
  { value: 3, label: "Mais ou menos" },
  { value: 4, label: "Bem relevantes" },
  { value: 5, label: "Muito relevantes" },
];

function renderFeedback() {
  renderHeader();
  const r = flow.resultado;

  const card = document.createElement("div");
  card.className = "card feedback";
  card.innerHTML = `
    <div class="question-text">Rapidinho, seu feedback nos ajuda a calibrar o quiz</div>

    <div class="field">
      <label>O curso indicado (<strong>${NOME_CURSO[r.curso1]}</strong>) tem a ver com o curso que você realmente faz (<strong>${flow.cursoReal === "Outro" ? flow.cursoRealOutro : NOME_CURSO[flow.cursoReal]}</strong>)?</label>
      <div class="rating-row" id="rating-precisao"></div>
    </div>

    <div class="field">
      <label>As perguntas do quiz foram relevantes para pensar sobre isso?</label>
      <div class="rating-row" id="rating-relevancia"></div>
    </div>

    <div class="field">
      <label for="input-comentario">Algum comentário livre? (opcional)</label>
      <textarea id="input-comentario" rows="3" placeholder="Alguma pergunta confusa, algo que faltou, algo que achou estranho...">${flow.feedback.comentario}</textarea>
    </div>

    <div class="field-error" id="feedback-erro"></div>
    <button class="btn-primary" id="feedback-enviar">Enviar respostas</button>
  `;
  app.appendChild(card);

  montarRating(card.querySelector("#rating-precisao"), RATING_PRECISAO, flow.feedback.precisao, (v) => {
    flow.feedback.precisao = v;
  });
  montarRating(card.querySelector("#rating-relevancia"), RATING_RELEVANCIA, flow.feedback.relevancia, (v) => {
    flow.feedback.relevancia = v;
  });

  card.querySelector("#feedback-enviar").addEventListener("click", async () => {
    flow.feedback.comentario = card.querySelector("#input-comentario").value.trim();
    const erroEl = card.querySelector("#feedback-erro");

    if (!flow.feedback.precisao || !flow.feedback.relevancia) {
      erroEl.textContent = "Preencha as duas avaliações para continuar.";
      return;
    }

    const btn = card.querySelector("#feedback-enviar");
    btn.disabled = true;
    btn.textContent = "Enviando...";
    await enviarResultado();
    flow.etapa = "enviado";
    render();
  });
}

function montarRating(container, opcoes, valorAtual, onChange) {
  opcoes.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rating-btn" + (valorAtual === opt.value ? " selected" : "");
    btn.innerHTML = `<span class="rating-num">${opt.value}</span><span class="rating-label">${opt.label}</span>`;
    btn.addEventListener("click", () => {
      onChange(opt.value);
      container.querySelectorAll(".rating-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
    container.appendChild(btn);
  });
}

function montarPayload() {
  const r = flow.resultado;
  return {
    timestamp: new Date().toISOString(),
    nome: flow.nome,
    cursoReal: flow.cursoReal,
    cursoRealOutro: flow.cursoRealOutro,
    resultado: {
      tipo: r.tipo,
      curso1: r.curso1,
      curso2: r.curso2,
      dist1: r.dist1,
      dist2: r.dist2,
      gap: r.gap,
    },
    acertou: flow.cursoReal === r.curso1,
    estadoFinal: {
      foco: flow.estado.foco,
      camada: flow.estado.camada,
      estiloIntegrador: flow.estado.estiloIntegrador,
      estiloConstrutor: flow.estado.estiloConstrutor,
    },
    respostas: flow.estado.respostas,
    distancias: r.dists,
    feedback: flow.feedback,
  };
}

async function enviarResultado() {
  const payload = montarPayload();

  if (!CONFIG.GAS_URL) {
    baixarBackupLocal(payload);
    return;
  }

  try {
    await fetch(CONFIG.GAS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // modo no-cors não deixa ler erros de HTTP; isso só cai aqui se a rede falhar de fato.
    baixarBackupLocal(payload);
  }
}

function baixarBackupLocal(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `quiz-vocacional-${(flow.nome || "resposta").replace(/\s+/g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function renderEnviado() {
  renderHeader();
  const card = document.createElement("div");
  card.className = "card enviado";
  card.innerHTML = `
    <p class="lead">Obrigado, ${flow.nome.split(" ")[0]}! Sua resposta foi registrada.</p>
    <p class="lead">${CONFIG.GAS_URL ? "" : "Como o envio automático ainda não está configurado, um arquivo com sua resposta foi baixado — por favor envie esse arquivo para quem está coordenando o teste."}</p>
    <button class="btn-secondary" id="restart-btn">Responder novamente</button>
  `;
  app.appendChild(card);

  document.getElementById("restart-btn").addEventListener("click", () => {
    flow.estado = novoEstado();
    flow.nome = "";
    flow.cursoReal = "";
    flow.cursoRealOutro = "";
    flow.indice = 0;
    flow.adaptativaAtual = null;
    flow.resultado = null;
    flow.feedback = { precisao: null, relevancia: null, comentario: "" };
    flow.etapa = "intro";
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

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

render();
