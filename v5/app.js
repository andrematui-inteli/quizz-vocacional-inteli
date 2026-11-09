/* ============================================================
   Quiz Vocacional Inteli — v5
   Fluxo: intro → dados pessoais → 9 afirmações gerais → 3 afirmações
   específicas do par de cursos mais próximo → resultado + feedback → envio

   Todos respondem as mesmas 9 gerais. O bloco final depende do par (1º, 2º)
   do modelo geral e decide qual dos dois é o curso indicado. Modelo igual
   ao da v4; a v5 muda a tela final (ver README.md).
   ============================================================ */

const app = document.getElementById("app");

const CURSOS_OPCOES = ["ADM Tech", "SI", "ES", "EC", "CC"];

const flow = {
  etapa: "intro", // intro | dados | perguntas | bloco | resultado | enviado
  estado: novoEstado(),
  nome: "",
  cursoReal: "",
  cursoRealOutro: "",
  indice: 0,
  resultado: null,      // modelo geral: tipo, curso1/curso2 (ranking geral) e dists
  bloco: null,          // bloco do par (1º, 2º) do modelo geral; null se o par não tem bloco
  indiceBloco: 0,
  respostasBloco: {},
  final: null,          // curso indicado depois do bloco (ver resolverCursoFinal)
  feedback: { comparacao: "", perguntas: "", comentario: "" },
};

function render() {
  app.innerHTML = "";
  switch (flow.etapa) {
    case "intro": renderIntro(); break;
    case "dados": renderDados(); break;
    case "perguntas": renderPergunta(NUCLEO[flow.indice], flow.indice + 1); break;
    case "bloco": renderPerguntaBloco(); break;
    case "resultado": renderResultado(); renderFeedback(); break;
    case "enviado": renderEnviado(); break;
  }
}

function renderHeader(meta) {
  const header = document.createElement("header");
  header.className = "top";
  header.innerHTML = `
    <div>
      <div class="eyebrow">Inteli · Quiz v5</div>
      <h1>Quiz <em>Vocacional</em></h1>
    </div>
    <div class="header-meta">
      ${meta || "3 a 5 minutos"}
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
      Este quiz não pergunta "qual curso você prefere". Ele te conhece por três ângulos:
      o quanto você quer entrar por dentro da tecnologia, se você prefere circular entre
      assuntos ou mergulhar fundo em um, e se sua cabeça age primeiro ou entende primeiro.
      Só então cruza esse perfil com o curso do Inteli que mais combina com você.
      São ${NUCLEO.length} perguntas gerais e, no final, 3 perguntas mais específicas para refinar o resultado.
    </p>
    <p class="lead">Responda com o que soa mais verdadeiro, não com o que parece "a resposta certa". Não existe resposta errada.</p>
    <p class="lead"><strong>Esta é uma versão de teste.</strong> Vamos te pedir seu nome e o curso que você já faz no Inteli para comparar com o resultado, e no final um feedback rápido. Isso ajuda a calibrar o modelo. Obrigado por participar!</p>
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

  const inputCurso = card.querySelector("#input-curso");
  const campoOutro = card.querySelector("#campo-curso-outro");
  inputCurso.addEventListener("change", () => {
    campoOutro.style.display = inputCurso.value === "Outro" ? "block" : "none";
  });

  card.querySelector("#dados-continuar").addEventListener("click", () => {
    const nome = card.querySelector("#input-nome").value.trim();
    const curso = inputCurso.value;
    const cursoOutro = card.querySelector("#input-curso-outro").value.trim();
    const erroEl = card.querySelector("#dados-erro");

    if (!nome) { erroEl.textContent = "Preencha seu nome para continuar."; return; }
    if (!curso) { erroEl.textContent = "Selecione o curso que você já faz."; return; }
    if (curso === "Outro" && !cursoOutro) { erroEl.textContent = "Diga qual curso você faz."; return; }

    flow.nome = nome;
    flow.cursoReal = curso;
    flow.cursoRealOutro = curso === "Outro" ? cursoOutro : "";
    flow.etapa = "perguntas";
    flow.indice = 0;
    render();
  });
}

// Tela de uma afirmação com a escala de concordância. Serve às perguntas
// gerais e às do bloco final, que só diferem no cabeçalho, no total para a
// barra de progresso e no que acontece ao responder.
function renderQuestao(pergunta, { meta, passoAtual, total, podeVoltar, aoResponder }) {
  renderHeader(meta);

  const progress = document.createElement("div");
  progress.className = "progress-track";
  progress.innerHTML = `<div class="progress-fill" style="width:${(passoAtual / total) * 100}%"></div>`;
  app.appendChild(progress);

  const card = document.createElement("div");
  card.className = "card question";
  card.innerHTML = `
    ${podeVoltar ? '<button class="btn-back" id="voltar-btn">← Pergunta anterior</button>' : ""}
    <div class="question-text">${pergunta.texto}</div>
    <div class="scale" id="scale"></div>
  `;
  app.appendChild(card);

  const scaleEl = card.querySelector("#scale");
  SCALE.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "scale-btn";
    btn.innerHTML = `
      <span class="scale-dot-wrap"><span class="scale-dot mag-${Math.abs(opt.value)}"></span></span>
      <span class="scale-label">${opt.label}</span>
    `;
    btn.addEventListener("click", () => aoResponder(opt.value));
    scaleEl.appendChild(btn);
  });

  if (podeVoltar) {
    card.querySelector("#voltar-btn").addEventListener("click", voltar);
  }
}

// Todos os blocos têm o mesmo número de itens. A barra de progresso já reserva
// esse trecho nas perguntas gerais, para não chegar a 100% na 9ª e ainda haver
// perguntas pela frente.
const ITENS_BLOCO = BLOCOS[0].itens.length;

function renderPergunta(pergunta, passoAtual) {
  renderQuestao(pergunta, {
    meta: `Pergunta ${passoAtual} de ${NUCLEO.length}`,
    passoAtual,
    total: NUCLEO.length + ITENS_BLOCO,
    podeVoltar: passoAtual > 1,
    aoResponder: (valor) => {
      aplicarResposta(flow.estado, pergunta, valor);
      avancar();
    },
  });
}

function renderPerguntaBloco() {
  const item = flow.bloco.itens[flow.indiceBloco];
  renderQuestao(item, {
    meta: `Pergunta final ${flow.indiceBloco + 1} de ${flow.bloco.itens.length}`,
    passoAtual: NUCLEO.length + flow.indiceBloco + 1,
    total: NUCLEO.length + flow.bloco.itens.length,
    podeVoltar: true, // da 1ª pergunta final volta para a última geral
    aoResponder: (valor) => {
      flow.respostasBloco[item.id] = valor;
      avancarBloco();
    },
  });
}

// Volta pra pergunta respondida por último: remove a resposta dela e recalcula
// o estado do zero a partir do que sobrou em `respostas`, em vez de tentar
// subtrair o efeito diretamente — mais simples e evita depender de nenhuma
// suposição sobre o clamp() nunca ter truncado aquela resposta.
function voltar() {
  if (flow.etapa === "bloco") {
    if (flow.indiceBloco > 0) {
      flow.indiceBloco -= 1;
      delete flow.respostasBloco[flow.bloco.itens[flow.indiceBloco].id];
      render();
      return;
    }
    // Da 1ª pergunta final de volta para a última geral. Se ela for respondida
    // de novo o par pode mudar, então o bloco e o resultado geral são descartados.
    // flow.indice já está em NUCLEO.length desde que a última geral foi respondida.
    flow.bloco = null;
    flow.resultado = null;
    flow.respostasBloco = {};
    flow.etapa = "perguntas";
  }

  if (flow.indice <= 0) return;
  const perguntaAnterior = NUCLEO[flow.indice - 1];
  const respostasRestantes = { ...flow.estado.respostas };
  delete respostasRestantes[perguntaAnterior.id];

  flow.estado = novoEstado();
  NUCLEO.forEach((q) => {
    if (respostasRestantes[q.id] !== undefined) {
      aplicarResposta(flow.estado, q, respostasRestantes[q.id]);
    }
  });

  flow.indice -= 1;
  render();
}

function avancar() {
  flow.indice += 1;
  if (flow.indice >= NUCLEO.length) {
    const dists = calcularDistancias(flow.estado);
    flow.resultado = { ...classificar(dists), dists };
    flow.bloco = blocoParaPar(flow.resultado.curso1, flow.resultado.curso2);
    flow.indiceBloco = 0;
    flow.respostasBloco = {};
    if (flow.bloco) {
      flow.etapa = "bloco";
    } else {
      finalizar(); // par sem bloco: vale o resultado geral
    }
  }
  render();
}

function avancarBloco() {
  flow.indiceBloco += 1;
  if (flow.indiceBloco >= flow.bloco.itens.length) finalizar();
  render();
}

function finalizar() {
  flow.final = resolverCursoFinal(flow.resultado, flow.bloco, flow.respostasBloco);
  flow.etapa = "resultado";
}

function renderResultado() {
  renderHeader();
  const r = flow.resultado;
  const f = flow.final;
  const refinamento = f.bloco ? { virou: f.virou, empate: f.bloco.empate } : null;
  const interpretacao = buildInterpretacao(flow.estado);
  const devolutiva = buildDevolutiva(r.tipo, f.curso1, f.curso2, refinamento);

  let notaAfinidade = "Calculada com as perguntas gerais.";
  if (f.bloco) {
    const [c0, c1] = f.bloco.cursos;
    notaAfinidade += ` As 3 perguntas finais decidiram entre ${NOME_CURSO[c0]} e ${NOME_CURSO[c1]}.`;
  }

  // O dropdown de competências é sobre o curso do aluno (`cursoReal`). Se o
  // quiz indicou um curso diferente, compara os dois lado a lado; se indicou
  // o mesmo, mostra só esse; se `cursoReal` não tem âncora no modelo ("Outro"),
  // cai para mostrar só o curso indicado, já que não há com o que comparar.
  const temAncoraReal = !!ANCORAS[flow.cursoReal];
  const comparando = temAncoraReal && flow.cursoReal !== f.curso1;
  const cursoFoco = temAncoraReal ? flow.cursoReal : f.curso1;

  let competenciasTitulo;
  let competenciasNota;
  if (comparando) {
    competenciasTitulo = `Comparar ${NOME_CURSO[flow.cursoReal]} (seu curso) com ${NOME_CURSO[f.curso1]} (indicado)`;
    competenciasNota = `Nota de 0 a 5 por competência: quanto mais alta, mais essa competência aproxima daquele curso; quanto mais baixa, mais afasta.`;
  } else if (temAncoraReal) {
    competenciasTitulo = `Ver o que te aproximou ou afastou de ${NOME_CURSO[cursoFoco]}`;
    competenciasNota = `Nota de 0 a 5 por competência avaliada: quanto mais alta, mais sua resposta nesse aspecto te aproximou do seu curso, <strong>${NOME_CURSO[cursoFoco]}</strong>; quanto mais baixa, mais te afastou.`;
  } else {
    competenciasTitulo = `Ver o que te aproximou ou afastou de ${NOME_CURSO[cursoFoco]}`;
    competenciasNota = `Seu curso atual não é um dos 5 mapeados pelo modelo, então a comparação abaixo é só com o curso indicado, <strong>${NOME_CURSO[cursoFoco]}</strong>: quanto mais alta a nota, mais essa competência te aproximou dele; quanto mais baixa, mais te afastou.`;
  }

  const card = document.createElement("div");
  card.className = "card resultado";
  card.innerHTML = `
    <span class="profile-tag tag-${slug(r.tipo)}">${FEEDBACK_LABEL[r.tipo]}</span>
    <p class="interpretation">“${interpretacao}”</p>

    <div class="verdict-card">
      <div class="label">Curso indicado</div>
      <div class="course">${NOME_CURSO[f.curso1]}</div>
    </div>

    <p class="devolutiva">${devolutiva}</p>

    <div class="distances">
      <h4>Sua afinidade com os 5 cursos <span class="scale-hint">0 a 5</span></h4>
      <p class="compare-scale-note">${notaAfinidade}</p>
      <div id="distances-list"></div>
      <details class="competencias-detalhe">
        <summary>${competenciasTitulo}</summary>
        <p class="compare-scale-note">${competenciasNota}</p>
        <div id="competencias-list"></div>
      </details>
    </div>
  `;
  app.appendChild(card);

  const distEl = card.querySelector("#distances-list");
  r.dists.forEach((d, i) => {
    const af = afinidade(d.dist);
    const pct = (af / AFINIDADE_MAX) * 100;
    const cls = i === 0 ? "closest" : i === 1 ? "second" : "other";
    const isReal = d.curso === flow.cursoReal;
    const row = document.createElement("div");
    row.className = "dist-row" + (isReal ? " is-real" : "");
    row.innerHTML = `
      <div class="dist-name">${NOME_CURSO[d.curso]}${isReal ? '<span class="badge-seu">seu curso</span>' : ""}</div>
      <div class="dist-bar-track"><div class="dist-bar-fill ${cls}" style="width:${pct}%"></div></div>
      <div class="dist-value">${af.toFixed(1)}</div>
    `;
    distEl.appendChild(row);
  });

  const compEl = card.querySelector("#competencias-list");
  const colunas = comparando
    ? [
        { key: "a", label: `Seu curso · ${NOME_CURSO[flow.cursoReal]}`, comp: competenciasCurso(flow.estado, flow.cursoReal) },
        { key: "b", label: `Indicado · ${NOME_CURSO[f.curso1]}`, comp: competenciasCurso(flow.estado, f.curso1) },
      ]
    : [{ key: "a", label: null, comp: competenciasCurso(flow.estado, cursoFoco) }];

  if (comparando) {
    const legenda = document.createElement("div");
    legenda.className = "competencias-legenda";
    legenda.innerHTML = colunas
      .map(({ key, label }) => `<span class="legenda-item"><span class="legenda-dot dot-${key}"></span>${label}</span>`)
      .join("");
    compEl.appendChild(legenda);
  }

  EIXOS.forEach((eixo, i) => {
    const row = document.createElement("div");
    row.className = "competencia-row";
    row.innerHTML = `
      <div class="competencia-nome">
        ${EIXO_LABEL[eixo]}
        <span class="competencia-polos">${EIXO_POLOS[eixo]}</span>
      </div>
      <div class="competencia-barras">
        ${colunas.map(({ key, comp }) => {
          const c = comp[i];
          const pct = (c.nota / AFINIDADE_MAX) * 100;
          return `
            <div class="competencia-bar-item">
              <div class="competencia-bar-track">
                <span class="competencia-bar-tick"></span>
                <div class="competencia-bar-fill fill-${key}" style="width:${pct}%"></div>
              </div>
              <span class="competencia-bar-valor">${c.nota.toFixed(1)}<span class="scale-hint">/5</span></span>
              <span class="competencia-bar-status">${c.aproximou ? "aproximou" : "afastou"}</span>
            </div>`;
        }).join("")}
      </div>
    `;
    compEl.appendChild(row);
  });
}

/* ------------------------------------------------------------
   Sugestão × realidade
   ------------------------------------------------------------ */

function distanciaEntreAncoras(cursoA, cursoB) {
  const a = ANCORAS[cursoA], b = ANCORAS[cursoB];
  if (!a || !b) return null;
  return EIXOS.reduce((s, e) => s + Math.abs(a[e] - b[e]) * PESO[e], 0);
}

// "Indicado" é o curso final, depois do bloco. As distâncias e o ranking vêm do
// modelo geral (o bloco não gera distância), e `acertouGeral` guarda se o
// 1º colocado do modelo geral sozinho teria acertado: é o que permite medir se
// o bloco melhora ou piora o resultado.
function analisarSugestaoVsRealidade() {
  const r = flow.resultado;
  const f = flow.final;
  if (!ANCORAS[flow.cursoReal]) return null; // curso "Outro": sem âncora no modelo

  const idxReal = r.dists.findIndex((d) => d.curso === flow.cursoReal);
  const distIndicado = r.dists.find((d) => d.curso === f.curso1).dist;
  return {
    cursoGeral: r.curso1,
    cursoIndicado: f.curso1,
    cursoReal: flow.cursoReal,
    acertou: f.curso1 === flow.cursoReal,
    acertouGeral: r.curso1 === flow.cursoReal,
    rankCursoReal: idxReal + 1,
    totalCursos: r.dists.length,
    distPerfilIndicado: distIndicado,
    distPerfilReal: r.dists[idxReal].dist,
    delta: r.dists[idxReal].dist - distIndicado,
    distEntreAncoras: distanciaEntreAncoras(f.curso1, flow.cursoReal),
  };
}

function renderFeedback() {
  const analise = analisarSugestaoVsRealidade();

  const card = document.createElement("div");
  card.className = "card feedback";
  card.innerHTML = `
    <div class="question-text">Seu feedback</div>

    <div class="field">
      <label for="fb-comparacao">O que achou da sugestão de curso do quiz comparado com o curso que você está fazendo de fato? Em quais pontos o resultado (pensando no texto todo apresentado ao final) acertou ou errou? <span class="label-opt">(opcional)</span></label>
      <textarea id="fb-comparacao" rows="5" placeholder="Escreva com suas palavras...">${escapeHtml(flow.feedback.comparacao)}</textarea>
    </div>

    <div class="field">
      <label for="fb-perguntas">O que você achou das perguntas? Elas te instigaram a pensar sobre si mesmo(a) e/ou abordaram tópicos que você acha relevante para a decisão de qual curso fazer? <span class="label-opt">(opcional)</span></label>
      <textarea id="fb-perguntas" rows="5" placeholder="Escreva com suas palavras...">${escapeHtml(flow.feedback.perguntas)}</textarea>
    </div>

    <div class="field">
      <label for="fb-comentario">Comentários livres <span class="label-opt">(opcional)</span></label>
      <textarea id="fb-comentario" rows="3" placeholder="Qualquer outra coisa que queira registrar...">${escapeHtml(flow.feedback.comentario)}</textarea>
    </div>

    <button class="btn-primary" id="feedback-enviar">Enviar respostas</button>
  `;
  app.appendChild(card);

  card.querySelector("#feedback-enviar").addEventListener("click", async () => {
    flow.feedback.comparacao = card.querySelector("#fb-comparacao").value.trim();
    flow.feedback.perguntas = card.querySelector("#fb-perguntas").value.trim();
    flow.feedback.comentario = card.querySelector("#fb-comentario").value.trim();

    const btn = card.querySelector("#feedback-enviar");
    btn.disabled = true;
    btn.textContent = "Enviando...";
    await enviarResultado(analise);
    flow.etapa = "enviado";
    render();
  });
}

// `resultado` continua sendo o modelo geral (tipo, gap e ranking das 9
// perguntas); o curso indicado depois do bloco vai em `cursoIndicado` e o
// bloco em `bloco`.
function montarPayload(analise) {
  const r = flow.resultado;
  const f = flow.final;
  return {
    versaoModelo: "v5",
    timestamp: new Date().toISOString(),
    nome: flow.nome,
    cursoReal: flow.cursoReal,
    cursoRealOutro: flow.cursoRealOutro,
    cursoIndicado: f.curso1,
    cursoIndicado2: f.curso2,
    resultado: {
      tipo: r.tipo, curso1: r.curso1, curso2: r.curso2,
      dist1: r.dist1, dist2: r.dist2, gap: r.gap,
    },
    bloco: f.bloco
      ? { cursos: f.bloco.cursos, pontos: f.bloco.pontos, empate: f.bloco.empate, virou: f.virou, respostas: flow.respostasBloco }
      : null,
    acertou: analise ? analise.acertou : null,
    acertouGeral: analise ? analise.acertouGeral : null,
    analiseSugestaoVsRealidade: analise,
    estadoFinal: {
      camada: flow.estado.camada,
      amplitude: flow.estado.amplitude,
      modo: flow.estado.modo,
    },
    respostas: flow.estado.respostas,
    distancias: r.dists,
    feedback: flow.feedback,
  };
}

async function enviarResultado(analise) {
  const payload = montarPayload(analise);
  if (!CONFIG.GAS_URL) { baixarBackupLocal(payload); return; }
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
  a.download = `quiz-v5-${(flow.nome || "resposta").replace(/\s+/g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function renderEnviado() {
  renderHeader();
  const card = document.createElement("div");
  card.className = "card enviado";
  card.innerHTML = `
    <p class="lead">Obrigado, ${escapeHtml(flow.nome.split(" ")[0])}! Sua resposta foi registrada.</p>
    ${CONFIG.GAS_URL ? "" : '<p class="lead">Como o envio automático ainda não está configurado, um arquivo com sua resposta foi baixado. Por favor, envie esse arquivo para quem está coordenando o teste.</p>'}
    <button class="btn-secondary" id="restart-btn">Responder novamente</button>
  `;
  app.appendChild(card);

  document.getElementById("restart-btn").addEventListener("click", () => {
    flow.estado = novoEstado();
    flow.nome = ""; flow.cursoReal = ""; flow.cursoRealOutro = "";
    flow.indice = 0; flow.resultado = null;
    flow.bloco = null; flow.indiceBloco = 0; flow.respostasBloco = {}; flow.final = null;
    flow.feedback = { comparacao: "", perguntas: "", comentario: "" };
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

function slug(tipo) { return TIPO_CLASS[tipo] || "ancora"; }
function escapeAttr(str) { return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }
function escapeHtml(str) { return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

render();
