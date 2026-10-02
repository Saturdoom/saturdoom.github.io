(function () {
  // ============================================================
  // State
  // ============================================================
  let weeks = [];          // full list from JSON (most recent first)
  let currentIndex = 0;

  // DOM refs
  const dateHeader     = document.getElementById('weekDateHeader');
  const tableBody      = document.getElementById('weekTableBody');
  const giroTableBody  = document.getElementById('giroTableBody');
  const prevBtn        = document.getElementById('prevWeekBtn');
  const nextBtn        = document.getElementById('nextWeekBtn');

  // ============================================================
  // Helpers
  // ============================================================
  const fmtPct = v => (v == null ? '—' : (v > 0 ? `+${v}%` : `${v}%`));

  function getTrendClass(currentVal, prevVal) {
    if (prevVal == null || currentVal == null) return 'uncertain';
    if (currentVal > prevVal) return 'up';
    if (currentVal < prevVal) return 'down';
    return 'uncertain';
  }

  function getGiroDirection(brent_w, wti_w, usd_w) {
    if (brent_w == null || wti_w == null || usd_w == null) return 'up';
    if (brent_w > 1.0 && usd_w > 0.5 && wti_w < -0.5) return 'right';
    if (brent_w < -0.5 && usd_w < -0.5 && wti_w > 1.0) return 'left';
    return 'up';
  }

  // ============================================================
  // Gauge drawing (same as before)
  // ============================================================
  function drawGauge(direction) {
    const canvas = document.getElementById('gaugeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const lcdWhiteOff = '#c8c8b8';
    const iconDark = '#646464';
    const digitDark = '#010501';
    const shadow = 'rgba(100, 100, 100, 0.6)';

    ctx.fillStyle = lcdWhiteOff;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    const yOffset = 76;
    ctx.translate(width / 2, height / 2 + yOffset);
    ctx.rotate(-Math.PI / 2);

    const radius = Math.min(width, height) * 0.95;
    const startAngle = -Math.PI / 2;
    const sweep = Math.PI;
    const sectorAngle = sweep / 3;

    const verde    = getComputedStyle(document.documentElement).getPropertyValue('--giro-verde').trim();
    const amarillo = getComputedStyle(document.documentElement).getPropertyValue('--giro-amarillo').trim();
    const rojo     = getComputedStyle(document.documentElement).getPropertyValue('--giro-rojo').trim();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = iconDark;
    ctx.lineWidth = 1;

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle + i * sectorAngle, startAngle + (i + 1) * sectorAngle);
      ctx.lineTo(0, 0);
      ctx.fillStyle = lcdWhiteOff;
      ctx.fill();
      ctx.stroke();
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = verde;
    ctx.beginPath();
    ctx.arc(0, 0, radius, startAngle, startAngle + sectorAngle);
    ctx.stroke();
    ctx.strokeStyle = amarillo;
    ctx.beginPath();
    ctx.arc(0, 0, radius, startAngle + sectorAngle, startAngle + 2 * sectorAngle);
    ctx.stroke();
    ctx.strokeStyle = rojo;
    ctx.beginPath();
    ctx.arc(0, 0, radius, startAngle + 2 * sectorAngle, startAngle + 3 * sectorAngle);
    ctx.stroke();

    const highlightOpacity = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--highlight-opacity').trim()
    ) || 0.35;
    ctx.save();
    const grad = ctx.createLinearGradient(-radius * 0.5, -radius * 0.5, radius * 0.3, radius * 0.3);
    grad.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.restore();

    let angle;
    if (direction === 'left')      angle = startAngle + sectorAngle / 2;
    else if (direction === 'right') angle = startAngle + 2 * sectorAngle + sectorAngle / 2;
    else                            angle = startAngle + sectorAngle + sectorAngle / 2;

    const needleLength = radius * 0.9;
    const needleX = Math.cos(angle) * needleLength;
    const needleY = Math.sin(angle) * needleLength;

    ctx.save();
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 4;
    ctx.shadowColor = shadow;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(needleX, needleY);
    ctx.strokeStyle = digitDark;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(needleX, needleY);
    ctx.strokeStyle = digitDark;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fillStyle = digitDark;
    ctx.fill();

    ctx.restore();
  }

  // ============================================================
  // Render
  // ============================================================
  function renderWeek(index) {
    const week = weeks[index];
    if (!week) return;

    const prevWeek = weeks[index + 1];

    const energyTrend = getTrendClass(week.energy, prevWeek?.energy);
    const techTrend   = getTrendClass(week.tech,   prevWeek?.tech);

    dateHeader.innerHTML = ` WEEK ${week.date} · SCAN ${week.scan}`;

    const assets = [
      { name: 'ENERGY',     value: week.energy ?? -Infinity, display: fmtPct(week.energy), trendClass: energyTrend },
      { name: 'TECHNOLOGY', value: week.tech   ?? -Infinity, display: fmtPct(week.tech),   trendClass: techTrend   }
    ];
    assets.sort((a, b) => b.value - a.value);

    tableBody.innerHTML = assets.map(a => `
      <tr>
        <td class="asset">${a.name}</td>
        <td class="value">${a.display}</td>
      </tr>
    `).join('');

    const e = week.energy, t = week.tech;
    let level = 3;
    if (e != null && t != null) {
      if (t < -2.5 && e > 2.5) level = 1;
      else if (t < 0 && e > 0) level = 2;
      else if (t < 0 && e < 0) level = 3;
      else if (t > 0 && e < 0) level = 4;
      else level = 5;
    }

    document.querySelectorAll('.defcon-level').forEach(el => el.classList.remove('active'));
    const active = document.querySelector(`.defcon-level[data-level="${level}"]`);
    if (active) active.classList.add('active');
  }

  function renderGiro(index) {
    const week = weeks[index];
    if (!week) return;

    const assets = [
      { name: 'BRENT', w: week.brent_w },
      { name: 'WTI',   w: week.wti_w   },
      { name: 'USD',   w: week.usd_w   }
    ];
    giroTableBody.innerHTML = assets.map(a => `
      <tr>
        <td class="asset">${a.name}</td>
        <td class="value">${fmtPct(a.w)}</td>
      </tr>
    `).join('');

    drawGauge(getGiroDirection(week.brent_w, week.wti_w, week.usd_w));
  }

  function updateButtons() {
    if (currentIndex === weeks.length - 1) {
      prevBtn.setAttribute('disabled', 'disabled');
      prevBtn.classList.add('disabled');
    } else {
      prevBtn.removeAttribute('disabled');
      prevBtn.classList.remove('disabled');
    }
    if (currentIndex === 0) {
      nextBtn.setAttribute('disabled', 'disabled');
      nextBtn.classList.add('disabled');
    } else {
      nextBtn.removeAttribute('disabled');
      nextBtn.classList.remove('disabled');
    }
  }

  function renderAll(index) {
    renderWeek(index);
    renderGiro(index);
    updateButtons();
  }

  function prevWeek() {
    if (currentIndex + 1 < weeks.length) {
      currentIndex++;
      renderAll(currentIndex);
    }
  }
  function nextWeek() {
    if (currentIndex - 1 >= 0) {
      currentIndex--;
      renderAll(currentIndex);
    }
  }

  // ============================================================
  // Boot
  // ============================================================
  fetch('data/market_data.json')
    .then(r => r.json())
    .then(data => {
      weeks = data.weeks || [];

      const params = new URLSearchParams(window.location.search);
      const weekParam = params.get('week');
      if (weekParam) {
        const idx = weeks.findIndex(w => w.date === weekParam);
        if (idx !== -1) currentIndex = idx;
      }

      prevBtn.addEventListener('click', prevWeek);
      nextBtn.addEventListener('click', nextWeek);

      renderAll(currentIndex);
    })
    .catch(err => {
      console.error('Failed to load market_data.json', err);
      dateHeader.textContent = '⚠ DATA UNAVAILABLE';
    });
})();