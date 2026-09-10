import { overlaps } from "./aabb";
import { endClimb } from "./climb";
import type { Level } from "./level";
import { P, PLAYER_H, PLAYER_W } from "./params";
import type { Player } from "./player";

function body(player: Player) {
  return { x: player.x, y: player.y, w: PLAYER_W, h: PLAYER_H };
}

export function needsRefill(player: Player): boolean {
  return player.dashes < 1 || player.stamina < P.climbTired;
}

export function refillDashAndStamina(player: Player) {
  player.dashes = P.maxDashes;
  player.stamina = P.climbMaxStamina;
}

export function consumeCrystal(player: Player, level: Level) {
  const rect = body(player);
  for (const crystal of level.crystals) {
    if (crystal.cooldown > 0) continue;
    if (!overlaps(rect, crystal)) continue;
    if (!needsRefill(player)) continue;
    refillDashAndStamina(player);
    crystal.cooldown = P.crystalCooldown;
    return;
  }
}

export function bounceSpring(player: Player, level: Level) {
  if (player.vy < 0) return;
  const rect = body(player);
  for (const spring of level.springs) {
    if (!overlaps(rect, spring)) continue;
    player.dashing = false;
    player.dashTime = 0;
    player.dashLaunch = false;
    player.dashFreeze = 0;
    player.vx = 0;
    player.vy = P.springVelocity;
    player.varJumpSpeed = P.springVelocity;
    player.jumpTimer = P.varJumpTime;
    player.autoJump = true;
    player.onGround = false;
    player.coyote = 0;
    refillDashAndStamina(player);
    endClimb(player);
    return;
  }
}

export function tickCrystals(level: Level, dt: number) {
  for (const crystal of level.crystals) {
    if (crystal.cooldown > 0) crystal.cooldown = Math.max(0, crystal.cooldown - dt);
  }
}

export function stepPickups(player: Player, level: Level, dt: number) {
  tickCrystals(level, dt);
  consumeCrystal(player, level);
  bounceSpring(player, level);
}
