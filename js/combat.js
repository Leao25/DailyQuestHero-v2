const Combat = {
  resolve(hero, mob, now, onHeroAttack, onMobAttack, onMobDeath) {
    if (!mob || mob.state === 'dead' || hero.state === 'dead') return;

    const dist = Math.abs(hero.worldX - mob.worldX);

    // hero ataca mob
    if (dist <= hero.attackRange && hero.canAttack(now)) {
      const dmg = hero.performAttack(now);
      mob.takeDamage(dmg);
      onHeroAttack(dmg);
      if (mob.state === 'dead') {
        mob.markedForRemoval = true;
        onMobDeath(mob);
      }
    }

    // mob ataca hero
    if (dist <= mob.attackRange && mob.state !== 'dead' && mob.canAttack(now)) {
      const dmg = mob.performAttack(now);
      hero.takeDamage(dmg);
      onMobAttack(dmg);
    }
  },
};
