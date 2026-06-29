const MobSystem = {
  _mobs: [],
  _spawnTimer: 0,
  _frameCache: {},

  reset() {
    this._mobs = [];
    this._spawnTimer = 0;
  },

  _loadFrames(def) {
    if (this._frameCache[def.id]) return;
    const walk = [];
    for (let i = 0; i < def.walkFrames; i++) {
      const img = new Image();
      img.src = `${def.spritePath}${String(i).padStart(3, '0')}.png`;
      walk.push(img);
    }
    const atk = [];
    for (let i = 0; i < def.atkFrames; i++) {
      const img = new Image();
      img.src = `${def.atkSpritePath}${String(i).padStart(3, '0')}.png`;
      atk.push(img);
    }
    this._frameCache[def.id] = { walk, atk };
  },

  update(deltaMs) {
    this._spawnTimer += deltaMs;
    const def = MOBS.wolf;
    const [minMs, maxMs] = def.spawnIntervalMs;
    if (this._spawnTimer >= minMs + Math.random() * (maxMs - minMs)) {
      this._spawn(def);
      this._spawnTimer = 0;
    }

    for (const mob of this._mobs) {
      if (mob.dead) continue;
      mob._frameTimer += deltaMs;
      const dx = Hero.x - mob.x;
      const inRange = Math.abs(dx) <= mob.def.attackRange;

      if (!inRange) {
        mob.state = 'walking';
        mob.x += Math.sign(dx) * mob.def.approachSpeed * CONFIG.gameSpeed;
        if (mob._frameTimer >= mob.def.frameDuration) {
          mob._frameTimer = 0;
          mob._frame = (mob._frame + 1) % mob.def.walkFrames;
        }
      } else {
        mob.state = 'attacking';
        const dur = mob.def.atkFrameDuration;
        if (mob._frameTimer >= dur) {
          mob._frameTimer = 0;
          mob._frame = (mob._frame + 1) % mob.def.atkFrames;
        }
        mob._attackTimer = (mob._attackTimer || 0) + deltaMs;
        if (mob._attackTimer >= mob.def.attackCooldownMs) {
          mob._attackTimer = 0;
          mob._frame = 0;
          mob._frameTimer = 0;
          if (mob.def.attackType === 'melee') {
            Hero.takeDamage(mob.def.attack);
            Floats.spawnHero(`-${mob.def.attack}`);
          }
        }
      }
    }

    this._mobs = this._mobs.filter(m => !m.dead || m.deathTimer > 0);
    for (const mob of this._mobs) {
      if (mob.dead) mob.deathTimer -= deltaMs;
    }
  },

  _spawn(def) {
    this._loadFrames(def);
    this._mobs.push({
      def,
      x:            CONFIG.canvas.width + def.spriteW,
      hp:           def.hp,
      maxHp:        def.hp,
      dead:         false,
      deathTimer:   400,
      state:        'walking',
      _attackTimer: 0,
      _frame:       0,
      _frameTimer:  0,
    });
  },

  hit(mob, damage) {
    if (mob.dead) return;
    mob.hp -= damage;
    Floats.spawnMob(mob.x, damage);
    if (mob.hp <= 0) {
      mob.dead = true;
      Particles.burst(mob.x, mob.def);
      Hero.gainXp(mob.def.xpReward);
      Hero.gainGold(mob.def.goldReward);
      GameOver.onMobKilled();
      for (const drop of mob.def.chestDrops) {
        if (Math.random() < drop.chance) {
          ChestHud.add(drop.rarity);
        }
      }
    }
  },

  draw(ctx) {
    const GY = CONFIG.canvas.groundY;

    for (const mob of this._mobs) {
      const W  = mob.def.spriteW;
      const H  = mob.def.spriteH;
      const groundOffset = Math.round(H * mob.def.groundOffset);
      const alpha = mob.dead ? mob.deathTimer / 400 : 1;
      ctx.globalAlpha = alpha;

      const cache  = this._frameCache[mob.def.id];
      const frames = mob.state === 'attacking' ? cache?.atk : cache?.walk;
      const frame  = frames?.[mob._frame];
      if (frame?.complete && frame.naturalWidth) {
        ctx.drawImage(frame, mob.x - W / 2, GY - H + groundOffset, W, H);
      } else {
        ctx.fillStyle = '#e4dedecb';
        ctx.fillRect(mob.x - W / 2, GY - H + groundOffset, W, H);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(mob.x - W / 2,     GY - H + groundOffset - 6, 7, 8);
        ctx.fillRect(mob.x + W / 2 - 7, GY - H + groundOffset - 6, 7, 8);
      }

      if (!mob.dead) {
        const spriteTop = GY - H + groundOffset;
        const centerY   = spriteTop + H / 2;
        const barW      = (mob.maxHp / 10) * CONFIG.hpBarPer10;
        const barY      = centerY - 35;
        const barH      = 3;

        // fundo
        ctx.fillStyle = '#333';
        ctx.fillRect(mob.x - barW / 2, barY, barW, barH);
        // preenchimento
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(mob.x - barW / 2, barY, barW * (mob.hp / mob.maxHp), barH);

        // nome do mob
        ctx.font      = '7px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(mob.def.name, mob.x, barY + barH + 8);
        ctx.textAlign = 'left';
      }

      ctx.globalAlpha = 1;
    }
  },
};

// números flutuantes
const Floats = {
  _items: [],

  spawnMob(x, dmg) {
    const GY = CONFIG.canvas.groundY;
    const H  = CONFIG.hero.spriteH;
    this._items.push({ x, y: GY - H - 8, text: `-${dmg}`, color: '#fff176', life: 900 });
  },

  spawnHero(text, color = '#ff5252') {
    const GY = CONFIG.canvas.groundY;
    const H  = CONFIG.hero.spriteH;
    const groundOffset = Math.round(H * CONFIG.hero.groundOffset);
    this._items.push({ x: CONFIG.hero.screenX, y: GY - H + groundOffset - 14, text, color, life: 900 });
  },

  update(deltaMs) {
    for (const f of this._items) {
      f.life -= deltaMs;
      f.y    -= 0.04 * deltaMs;
    }
    this._items = this._items.filter(f => f.life > 0);
  },

  draw(ctx) {
    ctx.textAlign    = 'center';
    ctx.font         = 'bold 10px "Courier New"';
    for (const f of this._items) {
      const alpha = Math.min(1, f.life / 300);
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign   = 'left';
  },
};

const Particles = {
  _items: [],

  burst(x, def) {
    const GY = CONFIG.canvas.groundY;
    const H  = def.spriteH;
    const groundOffset = Math.round(H * def.groundOffset);
    const cy = GY - H / 2 + groundOffset;
    const colors = ['#e4dede', '#ffffff', '#c0392b', '#f0c040'];
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.3;
      const speed = 1.5 + Math.random() * 2.5;
      this._items.push({
        x, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 400 + Math.random() * 300,
        maxLife: 700,
      });
    }
  },

  update(deltaMs) {
    for (const p of this._items) {
      p.x    += p.vx * CONFIG.gameSpeed;
      p.y    += p.vy * CONFIG.gameSpeed;
      p.vy   += 0.08;
      p.life -= deltaMs;
    }
    this._items = this._items.filter(p => p.life > 0);
  },

  draw(ctx) {
    for (const p of this._items) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle   = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  },
};
