import { GameEngine } from '../engine/GameEngine';
import { GAME_CONFIG } from '../config';
import { TerritoryRenderer } from './TerritoryRenderer';
import { HudRenderer } from './HudRenderer';

export class GameRenderer {
  public static isPlayAgainClicked = HudRenderer.isPlayAgainClicked;
  public static isHomeClicked = HudRenderer.isHomeClicked;
  public static renderHUD = HudRenderer.renderHUD;

  public static renderWorld(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    viewWidth: number,
    viewHeight: number,
    camX: number,
    camY: number,
    zoom: number,
    now: number,
    playerColors: Map<number, string>
  ): void {
    // 0. Process recent captures & eliminations for particles
    for (const cap of engine.recentCaptures) {
      const owner = engine.allPlayers.find(pl => pl.id === cap.playerId);
      if (owner) {
        TerritoryRenderer.spawnCaptureSparkles(owner.x, owner.y, owner.color, 20);
      }
    }
    for (const ev of engine.recentEvents) {
      if (ev.type !== 'head_on_bounce' && ev.location) {
        const victim = engine.allPlayers.find(pl => pl.id === ev.victimId);
        if (victim) {
          TerritoryRenderer.spawnDeathExplosion(ev.location.x, ev.location.y, victim.color, victim.darkColor);
        }
      }
    }
    engine.recentCaptures.length = 0;
    engine.recentEvents.length = 0;

    // 1. Pastel Mint Paper Background with subtle grid texture
    ctx.fillStyle = GAME_CONFIG.BG_COLOR;
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    ctx.save();
    ctx.translate(viewWidth / 2, viewHeight / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-camX, -camY);

    // Subtle background dot grid on paper floor (batched rectangles for 60fps on mobile)
    const halfW = (viewWidth / 2) / zoom;
    const halfH = (viewHeight / 2) / zoom;
    const minViewX = camX - halfW - 90;
    const maxViewX = camX + halfW + 90;
    const minViewY = camY - halfH - 90;
    const maxViewY = camY + halfH + 90;
    const step = 60;
    const startX = Math.floor((camX - halfW) / step) * step;
    const endX = camX + halfW;
    const startY = Math.floor((camY - halfH) / step) * step;
    const endY = camY + halfH;
    ctx.fillStyle = 'rgba(128, 203, 196, 0.24)';
    for (let gx = startX; gx <= endX; gx += step) {
      for (let gy = startY; gy <= endY; gy += step) {
        ctx.fillRect(gx - 2, gy - 2, 4, 4);
      }
    }

    // 2. Arena Circular Boundary with 3D Inner Rim Shadow
    ctx.beginPath();
    ctx.arc(GAME_CONFIG.ARENA_CENTER_X, GAME_CONFIG.ARENA_CENTER_Y, GAME_CONFIG.ARENA_RADIUS + 400, 0, Math.PI * 2);
    ctx.arc(GAME_CONFIG.ARENA_CENTER_X, GAME_CONFIG.ARENA_CENTER_Y, GAME_CONFIG.ARENA_RADIUS, 0, Math.PI * 2, true);
    ctx.fillStyle = '#CFD8DC';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(GAME_CONFIG.ARENA_CENTER_X, GAME_CONFIG.ARENA_CENTER_Y, GAME_CONFIG.ARENA_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = '#80CBC4';
    ctx.lineWidth = 16;
    ctx.stroke();

    // 3. Smooth Organic Blob Territories with 3D Extruded Depth & Skin Patterns
    TerritoryRenderer.renderTerritories(ctx, engine.grid, engine.allPlayers);

    // 3b. Territory Transfer Waves
    for (const wave of engine.transferWaves) {
      const currentR = wave.progress * 450;
      const alpha = Math.max(0, 0.45 * (1 - wave.progress));
      ctx.beginPath();
      ctx.arc(wave.originX, wave.originY, currentR, 0, Math.PI * 2);
      ctx.fillStyle = wave.killerColor;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3.5;
      ctx.globalAlpha = alpha * 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // 4. Power-Up Items (Glowing Orbs & 3D Gift Boxes) - Frustum culled
    for (const item of engine.powerUpManager.items) {
      if (item.x < minViewX || item.x > maxViewX || item.y < minViewY || item.y > maxViewY) continue;
      const pulse = 1.0 + Math.sin(now * 0.008) * 0.14;
      if (item.type === 'damage_aura') {
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius * pulse + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.32)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.strokeStyle = '#FF8F00';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.scale(pulse, pulse);
        ctx.fillStyle = '#FFB300';
        ctx.beginPath();
        ctx.roundRect(-10, -7, 20, 18, 4);
        ctx.fill();
        ctx.fillStyle = '#FFEA00';
        ctx.beginPath();
        ctx.roundRect(-10, -10, 20, 16, 4);
        ctx.fill();
        ctx.fillStyle = '#FF1744';
        ctx.fillRect(-2.5, -10, 5, 16);
        ctx.fillRect(-10, -4, 20, 4);
        ctx.restore();
      }
    }

    // 5. Smooth Bezier Ribbon Trails with Anchor Joint & Inner Highlight
    for (const p of engine.allPlayers) {
      if (p.status !== 'alive') continue;
      const pts = p.trail.points;
      if (pts.length > 0) {
        const tPath = new Path2D();
        tPath.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          tPath.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
        }
        if (pts.length > 1) {
          const last = pts[pts.length - 1];
          tPath.quadraticCurveTo(last.x, last.y, p.x, p.y);
        } else {
          tPath.lineTo(p.x, p.y);
        }

        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, GAME_CONFIG.TRAIL_WIDTH * 0.62, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = p.darkColor;
        ctx.lineWidth = GAME_CONFIG.TRAIL_WIDTH + 4;
        ctx.globalAlpha = 0.85;
        ctx.stroke(tPath);

        ctx.strokeStyle = p.color || playerColors.get(p.id) || '#FF2A6D';
        ctx.lineWidth = GAME_CONFIG.TRAIL_WIDTH;
        ctx.globalAlpha = 0.78;
        ctx.stroke(tPath);

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = GAME_CONFIG.TRAIL_WIDTH * 0.35;
        ctx.globalAlpha = 0.3;
        ctx.stroke(tPath);
        ctx.globalAlpha = 1.0;
      }
    }

    // Find current #1 leader for crown
    let leaderId = engine.player.id;
    let maxCells = -1;
    for (const p of engine.allPlayers) {
      const c = engine.grid.countCells(p.id);
      if (c > maxCells) {
        maxCells = c;
        leaderId = p.id;
      }
    }

    // 6. 3D Cushion/Cube Character Heads with Depth, Tilt & Crown - Frustum culled
    for (const p of engine.allPlayers) {
      if (p.status !== 'alive') continue;
      if (p.x < minViewX || p.x > maxViewX || p.y < minViewY || p.y > maxViewY) continue;

      if (p.damageAura.active) {
        const r = p.damageAura.radius + Math.sin(now * 0.02) * 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.22)';
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (p.rimBoost.isSliding && p.rimContactPoint) {
        const charge = p.rimBoost.charge;
        const sparkColor = charge >= 0.8 ? '#FF1744' : charge >= 0.4 ? '#FF9100' : '#FFFFFF';
        for (let s = 0; s < 4; s++) {
          ctx.beginPath();
          ctx.arc(
            p.rimContactPoint.x + (Math.random() - 0.5) * 16,
            p.rimContactPoint.y + (Math.random() - 0.5) * 16,
            2 + Math.random() * 3.5, 0, Math.PI * 2
          );
          ctx.fillStyle = sparkColor;
          ctx.fill();
        }
      }

      const r = GAME_CONFIG.CHARACTER_RADIUS;
      // Ground drop shadow
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 7, r * 1.05, r * 0.72, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 30, 60, 0.24)';
      ctx.fill();

      // 3D Extruded Lower Block (shifted +4.5px Y in world space)
      ctx.save();
      ctx.translate(p.x, p.y + 4.5);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.darkColor;
      ctx.beginPath();
      ctx.roundRect(-r, -r, r * 2, r * 2, 7);
      ctx.fill();
      ctx.restore();

      // 3D Top Cube Face
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.darkColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-r, -r, r * 2, r * 2, 7);
      ctx.fill();
      ctx.stroke();

      // Glossy top bevel highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.beginPath();
      ctx.roundRect(-r + 3, -r + 3, r * 2 - 6, r * 0.75, 4);
      ctx.fill();

      // Cute Expressive Eyes facing forward
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(5, -4.5, 4.2, 0, Math.PI * 2);
      ctx.arc(5, 4.5, 4.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#102027';
      ctx.beginPath();
      ctx.arc(6.5, -4.5, 2.2, 0, Math.PI * 2);
      ctx.arc(6.5, 4.5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Name & Leader Crown
      ctx.font = '900 12px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      const label = p.id === leaderId ? `👑 ${p.name}` : p.name;
      ctx.strokeText(label, p.x, p.y - r - 8);
      ctx.fillStyle = '#1E293B';
      ctx.fillText(label, p.x, p.y - r - 8);
    }

    // 7. Update & Render Sparkle/Shatter Particles
    TerritoryRenderer.updateAndDrawParticles(ctx, 1 / 60);

    ctx.restore();
  }
}
