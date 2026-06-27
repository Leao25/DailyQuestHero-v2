class Hero {
  constructor(heroClass) {
    this.heroClass = heroClass;
    const names = { warrior: 'Guerreiro', hunter: 'Caçadora', mage: 'Mago', cleric: 'Clérigo' };
    this.heroName = names[heroClass] ?? heroClass;
    this.worldX    = 0;

    const stats = {
      warrior: { maxHp:120, attack:14, attackRange:65,  attackCooldownMs:700,  specialCooldownMs:12000, specialAnimMs:900,  color:'#e8a030', critChance:0.05 },
      hunter:  { maxHp: 80, attack:12, attackRange:280, attackCooldownMs:900,  specialCooldownMs:10000, specialAnimMs:900,  color:'#50c878', critChance:0.10 },
      mage:    { maxHp: 70, attack:12, attackRange:320, attackCooldownMs:1200, specialCooldownMs:15000, specialAnimMs:1000, color:'#9b6dff', critChance:0.05 },
    };
    const s = stats[heroClass] ?? stats.warrior;

    this.maxHp           = s.maxHp;
    this.hp              = s.maxHp;
    this.attack          = s.attack;
    this.attackRange     = s.attackRange;
    this.attackCooldownMs  = s.attackCooldownMs / CONFIG.gameSpeed;
    this.specialCooldownMs = s.specialCooldownMs;
    this.specialAnimMs     = s.specialAnimMs;
    this.lastSpecialTime   = -s.specialCooldownMs; // começa carregado
    this.color             = s.color;
    this.critChance        = s.critChance;

    // equipamento — cada slot guarda { key, img } ou null
    this.equipment = {
      body:   null,
      armor:  null,
      weapon: null,
    };
    this._sprites = {}; // cache de imagens carregadas

    this.level           = 1;
    this.xp              = 0;
    this.xpToNext        = 100;
    this.gold            = 0;

    this.state           = 'walking';
    this.lastAttackTime  = 0;

    // animação por frames
    this._animFrame    = 0;
    this._animTimer    = 0;
    this._animFrameMs  = 180;
    this._animSheets   = {};
    this._attackPayload = null;
    this.arrowReady     = null;
    this._specialReady  = false;
    this.dodgeChance    = heroClass === 'hunter' ? 0.1 : 0.00;
    this._dodgeTimer    = 0;

    // posição na tela (fixa)
    this.screenX = CONFIG.hero.screenX;
    this.screenY = CONFIG.canvas.groundY;

    if (heroClass === 'hunter') {
      this._loadSheet('walking',   'assets/sprites/heroes/hunter/walk.png',   4);
      this._loadSheet('attacking', 'assets/sprites/heroes/hunter/attack.png', 5);
      this._loadSheet('special',   'assets/sprites/heroes/hunter/special.png', 7);
    }
  }

  _loadSheet(name, src, frameCount) {
    const img = new Image();
    img.src = src;
    this._animSheets[name] = { img, frameCount };
  }

  _tickAnim(deltaMs) {
    this._animTimer += deltaMs;
    const sheet = this._animSheets[this.state] ?? this._animSheets['idle'];
    if (!sheet) return;
    const frameMs = this.state === 'attacking'
      ? (this.attackCooldownMs / sheet.frameCount)
      : this.state === 'special'
      ? (this.specialAnimMs / sheet.frameCount)
      : this._animFrameMs;
    if (this._animTimer >= frameMs) {
      this._animTimer = 0;
      const prev = this._animFrame;
      this._animFrame = (this._animFrame + 1) % sheet.frameCount;
      // último frame da animação de ataque → sinaliza disparo da flecha
      if (this.state === 'attacking' && prev === sheet.frameCount - 2 && this._attackPayload) {
        this.arrowReady = this._attackPayload;
        this._attackPayload = null;
      }
    }
  }

  equip(slot, key) {
    if (!key) { this.equipment[slot] = null; return; }
    if (!this._sprites[key]) {
      const img = new Image();
      img.src = `assets/sprites/${key}.png`;
      this._sprites[key] = img;
    }
    this.equipment[slot] = { key, img: this._sprites[key] };
  }

  canAttack(now) {
    return now - this.lastAttackTime >= this.attackCooldownMs;
  }

  performAttack(now) {
    this.lastAttackTime = now;
    const isCrit = Math.random() < this.critChance;
    const payload = { dmg: isCrit ? this.attack * 2 : this.attack, crit: isCrit };
    this._attackPayload = payload;
    return payload;
  }

  dodge() {
    this._dodgeTimer = 300; // ms de duração do efeito
    return true;
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
    if (this._dodgeTimer > 0) this._dodgeTimer -= deltaMs;

    // special: aguarda animação terminar antes de voltar ao estado normal
    if (this.state === 'special') {
      const sheet = this._animSheets['special'];
      const prevFrame = this._animFrame;
      this._tickAnim(deltaMs);
      // sinaliza disparo no penúltimo→último frame
      if (sheet && prevFrame === sheet.frameCount - 2 && this._animFrame === sheet.frameCount - 1) {
        this._specialReady = true;
      }
      if (sheet && this._animFrame === sheet.frameCount - 1 && this._animTimer === 0) {
        this.state = 'walking';
        this._animFrame = 0;
        this._animTimer = 0;
      }
      return;
    }

    const prevState = this.state;
    if (targetMob && Math.abs(this.worldX - targetMob.worldX) <= this.attackRange) {
      this.state = 'attacking';
    } else {
      this.state = 'walking';
      this.worldX += CONFIG.hero.walkSpeed * CONFIG.gameSpeed * (deltaMs / 16.67);
    }
    if (this.state !== prevState) {
      this._animFrame = 0;
      this._animTimer = 0;
    }
    this._tickAnim(deltaMs);
  }

  draw(ctx) {
    const x = this.screenX;
    const y = this.screenY;
    const w = CONFIG.hero.spriteW;
    const h = CONFIG.hero.spriteH;

    // dodge: shake horizontal + flash azul
    const dodging = this._dodgeTimer > 0;
    const shakeX = dodging ? Math.sin(this._dodgeTimer * 0.15) * 5 : 0;

    // sombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + shakeX, y + 2, w * 0.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const sheet = this._animSheets[this.state] ?? this._animSheets['idle'];
    const hasSprite = sheet?.img?.complete && sheet.img.naturalWidth > 0;

    if (hasSprite) {
      const fw = sheet.img.naturalWidth / sheet.frameCount;
      const fh = sheet.img.naturalHeight;
      const sx = this._animFrame * fw;
      const dh = h;
      const dw = Math.round(fw / fh * dh);
      if (dodging) ctx.globalAlpha = 0.5 + 0.5 * Math.sin(this._dodgeTimer * 0.05);
      ctx.drawImage(sheet.img, sx, 0, fw, fh, x + shakeX - dw / 2, y - dh, dw, dh);
      ctx.globalAlpha = 1;
    } else {
      // placeholder enquanto sprites não existem
      ctx.fillStyle = this.state === 'attacking' ? '#fff' : this.color;
      ctx.fillRect(x - w / 2, y - h, w, h);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      const eyeS = Math.max(2, w * 0.1);
      ctx.fillRect(x - w * 0.2, y - h * 0.78, eyeS, eyeS);
      ctx.fillRect(x + w * 0.08, y - h * 0.78, eyeS, eyeS);
    }

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
