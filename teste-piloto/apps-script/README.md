# Setup do backend (Google Apps Script)

Passo a passo para o resultado do quiz cair automaticamente numa planilha do Google. Leva uns 5 minutos e só precisa ser feito uma vez.

1. Crie uma planilha nova no Google Sheets (pode chamar de "Respostas Quiz Vocacional").
2. No menu, vá em **Extensões → Apps Script**.
3. Apague o conteúdo padrão de `Code.gs` e cole o conteúdo do arquivo [`Code.gs`](Code.gs) deste repositório.
4. Salve o projeto (ícone de disquete).
5. Clique em **Implantar → Nova implantação**.
6. Em "Selecionar tipo", escolha **App da Web**.
7. Configure:
   - **Executar como:** Eu (sua conta)
   - **Quem pode acessar:** Qualquer pessoa
8. Clique em **Implantar**. O Google vai pedir para autorizar o script — autorize com sua conta.
9. Copie a **URL do app da Web** que aparece (algo como `https://script.google.com/macros/s/AKfycb.../exec`).
10. Cole essa URL no arquivo [`../config.js`](../config.js) do repositório, no campo `GAS_URL`.
11. Commit e push. A partir daí, cada resposta enviada no quiz vira uma linha na aba "Respostas" da planilha.

## Se precisar atualizar o script depois

Sempre que editar `Code.gs`, volte em **Implantar → Gerenciar implantações**, edite a implantação existente e clique em **Implantar** de novo (não crie uma implantação nova, senão a URL muda e você precisa atualizar o `config.js` de novo).

## Testando sem a planilha configurada

Se `GAS_URL` estiver vazio em `config.js`, o quiz não trava: ao final, ele baixa um arquivo `.json` com a resposta no navegador de quem respondeu, para envio manual (ex. WhatsApp/email). Serve como fallback e para testar o fluxo localmente antes de configurar a planilha.
