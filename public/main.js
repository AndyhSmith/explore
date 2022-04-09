// Set Up Canvas
const screenHeight = window.innerHeight;
const screenWidth = window.innerWidth;

const leftCode = 37;
const rightCode = 39;
const upCode = 38;
const downCode = 40;

const canvas = document.getElementById("my-canvas");
const ctx = canvas.getContext("2d");
canvas.height = screenHeight;
canvas.width = screenWidth;

const image = document.getElementById('source');

const keyState = {};
keyState[leftCode] = false;
keyState[rightCode] = false;
keyState[upCode] = false;
keyState[downCode] = false;


objects = {}

const player = {
  id: 0,
  x: 0,
  y: 0,
};

const playerData = {
  targeting: false,
  tX: 0,
  tY: 0,
  xSpeed: 0,
  ySpeed: 0,

}

// objects[player.id] = player

function userClick(e) {
  playerData.tX = e.x;
  playerData.tY = e.y;
  playerData.targeting = true;

  let deltaX = playerData.tX - player.x
  let deltaY = playerData.tY - player.y
  let angle = Math.atan2(deltaX, deltaY)

  playerData.xSpeed = Math.sin(angle) * 10;
  playerData.ySpeed = Math.cos(angle) * 10;
}

const updatePaddle = () => {
  if (keyState[leftCode]) {
    console.log(objects)
    player.x -= 10;
    socket.emit('entity update', player);
  }
  if (keyState[rightCode]) {
    player.x += 10;
    socket.emit('entity update', player);
  }
  if (keyState[upCode]) {
    player.y -= 10;
    socket.emit('entity update', player);
  }
  if (keyState[downCode]) {
    player.y += 10;
    socket.emit('entity update', player);
  }

  if (playerData.targeting) {


    player.x += playerData.xSpeed;
    player.y += playerData.ySpeed;

    socket.emit('entity update', player);
    if (Math.abs(player.x - playerData.tX) < 20 && Math.abs(player.y - playerData.tY) < 20) {
      playerData.targeting = false
    }
  }
  
};

const drawObjects = () => {
  for (let i in objects) {
    ctx.drawImage(image, objects[i].x, objects[i].y, 100, 100);
  }
  
  // ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
};

document.addEventListener("keydown", function (e) {
  keyState[e.keyCode] = true;
});

document.addEventListener("keyup", function (e) {
  keyState[e.keyCode] = false;
});

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawObjects();
  updatePaddle();
  requestAnimationFrame(draw);
};

draw();


// Sockets
var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');


socket.emit('entity create', player);

// form.addEventListener('submit', function(e) {
//   e.preventDefault();
//   if (input.value) {
//     socket.emit('chat message', input.value);
//     input.value = '';
//   }
// });

socket.on('chat message', function(msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('entity update', function(data) {
  objects[data.id] = data
});

socket.on('entity create', function(data) {
  objects[data.id] = data
});

socket.on('entity delete', function(id) {
  delete objects[id]
});