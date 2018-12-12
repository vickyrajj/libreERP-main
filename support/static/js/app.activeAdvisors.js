app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.activeAdvisors', {
    url: "/activeAdvisors",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.activeAdvisors.html',
        controller: 'businessManagement.activeAdvisors',
      }
    }
  })
});

app.controller("businessManagement.activeAdvisors", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope,$window) {

  console.log($scope.data, 'entireeeeeeeeeeeeee');
  $scope.onlineAgents = []
  $scope.offlineAgents = []
  $http({
    method: 'GET',
    url: '/api/support/getMyUser/?allAgents',
  }).
  then(function(response) {
    
    console.log(response.data.allAgents, '@@@@@@@@@@@@@@@@@@@@@');
    $scope.allAgents = response.data.allAgents
    for (var i = 0; i < $scope.allAgents.length; i++) {
      connection.session.call('service.support.heartbeat.' + $scope.allAgents[i], []).
      then((function(i) {
        return function(res) {
          console.log('online', i);
          $scope.onlineAgents.push($scope.allAgents[i])
          console.log($scope.onlineAgents);
        }
      })(i), (function(i) {
        return function(err) {
          console.log(err, 'offline agents');
          $scope.offlineAgents.push($scope.allAgents[i])
        }
      })(i))
    }
  });

});
