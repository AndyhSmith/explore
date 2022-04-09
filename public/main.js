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
  xSpeed: 0,
  ySpeed: 0,
  tX: 0,
  tY: 0,
};



// objects[player.id] = player

function userClick(e) {
  console.log("New Target")
  objects[socket.id].tX = e.x;
  objects[socket.id].tY = e.y;

  let deltaX = objects[socket.id].tX - objects[socket.id].x
  let deltaY = objects[socket.id].tY - objects[socket.id].y
  let angle = Math.atan2(deltaX, deltaY)

  objects[socket.id].xSpeed = Math.sin(angle) * 10;
  objects[socket.id].ySpeed = Math.cos(angle) * 10;
  socket.emit('entity update', objects[socket.id]);
}

const update = () => {
  // if (keyState[leftCode]) {
  //   console.log(objects)
  //   player.x -= 10;
  //   socket.emit('entity update', player);
  // }
  // if (keyState[rightCode]) {
  //   player.x += 10;
  //   socket.emit('entity update', player);
  // }
  // if (keyState[upCode]) {
  //   player.y -= 10;
  //   socket.emit('entity update', player);
  // }
  // if (keyState[downCode]) {
  //   player.y += 10;
  //   socket.emit('entity update', player);
  // }

  // Update all player locations
  for (let i in objects) {
    objects[i].x += objects[i].xSpeed;
    objects[i].y += objects[i].ySpeed;
    if (Math.abs(objects[i].x - objects[i].tX) < 20 && Math.abs(objects[i].y - objects[i].tY) < 20) {
      objects[i].xSpeed = 0;
      objects[i].ySpeed = 0;
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
  update();
  requestAnimationFrame(draw);
  
};




// Sockets
var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');




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
  if (data.id != socket.id) {
    console.log("Not happending")
    objects[data.id] = data
  }
});

socket.on('entity create', function(data) {
  objects[data.id] = data
});

socket.on('entity delete', function(id) {
  delete objects[id]
});

socket.on('connect', () => {
  console.log(socket.id)
  player.id = socket.id
  objects[player.id] = player
  socket.emit('entity create', player);
  draw()
});
// draw();