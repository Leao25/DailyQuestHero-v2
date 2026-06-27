const Combat = {
  resolve(hero, mob, now, onHeroAttack, onMobAttack, onMobDeath) {
    if (!mob || mob.state === 'dead' || hero.state === 'dead') return;

    const dist = Math.abs(hero.worldX - mob.worldX);

    // hero inicia ataque — dano e flecha são disparados no último frame (game.js)
    if (dist <= hero.attackRange && hero.canAttack(now)) {
      hero.performAttack(now);
    }

    // mob ataca hero
    if (dist <= mob.attackRange && mob.state !== 'dead' && mob.canAttack(now)) {
      const dmg = mob.performAttack(now);
      if (Math.random() < hero.dodgeChance) {
        hero.dodge();
        onMobAttack(0); // sinaliza dodge para o game.js mostrar o texto
      } else {
        hero.takeDamage(dmg);
        onMobAttack(dmg);
      }
    }
  },
};
