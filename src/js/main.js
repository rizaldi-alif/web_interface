let websocket;
let isConnected = false;
let setMode = 1;

const obsDistContainer = document.getElementById("obs-dist");
const lmsContainer = document.getElementById("left-motor-speed");
const rmsContainer = document.getElementById("right-motor-speed");
const dirContainer = document.getElementById("car-direction");
const joystickContainer = document.getElementById("joystick-container");
const rightJoystickContainer = document.getElementById(
  "right-joystick-container"
);
const leftJoystickContainer = document.getElementById(
  "left-joystick-container"
);
const leftGauge = document.getElementById("left-gauge");
const rightGauge = document.getElementById("right-gauge");
const ssidName = document.getElementById("ssid-name");
const websocketStatus = document.getElementById("websocket-status");
const modeButton = document.getElementById("mode-button");
const selectedModeText = document.getElementById("selected-mode");
const dropdownButton = document.getElementById("dropdownButton");
const dropdownMenu = document.getElementById("dropdownMenu");
const selectedMode = document.getElementById("selected-mode");
const toast = document.getElementById("toast");
const deadzoneSlider = document.getElementById("deadzone");
const throttleSlider = document.getElementById("throttleScale");
const steeringSlider = document.getElementById("steeringScale");
const deadzoneValue = document.getElementById("deadzone-value");
const throttleValue = document.getElementById("throttle-value");
const steeringValue = document.getElementById("steering-value");

window.addEventListener("load", () => {
  initWebSocket();
  setSelectedMode("manual control");
});

window.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length > 1) {
      e.preventDefault(); // Prevent multi-touch
    }
  },
  false
);

window.addEventListener("beforeunload", () => {
  if (websocket) {
    websocket.close();
  }
});

function initWebSocket() {
  websocket = new WebSocket(`ws://${window.location.hostname}/ws`);
  websocket.onopen = onOpen;
  websocket.onclose = onClose;
  websocket.onmessage = onMessage;
}

function onOpen(event) {
  console.log("Connected to WebSocket server");
  isConnected = true;
  setWs(true);
}

function onClose(event) {
  console.log("Disconnected from WebSocket server");
  isConnected = false;
  setWs(false);
  // setTimeout(initWebSocket, 5000); // Try to reconnect every 5 seconds
}

function onMessage(event) {
  try {
    const message = JSON.parse(event.data);
    if (message.speed !== undefined) {
      const speed = message.speed.split(",");
      setSpeedGauge(speed[0], speed[1]);
      setMotorSpeed(speed[1], speed[0]);
    }
    if (message.distance !== undefined) setDistance(message.distance);
    if (message.ssid !== undefined) setWiFi(message.ssid);
  } catch (e) {
    console.error("Error parsing message:", e);
  }
}

function sendWebSocketMessage(message) {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(message);
  }
}

function setWs(status) {
  if (status) {
    websocketStatus.innerText = "Connected";
  } else {
    websocketStatus.innerText = "Disconnected";
    websocketStatus.classList.add("text-red-500");
  }
}

function setWiFi(ssid) {
  if (!ssid) ssid = "Not Connected";
  ssidName.innerText = ssid;
}

function setDistance(dist) {
  if (!dist) dist = 0;
  obsDistContainer.innerText = dist + " cm";
}

function setMotorSpeed(rightMotors, leftMotors) {
  if (!leftMotors) leftMotors = 0;
  if (!rightMotors) rightMotors = 0;

  lmsContainer.innerText = Math.abs(leftMotors);
  rmsContainer.innerText = Math.abs(rightMotors);
}

function setSpeedGauge(rightMotor, leftMotor) {
  rightMotor = Math.abs(rightMotor);
  leftMotor = Math.abs(leftMotor);

  if (rightMotor > 80) {
    rightGauge.style.backgroundColor = "red";
  } else {
    rightGauge.style.backgroundColor = "#155dfc";
  }
  if (leftMotor > 80) {
    leftGauge.style.backgroundColor = "red";
  } else {
    leftGauge.style.backgroundColor = "#155dfc";
  }

  rightGauge.style.width = rightMotor + "%";
  leftGauge.style.width = leftMotor + "%";
}

function showJoyStick(mode) {
  if (mode != 1) {
    joystickContainer.classList.add("hidden");
  } else {
    joystickContainer.classList.remove("hidden");
  }
}
