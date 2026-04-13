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
  } catch {
    setMusicButton(false);
    musicStatus.textContent = `Clique em play - Volume ${getVolumePercent()}%`;
  }
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
  if (backgroundMusic.paused) {
    await playMusic();
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
playMusic();

requestAnimationFrame(() => {
  document.documentElement.classList.add("theme-ready");
});
