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
	$scope.level = '';
	$scope.size = '';

	$scope.runGame = function(){
		$location.path('gameboard/'+$scope.level+'/'+$scope.size);
	};
});