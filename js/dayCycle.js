const DayCycle = {
  gameMinutesPerRealSecond: 4, // ciclo completo ~6min reais
  phase: 1,

  _gameMinutes:   4 * 60,
  _lastPeriod:    'morning',
  _bossSpawned:   false,
  _autoAdvanced:  false,
  onPeriodChange: null,

  init() {
    this._gameMinutes  = 4 * 60;
    this._lastPeriod   = 'morning';
    this._bossSpawned  = false;
    this._autoAdvanced = false;
    this.phase         = 1;
  },

  nextPhase() {
    this.phase++;
    this._gameMinutes  = 4 * 60;
    this._lastPeriod   = 'morning';
    this._bossSpawned  = false;
    this._autoAdvanced = false;
  },

  update(deltaMs) {
    this._gameMinutes += (deltaMs / 1000) * this.gameMinutesPerRealSecond * CONFIG.gameSpeed;
    this._gameMinutes  = this._gameMinutes % (24 * 60);

    const current = this.getPeriod();
    if (current !== this._lastPeriod) {
      this._lastPeriod = current;
      if (this.onPeriodChange) this.onPeriodChange(current);
    }
  },

  // retorna true UMA VEZ quando o relógio cruza 04:00 (fim da noite)
  shouldAutoAdvance() {
    if (this._autoAdvanced) return false;
    const h = this.getHour();
    if (this._lastPeriod === 'night' && (h >= 4 && h < 6)) {
      this._autoAdvanced = true;
      return true;
    }
    return false;
  },

  getHour() {
    return this._gameMinutes / 60;
  },

  // Manhã 04–12 | Tarde 12–20 | Noite 20–04
  getPeriod() {
    const h = this.getHour();
    if (h >= 4  && h < 12) return 'morning';
    if (h >= 12 && h < 20) return 'afternoon';
    return 'night';
  },

  getPeriodName() {
    return { morning: 'Manhã', afternoon: 'Tarde', night: 'Noite' }[this.getPeriod()];
  },

  getTimeString() {
    const totalMin = Math.floor(this._gameMinutes);
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  },

  getPeriodIcon() {
    return { morning: '🌅', afternoon: '☀️', night: '🌙' }[this.getPeriod()];
  },
};
