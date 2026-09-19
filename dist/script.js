function revealCase() {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target && target.tagName === 'DETAILS') target.open = true;
}
window.addEventListener('hashchange', revealCase);
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
  const target = document.getElementById(link.getAttribute('href').slice(1));
  if (target && target.tagName === 'DETAILS') target.open = true;
}));
revealCase();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
const toggle = document.querySelector('.motion-toggle');
function updateMotion() {
  document.body.classList.toggle('motion-paused', paused);
  toggle.textContent = paused ? 'Enable motion' : 'Pause motion';
  toggle.setAttribute('aria-pressed', String(paused));
}
toggle.addEventListener('click', () => { paused = !paused; updateMotion(); });
reducedMotion.addEventListener('change', event => { paused = event.matches; updateMotion(); });
updateMotion();
if ('IntersectionObserver' in window) {
  document.body.classList.add('reveal-enabled');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold: .08});
  document.querySelectorAll('.section-heading, .experience-row, .leadership-inner, .case, .about, .contact').forEach(el => {
    el.classList.add('reveal'); observer.observe(el);
  });
}
document.querySelectorAll('.tilt').forEach(el => {
  let frame = 0;
  el.addEventListener('pointermove', event => {
    if (paused || reducedMotion.matches || event.pointerType !== 'mouse') return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const box = el.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      el.style.setProperty('--rx', `${-y * 7}deg`);
      el.style.setProperty('--ry', `${x * 9}deg`);
    });
  });
  el.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
  });
});

const progress = document.querySelector('.reading-progress');
let scrollFrame = 0;
function updateProgress() {
  const range = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${range > 0 ? Math.min(100, scrollY / range * 100) : 0}%`;
}
window.addEventListener('scroll', () => {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(updateProgress);
}, {passive:true});
window.addEventListener('resize', updateProgress);
updateProgress();
const glow = document.querySelector('.cursor-glow');
let glowFrame = 0;
window.addEventListener('pointermove', event => {
  if (paused || reducedMotion.matches || event.pointerType !== 'mouse') return;
  cancelAnimationFrame(glowFrame);
  glowFrame = requestAnimationFrame(() => {
    glow.style.transform = `translate(${event.clientX - 260}px, ${event.clientY - 260}px)`;
  });
}, {passive:true});

const atmosphere = document.createElement('div');
atmosphere.className = 'ambient-scene';
atmosphere.setAttribute('aria-hidden', 'true');
atmosphere.innerHTML = '<i class="ambient-orb"></i><i class="ambient-orb"></i><i class="orbital"></i>';
document.body.prepend(atmosphere);

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
document.querySelectorAll('.project, .beyond-card').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (paused || !finePointer.matches) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  }, {passive:true});
});
document.querySelectorAll('.button').forEach(button => {
  button.addEventListener('pointermove', event => {
    if (paused || !finePointer.matches) return;
    const rect = button.getBoundingClientRect();
    button.style.translate = `${(event.clientX - rect.left - rect.width / 2) * .09}px ${(event.clientY - rect.top - rect.height / 2) * .14}px`;
  });
  button.addEventListener('pointerleave', () => { button.style.translate = '0px 0px'; });
});
if ('IntersectionObserver' in window) {
  const cardObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      cardObserver.unobserve(entry.target);
    }
  }), {threshold:.08});
  document.querySelectorAll('.project-grid, .strength-grid, .education-grid, .beyond-grid').forEach(grid => {
    [...grid.children].forEach((card, index) => {
      card.classList.add('reveal');
      card.style.setProperty('--reveal-delay', `${index % 2 * 100}ms`);
      cardObserver.observe(card);
    });
  });
  const navLinks = [...document.querySelectorAll('.header nav a')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.hash === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin:'-10% 0px -55% 0px',threshold:0});
  navLinks.forEach(link => {
    const section = document.querySelector(link.hash);
    if (section) sectionObserver.observe(section);
  });
}

// Native links keep the skills grid usable without JavaScript.
document.querySelectorAll('.bento-tile').forEach(tile => {
  tile.addEventListener('pointermove', event => {
    if (paused || !finePointer.matches) return;
    const rect = tile.getBoundingClientRect();
    tile.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    tile.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  }, {passive:true});
});
const caseSection = document.getElementById('case-studies');
const caseTools = document.createElement('div');
caseTools.className = 'case-tools';
const caseControl = document.createElement('button');
caseControl.type = 'button'; caseControl.className = 'case-control';
caseTools.append(caseControl);
caseSection.querySelector('.section-heading').after(caseTools);
const cases = [...caseSection.querySelectorAll('details.case')];
function updateCaseControl() {
  const allOpen = cases.every(item => item.open);
  caseControl.textContent = allOpen ? 'Collapse all case studies −' : 'Expand all case studies +';
  caseControl.setAttribute('aria-expanded', String(allOpen));
}
caseControl.addEventListener('click', () => {
  const open = !cases.every(item => item.open);
  cases.forEach(item => { item.open = open; });
  updateCaseControl();
});
cases.forEach(item => item.addEventListener('toggle', updateCaseControl));
updateCaseControl();
document.querySelectorAll('.button').forEach(button => {
  button.addEventListener('click', event => {
    if (paused || reducedMotion.matches) return;
    const rect = button.getBoundingClientRect();
    const wave = document.createElement('span');
    wave.className = 'click-wave'; wave.setAttribute('aria-hidden', 'true');
    wave.style.left = `${(event.detail ? event.clientX - rect.left : rect.width / 2) - 10}px`;
    wave.style.top = `${(event.detail ? event.clientY - rect.top : rect.height / 2) - 10}px`;
    button.append(wave);
    setTimeout(() => wave.remove(), 650);
  });
});
