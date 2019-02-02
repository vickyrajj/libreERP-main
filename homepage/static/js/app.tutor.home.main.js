app.controller('main', function($scope, $http, $interval,$rootScope) {
  $scope.signin = function(loggedIn) {
    $rootScope.$broadcast('opensignInPopup', loggedIn);
  }
})
