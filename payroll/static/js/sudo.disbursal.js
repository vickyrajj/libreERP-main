app.config(function($stateProvider) {

  $stateProvider
    .state('admin.disbursal', {
      url: "/disbursal",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.disbursal.html',
          controller: 'admin.disbursal',
        }
      }
    })
});
app.controller("admin.disbursal", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
