angular.module("hex7.constants",[])
.constant('gameConstants',{
	'state':{
		'default':'default',
		'player1':'blue',
		'player2':'red'
	},
	'case':{
		x: 0,//x
		y: 0,//y
		posx:0,//css x position
		posy:0,//css y position
		state:"default",//state : default, player1, player2
		selected:false,
		alreadyTested:false,
		playerSide:'',
		aiVirtualPiece:false
	},
	"xposFactor":33,
	"yposFactor":28,
	"posLineDecalFactor":17
});