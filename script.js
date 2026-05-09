(function() {
  // ============================================================
  // DEFCON PANEL (Energy & Technology)
  // ============================================================
  const weeksData = [
    { date: "2026-05-04", scan: "05-09", energy: -5.35, tech: 8.43},
    { date: "2026-04-27", scan: "05-02", energy: 3.66, tech: 0.81},
    { date: "2026-04-20", scan: "04-25", energy: 3.36, tech: 3.80},
    // Agrega más semanas aquí (más recientes primero)
    { date: "2026-04-13", scan: "04-18", energy: 0.71, tech: 2.51},

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
    { date: "2026-05-04", scan: "05-09",
      brent_w: -6.93, brent_m: 1.94,
      wti_w: -6.93, wti_m: -3.69,
      usd_w: -0.38, usd_m: -0.54 },
    { date: "2026-04-27", scan: "05-02",
      brent_w: 0.55, brent_m: -0.86,
      wti_w: 6.39, wti_m: -8.79,
      usd_w: -0.27, usd_m: -1.77 },
    { date: "2026-04-20", scan: "04-25",
      brent_w: 10.40, brent_m: -11.36,
      wti_w: 13.15, wti_m: -4.78,
      usd_w: 0.42, usd_m: -0.16 },
    // Agrega más semanas aquí (más recientes primero)
      { date: "2026-04-13", scan: "04-18",
      brent_w: 5.71, brent_m: -2.72,
      wti_w: 1.23, wti_m: 1.45,
      usd_w: 0.59, usd_m: -0.11 },
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