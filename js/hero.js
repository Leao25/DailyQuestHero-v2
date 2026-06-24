class Hero {
  constructor(heroClass) {
    this.heroClass = heroClass;
    this.worldX    = 0;

    const stats = {
      warrior: { maxHp:120, attack:12, attackRange:65,  attackCooldownMs:900,  color:'#e8a030' },
      hunter:  { maxHp: 80, attack: 8, attackRange:280, attackCooldownMs:750,  color:'#50c878' },
      mage:    { maxHp: 70, attack:18, attackRange:320, attackCooldownMs:1200, color:'#9b6dff' },
    };
    const s = stats[heroClass] ?? stats.warrior;

    this.maxHp           = s.maxHp;
    this.hp              = s.maxHp;
    this.attack          = s.attack;
    this.attackRange     = s.attackRange;
    this.attackCooldownMs= s.attackCooldownMs;
    this.color           = s.color;

    this.level           = 1;
    this.xp              = 0;
    this.xpToNext        = 100;
    this.gold            = 0;

    this.state           = 'walking';
    this.lastAttackTime  = 0;

    // posição na tela (fixa)
    this.screenX = CONFIG.hero.screenX;
    this.screenY = CONFIG.canvas.groundY;
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

  gainXp(amount) {
    this.xp += amount;
    if (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.round(this.xpToNext * 1.35);
      this.maxHp    = Math.round(this.maxHp * 1.08);
      this.hp       = this.maxHp;
      this.attack   = Math.round(this.attack * 1.06);
      return true;
    }
    return false;
  }

  update(deltaMs, targetMob) {
    if (this.state === 'dead') return;

    if (targetMob && Math.abs(this.worldX - targetMob.worldX) <= this.attackRange) {
      this.state = 'attacking';
    } else {
      this.state = 'walking';
      this.worldX += CONFIG.hero.walkSpeed * (deltaMs / 16.67);
    }
  }

  draw(ctx) {
    const x = this.screenX;
    const y = this.screenY;
    const w = CONFIG.hero.spriteW;
    const h = CONFIG.hero.spriteH;

    // sombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, w * 0.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // corpo
    ctx.fillStyle = this.state === 'attacking' ? '#fff' : this.color;
    ctx.fillRect(x - w / 2, y - h, w, h);

    // olhos
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    const eyeS = Math.max(2, w * 0.1);
    ctx.fillRect(x - w * 0.2, y - h * 0.78, eyeS, eyeS);
    ctx.fillRect(x + w * 0.08, y - h * 0.78, eyeS, eyeS);

    // barra de HP sobre o hero
    const barW = w + 8;
    const barH = 4;
    const barX = x - barW / 2;
    const barY = y - h - 10;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#e94560';
    ctx.fillRect(barX, barY, barW * (this.hp / this.maxHp), barH);
  }
}
