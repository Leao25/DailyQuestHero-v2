# DailyQuestHero v2 — Especificação de Assets

---

## Canvas de referência
- **Resolução interna:** 1152×648px
- **Linha do chão (groundY):** y = 600px (48px de chão visível na base)

---

## Sistema de BG em Camadas (Parallax)

O BG é composto por **8 camadas** com fundo transparente (PNG).  
Camadas de faixa larga usam **2304×Hpx** (2× largura do canvas) para loop contínuo.  
Astros e estrelas são PNGs isolados posicionados por código.

---

### Camada 1 — Céu (gradiente por código)
- **Formato:** gerado em código (canvas gradient) — sem PNG
- **Parallax:** 0%
- **Dimensão coberta:** 1152×600px (até groundY)
- **Variação por período:** manhã (azul→laranja), tarde (azul médio), noite (quase preto)

---

### Camada 2 — Estrelas (por código)
- **Formato:** gerado em código — sem PNG
- **Parallax:** 0%
- **Visibilidade:** noite e manhã apenas

---

### Camada 3 — Astros (PNGs isolados)
- **Parallax:** 2%
- **Assets:**
  | Asset | Dimensões | Posição (y) | Períodos |
  |---|---|---|---|
  | `lua.png` | 120×120px | y=118 | noite |
  | `sol.png` | 140×140px | y=60 | tarde |
  | `sol_nascente.png` | 100×100px | y=139 | manhã |
- **Transparência:** fundo 100% transparente (remover fundo branco com remove.bg)

---

### Camada 4 — Nuvens (`fase1_clouds`)
- **Dimensões:** 2304×349px
- **Posição no canvas:** y=0 (ocupa todo o céu, transparente onde não há nuvem)
- **Parallax:** 5%
- **Transparência:** fundo 100% transparente — o gradiente do céu aparece por baixo
- **Variação por período:** nuvens escuras (noite), claras/rosadas (manhã), brancas (tarde)

---

### Camada 5 — Montanhas (`fase1_mountains`)
- **Dimensões:** 2304×250px
- **Posição no canvas:** y=350 até y=600
- **Parallax:** 8%
- **Conteúdo:** silhuetas de montanhas/colinas, sem detalhes finos
- **Transparência:** fundo 100% transparente acima das montanhas

---

### Camada 6 — Fundo médio (`fase1_mid`)
- **Dimensões:** 2304×220px
- **Posição no canvas:** y=380 até y=600
- **Parallax:** 25%
- **Conteúdo:** casas, ruínas, árvores grandes ao fundo, tochas acesas (noite)
- **Transparência:** fundo 100% transparente acima dos elementos

---

### Camada 7 — Vegetação próxima (`fase1_near`)
- **Dimensões:** 2304×140px
- **Posição no canvas:** y=460 até y=600
- **Parallax:** 55%
- **Conteúdo:** arbustos, pedras, plantas decorativas
- **Transparência:** fundo 100% transparente acima dos elementos

---

### Camada 8 — Chão (por código)
- **Formato:** gerado em código — sem PNG (preenchimento sólido + linha vermelha)
- **Parallax:** 100%

---

## Resumo de assets por fase

| Camada | Arquivo manhã | Arquivo tarde | Arquivo noite |
|---|---|---|---|
| Céu | *(código)* | *(código)* | *(código)* |
| Estrelas | *(código)* | — | *(código)* |
| Lua | — | — | `lua.png` |
| Sol | — | `sol.png` | — |
| Sol Nascente | `sol_nascente.png` | — | — |
| Nuvens | `fase1_clouds_morning.png` | `fase1_clouds_afternoon.png` | `fase1_clouds_night.png` |
| Montanhas | `fase1_mountains_morning.png` | `fase1_mountains_afternoon.png` | `fase1_mountains_night.png` |
| Fundo médio | `fase1_mid_morning.png` | `fase1_mid_afternoon.png` | `fase1_mid_night.png` |
| Vegetação | `fase1_near_morning.png` | `fase1_near_afternoon.png` | `fase1_near_night.png` |
| Chão | *(código)* | *(código)* | *(código)* |

**Total por fase: ~12 PNGs** (3 astros compartilhados entre fases + 9 por fase)

---

## Convenções para o artista

- Estilo: **pixel art**, dark/sombrio, paleta dessaturada com acentos de cor
- Referência visual: Taskbar Hero
- Todos os PNGs com camada de transparência (exceto céu e chão)
- Elementos devem ser desenhados para **loop horizontal contínuo** — a borda direita deve conectar com a borda esquerda sem costuras visíveis
- Linha do chão sempre em **y=0 do asset** (base do PNG = groundY do canvas)
- Resolução: pixel art em escala 1:1, sem anti-aliasing

---

## Prompts Padrão — Astros (ChatGPT/DALL-E)

> Ferramenta: ChatGPT com DALL-E. Fundo branco gerado pelo modelo — remover com remove.bg antes de usar.

### Lua (noite)
```
pixel art crescent moon, soft golden glow, detailed surface texture, isolated on pure black background, dark fantasy style, 16-bit, no clouds, no stars, no other elements, centered
```

### Sol (tarde)
```
pixel art sun, warm orange and yellow rays, glowing halo effect, isolated on pure black background, dark fantasy style, 16-bit, no clouds, no other elements, centered
```

### Sol nascente (manhã)
```
pixel art rising sun, soft warm orange and pink glow, lower half cut off as if rising from horizon, isolated on pure black background, dark fantasy style, 16-bit, centered
```

### Estrelas (noite)
```
pixel art scattered stars pattern, various sizes, soft twinkle cross shapes, isolated on pure black background, seamless tileable horizontally, 16-bit style, dark fantasy
```

### Nuvens
```
pixel art clouds, dark fantasy style, dark blue and grey tones, wispy and dramatic, isolated on transparent/black background, seamless tileable horizontally, 16-bit, no ground, no landscape
```

---

## Estrutura de Camadas BG (Parallax)

| # | Camada | Parallax | Visibilidade |
|---|---|---|---|
| 1 | Gradiente céu (código) | 0% | sempre |
| 2 | Estrelas | 0% | só noite |
| 3 | Lua / Sol | 2% | varia por período |
| 4 | Nuvens | 5% | sempre |
| 5 | Montanhas | 8% | por fase |
| 6 | Fundo médio | 25% | por fase |
| 7 | Vegetação próxima | 55% | por fase |
| 8 | Chão | 100% | por fase |

---

## Hero Sprites *(referência rápida)*

| Asset | Dimensões | Frames |
|---|---|---|
| Walk sheet | 192×68px | 4 frames (48×68 cada) |
| Attack sheet | 192×68px | 4 frames (48×68 cada) |
| Idle sheet | 192×68px | 4 frames (48×68 cada) |

Uma sheet por estado, por classe (Guerreiro, Caçadora, Mago).
