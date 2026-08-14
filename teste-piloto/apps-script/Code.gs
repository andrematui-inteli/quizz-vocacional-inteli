/* ============================================================
   Quiz Vocacional Inteli — piloto de teste
   Recebe as respostas do quiz (via fetch POST) e grava numa planilha.
   Ver README.md nesta mesma pasta para instruções de deploy.
   ============================================================ */

const SHEET_NAME = "Respostas";

const CABECALHO = [
  "timestamp",
  "nome",
  "curso_real",
  "curso_real_outro",
  "curso_previsto_1",
  "curso_previsto_2",
  "tipo_classificacao",
  "gap",
  "acertou",
  "feedback_precisao",
  "feedback_relevancia",
  "feedback_comentario",
  "foco",
  "camada",
  "estilo_integrador",
  "estilo_construtor",
  "respostas_raw_json",
  "distancias_json",
];

function doPost(e) {
  const sheet = getSheet();
  const data = JSON.parse(e.postData.contents);

  const linha = [
    data.timestamp || new Date().toISOString(),
    data.nome || "",
    data.cursoReal || "",
    data.cursoRealOutro || "",
    (data.resultado && data.resultado.curso1) || "",
    (data.resultado && data.resultado.curso2) || "",
    (data.resultado && data.resultado.tipo) || "",
    (data.resultado && data.resultado.gap) ?? "",
    !!data.acertou,
    (data.feedback && data.feedback.precisao) ?? "",
    (data.feedback && data.feedback.relevancia) ?? "",
    (data.feedback && data.feedback.comentario) || "",
    (data.estadoFinal && data.estadoFinal.foco) ?? "",
    (data.estadoFinal && data.estadoFinal.camada) ?? "",
    (data.estadoFinal && data.estadoFinal.estiloIntegrador) ?? "",
    (data.estadoFinal && data.estadoFinal.estiloConstrutor) ?? "",
    JSON.stringify(data.respostas || {}),
    JSON.stringify(data.distancias || []),
  ];

  sheet.appendRow(linha);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
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
