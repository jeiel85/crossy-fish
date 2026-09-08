// Fishdex - Fish Collection & Record Manager

export class Fishdex {
  constructor() {
    this.storageKey = 'crossy_angler_fishdex';
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (_) {}
  }

  recordCatch(species, sizeCm) {
    const id = species.id;
    const isNewSpecies = !this.data[id];
    let isNewRecord = false;

    if (isNewSpecies) {
      this.data[id] = {
        id: species.id,
        name: species.name,
        emoji: species.emoji,
        rarity: species.rarity,
        count: 1,
        maxSize: sizeCm,
        firstCaught: new Date().toLocaleDateString()
      };
      isNewRecord = true;
    } else {
      this.data[id].count++;
      if (sizeCm > this.data[id].maxSize) {
        this.data[id].maxSize = sizeCm;
        isNewRecord = true;
      }
    }

    this.save();
    return { isNewSpecies, isNewRecord, entry: this.data[id] };
  }

  getEntry(speciesId) {
    return this.data[speciesId] || null;
  }

  getTotalCaught() {
    return Object.values(this.data).reduce((sum, item) => sum + item.count, 0);
  }

  getUniqueSpeciesCount() {
    return Object.keys(this.data).length;
  }
}
