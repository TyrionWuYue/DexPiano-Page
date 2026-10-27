'use strict';
const keyboard = document.querySelector('#keyboard');
const whiteNotes = [0, 2, 4, 5, 7, 9, 11];
const keys = new Map();
for (let octave = 0; octave < 4; octave++) {
  whiteNotes.forEach((note, index) => {
    const midi = 48 + octave * 12 + note;
    const key = document.createElement('button');
    key.className = 'piano-key';
    key.type = 'button';
    key.setAttribute('aria-label', `Play ${['C','D','E','F','G','A','B'][index]}${octave + 3}`);
    key.addEventListener('click', () => playKey(midi));
    keyboard.append(key);
    keys.set(midi, key);
    if ([0, 2, 5, 7, 9].includes(note)) {
      const black = document.createElement('button');
      black.className = 'piano-key black';
      black.type = 'button';
      black.style.left = `${((octave * 7 + index + 1) / 28) * 100 - 1.05}%`;
      black.setAttribute('aria-label', `Play ${['C','D','E','F','G','A','B'][index]} sharp ${octave + 3}`);
      black.addEventListener('click', () => playKey(midi + 1));
      keyboard.append(black);
      keys.set(midi + 1, black);
    }
  });
}
const roll = document.querySelector('#roll');
for (let i = 0; i < 15; i++) {
  const note = document.createElement('span');
  note.className = `note ${i > 7 ? 'coral' : ''}`;
  note.style.left = `${23 + (i * 19 % 59)}%`;
  note.style.top = `${(i * 53 % 220) - 30}px`;
  note.style.height = `${18 + (i * 7 % 35)}px`;
  roll.append(note);
}
let audioContext;
let soundOn = false;
const activeVoices = new Set();
async function enableAudio() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return false;
  try {
    audioContext ||= new Audio();
    await audioContext.resume();
    return true;
  } catch { return false; }
}
function tone(midi) {
  if (!soundOn || !audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
  oscillator.connect(gain); gain.connect(audioContext.destination);
  const now = audioContext.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.075, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
  oscillator.start(now); oscillator.stop(now + 0.7);
  activeVoices.add(oscillator);
  oscillator.onended = () => activeVoices.delete(oscillator);
}
const noteTimers = new Map();
function playKey(midi) {
  const key = keys.get(midi);
  if (!key) return;
  clearTimeout(noteTimers.get(midi));
  key.classList.add('active');
  key.classList.toggle('right', midi >= 65);
  tone(midi);
  noteTimers.set(midi, setTimeout(() => key.classList.remove('active', 'right'), 280));
}
const melody = [67,71,74,71,69,72,76,72,67,71,74,79,76,74,71,69,65,69,72,76,74,72,69,67,64,67,71,74,72,71,67,72];
const bass = [48,55,52,55,53,60,57,60];
let playing = false;
let elapsed = 0;
let previous = 0;
let lastStep = -1;
let frame;
const playButton = document.querySelector('#play');
function renderTransport() {
  document.querySelector('#progress').style.width = `${elapsed / 16000 * 100}%`;
  document.querySelector('#time').textContent = `0:${String(Math.floor(elapsed / 1000)).padStart(2, '0')} / 0:16`;
  playButton.setAttribute('aria-pressed', String(playing));
  document.querySelector('#play-label').textContent = playing ? 'Pause illustration' : elapsed >= 16000 ? 'Replay illustration' : 'Play illustration';
  document.querySelector('#play-icon').textContent = playing ? 'Ⅱ' : '▶';
}
function tick(now) {
  if (!playing) return;
  elapsed = Math.min(16000, elapsed + now - previous);
  previous = now;
  const step = Math.floor(elapsed / 500);
  if (step !== lastStep && step < 32) {
    playKey(melody[step]);
    if (step % 2 === 0) playKey(bass[Math.floor(step / 4)]);
    lastStep = step;
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    roll.style.transform = `translateY(${(elapsed / 35) % 44}px)`;
  }
  if (elapsed >= 16000) { playing = false; roll.style.transform = ''; }
  renderTransport();
  if (playing) frame = requestAnimationFrame(tick);
}
function pause() {
  playing = false;
  cancelAnimationFrame(frame);
  renderTransport();
}
playButton.addEventListener('click', () => {
  if (playing) { pause(); return; }
  if (elapsed >= 16000) { elapsed = 0; lastStep = -1; }
  playing = true;
  previous = performance.now();
  renderTransport();
  frame = requestAnimationFrame(tick);
});
document.querySelector('#sound').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  soundOn = !soundOn && await enableAudio();
  if (!soundOn) for (const voice of activeVoices) voice.stop();
  button.setAttribute('aria-pressed', String(soundOn));
  button.textContent = soundOn ? 'Sound on' : 'Sound off';
});
document.addEventListener('visibilitychange', () => { if (document.hidden && playing) pause(); });
const views = {
  simulation: ['Simulation replay', 'Full performance videos will be added here.', 'Learning in a virtual piano environment', 'Motion priors · Bimanual coordination · Key events'],
  hardware: ['Real robot performance', 'UR5e + Sharpa performance footage will be added here.', 'From simulation to the physical keyboard', 'Two UR5e arms · Sharpa hands · Real MIDI'],
  human: ['Human demonstration', 'Aligned demonstration footage will be added here.', 'The human motion behind the prior', 'Piano video · Musical timing · Hand motion'],
};
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
  ['media-title','media-description','caption-title','caption-detail'].forEach((id, i) => { document.getElementById(id).textContent = views[tab.dataset.view][i]; });
  document.querySelector('#performance-panel').setAttribute('aria-labelledby', tab.id);
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let index;
    if (event.key === 'ArrowRight') index = (i + 1) % tabs.length;
    if (event.key === 'ArrowLeft') index = (i + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') index = 0;
    if (event.key === 'End') index = tabs.length - 1;
    if (index === undefined) return;
    event.preventDefault(); selectTab(tabs[index]); tabs[index].focus();
  });
});
