app.config(function($stateProvider) {
  $stateProvider.state('home.forum', {
    url: "/forum",
    templateUrl: '/static/ngTemplates/app.LMS.forum.html',
    controller: 'home.LMS.forum'
  });
});

app.controller("home.LMS.forum", function($scope, $state, $users, $stateParams, $http, Flash, $timeout) {
  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.forumthread.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/LMS/forumthread/',
    searchField: 'user',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }

  $scope.data1 = {
    tableData: []
  };

  views1 = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.forumcomment.item.html',
  }, ];


  $scope.config1 = {
    views: views1,
    url: '/api/LMS/forumcomment/',
    searchField: 'user',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }





})

app.controller("home.LMS.forumthread.item", function($scope, $state, $users, $stateParams, $http, Flash) {


  $scope.$watch('data.verified', function(newValue, oldValue) {
    if (newValue != null) {
      var dataToSend = {
        verified:$scope.data.verified
      }
      $http({
        method: 'PATCH',
        url: '/api/LMS/forumthread/' + $scope.data.pk + '/',
        data : dataToSend,
      }).
      then(function(response) {

      });
    }
  }, true)


  $scope.delete = function(){
    $http({method : 'DELETE' , url : '/api/LMS/forumthread/' + $scope.data.pk + '/' }).
    then(function(response){
       Flash.create('success', 'Successfully Deleted');
    })
  }



});
app.controller("home.LMS.forumcomment.item", function($scope, $state, $users, $stateParams, $http, Flash) {


  $scope.$watch('data.verified', function(newValue, oldValue) {
    if (newValue != null) {
      var dataToSend = {
        verified:$scope.data.verified
      }
      $http({
        method: 'PATCH',
        url: '/api/LMS/forumcomment/' + $scope.data.pk + '/',
        data : dataToSend,
      }).
      then(function(response) {

      });
    }
  }, true)


  $scope.delete = function(){
    $http({method : 'DELETE' , url : '/api/LMS/forumcomment/' + $scope.data.pk + '/' }).
    then(function(response){
       Flash.create('success', 'Successfully Deleted');
    })
  }



});
