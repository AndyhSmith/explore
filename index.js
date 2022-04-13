const express = require('express');
const app = express();


app.use(express.static('public'));

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

let objects = {}
let scoreboard = {}
let players = 0
let currentGame = -1

let votes = {
  0: [], // TargetChaser
  1: [], // Zombies
}

let target = {
  x: 0,
  y: 0,
  width: 167,
  height: 146,
}

let exitVotes = {}

// const io = new Server(server);
const io = require('socket.io')(server, {
  cors: {
      rememberTransport: false,
      origin: "http://localhost:8100",
      methods: ["GET", "POST"],
      transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'],
      credentials: true
  },
  allowEIO3: true
});

app.get('/explore', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/explore/main.js', (req, res) => {
  res.sendFile(__dirname + '/public/main.js');
});


function removeVote(id) {
  // Remove previous vote
  for (let property in votes) {
    let index = votes[property].indexOf(id);
    if (index > -1) {
      votes[property].splice(index, 1);
    }
  }
}

function placeTarget() {
  console.log("Setting Target Position")
  target.x = (Math.floor(Math.random() * 8 - 4) * 512) + 1
  target.y = Math.floor(Math.random() * 8 - 4) * 445
  io.emit('set target', target)
}

function pickRandomProperty(obj) {
  var result;
  var count = 0;
  for (var prop in obj)
      if (Math.random() < 1/++count)
         result = prop;
  return result;
}

function startGame(gameID) {
  // Move Players to Start
  exitVotes = {}
  currentGame = gameID
  for (let property in objects) {
    objects[property].x = 0
    objects[property].y = 0
    objects[property].tag = 0
    if (gameID == 1) { // Zombie Chase
      objects[property].tag = "Alive"
      objects[property].img = 7
    }
  }

  if (gameID == 1) {
    let randomObject = Object.keys(objects)[Math.floor(Math.random() * Object.keys(objects).length)]
    objects[randomObject].tag = "Zombie"
    objects[randomObject].img = 11
  }
  

  io.emit('entity create', objects)
  if (gameID == 0) { // Target Chaser
    placeTarget()
  }
 
  io.emit('start game', gameID)
}

io.on('connection', (socket) => {
  players += 1;
  console.log('User has connected:', socket.id);
  console.log("Total Players: " + players);


  socket.on('entity create', (data) => {
    data.id = socket.id
    objects[socket.id] = data
    io.emit('entity create', objects)
    socket.emit('update vote', votes)
  });

  socket.on('vote', (voteValue) => {
    removeVote(socket.id)
    votes[voteValue].push(socket.id)
    io.emit('update vote', votes)
    // Check if start game
    let numberOfVotes = votes[0].length + votes[1].length
    let minNumberOfVotes = Math.ceil(players / 2)
    if (minNumberOfVotes < 2) {
      minNumberOfVotes = 2
    }
    if (numberOfVotes >= minNumberOfVotes) {
      // Check which Game to Start
      let mostVotedGameID = 0
      let mostVotedGame = 0
      for (let property in votes) {
        if (votes[property].length > mostVotedGame) {
          mostVotedGame = votes[property].length
          mostVotedGameID = property
        }
      }
      votes = {
        0: [], // TargetChaser
        1: [], // Zombies
      }
      io.emit('update vote', votes)

      // Start Game on CLient
      console.log("Starting Game", mostVotedGameID)
      startGame(mostVotedGameID)
    }
  });

  socket.on('tag update', (data) => {
    // data.id = socket.id
    objects[data.id].tag = data.tag
    io.emit('tag update', objects[data.id])
  });

  socket.on('entity update', (data) => {
    // data.id = socket.id
    objects[data.id].x = data.x
    objects[data.id].y = data.y
    objects[data.id].img = data.img
    io.emit('entity update', objects[data.id])
  });

  socket.on('get game state', () => {
    console.log("Current Game", currentGame)
    if (currentGame != -1) {
      socket.emit('update game state', currentGame)
      socket.emit('start game', currentGame)
    }
  });

  socket.on('collect target', (data) => {
    objects[socket.id] = data
    // Check if game over
    if (objects[socket.id].tag >= 5) {
      io.emit('game over', data)
      currentGame = -1
    } else {
      io.emit('tag update', data)
      placeTarget()
    }
    
  });

  socket.on('check game over', (data) => {
    let gameOver = true;
    // io.emit('tag update', objects)
    for (let property in objects) {
      if (objects[property].img != 11) {
        gameOver = false;
        break;
      }
    }
    if (gameOver) {
      io.emit('game over', objects[data])
      currentGame = -1
    } 
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('vote exit', (playerID) => {
    console.log("Voted to Exit")
    exitVotes[playerID] = true;
    // Check if game should end
    let counter = 0
    for (let property in exitVotes) {
      counter += 1
    }
    console.log("Exit vote", counter)
    if (counter > players - 1 && counter >= 2) {
      currentGame = -1
      io.emit('game over', objects[playerID])
    } else {
      console.log("Updating Votes")
      io.emit('update exit votes', "Exit " + counter + "/" + players)
    }
  });

  socket.on('disconnect', () => {
    delete objects[socket.id];
    removeVote(socket.id)
    players -= 1;
    io.emit('entity delete', socket.id);
    console.log('user disconnected');
  });

  if (currentGame == 0) {
    io.emit('set target', target);
  }

});

server.listen(3001, () => {
  console.log('listening on *:3001');
});