/* ============================================================
   Configuração da v3

   As colunas da planilha são as mesmas da v2 (mesmos nomes de campo e
   mesmos ids de pergunta C1..M3), então dá para reaproveitar a planilha
   da v2 sem problema — o campo `versao_modelo` já distingue as respostas
   de cada versão na mesma planilha. Se preferir manter os dados
   separados por versão, crie uma planilha nova e siga o mesmo passo a
   passo do apps-script/.

   Enquanto GAS_URL estiver vazio, as respostas só ficam disponíveis para
   download local no navegador de quem responde.
   ============================================================ */

const CONFIG = {
  GAS_URL: "",
};
