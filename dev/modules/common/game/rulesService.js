angular.module('hex7.game.rulesService', [])
.constant('gameConstants',{
	'state':{
		'default':'default',
		'player1':'player1',
		'player2':'player2'
	},
	'case':{
		x: 0,//x
		y: 0,//y
		posx:0,//css x position
		posy:0,//css y position
		state:"default",//state : default, player1, player2
		selected:false,
		alreadyTested:false
	},
	"xposFactor":53,
	"yposFactor":46,
	"posLineDecalFactor":26
})
.factory('rulesService', function(gameConstants){

	return {
		initBoard: initBoard,
		checkIfSomeoneWin: checkIfSomeoneWin,
		gameConstants:gameConstants
	};

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
				board.push(newCase);
			}
			lineDecal+=gameConstants.posLineDecalFactor;
		}
	}

	function checkIfSomeoneWin(board, size){
		_.forEach([
			{//PLAYER 1
				'where':{'y':0, 'state':gameConstants.state.player1},
				'side':'y',
				'state':gameConstants.state.player1
			},
			{//PLAYER 2
				'where':{'x':0, 'state':gameConstants.state.player2},
				'side':'x',
				'state':gameConstants.state.player2
			}
		], function(player){
			if(player.side === 'y'){
				player.where.y = 0;
			}else{
				player.where.x = 0;
			}
			var playerFirstSidePieces = _.where(board, player.where);
			if(player.side === 'y'){
				player.where.y = size-1;
			}else{
				player.where.x = size-1;
			}
			var playerEndSidePieces = _.where(board, player.where);
			if(playerFirstSidePieces.length > 0 && playerEndSidePieces.length > 0){
				var otherPieces = [];
				_.map(_.where(board, {'state':player.state}), function(piece){
					if(piece.y>0){
						otherPieces.push(piece);
					}
				});
				var solutionFound = false;
				_.forEach(playerFirstSidePieces, function(firstSidePiece){
					var path = [];
					path.push(firstSidePiece);
					var endOfSearch = false;
					while(!endOfSearch){
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

						if(path.length === 0){
							endOfSearch = true;
						}else{
							if(player.side === 'y'){
								player.where.y = size-1;
							}else{
								player.where.x = size-1;
							}
							if(_.where(path, player.where).length>0){
								solutionFound = true;
								endOfSearch = true;
							}else{
								if(!newPathFound){
									path = _.slice(path,0,path.length-1);
									if(path.length===0)
										endOfSearch = true;
								}else{
									_.last(path).alreadyTested = true;
								}
							}
						}
					}
				});
				cleanBoard(board);
				if(solutionFound){
					console.log('Player 1 win !');
					return true;
				}else{
					return false;
				}
			}
		});
	}

	function checkIfSomeoneCouldWin(){

	}

	function cleanBoard(board){
		_.forEach(board, function(c){
			c.alreadyTested = false;
		});
	}
});