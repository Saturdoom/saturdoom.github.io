// script.js - intersection observer for scroll reveal + threat level logic
(function() {
  // reveal weeks on scroll
  const weeks = document.querySelectorAll('.week-block');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.2 });
  weeks.forEach(block => observer.observe(block));

  // threat level based on Technology (Perf W) vs Energy (Perf W)
  function updateThreat() {
    const firstWeek = document.querySelector('.week-block');
    if (!firstWeek) return;

    // find rows: Technology is usually the 6th row (index 5)
    const rows = firstWeek.querySelectorAll('tbody tr');
    if (rows.length < 6) return;

    const techCell = rows[5].querySelector('td:nth-child(3)'); // Perf W column
    const energyCell = rows[2].querySelector('td:nth-child(3)'); // Energy row, Perf W

    if (!techCell || !energyCell) return;

    const techVal = parseFloat(techCell.innerText);
    const energyVal = parseFloat(energyCell.innerText);
    const threatSpan = document.getElementById('threatLevel');
    if (isNaN(techVal) || isNaN(energyVal)) return;

    if (techVal < -2.5 && energyVal > 2.5) {
      threatSpan.innerText = '🔴';
    } else if (techVal < 0 && energyVal > 0) {
      threatSpan.innerText = '🟠';
    } else {
      threatSpan.innerText = '🟡';
    }
  }

  updateThreat();
})();