angular.module('hex7.gameBoard',[
	"ngRoute",
	"cfp.hotkeys",
	"hex7.game.rulesService",
	"hex7.game.AIService"
])
.config(function ($routeProvider,$locationProvider){
    $routeProvider.when("/gameboard/:vs/:levelai1/:levelai2/:size",{
        controller: 'gameBoardCtrl',
        templateUrl: "gameBoard.html"
    });
})
.controller('gameBoardCtrl', function($scope, $routeParams, $sce, hotkeys, rulesService, $window, AIService){
	//Global variables
	$scope.vs = $routeParams.vs;
	$scope.levelai1 = $routeParams.levelai1;
	$scope.levelai2 = $routeParams.levelai2;
	$scope.size = $routeParams.size;

	//Game variables
	$scope.board = [];
	$scope.selectedBox = {x:0,y:0};
	$scope.turn = true;//true <=> player1, false <=> player2
	$scope.winner = '';

	$scope.timing = 0;


	//Initialisation of the game board
	$scope.initBoard = function(){
		rulesService.initBoard($scope.board, $scope.size);
	};

	//Refresh case selected (old case selected is no more selected and new case selected is selected)
	$scope.changeOfSelectedBox = function(x,y){

		if($scope.vs === 'aiai'){
			return true;
		}else if($scope.vs == 'playerai' && !$scope.turn){
			return true;
		}

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

				var beforenow = new Date().getTime();
				var check = rulesService.checkIfSomeoneWin($scope.board, $scope.size).then(function(winner){
					$scope.winner = winner;
				},function(){
					//CHECK IF IT'S THE AI TURN
					if($scope.vs == 'playerai' && !$scope.turn && $scope.winner === ''){
						AIService.findBestAiPlay($scope.board, $scope.size, $scope.levelai1).then(function(aiBestPiecePosition){
							_.first(_.where($scope.board, {'x':aiBestPiecePosition.x, 'y':aiBestPiecePosition.y})).state = rulesService.gameConstants.state.player2;
							rulesService.checkIfSomeoneWin($scope.board, $scope.size).then(function(winner){
								$scope.winner = winner;
							});
							$scope.turn = !$scope.turn;
						});
					}
				}).finally(function(){
					var afternow = new Date().getTime();
					$scope.timing = afternow - beforenow;
				});


				event.preventDefault();
			}
		}
	});
});