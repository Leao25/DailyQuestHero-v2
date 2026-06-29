const Stars = {
  init() {
    for (let i = 0; i < 120; i++) {
      const el = document.createElement('div');
      el.className = 'star';
      const size = 1 + Math.random() * 2;
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        top:  ${Math.random() * 85}vh;
        width:  ${size}px;
        height: ${size}px;
        --dur:   ${2 + Math.random() * 4}s;
        --delay: ${-Math.random() * 5}s;
        --peak:  ${0.4 + Math.random() * 0.6};
      `;
      document.body.appendChild(el);
    }
  },
};

const Clouds = {
  _canvas: null,
  _ctx:    null,
  _clouds: [],
  _count:  12,

  init() {
    this._canvas = document.getElementById('cloud-canvas');
    this._ctx    = this._canvas.getContext('2d');
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._clouds = [];
    for (let i = 0; i < this._count; i++) {
      this._clouds.push(this._make(true));
    }
    this._loop();
  },

  _resize() {
    this._canvas.width  = window.innerWidth;
    this._canvas.height = window.innerHeight;
  },

  _make(randomX = false, forceBottom = false) {
    const W = this._canvas.width;
    const H = this._canvas.height;
    const bottom = forceBottom || Math.random() < 0.3;
    return {
      x:     randomX ? Math.random() * W : W + 200,
      y:     bottom
               ? H * 0.72 + Math.random() * H * 0.22
               : Math.random() * H * 0.55,
      speed: 0.12 + Math.random() * 0.16,
      scale: 0.6 + Math.random() * 1.0,
      alpha: 0.6 + Math.random() * 0.08,
    };
  },

  _drawCloud(ctx, x, y, scale) {
    const r = 18 * scale;
    ctx.beginPath();
    ctx.arc(x,           y,          r * 1.0, 0, Math.PI * 2);
    ctx.arc(x + r * 1.2, y - r * 0.3, r * 0.8, 0, Math.PI * 2);
    ctx.arc(x + r * 2.2, y,          r * 0.9, 0, Math.PI * 2);
    ctx.arc(x + r * 1.1, y + r * 0.4, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  },

  _loop() {
    const ctx = this._ctx;
    const W   = this._canvas.width;
    const H   = this._canvas.height;

    ctx.clearRect(0, 0, W, H);

    for (const c of this._clouds) {
      c.x -= c.speed;
      if (c.x < -300) Object.assign(c, this._make(false));

      ctx.save();
      ctx.globalAlpha = c.alpha;
      ctx.fillStyle   = '#ffffff';
      this._drawCloud(ctx, c.x, c.y, c.scale);
      ctx.restore();
    }

    requestAnimationFrame(() => this._loop());
  },
};
