// Auto-Fishing AI Bot for Crossy Angler

export class AutoPlayAI {
  constructor(game) {
    this.game = game;
    this.isEnabled = false;
    this.timer = 0;
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.timer = 0;
    return this.isEnabled;
  }

  update(dt) {
    if (!this.isEnabled) return;
    const mechanic = this.game.fishingMechanic;
    if (!mechanic) return;

    // 1. If Idle: Cast towards a swimming fish
    if (mechanic.state === 'IDLE') {
      this.timer += dt;
      if (this.timer > 0.8) {
        this.timer = 0;
        const fishList = this.game.currentSpot?.fishList;
        if (fishList && fishList.length > 0) {
          const targetFish = fishList[Math.floor(Math.random() * fishList.length)];
          mechanic.castTo(targetFish.x, targetFish.z);
        } else {
          mechanic.castDefault();
        }
      }
    }

    // 2. If Strike Window: Hook immediately!
    else if (mechanic.state === 'STRIKE_WINDOW') {
      mechanic.hook();
    }

    // 3. If Reeling: Intelligently keep tension in the Sweet Spot (35% to 75%)
    else if (mechanic.state === 'REELING') {
      const tension = mechanic.tension;
      // Target around 55%
      if (tension < 52) {
        mechanic.setReeling(true);
      } else if (tension > 62) {
        mechanic.setReeling(false);
      }
    }
  }
}
