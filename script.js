(function() {
  // ============================================================
  // DEFCON PANEL (Energy & Technology)
  // ============================================================
  const weeksData = [
    { date: "2026-08-10", scan: "08-15", energy: 7.67, tech: -3.09},
    { date: "2026-08-03", scan: "08-08", energy: -3.44, tech: 7.20},
    { date: "2026-07-27", scan: "08-01", energy: -0.12, tech: -0.30},
    { date: "2026-07-20", scan: "07-25", energy: 3.36, tech: 0.17},
    { date: "2026-07-13", scan: "07-18", energy: 4.72, tech: -5.48},
    { date: "2026-07-06", scan: "07-11", energy: 3.49, tech: 2.87},
    { date: "2026-06-29", scan: "07-04", energy: -1.15, tech: -0.29},
    { date: "2026-06-22", scan: "06-27", energy: 0.84, tech: -5.28},
    { date: "2026-06-15", scan: "06-20", energy: -6.56, tech: 3.59},
    { date: "2026-06-08", scan: "06-13", energy: -0.21, tech: 2.49},
    { date: "2026-06-01", scan: "06-06", energy: 2.45, tech: -5.61},
    { date: "2026-05-25", scan: "05-30", energy: -4.80, tech: 6.95},
    { date: "2026-05-18", scan: "05-23", energy: 0.08, tech: 2.35},
    { date: "2026-05-11", scan: "05-16", energy: 6.71, tech: 0.42},
    { date: "2026-05-04", scan: "05-09", energy: -5.36, tech: 8.43},
    { date: "2026-04-27", scan: "05-02", energy: 3.49, tech: 1.03},
    { date: "2026-04-20", scan: "04-25", energy: 3.35, tech: 3.80},
    { date: "2026-04-13", scan: "04-18", energy: -3.37, tech: 8.22},
    { date: "2026-04-06", scan: "04-11", energy: -3.91, tech: 4.87},
    { date: "2026-03-30", scan: "04-04", energy: -5.28, tech: 4.67},
    { date: "2026-03-23", scan: "03-28", energy: 6.17, tech: -3.85},
    { date: "2026-03-16", scan: "03-21", energy: 2.79, tech: -1.11},
    { date: "2026-03-09", scan: "03-14", energy: 1.99, tech: -0.36},
    { date: "2026-03-02", scan: "03-07", energy: 1.16, tech: -1.05},
    { date: "2026-02-23", scan: "02-28", energy: 1.90, tech: -1.51},
    { date: "2026-02-16", scan: "02-21", energy: 0.97, tech: 0.95},
    { date: "2026-02-09", scan: "02-14", energy: 2.06, tech: -1.12},
    { date: "2026-02-02", scan: "02-07", energy: 4.31, tech: -1.91},
    { date: "2026-01-26", scan: "01-31", energy: 3.79, tech: -0.84},
  ];

  let currentIndex = 0;

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
        <td class="value">${asset.display}</td>
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

    updateButtons();
  }

  function updateButtons() {
    if (currentIndex === weeksData.length - 1) {
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

  function prevWeek() {
    if (currentIndex + 1 < weeksData.length) {
      currentIndex++;
      renderWeek(currentIndex);
      renderGiro(currentIndex);
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
  // GIRO PANEL
  // ============================================================
  const giroData = [
    { date: "2026-08-10", scan: "08-15", brent_w: 5.95, wti_w: -5.40, usd_w: 0.7 },
    { date: "2026-08-03", scan: "08-08", brent_w: -7.29, wti_w: -7.67, usd_w: -0.20 },
    { date: "2026-07-27", scan: "08-01", brent_w: -6.88, wti_w: -5.2, usd_w: -1.65 },
    { date: "2026-07-20", scan: "07-25", brent_w: 9.85, wti_w: 8.27, usd_w: 0.71 },
    { date: "2026-07-13", scan: "07-18", brent_w: 15.91, wti_w: 15.52, usd_w: -0.22 },
    { date: "2026-07-06", scan: "07-11", brent_w: 5.86, wti_w: 3.96, usd_w: 0.11 },
    { date: "2026-06-29", scan: "07-04", brent_w: -0.26, wti_w: -0.78, usd_w: -0.49 },
    { date: "2026-06-22", scan: "06-27", brent_w: -9.84, wti_w: -9.62, usd_w: 0.51 },
    { date: "2026-06-15", scan: "06-20", brent_w: -8.57, wti_w: -9.75, usd_w: 1.10 },
    { date: "2026-06-08", scan: "06-13", brent_w: -6.19, wti_w: -6.25, usd_w: -0.32 },
    { date: "2026-06-01", scan: "06-06", brent_w: 1.13, wti_w: 3.64, usd_w: 1.14 },
    { date: "2026-05-25", scan: "05-30", brent_w: -10.27, wti_w: -9.33, usd_w: -0.25 },
    { date: "2026-05-18", scan: "05-23", brent_w: -5.24, wti_w: -8.37, usd_w: 0.05 },
    { date: "2026-05-11", scan: "05-16", brent_w: 7.87, wti_w: 10.48, usd_w: 1.46 },
    { date: "2026-05-04", scan: "05-09", brent_w: -6.93, wti_w: -6.40, usd_w: -0.38 },
    { date: "2026-04-27", scan: "05-02", brent_w: 3.32, wti_w: 7.99, usd_w: -0.30 },
    { date: "2026-04-20", scan: "04-25", brent_w: 16.54, wti_w: 12.58, usd_w: 0.42 },
    { date: "2026-04-13", scan: "04-18", brent_w: -5.06, wti_w: -13.17, usd_w: -0.56 },
    { date: "2026-04-06", scan: "04-11", brent_w: -13.27, wti_w: -14.09, usd_w: -1.33 },
    { date: "2026-03-30", scan: "04-04", brent_w: -2.49, wti_w: 12.82, usd_w: -0.17 },
    { date: "2026-03-23", scan: "03-28", brent_w: 0.34, wti_w: 1.34, usd_w: 0.50 },
    { date: "2026-03-16", scan: "03-21", brent_w: 8.77, wti_w: -0.40, usd_w: -0.71 },
    { date: "2026-03-09", scan: "03-14", brent_w: 11.27, wti_w: 8.59, usd_w: 1.38 },
    { date: "2026-03-02", scan: "03-07", brent_w: 27.88, wti_w: 35.63, usd_w: 1.41 },
    { date: "2026-02-23", scan: "02-29", brent_w: 1.00, wti_w: 0.95, usd_w: -0.19 },
    { date: "2026-02-16", scan: "02-21", brent_w: 5.92, wti_w: 5.57, usd_w: 0.95 },
    { date: "2026-02-09", scan: "02-14", brent_w: -0.44, wti_w: -1.04, usd_w: -0.77 },
    { date: "2026-02-02", scan: "02-07", brent_w: -3.73, wti_w: -2.55, usd_w: 0.66 },
    { date: "2026-02-26", scan: "01-31", brent_w: 7.30, wti_w: 6.78, usd_w: -0.62 },
  ];

  const giroTableBody = document.getElementById('giroTableBody');

  const lcdWhiteOff = "#c8c8b8";
  const iconDark = "#646464";
  const digitDark = '#010501';
  const shadow = 'rgba(100, 100, 100, 0.6)';

  function getGiroDirection(brent_w, wti_w, usd_w) {
    if (brent_w > 1.0 && usd_w > 0.5 && wti_w < -0.5) return 'right';
    if (brent_w < -0.5 && usd_w < -0.5 && wti_w > 1.0) return 'left';
    return 'up';
  }

  function drawGauge(direction) {
    const canvas = document.getElementById('gaugeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = lcdWhiteOff;
    ctx.fillRect(0, 0, width, height);

    // Degradado de luz desde arriba-izquierda
    const highlightColor = getComputedStyle(document.documentElement).getPropertyValue('--lcd-white-on').trim();
    const highlightOpacity = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--highlight-opacity').trim()
    ) || 0.5;

    ctx.globalAlpha = highlightOpacity;
    
    ctx.save();
    // Prueba
    const grad = ctx.createLinearGradient(0, 0, width * 0.6, height * 0.4);
    grad.addColorStop(0, highlightColor);
    grad.addColorStop(1, 'rgba(200, 100, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    //const grad = ctx.createLinearGradient(0, 0, width, height);
    //grad.addColorStop(0, highlightColor);
    //grad.addColorStop(1, 'transparent');
    //ctx.fillStyle = grad;
    //ctx.fillRect(0, 0, width, height);
    //ctx.globalAlpha = 1;

    const yOffset = 76;
    ctx.translate(width / 2, height / 2 + yOffset);
    ctx.rotate(-Math.PI / 2);

    const radius = Math.min(width, height) * 0.95;
    const centerX = 0;
    const centerY = 0;
    const startAngle = -Math.PI / 2;
    const sweep = Math.PI;
    const sectorAngle = sweep / 3;

    const verde = getComputedStyle(document.documentElement).getPropertyValue('--giro-verde').trim();
    const amarillo = getComputedStyle(document.documentElement).getPropertyValue('--giro-amarillo').trim();
    const rojo = getComputedStyle(document.documentElement).getPropertyValue('--giro-rojo').trim();

    ctx.shadowBlur = 0;
    //ctx.shadowBlur = 6;
    //ctx.shadowColor = shadow;
    //ctx.shadowOffsetX = 4;
    //ctx.shadowOffsetY = 1;

    // sectores (relleno claro)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sectorAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = lcdWhiteOff;
    ctx.fill();
    ctx.strokeStyle = iconDark;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle + sectorAngle, startAngle + 2 * sectorAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = lcdWhiteOff;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle + 2 * sectorAngle, startAngle + 3 * sectorAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = lcdWhiteOff;
    ctx.fill();
    ctx.stroke();

    // arco coloreado
    ctx.shadowBlur = 0;
    ctx.lineWidth = 3;

    ctx.strokeStyle = verde;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sectorAngle);
    ctx.stroke();

    ctx.strokeStyle = amarillo;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle + sectorAngle, startAngle + 2 * sectorAngle);
    ctx.stroke();

    ctx.strokeStyle = rojo;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle + 2 * sectorAngle, startAngle + 3 * sectorAngle);
    ctx.stroke();

    // aguja
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
    if (dateHeader && w.date) {
      dateHeader.innerHTML = ` WEEK ${w.date} · SCAN ${w.scan}`;
    }

    const assets = [
      { name: "BRENT", w: w.brent_w, m: w.brent_m },
      { name: "WTI",   w: w.wti_w,   m: w.wti_m },
      { name: "USD",   w: w.usd_w,   m: w.usd_m }
    ];
    giroTableBody.innerHTML = assets.map(a => {
      return `
        <tr>
          <td class="asset">${a.name}</td>
          <td class="value">${a.w > 0 ? '+' : ''}${a.w}%</td>
        </tr>
      `;
    }).join('');

    const direction = getGiroDirection(w.brent_w, w.wti_w, w.usd_w);
    drawGauge(direction);
  }

  renderWeek(currentIndex);
  renderGiro(currentIndex);
})();