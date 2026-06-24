const WaveSystem = {
  phase:       1,   // fase atual (cresce infinitamente)
  wave:        1,   // onda atual dentro da fase
  totalWaves:  5,   // total de ondas nessa fase
  mobsLeft:    0,   // mobs restantes na onda atual
  mobsToSpawn: 0,   // mobs ainda para spawnar nessa onda
  bossWave:    false,
  state:       'spawning', // 'spawning' | 'waiting' | 'waveComplete' | 'bossSpawned'

  init() {
    this.phase      = 1;
    this.wave       = 1;
    this.totalWaves = this._calcTotalWaves(1);
    this._startWave();
  },

  _calcTotalWaves(phase) {
    return Math.min(
      CONFIG.waves.wavesBase + (phase - 1) * CONFIG.waves.wavesPerPhase,
      CONFIG.waves.wavesMax
    );
  },

  _calcMobsForWave() {
    return CONFIG.waves.mobsPerWave + (this.wave - 1) * CONFIG.waves.mobsGrowth;
  },

  _startWave() {
    const progress  = this.wave / this.totalWaves;
    this.bossWave   = progress > CONFIG.waves.afternoonUntil;
    this.mobsToSpawn = this._calcMobsForWave();
    this.mobsLeft    = this.mobsToSpawn;
    this.state       = 'spawning';
  },

  getPeriod() {
    const progress = this.wave / this.totalWaves;
    if (progress <= CONFIG.waves.morningUntil)   return 'morning';
    if (progress <= CONFIG.waves.afternoonUntil) return 'afternoon';
    return 'night';
  },

  // chamado quando um mob morre
  onMobDied(mobs) {
    this.mobsLeft = mobs.filter(m => m.state !== 'dead').length + this.mobsToSpawn;
    if (this.mobsLeft <= 0 && this.mobsToSpawn <= 0) {
      this.state = 'waveComplete';
    }
  },

  // chamado pelo game loop para saber se deve spawnar
  shouldSpawn() {
    return this.state === 'spawning' && this.mobsToSpawn > 0;
  },

  onSpawned() {
    this.mobsToSpawn--;
    if (this.mobsToSpawn <= 0) this.state = 'waiting';
  },

  // avança para próxima onda
  nextWave() {
    if (this.wave >= this.totalWaves) {
      // próxima fase
      this.phase++;
      this.wave       = 1;
      this.totalWaves = this._calcTotalWaves(this.phase);
    } else {
      this.wave++;
    }
    this._startWave();
  },

  getLabel() {
    return `Onda ${this.wave}/${this.totalWaves}  ·  Fase ${this.phase}`;
  },

  getPeriodIcon() {
    return { morning: '🌅', afternoon: '☀️', night: '🌙' }[this.getPeriod()];
  },
};
