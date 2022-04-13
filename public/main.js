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
  x: Math.random() * 400 - 200,
  y: Math.random() * 400 - 200,
  img: Math.ceil(Math.random() * 14),
  dir: 0,
  width: 60,
  height: 75,
  tag: 0,
};

let camera = {
  x: 0,
  y: 0,
}

let gameData = {
  currentGame: -1,
  target: {},
  cageSize: 1000,
  collectCooldown: true,
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
  gameToggle: true,
  tilesX: Math.floor(window.innerWidth / 300) + 2,
  tilesY: Math.floor(window.innerHeight / 300) + 2,
  gap: 512,
  gapy: 445,
  newMessages: 0,
  playerSpeed: 5,
  canInfect: false,
}

let votes = {
  0: [], // TargetChaser
  1: [], // Zombies
}

function placeVote(type) {
  socket.emit('vote', type);
}

function countProperties(obj) {
  var count = 0;

  for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
          ++count;
  }

  return count;
}

const checkCollision = (rect1, rect2) => {
  let colliding = false;
  if (rect1.x + rect1.width > rect2.x && rect1.x < rect2.x + rect2.width){
    if(rect1.y + rect1.height > rect2.y && rect1.y < rect2.y + rect2.height ){
      colliding = true;
    }
  }
  return colliding;
}



function updateScoreboard() {
  let sortable = [];
  for (var property in objects) {
      sortable.push([property, objects[property].tag]);
  }

  sortable.sort(function(a, b) {
    return b[1] - a[1];
  });

  contents = ""
  for (let i in sortable) {
    contents += "<span style='color:#" + colors[objects[sortable[i][0]].img] + ";'>" + sortable[i][1] + " : " + objects[sortable[i][0]].name + "</span><br>"
  }
  document.getElementById("scoreboard-contents").innerHTML = contents
}


function toggleColors() {
  localData.colorToggle = !localData.colorToggle
  if (localData.colorToggle) {
    document.getElementById("color-container").style.display = "none"
  } else {
    document.getElementById("color-container").style.display = "block"
  }
}

function toggleGameMenu() {
  localData.gameToggle = !localData.gameToggle
  if (localData.gameToggle) {
    document.getElementById("game-options").style.display = "none"
  } else {
    document.getElementById("game-options").style.display = "block"
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
  localData.tX = e.x - camera.x - 30;
  localData.tY = e.y - camera.y - 36;

  let deltaX = (localData.tX) - (objects[socket.id].x)
  let deltaY = (localData.tY) - (objects[socket.id].y)
  let angle = Math.atan2(deltaX, deltaY)

  localData.xSpeed = Math.sin(angle) * localData.playerSpeed;
  localData.ySpeed = Math.cos(angle) * localData.playerSpeed;

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
  localData.newMessages = 0;
}

function hideToggle() {
  document.getElementById("chat").style.display = "none"
  document.getElementById("chat-toggle").style.display = "block"
  localData.newMessages = 0;
  document.getElementById("chat-toggle").innerHTML = "▲ Chat"
}

const update = () => {
  if (localData.targeting) {
    if (gameData.currentGame != 1) {
      objects[localData.id].x += localData.xSpeed;
      objects[localData.id].y += localData.ySpeed;
    } else { // zombies border
      if (objects[localData.id].x + 60 < gameData.cageSize && localData.xSpeed > 0) {
        objects[localData.id].x += localData.xSpeed;
      }
      else if (objects[localData.id].x > -gameData.cageSize && localData.xSpeed < 0) {
        objects[localData.id].x += localData.xSpeed;
      } else {
        localData.targeting = false;
      }

      if (objects[localData.id].y + 60 < gameData.cageSize && localData.ySpeed > 0) {
        objects[localData.id].y += localData.ySpeed;
      }
      else if (objects[localData.id].y > -gameData.cageSize && localData.ySpeed < 0) {
        objects[localData.id].y += localData.ySpeed;
      } else {
        localData.targeting = false;
      }
    }
    socket.emit('entity update', objects[localData.id]);
  }
    
  if (Math.abs(objects[localData.id].x- localData.tX) < 5 && Math.abs(objects[localData.id].y - localData.tY) < 5) {
    localData.xSpeed = 0;
    localData.ySpeed = 0;
    localData.targeting = false
  }

  camera.x = (window.innerWidth / 2) - objects[localData.id].x - 30
  camera.y = (window.innerHeight / 2) - objects[localData.id].y - 36
  
};

function resetCollectCooldown() {
  gameData.collectCooldown = true;
}

function drawEntity(entity) {
  // Draw Name
  ctx.font = '20px serif';
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(entity.name, entity.x + camera.x + 30, entity.y+ camera.y - 7);


  if (entity.dir == 1) {
    ctx.drawImage(imgL[entity.img], entity.x + camera.x, entity.y + camera.y, 60, 75);
  } else {
    ctx.drawImage(img[entity.img], entity.x + camera.x, entity.y + camera.y, 60, 75);
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
      if (Math.abs(objects[i].x + 30 - (objects[localData.id].x + 30)) > localData.RADAR_ACTIVATION_DISTANCE || 
            Math.abs(objects[i].y + 36 - (objects[localData.id].y + 36)) > localData.RADAR_ACTIVATION_DISTANCE) {
        let deltaX = objects[i].x + 30 - (objects[localData.id].x + 30)
        let deltaY = objects[i].y + 36 - (objects[localData.id].y + 36)
        let angle = Math.atan2(deltaX, deltaY)


        let d = 100
        let pX = Math.sin(angle) * localData.RADAR_DISTANCE
        let pY = Math.cos(angle) * localData.RADAR_DISTANCE

        let pX2 = Math.sin(angle) * (localData.RADAR_DISTANCE + 20)
        let pY2= Math.cos(angle) * (localData.RADAR_DISTANCE + 20)


        ctx.lineWidth = 5;
        ctx.strokeStyle = "#" + colors[objects[i].img];
        ctx.beginPath();
        ctx.moveTo(pX + objects[localData.id].x + 30 + camera.x, pY + objects[localData.id].y + 36 + camera.y);
        ctx.lineTo(pX2 + objects[localData.id].x + 30 + camera.x, pY2 + objects[localData.id].y + 36 + camera.y);
        ctx.stroke();
      }
    }
    
  }

  // Draw Game Data
  if (gameData.currentGame != -1) {
    if (gameData.currentGame == 0) { // Target Chase
      // Draw Target
      ctx.fillStyle = "#F00";
      ctx.fillRect(gameData.target.x + camera.x, gameData.target.y + camera.y, gameData.target.width, gameData.target.height);
      ctx.fillStyle = "#FFF";
      ctx.fillRect(gameData.target.x  + camera.x + (gameData.target.width * .17), gameData.target.y + camera.y + (gameData.target.height * .17), gameData.target.width * .66, gameData.target.height * .66);
      ctx.fillStyle = "#F00";
      ctx.fillRect(gameData.target.x + camera.x + (gameData.target.width * .33), gameData.target.y + camera.y + (gameData.target.height * .33), gameData.target.width * .33, gameData.target.height * .33);

      if (Math.abs(gameData.target.x + (gameData.target.width / 2) - (objects[localData.id].x + 30)) > localData.RADAR_ACTIVATION_DISTANCE + 100|| 
           Math.abs(gameData.target.y + (gameData.target.height / 2) - (objects[localData.id].y + 36)) > localData.RADAR_ACTIVATION_DISTANCE + 100) {
        // Draw Guide Pointer
        let deltaX = gameData.target.x + (gameData.target.width / 2) - (objects[localData.id].x + 30)
        let deltaY = gameData.target.y + (gameData.target.height / 2)  - (objects[localData.id].y + 36)
        let angle = Math.atan2(deltaX, deltaY)

        let d = 100
        let pX = Math.sin(angle) * (localData.RADAR_DISTANCE + 30)
        let pY = Math.cos(angle) * (localData.RADAR_DISTANCE + 30)

        let pX2 = Math.sin(angle) * (localData.RADAR_DISTANCE + 20 + 30)
        let pY2= Math.cos(angle) * (localData.RADAR_DISTANCE + 20 + 30)
      

        ctx.lineWidth = 15;
        ctx.strokeStyle = "#F00";
        ctx.beginPath();
        ctx.moveTo(pX + objects[localData.id].x + 30 + camera.x, pY + objects[localData.id].y + 36 + camera.y);
        ctx.lineTo(pX2 + objects[localData.id].x + 30 + camera.x, pY2 + objects[localData.id].y + 36 + camera.y);
        ctx.stroke();

        ctx.lineWidth = 10;
        ctx.strokeStyle = "#FFF";
        ctx.beginPath();
        ctx.moveTo(pX + objects[localData.id].x + 30 + camera.x, pY + objects[localData.id].y + 36 + camera.y);
        ctx.lineTo(pX2 + objects[localData.id].x + 30 + camera.x, pY2 + objects[localData.id].y + 36 + camera.y);
        ctx.stroke();

        ctx.lineWidth = 5;
        ctx.strokeStyle = "#F00";
        ctx.beginPath();
        ctx.moveTo(pX + objects[localData.id].x + 30 + camera.x, pY + objects[localData.id].y + 36 + camera.y);
        ctx.lineTo(pX2 + objects[localData.id].x + 30 + camera.x, pY2 + objects[localData.id].y + 36 + camera.y);
        ctx.stroke();
      }

      if (checkCollision(gameData.target, objects[localData.id]) && gameData.collectCooldown) {
        objects[localData.id].tag += 1;
        socket.emit('collect target', objects[localData.id]);
        updateScoreboard()
        gameData.collectCooldown = false;
        setTimeout(function() { resetCollectCooldown(); }, 1000);
      }
    }
    if (gameData.currentGame == 1) { // zombies
      if (objects[localData.id].img == 11 && localData.canInfect) { // if zombie and not on start screen
        for (let property in objects) { // loop through oponents
          if (objects[property].img != 11 && property != localData.id) { // if oponent not self and not zombie
            if (checkCollision(objects[localData.id], objects[property])) { // Check Collision
              objects[property].img = 11
              objects[property].tag = "Zombie"
              socket.emit('entity update', objects[property]);
              updateScoreboard()
            }
          }
        }
      }

      // Draw borders
      ctx.lineWidth = 15;
      ctx.strokeStyle = "#F00";

      ctx.beginPath();
      ctx.moveTo(-gameData.cageSize + camera.x, -gameData.cageSize + camera.y);
      ctx.lineTo(gameData.cageSize + camera.x, -gameData.cageSize + camera.y);
      ctx.lineTo(gameData.cageSize + camera.x, gameData.cageSize + camera.y);
      ctx.lineTo(-gameData.cageSize + camera.x, gameData.cageSize + camera.y);
      ctx.lineTo(-gameData.cageSize + camera.x, -gameData.cageSize + camera.y);
      ctx.lineTo(gameData.cageSize + camera.x, -gameData.cageSize + camera.y);
      ctx.stroke();

    }
  }


  // Draw players
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
    document.getElementById("game-selector").style.display = "block"
    

    // Check if game is running
    socket.emit('get game state');
   

    // Start Game Loop
    draw()
  }
});

socket.on('update game state', function(gameState) {
  console.log("Getting Game Data")
  gameData.currentGame = gameState
  if (gameData.currentGame == 1) {
    objects[localData.id].img = 11
    objects[localData.id].tag = "Zombie"
    socket.emit('entity update', objects[localData.id]);
  }
});

socket.on('chat message', function(msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  document.getElementById('message-container').scrollTo(0, document.body.scrollHeight);
  localData.newMessages += 1
  document.getElementById("chat-toggle").innerHTML = "▲ Chat (" + localData.newMessages + " Unread)"
});

socket.on('entity update', function(data) {

  if (data.id != localData.id) {
    objects[data.id] = data
  } 
  
  if (gameData.currentGame == 1 && objects[localData.id].img == 7 && data.img == 11) {   // Convert to zombie
    objects[data.id].img = data.img
    updateScoreboard()

    // check if game over
    socket.emit('check game over', localData.id);
  } 
  

});

function updateEntityCount() {
  let playersOnline = countProperties(objects)
  document.getElementById("players-online").innerHTML = playersOnline
  let minNumberOfVotes = Math.ceil(playersOnline / 2)
  if (minNumberOfVotes < 2) {
    minNumberOfVotes = 2
  }
  document.getElementById("votes").innerHTML = (votes[0].length + votes[1].length) + "/" + minNumberOfVotes
}

socket.on('entity create', function(data) {
  objects = data
  updateEntityCount()
  if (gameData.currentGame != -1) {
    updateScoreboard()
  }
});

function hideGameScreen() {
  document.getElementById("game-message").style.display = "none"
  localData.canInfect = true;
}

socket.on('start game', function(gameID) {
  console.log("Starting Game", gameID)
  gameData.currentGame = gameID
  if (gameID == 0) {
    document.getElementById("game-message-title").innerHTML = "Target Chaser"
    document.getElementById("game-message-info").innerHTML = "Be the first player to reach a target 5 times."
    setTimeout(function() { hideGameScreen(); }, 5000);

  
  } else if (gameID == 1) {
    localData.canInfect = false;
    console.log(objects[localData.id].img)
    if (objects[localData.id].img == 7) {
      document.getElementById("game-message-title").innerHTML = "Run!"
      document.getElementById("game-message-info").innerHTML = "Be the last to survive the zombie outbreak. If infected help the zombies."
      setTimeout(function() { hideGameScreen(); }, 4000);
    } else {
      document.getElementById("game-message-title").innerHTML = "Zombie"
      document.getElementById("game-message-info").innerHTML = "You are a zombie! Infect the others."
      setTimeout(function() { hideGameScreen(); }, 7000);
    }
  }

  // Hide Menus
  localData.gameToggle = true
  document.getElementById("scoreboard").style.display = "block"
  document.getElementById("game-options").style.display = "none"
  document.getElementById("game-selector").style.display = "none"
  document.getElementById("color-selected-container").style.display = "none"
  document.getElementById("color-container").style.display = "none"

  // Show Start Message
  document.getElementById("game-message").style.display = "block"

  updateScoreboard()

});

socket.on('game over', function(winner) {
  // Show Message
  document.getElementById("game-message-title").innerHTML = winner.name
  document.getElementById("game-message-info").innerHTML = "Has won the game!"
  document.getElementById("game-message").style.display = "block"

  // Reshow proper containters
  localData.colorToggle = true;
  gameData.currentGame = -1;
  document.getElementById("color-selected-container").style.display = "block"
  document.getElementById("game-selector").style.display = "block"
  document.getElementById("scoreboard").style.display = "none"
  setTimeout(function() { hideGameScreen(); }, 3000);
});

socket.on('update vote', function(voteData) {
  votes = voteData
  document.getElementById("target-chaser-votes").innerHTML = "x" + votes[0].length
  document.getElementById("zombies-votes").innerHTML = "x" + votes[1].length
  updateEntityCount()
});

socket.on('entity delete', function(id) {
  delete objects[id]
  updateEntityCount()
});

socket.on('connect', () => {
  localData.id = socket.id
  player.id = localData.id
  objects[player.id] = player
  
});

socket.on('update scoreboard', () => {
  updateScoreboard()
});

socket.on('set target', (targetData) => {
  gameData.target = targetData  
  updateScoreboard()
});

