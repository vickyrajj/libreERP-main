app.config(function($stateProvider ){

  $stateProvider
  .state('home', {
    url: "/home",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/home.html',
        controller:'controller.home.main'
      },
      "@home": {
        templateUrl: '/static/ngTemplates/app.home.dashboard.html',
        controller : 'controller.home'
      }
    }
  })
  .state('home.home', {
    url: "",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/home.html',
        controller:'controller.home.main'
      },
      "@home": {
        templateUrl: '/static/ngTemplates/app.home.dashboard.html',
        controller : 'controller.home'
      }
    }
  })
  .state('home.manageUsers', {
    url: "/manageUsers",
    templateUrl: '/static/ngTemplates/app.HR.manage.users.html',
    controller: 'home.manageUsers'
  })
  .state('home.settings', {
    url: "/settings",
    templateUrl: '/static/ngTemplates/app.ERP.settings.default.html',
    controller: 'home.settings'
  })



});

app.controller("controller.home.main", function($scope , $state) {
  $scope.modules = $scope.$parent.$parent.modules;
  $scope.dashboardAccess = false;
  $scope.homeMenuAccess = false;
  for (var i = 0; i < $scope.modules.length; i++) {
    if ($scope.modules[i].name == 'home'){
      $scope.dashboardAccess = true;
    }
    if ($scope.modules[i].name.indexOf('home') != -1) {
      $scope.homeMenuAccess = true;
    }
  }
})


app.controller('controller.home.menu' , function($scope ,$state, $http, $permissions){
  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      a = apps[i];
      if (a.module != 1) {
        continue;
      }

      parts = a.name.split('.');
      a.dispName = parts[parts.length-1];

      if (a.name == 'app.dashboard') {
        a.state = 'home';
      }else {
        a.state = a.name.replace('app' , 'home');
      }
      $scope.apps.push(a);
    }
  }



  as = $permissions.apps();
  if(typeof as.success == 'undefined'){
    $scope.buildMenu(as);
  } else {
    as.success(function(response){
      $scope.buildMenu(response);
    });
  };




})
