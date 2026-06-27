const CHEST_DEFS = {
  normal:    { label: 'Normal',   color: '#8B6914', borderActive: '#c8a06a', borderEmpty: '#3a3a3a', bg: '#1a1408' },
  rare:      { label: 'Raro',     color: '#1a5fa0', borderActive: '#4e9af1', borderEmpty: '#1a2a3a', bg: '#080d14' },
  epic:      { label: 'Épico',    color: '#5a1a9a', borderActive: '#9b6dff', borderEmpty: '#1a1030', bg: '#0a0814' },
  legendary: { label: 'Lendário', color: '#9a6800', borderActive: '#f0c040', borderEmpty: '#2a2000', bg: '#100e00' },
};

const RARITIES = ['normal', 'rare', 'epic', 'legendary'];
const MAX_PER_RARITY = 5;

const ChestSystem = {
  counts: { normal: 0, rare: 0, epic: 0, legendary: 0 },

  tryDrop(mob) {
    if (!mob.type.lootTable) return;
    for (const entry of mob.type.lootTable) {
      if (Math.random() > entry.chance) continue;
      if (this.counts[entry.rarity] >= MAX_PER_RARITY) continue;
      this.counts[entry.rarity]++;
      this._render();
      CombatLog.add('chest_drop', `Baú ${CHEST_DEFS[entry.rarity].label} obtido!`);
      return;
    }
  },

  open(rarity) {
    if (this.counts[rarity] <= 0) return;
    this.counts[rarity]--;
    this._render();
    // placeholder — futuramente chama ItemSystem.rollLoot(rarity)
    CombatLog.add('chest_drop', `Baú ${CHEST_DEFS[rarity].label} aberto! (itens em breve)`);
  },

  _render() {
    RARITIES.forEach(rarity => {
      const count = this.counts[rarity];
      const def   = CHEST_DEFS[rarity];
      const btn   = document.getElementById(`chest-btn-${rarity}`);
      const dots  = document.getElementById(`chest-dots-${rarity}`);
      if (!btn || !dots) return;

      const active = count > 0;
      btn.disabled = !active;
      btn.style.borderColor     = active ? def.borderActive : def.borderEmpty;
      btn.style.backgroundColor = active ? def.color        : '#111118';
      btn.style.opacity         = active ? '1' : '0.35';
      btn.style.cursor          = active ? 'pointer' : 'default';

      // pontinhos
      dots.innerHTML = '';
      for (let i = 0; i < MAX_PER_RARITY; i++) {
        const dot = document.createElement('span');
        dot.className = i < count ? 'chest-dot chest-dot-filled' : 'chest-dot';
        dot.style.setProperty('--dot-color', def.borderActive);
        dots.appendChild(dot);
      }
    });
  },

  init() {
    this.counts = { normal: 0, rare: 0, epic: 0, legendary: 0 };
    this._render();
  },
};
