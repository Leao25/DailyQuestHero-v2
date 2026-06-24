# DailyQuestHero v2 — Padrões do Projeto

## Canvas / Tela
- **Resolução interna:** 1152×648px (16:9)
- **BG por fase:** 2304×648px (2× largura para tiling horizontal)
- O canvas é fixo — nunca muda independente do dispositivo. CSS escala para caber na tela.

## Assets — Sprites

### Hero (fixo para todas as classes)
- **Sprite:** 48×68px
- **Sheet walk:** 192×68px (4 frames lado a lado)
- **Sheet attack:** 192×68px (4 frames lado a lado)

### Mobs (tamanho varia por mob)
- Tamanho base de referência: 70×100px
- Sheet walk: 420×100px (6 frames) — para mob base
- Cada mob novo deve ser definido na ferramenta `tools/sprite-size-picker.html` e documentado aqui

### Background
- **Canvas:** 1152×648px (fixo)
- **BG por fase:** 2304×648px (2× largura para tiling horizontal)

## Estilo Visual
- Pixel art, tema dark/sombrio
- Referência: Taskbar Hero (estilo), PostKnight (sidescrolling/menus)

## Stack
- Browser game puro: HTML + CSS + JS
- Sem engine externa
