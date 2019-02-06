var app = angular.module('app', [ 'ui.bootstrap',]);
console.log('ininnnnnnnnnnnnnnnnnn jsssssssssssss');
app.controller('main', function($scope, $http, $interval,$rootScope) {
  console.log('in mainnnn');
  $scope.signin = function(loggedIn) {
    $rootScope.$broadcast('opensignInPopup', loggedIn);
  }
})

app.controller('startexam', function($scope, $http, $timeout, $interval, $uibModal) {
console.log('innnnnnnnnnnn cooooooonttttttttttooo');
  $scope.initiateMath = function() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }
  console.log(user,ques,paper);
  $http({
    method: 'GET',
    url: '/api/LMS/paperhistory/?user=' + user + '&paper=' + paper,
  }).then(function(response) {
    console.log(response.data);
    $scope.data = response.data.length;
    $scope.paper = ques.split('-').join('')
    $scope.url = "/" + blog + "/" + $scope.paper + "/practice/";

  })

  $scope.startexam = function() {
    if ($scope.data==0) {
      $http({
        method: 'GET',
        url: '/api/LMS/answer/?user=' + user + '&paper=' + paper+'&deleteAll',
      }).
      then(function(response) {
        console.log(response.data);
        window.location.href = $scope.url
      })
    }



    $uibModal.open({
      templateUrl: '/static/ngTemplates/startexam.html',
      size: 'md',
      backdrop: true,
      resolve: {
        url: function() {
          return $scope.url;
        }

      },
      controller: function($scope, $uibModalInstance, url) {
        $scope.url = url
        $scope.closeModal = function() {
          $uibModalInstance.close()
        }

        $scope.next = function() {
          $http({
            method: 'GET',
            url: '/api/LMS/answer/?user=' + user + '&paper=' + paper+'&deleteAll',
          }).
          then(function(response) {
            console.log(response.data);
            window.location.href = $scope.url
          })
        }
      },
    })

  }


});
