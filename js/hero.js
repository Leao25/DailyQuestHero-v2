const Hero = {
  x:       CONFIG.hero.screenX,
  worldX:  0,
  state:   'walking',

  name:    'Caçadora',
  hp:      100,
  maxHp:   100,
  xp:      0,
  xpNext:  100,
  level:   1,
  gold:    0,

  _dead:        false,
  _respawnTimer: 0,
  _respawnDelay: 3000,
  _flashTimer:   0,

  _frames:        [],
  _atkFrames:     [],
  _frame:         0,
  _frameTimer:    0,
  _frameDuration: 120,
  _atkDuration:   80,

  load() {
    for (let i = 0; i < 7; i++) {
      const img = new Image();
      img.src = `assets/sprites/hunter/walk_frame_00${i}.png`;
      this._frames.push(img);
    }
    for (let i = 0; i < 5; i++) {
      const img = new Image();
      img.src = `assets/sprites/hunter/basic_atk_frame_00${i}.png`;
      this._atkFrames.push(img);
    }
  },

  fireArrow: false,

  playAttack() {
    if (this.state === 'attacking') return;
    this.state     = 'attacking';
    this._frame    = 0;
    this._frameTimer = 0;
    this.fireArrow = false;
  },

  gainXp(amount) {
    this.xp += amount;
    Log.push(`+${amount} XP`, '#a5d6a7');
    while (this.xp >= this.xpNext) {
      this.xp     -= this.xpNext;
      this.level  += 1;
      this.xpNext  = Math.round(CONFIG.hero.xpToLevelBase * Math.pow(CONFIG.hero.xpToLevelGrowth, this.level - 1));
      this.maxHp  += 20;
      this.hp      = this.maxHp;
      Floats.spawnHero(`LVL ${this.level}!`, '#ffd700');
      Log.push(`LEVEL UP! Lv.${this.level}`, '#ffd700');
    }
  },

  gainGold(amount) {
    this.gold += amount;
    Log.push(`+${amount} ouro`, '#f0c040');
  },

  die() {
    if (this._dead) return;
    this._dead = true;
    MobSystem.reset();
    Combat.reset();
    GameOver.show();
  },

  update(deltaMs) {
    if (this._dead) return;

    if (this.hp <= 0) { this.die(); return; }

    this._flashTimer = Math.max(0, this._flashTimer - deltaMs);

    this._frameTimer += deltaMs;
    if (this.state === 'attacking') {
      if (this._frameTimer >= this._atkDuration) {
        this._frameTimer = 0;
        this._frame++;
        if (this._frame === this._atkFrames.length - 1) {
          this.fireArrow = true;
        }
        if (this._frame >= this._atkFrames.length) {
          this._frame    = 0;
          this.state     = 'idle';
          this.fireArrow = false;
        }
      }
    } else if (this.state === 'walking') {
      if (this._frameTimer >= this._frameDuration) {
        this._frameTimer = 0;
        if (this._frames.length > 0) this._frame = (this._frame + 1) % this._frames.length;
      }
    }
    if (this.state === 'walking') {
      this.worldX += CONFIG.hero.walkSpeed * CONFIG.gameSpeed;
    }
  },

  draw(ctx) {
    if (this._dead) return;

    const W  = CONFIG.hero.spriteW;
    const H  = CONFIG.hero.spriteH;
    const GY = CONFIG.canvas.groundY;
    const groundOffset = Math.round(H * CONFIG.hero.groundOffset);
    const dx = this.x - W / 2;
    const dy = GY - H + groundOffset;

    // sombra bob
    const shadowPulse = 0.7 + 0.3 * Math.sin(Date.now() / 200);
    const shadowW = W * 0.4 * shadowPulse;
    const shadowH = 4 * shadowPulse;
    ctx.save();
    ctx.globalAlpha = 0.25 * shadowPulse;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(this.x, GY + 10, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const frameList = this.state === 'attacking' ? this._atkFrames : this._frames;
    const frame = frameList[this._frame];
    if (frame?.complete && frame.naturalWidth) {
      ctx.drawImage(frame, dx, dy, W, H);
    } else {
      ctx.fillStyle = '#50c878';
      ctx.fillRect(dx, dy, W, H);
    }

  },

  takeDamage(amount) {
    if (this._dead) return;
    this.hp = Math.max(0, this.hp - amount);
    this._flashTimer = 150;
  },
};
