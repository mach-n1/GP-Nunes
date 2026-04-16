
const themeToggle = document.getElementById("themeToggle");
const themeToggleIcon = document.getElementById("themeToggleIcon");
const backgroundMusic = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const musicToggleIcon = document.getElementById("musicToggleIcon");
const volumeDownIcon = document.getElementById("volumeDownIcon");
const volumeUpIcon = document.getElementById("volumeUpIcon");
const volumeDown = document.getElementById("volumeDown");
const volumeUp = document.getElementById("volumeUp");
const volumeFill = document.getElementById("volumeFill");
const musicStatus = document.getElementById("musicStatus");

const THEME_STORAGE_KEY = "linkpage-theme";
const INITIAL_VOLUME = 0.1;
const VOLUME_STEP = 0.05;
const AUDIO_ACTIVATION_EVENTS = ["pointerdown", "touchstart", "keydown"];

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setIcon(slot, name) {
  if (!slot) {
    return;
  }

  slot.innerHTML = `<i data-lucide="${name}" aria-hidden="true"></i>`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getVolumePercent() {
  return Math.round(backgroundMusic.volume * 100);
}

function setThemeIcon(isLight) {
  setIcon(themeToggleIcon, isLight ? "sun" : "moon");
  refreshIcons();
}

function setStaticIcons() {
  setIcon(volumeDownIcon, "minus");
  setIcon(volumeUpIcon, "plus");
  refreshIcons();
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const isLight = savedTheme === "light";

  document.body.classList.toggle("light", isLight);
  setThemeIcon(isLight);
}

function setMusicButton(isPlaying) {
  setIcon(musicToggleIcon, isPlaying ? "square" : "play");
  musicToggle.setAttribute("aria-label", isPlaying ? "Parar musica" : "Tocar musica");
  musicToggle.setAttribute("title", isPlaying ? "Parar musica" : "Tocar musica");
  refreshIcons();
}

function updateMusicStatus() {
  const volumePercent = getVolumePercent();

  if (backgroundMusic.paused) {
    musicStatus.textContent = `Musica parada - Volume ${volumePercent}%`;
    return;
  }

  if (backgroundMusic.muted) {
    musicStatus.textContent = "Toque para ativar o som";
    return;
  }

  musicStatus.textContent = `Volume ${volumePercent}%`;
}

function updateVolumeUI() {
  volumeFill.style.width = `${getVolumePercent()}%`;
  updateMusicStatus();
}

function setInitialVolume() {
  backgroundMusic.volume = INITIAL_VOLUME;
  updateVolumeUI();
}

async function playMusic() {
  try {
    await backgroundMusic.play();
    setMusicButton(true);
    updateVolumeUI();
    return true;
  } catch {
    setMusicButton(false);
    musicStatus.textContent = "Nao foi possivel iniciar automaticamente";
    return false;
  }
}

async function activateSound() {
  backgroundMusic.muted = false;
  const started = await playMusic();

  if (started) {
    detachAudioActivation();
  }
}

async function handleAudioActivation() {
  await activateSound();
}

function attachAudioActivation() {
  AUDIO_ACTIVATION_EVENTS.forEach((eventName) => {
    document.addEventListener(eventName, handleAudioActivation, { once: true });
  });
}

function detachAudioActivation() {
  AUDIO_ACTIVATION_EVENTS.forEach((eventName) => {
    document.removeEventListener(eventName, handleAudioActivation);
  });
}

async function startMusicOnEntry() {
  backgroundMusic.muted = true;
  const started = await playMusic();

  if (!started) {
    backgroundMusic.muted = false;
    musicStatus.textContent = `Clique em play - Volume ${getVolumePercent()}%`;
    return;
  }

  attachAudioActivation();
}

function stopMusic() {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  setMusicButton(false);
  updateVolumeUI();
}

function changeVolume(delta) {
  backgroundMusic.volume = clamp(backgroundMusic.volume + delta, 0, 1);
  updateVolumeUI();
}

themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light");
  localStorage.setItem(THEME_STORAGE_KEY, isLight ? "light" : "dark");
  setThemeIcon(isLight);
});

musicToggle.addEventListener("click", async () => {
  if (backgroundMusic.paused || backgroundMusic.muted) {
    await activateSound();
    return;
  }

  stopMusic();
});

volumeDown.addEventListener("click", () => {
  changeVolume(-VOLUME_STEP);
});

volumeUp.addEventListener("click", () => {
  changeVolume(VOLUME_STEP);
});

backgroundMusic.addEventListener("play", () => {
  setMusicButton(true);
  updateVolumeUI();
});

backgroundMusic.addEventListener("pause", () => {
  setMusicButton(false);
  updateVolumeUI();
});

setStaticIcons();
setMusicButton(false);
applySavedTheme();
setInitialVolume();
startMusicOnEntry();

requestAnimationFrame(() => {
  document.documentElement.classList.add("theme-ready");
});
