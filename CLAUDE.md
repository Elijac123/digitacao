# Digitando

Site de treino de digitação em PT-BR: **Praticar** (trechos de livros), **Aprender** (curso em lições), **Programar** (trechos de código) e **Biblioteca** (livros base + uploads do usuário).

## Stack
HTML/CSS/JS puro com ES modules. Sem build, sem backend. Única dependência externa: JSZip 3.10.1 via cdnjs (leitura de EPUB), versão fixa em `site/js/epub.js` e carregada só quando um EPUB é enviado. Fontes são auto-hospedadas em `site/fonts/` (Share Tech para a interface (só existe o peso 400; negrito é sintetizado pelo navegador), IBM Plex Mono para o texto de digitação e números; só subset latin) — nada de Google Fonts em runtime.

## Rodar
```
cd site
python -m http.server 8000   # abrir http://localhost:8000
```
É preciso servir por HTTP (ES modules e `fetch` dos livros base não funcionam em `file://`).

## Estrutura (`site/`)
- `index.html`, `css/style.css` – shell, abas (hash `#praticar|#aprender|#programar|#biblioteca`), temas claro/escuro
- `js/app.js` – roteador
- `js/themes.js` – temas de cor (`THEMES`: verde, azul, lavanda, pêssego, areia, tropical + escuros floresta, noite, grafite, synthwave, brasa; + arco-íris, neon, aurora; os com `multi: true` e `m:[4 cores]` em `THEMES` ganham `data-multi` no `<html>` e usam `--m1..--m4` em logo, abas, cartões de estatística e painéis), `applyTheme` e o seletor "Tema" do cabeçalho. Cada tema é um bloco `:root[data-theme="<id>"]` em `css/style.css` (o padrão, verde, é o próprio `:root`); `data-mode="light|dark"` marca o modo. Tema novo = bloco CSS + entrada em `THEMES`; texto sobre `--accent` usa `--accent-text` (>= 4.5:1)
- `js/typing.js` – `Typer` (motor de digitação) e `buildTypingCard` (inclui a caixa "Palavra que você está digitando" abaixo do texto-alvo, `ui.echo`, que mostra só a palavra em andamento (esvazia ao fechá-la com espaço) e pinta de vermelho do 1º erro em diante; vale para Praticar, Aprender e Programar). Regras: WPM = (caracteres corretos/5)/min, onde "corretos" são só os anteriores ao 1º erro (tudo após o primeiro erro conta como errado até corrigir); precisão por tecla pressionada (só teclas realmente erradas); opção `multiline` (modo código: Enter quebra a linha, a trava também ocorre em `
`, e após um Enter certo a indentação da linha seguinte é preenchida sozinha — `autoChars`, não conta no WPM nem na precisão); palavra certa + espaço fica travada (Backspace não volta além de `lockIdx`; palavra com erro pode ser corrigida); o exercício só termina quando o texto está 100% correto
- `js/practice.js` – aba Praticar: sorteio/continuação de trechos, estatísticas. A opção "Livro aleatório" do seletor (valor `__aleatorio__`, salvo em `praticar.prefs`) sorteia um livro a cada trecho, sem repetir o anterior
- `js/textosIA.js` + `textos/ia.json` + `textos/ia_*.txt` – modo "Textos de IA" em Praticar (valor `__ia__` no seletor, salvo em `praticar.prefs`): 1000 textos curtos (~30 palavras, um por linha, PT-BR, só caracteres do ABNT2) escritos por IA, sem duplicatas. Cada trecho junta 1 a 3 textos sorteados conforme o tamanho (baralho embaralhado, sem repetir até acabar); ignora "Trecho: continuar". Para acrescentar textos, adicione linhas (ou um `ia_NN.txt` novo registrado em `ia.json`)
- `js/code.js` + `js/snippets.js` – aba Programar: `snippets.js` tem os trechos (formato `== linguagem` / `---`, 11 linguagens (JavaScript, Python, TypeScript, Java, C, C++, C#, SQL, HTML, CSS, Bash), ASCII digitável direto no ABNT2: **sem crase, til e circunflexo**, que são teclas mortas; linhas ≤ ~56 caracteres; indentação com espaços em múltiplos de 2) e `sizeOf` (curto ≤ 80, médio ≤ 170, longo > 170 caracteres); `code.js` sorteia o trecho (sem repetir o anterior), usa `Typer` em modo `multiline` e guarda estatísticas próprias
- `js/learn.js` + `js/lessons.js` – curso: `SECTIONS` define o currículo, `buildSteps(lesson)` gera exercícios
- `js/gamify.js` – gamificação: XP, níveis (n→n+1 custa 100+40·(n-1) XP), ofensiva diária, conquistas (`BADGES`), HUD no cabeçalho e avisos (toasts). `gainXp()` é chamado por `practice.js` e `learn.js`
- `js/icons.js` – só `starsHtml` (nota por estrelas em marcas geométricas CSS `.pip`). **Sem ícones, imagens decorativas nem emoji** na interface: usar texto e formas CSS simples
- Paleta e estilo (`css/style.css`): verde-claro predomina (`--bg`, `--surface`); branco (`--white`) só em detalhes (topo, campos, chips, área de digitação, janelas); verde-escuro como acento. Layout propositalmente assimétrico (grades desiguais, blocos escalonados/recuados, cantos irregulares `--sh1..3`, bordas grossas de um lado) — não voltar a grades iguais e centradas
- `js/keyboard.js` – teclado ABNT2 virtual, mapa de dedos, teclas mortas (acentos)
- `js/library.js` / `js/libraryView.js` / `js/epub.js` – livros base, IndexedDB, upload TXT/EPUB
- `js/palavras.js` – **gerado** (palavras frequentes + frases de Machado de Assis); não editar à mão
- `livros/index.json` + `livros/*.txt` – livros base (domínio público). Para adicionar um, coloque o `.txt` (UTF-8, uma linha, espaços simples, sem marcas do Gutenberg como `_` e `*`) e registre no JSON (`id`, `title`, `author`, `file`; `note` opcional, exibido na Biblioteca). Hoje há 20 livros; os do Project Gutenberg (19) estão em ortografia anterior a 1943, exceto *Lendas do Sul*. Os 8 mais novos (1900-1917: Lima Barreto, Eça de Queirós, Raul Brandão, Júlia Lopes de Almeida, Simões Lopes Neto) vêm do Gutenberg com cabeçalho/rodapé e listas de erros cortados.

## Design
Decisões e estado atual do visual (paleta, temas, tipografia, assimetria, componentes, regras da digitação): ver `DESIGN.md`. Atualize-o ao mudar o design.

## Persistência (navegador do usuário)
- localStorage `aprender.progresso` → `{done:{[lessonId]:{stars,wpm,acc,date}}, current}`
- localStorage `praticar.stats` → `{best,last,history[≤200],count,sumWpm,sumAcc}` (recorde, média, última)
- localStorage `programar.stats` → `{best,last,history[≤200],count,sumWpm,sumAcc}`; `programar.prefs` → `{lang,size}`
- localStorage `gamificacao` → `{xp, streak, bestStreak, last:"YYYY-MM-DD", practices, codes, perfects, chars, days, badges:{[id]:ts}}` (conquistas: 55 em `BADGES`, 4 tiers, categoria "Programar" inclusa; ids existentes não devem mudar)
- localStorage `biblioteca.listas` (`[{id,name,books:[bookId]}]`, listas personalizadas criadas na Biblioteca; `biblioteca.listaAtiva` = lista em edição; `biblioteca.lista` é o formato antigo, migrado para uma lista "Minha lista"). Em Praticar cada lista vira uma opção em negrito (valor `__lista__:<id>`) que sorteia entre seus livros. A lista automática "Livros adicionados" (`ADDED_LIST` em `library.js`, não editável, não salva) reúne todos os livros enviados pelo usuário; `getPracticeLists()` junta as duas fontes, `biblioteca.pos` (posição de "continuar de onde parei"), `praticar.prefs`, `tema` (id do tema; valores antigos "light"/"dark" são migrados), `aprender.teclado`
- IndexedDB `digitando`/`books` → livros enviados (texto completo). Mudar o schema exige subir a versão em `library.js`.

## Convenções
- Interface e textos em português do Brasil.
- Textos-alvo são normalizados em NFC e passam por `js/abnt2.js` (`toAbnt2`), que converte tudo para caracteres existentes no ABNT2 (travessões→`-`, aspas curvas→`"`/`'`, `…`→`...`, etc.; letras com trema viram a letra sem trema: `ü`→`u`, `Ü`→`U`, `ä`→`a`…). Sempre ativo, sem opção de desligar.
- Acesso a localStorage só via `storage.js` (try/catch).

## Legado
`digitador.py` é o protótipo CLI original (referência da fórmula de WPM). `palavras.txt` e `memorias_posthumas_bras_cubas.txt` na raiz são as fontes usadas para gerar `palavras.js` e o livro base.
