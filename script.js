// ====== DOM ELEMENTS ======
const bird1 = document.getElementById("bird1");
const bird2 = document.getElementById("bird2");
const score1Display = document.getElementById("score1");
const score2Display = document.getElementById("score2");
const gameOverText = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const scoreSound = document.getElementById("scoreSound");
const hitSound = document.getElementById("hitSound");
const bgMusic = document.getElementById("bgMusic");
const label1 = document.getElementById("label1");
const label2 = document.getElementById("label2");
const countdownDiv = document.getElementById("countdown");

//          GAME STATE
let bird1X = 100, bird1Y = 200;
let bird2X = 100, bird2Y = 300;
const birdSpeed = 20;
let score1 = 0, score2 = 0;
let gameRunning = false;
let obstacleInterval;
let levelSpeed = 5;
let audioUnlocked = false;

document.addEventListener("keydown", (e) => {
  if (!audioUnlocked) {
    [scoreSound, hitSound, bgMusic].forEach(audio => audio.play().catch(() => {}));
    audioUnlocked = true;
  }
  moveBirds(e);
});

startBtn.addEventListener("click", () => {
  document.querySelectorAll(".obstacle").forEach(o => o.remove());
  startGame();
});

restartBtn.addEventListener("click", () => {
  document.querySelectorAll(".obstacle").forEach(o => o.remove());
  startGame();
});

//      FUNCTION: Move Birds
function moveBirds(e) {
  if (!gameRunning) return;

  // Player 1 Controls
  if (e.key === "ArrowUp" && bird1Y > 0) bird1Y -= birdSpeed;
  if (e.key === "ArrowDown" && bird1Y < window.innerHeight - bird1.clientHeight) bird1Y += birdSpeed;
  if (e.key === "ArrowLeft" && bird1X > 0) bird1X -= birdSpeed;
  if (e.key === "ArrowRight" && bird1X < window.innerWidth - bird1.clientWidth) bird1X += birdSpeed;

  // Player 2 Controls
  if ((e.key === "w" || e.key === "W") && bird2Y > 0) bird2Y -= birdSpeed;
  if ((e.key === "s" || e.key === "S") && bird2Y < window.innerHeight - bird2.clientHeight) bird2Y += birdSpeed;
  if ((e.key === "a" || e.key === "A") && bird2X > 0) bird2X -= birdSpeed;
  if ((e.key === "d" || e.key === "D") && bird2X < window.innerWidth - bird2.clientWidth) bird2X += birdSpeed;

  updateBirdPosition(bird1, label1, bird1X, bird1Y);
  updateBirdPosition(bird2, label2, bird2X, bird2Y);
}

function updateBirdPosition(bird, label, x, y) {
  bird.style.top = y + "px";
  bird.style.left = x + "px";
  label.style.top = (y - 20) + "px";
  label.style.left = x + "px";
  label.style.display = "block";
}

//         Spawn Obstacle
function spawnObstacle() {
  if (!gameRunning) return;

  const obstacle = document.createElement("div");
  const isMoving = Math.random() < 0.3;
  obstacle.classList.add("obstacle");
  if (isMoving) obstacle.classList.add("moving");

  let obstacleY = Math.random() * (window.innerHeight - 60);
  let obstacleX = window.innerWidth;
  let verticalDirection = 1;
  let verticalSpeed = 2 + Math.random() * 2;

  obstacle.style.top = obstacleY + "px";
  obstacle.style.right = "-60px";
  document.body.appendChild(obstacle);

  const moveInterval = setInterval(() => {
    if (!gameRunning) {
      clearInterval(moveInterval);
      obstacle.remove();
      return;
    }

    obstacleX -= levelSpeed;
    obstacle.style.right = (window.innerWidth - obstacleX) + "px";

    if (isMoving) {
      let currentTop = parseFloat(obstacle.style.top);
      currentTop += verticalDirection * verticalSpeed;
      if (currentTop <= 0) verticalDirection = 1;
      if (currentTop >= window.innerHeight - 60) verticalDirection = -1;
      obstacle.style.top = currentTop + "px";
    }

    checkCollisions(obstacle, moveInterval);
  }, 20);
}

//          Check Collisions
function checkCollisions(obstacle, moveInterval) {
  const bird1Rect = bird1.getBoundingClientRect();
  const bird2Rect = bird2.getBoundingClientRect();
  const obsRect = obstacle.getBoundingClientRect();

  function isCollision(birdRect, obsRect) {
    return !(birdRect.top > obsRect.bottom || birdRect.bottom < obsRect.top || birdRect.right < obsRect.left || birdRect.left > obsRect.right);
  }

  if (isCollision(bird1Rect, obsRect)) {
    hitSound.play();
    bird1.style.display = "none";
    label1.style.display = "none";
    endGame("Player 1");
    clearInterval(moveInterval);
    return;
  }
  if (isCollision(bird2Rect, obsRect)) {
    hitSound.play();
    bird2.style.display = "none";
    label2.style.display = "none";
    endGame("Player 2");
    clearInterval(moveInterval);
    return;
  }

  if (!obstacle.passedBy) obstacle.passedBy = {};

  if (!obstacle.passedBy.player1 && (obsRect.right < bird1Rect.left)) {
    obstacle.passedBy.player1 = true;
    score1++;
    scoreSound.currentTime = 0;
    scoreSound.play();
    score1Display.textContent = "Player 1 Score: " + score1;
    if ((score1 + score2) % 5 === 0) levelSpeed += 1;
  }

  if (!obstacle.passedBy.player2 && (obsRect.right < bird2Rect.left)) {
    obstacle.passedBy.player2 = true;
    score2++;
    scoreSound.currentTime = 0;
    scoreSound.play();
    score2Display.textContent = "Player 2 Score: " + score2;
    if ((score1 + score2) % 5 === 0) levelSpeed += 1;
  }

  if (parseFloat(obstacle.style.right) > window.innerWidth + 60) {
    obstacle.remove();
    clearInterval(moveInterval);
  }
}

//      Countdown Before Start
function showCountdown(callback) {
  let count = 3;
  countdownDiv.style.display = "block";
  countdownDiv.textContent = count;
  label1.style.display = "block";
  label2.style.display = "block";

  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownDiv.textContent = count;
    } else if (count === 0) {
      countdownDiv.textContent = "Go!";
    } else {
      clearInterval(countdownInterval);
      countdownDiv.style.display = "none";
      callback();
    }
  }, 800);
}

//      Start Game
function startGame() {
  // Reset bird positions
  bird1X = 100; bird1Y = 200;
  bird2X = 100; bird2Y = 300;

  updateBirdPosition(bird1, label1, bird1X, bird1Y);
  bird1.style.display = "block";
  updateBirdPosition(bird2, label2, bird2X, bird2Y);
  bird2.style.display = "block";

  // Reset game
  score1 = 0;
  score2 = 0;
  levelSpeed = 5;
  gameRunning = false;
  bgMusic.currentTime = 0;
  bgMusic.play();

  score1Display.textContent = "Player 1 Score: 0";
  score2Display.textContent = "Player 2 Score: 0";
  gameOverText.style.display = "none";
  restartBtn.style.display = "none";
  startBtn.style.display = "none";

  // Start after countdown
  showCountdown(() => {
    gameRunning = true;
    obstacleInterval = setInterval(() => {
      if (gameRunning) spawnObstacle();
    }, 1500);
  });
}

//      FUNCTION: End Game
function endGame(loser) {
  gameRunning = false;
  const winner = loser === "Player 1" ? "Player 2" : "Player 1";

  gameOverText.textContent = `${loser} Loses!`;
  gameOverText.style.display = "block";
  restartBtn.style.display = "block";
  startBtn.style.display = "none";

  clearInterval(obstacleInterval);
  bgMusic.pause();

  setTimeout(() => {
    gameOverText.textContent = `${winner} Wins!`;
  }, 3000);
}