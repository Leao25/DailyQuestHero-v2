const MOB_TYPES = {
  boss: {
    key:      'boss',
    name:     'Chefe',
    color:    '#c0392b',
    hp:       300,
    attack:   18,
    attackRange:    55,
    attackCooldownMs: 1000,
    xpReward: 150,
    approachSpeed: 0.5,
    spriteW:  80,
    spriteH:  100,
    lootTable: [
      { rarity: 'rare',      chance: 1.0  },
      { rarity: 'epic',      chance: 0.50 },
      { rarity: 'legendary', chance: 0.15 },
    ],
  },
  goblin: {
    key:      'goblin',
    name:     'Goblin',
    color:    '#4caf50',
    hp:       30,
    attack:   4,
    attackRange:    45,
    attackCooldownMs: 1200,
    xpReward: 18,
    approachSpeed: 0.7,
    spriteW:  48,
    spriteH:  60,
    // chance de 0.0 a 1.0 — editável por mob
    lootTable: [
      { rarity: 'normal',    chance: 0.30 },
      { rarity: 'rare',      chance: 0.08 },
      { rarity: 'epic',      chance: 0.02 },
      { rarity: 'legendary', chance: 0.005 },
    ],
  },
};

class Mob {
  constructor(type, worldX) {
    const def        = MOB_TYPES[type] ?? MOB_TYPES.goblin;
    this.type        = def;
    this.worldX      = worldX;
    this.maxHp       = def.hp;
    this.hp          = def.hp;
    this.attack      = def.attack;
    this.attackRange = def.attackRange;
    this.attackCooldownMs = def.attackCooldownMs / CONFIG.gameSpeed;
    this.xpReward    = def.xpReward;
    this.approachSpeed = def.approachSpeed;
    this.state       = 'walking';
    this.lastAttackTime = 0;
    this.markedForRemoval = false;
  }

  canAttack(now) {
    return now - this.lastAttackTime >= this.attackCooldownMs;
  }

  performAttack(now) {
    this.lastAttackTime = now;
    return this.attack;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) this.state = 'dead';
  }

  update(deltaMs, hero) {
    if (this.state === 'dead') return;
    const dist = Math.abs(this.worldX - hero.worldX);
    if (dist > this.attackRange) {
      this.state = 'walking';
      const extra = hero.state === 'attacking' ? CONFIG.hero.walkSpeed : 0;
      this.worldX -= (this.approachSpeed + extra) * CONFIG.gameSpeed * (deltaMs / 16.67);
    } else {
      this.state = 'attacking';
    }
  }

  draw(ctx, hero) {
    if (this.state === 'dead') return;
    const screenX = this.worldX - hero.worldX + hero.screenX;
    const y = CONFIG.canvas.groundY;
    const w = this.type.spriteW;
    const h = this.type.spriteH;

    // fora da tela
    if (screenX < -w || screenX > CONFIG.canvas.width + w) return;

    // sombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(screenX, y + 2, w * 0.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // corpo
    ctx.fillStyle = this.state === 'attacking' ? '#ff4444' : this.type.color;
    ctx.fillRect(screenX - w / 2, y - h, w, h);

    // boss: aura pulsante
    if (this.type.key === 'boss') {
      ctx.save();
      ctx.strokeStyle = `rgba(255,50,50,${0.4 + 0.3 * Math.sin(Date.now() / 200)})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(screenX - w / 2 - 4, y - h - 4, w + 8, h + 8);
      ctx.restore();
    }

    // olhos
    ctx.fillStyle = this.type.key === 'boss' ? '#ff0000' : 'rgba(0,0,0,0.6)';
    const eyeS = Math.max(2, w * 0.1);
    ctx.fillRect(screenX - w * 0.2, y - h * 0.78, eyeS, eyeS);
    ctx.fillRect(screenX + w * 0.08, y - h * 0.78, eyeS, eyeS);

    // barra de HP
    const barW = w + 8;
    const barX = screenX - barW / 2;
    const barY = y - h - 10;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, 4);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(barX, barY, barW * (this.hp / this.maxHp), 4);
  }
}
