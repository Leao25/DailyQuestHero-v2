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

## Sistema de Ondas e Períodos do Dia

### Estrutura
- Cada fase tem N ondas (definido por fase, não fixo)
- Ao final da última onda spawna o **boss**
- Após derrotar o boss, próxima fase começa

### Distribuição dos períodos
O período é calculado dinamicamente pelo progresso da fase:
- **Manhã** — ondas nos primeiros 40% do total
- **Tarde** — ondas nos próximos 40%
- **Noite** — ondas nos últimos 20% + boss

Fórmula: `progresso = ondaAtual / totalOndas`
- 0.00–0.40 → Manhã
- 0.40–0.80 → Tarde
- 0.80–1.00 → Noite + Boss

### Exemplos
| Total de ondas | Manhã | Tarde | Noite+Boss |
|---|---|---|---|
| 5 | 1–2 | 3–4 | 5+boss |
| 10 | 1–4 | 5–8 | 9–10+boss |
| 40 | 1–16 | 17–32 | 33–40+boss |

### HUD
- Barra de progresso mostra `Onda X/N`
- Ícone ou cor indica o período atual (manhã/tarde/noite)
- BG troca automaticamente ao mudar de período

## Estilo Visual
- Pixel art, tema dark/sombrio
- Referência: Taskbar Hero (estilo), PostKnight (sidescrolling/menus)

## Stack
- Browser game puro: HTML + CSS + JS
- Sem engine externa
