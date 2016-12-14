var socket = io();

var refreshPlayerList = function (playerList){ 
    $('#initiatives-rolls').html(''); 
    for (var i = 0; i < playerList.length; i++) {
      player = playerList[i];
      var roll = player.initiativeRoll;
      var text = roll + " - " + player.username;
      var li = $("<li></li>");

      if (player.isNpc) {
        var ac = player.ac;
        text = text + "; AC:  " + player.ac;
      }
      li.text(text);
      $('#initiatives-rolls').append(li);
    }; 
    setNpcDefaultName(playerList.length);
};

socket.on('added player roll', refreshPlayerList);

socket.on('player list cleaned', function () {
  refreshPlayerList([]);
});

$('#clear-button').click(function() {
  $.ajax({
    url: '/Player/Clean',
    type: 'POST',
    dataType: 'json',
    data: {},
  }).done(refreshPlayerList);
});

$('#new-npc-form').submit(function(e) {
  e.preventDefault();
  var npcInfo = {
    username: $('#npc-name').val(),
    initiativeModifier: $('#npc-inititive-modifier').val(),
    ac: $('#npc-ac').val(),
    isNpc: true
  };
  socket.emit('player rolling', npcInfo); 
});

$('#ac-minus').click(function(e) {
  e.preventDefault();
  var value = $('#npc-ac').val(); 
  $('#npc-ac').val(--value); 
});

$('#ac-plus').click(function(e) {
  e.preventDefault();
  var value = $('#npc-ac').val(); 
  $('#npc-ac').val(++value); 
});

$('#initiative-minus').click(function(e) {
  e.preventDefault();
  var value = $('#npc-inititive-modifier').val(); 
  $('#npc-inititive-modifier').val(--value); 
});

$('#initiative-plus').click(function(e) {
  e.preventDefault();
  var value = $('#npc-inititive-modifier').val(); 
  $('#npc-inititive-modifier').val(++value); 
});

var setNpcDefaultName = function (numberOfCharactersInList) {
  $('#npc-name').val("Character " + (++numberOfCharactersInList));
};

setNpcDefaultName(0);

var refreshRollList = function () {
  $.ajax({
    url: '/Player/List',
    type: 'GET',
    dataType: 'json',
    data: {},
  }).done(refreshPlayerList);
};

refreshRollList();

$('#refresh-button').click(function(e) {
  e.preventDefault();
  refreshRollList();
});