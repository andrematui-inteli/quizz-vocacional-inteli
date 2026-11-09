# v5 — mesma v4, tela final redesenhada

Quinta versão, derivada da v4. O **modelo** (perguntas, eixos, âncoras, pesos, bloco final, limiares) é **idêntico ao da v4** — ver [`../v4/README.md`](../v4/README.md) para todo o histórico de como ele chegou a esse formato. A v5 só muda a **tela de resultado + feedback**, ao final do quiz.

## O que mudou na tela final

| Mudança | Como |
| --- | --- |
| **Duas fontes, papéis fixos** | `Platypi` (serif) só para o título, a frase de interpretação do perfil e o nome do curso indicado — os três momentos de destaque. `Inter` (sans-serif) para todo o resto: texto corrido, rótulos, botões, formulário. Antes só havia uma fonte para tudo. |
| **"Seu feedback" sem o quadro de métricas** | O bloco "Sugestão × realidade" (posição no ranking, distâncias, badge "bateu"/"não bateu") saiu da tela. Ficam só as perguntas abertas sobre o que o aluno achou. Os números continuam sendo calculados e enviados no payload (`analiseSugestaoVsRealidade`), só não aparecem mais na tela. |
| **As 3 perguntas de feedback são opcionais** | Antes, as duas primeiras bloqueavam o envio se ficassem vazias. Agora nenhuma bloqueia — todas têm "(opcional)" no rótulo e o botão "Enviar respostas" sempre funciona. |
| **Seção "Suas respostas" removida** | A lista com todas as 9 perguntas gerais (e as 3 do bloco) e a resposta dada em cada uma não aparece mais no resultado. As respostas continuam sendo gravadas no payload, só não são mais exibidas de volta pro aluno. |
| **Dropdown de competências no gráfico do curso indicado** | Abaixo do gráfico de afinidade com os 5 cursos, um `<details>` ("Ver o que te aproximou ou afastou de [curso]") mostra as 3 competências do modelo (camada tecnológica, abrangência, forma de agir), cada uma com uma nota de 0 a 5 e uma etiqueta "Aproximou"/"Afastou": o quanto aquele eixo específico da resposta do aluno pesou a favor ou contra o curso indicado. Ver `competenciasCurso()` em [`questions.js`](questions.js). |
| **Texto do curso indicado reforça reflexão + especialista de carreiras** | Toda devolutiva (`buildDevolutiva` em [`questions.js`](questions.js)) termina com uma frase fixa (`REFLEXAO_FINAL`) pedindo para o aluno refletir sobre o resultado mesmo que ele confirme ou contrarie o que já pensava, e sugerindo levar essa reflexão para uma conversa com um especialista de carreiras do Inteli. |

Nada na lógica de pontuação, classificação, bloco final ou payload enviado para a planilha mudou — só a camada de apresentação do resultado.

## Competência por eixo: como a nota é calculada

Para o curso indicado (`f.curso1`, já depois do bloco final), cada um dos 3 eixos (`camada`, `amplitude`, `modo`) recebe uma nota de 0 a 5:

```
nota = 5 × (1 − |posição_do_aluno_no_eixo − âncora_do_curso_no_eixo| / maior_distância_possível_nesse_eixo)
```

Nota ≥ 2,5 (metade da escala) = esse eixo te aproximou do curso indicado; abaixo disso, te afastou. É o mesmo critério de "quanto mais perto, mais nota" usado no gráfico geral de afinidade, só que por eixo em vez de somado entre os três.

## Rodar localmente

Servidor estático na raiz do repositório e abrir `/v5/`. Sem dependências.

## Antes de enviar para respondentes

Como o schema de dados é idêntico ao da v4, [`config.js`](config.js) já aponta, por padrão, para a **mesma planilha/implantação da v4** — o campo `versao_modelo` ("v5") já separa essas respostas das da v4 na mesma aba. Não é preciso colar nem reimplantar nada em [`apps-script/Code.gs`](apps-script/Code.gs) para começar a coletar respostas da v5.

Se preferir manter os dados separados por versão, crie uma planilha nova, cole [`apps-script/Code.gs`](apps-script/Code.gs) no Apps Script dela, rode `configurar` e `testarEnvio` (cria a aba e grava uma linha "TESTE (apagar)") e publique como App da Web. Depois cole essa URL em [`config.js`](config.js). Passo a passo completo em [`../teste-piloto/apps-script/README.md`](../teste-piloto/apps-script/README.md).

Sem `GAS_URL` configurado, o quiz não trava: baixa um `.json` com a resposta no navegador de quem responde.

## O que ainda não foi validado

Mesmo aviso da v4: **nenhum número do modelo foi validado contra alunos** — o que mudou aqui foi só a tela final, não a calibração. Ver [`../v4/README.md`](../v4/README.md#o-que-ainda-não-foi-validado) e as pendências conhecidas lá, que continuam valendo.
