(function() {
  // ============================================================
  // DEFCON PANEL (Energy & Technology)
  // ============================================================
  const weeksData = [
    { date: "2026-04-13", scan: "04-18", energy: 7.73, tech: -3.85 },
    // Agrega más semanas aquí (más recientes primero)
  ];

  let currentIndex = 0;

  const dateHeader = document.getElementById('weekDateHeader');
  const tableBody = document.getElementById('weekTableBody');
  const prevBtn = document.getElementById('prevWeekBtn');
  const nextBtn = document.getElementById('nextWeekBtn');

  function getTrendClass(currentVal, prevVal) {
    if (prevVal === undefined) return 'neutral';
    if (currentVal > prevVal) return 'up';
    if (currentVal < prevVal) return 'down';
    return 'neutral';
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
    // Botón anterior (izquierda)
    if (currentIndex === 0) {
      prevBtn.setAttribute('disabled', 'disabled');
      prevBtn.classList.add('disabled');
    } else {
      prevBtn.removeAttribute('disabled');
      prevBtn.classList.remove('disabled');
    }
    // Botón siguiente (derecha)
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
  renderWeek(currentIndex);

  // ============================================================
  // GIRO PANEL (Brent, WTI, USD)
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
  const giroArrow = document.getElementById('giroArrow');

  function getGiroDirection(brent_w, wti_w, usd_w) {
    if (brent_w > 1.0 && usd_w > 0.5 && wti_w < -0.5) return 'right';
    if (brent_w < -0.5 && usd_w < -0.5 && wti_w > 1.0) return 'left';
    return 'up';
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
      const wClass = a.w > 0 ? 'up' : (a.w < 0 ? 'down' : 'neutral');
      const mClass = a.m > 0 ? 'up' : (a.m < 0 ? 'down' : 'neutral');
      return `
        <tr>
          <td class="asset">${a.name}</td>
          <td class="${wClass}">${a.w > 0 ? '+' : ''}${a.w}%</td>
          <td class="${mClass}">${a.m > 0 ? '+' : ''}${a.m}%</td>
        </tr>
      `;
    }).join('');

    const direction = getGiroDirection(w.brent_w, w.wti_w, w.usd_w);
    giroArrow.className = `dir-arrow arrow-${direction}`;
    giroArrow.innerText = direction === 'left' ? '←' : (direction === 'right' ? '→' : '↑');

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
  renderGiro(currentGiroIndex);
})();