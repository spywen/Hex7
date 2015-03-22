angular.module('hex7.game.AIService', [
	"hex7.game.rulesService",
	"hex7.constants"
])
.factory('AIService', function(rulesService, $q, gameConstants){

	return {
		findBestAiPlay: findBestAiPlay
	};

	/**
	* Public method to find the best play for AI (create a copy of the scope to avoid real board changements)
	**/
	function findBestAiPlay(board, size, level, playerState){
		var deffered = $q.defer();
		board = angular.copy(board);
		findPieceWayToAvoidPlayerWin([board], size, level, 1, playerState).then(function(bestPlayPosition){
			deffered.resolve(bestPlayPosition);
		});
		return deffered.promise;
	}

	/**
	* Private algorithm to find the best play for AI
	* The algorythm takes :
	* - a list of boards to tests, 
	* - the size of the board
	* - the AI level
	* - the virtualLevel which correspond to the recursivity level
	* the aim of this algorythm is to create virtual boards by placing opponent pieces then test
	* at least one of these virtual boards are a solution for the opponent. 
	* If YES : we return one virtualPiece coordinates as the play of the AI to block the opponent
	* ELSE : we return a random stroke
	**/
	function findPieceWayToAvoidPlayerWin(boards, size, level, virtualLevel, playerState){
		var deffered = $q.defer();

		_.forEach(boards, function(boardToAnalyse){
			resetAiVirtualPieceAttribute(boardToAnalyse);
			
			//Search all player pieces
			var opponent = (playerState === gameConstants.state.player1 ? gameConstants.state.player2 : gameConstants.state.player1);
			var playerPieces = _.where(boardToAnalyse, {'state':opponent});
			
			//We try to play for the player near his current position (distance  = 1)
			var virtualBoards = [];
			var newVirtualBoard;
			_.forEach(playerPieces, function(playerPiece){
				//console.log("Player piece X:" + playerPiece.x + ", Y:" + playerPiece.y);

				if(_.where(boardToAnalyse, {'x':playerPiece.x+1, 'y':playerPiece.y, 'state':gameConstants.state.default}).length>0){
					newVirtualBoard = angular.copy(boardToAnalyse);
					_.first(_.where(newVirtualBoard, {'x':playerPiece.x+1, 'y':playerPiece.y})).state = opponent;
					_.first(_.where(newVirtualBoard, {'x':playerPiece.x+1, 'y':playerPiece.y})).aiVirtualPiece = true;
					virtualBoards.push(newVirtualBoard);
				}
				if(_.where(boardToAnalyse, {'x':playerPiece.x-1, 'y':playerPiece.y, 'state':gameConstants.state.default}).length>0){
					newVirtualBoard = angular.copy(boardToAnalyse);
					_.first(_.where(newVirtualBoard, {'x':playerPiece.x-1, 'y':playerPiece.y})).state = opponent;
					_.first(_.where(newVirtualBoard, {'x':playerPiece.x-1, 'y':playerPiece.y})).aiVirtualPiece = true;
					virtualBoards.push(newVirtualBoard);
				}
				if(_.where(boardToAnalyse, {'x':playerPiece.x, 'y':playerPiece.y+1, 'state':gameConstants.state.default}).length>0){
					newVirtualBoard = angular.copy(boardToAnalyse);
					_.first(_.where(newVirtualBoard, {'x':playerPiece.x, 'y':playerPiece.y+1})).state = opponent;
					_.first(_.where(newVirtualBoard, {'x':playerPiece.x, 'y':playerPiece.y+1})).aiVirtualPiece = true;
					virtualBoards.push(newVirtualBoard);
				}
				if(_.where(boardToAnalyse, {'x':playerPiece.x, 'y':playerPiece.y-1, 'state':gameConstants.state.default}).length>0){
					newVirtualBoard = angular.copy(boardToAnalyse);
					_.first(_.where(newVirtualBoard, {'x':playerPiece.x, 'y':playerPiece.y-1})).state = opponent;
					_.first(_.where(newVirtualBoard, {'x':playerPiece.x, 'y':playerPiece.y-1})).aiVirtualPiece = true;
					virtualBoards.push(newVirtualBoard);
				}
				if(_.where(boardToAnalyse, {'x':playerPiece.x+1, 'y':playerPiece.y-1, 'state':gameConstants.state.default}).length>0){
					newVirtualBoard = angular.copy(boardToAnalyse);
					_.first(_.where(newVirtualBoard, {'x':playerPiece.x+1, 'y':playerPiece.y-1})).state = opponent;
					_.first(_.where(newVirtualBoard, {'x':playerPiece.x+1, 'y':playerPiece.y-1})).aiVirtualPiece = true;
					virtualBoards.push(newVirtualBoard);
				}
				if(_.where(boardToAnalyse, {'x':playerPiece.x-1, 'y':playerPiece.y+1, 'state':gameConstants.state.default}).length>0){
					newVirtualBoard = angular.copy(boardToAnalyse);
					_.first(_.where(newVirtualBoard, {'x':playerPiece.x-1, 'y':playerPiece.y+1})).state = opponent;
					_.first(_.where(newVirtualBoard, {'x':playerPiece.x-1, 'y':playerPiece.y+1})).aiVirtualPiece = true;
					virtualBoards.push(newVirtualBoard);
				}
			});

			//End for each of this position we define if the player win or not
			var virtualBoardsCount = virtualBoards.length;
			_.forEach(virtualBoards, function(virtualBoard){
				//console.log("Virtual boards to test... :",virtualBoardsCount);
				checkIfPlayerWinWithVirtualBoard(virtualBoard, size).then(function(result){
					deffered.resolve(result);
				},function(){
					virtualBoardsCount--;
					if(virtualBoardsCount===0){
						//If no : 
						if(virtualLevel === recuRequiredByAiLevel(level)){
							//IF the AI level reached we give a random position
							var caseNotUsed = _.where(boardToAnalyse, {'state':gameConstants.state.default});
							var randomIndex = _.random(0, caseNotUsed.length-1);
							var caseToPlayByRandom = caseNotUsed[randomIndex];
							deffered.resolve({'x':caseToPlayByRandom.x, 'y':caseToPlayByRandom.y});
						}else{
							//ELSE we call back the same method with all the virtual boards define here
							findPieceWayToAvoidPlayerWin(virtualBoards, size, level, virtualLevel+1, playerState).then(function(bestPlayPosition){
								deffered.resolve(bestPlayPosition);
							});
						}
					}
				});
			});
		});
		return deffered.promise;
	}

	/**
	* Method to reset the aiVirtualPiece attribute of a board
	**/
	function resetAiVirtualPieceAttribute(board){
		_.forEach(board, function(piece){
			piece.aiVirtualPiece = false;
		});
	}

	/**
	* Check if someone win according to a virtual board
	* If opponent win with a virtual board this method return one of the virtual piece to block him 
	**/
	function checkIfPlayerWinWithVirtualBoard(virtualBoard, size){
		var deffered = $q.defer();
		rulesService.checkIfSomeoneWin(virtualBoard, size).then(function(){
			//If yes : we return the first position found
			var pieceSolution = _.first(_.where(virtualBoard, {'aiVirtualPiece':true}));
			//console.log("Solution piece :", pieceSolution);
			deffered.resolve({'x':pieceSolution.x, 'y':pieceSolution.y});
		},function(){
			deffered.reject();
		});
		return deffered.promise;
	}

	/**
	* Return recursivity level according to the ai level 
	**/
	function recuRequiredByAiLevel(level){
		if(level === 'Hard'){
			return 3;
		}else if(level === 'Medium'){
			return 2;
		}else{//Easy
			return 1;
		}
	}
});