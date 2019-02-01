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

  $http({
    method: 'GET',
    url: '/api/support/getMyUser/?allAgents',
  }).
  then(function(response) {
    console.log(response.data.allAgents, '@@@@@@@@@@@@@@@@@@@@@');
    $scope.allAgents = response.data.allAgents
    setTimeout(function () {
      refetchAll()
    }, 2000);
  });


  setInterval(function () {
    refetchAll()
  }, 15000);


  function refetchAll(){
    $scope.onlineAgents = []
    $scope.offlineAgents = []
    for (var i = 0; i < $scope.allAgents.length; i++) {
      connection.session.call(wamp_prefix+'service.support.hhhhh.' + $scope.allAgents[i], []).
      then((function(i) {
        return function(res) {
          let pushData={
            pk:res.pk,
            activeUsers:res.ActiveUsers.length,
            activeSince:Math.round((Date.now()-res.activeTime)/60000)
          }
          $scope.onlineAgents.push(pushData)
          console.log($scope.onlineAgents);
        }
      })(i), (function(i) {
        return function(err) {
          $scope.offlineAgents.push($scope.allAgents[i])
        }
      })(i))
    }
  }

});
