// game.js

const questions = [
  {
    text: "Which OSI layer handles routing?",
    correct: "Network",
    distractors: ["Transport", "Data Link", "Session"],
    tier: 1
  },
  {
    text: "A switch primarily operates at which OSI layer?",
    correct: "Data Link",
    distractors: ["Physical", "Network", "Session"],
    tier: 1
  }
  // TODO: add more, with higher tiers
];

let currentTier = 1;
let loopNumber = 1;
let score = 0;
let streak = 0;
let remainingQuestions = 0;
let currentQuestion = null;
let currentAnswers = [];
let gameStarted = false;

const questionTextEl = document.getElementById("questionText");
const answerButtons = document.querySelectorAll(".answer-btn");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const loopEl = document.getElementById("loop");
const tierEl = document.getElementById("tier");
const streakEl = document.getElementById("streak");
const remainingEl = document.getElementById("remaining");
const difficultyLabelEl = document.getElementById("difficultyLabel");
const badgeRowEl = document.getElementById("badgeRow");
const climberEl = document.getElementById("climber");
const finalOverlayEl = document.getElementById("finalOverlay");
const finalTitleEl = document.getElementById("finalTitle");
const finalSubtitleEl = document.getElementById("finalSubtitle");
const playAgainBtn = document.getElementById("playAgainBtn");
const musicToggleBtn = document.getElementById("musicToggle");
const bgMusic = document.getElementById("bgMusic");

function shuffle(array) {
  return array
    .map(v => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);
}

function getTierLabel(tier) {
  switch (tier) {
    case 1: return "Tier 1 — Warm‑up";
    case 2: return "Tier 2 — Steeper Slopes";
    case 3: return "Tier 3 — Thin Air";
    case 4: return "Tier 4 — Expert Ascent";
    case 5: return "Tier 5 — Only Pros Survive";
    default: return `Tier ${tier}`;
  }
}

function filterQuestionsByTier(tier) {
  return questions.filter(q => q.tier === tier);
}

function startGame() {
  gameStarted = true;
  loopNumber = 1;
  currentTier = 1;
  score = 0;
  streak = 0;
  badgeRowEl.innerHTML = "";
  updateHUD();
  startLoop();
}

function startLoop() {
  const pool = filterQuestionsByTier(currentTier);
  remainingQuestions = pool.length;
  remainingEl.textContent = remainingQuestions;
  difficultyLabelEl.textContent = getTierLabel(currentTier);
  nextQuestion(pool);
}

function nextQuestion(pool) {
  if (remainingQuestions <= 0) {
    reachSummit();
    return;
  }

  currentQuestion = pool[remainingQuestions - 1]; // simple index
  const answers = [currentQuestion.correct, ...currentQuestion.distractors];
  currentAnswers = shuffle(answers);

  questionTextEl.textContent = currentQuestion.text;
  answerButtons.forEach((btn, i) => {
    btn.textContent = currentAnswers[i];
    btn.disabled = false;
  });
}

function handleAnswer(index) {
  if (!currentQuestion) return;

  const chosen = currentAnswers[index];
  const isCorrect = chosen === currentQuestion.correct;

  if (isCorrect) {
    score += 100 * getTierMultiplier(currentTier);
    streak += 1;
    moveClimberUp();
  } else {
    score -= 25;
    streak = 0;
    moveClimberDown();
  }

  remainingQuestions -= 1;
  updateHUD();

  const pool = filterQuestionsByTier(currentTier);
  nextQuestion(pool);
}

function getTierMultiplier(tier) {
  if (tier === 1) return 1;
  if (tier === 2) return 1.25;
  if (tier === 3) return 1.5;
  if (tier === 4) return 2;
  if (tier >= 5) return 3;
}

function moveClimberUp() {
  const bottom = parseFloat(getComputedStyle(climberEl).bottom);
  climberEl.style.bottom = `${bottom + 8}%`;
}

function moveClimberDown() {
  const bottom = parseFloat(getComputedStyle(climberEl).bottom);
  climberEl.style.bottom = `${Math.max(5, bottom - 5)}%`;
}

function reachSummit() {
  // Add badge
  const badge = document.createElement("div");
  badge.className = "badge-icon";
  badgeRowEl.appendChild(badge);

  // Increase difficulty
  loopNumber += 1;
  currentTier += 1;
  updateHUD();

  // Check if we’ve exhausted all tiers
  const maxTier = 5;
  if (currentTier > maxTier) {
    showFinal();
  } else {
    // Reset climber position
    climberEl.style.bottom = "10%";
    startLoop();
  }
}

function updateHUD() {
  scoreEl.textContent = score;
  loopEl.textContent = loopNumber;
  tierEl.textContent = currentTier;
  streakEl.textContent = streak;
  remainingEl.textContent = remainingQuestions;
}

function showFinal() {
  finalTitleEl.textContent = "You conquered the peak!";
  finalSubtitleEl.textContent = "You’re the Ultimate OSI Mountaineer.";
  finalOverlayEl.style.display = "flex";
}

function resetGame() {
  finalOverlayEl.style.display = "none";
  climberEl.style.bottom = "10%";
  startGame();
}

// Music toggle (no autoplay)
let musicOn = false;
musicToggleBtn.addEventListener("click", () => {
  musicOn = !musicOn;
  if (musicOn) {
    bgMusic.play();
    musicToggleBtn.textContent = "Music: On";
  } else {
    bgMusic.pause();
    musicToggleBtn.textContent = "Music: Off";
  }
});

startBtn.addEventListener("click", () => {
  if (!gameStarted) startGame();
});

answerButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const index = parseInt(btn.dataset.index, 10);
    handleAnswer(index);
  });
});

playAgainBtn.addEventListener("click", resetGame);

function setClimberAnim(type) {
  climberEl.className = "climber " + type;
}

function moveClimberUp() {
  setClimberAnim("climb");
  const bottom = parseFloat(getComputedStyle(climberEl).bottom);
  climberEl.style.bottom = `${bottom + 8}%`;
  setTimeout(() => setClimberAnim("idle"), 500);
}

function moveClimberDown() {
  setClimberAnim("slip");
  const bottom = parseFloat(getComputedStyle(climberEl).bottom);
  climberEl.style.bottom = `${Math.max(5, bottom - 5)}%`;
  setTimeout(() => setClimberAnim("idle"), 500);
}

function playVictory() {
  setClimberAnim("victory");
}

function setClimberAnim(type) {
  climberEl.className = "climber " + type;
}
// Simple Web Audio synth loop (placeholder music)
let audioCtx = null;
let musicPlaying = false;
let musicNodes = [];

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function startMusicLoop() {
  initAudio();
  stopMusicLoop();

  const bpm = 110;
  const beatTime = 60 / bpm;
  const patternLength = 8;

  for (let i = 0; i < patternLength; i++) {
    const time = audioCtx.currentTime + i * beatTime;

    // Bass note
    const bass = audioCtx.createOscillator();
    const bassGain = audioCtx.createGain();
    bass.type = "sawtooth";
    bass.frequency.value = i % 2 === 0 ? 110 : 82; // A2 / E2
    bassGain.gain.setValueAtTime(0.0, time);
    bassGain.gain.linearRampToValueAtTime(0.2, time + 0.01);
    bassGain.gain.exponentialRampToValueAtTime(0.001, time + beatTime);

    bass.connect(bassGain).connect(audioCtx.destination);
    bass.start(time);
    bass.stop(time + beatTime);
    musicNodes.push(bass);

    // Simple lead blip
    const lead = audioCtx.createOscillator();
    const leadGain = audioCtx.createGain();
    lead.type = "triangle";
    lead.frequency.value = 440 + i * 20; // rising feel
    leadGain.gain.setValueAtTime(0.0, time + beatTime / 2);
    leadGain.gain.linearRampToValueAtTime(0.15, time + beatTime / 2 + 0.01);
    leadGain.gain.exponentialRampToValueAtTime(0.001, time + beatTime);

    lead.connect(leadGain).connect(audioCtx.destination);
    lead.start(time + beatTime / 2);
    lead.stop(time + beatTime);
    musicNodes.push(lead);
  }

  // Loop by calling again
  setTimeout(() => {
    if (musicPlaying) startMusicLoop();
  }, beatTime * patternLength * 1000);
}

function stopMusicLoop() {
  musicNodes.forEach(node => {
    try { node.stop(); } catch (e) {}
  });
  musicNodes = [];
}

// Hook into your existing toggle
musicToggleBtn.addEventListener("click", () => {
  musicPlaying = !musicPlaying;
  if (musicPlaying) {
    startMusicLoop();
    musicToggleBtn.textContent = "Music: On";
  } else {
    stopMusicLoop();
    musicToggleBtn.textContent = "Music: Off";
  }
});
function setClimberAnim(type) {
  climberEl.className = "climber " + type;
}

function moveClimberUp() {
  setClimberAnim("climb");
  const bottom = parseFloat(getComputedStyle(climberEl).bottom);
  climberEl.style.bottom = `${bottom + 8}%`;
  setTimeout(() => setClimberAnim("idle"), 500);
}

function moveClimberDown() {
  setClimberAnim("slip");
  const bottom = parseFloat(getComputedStyle(climberEl).bottom);
  climberEl.style.bottom = `${Math.max(5, bottom - 5)}%`;
  setTimeout(() => setClimberAnim("idle"), 500);
}

function playVictory() {
  setClimberAnim("victory");
}
