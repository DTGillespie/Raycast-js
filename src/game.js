const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1]
];

const player = {
  x: 3.5,
  y: 3.5,
  angle: 0,
  fov: Math.PI / 4
}

// Stats
let lastFrameTime = Date.now();
let frameCount = 0;
let fps = 0;
let lastFpsUpdate = Date.now();

// Map
const minimapScale = 25;
const minimapSize = { width: map[0].length * minimapScale, height: map.length * minimapScale };
const minimapPosition = { x: canvas.width - minimapSize.width - 10, y: 10 };
let debugRays = true;

function raycast(angle) {
  const stepSize = 0.01;
  let distance = 0;

  while(true) {
    distance += stepSize;
    let testX = Math.floor(player.x + Math.cos(angle) * distance);
    let testY = Math.floor(player.y + Math.sin(angle) * distance);

    if (map[testY][testX] === 1) {
      break;
    };
  };

  return distance;
}

function render() {
  const frameStartTime = Date.now();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < canvas.width; i++) {
    const rayAngle = player.angle + (i / canvas.width) * player.fov - (player.fov / 2);
    const distance = raycast(rayAngle);
    const wallHeight = canvas.height / (distance * Math.cos(rayAngle - player.angle));

    const brightness = 255 * (1 - Math.min(1, distance / 12));
    const color = `rgb(${brightness}, ${brightness}, ${brightness})`;

    ctx.fillStyle = color;
    ctx.fillRect(i, canvas.height / 2 - wallHeight / 2, 1, wallHeight);
  };

  const renderTime = Date.now() - frameStartTime;

  ctx.fillStyle = 'lime';
  ctx.font = '16px Courier New';
  ctx.fillText(`FPS: ${fps}`, 10, 20);
  ctx.fillText(`Draw: ${renderTime}ms`, 10, 40);

  frameCount++;
  if (Date.now() - lastFpsUpdate >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastFpsUpdate = Date.now();
  };
}

function gameLoop() {
  render();
  drawMinimap();
  if (debugRays) drawRays();

  requestAnimationFrame(gameLoop);
}

function checkCollision(x, y) {
  if (x < 0 || x >= map[0].length || y < 0 || y >= map.length) return true;
  return map[Math.floor(y)][Math.floor(x)] === 1;
}

function drawMinimap() {
  ctx.fillStyle = 'black';
  ctx.fillRect(minimapPosition.x, minimapPosition.y, minimapSize.width, minimapSize.height);

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 1) {
        ctx.fillStyle = 'white';
      } else {
        ctx.fillStyle = 'grey';
      };
      ctx.fillRect(minimapPosition.x + x * minimapScale, minimapPosition.y + y * minimapScale, minimapScale, minimapScale);
    }
  }

  ctx.fillStyle = 'blue';
  ctx.fillRect(minimapPosition.x + player.x * minimapScale - 2, minimapPosition.y + player.y * minimapScale - 2, 4, 4);
}

function drawRays() {
  for (let i = 0; i < canvas.width; i += 10) {
    const rayAngle = player.angle + (i / canvas.width) * player.fov - (player.fov / 2);
    const distance = raycast(rayAngle);
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.moveTo(minimapPosition.x + player.x * minimapScale, minimapPosition.y + player.y * minimapScale);
    ctx.lineTo(
      minimapPosition.x + (player.x + Math.cos(rayAngle) * distance) * minimapScale,
      minimapPosition.y + (player.y + Math.sin(rayAngle) * distance) * minimapScale
    );
    ctx.stroke();
  }
}

window.addEventListener('keydown', (event) => {
  const moveSpeed = 0.1;
  const rotateSpeed = 0.05; // Radians

  switch (event.key) {

    case 'w':
      newX = player.x + Math.cos(player.angle) * moveSpeed;
      newY = player.y + Math.sin(player.angle) * moveSpeed;
      if (!checkCollision(newX, newY)) {
        player.x = newX;
        player.y = newY;
      }
    break;
    
    case 's':
      newX = player.x - Math.cos(player.angle) * moveSpeed;
      newY = player.y - Math.sin(player.angle) * moveSpeed;
      if (!checkCollision(newX, newY)) {
        player.x = newX;
        player.y = newY;
      }
    break;
    
    case 'a':
      player.angle -= rotateSpeed;
    break;

    case 'd':
      player.angle += rotateSpeed;
    break;
  };
});

gameLoop();