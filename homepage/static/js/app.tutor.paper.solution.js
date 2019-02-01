app.controller('main', function($scope, $http, $interval) {})



app.controller('startexam', function($scope, $http, $timeout, $interval, $uibModal) {

  $scope.initiateMath = function() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }
  
  $http({
    method: 'GET',
    url: '/api/LMS/paperhistory/?user=' + user + '&paper=' + ques,
  }).then(function(response) {
    $scope.data = response.data.length;
    $scope.paper = ques.split('-').join('')
    $scope.url = "/" + blog + "/" + $scope.paper + "/practice/";

  })

  $scope.startexam = function() {


    $uibModal.open({
      templateUrl: '/static/ngTemplates/startexam.html',
      size: 'md',
      backdrop: true,
      resolve: {
        blogobj: function() {
          return blog;
        },
        quesobj: function() {
          return ques;
        },
        user: function() {
          return user;
        },
        paper: function() {
          return paper;
        }

      },
      controller: function($scope, $uibModalInstance, blogobj, quesobj, user, paper) {

        $scope.paper = quesobj.split('-').join('')
        $scope.url = "/" + blogobj + "/" + $scope.paper + "/practice/";
        $scope.closeModal = function() {
          $uibModalInstance.close()
        }
        $scope.next = function() {
          $http({
            method: 'GET',
            url: '/api/LMS/answer/?user=' + user + '&paper=' + paper,
          }).
          then(function(response) {
            $scope.answers = []
            for (var i = 0; i < response.data.length; i++) {
              $scope.answers.push(response.data[i].pk)
            }
            for (var i = 0; i < $scope.answers.length; i++) {
              $http({
                method: 'DELETE',
                url: '/api/LMS/answer/' + $scope.answers[i] + '/'
              }).
              then(function(response) {
              })
            }
          })
        }
      },
    })

  }


});
