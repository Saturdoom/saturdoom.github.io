(function() {
  // Datos ordenados de la MÁS RECIENTE a la MÁS ANTIGUA
  const weeksData = [
    { date: "2026-04-13", scan: "04-13", energy: 7.73, tech: -3.85 },
  ];

  let currentIndex = 0;

  const dateHeader = document.getElementById('weekDateHeader');
  const tableBody = document.getElementById('weekTableBody');
  const prevBtn = document.getElementById('prevWeekBtn');
  const nextBtn = document.getElementById('nextWeekBtn');

  // Determinar clase de color según comparación con semana anterior (índice+1)
  function getTrendClass(currentVal, prevVal) {
    if (prevVal === undefined) return 'neutral'; // sin dato previo
    if (currentVal > prevVal) return 'up';
    if (currentVal < prevVal) return 'down';
    return 'neutral';
  }

  function renderWeek(index) {
    const week = weeksData[index];
    if (!week) return;

    const prevWeek = weeksData[index + 1]; // semana anterior (más vieja)
    const energyTrend = getTrendClass(week.energy, prevWeek?.energy);
    const techTrend = getTrendClass(week.tech, prevWeek?.tech);

    dateHeader.innerHTML = `🪖 WEEK ${week.date} · SCAN ${week.scan}`;

    // Formatear valores con signo y sin flechas
    const energyDisplay = (week.energy > 0 ? `+${week.energy}%` : `${week.energy}%`);
    const techDisplay = (week.tech > 0 ? `+${week.tech}%` : `${week.tech}%`);

    // Ordenar por valor actual (mayor primero)
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

    // Cálculo DEFCON (usando valores actuales)
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
})();