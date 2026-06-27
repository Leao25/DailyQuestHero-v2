const BgSystem = {
  _astros: [
    { key: 'rising_sun', period: 'morning',   cx: 980, cy: 130, r: 45 },
    { key: 'sun',        period: 'afternoon', cx: 576, cy: 110, r: 45 },
    { key: 'moon',       period: 'night',     cx: 120, cy: 120, r: 45 },
  ],

  _layers: [
    { key: 'mountains', parallax: 0.08, y: 320, scale: 0.45, varyPeriod: true, phasePrefix: true },
  ],

  _cloudDefs: (() => {
    const clouds = [];
    for (const [cx, cy, r] of [
      [120,  75, 38], [380,  55, 52], [600, 200, 28], [850,  90, 45],
      [1050,240, 35], [1280, 70, 50], [1500,170, 42], [1700, 55, 32],
      [1900,220, 48], [2150,110, 36], [2350,190, 30],
    ]) clouds.push({ cx, cy, r });
    return clouds;
  })(),

  _images: {},
  _period: null,
  _phase:  null,
  _cloudOffset: 0,

  // ── Props mid e near ─────────────────────────────────────────────
  // Cada camada tem: parallax, minGap, maxGap, e pool por fase
  // Pool vazio = camada inativa. Adicionar: { key: 'nome_{period}', scale: 0.5, yOffset: 60 }
  _propLayers: {
    mid: {
      parallax: 0.18,
      minGap:   1200,
      maxGap:   2800,
      phases: { 1: [] },
    },
    near: {
      parallax: 0.35,
      minGap:   2500,
      maxGap:   5000,
      phases: { 1: [] },
    },
  },
  _props: { mid: [], near: [] },
  _nextPropWorldX: { mid: 0, near: 0 },

  // ────────────────────────────────────────────────────────────────

  update(deltaMs) {
    this._cloudOffset += 0.01 * CONFIG.gameSpeed * deltaMs;
  },

  preload(phase) {
    const periods = ['morning', 'afternoon', 'night'];

    // camadas tiled (montanhas)
    periods.forEach(period => {
      this._layers.forEach(layer => {
        const p   = layer.periodAlias?.[period] ?? period;
        const pre = layer.phasePrefix ? `fase${phase}_` : '';
        const suf = layer.varyPeriod  ? `_${p}` : '';
        const key = `${pre}${layer.key}${suf}`;
        if (!this._images[key]) {
          const img = new Image();
          img.src = `assets/bg/${key}.png`;
          this._images[key] = img;
        }
      });
    });

    // props mid e near
    periods.forEach(period => {
      for (const cfg of Object.values(this._propLayers)) {
        const pool = cfg.phases[phase] ?? cfg.phases[1] ?? [];
        for (const def of pool) {
          const key = def.key.replace('{period}', period);
          if (!this._images[key]) {
            const img = new Image();
            img.src = `assets/bg/${key}.png`;
            this._images[key] = img;
          }
        }
      }
    });

    // chão
    periods.forEach(period => {
      const key = `fase${phase}_ground_${period}`;
      if (!this._images[key]) {
        const img = new Image();
        img.src = `assets/bg/${key}.png`;
        this._images[key] = img;
      }
    });
  },

  load(phase, period) {
    if (this._phase === phase && this._period === period) return;
    const phaseChanged = this._phase !== phase;
    this._phase  = phase;
    this._period = period;
    if (phaseChanged) {
      for (const name of ['mid', 'near']) {
        this._props[name] = [];
        this._nextPropWorldX[name] = this._propLayers[name].minGap;
      }
    }
    this.preload(phase);
  },

  draw(ctx, heroWorldX, CW, CH) {
    const period = this._period ?? 'night';
    const phase  = this._phase  ?? 1;
    const groundY = CONFIG.canvas.groundY;

    this._drawSky(ctx, period, CW, groundY);

    if (period === 'night') this._drawStars(ctx, CW, groundY);

    this._astros.forEach(a => {
      if (a.period === period) this._drawAstro(ctx, a);
    });

    this._drawClouds(ctx, period, CW);

    // camadas tiled (montanhas) — depois das nuvens, antes do mid
    this._layers.forEach(layer => {
      const p   = layer.periodAlias?.[period] ?? period;
      const pre = layer.phasePrefix ? `fase${phase}_` : '';
      const suf = layer.varyPeriod  ? `_${p}` : '';
      const key = `${pre}${layer.key}${suf}`;
      const img = this._images[key];
      if (img?.complete && img.naturalWidth > 0) {
        const s  = layer.scale ?? 1;
        const dw = Math.ceil(img.naturalWidth * s);
        const dh = Math.ceil(img.naturalHeight * s);
        const offset = Math.floor(heroWorldX * layer.parallax % dw);
        for (let i = 0; i < Math.ceil(CW / dw) + 1; i++)
          ctx.drawImage(img, i * dw - offset, layer.y, dw + 1, dh);
      } else {
        this._drawLayerFallback(ctx, layer, heroWorldX, CW, CH, period);
      }
    });

    // props mid (entre montanhas e near)
    this._updateProps('mid', heroWorldX, phase);
    this._drawProps(ctx, 'mid', heroWorldX, period, CW, groundY);

    // props near (entre mid e chão)
    this._updateProps('near', heroWorldX, phase);
    this._drawProps(ctx, 'near', heroWorldX, period, CW, groundY);

    this._drawGround(ctx, heroWorldX, period, CW, CH, groundY);
  },

  _updateProps(name, heroWorldX, phase) {
    const cfg = this._propLayers[name];
    const pool = cfg.phases[phase] ?? cfg.phases[1] ?? [];
    if (pool.length === 0) return;

    if (heroWorldX >= this._nextPropWorldX[name]) {
      const def = pool[Math.floor(Math.random() * pool.length)];
      const worldX = heroWorldX * cfg.parallax + 1600;
      this._props[name].push({ keyTemplate: def.key, worldX, scale: def.scale, yOffset: def.yOffset ?? 0 });
      this._nextPropWorldX[name] = heroWorldX + cfg.minGap + Math.random() * (cfg.maxGap - cfg.minGap);
    }

    this._props[name] = this._props[name].filter(p => p.worldX - heroWorldX * cfg.parallax > -400);
  },

  _drawProps(ctx, name, heroWorldX, period, CW, groundY) {
    const parallax = this._propLayers[name].parallax;
    for (const prop of this._props[name]) {
      const img = this._images[prop.keyTemplate.replace('{period}', period)];
      if (!img?.complete || !img.naturalWidth) continue;
      const dw = Math.round(img.naturalWidth  * prop.scale);
      const dh = Math.round(img.naturalHeight * prop.scale);
      const sx = prop.worldX - heroWorldX * parallax;
      if (sx > CW + dw || sx < -dw) continue;
      ctx.drawImage(img, sx - dw / 2, groundY - dh + prop.yOffset, dw, dh);
    }
  },

  _drawSky(ctx, period, CW, groundY) {
    const grad = ctx.createLinearGradient(0, 0, 0, groundY);
    if (period === 'morning') {
      grad.addColorStop(0,    '#1F4C85');
      grad.addColorStop(0.5,  '#0C80BD');
      grad.addColorStop(0.82, '#85C8F3');
      grad.addColorStop(1,    '#FFC88F');
    } else if (period === 'afternoon') {
      grad.addColorStop(0,    '#252D6E');
      grad.addColorStop(0.45, '#6F5B96');
      grad.addColorStop(0.75, '#F08A7B');
      grad.addColorStop(1,    '#FFA477');
    } else {
      grad.addColorStop(0,   '#051648');
      grad.addColorStop(0.5, '#0A2062');
      grad.addColorStop(1,   '#213D8F');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, groundY);
  },

  _drawStars(ctx, CW, groundY) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 60; i++)
      ctx.fillRect((i * 137 + 50) % CW, (i * 97 + 20) % (groundY - 80), 1, 1);
  },

  _drawAstro(ctx, a) {
    const breathe = 1 + 0.12 * Math.sin(Date.now() / 1000 * 1.2);
    const { r, cx, cy } = a;
    ctx.save();

    if (a.key === 'moon') {
      const hr = r * 2.4 * breathe;
      const halo = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, hr);
      halo.addColorStop(0, 'rgba(180,210,255,0.22)');
      halo.addColorStop(1, 'rgba(180,210,255,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, hr, 0, Math.PI * 2); ctx.fill();
      const body = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 0, cx, cy, r);
      body.addColorStop(0, '#f0f4ff'); body.addColorStop(0.5, '#c8d8f0'); body.addColorStop(1, '#8899bb');
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    } else if (a.key === 'rising_sun') {
      const hr = r * 3.0 * breathe;
      const halo = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, hr);
      halo.addColorStop(0, 'rgba(255,240,100,0.4)'); halo.addColorStop(0.4, 'rgba(255,200,50,0.15)'); halo.addColorStop(1, 'rgba(255,180,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, hr, 0, Math.PI * 2); ctx.fill();
      const body = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      body.addColorStop(0, '#ffffff'); body.addColorStop(0.3, '#fff176'); body.addColorStop(0.8, '#ffc107'); body.addColorStop(1, '#ff8f00');
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    } else {
      const hr = r * 2.8 * breathe;
      const halo = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, hr);
      halo.addColorStop(0, 'rgba(255,120,30,0.35)'); halo.addColorStop(0.5, 'rgba(255,80,10,0.12)'); halo.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, hr, 0, Math.PI * 2); ctx.fill();
      const body = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
      body.addColorStop(0, '#fff0a0'); body.addColorStop(0.4, '#ffaa30'); body.addColorStop(1, '#cc4400');
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  },

  _drawClouds(ctx, period, CW) {
    const sheet  = 2304;
    const offset = this._cloudOffset % sheet;
    const colors = {
      morning:   { fill: 'rgba(255,255,255,0.92)', shadow: 'rgba(180,200,220,0.6)' },
      afternoon: { fill: 'rgba(255,230,200,0.88)', shadow: 'rgba(200,150,120,0.5)' },
      night:     { fill: 'rgba(160,175,210,0.55)', shadow: 'rgba(80,100,150,0.4)'  },
    };
    const col = colors[period] ?? colors.morning;

    const drawCloud = (cx, cy, r) => {
      const puffs = [
        { dx: 0,         dy: 0,        sr: r       },
        { dx: -r * 0.6,  dy: r * 0.15, sr: r * 0.7  },
        { dx:  r * 0.6,  dy: r * 0.15, sr: r * 0.7  },
        { dx: -r * 0.25, dy: r * 0.3,  sr: r * 0.55 },
        { dx:  r * 0.25, dy: r * 0.3,  sr: r * 0.55 },
      ];
      ctx.save();
      ctx.beginPath();
      for (const p of puffs) { ctx.moveTo(cx + p.dx + p.sr, cy + p.dy); ctx.arc(cx + p.dx, cy + p.dy, p.sr, 0, Math.PI * 2); }
      ctx.fillStyle = col.shadow; ctx.fill();
      ctx.beginPath();
      for (const p of puffs) { ctx.moveTo(cx + p.dx + p.sr, cy + p.dy - p.sr * 0.15); ctx.arc(cx + p.dx, cy + p.dy - p.sr * 0.15, p.sr * 0.88, 0, Math.PI * 2); }
      ctx.fillStyle = col.fill; ctx.fill();
      ctx.restore();
    };

    for (const c of this._cloudDefs) {
      for (let t = 0; t < 2; t++) {
        const x = c.cx - offset + t * sheet;
        if (x + c.r * 2 < 0 || x - c.r * 2 > CW) continue;
        drawCloud(x, c.cy, c.r);
      }
    }
  },

  _drawGround(ctx, heroWorldX, period, CW, CH, groundY) {
    ctx.fillStyle = '#16162a';
    ctx.fillRect(0, groundY, CW, CH - groundY);
    const img = this._images[`fase${this._phase}_ground_${period}`];
    if (img?.complete && img.naturalWidth > 0) {
      const srcY  = 67;
      const srcH  = img.naturalHeight - srcY;
      const dh    = CH - (groundY - 4);
      const dw    = Math.ceil(img.naturalWidth * (dh / srcH));
      const offset = Math.floor(heroWorldX % dw);
      for (let i = 0; i < Math.ceil(CW / dw) + 1; i++)
        ctx.drawImage(img, 0, srcY, img.naturalWidth, srcH, i * dw - offset, groundY - 4, dw + 1, dh);
    }
  },

  _drawLayerFallback(ctx, layer, heroWorldX, CW, CH, period) {
    const groundY = CONFIG.canvas.groundY;
    if (layer.key === 'mountains') {
      ctx.fillStyle = period === 'night' ? '#0d0d1f' : '#1a1a3a';
      for (const [x, y, w, h] of [[0,420,200,200],[180,380,240,268],[400,400,200,248],[560,360,260,288],[780,390,220,258],[960,410,200,238]]) {
        const ox = ((x - heroWorldX * layer.parallax) % (CW + 400) + CW + 400) % (CW + 400) - 200;
        ctx.fillRect(ox, y, w, h);
      }
    }
  },
};
