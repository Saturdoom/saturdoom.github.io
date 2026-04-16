// script.js - intersection observer + DEFCON threat level logic
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

  // DEFCON level calculation based on Technology and Energy Perf W
  function updateDefcon() {
    const firstWeek = document.querySelector('.week-block');
    if (!firstWeek) return;

    const rows = firstWeek.querySelectorAll('tbody tr');
    if (rows.length < 6) return;

    // Energy row = index 2, Technology row = index 5
    const techCell = rows[5].querySelector('td:nth-child(3)'); // Perf W column
    const energyCell = rows[2].querySelector('td:nth-child(3)');

    if (!techCell || !energyCell) return;

    let techVal = parseFloat(techCell.innerText);
    let energyVal = parseFloat(energyCell.innerText);
    if (isNaN(techVal) || isNaN(energyVal)) return;

    let level = 3; // default DEFCON 3 (yellow)

    // DEFCON 1: red – severe divergence (Tech < -2.5% and Energy > +2.5%)
    if (techVal < -2.5 && energyVal > 2.5) {
      level = 1;
    }
    // DEFCON 2: orange – moderate divergence (Tech < 0% and Energy > 0%)
    else if (techVal < 0 && energyVal > 0) {
      level = 2;
    }
    // DEFCON 3: yellow – mixed or both negative (Tech < 0 and Energy < 0)
    else if (techVal < 0 && energyVal < 0) {
      level = 3;
    }
    // DEFCON 4: greenish – Tech positive, Energy negative (calm)
    else if (techVal > 0 && energyVal < 0) {
      level = 4;
    }
    // DEFCON 5: green – both positive or Tech >0 and Energy >=0
    else {
      level = 5;
    }

    // Update DEFCON squares: remove active class from all, add to current level
    const allLevels = document.querySelectorAll('.defcon-level');
    allLevels.forEach(el => el.classList.remove('active'));
    const activeLevel = document.querySelector(`.defcon-level[data-level="${level}"]`);
    if (activeLevel) activeLevel.classList.add('active');
  }

  // Run on load and also after any potential dynamic updates (e.g., new weeks added)
  updateDefcon();
})();