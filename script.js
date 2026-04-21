(function() {
  // ============================================================
  // DEFCON panel (Energy & Technology)
  // ============================================================
  const weeksData = [
    { date: "2026-04-13", scan: "04-18", energy: -3.85, tech: 7.73},
    // Agrega más semanas aquí (más recientes primero)
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

    dateHeader.innerHTML = `🪖 WEEK ${week.date} · SCAN ${week.scan}`;
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

    updateDefconButtons();
  }

  function updateDefconButtons() {
    if (currentIndex === 0) {
      prevBtn.setAttribute('disabled', 'disabled');
      prevBtn.classList.add('disabled');
    } else {
      prevBtn.removeAttribute('disabled');
      prevBtn.classList.remove('disabled');
    }
    if (currentIndex === weeksData.length - 1) {
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
    }
  }

  function nextWeek() {
    if (currentIndex - 1 >= 0) {
      currentIndex--;
      renderWeek(currentIndex);
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

  renderWeek(currentIndex);

  // ============================================================
  // GIRO panel (Brent, WTI, USD) con gráfico de aguja semicircular
  // ============================================================
  const giroData = [
    { date: "2026-04-13", scan: "04-18",
      brent_w: -5.06, brent_m: -7.8,
      wti_w: -11.24, wti_m: -10.24,
      usd_w: -0.55, usd_m: -1.44 },
    // Agrega más semanas aquí (más recientes primero)
  ];

  let currentGiroIndex = 0;

  const giroDateHeader = document.getElementById('giroDateHeader');
  const giroTableBody = document.getElementById('giroTableBody');
  const prevGiroBtn = document.getElementById('prevGiroBtn');
  const nextGiroBtn = document.getElementById('nextGiroBtn');

  function getGiroDirection(brent_w, wti_w, usd_w) {
    if (brent_w > 1.0 && usd_w > 0.5 && wti_w < -0.5) return 'right';
    if (brent_w < -0.5 && usd_w < -0.5 && wti_w > 1.0) return 'left';
    return 'up';
  }

  // Dibuja el semicírculo rotado 90° antihorario, sin recortes
  function drawGauge(direction) {
    const canvas = document.getElementById('gaugeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    // Desplazar al centro en x, y desplazar hacia abajo en y, y rotar -90° counterclockwise
    const yOffset = 158;
    ctx.translate(width / 2, height / 2 + yOffset);
    ctx.rotate(-Math.PI / 2);
    
    const radius = Math.min(width, height) * .9;
    const centerX = 0;
    const centerY = 0;
    const startAngle = -Math.PI / 2;
    const sweep = Math.PI;
    const sectorAngle = sweep / 3;
    
    const colors = {
      left: '#88ff88',   // TECH
      center: '#ffff88', // UNCERTAIN
      right: '#ff8888'   // ENERGY
    };
    
    // Configurar sombra para los sectores
    //ctx.shadowBlur = 4;
    //ctx.shadowColor = 'rgba(100, 100, 100, 0.6)';
    //ctx.shadowOffsetX = 4;
    //ctx.shadowOffsetY = 1;

    // Sector izquierdo (TECH)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sectorAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = colors.left;
    ctx.fill();
    ctx.strokeStyle = '#c4c0a8';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Sector central (UNCERTAIN)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle + sectorAngle, startAngle + 2 * sectorAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = colors.center;
    ctx.fill();
    ctx.stroke();
    
    // Sector derecho (ENERGY)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle + 2 * sectorAngle, startAngle + 3 * sectorAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = colors.right;
    ctx.fill();
    ctx.stroke();
    
    // Borde exterior
    //ctx.beginPath();
    //ctx.arc(centerX, centerY, radius, startAngle, startAngle + sweep);
    //ctx.strokeStyle = '#6bc84b';
    //ctx.lineWidth = 2;
    //ctx.stroke();
    
    // Restaurar sombras antes de dibujar la aguja
    //ctx.shadowBlur = 0;
    //ctx.shadowOffsetX = 0;
    //ctx.shadowOffsetY = 0;


    // Ángulo de la aguja
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
    
    ctx.shadowOffsetX = 6;   // desplazamiento derecha
    ctx.shadowOffsetY = 4;   // desplazamiento abajo
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#010501';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(needleX, needleY);
    ctx.strokeStyle = '#4a4a2c';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0; // restaurar
    
    // Círculo central
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#4a4a2c';
    ctx.fill();
    
    ctx.restore();
  }

  function renderGiro(index) {
    const w = giroData[index];
    if (!w) return;
    giroDateHeader.innerHTML = `🪖 WEEK ${w.date} · SCAN ${w.scan}`;

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
    updateGiroButtons();
  }

  function updateGiroButtons() {
    if (currentGiroIndex === 0) {
      prevGiroBtn.setAttribute('disabled', 'disabled');
      prevGiroBtn.classList.add('disabled');
    } else {
      prevGiroBtn.removeAttribute('disabled');
      prevGiroBtn.classList.remove('disabled');
    }
    if (currentGiroIndex === giroData.length - 1) {
      nextGiroBtn.setAttribute('disabled', 'disabled');
      nextGiroBtn.classList.add('disabled');
    } else {
      nextGiroBtn.removeAttribute('disabled');
      nextGiroBtn.classList.remove('disabled');
    }
  }

  function prevGiro() {
    if (currentGiroIndex + 1 < giroData.length) {
      currentGiroIndex++;
      renderGiro(currentGiroIndex);
    }
  }

  function nextGiro() {
    if (currentGiroIndex - 1 >= 0) {
      currentGiroIndex--;
      renderGiro(currentGiroIndex);
    }
  }

  prevGiroBtn.addEventListener('click', prevGiro);
  nextGiroBtn.addEventListener('click', nextGiro);

  function getGiroIndexByDate(dateStr) {
    return giroData.findIndex(week => week.date === dateStr);
  }
  if (weekParam) {
    const giroIdx = getGiroIndexByDate(weekParam);
    if (giroIdx !== -1) currentGiroIndex = giroIdx;
  }

  renderGiro(currentGiroIndex);

  // ============================================================
  // NUEVO: Redimensionado automático del canvas para móvil
  // ============================================================
  function resizeCanvasAndRedraw() {
    const canvas = document.getElementById('gaugeCanvas');
    if (!canvas) return;
    const container = canvas.parentElement; // .giro-container
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0) return;
    // Establecer el tamaño real del canvas (en píxeles) igual al ancho del contenedor
    //canvas.width = rect.width;
    //canvas.height = rect.width * 0.5; // mantiene la proporción del semicírculo
    canvas.width = 600;
    canvas.height = 300;
    // Volver a dibujar con la dirección actual
    const w = giroData[currentGiroIndex];
    if (w) {
      const direction = getGiroDirection(w.brent_w, w.wti_w, w.usd_w);
      drawGauge(direction);
    }
  }

  // Redibujar al cargar (después de que el DOM esté listo)
  window.addEventListener('load', function() {
    resizeCanvasAndRedraw();
  });
  window.addEventListener('resize', function() {
    setTimeout(resizeCanvasAndRedraw, 200);
  });
  
  // También llamar una vez ahora por si el load ya ocurrió
  setTimeout(resizeCanvasAndRedraw, 100);
})();