/* ============================================================
   Configuração da v4

   A planilha é a da v3 com 8 colunas a mais no final (curso_geral_*,
   bloco_*), então dá para reaproveitar a planilha da v3 ou da v2: o
   Code.gs completa o cabeçalho sozinho, e o campo `versao_modelo` já
   distingue as respostas de cada versão. Se preferir manter os dados
   separados por versão, crie uma planilha nova e siga o mesmo passo a
   passo do apps-script/.

   Enquanto GAS_URL estiver vazio, as respostas só ficam disponíveis para
   download local no navegador de quem responde.
   ============================================================ */

const CONFIG = {
  GAS_URL: "https://script.google.com/macros/s/AKfycbzdOjG7dN0lJKlsBp8zB7PwSRG8pQk_PQynILsTAIH9AUSVye1jsJIndad6FHgchyKb5Q/exec",
};
