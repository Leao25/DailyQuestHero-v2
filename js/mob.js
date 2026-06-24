const MOB_TYPES = {
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
    this.attackCooldownMs = def.attackCooldownMs;
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
      this.worldX -= this.approachSpeed * (deltaMs / 16.67);
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

    // olhos
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
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
