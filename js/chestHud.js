const ChestHud = {
  _stacks: { normal: 0, rare: 0, mythic: 0, legendary: 0 },
  _maxStack: 5,

  reset() {
    this._stacks = { normal: 0, rare: 0, mythic: 0, legendary: 0 };
    this._render();
  },

  add(rarity) {
    if (this._stacks[rarity] >= this._maxStack) return false;
    this._stacks[rarity]++;
    this._render();
    const def = CHESTS[rarity];
    Log.push(`${def.icon} ${def.name}!`, def.color);
    return true;
  },

  _open(rarity) {
    if (this._stacks[rarity] <= 0) return;
    this._stacks[rarity]--;
    Log.push('Itens em Breve', 'rgba(255,255,255,0.4)');
    this._render();
  },

  init() {
    this._render();
  },

  _render() {
    const rarities = ['normal', 'rare', 'mythic', 'legendary'];
    for (const rarity of rarities) {
      const slot = document.getElementById(`chest-slot-${rarity}`);
      if (!slot) continue;
      const def   = CHESTS[rarity];
      const count = this._stacks[rarity];

      slot.innerHTML = '';
      slot.className = `chest-slot${count > 0 ? ' has-chest' : ''}`;
      slot.onclick   = count > 0 ? () => this._open(rarity) : null;

      if (count > 0) {
        slot.innerHTML = `
          <span class="chest-icon">${def.icon}</span>
          <span class="chest-qty">${count}/${this._maxStack}</span>
          <div class="chest-tooltip">${def.name}</div>
        `;
      } else {
        slot.innerHTML = `<span class="chest-empty-icon">${def.icon}</span>`;
      }
    }
  },
};
