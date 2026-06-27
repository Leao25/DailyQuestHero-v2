const WaveSystem = {
  mobsToSpawn: 0,
  mobsLeft:    0,
  state:       'spawning', // 'spawning' | 'waiting'

  init() {
    DayCycle.init();
    this._startWave();
  },

  _mobsForPeriod() {
    const base = { morning: 3, afternoon: 5, night: 7 };
    return (base[DayCycle.getPeriod()] ?? 4) + Math.floor(DayCycle.phase / 2);
  },

  _startWave() {
    this.mobsToSpawn = this._mobsForPeriod();
    this.mobsLeft    = this.mobsToSpawn;
    this.state       = 'spawning';
  },

  onMobDied(mobs) {
    this.mobsLeft = mobs.filter(m => m.state !== 'dead' && !m.markedForRemoval).length
                  + this.mobsToSpawn;
    if (this.mobsLeft <= 0 && this.mobsToSpawn <= 0) {
      this.state = 'waiting';
    }
  },

  shouldSpawn() {
    return this.state === 'spawning' && this.mobsToSpawn > 0;
  },

  onSpawned() {
    this.mobsToSpawn--;
    if (this.mobsToSpawn <= 0) this.state = 'waiting';
  },

  nextWave() {
    this._startWave();
  },
};
