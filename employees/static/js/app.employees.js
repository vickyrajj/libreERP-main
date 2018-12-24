// app.config(function($stateProvider) {
//
//   $stateProvider
//     .state('workforceManagement.employees', {
//       url: "/employees",
//       views: {
//         "": {
//           templateUrl: '/static/ngTemplates/app.employees.dash.html',
//           controller: 'workforceManagement.employees',
//         }
//       }
//     })
// });
// app.controller("workforceManagement.employees", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
// });
app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.employees', {
      url: "/employees",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
        },
        "menu@workforceManagement.employees": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller: 'controller.generic.menu',
        },
        "@workforceManagement.employees": {
          templateUrl: '/static/ngTemplates/app.employees.dash.html',
          controller: 'workforceManagement.employees',
        }
      }
    })
    .state('workforceManagement.employees.Attendance', {
      url: "/Attendance",
      templateUrl: '/static/ngTemplates/app.employees.Attendance.html',
      controller: 'workforceManagement.employees.Attendance'
    })

});
app.controller("workforceManagement.employees", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  $scope.data = [300, 500, 100];
  $scope.labels1 = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  $scope.data1 = [300, 500, 100];
  $scope.labels2 = ["Download Sales", "In-Store Sales"];
  $scope.data2 = [300, 500];

  $scope.barlabels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  $scope.barseries = ['Series A', 'Series B'];

  $scope.bardata = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.barlabels1 = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  $scope.barseries1 = ['Series A', 'Series B'];

  $scope.bardata1 = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.barlabels2 = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  $scope.barseries2 = ['Series A', 'Series B'];

  $scope.bardata2 = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];

  $scope.linelabels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.lineseries = ['Series A', 'Series B'];
  $scope.linedata = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.lineonClick = function(points, evt) {
    console.log(points, evt);
  };
  $scope.linedatasetOverride = [{
    yAxisID: 'y-axis-1'
  }, {
    yAxisID: 'y-axis-2'
  }];
  $scope.lineoptions = {
    scales: {
      yAxes: [{
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        },
        {
          id: 'y-axis-2',
          type: 'linear',
          display: true,
          position: 'right'
        }
      ]
    }
  };

  $scope.linelabels1 = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.lineseries1 = ['Series A', 'Series B'];
  $scope.linedata1 = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.lineonClick1 = function(points, evt) {
    console.log(points, evt);
  };
  $scope.linedatasetOverride1 = [{
    yAxisID: 'y-axis-1'
  }, {
    yAxisID: 'y-axis-2'
  }];
  $scope.lineoptions1 = {
    scales: {
      yAxes: [{
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        },
        {
          id: 'y-axis-2',
          type: 'linear',
          display: true,
          position: 'right'
        }
      ]
    }
  };

  $scope.linelabels2 = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.lineseries2 = ['Series A', 'Series B'];
  $scope.linedata2 = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.lineonClick2 = function(points, evt) {
    console.log(points, evt);
  };
  $scope.linedatasetOverride2 = [{
    yAxisID: 'y-axis-1'
  }, {
    yAxisID: 'y-axis-2'
  }];
  $scope.lineoptions2 = {
    scales: {
      yAxes: [{
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        },
        {
          id: 'y-axis-2',
          type: 'linear',
          display: true,
          position: 'right'
        }
      ]
    }
  };

});
