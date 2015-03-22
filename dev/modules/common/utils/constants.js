/**
* Useful constants for the hex7 program
**/
angular.module("hex7.constants",[])
.constant('gameConstants',{
	'state':{//State available : 
		'default':'default', //Box empty
		'player1':'blue', //Box play by the player 1 (blue)
		'player2':'red'//Box play by the player 2 (red)
	},
	'case':{//One box
		x: 0,//x (x coordinate of the box)
		y: 0,//y (y coordinate of the box)
		state:"default",//could be default, blue, or red. By default box empty ('default' : nobody played on it). Change when a player play on it

		//Style data
		posx:0,//css x coordinate position
		posy:0,//css y coordinate position
		playerSide:'',//To indicate to the user his side. For the blue player all top and bottom pieces are by default light blue.
		selected:false,//when a real player play to define which box he selects before play on it if necessary

		//Algorithms data
		alreadyTested:false,//(rulesService) variable necessary for the verification if someone win algorithm, to define if we have alreday tested this box
		aiVirtualPiece:false//(aiService) variable necessary for the ai algorithm to define if the piece is a virtualPiece 'imagine' by the AI
	},
	//Other style constants
	"xposFactor":33,
	"yposFactor":28,
	"posLineDecalFactor":17
});