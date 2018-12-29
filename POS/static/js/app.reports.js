app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.reports', {
      url: "/reports",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.reports.default.html',
          controller: 'businessManagement.reports.default',
        }
      }
    })
});

app.controller("businessManagement.reports.default", function($scope, $http, Flash, $rootScope, $filter) {

  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

})
