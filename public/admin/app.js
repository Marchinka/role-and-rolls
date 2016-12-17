var module = angular.module("admin", []);

module.controller("adminCtrl", function ($scope, $socketMediator, $http) {
  var setFormDefaults = function () {
    var numberOfRolls = $scope.initiativeRolls ? $scope.initiativeRolls.length : 0;

    $scope.input = {
      playerName: "Character " + (numberOfRolls + 1),
      ac: 18,
      initiativeModifier: 0
    };
  };

  $scope.initiativeRolls = [];

  var refreshInitiativeRolls = function (initiativeRolls){ 
    $scope.initiativeRolls = initiativeRolls;
    setFormDefaults();
  };

  $socketMediator.on('added player roll', function (initiativeRolls) {
    refreshInitiativeRolls(initiativeRolls)
    $scope.$apply();
  });

  $socketMediator.on('player list cleaned', function () {
    refreshInitiativeRolls([]);
    $scope.$apply();
  });

  $scope.clearInitiativeRolls = function () {
    $http({
      method: 'POST',
      url: '/Player/Clean'
    }).then(function successCallback(response) {
      refreshInitiativeRolls(response.data);
    });
  };

  $scope.getCurrentInitiativeRolls = function () {
    $http({
      method: 'GET',
      url: '/Player/List'
    }).then(function successCallback(response) {
      refreshInitiativeRolls(response.data);
    });
  };

  $scope.rollNewNpc = function () {
    var npcInfo = {
      playerName: $scope.input.playerName,
      initiativeModifier: $scope.input.initiativeModifier,
      ac: $scope.input.ac,
      isNpc: true
    };
    $socketMediator.emit('player rolling', npcInfo);
  };

  $scope.minusAc = function () {
    $scope.input.ac--;
  };

  $scope.plusAc = function () {
    $scope.input.ac++;
  };

  $scope.minusInitiative = function () {
    $scope.input.initiativeModifier--;
  };

  $scope.plusInitiative = function () {
    $scope.input.initiativeModifier++;
  };

  setFormDefaults();
  $scope.getCurrentInitiativeRolls();
});

module.factory('$socketMediator', function() {
    var socket = io();
    var mediator = {
      on: function (eventName, callback) {
        socket.on(eventName, callback);
      },
      emit: function (eventName, obj) {
        socket.emit(eventName, obj);
      }      
    };
    return mediator; 
 });
var socket = io();

var refreshPlayerList = function (playerList){ 
    $('#initiatives-rolls').html(''); 
    for (var i = 0; i < playerList.length; i++) {
      player = playerList[i];
      var roll = player.initiativeRoll;
      var text = roll + " - " + player.playerName;
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