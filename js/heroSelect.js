const HEROES = [
  {
    id: 'warrior',
    name: 'Guerreiro',
    desc: 'Combatente corpo a corpo. Resistente e letal com espada e escudo.',
    atk: 8, def: 7, hp: 10,
    color: '#e8a030',
    locked: true,
    hidden: true,
  },
  {
    id: 'hunter',
    name: 'Caçadora',
    desc: 'Ágil e precisa. Ataques rápidos com alta chance de crítico.',
    atk: 9, def: 4, hp: 6,
    color: '#50c878',
    locked: false,
  },
  {
    id: 'mage',
    name: 'Mago',
    desc: 'Domina as artes arcanas. Dano massivo com chance de cura em críticos.',
    atk: 10, def: 3, hp: 5,
    color: '#9b6dff',
    locked: true,
  },
  {
    id: 'cleric',
    name: 'Clérigo',
    desc: 'Guardião sagrado. Cura aliados e usa escudo para bloquear ataques.',
    atk: 5, def: 9, hp: 9,
    color: '#f0e040',
    locked: true,
    hidden: true,
  },
];

const HeroSelect = {
  selectedIdx: 1,
  onConfirm: null,

  init(onConfirm) {
    this.onConfirm = onConfirm;
    this._idleSheets = {};
    const idleMap = { hunter: { src: 'assets/sprites/heroes/hunter/idle.png', frameCount: 4 } };
    for (const [id, cfg] of Object.entries(idleMap)) {
      const img = new Image();
      img.src = cfg.src;
      this._idleSheets[id] = { img, frameCount: cfg.frameCount };
    }
    this._build();
    this._render();
  },

  _build() {
    const overlay = document.createElement('div');
    overlay.id = 'hero-select-overlay';
    overlay.innerHTML = `
      <div id="hs-top">
        <div id="hs-hero-name"></div>
        <div id="hs-hero-level">Lv. 1</div>
        <div id="hs-hero-desc"></div>
        <div id="hs-stats">
          <div class="hs-stat"><span class="hs-stat-label">ATQ</span><div class="hs-stat-bar-bg"><div class="hs-stat-bar" id="hs-atk-bar"></div></div></div>
          <div class="hs-stat"><span class="hs-stat-label">DEF</span><div class="hs-stat-bar-bg"><div class="hs-stat-bar" id="hs-def-bar"></div></div></div>
          <div class="hs-stat"><span class="hs-stat-label">HP</span> <div class="hs-stat-bar-bg"><div class="hs-stat-bar" id="hs-hp-bar"></div></div></div>
        </div>
      </div>

      <div id="hs-scene">
        <canvas id="hs-canvas"></canvas>
        <button id="hs-reset-all-btn" title="Resetar progresso de todos os heróis">↺ Reset</button>
      </div>

      <div id="hs-bottom">
        <button id="hs-confirm-btn">Iniciar Aventura</button>
      </div>
    `;
    document.getElementById('canvas-wrap').replaceWith(overlay);

    const confirmHero = () => {
      const hero = HEROES[this.selectedIdx];
      if (hero.locked) return;
      this._startPortalTransition(() => this.onConfirm(hero.id));
    };

    document.getElementById('hs-confirm-btn').addEventListener('click', confirmHero);

    this._spaceHandler = (e) => { if (e.code === 'Space') { e.preventDefault(); confirmHero(); } };
    document.addEventListener('keydown', this._spaceHandler);

    const canvas = document.getElementById('hs-canvas');
    canvas.addEventListener('click', (e) => this._onCanvasClick(e));

    document.getElementById('hs-reset-all-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      HEROES.forEach(h => SaveSystem.clear(h.id));
      this._render();
    });
  },

  _render() {
    const hero = HEROES[this.selectedIdx];

    document.getElementById('hs-hero-name').textContent = hero.name;
    document.getElementById('hs-hero-desc').textContent = hero.desc;

    const saved = SaveSystem.peek(hero.id);
    const lvl = saved ? saved.level : 1;
    document.getElementById('hs-hero-level').textContent = saved
      ? `Lv. ${lvl}  ·  🪙 ${saved.gold}`
      : `Lv. 1  ·  Novo`;

    document.getElementById('hs-atk-bar').style.width = (hero.atk * 10) + '%';
    document.getElementById('hs-def-bar').style.width = (hero.def * 10) + '%';
    document.getElementById('hs-hp-bar').style.width  = (hero.hp  * 10) + '%';

    this._drawScene();
  },

  _drawScene() {
    const canvas = document.getElementById('hs-canvas');
    if (!canvas) return;
    const ow = canvas.offsetWidth  || 0;
    const oh = canvas.offsetHeight || 0;
    if (ow > 0 && (canvas.width !== ow || canvas.height !== oh)) {
      canvas.width  = ow;
      canvas.height = oh;
    }
    if (canvas.width === 0) return;
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext('2d');
    const t = Date.now() / 1000;

    // BG
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, W, H);

    // chão
    ctx.fillStyle = '#1a1020';
    ctx.fillRect(0, H * 0.72, W, H * 0.28);
    ctx.fillStyle = '#3a1040';
    ctx.fillRect(0, H * 0.72, W, 2);

    const cx = W / 2, cy = H * 0.68;

    // luz da fogueira no chão (pulsa)
    const fireFlicker = 0.7 + Math.sin(t * 3.7) * 0.15 + Math.sin(t * 7.1) * 0.08;
    const groundGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.38);
    groundGlow.addColorStop(0,   `rgba(255,100,20,${0.18 * fireFlicker})`);
    groundGlow.addColorStop(0.5, `rgba(200,60,10,${0.08 * fireFlicker})`);
    groundGlow.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = groundGlow;
    ctx.fillRect(0, H * 0.5, W, H * 0.5);

    // heróis (antes da fogueira para ficar atrás das chamas)
    const visible = HEROES.filter(h => !h.hidden);
    const positions = this._getPositions(visible.length, cx, cy, W, H);

    visible.forEach((hero, i) => {
      const pos = positions[i];
      const isSelected = HEROES.indexOf(hero) === this.selectedIdx;
      this._drawHeroPlaceholder(ctx, hero, pos.x, pos.y, isSelected, t, cx, cy);
    });

    // fogueira por cima
    this._drawFire(ctx, cx, cy);

    // luz da fogueira sobre os personagens (overlay laranja pulsante)
    const heroGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.42);
    heroGlow.addColorStop(0,   `rgba(255,120,20,${0.12 * fireFlicker})`);
    heroGlow.addColorStop(0.6, `rgba(180,60,10,${0.05 * fireFlicker})`);
    heroGlow.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = heroGlow;
    ctx.fillRect(0, 0, W, H);

    // partículas de brasa
    this._drawEmbers(ctx, cx, cy, t, W, H);
  },

  _getPositions(count, cx, cy, W, H) {
    if (count === 1) {
      return [{ x: cx - W * 0.15, y: cy - H * 0.05 }];
    }
    if (count === 2) {
      return [
        { x: cx - W * 0.22, y: cy - H * 0.05 },
        { x: cx + W * 0.22, y: cy - H * 0.05 },
      ];
    }
    if (count === 3) {
      return [
        { x: cx - W * 0.28, y: cy - H * 0.05 },
        { x: cx,             y: cy - H * 0.18 },
        { x: cx + W * 0.28, y: cy - H * 0.05 },
      ];
    }
    return [
      { x: cx - W * 0.35, y: cy },
      { x: cx - W * 0.15, y: cy - H * 0.12 },
      { x: cx + W * 0.15, y: cy - H * 0.12 },
      { x: cx + W * 0.35, y: cy },
    ];
  },

  _drawEmbers(ctx, cx, cy, t, W, H) {
    for (let i = 0; i < 12; i++) {
      const seed = i * 137.5;
      const life = ((t * 0.6 + seed) % 1.0);
      const angle = (seed * 2.4) + Math.sin(t + i) * 0.5;
      const dist  = life * 60;
      const ex = cx + Math.cos(angle) * dist * 0.4;
      const ey = cy - 20 - life * 80 + Math.sin(t * 2 + i) * 8;
      const alpha = life < 0.3 ? life / 0.3 : 1 - (life - 0.3) / 0.7;
      const r = Math.max(0.5, 2 - life * 2);
      ctx.save();
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = life < 0.5 ? '#ffcc44' : '#ff6622';
      ctx.beginPath();
      ctx.arc(ex, ey, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  _drawHeroPlaceholder(ctx, hero, x, y, isSelected, t, cx, cy) {
    const size = 96;
    const idleOffset = Math.sin(t * 1.8 + (cx - x) * 0.05) * 3;
    const breatheY = y + idleOffset;
    const alpha = 1.0;

    ctx.save();
    ctx.globalAlpha = alpha;

    // sombra no chão
    const shadowScale = 1 - Math.abs(idleOffset) * 0.02;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.08, size * 0.38 * shadowScale, size * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    const sheet = this._idleSheets?.[hero.id];
    const hasSprite = sheet?.img?.complete && sheet.img.naturalWidth > 0;
    const fw = hasSprite ? sheet.img.naturalWidth / sheet.frameCount : 0;
    const fh = hasSprite ? sheet.img.naturalHeight : 0;
    const frame = hasSprite ? Math.floor(t * (1000 / 180) % sheet.frameCount) : 0;
    const dx = x - size / 2, dy = breatheY - size;

    // outline: silhueta sólida deslocada 8x na cor do herói
    if (isSelected && hasSprite) {
      const o = 2;
      // cria silhueta: pixels opacos viram cor sólida, resto transparente
      const tmp = document.createElement('canvas');
      tmp.width = size; tmp.height = size;
      const tc = tmp.getContext('2d');
      tc.drawImage(sheet.img, frame * fw, 0, fw, fh, 0, 0, size, size);
      // threshold: zeramos pixels com alpha < 128 e pintamos o resto com a cor
      const imgData = tc.getImageData(0, 0, size, size);
      const d = imgData.data;
      const [r, g, b] = hero.color.match(/\w\w/g).map(h => parseInt(h, 16));
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] > 64) { d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = 255; }
        else { d[i+3] = 0; }
      }
      tc.putImageData(imgData, 0, 0);
      ctx.save();
      ctx.globalAlpha = alpha;
      const offsets = [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,-o],[-o,o],[o,o]];
      for (const [ox, oy] of offsets) {
        ctx.drawImage(tmp, dx + ox, dy + oy);
      }
      ctx.restore();
    }

    // sprite normal por cima
    if (hasSprite) {
      ctx.drawImage(sheet.img, frame * fw, 0, fw, fh, dx, dy, size, size);
    } else {
      ctx.fillStyle = hero.color;
      ctx.fillRect(dx, dy, size, size);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      const eyeY = breatheY - size * 0.75;
      const eyeSize = Math.max(2, size * 0.08);
      ctx.fillRect(x - size * 0.2, eyeY, eyeSize, eyeSize);
      ctx.fillRect(x + size * 0.1, eyeY, eyeSize, eyeSize);
    }

    ctx.restore();

    // nome embaixo
    ctx.fillStyle = isSelected ? '#fff' : '#666';
    ctx.font = `${isSelected ? 12 : 10}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(hero.name, x, y + 18);
  },

  _drawFire(ctx, x, y) {
    const t = Date.now() / 200;
    const flicker = Math.sin(t) * 4;

    // base da chama
    ctx.fillStyle = '#ff4400';
    ctx.beginPath();
    ctx.ellipse(x, y, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // chama principal
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.quadraticCurveTo(x - 8, y - 28 + flicker, x, y - 40 + flicker);
    ctx.quadraticCurveTo(x + 8, y - 28 - flicker, x + 14, y);
    ctx.closePath();
    ctx.fill();

    // chama interna
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.moveTo(x - 7, y);
    ctx.quadraticCurveTo(x - 3, y - 18 + flicker, x, y - 28 + flicker);
    ctx.quadraticCurveTo(x + 3, y - 18 - flicker, x + 7, y);
    ctx.closePath();
    ctx.fill();

    // lenhas
    ctx.strokeStyle = '#5a3010';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x - 18, y + 2); ctx.lineTo(x + 10, y - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 18, y + 2); ctx.lineTo(x - 10, y - 4); ctx.stroke();
  },

  _onCanvasClick(e) {
    const canvas = document.getElementById('hs-canvas');
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H * 0.68;

    const visible = HEROES.filter(h => !h.hidden);
    const positions = this._getPositions(visible.length, cx, cy, W, H);

    visible.forEach((hero, i) => {
      const pos = positions[i];
      const size = 52;
      if (mx >= pos.x - size && mx <= pos.x + size &&
          my >= pos.y - size * 1.2 && my <= pos.y + 20) {
        this.selectedIdx = HEROES.indexOf(hero);
        this._render();
      }
    });
  },

  _loop() {
    if (!document.getElementById('hs-canvas')) return;
    this._drawScene();
    requestAnimationFrame(() => this._loop());
  },

  _startPortalTransition(cb) {
    const overlay = document.createElement('div');
    overlay.id = 'portal-overlay';
    document.body.appendChild(overlay);

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none';
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2;
    let radius = 0;
    const maxR = Math.sqrt(cx * cx + cy * cy) + 50;
    let done = false;

    const hero = HEROES[this.selectedIdx];

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // buraco do portal (recorte)
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // anel do portal
      if (radius > 10) {
        ctx.save();
        ctx.strokeStyle = hero.color;
        ctx.lineWidth = 6;
        ctx.shadowColor = hero.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      radius += maxR / 40;
      if (radius >= maxR && !done) {
        done = true;
        document.body.removeChild(canvas);
        cb();
      } else if (!done) {
        requestAnimationFrame(draw);
      }
    }

    // primeiro fecha a tela com portal invertido
    let closeR = maxR;
    const hero2 = hero;
    function close() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(cx, cy, closeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = hero2.color;
      ctx.lineWidth = 6;
      ctx.shadowColor = hero2.color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, closeR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      closeR -= maxR / 30;
      if (closeR > 0) {
        requestAnimationFrame(close);
      } else {
        radius = 0;
        requestAnimationFrame(draw);
      }
    }

    requestAnimationFrame(close);
  },

  show() {
    document.getElementById('hud').style.display = 'none';
    // pequeno delay para o DOM renderizar o canvas antes de iniciar o loop
    requestAnimationFrame(() => requestAnimationFrame(() => this._loop()));
  },

  hide() {
    if (this._spaceHandler) {
      document.removeEventListener('keydown', this._spaceHandler);
      this._spaceHandler = null;
    }
    const el = document.getElementById('hero-select-overlay');
    if (el) {
      // reinsere o canvas-wrap no lugar do overlay
      const canvasWrap = document.createElement('div');
      canvasWrap.id = 'canvas-wrap';
      canvasWrap.innerHTML = '<canvas id="game-canvas" width="1152" height="648"></canvas>';
      canvasWrap.style.position = 'relative';
      el.replaceWith(canvasWrap);
    }
    document.getElementById('hud').style.display = 'flex';
  },
};
