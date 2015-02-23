angular.module('hex7.gameBoard',[
	"ngRoute",
	"cfp.hotkeys",
	"hex7.game.rulesService"
])
.config(function ($routeProvider,$locationProvider){
    $routeProvider.when("/gameboard/:vs/:level/:size",{
        controller: 'gameBoardCtrl',
        templateUrl: "gameBoard.html"
    });
})
.controller('gameBoardCtrl', function($scope, $routeParams, $sce, hotkeys, rulesService, $window){
	//Global variables
	$scope.vs = $routeParams.vs;
	$scope.level = $routeParams.level;
	$scope.size = $routeParams.size;

	//Game variables
	$scope.board = [];
	$scope.selectedBox = {x:0,y:0};
	$scope.turn = true;//true <=> player1, false <=> player2
	$scope.winner = '';


	//Initialisation of the game board
	$scope.initBoard = function(){
		rulesService.initBoard($scope.board, $scope.size);
	};

	//Refresh case selected (old case selected is no more selected and new case selected is selected)
	$scope.changeOfSelectedBox = function(x,y){
		//Check the possibility to change of case
		var couldChangeOfBox = false;
		if(x !== 0){
			if($scope.selectedBox.x + x >= 0 && $scope.selectedBox.x + x < $scope.size){
				couldChangeOfBox = true;
			}
		}else{
			if($scope.selectedBox.y + y >= 0 && $scope.selectedBox.y + y < $scope.size){
				couldChangeOfBox = true;
			}
		}
		
		if(couldChangeOfBox){
			//Unselect old case
			_.first(_.where($scope.board, {'x':$scope.selectedBox.x, 'y':$scope.selectedBox.y})).selected = false;
			//Find new case selected
			$scope.selectedBox.x += x;
			$scope.selectedBox.y += y;
			//Select new case
			_.first(_.where($scope.board, {'x':$scope.selectedBox.x, 'y':$scope.selectedBox.y})).selected = true;
		}
	};

	$scope.reloadPage = function(){
		$window.location.reload();
	};

	//HotKeys ------------------------------------------------------------------------
	hotkeys.add({
		combo: 'z',
		description: 'go up',
		callback: function() {
			$scope.changeOfSelectedBox(0,-1);
		}
	});

	hotkeys.add({
		combo: 's',
		description: 'go down',
		callback: function() {
			$scope.changeOfSelectedBox(0,1);
		}
	});

	hotkeys.add({
		combo: 'q',
		description: 'go left',
		callback: function() {
			$scope.changeOfSelectedBox(-1,0);
		}
	});

	hotkeys.add({
		combo: 'd',
		description: 'go right',
		callback: function() {
			$scope.changeOfSelectedBox(1,0);
		}
	});

	hotkeys.add({
		combo: 'space',
		description: 'take box',
		callback: function(event) {
			if(_.first(_.where($scope.board, {'x':$scope.selectedBox.x, 'y':$scope.selectedBox.y})).state === rulesService.gameConstants.state.default){
				_.first(_.where($scope.board, {'x':$scope.selectedBox.x, 'y':$scope.selectedBox.y})).state = 
				$scope.turn ? rulesService.gameConstants.state.player1 : rulesService.gameConstants.state.player2;

				$scope.turn = !$scope.turn;
				var check = rulesService.checkIfSomeoneWin($scope.board, $scope.size);
				if(check){
					$scope.winner = check;
				}
				event.preventDefault();
			}
		}
	});
});