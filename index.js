var express = require('express');  
var app = express();
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var path = require('path'); 

app.use(express.static(path.join(__dirname, 'public')));

var playerList = [];

app.get('/Player/List', function(req, res){
  res.json(playerList);
});

app.get('/Player/Roll/:id', function(req, res){
  var playerInfo = getPlayerFromList(playerList, req.params.id);
  res.json(playerInfo);
});

app.post('/Player/Clean', function(req, res){
  playerList = [];
  io.emit('player list cleaned');
  res.json(playerList);
});

io.on('connection', function(socket){
  socket.send(socket.id);
  socket.on('player rolling', function(playerInfo){ 
     var diceResult = rollDice(20);
     playerInfo.diceResult = diceResult;
     playerInfo.initiativeRoll = diceResult + parseInt(playerInfo.initiativeModifier);
     
     if(!playerInfo.isNpc) io.to(socket.id).emit("my roll result", playerInfo);

     addPlayerToListIfNotPresent(playerList, playerInfo);
     orderListByInitiativeRolls(playerList);
     io.emit('added player roll', playerList); 
   });    
});

var port = process.env.PORT || 3000;
app.set('port', port);

server.listen(port, function () { 
   console.log("Web server listening to port " + port); 
});

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
var getRandomIntInclusive = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var rollDice = function (diceNumber) {
  var result = getRandomIntInclusive(1, diceNumber);
  return result;
};

var addPlayerToListIfNotPresent = function(playerList, playerInfo) {
  if(playerInfo.isNpc) {
    playerList.push(playerInfo);
    return;
  }

  for (var i = 0; i < playerList.length; i++) {
    player = playerList[i];
    if (player.username === playerInfo.username) {
      if (!player.initiativeRoll) {
        playerList[i] = playerInfo;
      }
      return;
    }
  } 
  playerList.push(playerInfo);
};

var orderListByInitiativeRolls = function (playerList) {
  playerList.sort(function (a, b) {
    if (a.initiativeRoll < b.initiativeRoll) {
      return 1;
    }
    if (a.initiativeRoll > b.initiativeRoll) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
};

var getPlayerFromList = function(playerList, name) {
  for (var i = 0; i < playerList.length; i++) {
    player = playerList[i];
    if (player.username === name) {
      return player;
    }
  } 
  return null;
};
