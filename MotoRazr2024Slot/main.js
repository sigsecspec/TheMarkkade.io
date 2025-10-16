const appEl = document.getElementById('app');
const displayEl = document.getElementById('display');
const reelsEl = document.querySelector('.reels');
const linesCanvas = document.getElementById('lines-canvas');
const ctx = linesCanvas.getContext('2d');
const bannerEl = document.getElementById('banner');
const fxLayer = document.getElementById('fx-layer');

const balanceEl = document.getElementById('balance');
const betEl = document.getElementById('bet');
const winEl = document.getElementById('win');

const linesMinus = document.getElementById('lines-minus');
const linesPlus = document.getElementById('lines-plus');
const linesReadout = document.getElementById('lines-readout');
const betMinus = document.getElementById('bet-minus');
const betPlus = document.getElementById('bet-plus');
const betReadout = document.getElementById('bet-readout');
const maxBetBtn = document.getElementById('max-bet');
const autoBtn = document.getElementById('auto');
const spinBtn = document.getElementById('spin');

const sfx = {
  spin: document.getElementById('sfx-spin'),
  stop: document.getElementById('sfx-stop'),
  win: document.getElementById('sfx-win'),
  lose: document.getElementById('sfx-lose'),
};

// WebAudio fallback synth for richer feedback
const audio = {
  ctx: null,
  gain: null,
  init(){
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0.15;
    this.gain.connect(this.ctx.destination);
  },
  tone(freq=440, time=0.12, type='sine'){
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    g.gain.value = 0.0;
    g.gain.linearRampToValueAtTime(1.0, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + time);
    osc.connect(g).connect(this.gain);
    osc.start(now);
    osc.stop(now + time + 0.02);
  },
  whoosh(time=0.6){
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + time);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, now + time);
    osc.connect(g).connect(this.gain);
    osc.start(now);
    osc.stop(now + time + 0.02);
  },
  chime(){
    if (!this.ctx) return;
    this.tone(880, 0.12, 'sine');
    setTimeout(()=> this.tone(1320, 0.12, 'sine'), 80);
    setTimeout(()=> this.tone(1760, 0.14, 'sine'), 160);
  },
};

// Game state
const state = {
  balance: 1000,
  lines: 10,
  betPerLine: 0.1,
  spinning: false,
  auto: false,
  lastWin: 0,
};

const symbols = ['🍒','🔔','🍋','BAR','💎','7'];
const weights = [28, 18, 22, 16, 10, 6]; // control rarity
const stripLength = 64; // longer strip allows better motion feel
const columns = 5;
const rowsVisible = 3;
let cellHeight = 120; // will measure after render
let reelStrips = Array.from({length: columns}, ()=> []);

function formatMoney(v){
  return `$${v.toFixed(2)}`;
}

function updateMeters(){
  balanceEl.textContent = formatMoney(state.balance);
  betEl.textContent = formatMoney(state.lines * state.betPerLine);
  winEl.textContent = formatMoney(state.lastWin || 0);
  linesReadout.textContent = `Lines: ${state.lines}`;
  betReadout.textContent = `Bet/Line: ${formatMoney(state.betPerLine)}`;
}

function createWeightedBag(items, weights){
  const bag = [];
  for (let i = 0; i < items.length; i++){
    for (let w = 0; w < weights[i]; w++) bag.push(items[i]);
  }
  return bag;
}

const weightedSymbols = createWeightedBag(symbols, weights);

function buildReelElement(reelIndex){
  const reel = document.querySelector(`.reel[data-reel="${reelIndex}"]`);
  reel.innerHTML = '';
  const strip = document.createElement('div');
  strip.className = 'strip';
  // build tall strip of symbols
  const list = [];
  for (let i = 0; i < stripLength; i++){
    const item = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
    list.push(item);
  }
  list.forEach(item => {
    const cell = document.createElement('div');
    cell.className = 'symbol';
    if (item === 'BAR') {
      cell.innerHTML = `<span class="bar">BAR</span>`;
    } else if (item === '7') {
      cell.innerHTML = `<span class="seven">7</span>`;
    } else if (item === '💎') {
      cell.innerHTML = `<span class="diamond">💎</span>`;
    } else if (item === '🔔' || item === '🍒' || item === '🍋') {
      cell.textContent = item;
    } else {
      cell.innerHTML = `<span class="chip"></span>`;
    }
    strip.appendChild(cell);
  });
  reel.appendChild(strip);
  reelStrips[reelIndex] = list;
}

function initReels(){
  for (let i = 0; i < columns; i++) buildReelElement(i);
  // measure cell height and enforce 3-row viewport
  const firstCell = document.querySelector('.symbol');
  if (firstCell) {
    cellHeight = firstCell.offsetHeight || cellHeight;
  }
  document.querySelectorAll('.reel').forEach(el => {
    el.style.height = (cellHeight * rowsVisible) + 'px';
  });
}

function vibrate(pattern){
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch (_) { /* ignore */ }
}

function showBanner(text, tone='neutral'){
  bannerEl.textContent = text;
  bannerEl.style.display = 'block';
  bannerEl.dataset.tone = tone;
  clearTimeout(showBanner._t);
  showBanner._t = setTimeout(()=>{ bannerEl.style.display = 'none'; }, 1400);
}

function touchFx(x, y){
  const ripple = document.createElement('div');
  ripple.className = 'touch-ripple';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.style.width = '120px';
  ripple.style.height = '120px';
  fxLayer.appendChild(ripple);
  setTimeout(()=> ripple.remove(), 620);

  const flare = document.createElement('div');
  flare.className = 'flare';
  flare.style.left = x + 'px';
  flare.style.top = y + 'px';
  fxLayer.appendChild(flare);
  setTimeout(()=> flare.remove(), 520);
}

function onDisplayTouchStart(e){
  displayEl.classList.add('touching');
  const p = (e.touches && e.touches[0]) || e;
  const rect = displayEl.getBoundingClientRect();
  touchFx(p.clientX - rect.left, p.clientY - rect.top);
  vibrate([3, 20, 3]);
}
function onDisplayTouchEnd(){
  displayEl.classList.remove('touching');
}

// Spinning logic
function spin(){
  if (state.spinning) return;
  const totalBet = state.lines * state.betPerLine;
  if (state.balance < totalBet){
    showBanner('Insufficient balance', 'bad');
    sfx.lose.currentTime = 0; sfx.lose.play().catch(()=>{});
    vibrate([10,30,10]);
    return;
  }
  state.balance -= totalBet;
  updateMeters();
  state.spinning = true;
  state.lastWin = 0;
  spinBtn.disabled = true;
  vibrate([6, 40, 6]);
  sfx.spin.currentTime = 0; sfx.spin.play().catch(()=>{});
  audio.init();
  audio.whoosh(0.5);

  const reels = Array.from(document.querySelectorAll('.reel'));
  const durations = [1100, 1300, 1500, 1700, 1900];

  // choose deterministic final stops for each reel
  const stopIndices = reels.map(()=> Math.floor(Math.random() * stripLength));
  const matrix = Array.from({length: rowsVisible}, (_, r)=>
    Array.from({length: columns}, (_, c)=> reelStrips[c][(stopIndices[c] + r) % stripLength])
  );

  reels.forEach((reel, i) => {
    const strip = reel.querySelector('.strip');
    const start = performance.now();
    const stripHeight = strip.scrollHeight;
    const loops = 2 + i; // later reels spin longer
    const finalOffset = (stopIndices[i] * cellHeight) % stripHeight;
    const totalDistance = loops * stripHeight + finalOffset; // always lands aligned

    function frame(t){
      const elapsed = t - start;
      const p = Math.min(1, elapsed / durations[i]);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      const y = eased * totalDistance;
      strip.style.transform = `translateY(${y % stripHeight}px)`;
      if (p < 1) requestAnimationFrame(frame); else {
        sfx.stop.currentTime = 0; sfx.stop.play().catch(()=>{});
        audio.tone(240 + i*40, 0.08, 'triangle');
        vibrate([6]);
        if (i === reels.length - 1){
          settleAndScore(matrix);
        }
      }
    }
    requestAnimationFrame(frame);
  });
}

const PAYLINES = [
  [0,0,0,0,0], [1,1,1,1,1], [2,2,2,2,2],
  [0,1,2,1,0], [2,1,0,1,2],
  [0,0,1,0,0], [2,2,1,2,2],
  [1,0,0,0,1], [1,2,2,2,1],
  [0,1,1,1,0], [2,1,1,1,2],
  [0,2,0,2,0], [2,0,2,0,2],
  [1,0,1,2,1], [1,2,1,0,1],
  [0,1,0,1,2], [2,1,2,1,0],
  [0,2,1,0,2], [2,0,1,2,0],
  [1,1,0,1,1]
];

const PAYTABLE = {
  '🍒': [0,0,3,8,20],
  '🍋': [0,0,4,9,25],
  '🔔': [0,0,5,10,30],
  'BAR': [0,0,8,16,40],
  '💎': [0,0,12,24,100],
  '7': [0,0,20,50,200],
};

function evaluateWins(matrix){
  const active = Math.min(state.lines, PAYLINES.length);
  const wins = [];
  for (let li = 0; li < active; li++){
    const path = PAYLINES[li];
    const first = matrix[path[0]][0];
    let count = 1;
    for (let c = 1; c < columns; c++){
      if (matrix[path[c]][c] === first) count++; else break;
    }
    if (count >= 3){
      const mult = PAYTABLE[first]?.[count] || 0;
      if (mult > 0) wins.push({lineIndex: li, count, symbol: first, payout: mult * state.betPerLine});
    }
  }
  return wins;
}

function drawPaylines(wins){
  const rect = displayEl.getBoundingClientRect();
  ctx.clearRect(0,0,linesCanvas.width, linesCanvas.height);
  wins.forEach((w, idx)=>{
    const hue = (idx * 47) % 360;
    ctx.strokeStyle = `hsl(${hue} 90% 60% / 0.9)`;
    ctx.lineWidth = 4;
    ctx.shadowColor = `hsl(${hue} 90% 60% / 0.9)`;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let c = 0; c < columns; c++){
      const reel = document.querySelector(`.reel[data-reel="${c}"]`);
      const rRect = reel.getBoundingClientRect();
      const x = (rRect.left + rRect.width/2 - rect.left);
      const y = (rRect.top + (w.lineIndex < PAYLINES.length ? PAYLINES[w.lineIndex][c] : 1) * cellHeight + cellHeight/2 - rect.top);
      if (c === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
}

function settleAndScore(matrix){
  const totalBet = state.lines * state.betPerLine;
  const wins = evaluateWins(matrix);
  const winAmount = Math.round(wins.reduce((sum, w)=> sum + w.payout, 0) * 100)/100;
  if (winAmount > 0){
    state.balance += winAmount;
    state.lastWin = winAmount;
    showBanner(`WIN ${formatMoney(winAmount)}!`, 'good');
    sfx.win.currentTime = 0; sfx.win.play().catch(()=>{});
    audio.chime();
    vibrate([10, 50, 10, 50, 20]);
    drawPaylines(wins);
  } else {
    state.lastWin = 0;
    showBanner('No win', 'neutral');
    sfx.lose.currentTime = 0; sfx.lose.play().catch(()=>{});
    vibrate([6, 30, 6]);
    ctx.clearRect(0,0,linesCanvas.width, linesCanvas.height);
  }
  updateMeters();
  state.spinning = false;
  spinBtn.disabled = false;
  if (state.auto) setTimeout(spin, 400);
}

function setLines(delta){
  state.lines = Math.min(20, Math.max(1, state.lines + delta));
  updateMeters();
  vibrate(8);
}
function setBet(delta){
  const steps = [0.05,0.1,0.25,0.5,1,2,5];
  const idx = steps.indexOf(state.betPerLine);
  const next = Math.min(steps.length-1, Math.max(0, idx + delta));
  state.betPerLine = steps[next];
  updateMeters();
  vibrate(8);
}

function toggleAuto(){
  state.auto = !state.auto;
  autoBtn.classList.toggle('active', state.auto);
  if (state.auto && !state.spinning) spin();
}

function maxBet(){
  state.lines = 20; state.betPerLine = 5;
  updateMeters();
  vibrate([6,40,6]);
}

function bindControls(){
  linesMinus.addEventListener('click', ()=> setLines(-1));
  linesPlus.addEventListener('click', ()=> setLines(1));
  betMinus.addEventListener('click', ()=> setBet(-1));
  betPlus.addEventListener('click', ()=> setBet(1));
  maxBetBtn.addEventListener('click', maxBet);
  autoBtn.addEventListener('click', toggleAuto);
  spinBtn.addEventListener('click', spin);

  // haptics on buttons
  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('click', ()=> vibrate(10));
  });

  // Display touch FX
  displayEl.addEventListener('touchstart', onDisplayTouchStart, {passive:true});
  displayEl.addEventListener('touchend', onDisplayTouchEnd, {passive:true});
  displayEl.addEventListener('mousedown', onDisplayTouchStart);
  window.addEventListener('mouseup', onDisplayTouchEnd);
}

function fitForRazr(){
  // Attempt to maximize safe-area usage (foldables)
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  // fit canvas
  linesCanvas.width = displayEl.clientWidth * devicePixelRatio;
  linesCanvas.height = displayEl.clientHeight * devicePixelRatio;
  linesCanvas.style.width = displayEl.clientWidth + 'px';
  linesCanvas.style.height = displayEl.clientHeight + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  // enforce 3-row reel viewport on resize
  document.querySelectorAll('.reel').forEach(el => {
    el.style.height = (cellHeight * rowsVisible) + 'px';
  });
}

function init(){
  initReels();
  updateMeters();
  bindControls();
  fitForRazr();
  // unlock audio on first interaction
  window.addEventListener('pointerdown', ()=> audio.init(), {once:true, passive:true});
}

window.addEventListener('resize', fitForRazr);
window.addEventListener('orientationchange', fitForRazr);

document.addEventListener('visibilitychange', ()=>{
  if (document.hidden && state.auto) state.auto = false;
});

init();
