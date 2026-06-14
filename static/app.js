let images = [];
let order = [];
let currentIndex = -1;
let timerDuration = 60;
let remaining = 60;
let timerInterval = null;
let isPlaying = false;

const sketchImage = document.getElementById('sketchImage');
const placeholder = document.getElementById('placeholder');
const timerDisplay = document.getElementById('timerDisplay');
const progressFill = document.getElementById('progressFill');
const playPauseBtn = document.getElementById('playPauseBtn');
const skipBtn = document.getElementById('skipBtn');
const prevBtn = document.getElementById('prevBtn');
const reshuffleBtn = document.getElementById('reshuffleBtn');
const timerSelect = document.getElementById('timerSelect');
const status = document.getElementById('status');

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateProgress() {
  const pct = ((timerDuration - remaining) / timerDuration) * 100;
  progressFill.style.width = pct + '%';
  timerDisplay.textContent = formatTime(remaining);
}

function showImage(index) {
  if (index < 0 || index >= order.length) return;
  currentIndex = index;
  const src = order[currentIndex];
  sketchImage.src = src;
  sketchImage.style.display = 'block';
  placeholder.style.display = 'none';
  status.textContent = `Image ${currentIndex + 1} of ${order.length} — ${decodeURIComponent(src.split('/').pop())}`;
  resetTimer();
}

function resetTimer() {
  remaining = timerDuration;
  updateProgress();
}

function tick() {
  remaining--;
  updateProgress();
  if (remaining <= 0) {
    nextImage();
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);
  isPlaying = true;
  playPauseBtn.textContent = '⏸ Pause';
}

function pauseTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  isPlaying = false;
  playPauseBtn.textContent = '▶ Resume';
}

function nextImage() {
  if (order.length === 0) return;
  let nextIdx = currentIndex + 1;
  if (nextIdx >= order.length) {
    order = shuffle(images);
    nextIdx = 0;
  }
  showImage(nextIdx);
  if (isPlaying) startTimer();
}

function prevImage() {
  if (order.length === 0) return;
  let prevIdx = currentIndex - 1;
  if (prevIdx < 0) prevIdx = 0;
  showImage(prevIdx);
  if (isPlaying) startTimer();
}

playPauseBtn.addEventListener('click', () => {
  if (order.length === 0) return;
  if (currentIndex === -1) {
    showImage(0);
  }
  if (isPlaying) {
    pauseTimer();
  } else {
    startTimer();
  }
});

skipBtn.addEventListener('click', () => {
  if (currentIndex === -1) { showImage(0); return; }
  nextImage();
});

prevBtn.addEventListener('click', () => {
  if (currentIndex === -1) return;
  prevImage();
});

reshuffleBtn.addEventListener('click', () => {
  order = shuffle(images);
  currentIndex = -1;
  pauseTimer();
  playPauseBtn.textContent = '▶ Start';
  showImage(0);
  pauseTimer();
  playPauseBtn.textContent = '▶ Start';
  remaining = timerDuration;
  updateProgress();
});

timerSelect.addEventListener('change', () => {
  timerDuration = parseInt(timerSelect.value, 10);
  remaining = timerDuration;
  updateProgress();
});

async function loadImages() {
  try {
    const res = await fetch('/api/images');
    const data = await res.json();
    images = data.images || [];
    if (images.length === 0) {
      placeholder.textContent = 'No images found in the public folder. Add some images and refresh.';
      return;
    }
    order = shuffle(images);
    placeholder.textContent = `${images.length} images loaded. Press Start.`;
    timerDuration = parseInt(timerSelect.value, 10);
    remaining = timerDuration;
    updateProgress();
  } catch (err) {
    placeholder.textContent = 'Error loading images: ' + err.message;
  }
}

loadImages();
