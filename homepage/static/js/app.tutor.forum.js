var app = angular.module('app', []);

app.controller('main', function($scope, $http, $interval, $rootScope) {
  $http({
    method: 'GET',
    url: '/api/HR/users/?mode=mySelf&format=json'
  }).
  then(function(response) {
    $scope.me = {}
    console.log('res', response.data);
    if (response.data.length == 1) {
      $scope.me = response.data[0]
    }
    $scope.call()
  })
  $scope.call =  function(){
    $http({
      method: 'GET',
      url: '/api/LMS/forumthread/?verified=1'
    }).then(function(response) {
      $scope.forumdata = response.data;
    })



  }
  $scope.val = {
    val:null,
    open:false,
  };
  $scope.open = function(val){
    $scope.val.val =  val;
    $scope.val.open = !$scope.val.open;

  }




  // $scope.createforum  = {
  //    txt:$scope.parentText,
  //    verified:false,
  //    user:'',
  // }
  //
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
