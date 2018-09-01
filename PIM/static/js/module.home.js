// app.config(function($stateProvider ){
//
//   $stateProvider
//   .state('home', {
//     url: "/home",
//     views: {
//       "": {
//         templateUrl: '/static/ngTemplates/home.html',
//         controller:'controller.home.main'
//       },
//       "@home": {
//         templateUrl: '/static/ngTemplates/app.home.dashboard.html',
//         controller : 'controller.home'
//       }
//     }
//   })
//   .state('home.mail', {
//     url: "/mail",
//     templateUrl: '/static/ngTemplates/app.mail.html',
//     controller: 'controller.mail'
//   })
//   .state('home.social', {
//     url: "/social/:id",
//     templateUrl: '/static/ngTemplates/app.social.html',
//     controller: 'controller.social'
//   })
//   .state('home.blog', {
//     url: "/blog/:id?action",
//     templateUrl: '/static/ngTemplates/app.home.blog.html',
//     controller: 'controller.home.blog'
//   })
//   .state('home.calendar', {
//     url: "/calendar",
//     templateUrl: '/static/ngTemplates/app.home.calendar.html',
//     controller: 'controller.home.calendar'
//   })
//   .state('home.notes', {
//     url: "/notes",
//     templateUrl: '/static/ngTemplates/app.home.notes.html',
//     controller: 'controller.home.notes'
//   })
//   .state('home.profile', {
//     url: "/profile",
//     templateUrl: '/static/ngTemplates/app.home.profile.html',
//     controller: 'controller.home.profile'
//   })
//   .state('home.myWork', {
//     url: "/myWork",
//     templateUrl: '/static/ngTemplates/app.home.myWork.html',
//     controller: 'controller.home.myWork'
//   })
//
//
// });



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
  // .state('home.mail', {
  //   url: "/mail",
  //   templateUrl: '/static/ngTemplates/app.mail.html',
  //   controller: 'controller.mail'
  // })
  // .state('home.social', {
  //   url: "/social/:id",
  //   templateUrl: '/static/ngTemplates/app.social.html',
  //   controller: 'controller.social'
  // })
  // .state('home.blog', {
  //   url: "/blog/:id?action",
  //   templateUrl: '/static/ngTemplates/app.home.blog.html',
  //   controller: 'controller.home.blog'
  // })
  // .state('home.calendar', {
  //   url: "/calendar",
  //   templateUrl: '/static/ngTemplates/app.home.calendar.html',
  //   controller: 'controller.home.calendar'
  // })
  // .state('home.notes', {
  //   url: "/notes",
  //   templateUrl: '/static/ngTemplates/app.home.notes.html',
  //   controller: 'controller.home.notes'
  // })
  // .state('home.profile', {
  //   url: "/profile",
  //   templateUrl: '/static/ngTemplates/app.home.profile.html',
  //   controller: 'controller.home.profile'
  // })
  // .state('home.myWork', {
  //   url: "/myWork",
  //   templateUrl: '/static/ngTemplates/app.home.myWork.html',
  //   controller: 'controller.home.myWork'
  // })

  .state('home.manageUsers', {
    url: "/manageUsers",
    templateUrl: '/static/ngTemplates/app.HR.manage.users.html',
    controller: 'admin.manageUsers'
  })
  .state('home.settings', {
    url: "/settings",
    templateUrl: '/static/ngTemplates/app.home.settings.html',
    controller: 'module.home.settings'
  })

  // .state('home.settings', {
  //   url: "/settings",
  //   views: {
  //      "": {
  //         templateUrl: '/static/ngTemplates/app.ERP.settings.html',
  //      },
  //      "menu@home.settings": {
  //         templateUrl: '/static/ngTemplates/app.ERP.settings.menu.html',
  //         controller : 'admin.settings.menu'
  //       },
  //       "@home.settings": {
  //         templateUrl: '/static/ngTemplates/app.ERP.settings.default.html',
  //       }
  //   }
  // })
  // .state('home.settings.modulesAndApplications', {
  //   url: "/modulesAndApplications",
  //   templateUrl: '/static/ngTemplates/app.ERP.settings.modulesAndApps.html',
  //   controller: 'admin.settings.modulesAndApps'
  // })
  // .state('home.settings.configure', {
  //   url: "/configure?app&canConfigure",
  //   templateUrl: '/static/ngTemplates/app.ERP.settings.configure.html',
  //   controller: 'admin.settings.configure'
  // })

  .state('home.support', {
    url: "/support",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.support.html',
        controller: 'businessManagement.support',
      }
    }
  })
  .state('home.customers', {
    url: "/customers",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.customers.html',
        controller: 'businessManagement.customers',
      }
    }
  })

  .state('home.reviews', {
    url: "/reviews",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.reviews.html',
        controller: 'businessManagement.reviews',
      }
    }
  })


  // .state('home.employees', {
  //   url: "/employees",
  //   views: {
  //      "": {
  //         templateUrl: '/static/ngTemplates/genericAppBase.html',
  //      },
  //      "menu@home.employees": {
  //         templateUrl: '/static/ngTemplates/genericMenu.html',
  //         controller : 'controller.generic.menu',
  //       },
  //       "@home.employees": {
  //         templateUrl: '/static/ngTemplates/app.employees.dash.html',
  //         // controller : 'projectManagement.LMS.default',
  //       }
  //   }
  // })
  // .state('home.employees.orgChart', {
  //   url: "/orgChart",
  //   templateUrl: '/static/ngTemplates/app.employees.orgChart.html',
  //   controller: 'businessManagement.employees.orgChart'
  // })
  // .state('home.employees.list', {
  //   url: "/list",
  //   templateUrl: '/static/ngTemplates/app.employees.list.html',
  //   controller: 'businessManagement.employees.list'
  // })
  // .state('home.employees.myCircle', {
  //   url: "/myCircle",
  //   templateUrl: '/static/ngTemplates/app.employees.myCircle.html',
  //   controller: 'businessManagement.employees.myCircle'
  // })
  // .state('home.employees.exitManagement', {
  //   url: "/exitManagement",
  //   views: {
  //     "": {
  //       templateUrl: '/static/ngTemplates/app.employees.exitManagement.html',
  //       controller: 'businessManagement.exitManagement',
  //     }
  //   }
  // })
  // .state('home.employees.approvals', {
  //   url: "/approvals",
  //   templateUrl: '/static/ngTemplates/app.employees.approvals.html',
  //   controller: 'businessManagement.employees.approvals'
  // })






});

app.controller("module.home.settings", function($scope , $state,$http) {
  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }
})

app.controller("module.home.settings.prescripts", function($scope , $state,$http) {

})

app.controller("module.home.settings.roles", function($scope , $state,$http) {

})

app.controller("controller.home", function($scope , $state,$http) {

})

app.controller("controller.home.main", function($scope , $state,$http) {
  $scope.sai='kiran'

  $scope.barlabels = [];
  $scope.series = ['Series A', 'Series B'];

  $scope.barData = [];
  // $scope.colours = ['#72C02C', '#3498DB'];
  $scope.sharesOptions = {
    scales: {
      xAxes: [{
        stacked: true,
      }],
      yAxes: [{
        stacked: true
      }]
    }
  };

  $scope.barColours = [{
    backgroundColor: "red",
    borderColor: "red"
  }, {
    backgroundColor: "white",
    borderColor: "white"
  }];


  $http({
    method: 'GET',
    url: '/api/support/gethomeCal/',
  }).
  then(function(response) {
    $scope.totalChats = response.data.totalChats
    $scope.missedChats = response.data.missedChats
    $scope.agentChatCount = response.data.agentChatCount
    $scope.barData = response.data.graphData
    console.log($scope.barData);
    $scope.barlabels = response.data.graphLabels
    console.log($scope.barlabels);
    $scope.avgChatDuration = response.data.avgChatDuration
    $scope.agentLeaderBoard = response.data.agentLeaderBoard
    $scope.avgRatingAll = response.data.avgRatingAll
    $scope.avgRespTimeAll = response.data.avgRespTimeAll
    $scope.firstResTimeAvgAll = response.data.firstResTimeAvgAll
    $scope.changeInChat = response.data.changeInChat
    console.log($scope.agentLeaderBoard);
  });

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
