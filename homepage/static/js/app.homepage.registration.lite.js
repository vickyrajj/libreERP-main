

app.controller('registrationLite' , function($scope , $state , $http , $timeout , $interval){
  console.log("kkkkkkkkkkkkkkk" , );
  $scope.mode = 'main';

  $scope.form = {mobile : null ,  mobileOTP: null , token: null , reg : null , agree : false};

  $scope.validityChecked = false;
  $scope.validityChecked2 = false;
    $scope.getOTP = function() {
      if( !$scope.form.agree || $scope.form.mobile == undefined || $scope.form.mobile == null || $scope.form.mobile.length ==0 ){
          $scope.validityChecked = true;
          return;
      }

      var toSend= {
        mobile : $scope.form.mobile,
      }
      $scope.mode = 'sendingOTP';
      $http({method : 'POST' , url : '/api/homepage/registration/' , data : toSend}).
      then(function(response) {
        $scope.form.token = response.data.token;
        $scope.form.reg = response.data.pk;
        $scope.mode = 'verify';
    })
  }

  $scope.verify = function() {
    console.log($scope.form,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');

    $http({method : 'PATCH' , url : '/api/homepage/registration/' + $scope.form.reg + '/', data : $scope.form }).
    then(function(response) {
      console.log(response);
      window.location.href = "/";
    }, function(err) {
      console.log(err);
      if (err.status == 400) {
        $scope.validityChecked2 = true;
      }
    })
  }
});

