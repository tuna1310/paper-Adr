import { Player } from './Player';
import { GridMap } from './GridMap';
import { CollisionEvent } from './types';
import { GAME_CONFIG } from '../config';

export function distToSegmentSquared(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) {
    const dx = px - x1;
    const dy = py - y1;
    return dx * dx + dy * dy;
  }
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  const dx = px - projX;
  const dy = py - projY;
  return dx * dx + dy * dy;
}

export class CollisionDetector {
  checkCollisions(players: Player[], grid: GridMap): CollisionEvent[] {
    const events: CollisionEvent[] = [];
    const alivePlayers = players.filter(p => p.status === 'alive');
    const eliminated = new Set<number>();

    // 1. Starvation: Player losing all territory is eliminated
    for (const p of alivePlayers) {
      if (grid.countCells(p.id) <= 0) {
        eliminated.add(p.id);
        events.push({
          type: 'starvation',
          victimId: p.id,
          location: { x: p.x, y: p.y }
        });
      }
    }

    // 2. Damage Aura Kills (Rule 5)
    for (const attacker of alivePlayers) {
      if (eliminated.has(attacker.id) || !attacker.damageAura.active) continue;

      const auraRadius = attacker.damageAura.radius + GAME_CONFIG.CHARACTER_RADIUS;
      const auraRadiusSq = auraRadius * auraRadius;

      for (const victim of alivePlayers) {
        if (victim.id === attacker.id || eliminated.has(victim.id)) continue;

        const dx = victim.x - attacker.x;
        const dy = victim.y - attacker.y;
        if (dx * dx + dy * dy <= auraRadiusSq) {
          eliminated.add(victim.id);
          events.push({
            type: 'damage_aura_kill',
            victimId: victim.id,
            killerId: attacker.id,
            location: { x: victim.x, y: victim.y }
          });
        }
      }
    }

    // 3. Head-on Collisions: Soft bounce knockback, neither dies (Rule 3)
    const headOnThreshold = GAME_CONFIG.CHARACTER_RADIUS * 2;
    const headOnThresholdSq = headOnThreshold * headOnThreshold;

    for (let i = 0; i < alivePlayers.length; i++) {
      const p1 = alivePlayers[i];
      if (eliminated.has(p1.id)) continue;

      for (let j = i + 1; j < alivePlayers.length; j++) {
        const p2 = alivePlayers[j];
        if (eliminated.has(p2.id)) continue;

        const hdx = p1.x - p2.x;
        const hdy = p1.y - p2.y;
        const distSq = hdx * hdx + hdy * hdy;

        if (distSq <= headOnThresholdSq && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const nx = hdx / dist;
          const ny = hdy / dist;

          // Apply soft knockback to both players in opposite directions
          p1.applyKnockback(nx, ny);
          p2.applyKnockback(-nx, -ny);

          events.push({
            type: 'head_on_bounce',
            victimId: p2.id,
            killerId: p1.id,
            location: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
          });
        }
      }
    }

    // 4. Head-to-Trail Collisions (Rule 1 & 2):
    // Self-trail collisions are COMPLETELY REMOVED (walking over own trail is safe).
    // Only heads of OTHER players can cut a trail.
    const hitRadius = GAME_CONFIG.CHARACTER_RADIUS + GAME_CONFIG.TRAIL_WIDTH / 2;
    const hitRadiusSq = hitRadius * hitRadius;

    for (const attacker of alivePlayers) {
      if (eliminated.has(attacker.id)) continue;

      for (const target of alivePlayers) {
        // Disallow self-collision completely!
        if (target.id === attacker.id || eliminated.has(target.id) || target.spawnImmunityTimer > 0) continue;

        const pts = target.trail.points;
        if (pts.length < 2) continue;

        for (let s = 0; s < pts.length - 1; s++) {
          const p1 = pts[s];
          const p2 = pts[s + 1];

          const distSq = distToSegmentSquared(attacker.x, attacker.y, p1.x, p1.y, p2.x, p2.y);
          if (distSq <= hitRadiusSq) {
            eliminated.add(target.id);
            events.push({
              type: 'trail_kill',
              victimId: target.id,
              killerId: attacker.id,
              location: { x: attacker.x, y: attacker.y }
            });
            break;
          }
        }
      }
    }

    return events;
  }
}
