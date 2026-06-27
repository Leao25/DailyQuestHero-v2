const CombatLog = {
  messages: [],
  MAX: 6,
  DURATION: 4000, // ms que cada mensagem fica visível

  _types: {
    damage_taken: { color: '#e94560', prefix: '' },
    damage_dealt: { color: '#ffffff', prefix: '' },
    level_up:     { color: '#f0c040', prefix: '⬆ ' },
    chest_drop:   { color: '#4e9af1', prefix: '📦 ' },
    gold:         { color: '#f0c040', prefix: '🪙 ' },
    xp:           { color: '#4e9af1', prefix: '✦ ' },
  },

  add(type, text) {
    const def = this._types[type] ?? { color: '#aaa', prefix: '' };
    this.messages.unshift({
      text:    def.prefix + text,
      color:   def.color,
      born:    Date.now(),
    });
    if (this.messages.length > this.MAX) this.messages.length = this.MAX;
    this._render();
  },

  tick() {
    const now = Date.now();
    const before = this.messages.length;
    this.messages = this.messages.filter(m => now - m.born < this.DURATION);
    if (this.messages.length !== before) this._render();
  },

  _render() {
    const el = document.getElementById('combat-log');
    if (!el) return;
    el.innerHTML = '';
    this.messages.forEach((m, i) => {
      const age     = (Date.now() - m.born) / this.DURATION;
      const opacity = Math.max(0, 1 - age * 1.2).toFixed(2);
      const line    = document.createElement('div');
      line.className   = 'log-line';
      line.style.color   = m.color;
      line.style.opacity = opacity;
      line.textContent = m.text;
      el.appendChild(line);
    });
  },

  init() {
    this.messages = [];
    this._render();
  },
};
