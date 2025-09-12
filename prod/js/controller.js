// function sendMessage(message) {
//   if (websocket && websocket.readyState === WebSocket.OPEN) {
//     websocket.send(message);
//   }
// }

// const manager = new nipplejs.create({
//   zone: document.getElementById("joystick-container"),
//   mode: "static",
//   position: { left: "50%", top: "65%" },
//   color: "blue",
//   size: 180,
//   restOpacity: 0.5,
// });

// function calculate(data) {
//   let angle = data.angle.degree;
//   const distance = data.distance;
//   angle = (angle + 360) % 360; // Normalisasi sudut antara 0-360 derajat

//   const centerDeadZone = 0.15; // Zona mati di tengah joystick (15% dari jarak maksimum)
//   const maxDistance = 90; // Jarak maksimum joystick
//   const angelTolerant = 15; // Toleransi sudut dalam derajat

//   const minDistance = maxDistance * centerDeadZone;
//   const range = maxDistance - minDistance;
//   const speed =
//     // Math.min(Math.max((distance - minDistance) / range, 0), 1) * 100;
//     (Math.min(distance, maxDistance) / maxDistance) * 100;
//   let direction = "";
//   let leftSpeed = 0;
//   let rightSpeed = 0;

//   if (distance < maxDistance * centerDeadZone) {
//     leftSpeed = 0;
//     rightSpeed = 0;
//     direction = "Standby";
//     return { leftSpeed, rightSpeed, direction };
//   }

//   if (angle <= angelTolerant * 2 || angle > 360 - angelTolerant * 2) {
//     leftSpeed = speed;
//     rightSpeed = speed / 4;
//     direction = "Kanan";
//   }
//   if (angle <= 45 + angelTolerant && angle >= 45 - angelTolerant) {
//     leftSpeed = speed;
//     rightSpeed = speed / 2;
//     direction = "Depan Kanan";
//   }
//   if (angle > 90 - angelTolerant * 2 && angle <= 90 + angelTolerant * 2) {
//     leftSpeed = speed;
//     rightSpeed = speed;
//     direction = "Depan";
//   }
//   if (angle > 90 + angelTolerant * 2 && angle <= 180 - angelTolerant * 2) {
//     leftSpeed = speed / 2;
//     rightSpeed = speed;
//     direction = "Depan Kiri";
//   }
//   if (angle > 180 - angelTolerant * 2 && angle <= 180 + angelTolerant * 2) {
//     leftSpeed = speed / 4;
//     rightSpeed = speed;
//     direction = "Kiri";
//   }
//   if (angle > 180 + angelTolerant * 2 && angle <= 270 - angelTolerant * 2) {
//     leftSpeed = -speed / 2;
//     rightSpeed = -speed;
//     direction = "Belakang Kiri";
//   }
//   if (angle > 270 - angelTolerant * 2 && angle <= 270 + angelTolerant * 2) {
//     leftSpeed = -speed;
//     rightSpeed = -speed;
//     direction = "Belakang";
//   }
//   if (angle > 270 + angelTolerant * 2 && angle <= 360 - angelTolerant * 2) {
//     leftSpeed = -speed;
//     rightSpeed = -speed / 2;
//     direction = "Belakang Kanan";
//   }

//   return { leftSpeed, rightSpeed, direction };
// }

// manager.on("move", (evt, data) => {
//   if (data) {
//     const { leftSpeed, rightSpeed, direction } = calculate(data);
//     console.log(
//       `Left Speed: ${Math.round(leftSpeed)}, Right Speed: ${rightSpeed.toFixed(
//         0
//       )}`
//     );
//     document.getElementById("car-direction").innerText = direction;
//     sendMessage(`S${Math.round(leftSpeed)},${Math.round(rightSpeed)}`);
//   }
// });

// manager.on("end", () => {
//   document.getElementById("car-direction").innerText = "Standby";
//   sendMessage("S0,0");
// });

function sendWebSocketMessage(message) {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(message);
  }
}

const manager = nipplejs.create({
  zone: joystickContainer,
  mode: "static",
  position: { left: "50%", top: "75%" },
  color: "oklch(62.3% 0.214 259.815)",
  size: 180,
  restOpacity: 0.5,
});

const maxDistance = 90;
const centerDeadzone = 25;
const lateralDeadzone = 10;
const minDistance = (centerDeadzone / 100) * maxDistance;
const range = maxDistance - minDistance;

let lastLeftMotor = 0;
let lastRightMotor = 0;

function calculateMotorSpeeds(distance, angle) {
  angle = (angle + 360) % 360;

  if (distance < (centerDeadzone / 100) * maxDistance) {
    return { rightMotor: 0, leftMotor: 0 };
  }

  // const speed = (Math.min(distance, maxDistance) / maxDistance) * 100;
  const speed =
    Math.min(Math.max((distance - minDistance) / range, 0), 1) * 100;
  let rightMotor = 0;
  let leftMotor = 0;

  const edgeDeadzone = 5;
  const horizontalDeadzone = 10;

  if (angle >= 90 - horizontalDeadzone && angle <= 90 + horizontalDeadzone) {
    leftMotor = speed;
    rightMotor = speed;
  } else if (
    angle >= 270 - horizontalDeadzone &&
    angle <= 270 + horizontalDeadzone
  ) {
    leftMotor = -speed;
    rightMotor = -speed;
  } else if (angle >= edgeDeadzone && angle <= 180 - edgeDeadzone) {
    const turnFactor = Math.abs((angle - 90) / 90);
    if (angle <= 90) {
      rightMotor = speed * (1 - turnFactor);
      leftMotor = speed;
    } else {
      leftMotor = speed * (1 - turnFactor);
      rightMotor = speed;
    }
  } else if (angle >= 180 + edgeDeadzone && angle <= 360 - edgeDeadzone) {
    const turnFactor = Math.abs((angle - 270) / 90);
    if (angle <= 270) {
      leftMotor = -speed * (1 - turnFactor);
      rightMotor = -speed;
    } else {
      leftMotor = -speed;
      rightMotor = -speed * (1 - turnFactor);
    }
  }

  rightMotor = Math.max(-100, Math.min(100, Math.round(rightMotor)));
  leftMotor = Math.max(-100, Math.min(100, Math.round(leftMotor)));

  return { rightMotor, leftMotor };
}

manager.on("move", (evt, data) => {
  if (
    data &&
    data.angle &&
    data.angle.degree !== undefined &&
    data.distance !== undefined
  ) {
    const distance = data.distance;
    const angle = data.angle.degree;

    const { rightMotor, leftMotor } = calculateMotorSpeeds(distance, angle);

    const message = `S${rightMotor},${leftMotor}`;

    sendWebSocketMessage(message);
    setMotorSpeed(leftMotor, rightMotor);
    setSpeedGauge(rightMotor, leftMotor);
    setDirection(angle);
  }
});

manager.on("end", () => {
  const message = `S0,0`;
  sendWebSocketMessage(message);
  setMotorSpeed(0, 0);
  setSpeedGauge(0, 0);
  setDirection(0);
});
