/** main.js — WakeLens: kamera, EAR/MAR/PERCLOS/head-pitch, indeks kantuk, bot & aksi terpandu. */
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { ACTIONS, CATS, MSG } from './tips.js';

const $ = (id) => document.getElementById(id);
const video = $('video'), cv = $('overlay'), cx = cv.getContext('2d'), btn = $('startBtn');
const SENS = { low: { r: 0.65, d: 2000 }, mid: { r: 0.72, d: 1500 }, high: { r: 0.8, d: 1000 } };
const cfg = () => SENS[$('sens').value];
const COLOR = { idle: '#8fa6a3', fokus: '#3ddc97', waspada: '#ffb703', ngantuk: '#ff4d4f' };

const EYE_L = [362, 385, 387, 263, 373, 380], EYE_R = [33, 160, 158, 133, 153, 144], MOUTH = [78, 13, 308, 14];
const d = (a, b, w, h) => Math.hypot((a.x - b.x) * w, (a.y - b.y) * h);
const ear = (p, i, w, h) => (d(p[i[1]], p[i[5]], w, h) + d(p[i[2]], p[i[4]], w, h)) / (2 * d(p[i[0]], p[i[3]], w, h));
const mar = (p, w, h) => d(p[13], p[14], w, h) / d(p[78], p[308], w, h);
const pitch = (p) => { const ey = (p[33].y + p[263].y) / 2; return (p[1].y - ey) / (p[152].y - ey); }; // naik saat kepala menunduk

let landmarker, stream, running = false, S, current = null;
const fresh = () => ({ t0: performance.now(), cal: [], calP: [], avgE: 0, baseP: 0, ready: false, closedSince: 0, yawnSince: 0, yawnDone: false,
  nodSince: 0, nodDone: false, blinks: 0, yawns: 0, nods: 0, drowsy: 0, done: 0, samples: [], score: 0, level: 'idle',
  lastHigh: 0, lastBeep: 0, lastEvent: 0, lastSample: 0, hist: [], focusSum: 0, n: 0, hydrated: false });

async function init() {
  const fs = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
  landmarker = await FaceLandmarker.createFromOptions(fs, { runningMode: 'VIDEO', numFaces: 1,
    baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task' } });
}
async function start() {
  btn.disabled = true; btn.textContent = 'Memuat AI…';
  try { if (!landmarker) await init(); stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false }); }
  catch { btn.disabled = false; btn.textContent = 'Mulai pantau'; $('status').textContent = 'Kamera gagal dibuka. Izinkan akses kamera lalu coba lagi.'; return; }
  video.srcObject = stream; await video.play(); $('empty').hidden = true; S = fresh(); running = true;
  btn.disabled = false; btn.textContent = 'Berhenti'; btn.classList.add('stop'); loop();
}
function stop() {
  running = false; stream?.getTracks().forEach((t) => t.stop()); video.srcObject = null; $('empty').hidden = false; cx.clearRect(0, 0, cv.width, cv.height);
  btn.textContent = 'Mulai pantau'; btn.classList.remove('stop'); showSummary(); setLevel('idle', 'Pemantauan dihentikan.');
}
btn.addEventListener('click', () => (running ? stop() : start()));

function loop() {
  if (!running) return;
  if (video.readyState >= 2) {
    const now = performance.now(), w = video.videoWidth, h = video.videoHeight; cv.width = w; cv.height = h;
    const p = landmarker.detectForVideo(video, now).faceLandmarks[0];
    p ? analyze(p, now, w, h) : (cx.clearRect(0, 0, w, h), S.closedSince = S.yawnSince = S.nodSince = 0, setLevel('idle', 'Wajah tidak terlihat', MSG.noface));
    tick(now);
  }
  requestAnimationFrame(loop);
}

function analyze(p, now, w, h) {
  const e = (ear(p, EYE_L, w, h) + ear(p, EYE_R, w, h)) / 2, m = mar(p, w, h), pt = pitch(p);
  if (!S.ready) { // kalibrasi 3 detik: ukur mata terbuka & posisi kepala normal
    if (e > 0.15) { S.cal.push(e); S.calP.push(pt); }
    draw(p, w, h, 'idle'); const left = Math.max(0, Math.ceil((3000 - (now - S.t0)) / 1000));
    setLevel('idle', `Kalibrasi… tatap kamera (${left})`, 'Buka mata normal dan duduk tegak.');
    if (now - S.t0 >= 3000 && S.cal.length > 10) { const av = (a) => a.reduce((x, y) => x + y) / a.length; S.avgE = av(S.cal); S.baseP = av(S.calP); S.ready = true; }
    return;
  }
  const c = cfg(), closed = e < S.avgE * c.r;
  if (closed && !S.closedSince) S.closedSince = now;
  if (!closed && S.closedSince) { if (now - S.closedSince < 400) S.blinks++; S.closedSince = 0; }
  const closedMs = S.closedSince ? now - S.closedSince : 0;
  S.samples.push([now, closed]); while (S.samples[0][0] < now - 30000) S.samples.shift();
  const perclos = S.samples.filter((s) => s[1]).length / S.samples.length;

  const yawning = m > 0.55; if (yawning && !S.yawnSince) S.yawnSince = now; if (!yawning) S.yawnSince = 0, S.yawnDone = false;
  if (yawning && now - S.yawnSince > 1200 && !S.yawnDone) S.yawns++, S.yawnDone = true;
  const nodding = pt - S.baseP > 0.1; if (nodding && !S.nodSince) S.nodSince = now; if (!nodding) S.nodSince = 0, S.nodDone = false;
  if (nodding && now - S.nodSince > 800 && !S.nodDone) S.nods++, S.nodDone = true;

  const target = Math.min(100, Math.max(closedMs / c.d * 100, perclos / 0.3 * 100, yawning ? 55 : 0, nodding ? 65 : 0));
  S.score += (target - S.score) * 0.08;
  let level = S.score >= 70 || closedMs >= c.d ? 'ngantuk' : S.score >= 35 ? 'waspada' : 'fokus';
  if (level === 'ngantuk') S.lastHigh = now; else if (S.level === 'ngantuk' && now - S.lastHigh < 3000) level = 'ngantuk';
  const cause = closedMs >= c.d * 0.6 ? 'eyes' : nodding ? 'nod' : yawning ? 'yawn' : 'eyes';
  setLevel(level, { fokus: 'Fokus. Kamu segar 👍', waspada: 'Waspada, mulai mengantuk…', ngantuk: 'NGANTUK! Segera bangun 🚨' }[level], level === 'ngantuk' ? null : MSG[level]);
  if (level === 'ngantuk') onDrowsy(now, cause);
  draw(p, w, h, level);
}

function draw(p, w, h, level) { // gambar kontur mata & mulut sesuai warna status
  cx.clearRect(0, 0, w, h); cx.strokeStyle = cx.fillStyle = COLOR[level]; cx.lineWidth = 3;
  for (const set of [EYE_L, EYE_R, MOUTH]) { cx.beginPath(); set.forEach((i, k) => cx[k ? 'lineTo' : 'moveTo'](p[i].x * w, p[i].y * h)); cx.closePath(); cx.stroke(); }
  [1, 152].forEach((i) => { cx.beginPath(); cx.arc(p[i].x * w, p[i].y * h, 4, 0, 7); cx.fill(); });
}

const pick = (cause) => ACTIONS.find((a) => a.id === (S.drowsy >= 3 ? 'nap' : { eyes: ['muka', 'air', 'udara'][S.drowsy % 3], nod: 'leher', yawn: 'napas' }[cause]));
function onDrowsy(now, cause) {
  if (now - S.lastEvent > 15000) {
    S.drowsy++; S.lastEvent = now; current = pick(cause);
    const m = S.drowsy >= 3 ? MSG.berat : `Saran: ${current.title}. ${current.why}`;
    $('botMsg').textContent = m; $('doBtn').hidden = false; $('doBtn').textContent = `${current.icon} ${current.title}`; speak(m);
  }
  if ($('sound').checked && now - S.lastBeep > 1000) { S.lastBeep = now; beep(); navigator.vibrate?.([300, 100, 300]); }
}

function setLevel(level, text, bot) {
  S && (S.level = level); document.body.dataset.state = level; $('badge').textContent = { idle: 'Siap', fokus: 'Fokus', waspada: 'Waspada', ngantuk: 'Ngantuk' }[level];
  if (text) $('status').textContent = text; if (bot) $('botMsg').textContent = bot;
  if (level !== 'ngantuk' && bot) $('doBtn').hidden = true;
}
function tick(now) {
  const sec = Math.floor((now - S.t0) / 1000), z = (n) => String(n).padStart(2, '0');
  $('sTime').textContent = `${z(Math.floor(sec / 60))}:${z(sec % 60)}`; $('sBlink').textContent = sec > 5 ? Math.round(S.blinks / (sec / 60)) : 0;
  $('sYawn').textContent = S.yawns; $('sNod').textContent = S.nods; $('sDrowsy').textContent = S.drowsy; $('sDone').textContent = S.done;
  $('score').textContent = Math.round(S.score); $('ring').style.strokeDashoffset = 339.3 * (1 - S.score / 100);
  if (S.ready && now - S.lastSample > 500) { S.lastSample = now; S.hist.push(S.score); if (S.hist.length > 120) S.hist.shift(); S.focusSum += 100 - S.score; S.n++; chart(); }
  if (sec > 0 && sec % 1200 === 0 && !S.hydrated) { S.hydrated = true; $('botMsg').textContent = MSG.hydrate; speak(MSG.hydrate); } else if (sec % 1200 !== 0) S.hydrated = false;
}
function chart() { // grafik garis indeks kantuk
  const c = $('chart'), g = c.getContext('2d'), W = c.width, H = c.height; g.clearRect(0, 0, W, H);
  g.strokeStyle = '#2c4350'; g.setLineDash([4, 4]); [35, 70].forEach((v) => { g.beginPath(); g.moveTo(0, H - v * H / 100); g.lineTo(W, H - v * H / 100); g.stroke(); }); g.setLineDash([]);
  g.strokeStyle = COLOR[S.level === 'idle' ? 'fokus' : S.level]; g.lineWidth = 3; g.beginPath();
  S.hist.forEach((v, i) => g[i ? 'lineTo' : 'moveTo'](i * W / 119, H - v * H / 100)); g.stroke();
}

/* Aksi terpandu (modal + timer) */
let timer; const modal = $('modal');
function openAction(a) {
  current = a; $('mTitle').textContent = `${a.icon} ${a.title}`; $('mWhy').textContent = a.why; $('mSteps').innerHTML = a.steps.map((s) => `<li>${s}</li>`).join('');
  let t = a.sec; const show = () => ($('mTimer').textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`); show();
  clearInterval(timer); timer = setInterval(() => { if (--t <= 0) { clearInterval(timer); t = 0; beep(); } show(); }, 1000); modal.showModal();
}
$('doBtn').onclick = () => current && openAction(current);
$('mDone').onclick = () => { clearInterval(timer); modal.close(); if (S) { S.done++; S.score = Math.max(0, S.score - 40); } };
$('mClose').onclick = () => { clearInterval(timer); modal.close(); };

/* Pustaka tips */
let cat = 'Semua';
function renderLib() {
  $('tabs').innerHTML = CATS.map((c) => `<button class="tab ${c === cat ? 'on' : ''}">${c}</button>`).join('');
  $('cards').innerHTML = ACTIONS.filter((a) => cat === 'Semua' || a.cat === cat).map((a) => `<article class="acard" tabindex="0" data-id="${a.id}"><i>${a.icon}</i><h3>${a.title}</h3><p>${a.why}</p><small>${a.sec >= 60 ? Math.round(a.sec / 60) + ' menit' : a.sec + ' detik'}</small></article>`).join('');
}
$('tabs').onclick = (e) => { if (e.target.classList.contains('tab')) { cat = e.target.textContent; renderLib(); } };
$('cards').onclick = (e) => { const c = e.target.closest('.acard'); if (c) openAction(ACTIONS.find((a) => a.id === c.dataset.id)); };
$('cards').onkeydown = (e) => { if (e.key === 'Enter') e.target.click(); };
renderLib();

/* Ringkasan sesi + simpan riwayat lokal */
function showSummary() {
  if (!S || S.n < 4) return; const avg = Math.round(S.focusSum / S.n), sec = Math.floor((performance.now() - S.t0) / 1000);
  const rec = { at: Date.now(), sec, focus: avg, drowsy: S.drowsy, yawns: S.yawns, nods: S.nods };
  try { const h = JSON.parse(localStorage.getItem('wakelens.sessions') || '[]'); h.push(rec); localStorage.setItem('wakelens.sessions', JSON.stringify(h.slice(-50))); } catch {}
  const grade = avg >= 80 ? 'Sangat fokus' : avg >= 60 ? 'Cukup fokus' : 'Sering mengantuk, perbaiki istirahatmu';
  $('sumBody').innerHTML = [['Skor fokus', avg + '%'], ['Durasi', Math.floor(sec / 60) + ' mnt'], ['Kali ngantuk', S.drowsy], ['Menguap', S.yawns], ['Kepala jatuh', S.nods], ['Aksi selesai', S.done]]
    .map(([k, v]) => `<div><b>${v}</b>${k}</div>`).join('') + `<div style="grid-column:1/-1"><b>${grade}</b></div>`;
  $('sum').showModal();
}
$('sumClose').onclick = () => $('sum').close();

let ac; const beep = () => { ac ||= new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 880; g.gain.value = 0.25; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.25); };
function speak(t) { if ($('sound').checked && 'speechSynthesis' in window) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'id-ID'; speechSynthesis.speak(u); } }
