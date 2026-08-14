# Piloto de teste — coleta de dados para fine-tuning

Versão de teste do quiz, isolada da versão `main` (que serve de base "limpa" para outras variações). Usada para pedir a alunos de graduação do Inteli que respondam o quiz e comparar o curso indicado com o curso que eles realmente fazem, além de coletar um feedback estruturado sobre precisão e relevância das perguntas.

## O que muda em relação à versão principal

- Antes das perguntas, pede **nome** e **curso que a pessoa já faz** no Inteli.
- Depois do resultado, pede um **feedback estruturado**: o curso indicado faz sentido? as perguntas foram relevantes? (escalas de 1 a 5) + comentário livre opcional.
- Ao final, envia tudo para uma planilha do Google via Apps Script — ver [`apps-script/README.md`](apps-script/README.md) para configurar.
- Se o envio automático não estiver configurado, baixa um `.json` com a resposta como fallback.

## Rodar localmente

Mesma coisa da versão principal: `python -m http.server` na raiz do repo e abrir `/teste-piloto/`.

## Publicar

Como está publicado via GitHub Pages a partir da branch `main`, essa pasta já fica acessível em `https://<usuario>.github.io/<repo>/teste-piloto/` assim que for commitada e enviada para `main` — sem precisar mudar nenhuma configuração do Pages.

## Dados coletados (por resposta)

- Nome, curso real informado
- Curso(s) indicado(s) pelo quiz, tipo de classificação, gap
- Se o curso indicado bateu com o curso real (`acertou`)
- Todas as respostas brutas por pergunta (`respostas_raw_json`) — é o que permite reprocessar os pesos depois
- Estado final nos 3 eixos (foco, camada, estilo)
- Distâncias calculadas para os 5 cursos
- Feedback de precisão/relevância (1–5) e comentário livre
