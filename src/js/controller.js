const leftJoystick = nipplejs.create({
  zone: leftJoystickContainer,
  mode: "static",
  position: { left: "26%", top: "50%" },
  color: "oklch(62.3% 0.214 259.815)",
  size: 150,
  restOpacity: 0.5,
  lockY: true,
});

const rightJoystick = nipplejs.create({
  zone: rightJoystickContainer,
  mode: "static",
  position: { right: "26%", top: "50%" },
  color: "oklch(62.3% 0.214 259.815)",
  size: 150,
  restOpacity: 0.5,
  lockX: true,
});

const maxDistance = 150 / 2;
// ==================== CONFIGURASI ====================
const CONFIG = {
  deadzone: 12, // % area mati biar joystick nggak gerak sendiri
  throttleScale: 1.0, // skala kecepatan (0.0 - 1.5, tergantung motor & supply)
  steeringScale: 1.0, // skala belok (0.0 - 1.5)
  maxOutput: 100, // batas maksimum output motor
};
// =====================================================

// Helper untuk normalisasi input joystick (0 - 100)
function normalizeInput(value, maxDistance, deadzone) {
  if (value < deadzone) return 0;
  const range = maxDistance - deadzone;
  return Math.min(1, (value - deadzone) / range) * 100;
}

// Variabel motor terakhir (biar bisa dipakai untuk optimisasi)
let lastLeftMotor = 0;
let lastRightMotor = 0;

// Fungsi hitung kecepatan motor
function calculateMotorSpeeds(throttle, steering) {
  throttle = throttle * CONFIG.throttleScale;
  steering = steering * CONFIG.steeringScale;

  let leftMotor = throttle - steering;
  let rightMotor = throttle + steering;

  if (throttle < 0) {
    leftMotor = throttle + steering;
    rightMotor = throttle - steering;
  }

  // Batasi output agar tidak lebih dari maxOutput
  leftMotor = Math.max(
    -CONFIG.maxOutput,
    Math.min(CONFIG.maxOutput, Math.round(leftMotor))
  );
  rightMotor = Math.max(
    -CONFIG.maxOutput,
    Math.min(CONFIG.maxOutput, Math.round(rightMotor))
  );

  return { leftMotor, rightMotor };
}

// Event Joystick Kiri (Throttle)
leftJoystick.on("move", (evt, data) => {
  if (data && data.distance !== undefined) {
    const throttle = normalizeInput(
      data.distance,
      maxDistance,
      (CONFIG.deadzone / 100) * maxDistance
    );

    lastThrottle = data.angle.degree < 180 ? throttle : -throttle; // atas = maju, bawah = mundur
  }
});

leftJoystick.on("end", () => {
  lastThrottle = 0;
  sendMotorCommand(0, 0);
});

// Event Joystick Kanan (Steering)
rightJoystick.on("move", (evt, data) => {
  if (data && data.distance !== undefined) {
    const steering = normalizeInput(
      data.distance,
      maxDistance,
      (CONFIG.deadzone / 100) * maxDistance
    );

    lastSteering =
      data.angle.degree > 90 && data.angle.degree < 270 ? steering : -steering; // kiri = -, kanan = +
  }
});

rightJoystick.on("end", () => {
  lastSteering = 0;
  sendMotorCommand(0, 0);
});

// Variabel global throttle & steering
let lastThrottle = 0;
let lastSteering = 0;

// Kirim perintah motor
function sendMotorCommand(throttle, steering) {
  const { leftMotor, rightMotor } = calculateMotorSpeeds(throttle, steering);

  if (leftMotor !== lastLeftMotor || rightMotor !== lastRightMotor) {
    const message = `S${rightMotor},${leftMotor}`;
    sendWebSocketMessage(message);
    console.log(message);

    lastLeftMotor = leftMotor;
    lastRightMotor = rightMotor;

    setMotorSpeed(rightMotor, leftMotor);
    setSpeedGauge(rightMotor, leftMotor);
  }
}

// Loop update motor (sinkron throttle & steering)
setInterval(() => {
  sendMotorCommand(lastThrottle, lastSteering);
}, 50); // update tiap 100ms

// Update CONFIG ketika slider digeser
deadzoneSlider.addEventListener("input", () => {
  CONFIG.deadzone = parseInt(deadzoneSlider.value);
  deadzoneValue.textContent = CONFIG.deadzone;
});

throttleSlider.addEventListener("input", () => {
  CONFIG.throttleScale = parseFloat(throttleSlider.value);
  throttleValue.textContent = CONFIG.throttleScale.toFixed(1);
});

steeringSlider.addEventListener("input", () => {
  CONFIG.steeringScale = parseFloat(steeringSlider.value);
  steeringValue.textContent = CONFIG.steeringScale.toFixed(1);
});
