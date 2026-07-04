(function() {
  // ============================================================
  // DEFCON PANEL (Energy & Technology)
  // ============================================================
  // Agrega más semanas aquí (más recientes primero)
  const weeksData = [
    { date: "2026-06-29", scan: "07-04", energy: -1.15, tech: -0.29},
    { date: "2026-06-22", scan: "06-27", energy: -0.02, tech: -5.28},
    { date: "2026-06-15", scan: "06-20", energy: -6.43, tech: 3.52},
    { date: "2026-06-08", scan: "06-13", energy: -0.21, tech: 2.50},
    { date: "2026-06-01", scan: "06-06", energy: 2.45, tech: -5.61},
    { date: "2026-05-25", scan: "05-30", energy: -4.80, tech: 6.95},
    { date: "2026-05-18", scan: "05-23", energy: 0.08, tech: 2.34},
    { date: "2026-05-11", scan: "05-16", energy: 6.71, tech: 0.42},
    { date: "2026-05-04", scan: "05-09", energy: -5.35, tech: 8.43},
    { date: "2026-04-27", scan: "05-02", energy: 3.48, tech: 1.03},
    { date: "2026-04-20", scan: "04-25", energy: 3.36, tech: 3.80},
    { date: "2026-04-13", scan: "04-18", energy: -3.37, tech: 8.22},

  ];

  let currentIndex = 0;  // índice único

  const dateHeader = document.getElementById('weekDateHeader');
  const tableBody = document.getElementById('weekTableBody');
  const prevBtn = document.getElementById('prevWeekBtn');
  const nextBtn = document.getElementById('nextWeekBtn');

  function getTrendClass(currentVal, prevVal) {
    if (prevVal === undefined) return 'uncertain';
    if (currentVal > prevVal) return 'up';
    if (currentVal < prevVal) return 'down';
    return 'uncertain';
  }

  function renderWeek(index) {
    const week = weeksData[index];
    if (!week) return;

    const prevWeek = weeksData[index + 1];
    const energyTrend = getTrendClass(week.energy, prevWeek?.energy);
    const techTrend = getTrendClass(week.tech, prevWeek?.tech);

    // La fecha se actualizará también desde GIRO, pero la ponemos acá igual
    dateHeader.innerHTML = ` WEEK ${week.date} · SCAN ${week.scan}`;
    const energyDisplay = (week.energy > 0 ? `+${week.energy}%` : `${week.energy}%`);
    const techDisplay = (week.tech > 0 ? `+${week.tech}%` : `${week.tech}%`);

    const assets = [
      { name: "ENERGY", value: week.energy, display: energyDisplay, trendClass: energyTrend },
      { name: "TECHNOLOGY", value: week.tech, display: techDisplay, trendClass: techTrend }
    ];
    assets.sort((a, b) => b.value - a.value);

    tableBody.innerHTML = assets.map(asset => `
      <tr>
        <td class="asset">${asset.name}</td>
        <td class="${asset.trendClass}">${asset.display}</td>
      </tr>
    `).join('');

    const energyVal = week.energy;
    const techVal = week.tech;
    let level = 3;
    if (techVal < -2.5 && energyVal > 2.5) level = 1;
    else if (techVal < 0 && energyVal > 0) level = 2;
    else if (techVal < 0 && energyVal < 0) level = 3;
    else if (techVal > 0 && energyVal < 0) level = 4;
    else level = 5;

    const allLevels = document.querySelectorAll('.defcon-level');
    allLevels.forEach(el => el.classList.remove('active'));
    const activeLevel = document.querySelector(`.defcon-level[data-level="${level}"]`);
    if (activeLevel) activeLevel.classList.add('active');

    // Actualizar estado de botones (común)
    updateButtons();
  }

  function updateButtons() {
  // prev: deshabilitado si estamos en la semana más antigua (último índice)
  if (currentIndex === weeksData.length - 1) {
    prevBtn.setAttribute('disabled', 'disabled');
    prevBtn.classList.add('disabled');
  } else {
    prevBtn.removeAttribute('disabled');
    prevBtn.classList.remove('disabled');
  }
  // next: deshabilitado si estamos en la semana más reciente (primer índice)
  if (currentIndex === 0) {
    nextBtn.setAttribute('disabled', 'disabled');
    nextBtn.classList.add('disabled');
  } else {
    nextBtn.removeAttribute('disabled');
    nextBtn.classList.remove('disabled');
  }
}

  function prevWeek() {
    if (currentIndex + 1 < weeksData.length) {
      currentIndex++;
      renderWeek(currentIndex);
      renderGiro(currentIndex);  // actualizar también el GIRO
    }
  }

  function nextWeek() {
    if (currentIndex - 1 >= 0) {
      currentIndex--;
      renderWeek(currentIndex);
      renderGiro(currentIndex);
    }
  }

  prevBtn.addEventListener('click', prevWeek);
  nextBtn.addEventListener('click', nextWeek);

  function getIndexByDate(dateStr) {
    return weeksData.findIndex(week => week.date === dateStr);
  }
  const urlParams = new URLSearchParams(window.location.search);
  const weekParam = urlParams.get('week');
  if (weekParam) {
    const idx = getIndexByDate(weekParam);
    if (idx !== -1) currentIndex = idx;
  }

  // ============================================================
  // GIRO PANEL (Brent, WTI, USD) con gráfico de aguja semicircular
  // ============================================================
  const giroData = [
      { date: "2026-06-27", scan: "07-04",
      brent_w: -1.96, brent_m: -22.33,
      wti_w: -2.08, wti_m: -24.03,
      usd_w: -0.49, usd_m: 0.79 },
      { date: "2026-06-22", scan: "06-27",
      brent_w: -7.86, brent_m: -19.77,
      wti_w: -8.30, wti_m: -19.96,
      usd_w: 0.52, usd_m: 2.46 },
      { date: "2026-06-15", scan: "06-20",
      brent_w: -7.72, brent_m: -21.44,
      wti_w: -9.83, wti_m: -20.56,
      usd_w: 1.10, usd_m: 1.67 },
      { date: "2026-06-08", scan: "06-13",
      brent_w: -6.63, brent_m: -17.98,
      wti_w: -6.90, wti_m: -16.68,
      usd_w: -1.26, usd_m: -0.07 },
      { date: "2026-06-01", scan: "06-06",
      brent_w: 1.28, brent_m: -7.19,
      wti_w: 2.84, wti_m: -4.81,
      usd_w: 0.48, usd_m: 1.18 },
    { date: "2026-05-25", scan: "05-30",
      brent_w: -11.44, brent_m: -19.57,
      wti_w: -9.15, wti_m: -16.47,
      usd_w: -0.25, usd_m: 0.02 },
    { date: "2026-05-18", scan: "05-23",
      brent_w: -5.24, brent_m: -1.46,
      wti_w: -8.37, wti_m: 0.78,
      usd_w: 0.05, usd_m: 0.53 },
    { date: "2026-05-11", scan: "05-16",
      brent_w: 7.87, brent_m: 9.93,
      wti_w: 10.48, wti_m: 11.33,
      usd_w: 1.46, usd_m: 1.07 },
    { date: "2026-05-04", scan: "05-09",
      brent_w: -6.93, brent_m: 5.60,
      wti_w: -6.93, wti_m: -2.50,
      usd_w: -0.38, usd_m: -0.99 },
    { date: "2026-04-27", scan: "05-02",
      brent_w: 9.07, brent_m: 7.58,
      wti_w: 8.06, wti_m: 2.41,
      usd_w: -0.30, usd_m: 9.55 },
    { date: "2026-04-20", scan: "04-25",
      brent_w: 10.40, brent_m: -7.62,
      wti_w: 13.15, wti_m: 0.42,
      usd_w: 0.42, usd_m: -1.39 },
    // Agrega más semanas aquí (más recientes primero)
      { date: "2026-04-13", scan: "04-18",
      brent_w: -5.06, brent_m: -16.82,
      wti_w: -13.17, wti_m: -12.78,
      usd_w: -0.56, usd_m: -1.14 },
  ];

  const giroTableBody = document.getElementById('giroTableBody');

  // Definir variables de colores
  const lcdWhiteOff = "#c8c8b8";
  const iconDark = "#646464";
  const digitDark = '#010501';
  const shadow = 'rgba(100, 100, 100, 0.6)';

  function getGiroDirection(brent_w, wti_w, usd_w) {
    if (brent_w > 1.0 && usd_w > 0.5 && wti_w < -0.5) return 'right';
    if (brent_w < -0.5 && usd_w < -0.5 && wti_w > 1.0) return 'left';
    return 'up';
  }

  // Dibuja el semicírculo (exactamente igual, sin cambios)
  function drawGauge(direction) {
    const canvas = document.getElementById('gaugeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // === AGREGADO: fondo claro ===
    ctx.fillStyle = lcdWhiteOff;
    //ctx.fillRect(0, 0, width, height);

    ctx.save();
    const yOffset = 76;
    ctx.translate(width / 2, height / 2 + yOffset);
    ctx.rotate(-Math.PI / 2);
    
    const radius = Math.min(width, height) * .95;
    const centerX = 0;
    const centerY = 0;
    const startAngle = -Math.PI / 2;
    const sweep = Math.PI;
    const sectorAngle = sweep / 3;

    const colors = {
      left: lcdWhiteOff,
      center: lcdWhiteOff,
      right: lcdWhiteOff
    };
    
    ctx.shadowBlur = 6;
    ctx.shadowColor = shadow;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 1;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sectorAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = colors.left;
    ctx.fill();
    ctx.strokeStyle = iconDark;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle + sectorAngle, startAngle + 2 * sectorAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = colors.center;
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle + 2 * sectorAngle, startAngle + 3 * sectorAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = colors.right;
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sweep);
    ctx.strokeStyle = iconDark;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    let angle;
    if (direction === 'left') {
      angle = startAngle + sectorAngle / 2;
    } else if (direction === 'right') {
      angle = startAngle + 2 * sectorAngle + sectorAngle / 2;
    } else {
      angle = startAngle + sectorAngle + sectorAngle / 2;
    }
    
    const needleLength = radius * 0.9;
    const needleX = Math.cos(angle) * needleLength;
    const needleY = Math.sin(angle) * needleLength;
    
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
    ctx.shadowBlur = 0;
    
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fillStyle = digitDark;
    ctx.fill();
    
    ctx.restore();
  }

  function renderGiro(index) {
    const w = giroData[index];
    if (!w) return;
    // Actualizar fecha única también desde GIRO (por si acaso)
    if (dateHeader && w.date) {
      dateHeader.innerHTML = ` WEEK ${w.date} · SCAN ${w.scan}`;
    }

    const assets = [
      { name: "BRENT", w: w.brent_w, m: w.brent_m },
      { name: "WTI",   w: w.wti_w,   m: w.wti_m },
      { name: "USD",   w: w.usd_w,   m: w.usd_m }
    ];
    giroTableBody.innerHTML = assets.map(a => {
      const wClass = a.w > 0 ? 'up' : (a.w < 0 ? 'down' : 'uncertain');
      const mClass = a.m > 0 ? 'up' : (a.m < 0 ? 'down' : 'uncertain');
      return `
        <tr>
          <td class="asset">${a.name}</td>
          <td class="${wClass}">${a.w > 0 ? '+' : ''}${a.w}%</td>
          <td class="${mClass}">${a.m > 0 ? '+' : ''}${a.m}%</td>
        </tr>
      `;
    }).join('');

    const direction = getGiroDirection(w.brent_w, w.wti_w, w.usd_w);
    drawGauge(direction);
  }

  // Inicializar ambos paneles con el mismo índice
  renderWeek(currentIndex);
  renderGiro(currentIndex);
})();