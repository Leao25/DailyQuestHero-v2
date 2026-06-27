const FloatingNumbers = {
  list: [],

  // type: 'damage_dealt' | 'damage_taken' | 'level_up'
  add(x, y, text, type) {
    const styles = {
      damage_dealt: { color: '#ffffff', size: 14 },
      damage_crit:  { color: '#f0c040', size: 20 },
      damage_taken: { color: '#e94560', size: 16 },
      level_up:     { color: '#f0c040', size: 18 },
      dodge:        { color: '#60c0ff', size: 13 },
    };
    const s = styles[type] ?? styles.damage_dealt;
    this.list.push({
      x, y,
      text: String(text),
      color: s.color,
      size:  s.size,
      vy:       -0.06,       // px por ms
      life:     1200,       // duração em ms
      maxLife:  1200,
    });
  },

  update(deltaMs) {
    this.list.forEach(n => {
      n.y    += n.vy * deltaMs;
      n.life -= deltaMs;
    });
    this.list = this.list.filter(n => n.life > 0);
  },

  draw(ctx) {
    this.list.forEach(n => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, n.life / n.maxLife);
      ctx.font        = `bold ${n.size}px 'Press Start 2P', monospace`;
      ctx.textAlign   = 'center';
      // sombra para legibilidade
      ctx.fillStyle   = 'rgba(0,0,0,0.7)';
      ctx.fillText(n.text, n.x + 1, n.y + 1);
      ctx.fillStyle   = n.color;
      ctx.fillText(n.text, n.x, n.y);
      ctx.restore();
    });
  },

  init() {
    this.list = [];
  },
};
