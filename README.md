# Quiz Vocacional Inteli

Quiz vocacional para captação de topo de funil (feiras de profissão e site institucional). Em vez da lógica convencional de pontuação por curso, o quiz mede o respondente em três dimensões comportamentais independentes dos cursos — Foco de Impacto, Estilo de Pensamento e Camada Técnica — e só então cruza o perfil consolidado com o curso do Inteli mais compatível.

Contexto completo da arquitetura pedagógica e do modelo de pontuação em [`DocumentosRef/Inteli_Quiz_Contexto_Completo.md`](DocumentosRef/Inteli_Quiz_Contexto_Completo.md).

## Estrutura

- `index.html` — shell da página
- `style.css` — identidade visual institucional (deep purple / coral / paper)
- `questions.js` — banco de perguntas, âncoras dos 5 cursos e modelo de pontuação
- `app.js` — motor de fluxo (núcleo → adaptativa condicional → resultado) e renderização

## Rodar localmente

Basta abrir `index.html` num servidor estático local (ex. `python -m http.server`), já que o app não tem dependências.

## Publicação

Publicado via GitHub Pages a partir da branch `main`.
