let canvas = null;
let ctx    = null;
const CW   = CONFIG.canvas.width;
const CH   = CONFIG.canvas.height;

let hero     = null;
let mobs     = [];
let lastTime = 0;
let running  = false;

let spawnCooldown = 0;
let autoRepeat    = false;
let deathTimer    = 0;
let phaseComplete = false;
let ticker        = null;
let rafId         = null;

// ── ARROWS ──────────────────────────────────────────────────────
const arrows = [];
function spawnArrow(fromX, fromY, targetX, targetY, dmg, crit, mob) {
  const dx = targetX - fromX, dy = targetY - fromY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  arrows.push({ type: 'normal', x: fromX, y: fromY, vx: dx / dist * 0.7, vy: dy / dist * 0.7, targetX, dmg, crit, mob });
}
function spawnSpecialArrow(fromX, fromY, dmg, crit) {
  arrows.push({ type: 'special', x: fromX, y: fromY, vx: 1.2, vy: 0, dmg, crit, hitMobs: new Set() });
}
function updateArrows(deltaMs, onHit, onSpecialHit) {
  arrows.forEach(a => {
    a.x += a.vx * deltaMs;
    a.y += a.vy * deltaMs;
    if (a.type === 'normal') {
      if (a.x >= a.targetX) onHit(a);
    } else if (a.type === 'special') {
      mobs.filter(m => m.state !== 'dead').forEach(m => {
        const sx = m.worldX - hero.worldX + hero.screenX;
        if (!a.hitMobs.has(m) && a.x >= sx - 10 && a.x <= sx + 10) {
          a.hitMobs.add(m);
          onSpecialHit(a, m);
        }
      });
    }
  });
  arrows.splice(0, arrows.length, ...arrows.filter(a =>
    a.type === 'normal' ? a.x < a.targetX : a.x < CW + 50
  ));
}
function drawArrows(ctx) {
  arrows.forEach(a => {
    const angle = Math.atan2(a.vy, a.vx);
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(angle);

    // haste
    ctx.strokeStyle = '#8B5E3C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-20, 0);
    ctx.stroke();

    // ponta metálica (triângulo)
    ctx.fillStyle = '#d0d0d0';
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(-2, -2.5);
    ctx.lineTo(-2, 2.5);
    ctx.closePath();
    ctx.fill();

    if (a.type === 'normal') {
      // plumas (traseira)
      ctx.strokeStyle = '#c8f0c0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-22, -4);
      ctx.moveTo(-18, 0);
      ctx.lineTo(-22, 4);
      ctx.stroke();
    } else {
      // rastro verde da flecha especial
      ctx.shadowColor = '#50c878';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgb(18, 211, 66)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-60, -3); ctx.lineTo(-8, 0);
      ctx.moveTo(-60,  3); ctx.lineTo(-8, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  });
}

// ── BG ──────────────────────────────────────────────────────────
function drawBG() {
  BgSystem.load(DayCycle.phase, DayCycle.getPeriod());
  BgSystem.draw(ctx, hero ? hero.worldX : 0, CW, CH);
}

// ── SPAWN ────────────────────────────────────────────────────────
function spawnMob() {
  const spawnX = hero.worldX + CONFIG.mob.spawnAheadDistance;
  mobs.push(new Mob('goblin', spawnX));
  WaveSystem.onSpawned();
  const iv = CONFIG.mob.spawnIntervalMs;
  spawnCooldown = (iv[0] + Math.random() * (iv[1] - iv[0])) / CONFIG.gameSpeed;
}

// ── PHASE COMPLETE ───────────────────────────────────────────────
function showPhaseComplete() {
  phaseComplete = true;
  document.getElementById('phase-complete-sub').textContent = `Fase ${DayCycle.phase} concluída!`;
  document.getElementById('phase-complete').classList.add('visible');
}

function startNextPhase() {
  document.getElementById('phase-complete').classList.remove('visible');
  phaseComplete = false;
  mobs = [];
  DayCycle.nextPhase();
  BgSystem.preload(DayCycle.phase);
  WaveSystem.init();
  hero.worldX = 0;
  hero.lastAttackTime = 0;
  spawnCooldown = 1500;
}

// ── LOOP ─────────────────────────────────────────────────────────
function loop() {
  if (!running) return;

  const now      = Date.now();
  const deltaMs  = Math.min(now - lastTime, 100);
  lastTime = now;

  if (phaseComplete) {
    if (!document.hidden) rafId = requestAnimationFrame(loop);
    return;
  }

  DayCycle.update(deltaMs);
  BgSystem.update(deltaMs);

  const liveMobs = mobs.filter(m => m.state !== 'dead');
  const target   = liveMobs
    .sort((a, b) => Math.abs(a.worldX - hero.worldX) - Math.abs(b.worldX - hero.worldX))[0] ?? null;

  hero.update(deltaMs, target);
  mobs.forEach(m => m.update(deltaMs, hero));

  liveMobs.forEach(mob => {
    if (mob.state === 'dead') return;
    Combat.resolve(hero, mob, now,
      () => {},
      (dmg) => {
        if (dmg === 0) {
          FloatingNumbers.add(hero.screenX, CONFIG.canvas.groundY - CONFIG.hero.spriteH - 10, 'Esquiva!', 'dodge');
        } else {
          FloatingNumbers.add(hero.screenX, CONFIG.canvas.groundY - CONFIG.hero.spriteH - 10, dmg, 'damage_taken');
        }
      },
      (mob) => {
        const leveled = hero.gainXp(mob.xpReward);
        CombatLog.add('xp', `+${mob.xpReward} XP`);
        if (leveled) CombatLog.add('level_up', `Nível ${hero.level}! Atributos aumentados.`);
        if (Math.random() < 0.3) {
          hero.gold += 1;
          CombatLog.add('gold', `+1 ouro.`);
        }
        ChestSystem.tryDrop(mob);
        WaveSystem.onMobDied(mobs);
        SaveSystem.save(hero);
      }
    );
  });

  // dispara flecha normal no último frame do ataque
  if (hero.arrowReady) {
    const { dmg, crit } = hero.arrowReady;
    hero.arrowReady = null;
    if (hero.state !== 'special' && target && target.state !== 'dead') {
      const sx = target.worldX - hero.worldX + hero.screenX;
      const arrowY = CONFIG.canvas.groundY - CONFIG.hero.spriteH * 0.55;
      spawnArrow(hero.screenX, arrowY, sx, arrowY, dmg, crit, target);
    }
  }

  // dispara flecha especial no último frame do special
  if (hero._specialReady) {
    hero._specialReady = false;
    const isCrit = Math.random() < hero.critChance;
    const dmg = Math.round(hero.attack * 3 * (isCrit ? 2 : 1));
    const arrowY = CONFIG.canvas.groundY - CONFIG.hero.spriteH * 0.55;
    spawnSpecialArrow(hero.screenX, arrowY, dmg, isCrit);
  }

  mobs = mobs.filter(m => !m.markedForRemoval);

  if (WaveSystem.state === 'waiting') {
    WaveSystem.nextWave();
    spawnCooldown = 2000;
  }

  // para spawn 1 minuto de jogo antes do fim da noite (03:00)
  const nearDawn = DayCycle.getPeriod() === 'night' && DayCycle.getHour() >= 3;
  spawnCooldown -= deltaMs;
  if (spawnCooldown <= 0 && WaveSystem.shouldSpawn() && !nearDawn) {
    spawnMob();
  }

  // Auto: avança fase ao virar 04:00
  if (autoRepeat && DayCycle.shouldAutoAdvance()) {
    startNextPhase();
    return;
  }

  // morte do hero
  if (hero.state === 'dead') {
    deathTimer += deltaMs;
    ctx.clearRect(0, 0, CW, CH);
    drawBG();
    hero.draw(ctx);
    ctx.fillStyle = `rgba(180,0,0,${Math.min(0.45, deathTimer / 2000)})`;
    ctx.fillRect(0, 0, CW, CH);
    const alpha = Math.min(1, deathTimer / 800);
    ctx.globalAlpha = alpha;
    ctx.font      = "bold 48px 'Courier New', monospace";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText('VOCÊ MORREU', CW / 2 + 2, CH / 2 + 2);
    ctx.fillStyle = '#e94560';
    ctx.fillText('VOCÊ MORREU', CW / 2, CH / 2);
    ctx.globalAlpha = 1;
    if (autoRepeat) {
      if (deathTimer >= 2500) restartPhase();
    } else {
      if (deathTimer >= 800) document.getElementById('death-btns').classList.add('visible');
    }
    if (!document.hidden) rafId = requestAnimationFrame(loop);
    return;
  }

  ctx.clearRect(0, 0, CW, CH);
  drawBG();
  mobs.forEach(m => m.draw(ctx, hero));
  hero.draw(ctx);
  const onMobDamaged = (mob, dmg, crit) => {
    mob.takeDamage(dmg);
    const sx = mob.worldX - hero.worldX + hero.screenX;
    FloatingNumbers.add(sx, CONFIG.canvas.groundY - mob.type.spriteH - 10, dmg, crit ? 'damage_crit' : 'damage_dealt');
    if (mob.state === 'dead') {
      mob.markedForRemoval = true;
      const leveled = hero.gainXp(mob.xpReward);
      CombatLog.add('xp', `+${mob.xpReward} XP`);
      if (leveled) CombatLog.add('level_up', `Nível ${hero.level}! Atributos aumentados.`);
      if (Math.random() < 0.3) { hero.gold += 1; CombatLog.add('gold', `+1 ouro.`); }
      ChestSystem.tryDrop(mob);
      WaveSystem.onMobDied(mobs);
      SaveSystem.save(hero);
    }
  };
  updateArrows(deltaMs,
    (a) => { if (a.mob && a.mob.state !== 'dead') onMobDamaged(a.mob, a.dmg, a.crit); },
    (a, mob) => onMobDamaged(mob, a.dmg, a.crit)
  );
  drawArrows(ctx);
  FloatingNumbers.update(deltaMs);
  FloatingNumbers.draw(ctx);

  HUD.update(hero);
  CombatLog.tick();

  if (!document.hidden) rafId = requestAnimationFrame(loop);
}

// ── RESTART (morte) ──────────────────────────────────────────────
function restartPhase() {
  deathTimer = 0;
  mobs       = [];
  document.getElementById('death-btns')?.classList.remove('visible');
  hero.hp     = hero.maxHp;
  hero.state  = 'walking';
  hero.worldX = 0;
  hero.lastAttackTime = 0;
  FloatingNumbers.init();
  WaveSystem.init();
  spawnCooldown = 1500;
}

function toggleAutoRepeat() {
  autoRepeat = !autoRepeat;
  const btn = document.getElementById('btn-autorepeat');
  if (btn) {
    btn.style.borderColor = autoRepeat ? '#f0c040' : '#333';
    btn.title       = autoRepeat ? 'Auto: ON' : 'Auto: OFF';
    btn.textContent = 'Auto';
  }
}

function goToHeroSelect() {
  running = false;
  ticker?.postMessage('stop'); ticker?.terminate(); ticker = null;
  document.getElementById('death-btns')?.classList.remove('visible');
  document.getElementById('hud').style.display = 'none';
  document.getElementById('game-logo').classList.remove('hidden');
  HeroSelect.init((heroId) => startGame(heroId));
  HeroSelect.show();
}

// ── START ────────────────────────────────────────────────────────
function startGame(heroClass) {
  hero          = new Hero(heroClass);
  mobs          = [];
  running       = true;
  phaseComplete = false;

  HeroSelect.hide();
  document.getElementById('game-logo').classList.add('hidden');

  canvas = document.getElementById('game-canvas');
  const wrap = document.getElementById('canvas-wrap');
  ['combat-log', 'death-btns', 'phase-complete'].forEach(id => {
    const el = document.getElementById(id);
    if (el) wrap.appendChild(el);
  });

  ctx = canvas.getContext('2d');
  document.getElementById('hud').style.display = 'flex';

  SaveSystem.load(hero);
  ChestSystem.init();
  CombatLog.init();
  FloatingNumbers.init();
  WaveSystem.init();
  lastTime      = Date.now();
  spawnCooldown = 1500;

  if (!ticker) {
    ticker = new Worker('js/ticker.worker.js');
    ticker.onmessage = () => { if (running && document.hidden) loop(); };
    ticker.postMessage('start');
  }
  rafId = requestAnimationFrame(loop);
}

document.addEventListener('visibilitychange', () => {
  if (!running) return;
  if (!document.hidden) {
    lastTime = Date.now();
    rafId = requestAnimationFrame(loop);
  }
});

// ── INIT ─────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (!running || !hero) return;
  if (e.key === 's' || e.key === 'S') {
    hero.state = 'special';
    hero._animFrame = 0;
    hero._animTimer = 0;
  }
});

HeroSelect.init((heroId) => startGame(heroId));
HeroSelect.show();
