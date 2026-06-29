const GameOver = {
  _autoEnabled: false,
  _autoTimer:   null,
  _runStart:    Date.now(),
  _mobsKilled:  0,

  init() {
    document.getElementById('hud-auto').addEventListener('click', () => this._toggleAuto());
    document.getElementById('go-restart').addEventListener('click', () => this._restart());
    this._runStart = Date.now();
  },

  onMobKilled() {
    this._mobsKilled++;
  },

  show() {
    const elapsed = Date.now() - this._runStart;
    const mins    = Math.floor(elapsed / 60000);
    const secs    = Math.floor((elapsed % 60000) / 1000);
    const timeStr = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

    document.getElementById('go-level').textContent = `Lv. ${Hero.level}`;
    document.getElementById('go-mobs').textContent  = this._mobsKilled;
    document.getElementById('go-gold').textContent  = `${Hero.gold}g`;
    document.getElementById('go-time').textContent  = timeStr;

    document.getElementById('gameover').classList.remove('hidden');

    if (this._autoEnabled) this._startAutoCountdown();
  },

  hide() {
    document.getElementById('gameover').classList.add('hidden');
    document.getElementById('go-auto-msg').classList.add('hidden');
    if (this._autoTimer) { clearInterval(this._autoTimer); this._autoTimer = null; }
  },

  _toggleAuto() {
    this._autoEnabled = !this._autoEnabled;
    document.getElementById('hud-auto').classList.toggle('active', this._autoEnabled);
  },

  _startAutoCountdown() {
    let remaining = 5;
    const msg = document.getElementById('go-auto-msg');
    msg.classList.remove('hidden');
    msg.textContent = `reiniciando em ${remaining}s...`;
    this._autoTimer = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        this._restart();
      } else {
        msg.textContent = `reiniciando em ${remaining}s...`;
      }
    }, 1000);
  },

  _restart() {
    this.hide();
    this._runStart   = Date.now();
    this._mobsKilled = 0;

    // reset hero
    Hero.hp      = Hero.maxHp;
    Hero.xp      = 0;
    Hero.xpNext  = CONFIG.hero.xpToLevelBase;
    Hero.level   = 1;
    Hero.maxHp   = CONFIG.hero.baseMaxHp;
    Hero.hp      = Hero.maxHp;
    Hero.gold    = 0;
    Hero._dead   = false;
    Hero._flashTimer = 0;
    Hero.state   = 'walking';
    Hero.worldX  = 0;

    MobSystem.reset();
    Combat.reset();
    Inventory.reset();
    ChestHud.reset();
    HUD.update();
  },
};
