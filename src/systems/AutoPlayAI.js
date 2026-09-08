export class AutoPlayAI {
  constructor(game) {
    this.game = game;
    this.isEnabled = false;
    this.thinkTimer = 0;
    this.thinkInterval = 0.28; // Action decision frequency
    this.fishChance = 0.45;
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.thinkTimer = 0;
    return this.isEnabled;
  }

  setEnabled(val) {
    this.isEnabled = val;
    this.thinkTimer = 0;
  }

  update(dt) {
    if (!this.isEnabled) return;
    const player = this.game.player;
    if (player.state === 'DEAD') return;

    // 1. Instant Reaction to Fish Bite
    if (player.state === 'BITING') {
      player.reelIn();
      this.thinkTimer = 0.4;
      return;
    }

    if (player.isHopping) return;

    // If already waiting for fish bite, let it fish
    if (player.state === 'CASTING') {
      // If we've been waiting too long or log is drifting away, cancel
      if (player.currentPlatform && Math.abs(player.mesh.position.x) > 6.5) {
        player.cancelFishing();
      } else {
        return;
      }
    }

    this.thinkTimer -= dt;
    if (this.thinkTimer > 0) return;
    this.thinkTimer = this.thinkInterval;

    // 2. Decide Move or Fish
    this.decideNextAction(player);
  }

  decideNextAction(player) {
    const currX = player.gridX;
    const currZ = player.gridZ;
    const world = this.game.worldManager;

    // If currently on moving platform nearing danger boundary, must jump!
    const isEdgePanic = player.currentPlatform && (
      (player.currentPlatform.speed > 0 && player.mesh.position.x > 5.5) ||
      (player.currentPlatform.speed < 0 && player.mesh.position.x < -5.5)
    );

    // Evaluate Candidate Moves: Forward, Left, Right
    const candidates = [
      { dirX: 0, dirZ: 1, score: 100, reason: 'forward' },
      { dirX: -1, dirZ: 0, score: 30, reason: 'left' },
      { dirX: 1, dirZ: 0, score: 30, reason: 'right' }
    ];

    // Check if we should fish first
    if (!isEdgePanic && player.state === 'IDLE' && Math.random() < this.fishChance) {
      const aheadLane = world.getLane(currZ + 1);
      const currLane = world.getLane(currZ);
      const hasWaterNear = (aheadLane && aheadLane.type === 'water') || (currLane && currLane.type === 'water');
      if (hasWaterNear) {
        player.startFishing();
        this.thinkTimer = 0.5;
        return;
      }
    }

    // Rank candidate moves by safety
    let bestMove = null;
    let bestScore = -9999;

    for (const move of candidates) {
      const targetX = currX + move.dirX;
      const targetZ = currZ + move.dirZ;

      // Lateral bounds
      if (Math.abs(targetX) > 7) continue;

      // Static obstacles (trees/rocks)
      if (world.hasStaticObstacle(targetX, targetZ)) continue;

      const targetLane = world.getLane(targetZ);
      if (!targetLane) continue;

      let safetyScore = move.score;

      if (targetLane.type === 'grass') {
        // Grass is always safe!
        safetyScore += 80;
      } else if (targetLane.type === 'water') {
        // Need to check if there is a log/pad at targetX
        const platform = targetLane.getPlatformAt(targetX);
        if (platform) {
          safetyScore += 60;
          // Prefer center of platform
          const distFromCenter = Math.abs(platform.mesh.position.x - targetX);
          safetyScore -= distFromCenter * 15;
        } else {
          // Dangerous water tile with no log!
          safetyScore = -999;
        }
      } else if (targetLane.type === 'boat_road') {
        // Rapids: check oncoming boats
        let isBoatHazard = false;
        for (const obs of targetLane.movingObstacles) {
          if (!obs.isHazard) continue;
          // Lookahead distance
          const dx = targetX - obs.mesh.position.x;
          // If boat is moving towards target tile and close
          if (obs.speed > 0 && dx > -1.5 && dx < 4.0) {
            isBoatHazard = true;
          } else if (obs.speed < 0 && dx < 1.5 && dx > -4.0) {
            isBoatHazard = true;
          }
        }

        if (isBoatHazard) {
          safetyScore = -800; // Danger: Wait or avoid!
        } else {
          safetyScore += 40;
        }
      }

      // Bonus for staying near center
      safetyScore -= Math.abs(targetX) * 4;

      if (safetyScore > bestScore) {
        bestScore = safetyScore;
        bestMove = move;
      }
    }

    // If forward is dangerous or safe score is too low, wait a bit
    if (bestMove && bestScore > 0) {
      player.hop(bestMove.dirX, bestMove.dirZ);
    } else {
      // Wait for opening or safe log
      this.thinkTimer = 0.15;
    }
  }
}
