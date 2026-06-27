const HUD = {
  update(hero) {
    document.getElementById('hero-name').textContent    = hero.heroName;
    document.getElementById('hero-level').textContent   = `Lv. ${hero.level}`;
    document.getElementById('hp-bar').style.width       = (hero.hp / hero.maxHp * 100) + '%';
    document.getElementById('hp-text').textContent      = `${hero.hp}/${hero.maxHp}`;
    document.getElementById('xp-bar').style.width       = (hero.xp / hero.xpToNext * 100) + '%';
    document.getElementById('xp-text').textContent      = `${hero.xp}/${hero.xpToNext}`;
    document.getElementById('gold-display').textContent = `🪙 ${hero.gold}`;
    document.getElementById('zone-label').textContent   =
      `Fase ${DayCycle.phase}  ·  ${DayCycle.getPeriodName()}  ·  ${DayCycle.getTimeString()}`;
  },
};
