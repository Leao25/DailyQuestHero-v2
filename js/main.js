const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const CW     = CONFIG.canvas.width;
const CH     = CONFIG.canvas.height;

let last = performance.now();
let _pendingTicks = 0;

const PERIODS = ['period-morning', 'period-afternoon', 'period-night'];
const LOGOS = {
  'period-morning':   'assets/logo/dqh_logo_morning.png',
  'period-afternoon': 'assets/logo/dqh_logo_afternoon.png',
  'period-night':     'assets/logo/dqh_logo_night.png',
};
const logoEl = document.getElementById('logo');

function setPeriod(idx) {
  const period = PERIODS[idx];
  document.body.className = period;
  logoEl.src = LOGOS[period];
}

let periodIdx = 0;
setPeriod(periodIdx);
setInterval(() => {
  periodIdx = (periodIdx + 1) % PERIODS.length;
  setPeriod(periodIdx);
}, 20000);

BgSystem.loadGround('assets/bgs/grounds/tile_grass.png');

Hero.load();
HUD.init();
GameOver.init();
Inventory.init();
ChestHud.init();
Clouds.init();
Stars.init();

function tick() {
  const now   = performance.now();
  const delta = Math.min(now - last, 100); // cap 100ms para evitar spike ao voltar
  last = now;

  MobSystem.update(delta);
  Combat.update(delta);
  Floats.update(delta);
  Particles.update(delta);
  Log.update(delta);
  Hero.update(delta);
}

function render() {
  ctx.clearRect(0, 0, CW, CH);

  BgSystem.update(Hero.worldX);
  BgSystem.draw(ctx, Hero.worldX);

  Hero.draw(ctx);
  MobSystem.draw(ctx);
  Combat.draw(ctx);
  Particles.draw(ctx);
  Floats.draw(ctx);
  Log.draw(ctx);

  HUD.update();

  requestAnimationFrame(render);
}

// Worker mantém o loop de lógica rodando mesmo com a aba em background
const _worker = new Worker('js/worker.js');
_worker.onmessage = () => tick();

requestAnimationFrame(render);
