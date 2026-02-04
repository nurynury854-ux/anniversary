// Prevent browser scroll restoration
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// --------------------
// DOM ELEMENTS
// --------------------
const world = document.getElementById("world");
const intro = document.getElementById("intro");
const startBtn = document.getElementById("startBtn");
const avatar = document.querySelector(".avatar");
const memoryCards = document.querySelectorAll(".memory-card");
const fullscreenScenes = document.querySelectorAll(".fullscreen-scene");
const sceneMarkers = document.querySelectorAll(".scene-trigger");
const chapterTitles = document.querySelectorAll(".chapter-title");

// --------------------
// GAME STATE
// --------------------
let positionY = 0;
const speed = 40;
let maxDown = 0;
const maxUp = 0;

let journeyStarted = false;
let canMove = false;
let isPausedAtChapter = false;
let currentExpression = "neutral";

// Keyboard state for debouncing
let keyDown = false;
let lastMoveTime = 0;
const moveCooldown = 50; // milliseconds between moves

// --------------------
// CHAPTER TRIGGERS
// --------------------
const sceneTriggers = Array.from(sceneMarkers)
  .map(marker => {
    const triggerId = marker.dataset.trigger;
    const scene = document.querySelector(
      `.fullscreen-scene[data-trigger="${triggerId}"]`
    );
    return { marker, scene, paused: false };
  })
  .filter(item => item.scene);

const expressions = {
  neutral: "sprites/her_neutral.png",
  smile: "sprites/her_smile.png",
  happy: "sprites/her_happy.png",
  tired: "sprites/her_tired.png",
  affectionate: "sprites/her_affection.png",
  tease: "sprites/her_tease.png"
};

const finalText = document.querySelector(".final-text");
const triggeredCards = new Set();
const triggeredScenes = new Set();
let finalTextTriggered = false;
let expressionTimers = [];

// --------------------
// FUNCTIONS
// --------------------

function updateWorld() {
  world.style.transform = `translateY(${positionY}px)`;
  if (positionY <= maxDown + 5) {
    world.classList.add("world-bg-end");
  } else {
    world.classList.remove("world-bg-end");
  }
}

function recalcBounds() {
  maxDown = -(world.scrollHeight - window.innerHeight);
  if (positionY < maxDown) positionY = maxDown;
  if (positionY > maxUp) positionY = maxUp;
  updateWorld();
  updateMemories();
}

window.addEventListener("resize", recalcBounds);
recalcBounds();

function setExpression(name) {
  if (expressions[name]) {
    currentExpression = name;
    avatar.style.backgroundImage = `url(${expressions[name]})`;
  }
}

function clearExpressionTimers() {
  expressionTimers.forEach(timerId => clearTimeout(timerId));
  expressionTimers = [];
}

function scheduleExpression(name, delayMs) {
  const timerId = setTimeout(() => setExpression(name), delayMs);
  expressionTimers.push(timerId);
}

function handleCardExpression(triggerId) {
  clearExpressionTimers();

  switch (triggerId) {
    case "1":
      setExpression("neutral");
      break;
    case "2":
      setExpression("smile");
      break;
    case "3":
      setExpression("neutral");
      break;
    case "5":
      setExpression("smile");
      break;
    case "6":
      setExpression("smile");
      scheduleExpression("affectionate", 500);
      scheduleExpression("smile", 1000);
      break;
    case "7":
      setExpression("happy");
      scheduleExpression("tired", 1200);
      scheduleExpression("neutral", 2200);
      break;
    case "8":
      setExpression("smile");
      break;
    case "9":
      setExpression("happy");
      break;
    case "10":
      setExpression("tired");
      scheduleExpression("affectionate", 1000);
      break;
    case "11":
      setExpression("smile");
      break;
    case "12":
      setExpression("happy");
      break;
    case "13":
      setExpression("neutral");
      break;
    case "14":
      setExpression("smile");
      break;
    case "15":
      setExpression("affectionate");
      break;
    case "16":
      setExpression("smile");
      break;
    case "17":
      setExpression("affectionate");
      break;
    case "18":
      setExpression("neutral");
      break;
    case "19":
      setExpression("tired");
      scheduleExpression("smile", 1000);
      break;
    case "20":
      setExpression("happy");
      break;
    case "21":
      setExpression("tired");
      scheduleExpression("affectionate", 1000);
      break;
    case "22":
      setExpression("smile");
      break;
    default:
      break;
  }
}

function handleSceneExpression(triggerId) {
  clearExpressionTimers();

  if (triggerId === "4") {
    setExpression("happy");
  }
}

function checkChapterTriggers() {
  const viewCenter = window.innerHeight * 0.5;

  sceneTriggers.forEach(item => {
    const markerRect = item.marker.getBoundingClientRect();
    const markerCenter = markerRect.top + markerRect.height * 0.5;
    const distance = Math.abs(viewCenter - markerCenter);

    // If within trigger zone and not yet paused at this scene
    if (distance < 200 && !item.paused) {
      item.paused = true;
      isPausedAtChapter = true;
      canMove = false;

      item.scene.style.opacity = "1";
      item.scene.style.pointerEvents = "auto";
      item.scene.style.visibility = "visible";

      const triggerId = item.marker.dataset.trigger;
      if (!triggeredScenes.has(triggerId)) {
        triggeredScenes.add(triggerId);
        handleSceneExpression(triggerId);
      }
    }

    // If we've moved away from trigger zone, reset pause
    if (distance > 260 && item.paused) {
      item.paused = false;
    }
  });
}

function updateMemories() {
  const viewCenter = window.innerHeight * 0.5;

  memoryCards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.top + rect.height * 0.5;
    const distance = Math.abs(viewCenter - cardCenter);

    // Show card when within 250px of viewport center (closer to middle of screen)
    if (distance < 250) {
      card.style.opacity = "1";
      card.style.pointerEvents = "auto";
      card.style.transform = "translateX(-50%) scale(1)";
      card.style.visibility = "visible";

      const triggerId = card.dataset.trigger;
      if (!triggeredCards.has(triggerId)) {
        triggeredCards.add(triggerId);
        handleCardExpression(triggerId);
      }
    } else {
      card.style.opacity = "0";
      card.style.pointerEvents = "none";
      card.style.transform = "translateX(-50%) scale(0.95)";
      card.style.visibility = "hidden";
    }
  });

  // Update chapter titles visibility based on actual positions
  chapterTitles.forEach(title => {
    const rect = title.getBoundingClientRect();
    const titleCenter = rect.top + rect.height * 0.5;
    const distance = Math.abs(viewCenter - titleCenter);
    title.style.opacity = distance < 400 ? "0.8" : "0";
    title.style.visibility = distance < 400 ? "visible" : "hidden";
  });

  if (finalText && !finalTextTriggered) {
    const rect = finalText.getBoundingClientRect();
    const textCenter = rect.top + rect.height * 0.5;
    const distance = Math.abs(viewCenter - textCenter);
    if (distance < 300) {
      finalTextTriggered = true;
      clearExpressionTimers();
      setExpression("neutral");
    }
  }
}

function moveForward() {
  if (!journeyStarted || !canMove) return;

  const now = Date.now();
  if (now - lastMoveTime < moveCooldown) return;
  lastMoveTime = now;

  positionY -= speed;
  if (positionY < maxDown) positionY = maxDown;

  updateWorld();
  updateMemories();
  checkChapterTriggers();
}

function moveBackward() {
  if (!journeyStarted || !canMove) return;

  const now = Date.now();
  if (now - lastMoveTime < moveCooldown) return;
  lastMoveTime = now;

  positionY += speed;
  if (positionY > maxUp) positionY = maxUp;

  updateWorld();
  updateMemories();
  checkChapterTriggers();
}

function resetState() {
  positionY = 0;
  journeyStarted = false;
  canMove = false;
  isPausedAtChapter = false;
  lastMoveTime = 0;
  finalTextTriggered = false;
  triggeredCards.clear();
  triggeredScenes.clear();
  clearExpressionTimers();
  
  // Force world back to top
  world.style.transform = "translateY(0px)";
  world.classList.remove("world-bg-end");
  
  // Ensure intro is visible
  intro.style.display = "flex";
  intro.style.opacity = "1";
  intro.style.visibility = "visible";
  
  fullscreenScenes.forEach(scene => {
    scene.style.opacity = "0";
    scene.style.pointerEvents = "none";
    scene.style.visibility = "hidden";
  });
  
  sceneTriggers.forEach(item => { item.paused = false; });
  
  memoryCards.forEach(card => {
    card.style.opacity = "0";
    card.style.pointerEvents = "none";
    card.style.transform = "translateX(-50%) scale(0.95)";
    card.style.visibility = "hidden";
  });
  
  chapterTitles.forEach(title => {
    title.style.opacity = "0";
    title.style.visibility = "hidden";
  });
  
  setExpression("neutral");
}

// Initialize game state on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", resetState);
} else {
  resetState();
}

// --------------------
// EVENT LISTENERS
// --------------------

// Reset on page load/refresh
window.addEventListener("pageshow", () => {
  resetState();
});

// Start button
startBtn.addEventListener("click", () => {
  intro.style.opacity = "0";
  setTimeout(() => {
    intro.style.display = "none";
  }, 600);

  journeyStarted = true;
  canMove = true;
});

// Keyboard controls
window.addEventListener("keydown", (e) => {
  if (e.key === "s" || e.key === "S") {
    e.preventDefault();
    moveForward();
  }
  if (e.key === "w" || e.key === "W") {
    e.preventDefault();
    moveBackward();
  }
});

// Continue buttons in fullscreen scenes
document.querySelectorAll(".continueBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    // Hide all fullscreen scenes
    fullscreenScenes.forEach(scene => {
      scene.style.opacity = "0";
      scene.style.pointerEvents = "none";
      scene.style.visibility = "hidden";
    });
    
    // Re-enable movement
    isPausedAtChapter = false;
    canMove = true;

    clearExpressionTimers();
    setExpression("smile");
  });
});
