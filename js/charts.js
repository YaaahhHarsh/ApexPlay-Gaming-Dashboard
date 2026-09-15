/**
 * APEXPLAY ANALYTICS & CANVAS CHARTS
 * Custom high-DPI Canvas charts with neon gradients, glowing paths, and interactive animations.
 */

class DashboardCharts {
  static setupCanvas(canvas) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height };
  }

  static renderWeeklyPlaytime(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data || data.length === 0) return;

    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const padding = { top: 25, right: 20, bottom: 35, left: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxHours = Math.max(...data.map(d => d.hours), 10);
    const colWidth = chartW / data.length;

    // Background Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const val = Math.round(maxHours - (maxHours / gridLines) * i);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${val}h`, padding.left - 8, y + 3);
    }

    // Gradient Bars with Rounded Tops and Glow
    data.forEach((item, idx) => {
      const x = padding.left + idx * colWidth + colWidth * 0.2;
      const barW = colWidth * 0.6;
      const barH = (item.hours / maxHours) * chartH;
      const y = padding.top + chartH - barH;

      // Glow
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = item.hours > 6 ? 15 : 8;

      const grad = ctx.createLinearGradient(0, y, 0, padding.top + chartH);
      grad.addColorStop(0, '#8b5cf6');
      grad.addColorStop(0.6, '#06b6d4');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.15)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      const radius = 6;
      ctx.roundRect(x, y, barW, barH, [radius, radius, 2, 2]);
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Top value label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.hours}h`, x + barW / 2, y - 6);

      // Bottom day label
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.font = '500 11px "Outfit", sans-serif';
      ctx.fillText(item.day, x + barW / 2, height - 10);
    });
  }

  static renderGenreDonut(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data || data.length === 0) return;

    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.62;

    const totalHours = data.reduce((acc, d) => acc + d.hours, 0);
    let startAngle = -Math.PI / 2;

    data.forEach(item => {
      const sliceAngle = (item.hours / totalHours) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.shadowColor = item.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      startAngle = endAngle;
    });

    // Center text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(totalHours)}h`, centerX, centerY - 6);

    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.font = '10px "Outfit", sans-serif';
    ctx.fillText('TOTAL TIME', centerX, centerY + 12);
  }

  static renderTopGamesBars(containerId, games) {
    const container = document.getElementById(containerId);
    if (!container || !games) return;

    const sorted = [...games].sort((a, b) => b.playtimeHours - a.playtimeHours).slice(0, 5);
    const max = sorted[0] ? sorted[0].playtimeHours : 100;

    container.innerHTML = sorted.map((game, i) => {
      const pct = Math.round((game.playtimeHours / max) * 100);
      return `
        <div class="top-game-row">
          <div class="top-game-info">
            <span class="top-game-rank">0${i + 1}</span>
            <img src="${game.banner}" alt="${game.title}" class="top-game-thumb" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100'">
            <div class="top-game-text">
              <div class="top-game-title">${game.title}</div>
              <div class="top-game-genre">${game.genre}</div>
            </div>
          </div>
          <div class="top-game-bar-wrap">
            <div class="top-game-bar-track">
              <div class="top-game-bar-fill" style="width: ${pct}%"></div>
            </div>
            <span class="top-game-hours">${game.playtimeHours} hrs</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

window.DashboardCharts = DashboardCharts;
