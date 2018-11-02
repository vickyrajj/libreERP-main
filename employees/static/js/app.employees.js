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
app.config(function($stateProvider){

  $stateProvider
  .state('workforceManagement.employees', {
    url: "/employees",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@workforceManagement.employees": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@workforceManagement.employees": {
          templateUrl: '/static/ngTemplates/app.employees.dash.html',
          // controller : 'projectManagement.LMS.default',
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



 });
