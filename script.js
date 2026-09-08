// CT Planalto — configuração e comportamento do site

window.CT_CONFIG = {
    nome: "CT Planalto",
    telefoneExibicao: "(11) 98567-7080",
    telefoneWhatsapp: "5511985677080",
    mensagens: {
      default: "Olá! Conheci o CT Planalto pelo site e quero saber mais sobre a aula experimental. Como funciona?",
      conhecer: "Olá! Conheci o CT Planalto pelo site e gostaria de conhecer melhor o espaço.",
      horarios: "Olá! Conheci o CT Planalto pelo site e gostaria de saber os horários disponíveis.",
      aula: "Olá! Conheci o CT Planalto pelo site e gostaria de saber como funciona para fazer uma aula experimental."
    },
    instagramHandle: "@ctplanaltosbc",
    instagramUrl: "https://www.instagram.com/ctplanaltosbc",
    endereco: {
      linha1: "Rua Sérgio Cardoso, 596",
      linha2: "Vila Planalto",
      linha3: "São Bernardo do Campo — SP"
    },
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Rua+S%C3%A9rgio+Cardoso+596+Vila+Planalto+S%C3%A3o+Bernardo+do+Campo",
    horarios: {
      semana: [
        { periodo: "MANHÃ", turmas: ["05h", "06h", "07h", "08h", "09h"] },
        { periodo: "NOITE", turmas: ["16h", "17h", "18h", "19h", "20h"] }
      ],
      sabado: ["09h"]
    }
  };

  function waLink(msg){
    return "https://wa.me/" + window.CT_CONFIG.telefoneWhatsapp + "?text=" + encodeURIComponent(msg || window.CT_CONFIG.mensagens.default);
  }

(function(){

  const CFG = window.CT_CONFIG;

  // ---- Preenche dados a partir do CONFIG ----
  document.getElementById('endereco-bloco').innerHTML = `${CFG.endereco.linha1}<br/>${CFG.endereco.linha2}<br/>${CFG.endereco.linha3}`;
  document.getElementById('telefone-bloco').textContent = CFG.telefoneExibicao;
  document.getElementById('btn-como-chegar').href = CFG.googleMapsUrl;
  document.getElementById('ano').textContent = new Date().getFullYear();

  const semanaWrap = document.getElementById('horarios-semana');
  CFG.horarios.semana.forEach((h,i) => {
    const div = document.createElement('div');
    div.className = 'reveal' + (i===0 ? '' : ' delay-1');
    const turmas = h.turmas.map(t => `<span class="time-chip">${t}</span>`).join('');
    div.innerHTML = `<p class="label text-[11px] text-[var(--ink-dim)] mb-5">${h.periodo}</p><div class="flex flex-wrap gap-3">${turmas}</div>`;
    semanaWrap.appendChild(div);
  });
  const sabadoWrap = document.getElementById('horario-sabado');
  if (CFG.horarios.sabado && CFG.horarios.sabado.length) {
    CFG.horarios.sabado.forEach(t => { const s=document.createElement('span'); s.className='time-chip'; s.textContent=t; sabadoWrap.appendChild(s); });
  } else {
    sabadoWrap.innerHTML = '<span class="text-sm text-[var(--ink-dim)] italic">Horário a confirmar</span>';
  }

  document.body.innerHTML = document.body.innerHTML
    .split('__INSTAGRAM_URL__').join(CFG.instagramUrl)
    .split('__INSTAGRAM_HANDLE__').join(CFG.instagramHandle);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Preloader ----
  const preloader = document.getElementById('preloader');
  function endPreload(){
    preloader.classList.add('hide');
    document.documentElement.classList.remove('locked');
    document.querySelectorAll('.hero-el, .hero-mask').forEach(el => el.classList.add('on'));
  }
  if (reducedMotion) {
    preloader.style.display = 'none';
    document.querySelectorAll('.hero-el, .hero-mask').forEach(el => el.classList.add('on'));
  } else {
    document.documentElement.classList.add('locked');
    setTimeout(endPreload, 2100);
  }

  // ---- Scroll progress + navbar + hero parallax ----
  const nav = document.getElementById('navbar');
  const heroBg = document.getElementById('hero-bg');
  const progress = document.getElementById('scroll-progress');
  const waFloat = document.getElementById('wa-float');
  let ticking = false;
  function onScroll(){
    const y = window.scrollY;
    if (y > 40) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    if (heroBg) heroBg.style.transform = `translateY(${y*0.15}px) scale(${1.08 + Math.min(y/6000,0.04)})`;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (docH>0 ? (y/docH)*100 : 0) + '%';
    if (y > window.innerHeight*0.6) waFloat.classList.add('show'); else waFloat.classList.remove('show');
    ticking = false;
  }
  window.addEventListener('scroll', () => { if(!ticking){ requestAnimationFrame(onScroll); ticking = true; } }, { passive:true });
  onScroll();

  // ---- Mobile menu ----
  const menu = document.getElementById('mobile-menu');
  document.getElementById('menu-toggle').addEventListener('click', () => menu.classList.add('open'));
  document.getElementById('menu-close').addEventListener('click', () => menu.classList.remove('open'));
  document.querySelectorAll('.mob-link').forEach(l => l.addEventListener('click', () => menu.classList.remove('open')));

  // ---- Reveal on scroll ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal, .reveal-scale, .reveal-mask, .reveal-line, .reveal-line-v, .sinta-panel').forEach(el => io.observe(el));

  // ---- Sinta o treino: destaque por toque/scroll no mobile (equivalente ao hover do PC) ----
  if (!(window.matchMedia('(hover:hover) and (pointer:fine)').matches)) {
    const sintaIO = new IntersectionObserver((entries) => {
      entries.forEach(e => { e.target.classList.toggle('touch-active', e.isIntersecting); });
    }, { threshold: 0.6 });
    document.querySelectorAll('.sinta-panel').forEach(el => sintaIO.observe(el));
  }

  // ---- FAQ: accordion com animação suave (funciona igual em PC e celular) ----
  document.querySelectorAll('.faq-item').forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';
      item.setAttribute('data-open', isOpen ? 'false' : 'true');
      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });

  // ---- Magnetic buttons (desktop only) ----
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reducedMotion) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width/2) * 0.25;
        const y = (e.clientY - r.top - r.height/2) * 0.25;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // ---- WhatsApp modal ----
  const backdrop = document.getElementById('wa-modal-backdrop');
  const modal = document.getElementById('wa-modal');
  let lastFocused = null;
  function openModal(){
    lastFocused = document.activeElement;
    backdrop.classList.add('open'); modal.classList.add('open');
    modal.querySelector('.modal-option').focus();
    document.addEventListener('keydown', onKeydown);
  }
  function closeModal(){
    backdrop.classList.remove('open'); modal.classList.remove('open');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused) lastFocused.focus();
  }
  function onKeydown(e){ if(e.key === 'Escape') closeModal(); }
  document.querySelectorAll('[data-open-modal]').forEach(btn => btn.addEventListener('click', openModal));
  backdrop.addEventListener('click', closeModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  modal.querySelectorAll('.modal-option').forEach(btn => {
    btn.addEventListener('click', () => { window.open(waLink(CFG.mensagens[btn.dataset.msg]), '_blank'); closeModal(); });
  });
  document.querySelectorAll('[data-msg]:not(.modal-option)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.hasAttribute('data-open-modal')) return; // já tratado pelo modal
      e.preventDefault();
      window.open(waLink(CFG.mensagens[btn.dataset.msg]), '_blank');
    });
  });
})();
