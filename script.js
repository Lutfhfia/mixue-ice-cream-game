// =====================================
// GAME VARIABLES
// =====================================

let gameRunning = false;

let score = 0;

let lives = 3;

// Posisi karakter
let playerX = 0;

// Kecepatan awal es krim (pixel per frame)
let speed = 2.6;

// Timer / animation
let gameLoop;
let iceCreamLoop;

// Waktu game dimulai
let gameStartTime = 0;

// =====================================
// GAME SOUND
// =====================================

// Folder audio bernama "sound", bukan "sounds".
const gameSound = new Audio("sound/game.mp3");

gameSound.loop = true;

gameSound.volume = 0.5;

// =====================================
// MIXUE ITEMS
// =====================================

const mixueItems = [
  "images/mixue1.png",
  "images/mixue2.png",
  "images/mixue3.png",
  "images/mixue4.png",
];

// =====================================
// ELEMENTS
// =====================================

const game = document.getElementById("game");

const person = document.getElementById("person");

const items = document.getElementById("items");

const scoreText = document.getElementById("score");

const livesText = document.getElementById("lives");

const startScreen = document.getElementById("startScreen");

const startBtn = document.getElementById("startBtn");

const gameOver = document.getElementById("gameOver");

const finalScore = document.getElementById("finalScore");

const restartBtn = document.getElementById("restartBtn");

// =====================================
// KEYBOARD CONTROL
// =====================================

let leftPressed = false;

let rightPressed = false;

// Tombol keyboard ditekan
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    leftPressed = true;

    event.preventDefault();
  }

  if (event.key === "ArrowRight") {
    rightPressed = true;

    event.preventDefault();
  }
});

// Tombol keyboard dilepas
document.addEventListener("keyup", function (event) {
  if (event.key === "ArrowLeft") {
    leftPressed = false;
  }

  if (event.key === "ArrowRight") {
    rightPressed = false;
  }
});

// =====================================
// TOUCH CONTROL
// =====================================

let touchStartX = 0;

let touchStartY = 0;


game.addEventListener("touchstart", function (event) {

  if (!gameRunning) {
    return;
  }

  const touch = event.touches[0];

  touchStartX = touch.clientX;

  touchStartY = touch.clientY;

}, { passive: true });


game.addEventListener(
  "touchmove",
  function (event) {
    if (!gameRunning) {
      return;
    }

    const touch = event.touches[0];

    const currentX = touch.clientX;

    const differenceX = currentX - touchStartX;

    // Geser karakter
    playerX += differenceX;

    // Batas arena
    const gameWidth = game.clientWidth;

    const minX = gameWidth * 0.25;

    const maxX = gameWidth * 0.75;

    if (playerX < minX) {
      playerX = minX;
    }

    if (playerX > maxX) {
      playerX = maxX;
    }

    // Update posisi langsung
    person.style.left = playerX + "px";

    // Simpan posisi jari
    touchStartX = currentX;

    event.preventDefault();
  },
  { passive: false },
);

// =====================================
// BUTTON
// =====================================

startBtn.addEventListener("click", function () {
  startGame();
});

restartBtn.addEventListener("click", function () {
  restartGame();
});

// =====================================
// START GAME
// =====================================

function startGame() {
  gameRunning = true;

  gameSound.currentTime = 0;

 gameSound.play().catch(function (error) {
   console.log("Game sound tidak dapat diputar:", error);
 });

  score = 0;

  lives = 3;

  // Kecepatan awal
  speed = 2.6;

  // Simpan waktu mulai
  gameStartTime = Date.now();

  // Posisi awal karakter
  playerX = game.clientWidth / 2;

  // Update tampilan
  scoreText.textContent = score;

  livesText.textContent = lives;

  // Posisi karakter
  person.style.left = playerX + "px";

  // Hilangkan start screen
  startScreen.style.display = "none";

  // Sembunyikan game over
  gameOver.style.display = "none";

  // Bersihkan es krim lama
  items.innerHTML = "";

  // Mulai game loop
  gameLoop = requestAnimationFrame(updateGame);

  // Munculkan es krim. Interval akan makin singkat seiring waktu.
  scheduleIceCream();
}

// =====================================
// GAME LOOP
// =====================================

function updateGame() {
  if (!gameRunning) {
    return;
  }

  // Gerakkan karakter
  movePlayer();

  // Tingkatkan kesulitan
  increaseDifficulty();

  // Gerakkan es krim
  moveIceCream();

  // Jalankan frame berikutnya
  gameLoop = requestAnimationFrame(updateGame);
}

// =====================================
// PLAYER MOVEMENT
// =====================================

function movePlayer() {
  const gameWidth = game.clientWidth;

  // Arena karakter sekitar 60% dari lebar game,
  // agar tetap dapat mengejar es krim yang lebih menyebar.
  // dari lebar game
  const minX = gameWidth * 0.2;

  const maxX = gameWidth * 0.8;

  // Kecepatan karakter
  const playerSpeed = 5;

  // Gerak kiri
  if (leftPressed) {
    playerX -= playerSpeed;
  }

  // Gerak kanan
  if (rightPressed) {
    playerX += playerSpeed;
  }

  // Batas kiri
  if (playerX < minX) {
    playerX = minX;
  }

  // Batas kanan
  if (playerX > maxX) {
    playerX = maxX;
  }

  // Terapkan posisi
  person.style.left = playerX + "px";
}

// =====================================
// CREATE ICE CREAM
// =====================================

function createIceCream() {
  if (!gameRunning) {
    return;
  }

  const iceCream = document.createElement("img");

  // Class untuk CSS
  iceCream.classList.add("ice-cream");

  // =================================
  // PILIH GAMBAR MIXUE RANDOM
  // =================================

  const randomIndex = Math.floor(Math.random() * mixueItems.length);

  iceCream.src = mixueItems[randomIndex];

  iceCream.alt = "Mixue Item";

  // =================================
  // AREA SPAWN
  // =================================

  const gameWidth = game.clientWidth;

  /*
        Area gerak sekitar 60%
        dari lebar game.
    */

  const minX = gameWidth * 0.2;

  const maxX = gameWidth * 0.8;

  // Makin lama, posisi spawn makin berjauhan agar item tidak bertumpuk.
  const level = Math.floor((Date.now() - gameStartTime) / 5000);
  const minimumDistance = Math.min(130, 85 + level * 8);
  const existingIceCreams = document.querySelectorAll(".ice-cream");
  let randomX = minX;
  let bestDistance = -1;

  // Ambil posisi terbaik dari beberapa kandidat random.
  for (let attempt = 0; attempt < 12; attempt++) {
    const candidateX = minX + Math.random() * (maxX - minX);
    let closestDistance = Infinity;

    existingIceCreams.forEach(function (existingIceCream) {
      const distance = Math.abs(candidateX - Number(existingIceCream.dataset.x));
      closestDistance = Math.min(closestDistance, distance);
    });

    if (closestDistance > bestDistance) {
      bestDistance = closestDistance;
      randomX = candidateX;
    }

    if (closestDistance >= minimumDistance) {
      randomX = candidateX;
      break;
    }
  }

  iceCream.style.left = randomX + "px";
  iceCream.dataset.x = randomX;

  // =================================
  // POSISI AWAL
  // =================================

const startY = -5;

iceCream.style.top = startY + "px";

iceCream.dataset.y = startY;

  // Masukkan ke game
  items.appendChild(iceCream);
}

// =====================================
// ICE CREAM SPAWN
// =====================================

function scheduleIceCream() {
  if (!gameRunning) {
    return;
  }

  const elapsedTime = (Date.now() - gameStartTime) / 1000;

  // Awalnya renggang, lalu setiap 5 detik item muncul lebih sering.
  // Batas 900 ms menjaga permainan tetap adil.
  const spawnDelay = Math.max(900, 1800 - Math.floor(elapsedTime / 5) * 150);

  iceCreamLoop = setTimeout(function () {
    createIceCream();
    scheduleIceCream();
  }, spawnDelay);
}

// =====================================
// MOVE ICE CREAM
// =====================================

function moveIceCream() {
  const iceCreams = document.querySelectorAll(".ice-cream");

  iceCreams.forEach(function (iceCream) {
    let y = parseFloat(iceCream.dataset.y);

    // Gerakkan sesuai speed
    y += speed;

    iceCream.dataset.y = y;

    iceCream.style.top = y + "px";

    if (y >= 20) {
      iceCream.style.opacity = "1";
    }

    // Cek apakah tertangkap
    checkCollision(iceCream);

    // Kalau jatuh sampai bawah
    if (iceCream.parentNode && y > game.clientHeight) {
      iceCream.remove();

      loseLife();
    }
  });
}

// =====================================
// DIFFICULTY
// =====================================

function increaseDifficulty() {
  // Berapa detik game sudah berjalan
  const elapsedTime = (Date.now() - gameStartTime) / 1000;

  /*
        Setiap 5 detik:

        0 - 4 detik   = speed 2.6
        5 - 9         = speed 3.15
        10 - 14       = speed 3.7
        15 - 19       = speed 4.25
        dst.
        dst.
    */

  speed = 2.6 + Math.floor(elapsedTime / 5) * 0.55;

  // Kecepatan maksimum
  if (speed > 7) {
    speed = 7;
  }
}

// =====================================
// COLLISION
// =====================================

function checkCollision(iceCream) {
  const iceRect = iceCream.getBoundingClientRect();

  const playerRect = person.getBoundingClientRect();

  // Cek tabrakan
  if (
    iceRect.left < playerRect.right &&
    iceRect.right > playerRect.left &&
    iceRect.top < playerRect.bottom &&
    iceRect.bottom > playerRect.top
  ) {
    // Tambah score
    score += 10;

    // Update score
    scoreText.textContent = score;

    // Hapus es krim
    iceCream.remove();
  }
}

// =====================================
// LOSE LIFE
// =====================================

function loseLife() {
  if (!gameRunning) {
    return;
  }

  lives--;

  livesText.textContent = lives;

  // Kalau nyawa habis
  if (lives <= 0) {
    endGame();
  }
}

// =====================================
// GAME OVER
// =====================================

function endGame() {
  gameRunning = false;

  gameSound.pause();

  gameSound.currentTime = 0;

  // Hentikan timer
  clearTimeout(iceCreamLoop);

  // Hentikan animation
  cancelAnimationFrame(gameLoop);

  // Tampilkan score terakhir
  finalScore.textContent = score;

  // Tampilkan Game Over
  gameOver.style.display = "flex";
}

// =====================================
// RESTART
// =====================================

function restartGame() {
  gameSound.currentTime = 0;

gameSound.play().catch(function (error) {
  console.log("Game sound tidak dapat diputar:", error);
});

  clearTimeout(iceCreamLoop);

  cancelAnimationFrame(gameLoop);

  items.innerHTML = "";

  gameRunning = true;

  score = 0;

  lives = 3;

  speed = 2.6;

  gameStartTime = Date.now();

  // Posisi karakter
  playerX = game.clientWidth / 2;

  // Update HUD
  scoreText.textContent = score;

  livesText.textContent = lives;

  // Posisi karakter
  person.style.left = playerX + "px";

  // Sembunyikan Game Over
  gameOver.style.display = "none";

  // Mulai game
  gameLoop = requestAnimationFrame(updateGame);

  // Spawn es krim dengan interval yang makin singkat.
  scheduleIceCream();
}
