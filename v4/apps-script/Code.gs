/* ============================================================
   Quiz Vocacional Inteli — v4
   Recebe as respostas e grava numa planilha.

   PASSO A PASSO (planilha nova, ~5 minutos, uma vez só)
   1. Crie uma planilha no Google Sheets. Menu Extensões → Apps Script.
   2. Apague o conteúdo de Code.gs e cole este arquivo inteiro. Salve.
   3. Na barra de cima, escolha a função `configurar` e clique em Executar.
      O Google pede autorização (sua conta). Isso cria a aba "Respostas" com
      o cabeçalho.
   4. Escolha `testarEnvio` e clique em Executar. Deve aparecer uma linha com
      o nome "TESTE (apagar)" na aba. Confira e apague a linha.
   5. Implantar → Nova implantação → tipo "App da Web".
      Executar como: Eu. Quem pode acessar: Qualquer pessoa. Implantar.
   6. Copie a URL do app da Web e abra no navegador: deve responder
      {"ok":true,...}. Cole a mesma URL em v4/config.js (GAS_URL).

   Depois de editar este arquivo: Implantar → Gerenciar implantações → editar
   a existente → Versão: Nova versão → Implantar. Não crie uma implantação
   nova, senão a URL muda.

   Colunas: as 23 da v3 (na mesma ordem) + 8 novas no final, sobre o bloco
   final de perguntas específicas. Como as novas ficam no fim, dá para
   reaproveitar a planilha da v3 ou da v2: getSheet() acrescenta os nomes
   que faltam no cabeçalho sem mexer nos que já existem. O campo
   versao_modelo distingue as linhas de cada versão.

   Mudança de significado em relação à v3:
   - curso_indicado / curso_indicado_2: agora são o curso FINAL (depois do
     bloco) e o outro curso do par.
   - tipo_classificacao, gap, distancias_json, camada/amplitude/modo: continuam
     sendo do modelo geral (as perguntas gerais).
   - acertou: o curso final bateu com o curso real. acertou_geral: o 1º
     colocado do modelo geral sozinho teria batido.
   ============================================================ */

const SHEET_NAME = "Respostas";

const CABECALHO = [
  "timestamp",
  "versao_modelo",
  "nome",
  "curso_real",
  "curso_real_outro",
  "curso_indicado",
  "curso_indicado_2",
  "tipo_classificacao",
  "gap",
  "acertou",
  "rank_curso_real",
  "dist_perfil_curso_indicado",
  "dist_perfil_curso_real",
  "delta_erro_modelo",
  "dist_entre_ancoras",
  "fb_comparacao",
  "fb_perguntas",
  "fb_comentario",
  "camada",
  "amplitude",
  "modo",
  "respostas_raw_json",
  "distancias_json",
  // novas na v4
  "curso_geral_1",
  "curso_geral_2",
  "acertou_geral",
  "bloco_cursos",
  "bloco_pontos",
  "bloco_empate",
  "bloco_virou",
  "bloco_respostas_json",
];

/* ------------------------------------------------------------
   Rodar à mão no editor (passos 3 e 4 acima)
   ------------------------------------------------------------ */

// Cria a aba com o cabeçalho e dispara o pedido de autorização, antes de
// qualquer aluno responder.
function configurar() {
  getSheet();
  Logger.log('Aba "%s" pronta com %s colunas. Próximo passo: testarEnvio e depois Implantar.', SHEET_NAME, CABECALHO.length);
}

// Grava uma resposta de mentira, para conferir se as colunas batem.
// Apague a linha "TESTE (apagar)" depois.
function testarEnvio() {
  gravar({
    versaoModelo: "v4",
    timestamp: new Date().toISOString(),
    nome: "TESTE (apagar)",
    cursoReal: "EC",
    cursoRealOutro: "",
    cursoIndicado: "EC",
    cursoIndicado2: "CC",
    resultado: { tipo: "âncora-adjacente", curso1: "EC", curso2: "CC", dist1: 0.57, dist2: 1.11, gap: 0.55 },
    bloco: { cursos: ["EC", "CC"], pontos: 2, empate: false, virou: false, respostas: { B10: -2, B11: 2, B12: 2 } },
    acertou: true,
    acertouGeral: true,
    analiseSugestaoVsRealidade: { rankCursoReal: 1, distPerfilIndicado: 0.57, distPerfilReal: 0.57, delta: 0, distEntreAncoras: 0 },
    estadoFinal: { camada: 2.5, amplitude: 1.22, modo: 1.22 },
    respostas: { C1: 2, A5: 2, M6: 1, C5: 2, M2: 3, A3: 2, C4: 2, A6: 2, M5: 2 },
    distancias: [{ curso: "EC", dist: 0.57 }, { curso: "CC", dist: 1.11 }],
    feedback: { comparacao: "teste", perguntas: "teste", comentario: "" },
  });
  Logger.log("Linha de teste gravada na aba %s. Confira e apague.", SHEET_NAME);
}

/* ------------------------------------------------------------
   Endpoint
   ------------------------------------------------------------ */

// Abrir a URL do app no navegador cai aqui: serve para conferir a implantação.
function doGet() {
  return json({ ok: true, versao: "v4", colunas: CABECALHO.length });
}

function doPost(e) {
  try {
    gravar(JSON.parse(e.postData.contents));
    return json({ ok: true });
  } catch (err) {
    // O quiz envia em modo no-cors e não lê a resposta; o erro só aparece
    // em Execuções, no painel do Apps Script.
    console.error(err);
    return json({ ok: false, erro: String(err) });
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Trava para dois alunos enviando ao mesmo tempo (feira, sala cheia) não
// disputarem a criação da aba nem a última linha.
function gravar(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    getSheet().appendRow(montarLinha(data).map(seguro));
  } finally {
    lock.releaseLock();
  }
}

function montarLinha(data) {
  const res = data.resultado || {};
  const an = data.analiseSugestaoVsRealidade || {};
  const fb = data.feedback || {};
  const est = data.estadoFinal || {};
  const bl = data.bloco || null;

  return [
    data.timestamp || new Date().toISOString(),
    data.versaoModelo || "v4",
    data.nome || "",
    data.cursoReal || "",
    data.cursoRealOutro || "",
    data.cursoIndicado || res.curso1 || "",
    data.cursoIndicado2 || res.curso2 || "",
    res.tipo || "",
    valorOuVazio(res.gap),
    data.acertou === null || data.acertou === undefined ? "" : !!data.acertou,
    valorOuVazio(an.rankCursoReal),
    valorOuVazio(an.distPerfilIndicado),
    valorOuVazio(an.distPerfilReal),
    valorOuVazio(an.delta),
    valorOuVazio(an.distEntreAncoras),
    fb.comparacao || "",
    fb.perguntas || "",
    fb.comentario || "",
    valorOuVazio(est.camada),
    valorOuVazio(est.amplitude),
    valorOuVazio(est.modo),
    JSON.stringify(data.respostas || {}),
    JSON.stringify(data.distancias || []),
    res.curso1 || "",
    res.curso2 || "",
    data.acertouGeral === null || data.acertouGeral === undefined ? "" : !!data.acertouGeral,
    bl ? (bl.cursos || []).join(" x ") : "",
    bl ? valorOuVazio(bl.pontos) : "",
    bl ? !!bl.empate : "",
    bl ? !!bl.virou : "",
    bl ? JSON.stringify(bl.respostas || {}) : "",
  ];
}

// Preserva o zero (que é um valor legítimo de distância) e vira "" só em null/undefined.
function valorOuVazio(v) {
  return v === null || v === undefined ? "" : v;
}

// O app é público ("Qualquer pessoa"), então qualquer um pode mandar texto.
// Uma célula que começa com = + - @ vira fórmula no Sheets (ex. =IMPORTXML
// ou =HYPERLINK mandando dados para fora). O apóstrofo força texto puro.
function seguro(v) {
  return typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v;
}

/* ------------------------------------------------------------
   Planilha
   ------------------------------------------------------------ */

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    // Planilha recém-criada tem uma aba vazia ("Página1"): reaproveita em vez
    // de deixar uma aba sobrando ao lado de "Respostas".
    const abas = ss.getSheets();
    if (abas.length === 1 && abas[0].getLastRow() === 0) {
      sheet = abas[0].setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    sheet.appendRow(CABECALHO);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, CABECALHO.length).setFontWeight("bold");
    return sheet;
  }

  // Planilha reaproveitada de versão anterior: completa só o que falta no fim
  // do cabeçalho, sem reescrever os nomes que já existem.
  const colunas = sheet.getLastColumn();
  if (colunas < CABECALHO.length) {
    const faltam = CABECALHO.slice(colunas);
    sheet.getRange(1, colunas + 1, 1, faltam.length)
      .setValues([faltam])
      .setFontWeight("bold");
  }
  return sheet;
}
