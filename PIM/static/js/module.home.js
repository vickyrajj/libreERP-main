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



app.config(function($stateProvider) {

  $stateProvider
    .state('home', {
      url: "/home",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/home.html',
          controller: 'controller.home.main'
        },
        "@home": {
          templateUrl: '/static/ngTemplates/app.home.dashboard.html',
          controller: 'controller.home'
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
    .state('home.company', {
      url: "/company",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.company.html',
          controller: 'businessManagement.customers',
        }
      }
    })

    .state('home.qualityCheck', {
      url: "/qualityCheck",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.qualityCheck.html',
          controller: 'businessManagement.reviews',
        }
      }
    })
    .state('home.sessionHistory', {
      url: "/sessionHistory",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.sessionHistory.html',
          controller: 'businessManagement.sessionHistory',
        }
      }
    })


    .state('home.reviews', {
      url: "/reviews",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.reviews.html',
          controller: 'businessManagement.customerReviews',
        }
      }
    })

    .state('home.knowledgeBase', {
      url: "/knowledgeBase",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.knowledgeBase.html',
          controller: 'businessManagement.customerKnowledgeBase',
        }
      }
    })


    .state('home.uiSettings', {
      url: "/uiSettings",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.uiSettings.html',
          controller: 'businessManagement.customerSettings',
        }
      }
    })

    // .state('home.organization', {
    //   url: "/organization",
    //   views: {
    //      "": {
    //         templateUrl: '/static/ngTemplates/genericAppBase.html',
    //      },
    //      "menu@home.organization": {
    //         templateUrl: '/static/ngTemplates/genericMenu.html',
    //         controller : 'controller.generic.menu',
    //       },
    //       "@home.organization": {
    //         templateUrl: '/static/ngTemplates/app.organization.dash.html',
    //         controller : 'businessManagement.organization.dash',
    //       }
    //   }
    // })
    //
    // .state('home.organization.departments', {
    //   url: "/departments",
    //   views: {
    //     "": {
    //       templateUrl: '/static/ngTemplates/app.organization.departments.html',
    //       controller: 'businessManagement.organization.departments',
    //     }
    //   }
    // })
    //
    //
    // .state('home.organization.divisions', {
    //   url: "/divisions",
    //   views: {
    //     "": {
    //       templateUrl: '/static/ngTemplates/app.organization.division.html',
    //       controller: 'businessManagement.organization.division',
    //     }
    //   }
    // })
    //
    //
    // .state('home.organization.responsibilities', {
    //   url: "/responsibilities",
    //   views: {
    //     "": {
    //       templateUrl: '/static/ngTemplates/app.organization.responsibilities.html',
    //       controller: 'businessManagement.organization.responsibilities',
    //     }
    //   }
    // })
    //
    //
    // .state('home.organization.roles', {
    //   url: "/roles",
    //   views: {
    //     "": {
    //       templateUrl: '/static/ngTemplates/app.organization.roles.html',
    //       controller: 'businessManagement.organization.roles',
    //     }
    //   }
    // })
    //
    //
    // .state('home.organization.units', {
    //   url: "/units",
    //   views: {
    //     "": {
    //       templateUrl: '/static/ngTemplates/app.organization.units.html',
    //       controller: 'businessManagement.organization.units',
    //     }
    //   }
    // })


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

app.controller("module.home.settings", function($scope, $state, $http) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.settings.prescriptItems.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/ERP/service/',
    searchField: 'name',
    itemsNumPerView: [16, 32, 48],
  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'info') {
          var title = 'Prescipts : ';
          var appType = 'prescriptInfo';
        }
        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
          active: true
        })
      }
    }
  }


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


app.controller("app.settings.roles", function($scope, $state, $http ,Flash , $permissions, $timeout) {

  $scope.rolesPerm = false;

  $timeout(function () {
    $scope.rolesPerm =  $permissions.myPerms('module.roles.createDelete')
  }, 500);

  $scope.roles = []

  $scope.roleForm = {
    name: '',
    applications: []
  }

    $http({
      method: 'GET',
      url: '/api/organization/role/',
    }).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        response.data[i].display = false
        $scope.roles.push(response.data[i])
      }
    });


  $scope.editRole = function (r) {
    console.log(r,'r');
    $scope.roleForm = r
  }


  $scope.saveRole = function() {
    console.log($scope.roleForm);
    var apps = [];
    for (var i = 0; i < $scope.roleForm.applications.length; i++) {
      apps.push($scope.roleForm.applications[i].pk)
    }

    console.log(apps);

    if ($scope.roleForm.name != '' && $scope.roleForm.applications.length>0) {
      if ($scope.roleForm.pk) {
        $http({
          method: 'PATCH',
          url: '/api/organization/role/'+$scope.roleForm.pk +'/',
          data: {name: $scope.roleForm.name , applications:apps}
        }).
        then(function(response) {
          response.data.display = false
          for (var i = 0; i < $scope.roles.length; i++) {
            if ($scope.roles[i].pk == response.data.pk) {
                $scope.roles[i] = response.data
            }
          }
          $scope.roleForm = {
            name: '',
            applications: []
          }
          Flash.create('success', 'Edited Successfully')
        });
      }else {
        $http({
          method: 'POST',
          url: '/api/organization/role/',
          data: {name: $scope.roleForm.name , applications:apps}
        }).
        then(function(response) {
          console.log(response.data);
          response.data.display = false
          $scope.roles.push(response.data)
          $scope.roleForm = {
            name: '',
            applications: []
          }
          Flash.create('success', 'Created Successfully')
        });
      }
    }else {
      Flash.create('warning', 'Fields can not be empty')
    }
  }


  $scope.deleteRole = function (pk , indx) {
      $http({method : 'DELETE' , url : '/api/organization/role/' + pk +'/'}).
      then(function(response) {
        $scope.roles.splice(indx , 1);
        $scope.roleForm = {
          name: '',
          applications: []
        }

        Flash.create('success', 'Deleted Successfully')
      })
  }

  $scope.getPermissionSuggestions = function(query) {
    return $http.get('/api/ERP/applicationAdminMode/?name__contains=' + query)
  }


})



app.controller("app.settings.prescript.explore", function($scope, $state, $http ,Flash,$permissions, $timeout) {
  $scope.compDetails = $scope.tab.data

  $scope.prescripts = []

  $scope.prescriptPerm = false;

  $timeout(function () {
    $scope.prescriptPerm =  $permissions.myPerms('module.prescript.createDelete')
  }, 500);



  console.log('dddddddddd',$scope.prescriptPerm);


  $http({
    method: 'GET',
    url: '/api/support/cannedResponses/?service=' + $scope.compDetails.pk,
  }).
  then(function(response) {
    console.log(response.data);
    for (var i = 0; i < response.data.length; i++) {
      response.data[i].display = false
      $scope.prescripts.push(response.data[i])
    }
  });

  $scope.prescriptForm = {
    text: '',
    service: $scope.compDetails.pk
  }


  $scope.editPrescript = function (p) {
    $scope.prescriptForm = p
    console.log($scope.prescriptForm);
  }


  $scope.savePrescript = function() {

    if ($scope.prescriptForm.text.length>200) {
      Flash.create('warning','prescript length is too long')
      return
    }

    if ($scope.prescriptForm.text != '') {

      if ($scope.prescriptForm.pk) {
        $http({
          method: 'PATCH',
          url: '/api/support/cannedResponses/'+$scope.prescriptForm.pk +'/',
          data: {text:$scope.prescriptForm.text}
        }).
        then(function(response) {
          console.log(response.data);
          response.data.display = false
          for (var i = 0; i < $scope.prescripts.length; i++) {
            if ($scope.prescripts[i].pk == response.data.pk) {
                $scope.prescripts[i] = response.data
            }
          }
          $scope.prescriptForm = {
            text: '',
            service: $scope.compDetails.pk
          }
          Flash.create('success', 'Edited Successfully')
        });
      }else {
        $http({
          method: 'POST',
          url: '/api/support/cannedResponses/',
          data: $scope.prescriptForm
        }).
        then(function(response) {
          console.log(response.data);
          response.data.display = false
          $scope.prescripts.push(response.data)
          $scope.prescriptForm = {
            text: '',
            service: $scope.compDetails.pk
          }
          Flash.create('success', 'Created Successfully')
        });
      }
    }else {
      Flash.create('warning', 'Prescipt can not be empty')
    }
  }


  $scope.deletePrescript = function (pk , indx) {
      $http({method : 'DELETE' , url : '/api/support/cannedResponses/' + pk +'/'}).
      then(function(response) {
        $scope.prescripts.splice(indx , 1);
        $scope.prescriptForm = {
          text: '',
          service: $scope.compDetails.pk
        }
        Flash.create('success', 'Deleted Successfully')
      })
  }



})

app.controller("controller.home", function($scope, $state, $http) {

})

app.controller("controller.home.main", function($scope, $state, $http , $permissions , $timeout) {
  $scope.sai = 'kiran'

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

  $scope.fetchGraphData = function () {
    if ($scope.isCustomer) {
      $http({
        method: 'GET',
        url: '/api/support/reviewHomeCal/?customer&customerProfilePkList',
      }).
      then(function(response) {
        console.log(response.data);
        if (response.data.length > 0) {
          id = response.data[0]
        } else {
          id = 0
        }
        // $http({
        //   method: 'GET',
        //   url:  '/api/support/customerProfile/'+response.data[0]+'/',
        // }).
        // then(function(response) {
        //   console.log(response.data);
        //   $scope.cpForm = response.data
        // });
        console.log(id, 'customer');
        $http({
          method: 'GET',
          url: '/api/support/gethomeCal/?perticularUser=' + id,
        }).
        then(function(response) {
          console.log(response.data, 'dddddddddddd', typeof response.data);
          $scope.totalChats = response.data.totalChats
          $scope.missedChats = response.data.missedChats
          $scope.agentChatCount = response.data.agentChatCount
          $scope.barData = response.data.graphData

          $scope.barlabels = response.data.graphLabels
          console.log($scope.barData);
          console.log($scope.barlabels);
          $scope.avgChatDuration = response.data.avgChatDuration
          $scope.firstResTimeAvgAll = response.data.firstResTimeAvgAll
          $scope.avgRatingAll = response.data.avgRatingAll
          $scope.avgRespTimeAll = response.data.avgRespTimeAll
          $scope.changeInChat = response.data.changeInData.changeInChat
          $scope.changeInMissedChat = response.data.changeInData.changeInMissedChat
          $scope.changeInAvgChatDur = response.data.changeInData.changeInAvgChatDur
          $scope.changeInFrtAvg = response.data.changeInData.changeInFrtAvg
          $scope.changeInRespTimeAvg = response.data.changeInData.changeInRespTimeAvg

        });
      });

    }else {
      $http({
        method: 'GET',
        url: '/api/support/gethomeCal/',
      }).
      then(function(response) {
        console.log('adminnnnnnnnnnnnnnn');
        $scope.totalChats = response.data.totalChats
        $scope.missedChats = response.data.missedChats
        $scope.agentChatCount = response.data.agentChatCount
        $scope.barData = response.data.graphData
        $scope.barlabels = response.data.graphLabels
        console.log($scope.barData);
        console.log($scope.barlabels);
        $scope.avgChatDuration = response.data.avgChatDuration
        $scope.agentLeaderBoard = response.data.agentLeaderBoard
        $scope.avgRatingAll = response.data.avgRatingAll
        $scope.avgRespTimeAll = response.data.avgRespTimeAll
        $scope.firstResTimeAvgAll = response.data.firstResTimeAvgAll
        $scope.changeInChat = response.data.changeInData.changeInChat
        $scope.changeInMissedChat = response.data.changeInData.changeInMissedChat
        $scope.changeInAvgChatDur = response.data.changeInData.changeInAvgChatDur

      });
    }
  }

  $scope.isCustomer = false;


  $timeout(function() {
    $scope.isCustomer = $permissions.myPerms('app.customer.access')
    $scope.fetchGraphData();

  },500)









  $scope.modules = $scope.$parent.$parent.modules;
  $scope.dashboardAccess = false;
  $scope.homeMenuAccess = false;
  for (var i = 0; i < $scope.modules.length; i++) {
    if ($scope.modules[i].name == 'home') {
      $scope.dashboardAccess = true;
    }
    if ($scope.modules[i].name.indexOf('home') != -1) {
      $scope.homeMenuAccess = true;
    }
  }
})


app.controller('controller.home.menu', function($scope, $state, $http, $permissions) {
  $scope.apps = [];

  $scope.buildMenu = function(apps) {
    for (var i = 0; i < apps.length; i++) {
      a = apps[i];
      if (a.module != 1) {
        continue;
      }

      parts = a.name.split('.');
      a.dispName = parts[parts.length - 1];

      if (a.name == 'app.dashboard') {
        a.state = 'home';
      } else {
        a.state = a.name.replace('app', 'home');
      }
      $scope.apps.push(a);
    }
  }



  as = $permissions.apps();
  if (typeof as.success == 'undefined') {
    $scope.buildMenu(as);
  } else {
    as.success(function(response) {
      $scope.buildMenu(response);
    });
  };




})
