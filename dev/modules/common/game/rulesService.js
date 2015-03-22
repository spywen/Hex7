angular.module('hex7.game.rulesService', [
	"hex7.constants"
])
.factory('rulesService', function(gameConstants, $q){

	return {
		initBoard: initBoard,
		checkIfSomeoneWin: checkIfSomeoneWin
	};

	/**
	* Init game board
	* -> Style of the board (color of empty boxes, hexagons positions)
	**/
	function initBoard(board, size){
		var index = 0;
		var lineDecal = 0;
		for(var y=0;y<size;y++){
			for(var x=0; x<size;x++){
				var newCase = _.clone(gameConstants.case);
				newCase.x = x;
				newCase.y = y;
				newCase.posx = x * gameConstants.xposFactor + lineDecal;
				newCase.posy = y * gameConstants.yposFactor;
				if(newCase.x===0 && newCase.y===0){//Just for the first case
					newCase.selected = true;
				}
				//Player side
				if((newCase.x===0 || newCase.x===size-1) && (newCase.y!==0 && newCase.y!==size-1)){
					newCase.playerSide = 'redSide';
				}
				if((newCase.y===0 || newCase.y===size-1) && (newCase.x!==0 && newCase.x!==size-1)){
					newCase.playerSide = 'blueSide';
				}
				board.push(newCase);
			}
			lineDecal+=gameConstants.posLineDecalFactor;
		}
	}

	/**
	* Method to check if someone win
	**/
	function checkIfSomeoneWin(board, size){
		var deffered = $q.defer();
		var winner = '';

		//For each players we test if he wins
		_.forEach([
			{//PLAYER 1
				'whereStart':{'y':0, 'state':gameConstants.state.player1},
				'whereEnd':{'y':size-1, 'state':gameConstants.state.player1},
				'state':gameConstants.state.player1
			},
			{//PLAYER 2
				'whereStart':{'x':0, 'state':gameConstants.state.player2},
				'whereEnd':{'x':size-1, 'state':gameConstants.state.player2},
				'state':gameConstants.state.player2
			}
		], function(player){
			//For the current player we define if he has at least two pieces on his sides (player1 : top and bottom, player2 : left and right)
			//If yes : the player could win so we continue the algorithm
			//If no : the player could not win so we stop the algorithm
			var playerFirstSidePieces = _.where(board, player.whereStart);
			var playerEndSidePieces = _.where(board, player.whereEnd);
			if(playerFirstSidePieces.length > 0 && playerEndSidePieces.length > 0){
				var otherPieces = [];
				_.map(_.where(board, {'state':player.state}), function(piece){
					otherPieces.push(piece);
				});
				var solutionFound = false;
				//For each player first side pieces we test if we are able to find a path to go to one end side piece
				_.forEach(playerFirstSidePieces, function(firstSidePiece){
					var path = [];
					path.push(firstSidePiece);
					var endOfSearch = false;
					while(!endOfSearch){
						//We find a new path near the current piece not already tested by the algorythm
						var newPathFound = false;
						if(_.where(otherPieces, {'x':_.last(path).x+1, 'y':_.last(path).y, 'alreadyTested':false}).length>0){
							newPathFound = true;
							path.push(_.first(_.where(otherPieces, {'x':_.last(path).x+1, 'y':_.last(path).y, 'alreadyTested':false})));
						}
						else if(_.where(otherPieces, {'x':_.last(path).x-1, 'y':_.last(path).y, 'alreadyTested':false}).length>0){
							newPathFound = true;
							path.push(_.first(_.where(otherPieces, {'x':_.last(path).x-1, 'y':_.last(path).y, 'alreadyTested':false})));
						}
						else if(_.where(otherPieces, {'x':_.last(path).x, 'y':_.last(path).y+1, 'alreadyTested':false}).length>0){
							newPathFound = true;
							path.push(_.first(_.where(otherPieces, {'x':_.last(path).x, 'y':_.last(path).y+1, 'alreadyTested':false})));
						}
						else if(_.where(otherPieces, {'x':_.last(path).x, 'y':_.last(path).y-1, 'alreadyTested':false}).length>0){
							newPathFound = true;
							path.push(_.first(_.where(otherPieces, {'x':_.last(path).x, 'y':_.last(path).y-1, 'alreadyTested':false})));
						}
						else if(_.where(otherPieces, {'x':_.last(path).x+1, 'y':_.last(path).y-1, 'alreadyTested':false}).length>0){
							newPathFound = true;
							path.push(_.first(_.where(otherPieces, {'x':_.last(path).x+1, 'y':_.last(path).y-1, 'alreadyTested':false})));
						}
						else if(_.where(otherPieces, {'x':_.last(path).x-1, 'y':_.last(path).y+1, 'alreadyTested':false}).length>0){
							newPathFound = true;
							path.push(_.first(_.where(otherPieces, {'x':_.last(path).x-1, 'y':_.last(path).y+1, 'alreadyTested':false})));
						}

						//If no piece found near the current piece : no solution found
						if(path.length === 0){
							endOfSearch = true;
						}else{
							//If path contains a end piece : solution found
							if(_.where(path, player.whereEnd).length>0){
								solutionFound = true;
								endOfSearch = true;
								winner = player.state;
							}else{
								//If no new piece near the current one found we back to the previous piece
								if(!newPathFound){
									path = _.slice(path,0,path.length-1);
									if(path.length===0)
										endOfSearch = true;
								}else{//If new path found we set the alredyTested attribute to true
									_.last(path).alreadyTested = true;
								}
							}
						}
					}
				});
				cleanBoard(board);
			}
		});
		if(winner !== ''){//If winner found
			//console.log("Player win: " + winner);
			deffered.resolve(winner);
		}else{
			deffered.reject(false);
		}
		return deffered.promise;
	}

	/**
	* Clean the alreadyTested attributes of all the board
	**/
	function cleanBoard(board){
		_.forEach(board, function(c){
			c.alreadyTested = false;
		});
	}
});