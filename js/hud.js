const Log = {
  _entries: [],
  _maxEntries: 5,
  _entryLife:  4000,

  push(text, color = '#ffffff') {
    this._entries.unshift({ text, color, life: this._entryLife });
    if (this._entries.length > this._maxEntries) this._entries.pop();
  },

  update(deltaMs) {
    for (const e of this._entries) e.life -= deltaMs;
    this._entries = this._entries.filter(e => e.life > 0);
  },

  draw(ctx) {
    ctx.font      = '8px "Courier New"';
    ctx.textAlign = 'left';
    const x = 6;
    let y = 14;
    for (const e of this._entries) {
      const alpha = Math.min(1, e.life / 600);
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = e.color;
      ctx.fillText(e.text, x, y);
      y += 11;
    }
    ctx.globalAlpha = 1;
  },
};

const HUD = {
  init() {
    this._name   = document.getElementById('hud-name');
    this._hpBar  = document.getElementById('hud-hp-bar');
    this._hpText = document.getElementById('hud-hp-text');
    this._xpBar  = document.getElementById('hud-xp-bar');
    this._level  = document.getElementById('hud-level');
    this._gold   = document.getElementById('hud-gold');
  },

  update() {
    this._name.textContent   = Hero.name;
    this._level.textContent  = `Lv.${Hero.level}`;
    this._hpBar.style.width  = (Hero.hp / Hero.maxHp * 100) + '%';
    this._hpText.textContent = `${Hero.hp}/${Hero.maxHp}`;
    this._xpBar.style.width  = (Hero.xp / Hero.xpNext * 100) + '%';
    this._gold.textContent   = `${Hero.gold}g`;
  },
};
