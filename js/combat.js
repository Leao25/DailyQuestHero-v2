const Combat = {
  _arrows: [],
  _attackTimer: CONFIG.hero.attackCooldownMs,
  _arrowSpeed: 10,

  reset() {
    this._arrows = [];
    this._attackTimer = 0;
  },

  update(deltaMs) {
    this._attackTimer += deltaMs;

    // dispara flecha se houver mob no alcance
    const target = this._nearestMob();
    if (target) {
      if (this._attackTimer >= CONFIG.hero.attackCooldownMs) {
        Hero.playAttack();
        this._attackTimer = 0;
      }
      if (Hero.fireArrow) {
        Hero.fireArrow = false;
        const meleeThreshold = Hero.x + target.def.attackRange + 5;
        if (target.x < meleeThreshold) {
          MobSystem.hit(target, CONFIG.hero.baseAttack);
        } else {
          this._shoot(target);
        }
      }
    } else {
      if (Hero.state === 'idle') Hero.state = 'walking';
    }

    // move flechas
    for (const arrow of this._arrows) {
      arrow.x += this._arrowSpeed * CONFIG.gameSpeed;
    }

    // colisão com mobs
    for (const arrow of this._arrows) {
      if (arrow.hit) continue;
      for (const mob of MobSystem._mobs) {
        if (mob.dead) continue;
        const hitRadius = mob.x - Hero.x <= mob.def.attackRange + 10
          ? mob.def.spriteW
          : mob.def.spriteW / 2;
        if (Math.abs(arrow.x - mob.x) < hitRadius) {
          MobSystem.hit(mob, CONFIG.hero.baseAttack);
          arrow.hit = true;
          break;
        }
      }
    }

    // remove flechas fora da tela ou que acertaram
    this._arrows = this._arrows.filter(a => !a.hit && a.x < CONFIG.canvas.width + 20);
  },

  _nearestMob() {
    let nearest = null;
    let minDist = Infinity;
    for (const mob of MobSystem._mobs) {
      if (mob.dead) continue;
      const dist = mob.x - Hero.x;
      if (dist > 0 && dist <= CONFIG.hero.attackRange && dist < minDist) {
        minDist = dist;
        nearest = mob;
      }
    }
    return nearest;
  },

  _shoot(target) {
    const GY = CONFIG.canvas.groundY;
    const H  = CONFIG.hero.spriteH;
    const groundOffset = Math.round(H * CONFIG.hero.groundOffset);
    this._arrows.push({
      x: Hero.x + CONFIG.hero.spriteW * CONFIG.hero.arrowOffsetX,
      y: GY - H + groundOffset + H * CONFIG.hero.arrowOffsetY,
      hit: false,
    });
  },

  draw(ctx) {
    ctx.fillStyle = '#f0c040';
    for (const arrow of this._arrows) {
      ctx.fillRect(arrow.x, arrow.y, 8, 2);
    }
  },
};
