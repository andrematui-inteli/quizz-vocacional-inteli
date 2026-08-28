/* ============================================================
   Quiz Vocacional Inteli — v2
   Recebe as respostas e grava numa planilha.

   Use uma planilha NOVA: as colunas mudaram em relação ao teste-piloto.
   Instruções de deploy iguais às da v1 — ver ../../teste-piloto/apps-script/README.md
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
];

function doPost(e) {
  const sheet = getSheet();
  const data = JSON.parse(e.postData.contents);

  const res = data.resultado || {};
  const an = data.analiseSugestaoVsRealidade || {};
  const fb = data.feedback || {};
  const est = data.estadoFinal || {};

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.versaoModelo || "v2",
    data.nome || "",
    data.cursoReal || "",
    data.cursoRealOutro || "",
    res.curso1 || "",
    res.curso2 || "",
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
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Preserva o zero (que é um valor legítimo de distância) e vira "" só em null/undefined.
function valorOuVazio(v) {
  return v === null || v === undefined ? "" : v;
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(CABECALHO);
  }
  return sheet;
}
