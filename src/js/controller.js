const manajer = new nipplejs.create({
  zone: document.getElementById("joystick-container"),
  mode: "static",
  position: { left: "50%", top: "65%" },
  color: "blue",
  size: 180,
  restOpacity: 0.5,
});

function calculate(data) {
  let angle = data.angle.degree;
  const distance = data.distance;
  angle = (angle + 360) % 360; // Normalisasi sudut antara 0-360 derajat

  const centerDeadZone = 0.15; // Zona mati di tengah joystick (15% dari jarak maksimum)
  const maxDistance = 90; // Jarak maksimum joystick
  const angelTolerant = 15; // Toleransi sudut dalam derajat

  const minDistance = maxDistance * centerDeadZone;
  const range = maxDistance - minDistance;
  const speed =
    Math.min(Math.max((distance - minDistance) / range, 0), 1) * 100;
  let direction = "";
  let leftSpeed = 0;
  let rightSpeed = 0;

  if (distance < maxDistance * centerDeadZone) {
    leftSpeed = 0;
    rightSpeed = 0;
    direction = "Standby";
    return { leftSpeed, rightSpeed, direction };
  }

  if (angle <= angelTolerant * 2 || angle > 360 - angelTolerant * 2) {
    leftSpeed = speed;
    rightSpeed = speed / 4;
    direction = "Kanan";
  }
  if (angle <= 45 + angelTolerant && angle >= 45 - angelTolerant) {
    leftSpeed = speed;
    rightSpeed = speed / 2;
    direction = "Depan Kanan";
  }
  if (angle > 90 - angelTolerant * 2 && angle <= 90 + angelTolerant * 2) {
    leftSpeed = speed;
    rightSpeed = speed;
    direction = "Depan";
  }
  if (angle > 90 + angelTolerant * 2 && angle <= 180 - angelTolerant * 2) {
    leftSpeed = speed / 2;
    rightSpeed = speed;
    direction = "Depan Kiri";
  }
  if (angle > 180 - angelTolerant * 2 && angle <= 180 + angelTolerant * 2) {
    leftSpeed = speed / 4;
    rightSpeed = speed;
    direction = "Kiri";
  }
  if (angle > 180 + angelTolerant * 2 && angle <= 270 - angelTolerant * 2) {
    leftSpeed = -speed / 2;
    rightSpeed = -speed;
    direction = "Belakang Kiri";
  }
  if (angle > 270 - angelTolerant * 2 && angle <= 270 + angelTolerant * 2) {
    leftSpeed = -speed;
    rightSpeed = -speed;
    direction = "Belakang";
  }
  if (angle > 270 + angelTolerant * 2 && angle <= 360 - angelTolerant * 2) {
    leftSpeed = -speed;
    rightSpeed = -speed / 2;
    direction = "Belakang Kanan";
  }

  return { leftSpeed, rightSpeed, direction };
}

manajer.on("move", (evt, data) => {
  if (data) {
    const { leftSpeed, rightSpeed, direction } = calculate(data);
    console.log(
      "Left Speed:",
      leftSpeed,
      "Right Speed:",
      rightSpeed,
      "Direction:",
      direction
    );
  }
});
