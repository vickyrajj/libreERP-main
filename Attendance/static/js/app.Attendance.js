// you need to first configure the states for this app
app.config(function($stateProvider){

  $stateProvider
  .state('projectManagement.Attendance', {
    url: "/Attendance",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@projectManagement.Attendance": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@projectManagement.Attendance": {
          templateUrl: '/static/ngTemplates/app.Attendance.default.html',
        }
    }
  })

  .state('projectManagement.Attendance.Calendar', {
  url: "/Calendar",
  templateUrl: '/static/ngTemplates/app.Attendance.Calendar.html',
  controller: 'projectManagement.Attendance.Calendar'
})

});
