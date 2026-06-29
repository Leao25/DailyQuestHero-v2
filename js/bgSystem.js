const BgSystem = {

  _layers: {
    far:  { parallax: 0.05, minGap: 600,  maxGap: 1200, scale: 1.0, yAnchor: 'ground', pool: [] },
    mid:  { parallax: 0.18, minGap: 400,  maxGap: 900,  scale: 1.0, yAnchor: 'ground', pool: [] },
    near: { parallax: 0.35, minGap: 300,  maxGap: 700,  scale: 1.0, yAnchor: 'ground', pool: [] },
  },

  // sprites carregados: key -> HTMLImageElement
  _images: {},

  // instâncias ativas de cada camada: name -> [{ key, worldX }]
  _props: { far: [], mid: [], near: [] },
  _nextWorldX: { far: 0, mid: 0, near: 0 },


  // ─────────────────────────────────────────

  preload(assets) {
    // assets: { key: 'src/path.png', ... }
    for (const [key, src] of Object.entries(assets)) {
      if (this._images[key]) continue;
      const img = new Image();
      img.src = src;
      this._images[key] = img;
    }
  },

  // adiciona asset a uma camada: BgSystem.addToPool('mid', 'tree1', 1.0)
  addToPool(layerName, key, scale = 1.0) {
    const layer = this._layers[layerName];
    if (!layer) return;
    layer.pool.push({ key, scale });
  },

  reset() {
    for (const name of Object.keys(this._props)) {
      this._props[name]   = [];
      this._nextWorldX[name] = this._layers[name].minGap;
    }
  },

  // ─────────────────────────────────────────

  update(heroWorldX) {
    for (const [name, layer] of Object.entries(this._layers)) {
      if (layer.pool.length === 0) continue;
      this._spawnProps(name, layer, heroWorldX);
      this._cullProps(name, layer, heroWorldX);
    }
  },

  _spawnProps(name, layer, heroWorldX) {
    while (heroWorldX + 800 > this._nextWorldX[name]) {
      const def = layer.pool[Math.floor(Math.random() * layer.pool.length)];
      this._props[name].push({
        key:    def.key,
        scale:  def.scale,
        worldX: this._nextWorldX[name],
      });
      const gap = layer.minGap + Math.random() * (layer.maxGap - layer.minGap);
      this._nextWorldX[name] += gap;
    }
  },

  _cullProps(name, layer, heroWorldX) {
    const CW = CONFIG.canvas.width;
    this._props[name] = this._props[name].filter(p => {
      const sx = p.worldX - heroWorldX * layer.parallax;
      return sx > -300 && sx < CW + 300;
    });
  },

  // ─────────────────────────────────────────

  draw(ctx, heroWorldX) {
    const CW = CONFIG.canvas.width;
    const CH = CONFIG.canvas.height;
    const GY = CONFIG.canvas.groundY;

    this._drawGround(ctx, heroWorldX, CW, CH, GY);

    for (const name of ['far', 'mid', 'near']) {
      this._drawLayer(ctx, name, heroWorldX, GY, CW);
    }

  },

  _drawLayer(ctx, name, heroWorldX, GY, CW) {
    const layer = this._layers[name];
    for (const prop of this._props[name]) {
      const img = this._images[prop.key];
      if (!img?.complete || !img.naturalWidth) continue;
      const dw = Math.round(img.naturalWidth  * prop.scale);
      const dh = Math.round(img.naturalHeight * prop.scale);
      const sx = Math.round(prop.worldX - heroWorldX * layer.parallax);
      if (sx > CW + dw || sx < -dw) continue;
      ctx.drawImage(img, sx - dw / 2, GY - dh, dw, dh);
    }
  },

  _groundImg: null,

  loadGround(src) {
    const img = new Image();
    img.src = src;
    this._groundImg = img;
  },

  _drawGround(ctx, heroWorldX, CW, CH, GY) {
    const img = this._groundImg;
    if (!img?.complete || !img.naturalWidth) {
      ctx.fillStyle = '#2d1f0e';
      ctx.fillRect(0, GY, CW, CH - GY);
      return;
    }
    const dw     = 147;
    const dh     = 38;
    const dy     = 150;
    const srcH   = Math.round(img.naturalHeight * 0.73);
    const srcY   = img.naturalHeight - srcH;
    const offset = Math.floor(heroWorldX * 0.3) % dw;
    for (let i = -1; i < Math.ceil(CW / dw) + 1; i++) {
      ctx.drawImage(img, 0, srcY, img.naturalWidth, srcH, Math.round(i * dw - offset), dy, dw + 1, dh);
    }
  },
};
