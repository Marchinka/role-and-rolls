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
  enableButton();
  cleanRollResult();
});

$('#roll-button').click(function() {
  disableButton();
  socket.emit('player rolling', currentPlayerInfo); 
});

var updateRollResult = function(playerInfo) { 
  $('#roll-result').html(playerInfo.initiativeRoll); 
  $('#roll-result-partial').html(playerInfo.diceResult + " + " + playerInfo.initiativeModifier); 
};

var cleanRollResult = function(playerInfo) { 
  $('#roll-result').html(""); 
  $('#roll-result-partial').html(""); 
};

var disableButton = function () {
  $('#roll-button').prop("disabled", true);
  $('#roll-button').removeClass("btn-big-red");
  $('#roll-button').addClass("btn-big-disabled");
};

var enableButton = function () {
  $('#roll-button').prop("disabled", false);
  $('#roll-button').addClass("btn-big-red");
  $('#roll-button').removeClass("btn-big-disabled");
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
      disableButton();
    } else {
      enableButton();
    }
  });
};

getPlayerInfo();