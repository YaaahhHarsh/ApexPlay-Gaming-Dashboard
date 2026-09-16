/**
 * APEXPLAY ANALYTICS & CANVAS CHARTS
 * Clean, high-DPI Canvas charts with restrained, professional styling.
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

    const padding = { top: 25, right: 20, bottom: 30, left: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxHours = Math.max(...data.map(d => d.hours), 10);
    const colWidth = chartW / data.length;

    // Background Gridlines
    ctx.strokeStyle = 'rgba(42, 50, 61, 0.6)';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const val = Math.round(maxHours - (maxHours / gridLines) * i);
      ctx.fillStyle = '#687384';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${val}h`, padding.left - 8, y + 3);
    }

    // Clean Solid Accent Bars (No neon glow)
    data.forEach((item, idx) => {
      const x = padding.left + idx * colWidth + colWidth * 0.22;
      const barW = colWidth * 0.56;
      const barH = (item.hours / maxHours) * chartH;
      const y = padding.top + chartH - barH;

      ctx.fillStyle = '#4F8CFF';
      ctx.beginPath();
      const radius = 3;
      ctx.roundRect(x, y, barW, barH, [radius, radius, 0, 0]);
      ctx.fill();

      // Top value label
      ctx.fillStyle = '#F5F7FA';
      ctx.font = '600 11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.hours}h`, x + barW / 2, y - 6);

      // Bottom day label
      ctx.fillStyle = '#9AA4B2';
      ctx.font = '500 11px "Inter", sans-serif';
      ctx.fillText(item.day, x + barW / 2, height - 8);
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
    const outerRadius = Math.min(centerX, centerY) - 16;
    const innerRadius = outerRadius * 0.65;

    const totalHours = data.reduce((acc, d) => acc + d.hours, 0);
    let startAngle = -Math.PI / 2;

    const paletteColors = ['#4F8CFF', '#39C98A', '#E8B84A', '#6BA0FF', '#9AA4B2'];

    data.forEach((item, i) => {
      const sliceAngle = (item.hours / totalHours) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = paletteColors[i % paletteColors.length];
      ctx.fill();
      ctx.restore();

      startAngle = endAngle;
    });

    // Center summary text
    ctx.fillStyle = '#F5F7FA';
    ctx.font = '700 17px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(totalHours)}h`, centerX, centerY - 5);

    ctx.fillStyle = '#687384';
    ctx.font = '600 9px "Inter", sans-serif';
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
          <span class="top-game-rank">0${i + 1}</span>
          <img src="${game.banner}" alt="${game.title}" class="top-game-thumb" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100'">
          <div class="top-game-text">
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
              <span class="top-game-name">${game.title}</span>
              <span style="font-family: var(--font-mono); color: var(--text-muted);">${game.playtimeHours}h</span>
            </div>
            <div class="top-game-bar-track">
              <div class="top-game-bar-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

window.DashboardCharts = DashboardCharts;
