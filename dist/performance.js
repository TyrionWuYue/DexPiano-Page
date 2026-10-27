'use strict';

(() => {
  const player = document.querySelector('.performance-player');
  const video = player?.querySelector('video');
  const controls = player?.querySelector('.performance-controls');
  if (!video || !controls) return;

  const play = controls.querySelector('.performance-play');
  const seek = controls.querySelector('.performance-seek');
  const time = controls.querySelector('.performance-time');
  const mute = controls.querySelector('.performance-mute');
  const fullscreen = controls.querySelector('.performance-fullscreen');
  const analysis = player.querySelector('.performance-analysis');
  const svg = analysis.querySelector('.note-history');
  const notesWindow = analysis.querySelector('.notes-window');
  const metric = analysis.querySelector('.metric-value');
  const pieceTime = analysis.querySelector('.analysis-piece-time');
  const data = JSON.parse(document.getElementById('performance-data').textContent);
  const colors = ['#a3decb', '#efad99', '#e7cf94'];
  const ns = 'http://www.w3.org/2000/svg';
  let graph, reveal, cursor, frameHandle, frameUsesVideo;

  const formatTime = seconds => {
    seconds = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };
  function node(tag, attributes, text) {
    const item = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([name, value]) => item.setAttribute(name, value));
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function renderAnalysis(t) {
    if (!graph) return;
    const x = graph.left + Math.min(t / data.duration, 1) * graph.width;
    reveal.setAttribute('width', Math.max(0, x - graph.left));
    cursor.setAttribute('x1', x);
    cursor.setAttribute('x2', x);
    const index = Math.min(data.steps - 1, Math.max(0, Math.floor(t / data.dt)));
    const [tp, fp, fn] = data.counts[index];
    const denominator = 2 * tp + fp + fn;
    const label = denominator ? `${(200 * tp / denominator).toFixed(1)}%` : '—';
    if (metric.textContent !== label) metric.textContent = label;
    pieceTime.textContent = `${formatTime(Math.min(t, 24))} / 0:24`;
    // Follow the playhead on small screens; the history itself remains scrollable.
    if (!video.paused && svg.clientWidth > notesWindow.clientWidth) {
      notesWindow.scrollLeft = Math.max(0, x - notesWindow.clientWidth * 0.72);
    }
  }
  function drawHistory() {
    const width = Math.max(160, notesWindow.clientWidth);
    const height = svg.clientHeight || 104;
    graph = {left: 38, width: width - 48, top: 8, bottom: height - 28};
    const x = step => graph.left + step * data.dt / data.duration * graph.width;
    const y = pitch => graph.top + (data.keyMax - pitch) / (data.keyMax - data.keyMin + 1) * (graph.bottom - graph.top);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.replaceChildren();
    const defs = node('defs', {});
    const clip = node('clipPath', {id: 'note-history-reveal', clipPathUnits: 'userSpaceOnUse'});
    reveal = node('rect', {x: graph.left, y: 0, width: 0, height});
    clip.append(reveal); defs.append(clip); svg.append(defs);
    for (let second = 0; second <= 24; second += 4) {
      const px = graph.left + second / data.duration * graph.width;
      svg.append(node('line', {x1:px, x2:px, y1:graph.top, y2:graph.bottom, stroke:'#243236'}));
      svg.append(node('text', {x:px, y:height - 7, fill:'#b7c5c5', 'font-size':10, 'text-anchor':'middle'}, `${second}s`));
    }
    for (let pitch = data.keyMin; pitch <= data.keyMax; pitch++) {
      if (pitch % 12 !== 0) continue;
      const py = y(pitch);
      svg.append(node('line', {x1:graph.left, x2:width - 10, y1:py + 1, y2:py + 1, stroke:'#304045'}));
      svg.append(node('text', {x:graph.left - 9, y:py + 4, fill:'#b7c5c5', 'font-size':10, 'text-anchor':'end'}, `C${pitch / 12 - 1}`));
    }
    function note(entry, color) {
      const [start, end, pitch] = entry;
      return node('rect', {x:x(start), y:y(pitch), width:Math.max(1, x(end) - x(start)), height:Math.max(0.9, Math.min(2.35, (graph.bottom - graph.top) / (data.keyMax - data.keyMin + 1) * 0.75)), fill:color});
    }
    const targets = node('g', {});
    data.reference.forEach(entry => targets.append(note(entry, '#6c828a')));
    svg.append(targets);
    const actual = node('g', {'clip-path':'url(#note-history-reveal)'});
    data.trace.forEach(entry => actual.append(note(entry, colors[entry[3]])));
    svg.append(actual);
    cursor = node('line', {x1:graph.left, x2:graph.left, y1:0, y2:graph.bottom + 4, stroke:'#f0f4f0', 'stroke-width':1.5});
    svg.append(cursor);
    renderAnalysis(video.currentTime);
  }
  function update() {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    seek.disabled = !duration;
    seek.max = duration || 25;
    seek.value = video.currentTime;
    seek.setAttribute('aria-valuetext', `${formatTime(video.currentTime)} of ${formatTime(duration || 25)}`);
    time.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration || 25)}`;
    play.textContent = video.paused ? 'Play' : 'Pause';
    play.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
    mute.textContent = video.muted ? 'Unmute' : 'Mute';
    mute.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
    renderAnalysis(video.currentTime);
  }
  function stopFrames() {
    if (frameUsesVideo) video.cancelVideoFrameCallback?.(frameHandle);
    else cancelAnimationFrame(frameHandle);
  }
  function startFrames() {
    stopFrames();
    frameUsesVideo = typeof video.requestVideoFrameCallback === 'function';
    const next = (_now, metadata) => {
      renderAnalysis(metadata?.mediaTime ?? video.currentTime);
      if (!video.paused) frameHandle = frameUsesVideo ? video.requestVideoFrameCallback(next) : requestAnimationFrame(next);
    };
    frameHandle = frameUsesVideo ? video.requestVideoFrameCallback(next) : requestAnimationFrame(next);
  }
  function togglePlayback() {
    if (video.paused) video.play().catch(update);
    else video.pause();
  }
  play.addEventListener('click', togglePlayback);
  video.addEventListener('click', togglePlayback);
  video.tabIndex = 0;
  video.addEventListener('keydown', event => {
    if (event.code === 'Space' || event.code === 'KeyK') {
      event.preventDefault(); togglePlayback();
    }
  });
  seek.addEventListener('input', () => { video.currentTime = Number(seek.value); update(); });
  mute.addEventListener('click', () => { video.muted = !video.muted; });
  ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended', 'volumechange', 'seeked'].forEach(name => video.addEventListener(name, update));
  video.addEventListener('play', startFrames);
  video.addEventListener('pause', stopFrames);
  const nativeFullscreen = () => document.fullscreenElement || document.webkitFullscreenElement;
  const requestFullscreen = player.requestFullscreen || player.webkitRequestFullscreen;
  const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
  let previousOverflow = '';
  function expanded() { return player.classList.contains('is-expanded'); }
  function updateFullscreen() {
    fullscreen.setAttribute('aria-label', nativeFullscreen() || expanded() ? 'Exit full screen' : 'Enter full screen');
  }
  function expandInline() {
    previousOverflow = document.body.style.overflow;
    player.classList.add('is-expanded');
    document.body.style.overflow = 'hidden';
    updateFullscreen();
  }
  function collapseInline() {
    player.classList.remove('is-expanded');
    document.body.style.overflow = previousOverflow;
    updateFullscreen();
  }
  fullscreen.addEventListener('click', async () => {
    if (expanded()) { collapseInline(); return; }
    try {
      if (nativeFullscreen()) await exitFullscreen?.call(document);
      else if (requestFullscreen) {
        await requestFullscreen.call(player);
        if (!nativeFullscreen()) expandInline();
      }
      else expandInline();
    } catch { expandInline(); }
    updateFullscreen();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && expanded()) collapseInline();
  });
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(name => document.addEventListener(name, updateFullscreen));
  analysis.hidden = false;
  controls.hidden = false;
  video.controls = false;
  drawHistory(); update();
  if (typeof ResizeObserver === 'function') new ResizeObserver(drawHistory).observe(notesWindow);
  else window.addEventListener('resize', drawHistory);
})();
