# DESIGN.md — Digitando

Registro das decisões de design e de como a interface está hoje. Fonte da verdade do visual: `site/css/style.css` (tokens e componentes), `site/js/themes.js` (temas) e `site/js/gamify.js` (jogo). Se algo aqui divergir do código, o código vale — e este arquivo deve ser atualizado.

## 1. Resumo do estilo atual

- **Minimalista, leve e "humano"**: poucas cores, bordas finas, nada de ornamento.
- **Verde-claro predomina** (fundo e painéis); **branco é minoria** (só em detalhes); verde-escuro como único acento.
- **Assimétrico de propósito**: grades desiguais, blocos escalonados e recuados, cantos irregulares, bordas grossas de um lado só. Nada de grade igual e centralizada.
- **Sem ícones, imagens decorativas nem emoji.** Só tipografia e formas geométricas simples feitas em CSS.
- **Tipografia**: Share Tech na interface; IBM Plex Mono no quadro de digitação e nos números.
- **Tema trocável**: 8 temas de cor (5 claros, 3 escuros) no botão "Tema".
- **Texto grande**: base de 19px no computador (18px no celular).

## 2. Histórico das decisões (e o porquê)

Ordem em que o design evoluiu. Cada passo respondeu a um pedido do usuário; o que foi rejeitado fica registrado para não voltar por engano.

| # | Decisão | Por quê / o que foi rejeitado |
|---|---|---|
| 1 | Reforma para estilo **educacional gamificado**: XP, níveis, ofensiva (dias seguidos), conquistas, trilha de curso, botões "3D", cantos bem redondos. | Pedido inicial. |
| 2 | **51 conquistas** em 4 tiers de dificuldade (bronze, prata, ouro, diamante); WPM de 10 em 10 de 50 a 120. | Pedido: "até umas 50", dificuldade progressiva. |
| 3 | Menos **redondo e simétrico** → tema "caderno": papel, traço de caneta, cantos com raios diferentes, formas orgânicas, leve rotação. | "Tudo muito redondo e simétrico, deixe mais humano". Os *compartimentos* (caixas) foram elogiados e ficaram. |
| 4 | Digitação: palavra certa + espaço fica **travada**; após o 1º erro **tudo é errado** até corrigir; só termina com 100% correto. | Pedido. Ver seção 7. |
| 5 | **Minimalismo** + nova fonte + nova paleta (cinza frio e índigo). | Pedido. Removeu sombras, rotações, marca-texto, pauta, textura. |
| 6 | Paleta **verde-claro (maioria) e branco (minoria)**. | Pedido. |
| 7 | Troca de ícones por **imagens** (SVGs coloridos). | Foi lido como "mais emojis" → **rejeitado e removido**. |
| 8 | **Remoção total de pictogramas** (imagens e ícones de traço) e volta da **assimetria**. | "Voltou a ter simetria demais… adicionou mais emojis, tire eles". Regra permanente: sem ícone/emoji. |
| 9 | Cores **mais leves** (fundo mais pálido, acento mais suave, bordas/sombras discretas). | Pedido. |
| 10 | Fonte da interface = **Share Tech** (não a do quadro de digitação). | Pedido. Só existe o peso 400. |
| 11 | **Fonte maior**: tamanho-base da página subido para 19px. | Pedido. |
| 12 | **Vários temas de cor** no lugar do botão claro/escuro. | Pedido. |
| 13 | Quadro de digitação: **sem bloco** sobre a letra; só mudança de cor; **bloco vermelho** no erro e nos seguintes; depois, **barra `\|` fina piscando** na posição atual. | Pedidos em sequência. |
| 14 | Mais **livros base** e opção de **livro aleatório**. | Pedido (conteúdo, não visual). |
| 15 | Letras com **trema** viram a letra sem trema no texto-alvo. | Pedido. |
| 16 | Nova aba **Programar** (treino de digitação de código). | Pedido. Ver 7.9. |

## 3. Princípios

1. **Leveza**: fundos pálidos, bordas finas, muito espaço. Contraste de texto nunca é sacrificado por leveza.
2. **Assimetria intencional**: se uma lista de elementos está perfeitamente alinhada e igual, algo está errado. Não "consertar" os degraus e recuos.
3. **Sem pictogramas**: informação por texto, número, cor e forma geométrica simples. Estado nunca só por cor (há texto, borda tracejada, número etc.).
4. **Foco na digitação**: o quadro de digitação é o elemento mais legível e o único com fonte monoespaçada.
5. **Tudo pelos tokens**: nenhuma cor "solta" em componente; cores vêm de variáveis (`--accent`, `--bg`…), assim os 8 temas funcionam sem retrabalho.

## 4. Tipografia

| Uso | Fonte | Observação |
|---|---|---|
| Interface (texto, botões, títulos) | **Share Tech** (`--font`) | Só peso 400. Negrito (títulos, `<b>`, botões) é **sintetizado pelo navegador** e pode ficar um pouco grosso. Subset latin (acentos do português ok). |
| Quadro de digitação, números (WPM, XP, estatísticas, nível) | **IBM Plex Mono** (`--mono`) | Pesos 400/500. |

- Fontes **auto-hospedadas** em `site/fonts/` (`sharetech-latin.woff2`, `plexmono-400-latin.woff2`, `plexmono-500-latin.woff2`). Nada de Google Fonts em runtime.
- **Escala**: `html { font-size: 118.75% }` (19px). Quase todo tamanho é em `rem`, então tudo escala junto. No celular (`max-width: 640px`): 112.5% (18px). Corpo: `1rem / 1.6`.
- Share Tech é estreita; por isso a base é maior que os 16px padrão.
- Títulos `h2` 1.25rem; título da lição 1.55rem; valor da 1ª estatística 2.4rem; resultado grande 2.4–3.2rem.
- Quadro de digitação: `1.35rem / 2em` mono (1.1rem no celular).

## 5. Cores e temas

### 5.1 Tokens semânticos (definidos em `:root` e sobrescritos por tema)

`--bg` (fundo da página) · `--surface` (painéis) · `--white` (detalhes "brancos") · `--text` · `--muted` · `--border` · `--control` (borda de campos, ≥3:1) · `--accent` / `--accent-dark` / `--accent-soft` / `--accent-text` / `--accent-edge` · `--link` · `--cursor` · `--focus` · `--ok`/`--ok-bg` · `--bad`/`--bad-bg` · `--bad-block`/`--bad-block-text` (bloco vermelho de erro) · `--tier1..4` (bronze/prata/ouro/diamante) · `--c0..c5` (cores das seções do curso) · `--f0..f8` (cores dos dedos no teclado virtual) · `--float` (sombra de elementos flutuantes).

### 5.2 Papel de cada cor (tema padrão "Verde")

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#eaf6ec` | fundo da página (**maioria**) |
| `--surface` | `#f5fbf6` | painéis, cartões |
| `--white` | `#ffffff` | **minoria**: barra do topo, campos, botões secundários, chips, área de digitação, janelas, avisos |
| `--text` / `--muted` | `#1f3a27` / `#4d6b54` | texto / texto secundário |
| `--border` | `#cfe6d3` | linhas suaves e sombra deslocada |
| `--accent` | `#288446` | botão primário, destaques (texto branco sobre ele) |
| `--link` | `#1d6a37` | links e texto de destaque sobre verde-claro |

Contrastes foram **calculados à mão** (não medidos com ferramenta): texto sobre fundo ≥ 4.5:1; texto branco sobre `--accent` ≥ 4.5:1; bordas de campos ≥ 3:1. Revalidar com ferramenta se mudar cores.

### 5.3 Temas (`site/js/themes.js` + blocos `:root[data-theme="<id>"]` no CSS)

| Claros | Escuros |
|---|---|
| **Verde** (padrão, é o próprio `:root`) | **Floresta** |
| Azul | Noite |
| Lavanda | Grafite |
| Pêssego | Synthwave |
| Areia | Brasa |
| Tropical | Neon |
| Arco-íris | Aurora |

- **Multicoloridos** (Tropical, Arco-íris, Synthwave, Brasa, Neon, Aurora): além de fundo e acento, definem `--m1..--m4` (4 cores) e `multi: true` em `THEMES`, que põe `data-multi` no `<html>`. Com isso o logo vira listras, cada aba tem sublinhado de uma cor, os 4 cartões de estatística e os painéis alternam as bordas laterais, e a amostra no menu mostra as 4 cores. Contrastes calculados à mão.

- O JS define `data-theme="<id>"` e `data-mode="light|dark"` no `<html>`. `data-mode="dark"` carrega variáveis comuns dos escuros (vermelhos, tiers, teclado).
- Escolha salva em `localStorage` (`tema`); valores antigos `light`/`dark` migram para `verde`/`floresta`. Sem escolha, segue o tema do sistema.
- **Seletor**: botão "Tema" no topo abre um menu (grupos "Claros"/"Escuros", amostra de duas cores ao lado do nome, opção atual destacada, fica aberto ao escolher, fecha com Esc/clique fora).
- Cores de seção do curso: no Verde são tons de verde; nos demais temas, matizes variados (`--c1..c5`), com `--c0 = acento`.
- **Criar tema**: bloco CSS com todas as variáveis de cor + entrada em `THEMES`. Texto sobre `--accent` usa `--accent-text`.

## 6. Forma, layout e assimetria

### 6.1 Formas
- Raios **irregulares** (cada canto diferente): `--sh1: 3px 16px 4px 12px` (painéis/cartões), `--sh2: 14px 4px 12px 3px` (alternância), `--sh3: 3px 9px 3px 6px` (controles). Pequenos detalhes usam `2px 8px 2px 7px` etc.
- Bordas de 1px; **borda grossa de um lado só** (4–5px, cor de acento) em painéis, lição, janelas e avisos.
- Sombra **dura e deslocada** `--edge: 4px 5px 0 var(--border)` em caixas; botões `3px 3px 0`. Elementos flutuantes (janelas, avisos, menu) usam `--float` (sombra suave). Sem blur decorativo.

### 6.2 Layout assimétrico
- `main` é deslocado para a esquerda (margem esquerda `clamp(0, 7vw, 120px)`, direita automática).
- Painéis alternam: pares recuados à esquerda (`margin-left` até 3rem, borda de cima em vez de lateral), ímpares estreitados à direita.
- **Estatísticas**: colunas desiguais `1.8fr 1fr 1.3fr .9fr`, alturas escalonadas (`margin-top` 0/16/6/24px); a primeira é maior.
- **Controles de Praticar**: campo do livro largo, os outros estreitos; botão "Novo trecho" encostado à direita.
- **Programar**: mesma estrutura de Praticar (estatísticas escalonadas, controles com campo largo + botão à direita, cartão de digitação, resultado); painéis herdam o recuo alternado.
- **Aprender**: trilha começa 34px mais abaixo que a lição (colunas `270px 1fr`); seções pares da trilha recuadas; espessura da borda lateral das seções varia (3px/6px).
- **Biblioteca**: itens pares com recuo; área de envio com texto alinhado à esquerda.
- **Conquistas**: itens pares deslocados para baixo, a cada 3º recuado; estatísticas do modal `1.5fr 1fr .8fr`.
- Pequenas rotações (≤ 1°) em chips do topo; marcas de estrelas levemente tortas.

### 6.3 Espaçamento
Sem escala rígida: valores em `rem` próximos de múltiplos de 4px, **intencionalmente irregulares** entre blocos (ver degraus acima).

## 7. Componentes

### 7.1 Barra superior
- Fundo `--white`, borda inferior fina. **Logo**: barra inclinada em verde (`.logo`, evoca um cursor) + texto "Digitando" (sem imagem).
- **Abas** só com texto; ativa = **sublinhado parcial** (55% da largura, alinhado à esquerda, 3px) e leve recuo; hover = 28%.
- **HUD** (à direita): chip "Ofensiva N" (número em mono; verde quando há ofensiva) e chip de nível (quadradinho com o nível + barra de XP + "Nível N", abre as conquistas); depois o botão "Tema".

### 7.2 Botões
Cantos `--sh3`, borda `--control`, sombra dura `3px 3px 0`; ao pressionar, deslocam e perdem a sombra (`translate(3px,3px)`). Primário: fundo `--accent`, texto `--accent-text`. Altura mínima 44px. `.btn.big` em ações principais de lição.

### 7.3 Painéis e estatísticas
Ver 6.1/6.2. Rótulos pequenos em `--muted`; valores em mono.

### 7.4 Quadro de digitação (`.typing-display`)
- Fundo `--white`, borda `--control` com **barra lateral grossa** à esquerda; borda vira `--accent` quando focado.
- Texto **ainda não digitado**: `--muted` (cinza-esverdeado). **Digitado certo**: `--text`. **Sem bloco** sobre a letra atual.
- **Cursor**: barra fina `|` (2px, `--accent`) **antes do próximo caractere**, piscando (~1,1s); desenhada com `box-shadow` (não desloca o texto). Some ao terminar. `prefers-reduced-motion` desliga o piscar (barra fixa).
- **Erro**: o caractere errado **e todos os digitados depois** ganham **bloco vermelho** sólido (`--bad-block`, letra `--bad-block-text`; mais fechado nos temas escuros). Espaços errados também viram bloco visível.
- Quando sem foco: texto esmaecido com "Clique aqui ou comece a digitar".
- Estatísticas ao vivo (WPM, Precisão, Tempo) em mono, sem caixas.

### 7.5 Resultado de Praticar
Título ("Trecho perfeito!/concluído!"), selo "Novo recorde!", chip "+N XP" com barra de nível, números grandes em mono (WPM maior e escalonado), teclas mais erradas.

### 7.6 Aprender
- **Trilha**: título + barra de progresso do curso; cada seção tem uma linha lateral na cor da seção e contador "n/total"; cada lição tem um **quadradinho com o número** (cheio = feita, tracejado = bloqueada, contorno = disponível; lição atual com fundo branco e barra lateral). Estrelas da lição aparecem como marcas (`.pip`).
- **Lição**: cabeçalho com barra lateral na cor da seção, título grande; metas como itens com marcador geométrico; botão "Começar". Durante a lição: barra de etapas fina (alturas alternadas), dica do dedo, teclado virtual opcional, feedback em faixa colorida com borda lateral (verde = passou, vermelho = precisão baixa).
- **Nota por estrelas**: 3 quadradinhos levemente rotacionados e desencontrados, cheios/vazios (`aria-label` "n de 3 estrelas").

### 7.7 Teclado virtual
Teclas de cantos pequenos, cor por dedo (`--f0..f8`, pastéis; versões escuras nos temas escuros), marca nas teclas-base (F/J), tecla-alvo com contorno de acento e leve elevação.

### 7.8 Janelas, avisos e menu
- **Janela de conquistas** (`.modal.wide`): fundo `--white`, barra lateral de acento, estatísticas (nível/ofensiva/conquistas), lista **agrupada por categoria**.
- **Conquista**: sem ícone — uma **barrinha inclinada** na cor do tier (cheia = desbloqueada; tracejada = bloqueada) + nome do tier em texto + descrição.
- **Avisos (toasts)**: caixa branca com borda lateral de acento, canto superior direito, `aria-live="polite"`, somem em ~4,5s; pares levemente deslocados.
- **Menu de tema**: ver 5.3.

### 7.9 Programar (treino de código)
- 4ª aba ("Programar", entre Aprender e Biblioteca). Controles: **Linguagem** ("Todas as linguagens" + 11: JavaScript, Python, TypeScript, Java, C, C++, C#, SQL, HTML, CSS, Bash), **Tamanho** (Curto/Médio/Longo, por nº de caracteres) e "Novo trecho".
- Mesmo quadro de digitação (`.typing-display.code`: mono 1.12rem, linha mais alta, mínimo 8em; 0.92rem no celular). **Fim de linha** marcado por um "L" desenhado com bordas CSS (`[data-nl]::before`), sem glifo nem ícone.
- **Enter** quebra a linha e a **indentação é preenchida sozinha** (não conta no WPM nem na precisão). Trava de apagar vale também em quebras de linha. O erro funciona como em Praticar (bloco vermelho e cascata).
- Trechos sem tecla morta: **sem crase, til e circunflexo** (teclas mortas no ABNT2).
- Estatísticas próprias (`programar.stats`), XP pela mesma fórmula, 4 conquistas "Programar" (1, 10, 50 e 150 trechos). Resultado: "Código perfeito!/concluído!" e teclas com mais erros (`Enter` e `espaço` por extenso).

### 7.10 Biblioteca
Área de envio com borda tracejada; lista de livros em linhas separadas por filetes; cada livro mostra autor, nota (`note`, ex.: "ortografia antiga…") e posição ("já iniciado"). Botão "Praticar".

## 8. Gamificação (decisões)

- **XP**: +5 por etapa de lição; +20 +15 por estrela ao concluir a lição; em Praticar ≈ 1 por palavra correta ponderada pela precisão (mínimo 5), +25 por recorde.
- **Nível**: n→n+1 custa `100 + 40·(n−1)` XP.
- **Ofensiva**: dias seguidos com algum XP; zera se passar um dia inteiro.
- **55 conquistas** em categorias: Curso, Praticar, Programar, Velocidade (20, 30, 40, 50…120 WPM), Precisão, Combo, Ofensiva, Constância, Nível. Tiers por dificuldade. **Ids existentes não mudam** (preserva o progresso salvo).
- Apresentação sempre por **texto e forma**, nunca ícone (ver seção 2, itens 7–8).
- Dados em `localStorage` (`gamificacao`); ver `CLAUDE.md`.

## 9. Regras de interação da digitação (UX)

- Palavra **certa + espaço** fica **travada**: Backspace (ou apagar em bloco) não volta além dela. Palavra com erro + espaço **não** trava.
- Após o **1º erro, tudo é errado** até apagar e corrigir; o WPM só conta os caracteres **antes** do primeiro erro; a precisão conta só teclas realmente erradas.
- O exercício **só termina com o texto 100% correto** (no fim com erro, apague e corrija). Esc reinicia.
- Colar/cortar/arrastar bloqueados; teclas mortas (acentos) tratadas.
- Modo código (aba Programar): Enter permitido, indentação automática, trava também em quebras de linha; o modo normal (Praticar/Aprender) continua bloqueando Enter.

## 10. Responsivo e acessibilidade

- **Celular (≤ 640px)**: as 4 abas viram **barra inferior** fixa (texto, sublinhado parcial no topo), nome da marca e rótulos do HUD somem, sem rodapé, margens menores, trilha abaixo da lição, fonte-base 18px.
- ≤ 800px: Aprender em uma coluna com a lição primeiro.
- **Foco visível** (`:focus-visible`, 2px), link "Ir para o conteúdo", alvos de toque ≥ 44px, `prefers-reduced-motion` desliga animações e transições, informações de estado com texto (`sr-only`) quando visual não basta, `aria-live` nos avisos, `aria-pressed`/`aria-expanded` no seletor de tema.
- Contraste: ver 5.2 (calculado, não medido).

## 11. Como estender

- **Novo tema**: bloco `:root[data-theme="x"]` em `style.css` + entrada em `THEMES` (`themes.js`) com `bg`/`ac` da amostra e `dark`.
- **Nova conquista**: entrada em `BADGES` (`gamify.js`) com `cat` e `tier`; não reutilizar nem renomear ids.
- **Novo livro**: `.txt` UTF-8 em `site/livros/` (uma linha, sem marcas do Gutenberg) + registro em `livros/index.json` (`note` opcional).
- **Novo componente**: usar tokens (nada de cores soltas), cantos `--sh*`, e **quebrar a simetria** (recuo, largura ou altura diferentes). Não usar ícone/emoji.

## 12. Limitações conhecidas

- Share Tech só tem peso 400 → negrito sintetizado.
- Os 11 livros do Project Gutenberg estão em **ortografia anterior a 1943** (indicado na Biblioteca).
- Contrastes calculados à mão; o tema escuro e algumas telas (modal de conquistas, resultado) foram pouco inspecionados visualmente.
- Em testes com Edge headless, a primeira abertura do IndexedDB às vezes trava e a página fica sem conteúdo (não é bug do CSS); abrir no navegador normal.
