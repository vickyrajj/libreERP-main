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
  $scope.deliveredData = []
  $scope.noDataMsg = false
  $scope.form = {name:''}
  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query + '&limit=10').
    then(function(response) {
      return response.data.results;
    })
  };
  $scope.userOrders = function(){
    if ($scope.form.name.pk) {
      return $http.get('/api/ecommerce/orderQtyMap/?orderBy=' + $scope.form.name.pk).
      then(function(response) {
        $scope.deliveredData = response.data;
        if (response.data.length==0) {
          $scope.noDataMsg = true
        }else {
          $scope.noDataMsg = false
        }
      })
    }else {
      Flash.create('warning', 'Please Select Proper User');
      return
    }
  }

})
