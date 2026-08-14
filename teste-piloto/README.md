# Piloto de teste — coleta de dados para fine-tuning

Versão de teste do quiz, isolada da versão `main` (que serve de base "limpa" para outras variações). Usada para pedir a alunos de graduação do Inteli que respondam o quiz e comparar o curso indicado com o curso que eles realmente fazem, além de coletar um feedback estruturado sobre precisão e relevância das perguntas.

## O que muda em relação à versão principal

- Antes das perguntas, pede **nome** e **curso que a pessoa já faz** no Inteli.
- O feedback fica **na mesma página do resultado, logo abaixo dele**, para que o respondente possa reler o texto do resultado enquanto escreve.
- O primeiro elemento do feedback é o bloco **sugestão × realidade**, com a distância vetorial entre o curso indicado e o curso real (ver abaixo).
- Em seguida, três perguntas abertas: comparação sugestão × realidade (obrigatória), avaliação das perguntas (obrigatória), comentários livres (opcional).
- Ao final, envia tudo para uma planilha do Google via Apps Script — ver [`apps-script/README.md`](apps-script/README.md) para configurar.
- Se o envio automático não estiver configurado, baixa um `.json` com a resposta como fallback.

## As métricas de distância

O modelo já posiciona o respondente num espaço de 3 dimensões e mede a distância dele até a âncora de cada um dos 5 cursos. Como o curso real da pessoa também tem âncora nesse espaço, a "distância entre sugestão e realidade" sai de graça — não é uma nota subjetiva de 1 a 5, é a mesma métrica ponderada usada para escolher o curso indicado:

| Métrica | O que diz |
| --- | --- |
| `rank_curso_real` | Em que posição (1º a 5º) o curso real da pessoa ficou no ranking dela. É o sinal de acurácia mais direto. |
| `dist_perfil_curso_indicado` | Distância do perfil até o curso que o quiz indicou (o mínimo). |
| `dist_perfil_curso_real` | Distância do perfil até o curso que a pessoa realmente faz. |
| `delta_erro_modelo` | `dist_perfil_curso_real − dist_perfil_curso_indicado`. Zero quando acerta; quanto maior, mais o modelo errou em termos contínuos. |
| `dist_entre_ancoras` | Distância entre as âncoras dos dois cursos, com a mesma ponderação. Distingue **erro vizinho** (ex. ES vs EC ≈ 1.2) de **erro grosseiro** (ex. ADM Tech vs CC ≈ 6.9). |

Na prática, `delta_erro_modelo` alto com `dist_entre_ancoras` baixo sugere **peso mal calibrado** entre cursos próximos; os dois altos sugerem que alguma pergunta está medindo o **eixo errado**.

Se a pessoa escolher "Outro" no curso, não há âncora no modelo e essas métricas ficam vazias — as respostas abertas continuam sendo gravadas.

## Rodar localmente

Mesma coisa da versão principal: `python -m http.server` na raiz do repo e abrir `/teste-piloto/`.

## Publicar

Como está publicado via GitHub Pages a partir da branch `main`, essa pasta já fica acessível em `https://<usuario>.github.io/<repo>/teste-piloto/` assim que for commitada e enviada para `main` — sem precisar mudar nenhuma configuração do Pages.

## Dados coletados (por resposta)

- Nome, curso real informado
- Curso(s) indicado(s) pelo quiz, tipo de classificação, gap
- Se o curso indicado bateu com o curso real (`acertou`)
- As 5 métricas de distância descritas acima
- Todas as respostas brutas por pergunta (`respostas_raw_json`) — é o que permite reprocessar os pesos depois
- Estado final nos 3 eixos (foco, camada, estilo)
- Distâncias calculadas para os 5 cursos
- As três respostas abertas do feedback
