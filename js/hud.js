const HUD = {
  update(hero, wave) {
    document.getElementById('hero-name').textContent  = hero.heroClass.charAt(0).toUpperCase() + hero.heroClass.slice(1);
    document.getElementById('hero-level').textContent = `Lv. ${hero.level}`;
    document.getElementById('hp-bar').style.width     = (hero.hp / hero.maxHp * 100) + '%';
    document.getElementById('hp-text').textContent    = `${hero.hp}/${hero.maxHp}`;
    document.getElementById('xp-bar').style.width     = (hero.xp / hero.xpToNext * 100) + '%';
    document.getElementById('xp-text').textContent    = `${hero.xp}/${hero.xpToNext}`;
    document.getElementById('gold-display').textContent = `🪙 ${hero.gold}`;
    if (wave) {
      document.getElementById('zone-label').textContent = wave.getLabel();
    }
  },
};
