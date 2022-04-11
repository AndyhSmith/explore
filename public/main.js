// Set Up Canvas
const screenHeight = window.innerHeight;
const screenWidth = window.innerWidth;

if (window.innerWidth < 800) {
  document.getElementById("chat").style.width = "100%"
  document.getElementById("chat").style.height = "100%"
  document.getElementById("chat-toggle").style.width = "calc(100% - 20px)"
  document.getElementById("chat-toggle2").style.width = "100%"
  document.getElementById("form").style.width = "100%"
  document.getElementById("input").style.width = "calc(100% - 100px)"
}


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
let img = {
  1: document.getElementById('au-blue'),
  2: document.getElementById('au-brown'),
  3: document.getElementById('au-clay'),
  4: document.getElementById('au-dark'),
  5: document.getElementById('au-discord'),
  6: document.getElementById('au-green'),
  7: document.getElementById('au-lime'),
  8: document.getElementById('au-orange'),
  9: document.getElementById('au-peach'),
  10: document.getElementById('au-pink'),
  11: document.getElementById('au-red'),
  12: document.getElementById('au-sky'),
  13: document.getElementById('au-tan'),
  14: document.getElementById('au-white'),
  15: document.getElementById('au-yellow'),
}

let imgL = {
  1: document.getElementById('au-blue-l'),
  2: document.getElementById('au-brown-l'),
  3: document.getElementById('au-clay-l'),
  4: document.getElementById('au-dark-l'),
  5: document.getElementById('au-discord-l'),
  6: document.getElementById('au-green-l'),
  7: document.getElementById('au-lime-l'),
  8: document.getElementById('au-orange-l'),
  9: document.getElementById('au-peach-l'),
  10: document.getElementById('au-pink-l'),
  11: document.getElementById('au-red-l'),
  12: document.getElementById('au-sky-l'),
  13: document.getElementById('au-tan-l'),
  14: document.getElementById('au-white-l'),
  15: document.getElementById('au-yellow-l'),
}

let colors = {
  1: "132ED4",
  2: "72491E",
  3: "938877",
  4: "3F484E",
  5: "6B30BC",
  6: "10802D",
  7: "50EF3A",
  8: "EF7D0E",
  9: "E27060",
  10: "ED53B9",
  11: "C51111",
  12: "39FEDB",
  13: "F5E4A5",
  14: "D3E1ED",
  15: "F5F558",
}

let IMG_BACKGROUND = document.getElementById('background')


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
  img: Math.ceil(Math.random() * 14),
  dir: 0
};

let camera = {
  x: 0,
  y: 0,
}


const localData = {
  playerID: 0,
  targeting: false,
  RADAR_ACTIVATION_DISTANCE: 200,
  RADAR_DISTANCE: 100,
  xSpeed: 0,
  ySpeed: 0,
  tX: 0,
  tY: 0,
  colorToggle: true,
  tilesX: Math.floor(window.innerWidth / 300) + 2,
  tilesY: Math.floor(window.innerHeight / 300) + 2,
  gap: 512,
  gapy: 445,
}




function toggleColors() {
  localData.colorToggle = !localData.colorToggle
  if (localData.colorToggle) {
    document.getElementById("color-container").style.display = "none"
  } else {
    document.getElementById("color-container").style.display = "block"
  }
}

function selectColor(colorID) {
  document.getElementById("change-color").style.backgroundColor = "#" + colors[colorID]
  objects[localData.id].img = colorID
  socket.emit('entity update', objects[localData.id]);
}

let colorContent = ""
for (let i in colors) {
  colorContent += "<div class='au-color' style='background-color:#" + colors[i] + "' onclick='selectColor(" + i + ")'></div>"
  if (i % 3 == 0) {
    colorContent += "<br>"
  }
}
document.getElementById("color-container").innerHTML = colorContent

// objects[player.id] = player

function userClick(e) {
  console.log("New Target")
  localData.tX = e.x - camera.x;
  localData.tY = e.y - camera.y;

  let deltaX = (localData.tX) - (objects[socket.id].x)
  let deltaY = (localData.tY) - (objects[socket.id].y)
  let angle = Math.atan2(deltaX, deltaY)

  localData.xSpeed = Math.sin(angle) * 10;
  localData.ySpeed = Math.cos(angle) * 10;

  if (localData.xSpeed > 0) {
    objects[localData.id].dir = 0
  } else {
    objects[localData.id].dir = 1
  }

  localData.targeting = true;
  socket.emit('entity update', objects[socket.id]);
}

function showToggle() {
  document.getElementById("chat").style.display = "block"
  document.getElementById("chat-toggle").style.display = "none"
}

function hideToggle() {
  document.getElementById("chat").style.display = "none"
  document.getElementById("chat-toggle").style.display = "block"

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
    objects[localData.id].x += localData.xSpeed;
    objects[localData.id].y += localData.ySpeed;
    socket.emit('entity update', objects[localData.id]);
  }
    
  if (Math.abs(objects[localData.id].x- localData.tX) < 5 && Math.abs(objects[localData.id].y - localData.tY) < 5) {
    localData.xSpeed = 0;
    localData.ySpeed = 0;
  }

  camera.x = (window.innerWidth / 2) - objects[localData.id].x
  camera.y = (window.innerHeight / 2) - objects[localData.id].y
  
};

function drawEntity(entity) {
  // Draw Name
  ctx.font = '20px serif';
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(entity.name, entity.x + camera.x, entity.y - 43 + camera.y);


  if (entity.dir == 1) {
    ctx.drawImage(imgL[entity.img], entity.x - 30 + camera.x, entity.y + camera.y - 37, 60, 75);
  } else {
    ctx.drawImage(img[entity.img], entity.x - 30 + camera.x, entity.y + camera.y - 37, 60, 75);
  }
}

const drawObjects = () => {
  // Background
  ctx.fillStyle = "black"
  for (let i = -1; i < localData.tilesX; i++) {
    for (let j = -1; j < localData.tilesY; j++ ) {
      ctx.drawImage(IMG_BACKGROUND, i * localData.gap + (camera.x % localData.gap), j * localData.gapy + (camera.y % localData.gapy), localData.gap, localData.gapy);
      ctx.fillRect(i * localData.gap + (camera.x % localData.gap) , j * localData.gap + (camera.y % localData.gap), 5, 5);
      
    }
  }

  // Radar
  for (let i in objects) {
    if (objects[i].id != localData.id) {
      if (Math.abs(objects[i].x - objects[localData.id].x) > localData.RADAR_ACTIVATION_DISTANCE || 
            Math.abs(objects[i].y - objects[localData.id].y) > localData.RADAR_ACTIVATION_DISTANCE) {
        let deltaX = objects[i].x - objects[localData.id].x 
        let deltaY = objects[i].y - objects[localData.id].y 
        let angle = Math.atan2(deltaX, deltaY)


        let d = 100
        let pX = Math.sin(angle) * localData.RADAR_DISTANCE
        let pY = Math.cos(angle) * localData.RADAR_DISTANCE

        let pX2 = Math.sin(angle) * (localData.RADAR_DISTANCE + 20)
        let pY2= Math.cos(angle) * (localData.RADAR_DISTANCE + 20)


        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pX + objects[localData.id].x + camera.x, pY + objects[localData.id].y + camera.y);
        ctx.lineTo(pX2 + objects[localData.id].x + camera.x, pY2 + objects[localData.id].y + camera.y);
        ctx.stroke();
      }
    }
    
  }




  for (let i in objects) {
    drawEntity(objects[i])
  }
  drawEntity(objects[localData.id])
  

  // let startTime = new Date()
  // let endTime = new Date()
  // console.log(endTime - startTime)
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
    document.getElementById("color-selected-container").style.display = "block"
    document.getElementById("change-color").style.backgroundColor = "#" + colors[objects[localData.id].img]
    
    
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
  // objects[data.id] = data
  console.log(objects)
  objects = data
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