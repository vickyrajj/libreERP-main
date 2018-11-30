// you need to first configure the states for this app

app.config(function($stateProvider){

  $stateProvider
  .state('home.LMS', {
    url: "/LMS",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@home.LMS": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@home.LMS": {
          templateUrl: '/static/ngTemplates/app.LMS.default.html',
          // controller : 'home.LMS.default',
        }
    }
  })
});
