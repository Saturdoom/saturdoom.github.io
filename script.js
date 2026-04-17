(function() {
  // Revelar semanas históricas al hacer scroll
  const weeks = document.querySelectorAll('.week-block');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    });
  }, { threshold: 0.2 });
  weeks.forEach(block => observer.observe(block));

  // Actualizar DEFCON desde la tabla actual (Perf W)
  function updateDefcon() {
    const currentTable = document.querySelector('#currentWeekTable tbody');
    if (!currentTable) return;
    const rows = currentTable.querySelectorAll('tr');
    if (rows.length < 2) return;

    const energyVal = parseFloat(rows[0].querySelector('td:nth-child(2)').innerText);
    const techVal = parseFloat(rows[1].querySelector('td:nth-child(2)').innerText);
    if (isNaN(energyVal) || isNaN(techVal)) return;

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

  updateDefcon();
})();