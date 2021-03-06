angular.module('hex7.home',[
	"ngRoute"
])
.config(function ($routeProvider,$locationProvider){
    $routeProvider.when("/",{
        controller: 'homeCtrl',
        templateUrl: "home.html"
    });
})
.controller('homeCtrl', function($scope, $location){
	$scope.vs = '';
	$scope.levelai1 = '';
	$scope.levelai2 = '';
	$scope.size = '';

	$scope.runGame = function(){
		$location.path('gameboard/'+$scope.vs+'/'+$scope.levelai1+'/'+$scope.levelai2+'/'+$scope.size);
	};

	$scope.$watch('vs', function(newValue, oldValue) {
		if(newValue === 'playerplayer'){
			$scope.levelai1 = '-';
			$scope.levelai2 = '-';
		}else if(newValue === 'playerai'){
			$scope.levelai2 = '-';
		}
	});

	$scope.readyForStart = function(){
		if($scope.size !== ''){
			if($scope.vs === 'playerplayer'){
				return true;
			}else if($scope.vs === 'playerai'){
				if($scope.levelai1 !== ''){
					return true;
				}else{
					return false;
				}
			}else if($scope.vs === 'aiai'){
				if($scope.levelai1 !== ''){
					if($scope.levelai2 !== ''){
						return true;
					}else{
						return false;
					}
				}else{
					return false;
				}
			}
		}
		return false;
	};
});