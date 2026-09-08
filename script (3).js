/* =========================================================
   PARTÍCULAS DE FUNDO
   ========================================================= */
(function particles(){
  const canvas = document.getElementById('bg-particles');
  const ctx = canvas.getContext('2d');
  let w, h, dots = [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = document.body.scrollHeight;
  }
  function makeDots(){
    const count = Math.min(70, Math.floor((w * h) / 45000));
    dots = Array.from({length: count}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vy: Math.random() * 0.15 + 0.03,
      hue: Math.random() > 0.5 ? '59,123,245' : '154,92,255',
      a: Math.random() * 0.5 + 0.15
    }));
  }
  function draw(){
    ctx.clearRect(0, 0, w, h);
    dots.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${d.hue},${d.a})`;
      ctx.fill();
      if(!reduceMotion){
        d.y -= d.vy;
        if(d.y < -10) d.y = h + 10;
      }
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', () => { resize(); makeDots(); });
  resize(); makeDots(); draw();
})();

/* =========================================================
   NAV FIXA "MODO APRESENTAÇÃO"
   ========================================================= */
(function presenterNav(){
  const buttons = document.querySelectorAll('.presenter-nav__buttons button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if(target) target.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  });

  const sections = Array.from(buttons).map(b => document.getElementById(b.dataset.target)).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        buttons.forEach(b => b.classList.toggle('active', b.dataset.target === entry.target.id));
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => observer.observe(s));
})();

/* Hero button */
document.getElementById('enterLabBtn')?.addEventListener('click', () => {
  document.getElementById('fossil')?.scrollIntoView({behavior:'smooth'});
});

/* =========================================================
   TOMOGRAFIA — SEQUÊNCIA INTERATIVA
   ========================================================= */
(function tomografia(){
  const startBtn = document.getElementById('startScanBtn');
  const beam = document.getElementById('scanBeam');
  const fossil = document.getElementById('scanFossil');
  const slices = document.getElementById('scanSlices');
  const model = document.getElementById('scanModel');
  const steps = document.querySelectorAll('.scan-step');

  // gera as "fatias"
  for(let i = 0; i < 14; i++){
    const s = document.createElement('span');
    slices.appendChild(s);
  }

  function setStep(n){
    steps.forEach(s => s.classList.toggle('is-active', Number(s.dataset.step) <= n));
  }

  function reset(){
    beam.classList.remove('is-scanning');
    slices.classList.remove('is-visible');
    model.classList.remove('is-visible');
    fossil.classList.remove('is-hidden');
    setStep(0);
  }

  startBtn?.addEventListener('click', () => {
    if(startBtn.disabled) return;
    startBtn.disabled = true;
    reset();
    setStep(1); // raios x
    beam.classList.add('is-scanning');

    setTimeout(() => {
      setStep(2); // cortes digitais
      fossil.classList.add('is-hidden');
      slices.classList.add('is-visible');
    }, 900);

    setTimeout(() => {
      setStep(3); // processamento
    }, 1900);

    setTimeout(() => {
      setStep(4); // modelo 3d
      slices.classList.remove('is-visible');
      model.classList.add('is-visible');
    }, 2700);

    setTimeout(() => {
      startBtn.disabled = false;
    }, 3400);
  });

  reset();
})();

/* =========================================================
   IMPRESSÃO 3D
   ========================================================= */
(function impressao(){
  const btn = document.getElementById('printBtn');
  const head = document.getElementById('printerHead');
  const fill = document.getElementById('printerFill');
  btn?.addEventListener('click', () => {
    if(btn.disabled) return;
    btn.disabled = true;
    head.classList.remove('is-printing'); fill.classList.remove('is-printing');
    void head.offsetWidth; // reinicia animação
    head.classList.add('is-printing');
    fill.classList.add('is-printing');
    setTimeout(() => { btn.disabled = false; }, 2300);
  });
})();

/* =========================================================
   QUÍMICA — DECAIMENTO RADIOATIVO
   ========================================================= */
(function decayLab(){
  const slider = document.getElementById('decaySlider');
  const parentPct = document.getElementById('parentPct');
  const childPct = document.getElementById('childPct');
  const visual = document.getElementById('decayVisual');
  const note = document.getElementById('halfLifeNote');
  if(!slider) return;

  const TOTAL_ATOMS = 40;
  const atoms = Array.from({length: TOTAL_ATOMS}, () => {
    const el = document.createElement('span');
    el.className = 'decay-atom is-parent';
    visual.appendChild(el);
    return el;
  });

  function update(){
    const halfLives = parseFloat(slider.value);
    const parentFraction = Math.pow(0.5, halfLives);
    const parentCount = Math.round(parentFraction * TOTAL_ATOMS);

    atoms.forEach((el, i) => {
      const isParent = i < parentCount;
      el.classList.toggle('is-parent', isParent);
      el.classList.toggle('is-child', !isParent);
    });

    parentPct.textContent = Math.round(parentFraction * 100) + '%';
    childPct.textContent = Math.round((1 - parentFraction) * 100) + '%';

    if(halfLives === 0){
      note.textContent = 'Meia-vida: o tempo necessário para metade dos átomos radioativos decair.';
    } else {
      note.textContent = `Depois de ${halfLives.toFixed(1)} meia(s)-vida, restam ${Math.round(parentFraction*100)}% dos átomos originais.`;
    }
  }

  slider.addEventListener('input', update);
  update();
})();

/* =========================================================
   MODELO 3D — THREE.JS
   ========================================================= */
(function model3D(){
  const container = document.getElementById('modelViewer');
  const canvas = document.getElementById('threeCanvas');
  const resetBtn = document.getElementById('resetModelBtn');
  if(!container || !canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  const defaultCamPos = new THREE.Vector3(0, 0.6, 7);
  camera.position.copy(defaultCamPos);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);

  // luzes
  scene.add(new THREE.AmbientLight(0x9fb3ff, 0.55));
  const key = new THREE.DirectionalLight(0x8fb3ff, 1.1);
  key.position.set(4, 5, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x9a5cff, 1.4, 20);
  rim.position.set(-4, 2, -4);
  scene.add(rim);

  const boneMat = new THREE.MeshStandardMaterial({ color: 0xdfe6f5, roughness: 0.55, metalness: 0.08, emissive: 0x1a2440, emissiveIntensity: 0.25 });
  const jointMat = new THREE.MeshStandardMaterial({ color: 0xbfd0ff, roughness: 0.4, metalness: 0.15, emissive: 0x2a3a70, emissiveIntensity: 0.3 });

  const rig = new THREE.Group();
  scene.add(rig);

  // ---- crânio estilizado ----
  const skull = new THREE.Group();
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 20), boneMat);
  cranium.scale.set(1, 0.85, 1.1);
  skull.add(cranium);

  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.7, 16), boneMat);
  snout.rotation.z = Math.PI / 2;
  snout.position.set(1.35, -0.1, 0);
  skull.add(snout);

  for(let i = 0; i < 8; i++){
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 6), jointMat);
    tooth.position.set(0.7 + i * 0.22, -0.4, 0.22);
    tooth.rotation.x = Math.PI;
    skull.add(tooth);
    const tooth2 = tooth.clone();
    tooth2.position.z = -0.22;
    skull.add(tooth2);
  }

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), new THREE.MeshStandardMaterial({ color: 0xf5b942, emissive: 0x6b4a10, emissiveIntensity: 0.6 }));
  eye.position.set(0.55, 0.15, 0.55);
  skull.add(eye);
  const eye2 = eye.clone(); eye2.position.z = -0.55; skull.add(eye2);

  skull.position.set(-0.6, 0.9, 0);
  rig.add(skull);

  // ---- coluna vertebral ----
  const spineCurve = [];
  for(let i = 0; i < 9; i++){
    spineCurve.push(new THREE.Vector3(-1.3 - i * 0.5, 0.6 - i * 0.05, 0));
  }
  spineCurve.forEach(pos => {
    const v = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), jointMat);
    v.position.copy(pos);
    rig.add(v);
  });

  // ---- costelas ----
  for(let i = 1; i < 6; i++){
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.045, 8, 20, Math.PI), boneMat);
    rib.position.set(-1.3 - i * 0.5, 0.4, 0);
    rib.rotation.y = Math.PI / 2;
    rib.rotation.z = Math.PI;
    rig.add(rib);
  }

  // ---- patas ----
  function makeLeg(x, z){
    const leg = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 1.1, 10), boneMat);
    upper.position.y = -0.55;
    leg.add(upper);
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.9, 10), boneMat);
    lower.position.y = -1.35;
    leg.add(lower);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), jointMat);
    foot.position.y = -1.8;
    leg.add(foot);
    leg.position.set(x, 0.4, z);
    rig.add(leg);
  }
  makeLeg(-2.0, 0.5);
  makeLeg(-2.0, -0.5);
  makeLeg(-3.6, 0.45);
  makeLeg(-3.6, -0.45);

  // ---- cauda ----
  for(let i = 0; i < 6; i++){
    const t = new THREE.Mesh(new THREE.SphereGeometry(0.18 - i * 0.02, 8, 8), jointMat);
    t.position.set(-4.0 - i * 0.4, 0.55 - i * 0.08, 0);
    rig.add(t);
  }

  rig.scale.setScalar(0.85);
  rig.position.x = 0.6;

  // chão sutil com grid futurista
  const grid = new THREE.GridHelper(10, 20, 0x3b7bf5, 0x1a2440);
  grid.position.y = -1.9;
  grid.material.opacity = 0.25;
  grid.material.transparent = true;
  scene.add(grid);

  /* --- controle de câmera por arraste (sem dependências externas) --- */
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let rotY = 0.4, rotX = 0.15;
  let dist = defaultCamPos.length();
  const minDist = 3.5, maxDist = 12;

  function updateCamera(){
    camera.position.x = dist * Math.sin(rotY) * Math.cos(rotX);
    camera.position.y = dist * Math.sin(rotX) + 0.4;
    camera.position.z = dist * Math.cos(rotY) * Math.cos(rotX);
    camera.lookAt(0, 0.3, 0);
  }

  container.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevX = e.clientX; prevY = e.clientY;
    container.setPointerCapture(e.pointerId);
  });
  container.addEventListener('pointermove', (e) => {
    if(!isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    rotY -= dx * 0.006;
    rotX = Math.max(-0.6, Math.min(0.8, rotX + dy * 0.006));
    prevX = e.clientX; prevY = e.clientY;
    updateCamera();
  });
  window.addEventListener('pointerup', () => { isDragging = false; });

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    dist = Math.max(minDist, Math.min(maxDist, dist + e.deltaY * 0.01));
    updateCamera();
  }, { passive: false });

  resetBtn?.addEventListener('click', () => {
    rotY = 0.4; rotX = 0.15; dist = defaultCamPos.length();
    updateCamera();
  });

  updateCamera();

  function onResize(){
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animate(){
    if(!isDragging && !reduceMotion){
      rotY += 0.0015;
      updateCamera();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
