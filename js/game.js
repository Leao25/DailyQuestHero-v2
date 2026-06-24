let canvas = null;
let ctx    = null;
const CW   = CONFIG.canvas.width;
const CH   = CONFIG.canvas.height;

let hero     = null;
let mobs     = [];
let lastTime = 0;
let running  = false;

let spawnCooldown = 0; // ms até próximo spawn dentro da onda

// ── BG ──────────────────────────────────────────────────────────
function drawBG() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CW, CH);

  // montanhas ao fundo
  ctx.fillStyle = '#0d0d1f';
  [[0,420,200,200],[180,380,240,268],[400,400,200,248],
   [560,360,260,288],[780,390,220,258],[960,410,200,238]]
    .forEach(([x,y,w,h]) => ctx.fillRect(x, y, w, h));

  // árvores
  ctx.fillStyle = '#0f0f22';
  for (let i = 0; i < 10; i++) {
    const tx = ((i * 120 + 40) - (hero ? hero.worldX * 0.3 : 0) % (CW + 200) + CW + 200) % (CW + 200) - 100;
    const th = 100 + (i % 3) * 40;
    const tw = 30 + (i % 3) * 10;
    ctx.fillRect(tx, CONFIG.canvas.groundY - th, tw, th);
    ctx.beginPath();
    ctx.moveTo(tx + tw / 2, CONFIG.canvas.groundY - th - 60);
    ctx.lineTo(tx - tw,     CONFIG.canvas.groundY - th);
    ctx.lineTo(tx + tw * 2, CONFIG.canvas.groundY - th);
    ctx.closePath();
    ctx.fill();
  }

  // chão
  ctx.fillStyle = '#16162a';
  ctx.fillRect(0, CONFIG.canvas.groundY, CW, CH - CONFIG.canvas.groundY);

  // linha do chão
  ctx.fillStyle = '#e94560';
  ctx.fillRect(0, CONFIG.canvas.groundY, CW, 2);

  // estrelas fixas
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 60; i++) {
    ctx.fillRect((i * 137 + 50) % CW, (i * 97 + 20) % (CONFIG.canvas.groundY - 40), 1, 1);
  }
}

// ── SPAWN ────────────────────────────────────────────────────────
function spawnMob() {
  const spawnX = hero.worldX + CONFIG.mob.spawnAheadDistance;
  mobs.push(new Mob('goblin', spawnX));
  WaveSystem.onSpawned();
  const iv = CONFIG.mob.spawnIntervalMs;
  spawnCooldown = iv[0] + Math.random() * (iv[1] - iv[0]);
}

// ── LOOP ─────────────────────────────────────────────────────────
function loop(timestamp) {
  if (!running) return;

  const deltaMs = Math.min(timestamp - lastTime, 50);
  lastTime = timestamp;
  const now = Date.now();

  // target: mob mais próximo vivo
  const target = mobs.filter(m => m.state !== 'dead')
    .sort((a, b) => Math.abs(a.worldX - hero.worldX) - Math.abs(b.worldX - hero.worldX))[0] ?? null;

  // update
  hero.update(deltaMs, target);

  mobs.forEach(m => m.update(deltaMs, hero));

  if (target) {
    Combat.resolve(hero, target, now,
      (dmg) => { /* onHeroAttack */ },
      (dmg) => { /* onMobAttack  */ },
      (mob) => {
        hero.gainXp(mob.xpReward);
        hero.gold += Math.random() < 0.3 ? 1 : 0;
        WaveSystem.onMobDied(mobs);
      }
    );
  }

  mobs = mobs.filter(m => !m.markedForRemoval);

  // onda completa → avança
  if (WaveSystem.state === 'waveComplete') {
    WaveSystem.nextWave();
    spawnCooldown = 2000; // pausa entre ondas
  }

  // spawn
  spawnCooldown -= deltaMs;
  if (spawnCooldown <= 0 && WaveSystem.shouldSpawn()) spawnMob();

  // draw
  ctx.clearRect(0, 0, CW, CH);
  drawBG();
  mobs.forEach(m => m.draw(ctx, hero));
  hero.draw(ctx);

  // HUD
  HUD.update(hero, WaveSystem);

  requestAnimationFrame(loop);
}

// ── START ────────────────────────────────────────────────────────
function startGame(heroClass) {
  hero    = new Hero(heroClass);
  mobs    = [];
  running = true;

  HeroSelect.hide();

  canvas = document.getElementById('game-canvas');
  ctx    = canvas.getContext('2d');

  document.getElementById('hud').style.display = 'flex';

  WaveSystem.init();
  lastTime      = performance.now();
  spawnCooldown = 1500;

  requestAnimationFrame(loop);
}

// ── INIT ─────────────────────────────────────────────────────────
HeroSelect.init((heroId) => startGame(heroId));
HeroSelect.show();
