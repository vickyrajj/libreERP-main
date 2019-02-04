app.controller('users.forum', function($scope,$http ) {

  $http({
    method: 'GET',
    url: '/api/LMS/forumthread/?verified=1'
  }).then(function(response) {
      console.log('res', response.data);
      $scope.forumdata = response.data;

    })


})
