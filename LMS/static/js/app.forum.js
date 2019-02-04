app.config(function($stateProvider) {
  $stateProvider.state('home.forum', {
    url: "/forum",
    templateUrl: '/static/ngTemplates/app.LMS.forum.html',
    controller: 'home.LMS.forum'
  });
});

app.controller('home.LMS.forum', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
      
})
