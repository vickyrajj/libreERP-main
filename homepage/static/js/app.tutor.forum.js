var app = angular.module('app', []);

app.controller('main', function($scope, $http, $interval, $rootScope) {
  $scope.me = {}
  $http({
    method: 'GET',
    url: '/api/HR/users/?mode=mySelf&format=json'
  }).
  then(function(response) {
    console.log('res', response.data);
    if (response.data.length == 1) {
      $scope.me = response.data[0]
    }
  })
  console.log($scope.me);
  $scope.forumpk = []
  $http({
    method: 'GET',
    url: '/api/LMS/forumthread/?verified=1'
  }).then(function(response) {
    $scope.forumdata = response.data;
    $scope.forumpk.push($scope.forumdata.pk)

  })


  $scope.forumcomments = []
  $http({
    method: 'GET',
    url: '/api/LMS/forumcomment/'
  }).then(function(response) {
    console.log('ressssss', response.data);
    for (var i = 0; i < response.data.length; i++) {
      if(response.data[i].parent.verified == true){
         $scope.forumcomments.push(response.data[i])
      }

      var list = $scope.forumcomments.filter(function(item) {
        if (item.parent.pk== $scope.sublist[i]) {
          return true;
        }
      })
    }
    console.log($scope.forumcomments,'comments...');

  })
  $scope.createforum  = {
     txt:$scope.parentText,
     verified:false,
     user:'',
  }

  // var fd = new FormData();
  // fd.append('tagsCSV', $scope.blogForm.tagsCSV);
  // $http({
  //   method: method,
  //   url: url,
  //   data: fd,
  //   transformRequest: angular.identity,
  //   headers: {
  //     'Content-Type': undefined
  //   }
  // }).
  // then(function(response) {
  //
  // });

})
