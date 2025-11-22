// pacman.js — FINAL ONCHAIN + UI FIXED

let score = 0;

function addScore() {
  score++;
  document.getElementById("score").innerHTML = score;

  // directly submit score on-chain
  if (window.submitScoreOnchain) {
    window.submitScoreOnchain(score);
  }
}

function gameOver() {
  alert("Game Over! Final Score: " + score);
}

// Pacman engine berikutnya sama seperti versi kamu,
// saya kirim versi final lengkap kalau mau.
