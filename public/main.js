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

const auRed = document.getElementById('au-red');
const auOrange = document.getElementById('au-orange');

const keyState = {};
keyState[leftCode] = false;
keyState[rightCode] = false;
keyState[upCode] = false;
keyState[downCode] = false;


objects = {}

const player = {
  id: 0,
  name: "",
  x: screenWidth / 2,
  y: screenHeight / 2,
  xSpeed: 0,
  ySpeed: 0,
  tX: 0,
  tY: 0,
};



const localData = {
  playerID: 0,
  targeting: false,
}



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
  localData.targeting = true;
  socket.emit('entity update', objects[socket.id]);
}

function showToggle() {
  document.getElementById("chat").style.display = "block"
  document.getElementById("chat-toggle").style.display = "none"
}

function hideToggle() {
  document.getElementById("chat").style.display = "none"

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

  if (localData.targeting) {
    objects[localData.id].x += objects[localData.id].xSpeed;
    objects[localData.id].y += objects[localData.id].ySpeed;
    socket.emit('entity update', objects[localData.id]);
  }
    
    
  if (Math.abs(objects[localData.id].x - objects[localData.id].tX) < 5 && Math.abs(objects[localData.id].y - objects[localData.id].tY) < 5) {
    objects[localData.id].xSpeed = 0;
    objects[localData.id].ySpeed = 0;
  }

  
};

const drawObjects = () => {
  for (let i in objects) {
    ctx.font = '20px serif';
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(objects[i].name, objects[i].x , objects[i].y - 50);
    if (objects[i].id == localData.id) {
      ctx.drawImage(auOrange, objects[i].x - 50, objects[i].y - 50, 100, 100);
    } else {
      ctx.drawImage(auRed, objects[i].x - 50, objects[i].y - 50, 100, 100);
    }
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

var nameForm = document.getElementById('name-form');



form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', objects[localData.id].name + ": " + input.value);
    input.value = '';
  }
});

nameForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (document.getElementById('name-input').value) {
    document.getElementById("name-container").style.display = "none";
    document.getElementById("chat-toggle").style.display = "block";
    console.log(objects[localData.id])
    objects[localData.id].name = document.getElementById('name-input').value
    socket.emit('entity create', objects[localData.id]);
  
    
    // socket.emit('entity update', objects[localData.id]);

    draw()
  }
});

socket.on('chat message', function(msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  document.getElementById('message-container').scrollTo(0, document.body.scrollHeight);
});

socket.on('entity update', function(data) {
  if (data.id != localData.id) {
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
  localData.id = socket.id
  player.id = localData.id
  objects[player.id] = player
  
});
// draw();