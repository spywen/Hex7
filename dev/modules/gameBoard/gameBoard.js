angular.module('hex7.gameBoard',[
	"ngRoute",
	"cfp.hotkeys",
	"hex7.game.rulesService"
])
.config(function ($routeProvider,$locationProvider){
    $routeProvider.when("/gameboard/:level/:size",{
        controller: 'gameBoardCtrl',
        templateUrl: "gameBoard.html"
    });
})
.constant('elementsConstants',{
	'case':{
		x: 0,//x
		y: 0,//y
		posx:0,//css x position
		posy:0,//css y position
		state:"default",//state : default, player1, player2
		selected:"notSelected",//selected by the cursor or not,
		alreadyTested:false
	}
})
.controller('gameBoardCtrl', function($scope, $routeParams, $sce, elementsConstants, hotkeys, rulesService){
	//Global variables
	$scope.level = $routeParams.level;
	$scope.size = $routeParams.size;

	//Game variables
	$scope.boardCases = [];
	$scope.selectedCase = {x:0,y:0};
	$scope.turn = true;//true <=> player1, false <=> player2
	$scope.winner = '';
	

	//Initialisation of the game board
	$scope.initBoard = function(){
		var index = 0;
		var lineDecal = 0;
		for(var y=0;y<$scope.size;y++){
			for(var x=0; x<$scope.size;x++){
				var newCase = _.clone(elementsConstants.case);
				newCase.x = x;
				newCase.y = y;
				newCase.posx = x * 53 + lineDecal;
				newCase.posy = y * 46;
				if(newCase.x===0 && newCase.y===0){//Just for the first case
					newCase.selected = "selected";
				}
				$scope.boardCases.push(newCase);
			}
			lineDecal+=26;
		}
	};

	$scope.refreshSelection = function(){
		_.first(_.where($scope.boardCases, {'selected':'selected'})).selected = 'notSelected';
		_.first(_.where($scope.boardCases, {'x':$scope.selectedCase.x, 'y':$scope.selectedCase.y})).selected = 'selected';
	};

	$scope.checkEnd = function(){
		//Player 1
		var player1TopPieces = _.where($scope.boardCases, {'y':0, 'state':'player1'});
		var player1BotPieces = _.where($scope.boardCases, {'y':$scope.size-1, 'state':'player1'});
		if(player1TopPieces.length > 0 && player1BotPieces.length > 0){
			console.log('One solution could be found for the player 1');
			var piecesWithoutTopBorderPieces = [];
			_.map(_.where($scope.boardCases, {'state':'player1'}), function(piece){
				if(piece.y>0){
					piecesWithoutTopBorderPieces.push(piece);
				}
			});
			console.log('Internal pieces found : '+piecesWithoutTopBorderPieces.length);
			var solutionFound = false;
			_.forEach(player1TopPieces, function(topPiece){
				var path = [];
				path.push(topPiece);
				var endOfSearch = false;
				while(!endOfSearch){
					var newPathFound = false;
					if(_.where(piecesWithoutTopBorderPieces, {'x':_.last(path).x+1, 'y':_.last(path).y, 'alreadyTested':false}).length>0){
						newPathFound = true;
						_.last(path).sol = true;
						path.push(_.first(_.where(piecesWithoutTopBorderPieces, {'x':_.last(path).x+1, 'y':_.last(path).y, 'alreadyTested':false})));
					}
					else if(_.where(piecesWithoutTopBorderPieces, {'x':_.last(path).x-1, 'y':_.last(path).y, 'alreadyTested':false}).length>0){
						newPathFound = true;
						_.last(path).sol = true;
						path.push(_.first(_.where(piecesWithoutTopBorderPieces, {'x':_.last(path).x-1, 'y':_.last(path).y, 'alreadyTested':false})));
					}
					else if(_.where(piecesWithoutTopBorderPieces, {'x':_.last(path).x, 'y':_.last(path).y+1, 'alreadyTested':false}).length>0){
						newPathFound = true;
						_.last(path).sol = true;
						path.push(_.first(_.where(piecesWithoutTopBorderPieces, {'x':_.last(path).x, 'y':_.last(path).y+1, 'alreadyTested':false})));
					}
					else if(_.where(piecesWithoutTopBorderPieces, {'x':_.last(path).x, 'y':_.last(path).y-1, 'alreadyTested':false}).length>0){
						newPathFound = true;
						_.last(path).sol = true;
						path.push(_.first(_.where(piecesWithoutTopBorderPieces, {'x':_.last(path).x, 'y':_.last(path).y-1, 'alreadyTested':false})));
					}
					else if(_.where(piecesWithoutTopBorderPieces, {'x':_.last(path).x+1, 'y':_.last(path).y-1, 'alreadyTested':false}).length>0){
						newPathFound = true;
						_.last(path).sol = true;
						path.push(_.first(_.where(piecesWithoutTopBorderPieces, {'x':_.last(path).x+1, 'y':_.last(path).y-1, 'alreadyTested':false})));
					}
					else if(_.where(piecesWithoutTopBorderPieces, {'x':_.last(path).x-1, 'y':_.last(path).y+1, 'alreadyTested':false}).length>0){
						newPathFound = true;
						_.last(path).sol = true;
						path.push(_.first(_.where(piecesWithoutTopBorderPieces, {'x':_.last(path).x-1, 'y':_.last(path).y+1, 'alreadyTested':false})));
					}

					//Verif que dans le dernier pion ajouté n'appartient pas au bot
					if(path.length === 0){
						endOfSearch = true;
					}else{
						if(_.where(path, {'y':$scope.size-1}).length>0){
							console.log('SOLUTION!!!');
							solutionFound = true;
							endOfSearch = true;
						}else{
							if(!newPathFound){
								console.log(path.length);
								path = _.slice(path,0,path.length-1);
								console.log(path.length);
								if(path.length===0)
									endOfSearch = true;
									//_.last(path).alreadyTested = false;
							}else{
								_.last(path).alreadyTested = true;
							}
						}
					}
				}
			});
			$scope.cleanPieceAlreadyTested($scope.boardCases);
			if(solutionFound){
				console.log('Player 1 win !');
			}
		}
		//Player 2
		/*var player2LeftPieces = _.where($scope.boardCases, {'x':0, 'state':'player2'});
		var player2RightPieces = _.where($scope.boardCases, {'x':$scope.size-1, 'state':'player2'});
		if(player2LeftPieces.length > 0 && player2RightPieces.length > 0){
			console.log('One solution could be found for the player 2');
		}*/
	};

	$scope.cleanPieceAlreadyTested = function(boardCases){
		_.forEach(boardCases, function(c){
			c.alreadyTested = false;
		});
	};

	hotkeys.add({
		combo: 'z',
		description: 'go up',
		callback: function() {
			if($scope.selectedCase.y - 1 >= 0){
				$scope.selectedCase.y--;
			}
			$scope.refreshSelection();
		}
	});

	hotkeys.add({
		combo: 's',
		description: 'go down',
		callback: function() {
			if($scope.selectedCase.y + 1 < $scope.size){
				$scope.selectedCase.y++;
			}
			$scope.refreshSelection();
		}
	});

	hotkeys.add({
		combo: 'q',
		description: 'go left',
		callback: function() {
			if($scope.selectedCase.x - 1 >= 0){
				$scope.selectedCase.x--;
			}
			$scope.refreshSelection();
		}
	});

	hotkeys.add({
		combo: 'd',
		description: 'go right',
		callback: function() {
			if($scope.selectedCase.x + 1 < $scope.size){
				$scope.selectedCase.x++;
			}
			$scope.refreshSelection();
		}
	});

	hotkeys.add({
		combo: 'space',
		description: 'take',
		callback: function(event) {
			if(_.first(_.where($scope.boardCases, {'x':$scope.selectedCase.x, 'y':$scope.selectedCase.y})).state === 'default'){
				_.first(_.where($scope.boardCases, {'x':$scope.selectedCase.x, 'y':$scope.selectedCase.y})).state = $scope.turn ? 'player1' : 'player2';
				//$scope.turn = !$scope.turn;
				$scope.checkEnd();
				event.preventDefault();
			}
		}
	});
});