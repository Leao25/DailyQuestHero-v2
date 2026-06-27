const BgSystem = {
  // Astros: desenhados em código (sem PNG)
  _astros: [
    { key: 'rising_sun', period: 'morning',   cx: 980, cy: 130, r: 45 },
    { key: 'sun',        period: 'afternoon', cx: 576, cy: 110, r: 45 },
    { key: 'moon',       period: 'night',     cx: 120, cy: 120, r: 45 },
  ],

  _layers: [
    { key: 'mountains', parallax: 0.08, y: 320, scale: 0.45, varyPeriod: true, phasePrefix: true },
  ],

  // nuvens procedurais: cada entrada define um grupo (cx, cy, r = raio base)
  // espalhados num sheet de 2304px que faz loop via _cloudOffset
  _cloudDefs: (() => {
    const sheet = 2304;
    const clouds = [];
    const positions = [
      [120,  75, 38], [380,  55, 52], [600, 200, 28], [850,  90, 45],
      [1050,240, 35], [1280, 70, 50], [1500,170, 42], [1700, 55, 32],
      [1900,220, 48], [2150,110, 36], [2350,190, 30],
    ];
    for (const [cx, cy, r] of positions) {
      clouds.push({ cx, cy, r });
    }
    return clouds;
  })(),

  _images: {},
  _period: null,
  _phase: null,
  _cloudOffset: 0,
  _scatter: { mid: [] },

  // config scatter por fase — pool de índices de árvore e densidade
  _scatterConfig: {
    1: { pool: [1, 2, 5], midCount: 7 },
  },

  // near props: assets individuais que aparecem sequencialmente com distância mínima variável
  _nearConfig: {
    minGap:  1800,   // distância mínima em world units entre props
    maxGap:  3600,   // distância máxima
    phases: {
      1: [
        { key: 'tree1_{period}',  scale: 0.35, yOffset: 68  },
        { key: 'house1_{period}', scale: 0.60, yOffset: 62  },
      ],
    },
  },
  _nearProps: [],      // props ativos: { imgKey, worldX, scale }
  _nextNearWorldX: 0, // worldX do herói onde o próximo prop será spawnado

  _initScatter(phase) {
    const cfg = this._scatterConfig[phase] ?? this._scatterConfig[1];
    const sheet = 2304;

    let seed = phase * 9301 + 49297;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

    const mid = [];
    const spacing = sheet / cfg.midCount;
    for (let i = 0; i < cfg.midCount; i++) {
      const treeIdx = cfg.pool[Math.floor(rand() * cfg.pool.length)];
      const wx = spacing * i + rand() * spacing * 0.7;
      mid.push({ treeIdx, wx, scale: 0.4 * (0.85 + rand() * 0.3) });
    }
    this._scatter.mid = mid;
  },

  update(deltaMs) {
    this._cloudOffset += 0.01 * CONFIG.gameSpeed * deltaMs;
  },

  preload(phase) {
    const periods = ['morning', 'afternoon', 'night'];

    periods.forEach(period => {
      this._layers.forEach(layer => {
        const p = layer.periodAlias?.[period] ?? period;
        const prefix = layer.phasePrefix ? `fase${phase}_` : '';
        const suffix = layer.varyPeriod ? `_${p}` : '';
        const key = `${prefix}${layer.key}${suffix}`;
        if (!this._images[key]) {
          const img = new Image();
          img.src = `assets/bg/${key}.png`;
          this._images[key] = img;
        }
      });

      // pré-carrega árvores do mid scatter
      const cfg = this._scatterConfig[phase] ?? this._scatterConfig[1];
      for (const idx of cfg.pool) {
        const key = `tree_${period}_${String(idx).padStart(2,'0')}`;
        if (!this._images[key]) {
          const img = new Image();
          img.src = `assets/bg/${key}.png`;
          this._images[key] = img;
        }
      }

      // pré-carrega near props
      const nearPool = this._nearConfig.phases[phase] ?? this._nearConfig.phases[1];
      for (const def of nearPool) {
        const key = def.key.replace('{period}', period);
        if (!this._images[key]) {
          const img = new Image();
          img.src = `assets/bg/${key}.png`;
          this._images[key] = img;
        }
      }
    });

    // pré-carrega chão por período
    periods.forEach(period => {
      const key = `fase${phase}_ground_${period}`;
      if (!this._images[key]) {
        const img = new Image();
        img.src = `assets/bg/${key}.png`;
        this._images[key] = img;
      }
    });

    this._initScatter(phase);
  },

  load(phase, period) {
    if (this._phase === phase && this._period === period) return;
    this._phase = phase;
    this._period = period;
    this._nearProps = [];
    this._nextNearWorldX = this._nearConfig.minGap;
    this.preload(phase);
  },

  draw(ctx, heroWorldX, CW, CH) {
    const period = this._period ?? 'night';
    const phase = this._phase ?? 1;
    const groundY = CONFIG.canvas.groundY;

    // 1. Céu gradiente (código)
    this._drawSky(ctx, period, CW, groundY);

    // 2. Estrelas — só à noite
    if (period === 'night') {
      this._drawStarsFallback(ctx, CW, groundY);
    }

    // 3. Astros (procedural)
    this._astros.forEach(a => {
      if (a.period !== period) return;
      this._drawAstro(ctx, a);
    });

    // 3b. Nuvens procedurais
    this._drawClouds(ctx, period, CW);

    // 4. Camadas de faixa + scatter intercalado
    this._layers.forEach(layer => {
      const p = layer.periodAlias?.[period] ?? period;
      const prefix = layer.phasePrefix ? `fase${phase}_` : '';
      const suffix = layer.varyPeriod ? `_${p}` : '';
      const key = `${prefix}${layer.key}${suffix}`;
      const img = this._images[key];

      if (img && img.complete && img.naturalWidth > 0) {
        const s = layer.scale ?? 1;
        const dw = Math.ceil(img.naturalWidth * s);
        const dh = Math.ceil(img.naturalHeight * s);
        const raw = heroWorldX * layer.parallax;
        const offset = Math.floor(raw % dw);
        const numTiles = Math.ceil(CW / dw) + 1;
        for (let i = 0; i < numTiles; i++) {
          ctx.drawImage(img, i * dw - offset, layer.y, dw + 1, dh);
        }
      } else {
        this._drawLayerFallback(ctx, layer, heroWorldX, CW, CH, period);
      }

      if (layer.key === 'mountains') this._drawScatter(ctx, 'mid', heroWorldX, period, CW, groundY);
    });

    // 5. Near props (sequenciais, aleatórios)
    this._updateNearProps(heroWorldX, period, phase);
    this._drawNearProps(ctx, heroWorldX, period, CW, groundY);

    // 6. Chão (código)
    this._drawGround(ctx, heroWorldX, period, CW, CH, groundY);
  },

  _drawSky(ctx, period, CW, groundY) {
    const grad = ctx.createLinearGradient(0, 0, 0, groundY);
    if (period === 'morning') {
      grad.addColorStop(0, '#1F4C85');
      grad.addColorStop(0.5, '#0C80BD');
      grad.addColorStop(0.82, '#85C8F3');
      grad.addColorStop(1, '#FFC88F');
    } else if (period === 'afternoon') {
      grad.addColorStop(0, '#252D6E');
      grad.addColorStop(0.45, '#6F5B96');
      grad.addColorStop(0.75, '#F08A7B');
      grad.addColorStop(1, '#FFA477');
    } else {
      grad.addColorStop(0, '#051648');
      grad.addColorStop(0.5, '#0A2062');
      grad.addColorStop(1, '#213D8F');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, groundY);
  },

  _drawStarsFallback(ctx, CW, groundY) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 60; i++) {
      ctx.fillRect(
        (i * 137 + 50) % CW,
        (i * 97 + 20) % (groundY - 80),
        1, 1
      );
    }
  },

  _drawAstro(ctx, a) {
    const t = Date.now() / 1000;
    const breathe = 1 + 0.12 * Math.sin(t * 1.2); // só no halo
    const r = a.r;
    const cx = a.cx;
    const cy = a.cy;

    ctx.save();

    if (a.key === 'moon') {
      // halo frio com breathing
      const hr = r * 2.4 * breathe;
      const halo = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, hr);
      halo.addColorStop(0, 'rgba(180,210,255,0.22)');
      halo.addColorStop(1, 'rgba(180,210,255,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, hr, 0, Math.PI * 2);
      ctx.fill();

      // lua cheia com gradiente
      const bodyGrad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 0, cx, cy, r);
      bodyGrad.addColorStop(0, '#f0f4ff');
      bodyGrad.addColorStop(0.5, '#c8d8f0');
      bodyGrad.addColorStop(1, '#8899bb');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

    } else if (a.key === 'rising_sun') {
      const hr = r * 3.0 * breathe;
      const halo = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, hr);
      halo.addColorStop(0, 'rgba(255,240,100,0.4)');
      halo.addColorStop(0.4, 'rgba(255,200,50,0.15)');
      halo.addColorStop(1, 'rgba(255,180,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, hr, 0, Math.PI * 2);
      ctx.fill();

      // corpo
      const bodyGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.3, '#fff176');
      bodyGrad.addColorStop(0.8, '#ffc107');
      bodyGrad.addColorStop(1, '#ff8f00');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

    } else {

      // halo avermelhado com breathing
      const hr = r * 2.8 * breathe;
      const halo = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, hr);
      halo.addColorStop(0, 'rgba(255,120,30,0.35)');
      halo.addColorStop(0.5, 'rgba(255,80,10,0.12)');
      halo.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, hr, 0, Math.PI * 2);
      ctx.fill();

      // corpo
      const bodyGrad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
      bodyGrad.addColorStop(0, '#fff0a0');
      bodyGrad.addColorStop(0.4, '#ffaa30');
      bodyGrad.addColorStop(1, '#cc4400');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  _drawClouds(ctx, period, CW) {
    const sheet = 2304;
    const offset = this._cloudOffset % sheet;

    const colors = {
      morning:   { fill: 'rgba(255,255,255,0.92)', shadow: 'rgba(180,200,220,0.6)' },
      afternoon: { fill: 'rgba(255,230,200,0.88)', shadow: 'rgba(200,150,120,0.5)' },
      night:     { fill: 'rgba(160,175,210,0.55)', shadow: 'rgba(80,100,150,0.4)'  },
    };
    const col = colors[period] ?? colors.morning;

    const drawCloud = (cx, cy, r) => {
      const puffs = [
        { dx: 0,        dy: 0,    sr: r       },
        { dx: -r * 0.6, dy: r * 0.15, sr: r * 0.7 },
        { dx:  r * 0.6, dy: r * 0.15, sr: r * 0.7 },
        { dx: -r * 0.25,dy: r * 0.3,  sr: r * 0.55},
        { dx:  r * 0.25,dy: r * 0.3,  sr: r * 0.55},
      ];

      ctx.save();
      ctx.beginPath();
      for (const p of puffs) {
        ctx.moveTo(cx + p.dx + p.sr, cy + p.dy);
        ctx.arc(cx + p.dx, cy + p.dy, p.sr, 0, Math.PI * 2);
      }
      ctx.fillStyle = col.shadow;
      ctx.fill();

      ctx.beginPath();
      for (const p of puffs) {
        ctx.moveTo(cx + p.dx + p.sr, cy + p.dy - p.sr * 0.15);
        ctx.arc(cx + p.dx, cy + p.dy - p.sr * 0.15, p.sr * 0.88, 0, Math.PI * 2);
      }
      ctx.fillStyle = col.fill;
      ctx.fill();
      ctx.restore();
    };

    for (const c of this._cloudDefs) {
      // tila o sheet duas vezes para cobrir o canvas sem gap
      for (let t = 0; t < 2; t++) {
        const x = c.cx - offset + t * sheet;
        if (x + c.r * 2 < 0 || x - c.r * 2 > CW) continue;
        drawCloud(x, c.cy, c.r);
      }
    }
  },

  _updateNearProps(heroWorldX, period, phase) {
    const parallax = 0.35;
    const { minGap, maxGap } = this._nearConfig;
    const pool = this._nearConfig.phases[phase] ?? this._nearConfig.phases[1];

    // spawn: quando o herói avança além do próximo worldX de spawn
    if (heroWorldX >= this._nextNearWorldX) {
      const def = pool[Math.floor(Math.random() * pool.length)];
      const imgKey = def.key.replace('{period}', period);
      // posição em screen space no lado direito, convertida para world space do parallax
      const propWorldX = heroWorldX * parallax + 1600;
      this._nearProps.push({ imgKey, worldX: propWorldX, scale: def.scale, yOffset: def.yOffset ?? 0 });
      this._nextNearWorldX = heroWorldX + minGap + Math.random() * (maxGap - minGap);
    }

    // remove props que saíram pela esquerda
    this._nearProps = this._nearProps.filter(p => p.worldX - heroWorldX * parallax > -400);
  },

  _drawNearProps(ctx, heroWorldX, period, CW, groundY) {
    const parallax = 0.35;
    for (const prop of this._nearProps) {
      const img = this._images[prop.imgKey];
      if (!img || !img.complete || !img.naturalWidth) continue;
      const dw = Math.round(img.naturalWidth  * prop.scale);
      const dh = Math.round(img.naturalHeight * prop.scale);
      const screenX = prop.worldX - heroWorldX * parallax;
      if (screenX > CW + dw || screenX < -dw) continue;
      ctx.drawImage(img, screenX - dw / 2, groundY - dh + (prop.yOffset ?? 0), dw, dh);
    }
  },

  _drawScatter(ctx, layerKey, heroWorldX, period, CW, groundY) {
    const parallax = layerKey === 'mid' ? 0.25 : 0.55;
    const sheet    = 2304;
    const objects  = this._scatter[layerKey];
    if (!objects || objects.length === 0) return;

    for (const obj of objects) {
      const key = `tree_${period}_${String(obj.treeIdx).padStart(2, '0')}`;
      const img = this._images[key];
      if (!img || !img.complete || !img.naturalWidth) continue;

      const dw = Math.round(img.naturalWidth  * obj.scale);
      const dh = Math.round(img.naturalHeight * obj.scale);

      for (let t = 0; t < 2; t++) {
        const rawX = obj.wx + t * sheet - heroWorldX * parallax;
        const x    = ((rawX % sheet) + sheet) % sheet - dw;
        if (x > CW + dw || x < -dw * 2) continue;
        const y = groundY - dh + 10;
        ctx.drawImage(img, x, y, dw, dh);
      }
    }
  },

  _drawGround(ctx, heroWorldX, period, CW, CH, groundY) {
    ctx.fillStyle = '#16162a';
    ctx.fillRect(0, groundY, CW, CH - groundY);

    const img = this._images[`fase${this._phase}_ground_${period}`];
    if (img && img.complete && img.naturalWidth > 0) {
      const srcY  = 67;
      const srcH  = img.naturalHeight - srcY;
      const srcW  = img.naturalWidth;
      const destY = groundY - 4;
      const destH = CH - destY;
      // escala proporcional: mantém aspect ratio
      const scale = destH / srcH;
      const dw     = Math.ceil(srcW * scale);
      const offset = Math.floor(heroWorldX % dw);
      const numTiles = Math.ceil(CW / dw) + 1;
      for (let i = 0; i < numTiles; i++) {
        ctx.drawImage(img, 0, srcY, srcW, srcH, i * dw - offset, destY, dw + 1, destH);
      }
    }
  },

  _drawLayerFallback(ctx, layer, heroWorldX, CW, CH, period) {
    const groundY = CONFIG.canvas.groundY;

    if (layer.key === 'mountains') {
      ctx.fillStyle = period === 'night' ? '#0d0d1f' : '#1a1a3a';
      [[0, 420, 200, 200], [180, 380, 240, 268], [400, 400, 200, 248],
      [560, 360, 260, 288], [780, 390, 220, 258], [960, 410, 200, 238]]
        .forEach(([x, y, w, h]) => {
          const ox = ((x - heroWorldX * layer.parallax) % (CW + 400) + CW + 400) % (CW + 400) - 200;
          ctx.fillRect(ox, y, w, h);
        });
    }

  },
};
