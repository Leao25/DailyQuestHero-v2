const HUD = {
  _els: null,

  _init() {
    this._els = {
      name:  document.getElementById('hero-name'),
      level: document.getElementById('hero-level'),
      hpBar: document.getElementById('hp-bar'),
      hpTxt: document.getElementById('hp-text'),
      xpBar: document.getElementById('xp-bar'),
      xpTxt: document.getElementById('xp-text'),
      gold:  document.getElementById('gold-display'),
      zone:  document.getElementById('zone-label'),
    };
  },

  update(hero) {
    if (!this._els) this._init();
    const e = this._els;
    e.name.textContent  = hero.heroName;
    e.level.textContent = `Lv. ${hero.level}`;
    e.hpBar.style.width = (hero.hp / hero.maxHp * 100) + '%';
    e.hpTxt.textContent = `${hero.hp}/${hero.maxHp}`;
    e.xpBar.style.width = (hero.xp / hero.xpToNext * 100) + '%';
    e.xpTxt.textContent = `${hero.xp}/${hero.xpToNext}`;
    e.gold.textContent  = `🪙 ${hero.gold}`;
    e.zone.textContent  = `Fase ${DayCycle.phase}  ·  ${DayCycle.getPeriodName()}  ·  ${DayCycle.getTimeString()}`;
  },
};
