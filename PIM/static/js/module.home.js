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
  .state('home.mail', {
    url: "/mail",
    templateUrl: '/static/ngTemplates/app.mail.html',
    controller: 'controller.mail'
  })
  .state('home.social', {
    url: "/social/:id",
    templateUrl: '/static/ngTemplates/app.social.html',
    controller: 'controller.social'
  })
  .state('home.blog', {
    url: "/blog/:id?action",
    templateUrl: '/static/ngTemplates/app.home.blog.html',
    controller: 'controller.home.blog'
  })
  .state('home.calendar', {
    url: "/calendar",
    templateUrl: '/static/ngTemplates/app.home.calendar.html',
    controller: 'controller.home.calendar'
  })
  // .state('home.LMS', {
  //   url: "/LMS",
  //   views: {
  //      "": {
  //         templateUrl: '/static/ngTemplates/genericAppBase.html',
  //      },
  //      "menu@home.LMS": {
  //         templateUrl: '/static/ngTemplates/genericMenu.html',
  //         controller : 'controller.generic.menu',
  //       },
  //       "@home.LMS": {
  //         templateUrl: '/static/ngTemplates/app.LMS.default.html',
  //         // controller : 'home.LMS.default',
  //       }
  //   }
  // })
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

  // .state('home.settings', {
  //   url: "/settings",
  //   views: {
  //      "": {
  //         templateUrl: '/static/ngTemplates/app.ERP.settings.html',
  //      },
  //      "menu@home.settings": {
  //         templateUrl: '/static/ngTemplates/app.ERP.settings.menu.html',
  //         controller : 'home.settings.menu'
  //       },
  //       "@home.settings": {
  //         templateUrl: '/static/ngTemplates/app.ERP.settings.default.html',
  //       }
  //   }
  // })
  //
  // .state('home.settings.modulesAndApplications', {
  //   url: "/modulesAndApplications",
  //   templateUrl: '/static/ngTemplates/app.ERP.settings.modulesAndApps.html',
  //   controller: 'home.settings.modulesAndApps'
  // })
  // .state('home.settings.configure', {
  //   url: "/configure?app&canConfigure",
  //   templateUrl: '/static/ngTemplates/app.ERP.settings.configure.html',
  //   controller: 'home.settings.configure'
  // })

});

app.controller("controller.home.main", function($scope , $state) {
  $scope.modules = $scope.$parent.$parent.modules;
  $scope.dashboardAccess = false;
  $scope.homeMenuAccess = false;
  if ($scope.modules != undefined) {
    for (var i = 0; i < $scope.modules.length; i++) {
      if ($scope.modules[i].name == 'home'){
        $scope.dashboardAccess = true;
      }
      if ($scope.modules[i].name.indexOf('home') != -1) {
        $scope.homeMenuAccess = true;
      }
    }
  }

})


app.controller('controller.home.menu' , function($scope ,$state, $http, $permissions){
  $scope.apps = [];

  $scope.buildMenu = function(apps){
    console.log(apps);
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
