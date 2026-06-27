const SaveSystem = {
  _key(heroClass) { return `dqh_v2_${heroClass}`; },

  save(hero) {
    const data = {
      level:    hero.level,
      xp:       hero.xp,
      xpToNext: hero.xpToNext,
      maxHp:    hero.maxHp,
      attack:   hero.attack,
      gold:     hero.gold,
    };
    localStorage.setItem(this._key(hero.heroClass), JSON.stringify(data));
  },

  load(hero) {
    const raw = localStorage.getItem(this._key(hero.heroClass));
    if (!raw) return;
    const data = JSON.parse(raw);
    hero.level    = data.level;
    hero.xp       = data.xp;
    hero.xpToNext = data.xpToNext;
    hero.maxHp    = data.maxHp;
    hero.hp       = data.maxHp; // começa com HP cheio
    hero.attack   = data.attack;
    hero.gold     = data.gold;
  },

  // retorna { level, gold } para exibir na tela de seleção
  peek(heroClass) {
    const raw = localStorage.getItem(this._key(heroClass));
    if (!raw) return null;
    const data = JSON.parse(raw);
    return { level: data.level, gold: data.gold };
  },

  clear(heroClass) {
    localStorage.removeItem(this._key(heroClass));
  },
};
