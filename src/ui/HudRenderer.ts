import { GameEngine } from '../engine/GameEngine';
import { JOYSTICK_CONFIG } from '../config';
import { JoystickVisualState } from './InputController';

export class HudRenderer {
  public static isPlayAgainClicked(x: number, y: number, viewWidth: number, viewHeight: number): boolean {
    const btnW = 190, btnH = 50, btnX = (viewWidth - btnW) / 2, btnY = viewHeight / 2 + 60;
    return x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH;
  }

  public static isHomeClicked(x: number, y: number, viewWidth: number, viewHeight: number): boolean {
    const btnW = 190, btnH = 46, btnX = (viewWidth - btnW) / 2, btnY = viewHeight / 2 + 122;
    return x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH;
  }

  public static renderHUD(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    viewWidth: number,
    viewHeight: number,
    joystick?: JoystickVisualState
  ): void {
    const percentage = engine.grid.getPercentage(engine.player.id);
    const kills = engine.player.kills;

    // 1. Authentic Top Capsule Progress Bar
    const barWidth = Math.min(viewWidth * 0.86, 330);
    const barHeight = 24;
    const barX = (viewWidth - barWidth) / 2;
    const barY = 18;

    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 12);
    ctx.fillStyle = '#4536B3';
    ctx.fill();
    ctx.strokeStyle = '#2B1E80';
    ctx.lineWidth = 2;
    ctx.stroke();

    const fillWidth = Math.max(26, (barWidth * Math.min(percentage, 100)) / 100);
    ctx.beginPath();
    ctx.roundRect(barX + 2, barY + 2, fillWidth - 4, barHeight - 4, 10);
    ctx.fillStyle = engine.player.color;
    ctx.fill();

    ctx.font = '900 13px "Fredoka", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#1A144B';
    ctx.lineWidth = 3;
    const pctText = `${percentage.toFixed(1)}%`;
    ctx.strokeText(pctText, barX + 12, barY + barHeight / 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(pctText, barX + 12, barY + barHeight / 2);

    // 2. Golden Light-Beam Kill Banner
    let notifY = barY + barHeight + 28;
    for (const notif of engine.notifications) {
      const alpha = Math.min(1.0, notif.remainingSec / 0.5);
      ctx.save();
      ctx.globalAlpha = alpha;

      const grad = ctx.createLinearGradient(0, notifY, 0, notifY + 42);
      grad.addColorStop(0, 'rgba(255, 215, 0, 0.15)');
      grad.addColorStop(0.5, 'rgba(255, 250, 200, 0.92)');
      grad.addColorStop(1, 'rgba(255, 215, 0, 0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, notifY, viewWidth, 42);

      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, notifY + 2);
      ctx.lineTo(viewWidth, notifY + 2);
      ctx.moveTo(0, notifY + 40);
      ctx.lineTo(viewWidth, notifY + 40);
      ctx.stroke();

      ctx.font = '900 18px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#0E2963';
      ctx.lineWidth = 4;
      ctx.strokeText(notif.text.toUpperCase(), viewWidth / 2, notifY + 21);
      ctx.fillStyle = '#FFE082';
      ctx.fillText(notif.text.toUpperCase(), viewWidth / 2, notifY + 21);

      ctx.restore();
      notifY += 48;
    }

    // 3. 360-Degree Rotatable Virtual Joystick
    if (engine.state === 'PLAYING' && joystick) {
      this.renderJoystick360(ctx, joystick, engine.player.color);
    }

    // 4. Game Over / Victory Overlay
    if (engine.state === 'GAME_OVER' || engine.state === 'VICTORY') {
      const isWin = engine.state === 'VICTORY';
      ctx.fillStyle = 'rgba(10, 25, 55, 0.72)';
      ctx.fillRect(0, 0, viewWidth, viewHeight);

      ctx.font = '900 32px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#0E2963';
      ctx.lineWidth = 5;
      const title = isWin ? '👑 CHIẾN THẮNG! 👑' : 'KẾT THÚC!';
      ctx.strokeText(title, viewWidth / 2, viewHeight / 2 - 42);
      ctx.fillStyle = isWin ? '#FFD54F' : '#FF4081';
      ctx.fillText(title, viewWidth / 2, viewHeight / 2 - 42);

      ctx.font = '900 18px "Fredoka", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`Lãnh thổ: ${percentage.toFixed(1)}%   •   Hạ gục: ${kills}`, viewWidth / 2, viewHeight / 2 + 6);

      // Play Again Button
      ctx.fillStyle = '#52D017';
      ctx.beginPath();
      ctx.roundRect(viewWidth / 2 - 95, viewHeight / 2 + 60, 190, 50, 25);
      ctx.fill();
      ctx.strokeStyle = '#1B5E20';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 19px "Fredoka", sans-serif';
      ctx.fillText('CHƠI LẠI', viewWidth / 2, viewHeight / 2 + 86);

      // Menu Button
      ctx.fillStyle = '#2998F2';
      ctx.beginPath();
      ctx.roundRect(viewWidth / 2 - 95, viewHeight / 2 + 122, 190, 46, 23);
      ctx.fill();
      ctx.strokeStyle = '#0B52B5';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 17px "Fredoka", sans-serif';
      ctx.fillText('VỀ MENU', viewWidth / 2, viewHeight / 2 + 146);
    }
  }

  private static renderJoystick360(
    ctx: CanvasRenderingContext2D,
    js: JoystickVisualState,
    playerColor: string
  ): void {
    const r = JOYSTICK_CONFIG.RADIUS;
    const kr = JOYSTICK_CONFIG.KNOB_RADIUS;
    const alpha = js.active ? JOYSTICK_CONFIG.ACTIVE_ALPHA : JOYSTICK_CONFIG.IDLE_ALPHA;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Outer 360-degree dial base
    ctx.beginPath();
    ctx.arc(js.baseX, js.baseY, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(14, 41, 99, 0.28)';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.stroke();

    // 8 compass tick marks around the 360 ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.moveTo(js.baseX + Math.cos(a) * (r - 8), js.baseY + Math.sin(a) * (r - 8));
      ctx.lineTo(js.baseX + Math.cos(a) * (r - 2), js.baseY + Math.sin(a) * (r - 2));
    }
    ctx.stroke();

    // Rotating 360-degree directional pointer triangle on outer rim
    ctx.save();
    ctx.translate(js.baseX, js.baseY);
    ctx.rotate(js.angle);
    ctx.beginPath();
    ctx.moveTo(r + 12, 0);
    ctx.lineTo(r - 2, -8);
    ctx.lineTo(r - 2, 8);
    ctx.closePath();
    ctx.fillStyle = '#FFEA00';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0E2963';
    ctx.stroke();
    ctx.restore();

    // Stem connecting center to thumb knob
    ctx.beginPath();
    ctx.moveTo(js.baseX, js.baseY);
    ctx.lineTo(js.knobX, js.knobY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 3D Inner Thumb Knob
    ctx.beginPath();
    ctx.arc(js.knobX, js.knobY + 3, kr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 27, 69, 0.45)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(js.knobX, js.knobY, kr, 0, Math.PI * 2);
    ctx.fillStyle = playerColor;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Gloss highlight on thumb knob
    ctx.beginPath();
    ctx.arc(js.knobX - kr * 0.25, js.knobY - kr * 0.25, kr * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fill();

    ctx.restore();
  }
}
