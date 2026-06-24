const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');
const CW     = CONFIG.canvas.width;
const CH     = CONFIG.canvas.height;

function drawPlaceholderBG() {
  // céu
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CW, CH);

  // montanhas ao fundo
  ctx.fillStyle = '#0d0d1f';
  const mts = [[0,420,200,200],[180,380,240,268],[400,400,200,248],[560,360,260,288],[780,390,220,258],[960,410,200,238]];
  mts.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));

  // árvores sombrias
  ctx.fillStyle = '#0f0f22';
  for (let i = 0; i < 10; i++) {
    const tx = i * 120 + 40;
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

  // estrelas
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 60; i++) {
    const sx = (i * 137 + 50) % CW;
    const sy = (i * 97  + 20) % (CONFIG.canvas.groundY - 40);
    ctx.fillRect(sx, sy, 1, 1);
  }

  // placeholder hero
  const hx = CONFIG.hero.screenX;
  const hy = CONFIG.canvas.groundY - CONFIG.hero.spriteH;
  ctx.fillStyle = '#f0c040';
  ctx.fillRect(hx, hy, CONFIG.hero.spriteW, CONFIG.hero.spriteH);
  ctx.fillStyle = '#0a0a0f';
  ctx.font = '6px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HERO', hx + CONFIG.hero.spriteW / 2, hy + CONFIG.hero.spriteH / 2 + 2);
}

function loop() {
  ctx.clearRect(0, 0, CW, CH);
  drawPlaceholderBG();
  requestAnimationFrame(loop);
}

loop();
