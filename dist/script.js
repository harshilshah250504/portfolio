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

const explorerProjects = {
  aqinsight: {label:'01 / ENVIRONMENTAL DATA',title:'AQInsight',description:'Exploring air quality alongside weather, traffic, and wildfire data.',stack:'XGBoost · K-Means · SHAP',nodes:['Weather','Air quality','Wildfires','Patterns','Clusters','Explanations'],color:'#8acbc0'},
  phishing: {label:'02 / LANGUAGE & EMAIL RISK',title:'Phishing across languages',description:'Working with English and Hindi email features to explain classification decisions.',stack:'XGBoost · NLP · SHAP',nodes:['English','Hindi','Features','Classification','Risk signals','Explanations'],color:'#86b9d6'},
  'statistical-testing': {label:'03 / STATISTICS',title:'Which statistical test?',description:'Using natural-language questions to explore non-parametric test selection.',stack:'Decision trees · NLP · Statistics',nodes:['Question','Data','Assumptions','Runs','Wilcoxon','Mann–Whitney'],color:'#a7aed5'},
  finwizard: {label:'04 / FINANCIAL DATA',title:'FinWizard',description:'Exploring historical stock data, news sentiment, and deep learning models.',stack:'Python · CNN / RNN / LSTM · NLP',nodes:['Prices','News','Sentiment','CNN','RNN','LSTM'],color:'#e8ac91'}
};
const explorer = document.querySelector('.data-workspace');
explorer.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.project, project = explorerProjects[key];
    explorer.querySelectorAll('[data-project]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
    explorer.style.setProperty('--explorer-color',project.color);
    explorer.querySelector('.explorer-kicker').textContent = project.label;
    explorer.querySelector('.explorer-title').textContent = project.title;
    explorer.querySelector('.explorer-description').textContent = project.description;
    explorer.querySelector('.explorer-stack').textContent = project.stack;
    explorer.querySelector('.explorer-link').href = `#${key}`;
    explorer.querySelectorAll('[data-node]').forEach(node => { node.textContent = project.nodes[Number(node.dataset.node)]; });
    const detail = explorer.querySelector('.explorer-detail');
    detail.classList.remove('changing');
    if (!paused && !reducedMotion.matches) requestAnimationFrame(() => detail.classList.add('changing'));
  });
});

// Start dashboard enhances the complete, readable HTML portfolio.
const dashboard = document.querySelector('.welcome-dashboard');
dashboard.id = 'home';
const sectionWindow = document.querySelector('.section-window');
const windowContent = sectionWindow.querySelector('.section-window-content');
const sectionNames = {education:'🎓 Education',experience:'💼 Experience',work:'📊 Projects','case-studies':'📚 Research',about:'🙋 About me',beyond:'🌱 Beyond work',contact:'✉ Say hello'};
let movedSections = [];
let lastDashboardTrigger = null;
function restoreSections() {
  movedSections.forEach(({section,marker}) => { marker.replaceWith(section); });
  movedSections = [];
}
function showDashboard() {
  if (sectionWindow.open) sectionWindow.close();
  restoreSections();
  document.body.classList.add('dashboard-mode');
  dashboard.hidden = false;
  document.querySelectorAll('.header nav a').forEach(link => { link.classList.remove('active'); link.removeAttribute('aria-current'); });
  history.replaceState(null,'',location.pathname + location.search);
  window.scrollTo({top:0,behavior:'instant'});
}
function showFullPortfolio(target) {
  if (sectionWindow.open) sectionWindow.close();
  restoreSections();
  document.body.classList.remove('dashboard-mode');
  dashboard.hidden = true;
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  if (target) document.getElementById(target)?.scrollIntoView({behavior:paused?'instant':'smooth'});
  else window.scrollTo({top:0,behavior:'instant'});
}
function openSection(key,trigger) {
  const detailTarget = document.getElementById(key);
  if (!detailTarget) return;
  restoreSections();
  let group = key;
  if (detailTarget.matches('details.case')) group = 'case-studies';
  const ids = group === 'work' ? ['work','case-studies'] : group === 'about' ? ['about','strengths'] : group === 'beyond' ? ['beyond','leadership'] : [group];
  ids.forEach(id => {
    const section = document.getElementById(id);
    if (!section) return;
    const marker = document.createComment(`section:${id}`);
    section.before(marker); movedSections.push({section,marker}); windowContent.append(section);
  });
  sectionWindow.querySelector('#section-window-title').textContent = sectionNames[group] || 'Explore';
  lastDashboardTrigger = trigger || lastDashboardTrigger;
  if (!sectionWindow.open) sectionWindow.showModal();
  sectionWindow.scrollTop = 0;
  if (detailTarget.matches('details.case')) { detailTarget.open = true; detailTarget.scrollIntoView({block:'nearest'}); }
  sectionWindow.querySelector('.close-section').focus({preventScroll:true});
}
document.querySelectorAll('[data-open-section]').forEach(button => button.addEventListener('click', () => openSection(button.dataset.openSection,button)));
sectionWindow.querySelector('.close-section').addEventListener('click', () => sectionWindow.close());
sectionWindow.addEventListener('close', () => { restoreSections(); if (document.body.classList.contains('dashboard-mode')) history.replaceState(null,'',location.pathname+location.search); lastDashboardTrigger?.focus({preventScroll:true}); });
document.querySelector('.read-portfolio').addEventListener('click', () => showFullPortfolio());
document.addEventListener('click',event => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor) return;
  const key = anchor.getAttribute('href').slice(1);
  if (key === 'home') { event.preventDefault(); showDashboard(); return; }
  if (!document.body.classList.contains('dashboard-mode')) return;
  if (key === 'main' || !key) { event.preventDefault(); showFullPortfolio(); return; }
  const target = document.getElementById(key);
  if (!target) return;
  if (sectionWindow.contains(target)) return;
  event.preventDefault(); openSection(key,anchor);
});
const greetingWord = document.querySelector('.greeting-word');
const greetings = ['Hello.','Namaste.','Ciao.','Bonjour.','Kem cho.'];
let greetingIndex = 0;
setInterval(() => {
  if (paused || reducedMotion.matches || document.hidden || dashboard.hidden || sectionWindow.open) return;
  greetingIndex = (greetingIndex + 1) % greetings.length;
  greetingWord.textContent = greetings[greetingIndex];
  greetingWord.classList.remove('greeting-enter');
  requestAnimationFrame(() => greetingWord.classList.add('greeting-enter'));
},2800);
const greetingToggle = document.querySelector('.dashboard-motion');
function syncGreetingToggle() { greetingToggle.textContent = paused ? 'Resume greetings' : 'Pause greetings'; greetingToggle.setAttribute('aria-pressed',String(paused)); }
greetingToggle.addEventListener('click',() => { paused = !paused; updateMotion(); syncGreetingToggle(); });
toggle.addEventListener('click',syncGreetingToggle);
reducedMotion.addEventListener('change',syncGreetingToggle);
syncGreetingToggle();
if (location.pathname.endsWith('/portfolio.html')) { showFullPortfolio(); } else if (!location.hash || location.hash === '#home') { showDashboard(); }
