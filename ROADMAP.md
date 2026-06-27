# DailyQuestHero v2 — Roadmap

## Concluído ✅
- Engine base (loop, combat, wave system)
- Tela de seleção de herói com animação de portal
- HUD (HP, XP, gold, fase/hora)
- Sistema de save (localStorage, persiste entre sessões)
- Sistema de baús (4 raridades, 5 slots por raridade)
- Combat log (XP, gold, level up, drop)
- Números flutuantes de dano
- Morte do hero + tela de game over
- Modo Auto (reinicia fase ao morrer + avança fase automaticamente)
- gameSpeed global
- Ciclo dia/noite em tempo real (manhã/tarde/noite, 6min ciclo completo)
- BG parallax com 8 camadas (gradiente, estrelas, astros, nuvens, montanhas, mid, near, chão)
- Assets de BG: sol, lua, sol nascente, nuvens manhã/noite
- Loop rodando em background (Web Worker, não pausa ao trocar de aba)
- Fase avança automaticamente ao fim da noite com Auto ativo

---

## Em andamento 🔧
- Assets de BG restantes: montanhas, fundo médio, vegetação (fase1)
- Sprites de heróis e mobs

---

## Pendente / Decisão futura ⏸
- **Boss**: lógica de spawn desativada temporariamente — definir condição de spawn e dificuldade
- **Tela "Fase Concluída"**: existe no código, ativada manualmente; reavaliar quando boss voltar

---

## Backlog 📋

### Mapa
- Overlay sobre o canvas
- Jogador navega livremente entre fases já concluídas
- Transição via efeito de portal (mesmo da tela de seleção)

### Sistema de Itens
- Pré-requisito para Craft e Baús com loot real
- Itens com stats, raridade, tipo (arma/armadura/acessório)

### Tela de Craft
- Combina itens/materiais dropados pelos mobs
- Receitas desbloqueáveis por progressão
- Interface modal acessível pelo HUD

### Árvore de Habilidades
- Uma árvore por classe de herói
- Pontos ganhos ao subir de nível
- Habilidades passivas e ativas

### Mercado Global de Itens *(futuro — requer backend)*
- Jogadores compram/vendem itens entre si
- Requer API + banco de dados + autenticação
