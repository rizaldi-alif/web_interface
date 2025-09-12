let playTime = 0;
let timerInterval;
let isTimerRunning = false;
const hour = document.getElementById("hour");
const minute = document.getElementById("minute");
const second = document.getElementById("second");

function updateTimerDisplay() {
  let hrs = Math.floor(playTime / 3600);
  let mins = Math.floor((playTime % 3600) / 60);
  let secs = playTime % 60;

  hour.textContent = String(hrs).padStart(2, "0");
  minute.textContent = String(mins).padStart(2, "0");
  second.textContent = String(secs).padStart(2, "0");
}

function startTimer() {
  if (!isTimerRunning) {
    isTimerRunning = true;
    timerInterval = setInterval(() => {
      playTime++;
      updateTimerDisplay();
    }, 1000);
  }
}

startTimer();
