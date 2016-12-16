var isStorageSupported = false;
if (typeof(Storage) !== "undefined") {
    var isStorageSupported = true;
}

var previousValue = "";
if(isStorageSupported) {
  previousValue = localStorage.getItem("characterName") || "";
}
var playerName = prompt('Enter your character name:', previousValue);
if(isStorageSupported) {
  localStorage.setItem("characterName", playerName);
}
$('#player-name').text(playerName);

var previousValue = 0;
if(isStorageSupported) {
  previousValue = localStorage.getItem("initiativeModifier") || 0;
}

var initiativeModifier = prompt('Enter your modifier:', previousValue);
if(isStorageSupported) {
  localStorage.setItem("initiativeModifier", initiativeModifier);
}

var currentPlayerInfo = {
  playerName: playerName,
  initiativeModifier: initiativeModifier
};

var socket = io();

socket.on('message', function (sessionId) {
  console.log("Connected on session: " + sessionId);
  currentPlayerInfo.sessionId = sessionId;
});

socket.on('player list cleaned', function () {
  $('#roll-button').prop("disabled", false);
});

$('#roll-button').click(function() {
  $('#roll-button').prop("disabled", true);
  socket.emit('player rolling', currentPlayerInfo); 
});

var updateRollResult = function(playerInfo) { 
  $('#roll-result').html("<strong>" + playerInfo.initiativeRoll + "</strong> (" + playerInfo.diceResult + " + " + playerInfo.initiativeModifier + ")"); 
};

socket.on('my roll result', updateRollResult);

var getPlayerInfo = function () {
  var url = "/Player/Roll/" + currentPlayerInfo.playerName;
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json',
    data: {},
  }).done(function(playerInfo) {
    if(playerInfo && playerInfo.initiativeRoll) {
      updateRollResult(playerInfo);
      $('#roll-button').prop("disabled", true);
    } else {
      $('#roll-button').prop("disabled", false);
    }
  });
};

getPlayerInfo();