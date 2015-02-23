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
	$scope.level = '';
	$scope.size = '';

	$scope.runGame = function(){
		$location.path('gameboard/'+$scope.vs+'/'+$scope.level+'/'+$scope.size);
	};

	$scope.$watch('vs', function(newValue, oldValue) {
		if(newValue === 'player')
			$scope.level = '-';
	});

	$scope.readyForStart = function(){
		if($scope.size !== '' && ($scope.vs === 'player' || ($scope.vs === 'ai' && $scope.level !== ''))){
			return true;
		}
		return false;
	};
});