
app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.deliveryCenter', {
      url: "/deliveryCenter",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',

        },
        "menu@businessManagement.deliveryCenter": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller: 'controller.generic.menu',
        },
        "@businessManagement.deliveryCenter": {
          templateUrl: '/static/ngTemplates/app.deliveryCenter.default.html',
          controller: 'businessManagement.deliveryCenter.default',
        }
      }
    })
});

app.controller("businessManagement.deliveryCenter.default", function($scope, $http, Flash, $rootScope, $filter) {
  console.log('In Default Delivery Center Controller');
})
