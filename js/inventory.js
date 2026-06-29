const Inventory = {
  _items: {}, // { itemId: quantity }
  _slots: 18,

  reset() {
    this._items = {};
    this._render();
  },

  add(itemId) {
    this._items[itemId] = (this._items[itemId] || 0) + 1;
    this._render();
  },

  _render() {
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = '';

    const entries = Object.entries(this._items);
    const total   = Math.max(entries.length, 9);

    for (let i = 0; i < total; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';

      if (i < entries.length) {
        const [itemId, qty] = entries[i];
        const def = ITEMS[itemId];
        if (def) {
          slot.innerHTML = `
            <span>${def.icon}</span>
            <span class="inv-slot-qty">${qty}</span>
            <div class="inv-tooltip">${def.name}</div>
          `;
        }
      }

      grid.appendChild(slot);
    }
  },

  init() {
    this._render();
  },
};
