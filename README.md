# Digitando

Site de treino de digitação em português do Brasil, feito para o **teclado ABNT2**. Roda 100% no navegador: HTML, CSS e JavaScript puros, **sem build e sem backend**. Seu progresso e seus livros ficam salvos só no seu navegador.

## O que tem

- **Praticar** — digite trechos de livros de domínio público (ou de livros que você enviar). Escolha o livro (ou "Livro aleatório", "Textos de IA" — 1000 textos curtos escritos por IA — ou uma das suas listas, em negrito), o tamanho do trecho e se quer um trecho aleatório ou continuar de onde parou. Mostra WPM, precisão, tempo, teclas com mais erros, recorde e médias.
- **Aprender** — curso em lições (33 no total): fileira base, superior e inferior, maiúsculas, números e pontuação, acentos do português e fluência. Cada lição tem etapas, metas de precisão e velocidade, nota de até 3 estrelas e um teclado virtual ABNT2 com a indicação do dedo certo.
- **Programar** — treino de velocidade digitando código, com 93 trechos em 11 linguagens (JavaScript, Python, TypeScript, Java, C, C++, C#, SQL, HTML, CSS e Bash). O Enter quebra a linha e a indentação é preenchida sozinha.
- **Biblioteca** — 20 livros base, listas personalizadas com nome (marque livros e, em Praticar, sorteie só entre eles; a lista "Livros adicionados" reúne o que você enviou) e upload de `.txt` e `.epub` (ficam guardados no seu navegador, nada é enviado a servidor algum).
- **Jogo** — XP, níveis, ofensiva (dias seguidos treinando) e 55 conquistas em 4 níveis de dificuldade.
- **12 temas de cor** — 7 claros (Verde, Azul, Lavanda, Pêssego, Areia, Tropical, Arco-íris) e 7 escuros (Floresta, Noite, Grafite, Synthwave, Brasa, Neon, Aurora), pelo botão "Tema".

### Regras da digitação

- WPM = (caracteres corretos ÷ 5) ÷ minutos. Só contam os caracteres **antes do primeiro erro**.
- Palavra **certa + espaço** fica travada: o Backspace não volta além dela. Uma palavra com erro pode ser corrigida.
- Depois do primeiro erro, **todo o resto fica errado** (bloco vermelho) até você apagar e corrigir.
- O exercício só termina com o texto 100% correto. `Esc` reinicia; `Enter` avança nos resultados.
- O texto-alvo é convertido para caracteres que existem no ABNT2 (travessões, aspas curvas e reticências viram o equivalente simples; letras com trema perdem o trema).

## Como rodar

É preciso servir os arquivos por HTTP (módulos ES e o `fetch` dos livros não funcionam abrindo o `index.html` direto do disco):

```bash
cd site
python -m http.server 8000
```

Depois abra <http://localhost:8000>. Qualquer servidor estático serve (`npx serve site`, extensão Live Server etc.).

## Estrutura

```
site/
├─ index.html          # estrutura, abas (#praticar, #aprender, #programar, #biblioteca)
├─ css/style.css       # tokens de cor, temas e componentes
├─ fonts/              # Share Tech e IBM Plex Mono (auto-hospedadas)
├─ livros/             # livros base (.txt em UTF-8) + index.json
└─ js/
   ├─ app.js           # roteador
   ├─ typing.js        # motor de digitação (Typer)
   ├─ practice.js      # aba Praticar
   ├─ learn.js         # aba Aprender
   ├─ lessons.js       # currículo do curso
   ├─ code.js          # aba Programar
   ├─ snippets.js      # trechos de código
   ├─ libraryView.js   # aba Biblioteca
   ├─ library.js       # livros base, IndexedDB e upload
   ├─ epub.js          # leitor de EPUB
   ├─ gamify.js        # XP, níveis, ofensiva e conquistas
   ├─ themes.js        # temas de cor e seletor
   ├─ keyboard.js      # teclado ABNT2 virtual e mapa de dedos
   ├─ abnt2.js         # conversão do texto para caracteres do ABNT2
   ├─ storage.js       # acesso seguro ao localStorage
   ├─ icons.js         # notas por estrelas
   └─ palavras.js      # palavras frequentes e frases (gerado; não editar à mão)
```

Arquivos na raiz: `palavras.txt` e `memorias_posthumas_bras_cubas.txt` são as fontes usadas para gerar `palavras.js` e o primeiro livro base; `digitador.py` é o protótipo de linha de comando original (referência da fórmula de WPM).

## Dados salvos no navegador

Nada sai do seu computador. O site usa `localStorage` (progresso do curso, estatísticas, preferências, tema, conquistas) e `IndexedDB` (livros enviados). Limpar os dados do site apaga tudo isso.

## Contribuindo

- **Novo livro base:** coloque o `.txt` (UTF-8, em uma única linha, sem marcações) em `site/livros/` e registre no `site/livros/index.json` (`id`, `title`, `author`, `file` e, opcionalmente, `note`). Só use obras de domínio público.
- **Nova linguagem ou trecho de código:** edite `site/js/snippets.js` (formato `== linguagem` e `---` entre trechos). Use só caracteres digitáveis direto no ABNT2: **sem crase, til e circunflexo**, que são teclas mortas.
- **Novo tema:** adicione um bloco `:root[data-theme="..."]` em `site/css/style.css` e uma entrada em `THEMES` (`site/js/themes.js`).
- **Design:** as decisões e o estado atual do visual estão em [`DESIGN.md`](DESIGN.md). Resumo: minimalista, verde-claro dominante, layout assimétrico de propósito, **sem ícones nem emoji**.
- Notas técnicas para quem desenvolve (incluindo o uso do Claude Code) ficam em [`CLAUDE.md`](CLAUDE.md).

## Publicar no GitHub Pages

O site é estático, então basta publicar a pasta `site/`. Em **Settings → Pages**, escolha **Source: GitHub Actions** e adicione o arquivo `.github/workflows/pages.yml`:

<details>
<summary>Ver o workflow</summary>

```yaml
name: Publicar site
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site
      - id: deploy
        uses: actions/deploy-pages@v4
```

</details>

## Créditos e licenças de terceiros

- **Livros:** os 11 livros adicionados vêm do [Project Gutenberg](https://www.gutenberg.org/) e são de domínio público (Machado de Assis, Aluísio Azevedo, José de Alencar e Bernardo Guimarães). Ficaram na ortografia original, anterior à reforma de 1943, e foram limpos de cabeçalhos de licença e marcações de formatação. *Memórias Póstumas de Brás Cubas* está em ortografia atual.
- **Fontes:** [Share Tech](https://fonts.google.com/specimen/Share+Tech) e [IBM Plex Mono](https://github.com/IBM/plex), ambas sob a SIL Open Font License 1.1, auto-hospedadas em `site/fonts/`.
- **JSZip** (3.10.1, MIT): carregado do cdnjs apenas quando você envia um `.epub`.
- **Trechos de código** da aba Programar: escritos para este projeto.

## Licença

Licença do código ainda não definida. Antes de publicar, adicione um arquivo `LICENSE` (por exemplo, MIT).
