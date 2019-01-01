

app.controller('registrationLite' , function($scope , $state , $http , $timeout , $interval){
  console.log("kkkkkkkkkkkkkkk" , );
  $scope.mode = 'main';
  $scope.autoActiveReg = autoActiveReg
  $scope.showActiveMsg = false
  console.log(mobile,'mobileeeeeeeeeeeeeeeeeeeeeeeeee');

  $scope.form = {mobile : null ,  mobileOTP: null , token: null , reg : null , agree : false};

  $scope.validityChecked = false;
  $scope.validityChecked2 = false;
    $scope.details = false
    $scope.getOTP = function() {
      if( !$scope.form.agree || $scope.form.mobile == null || $scope.form.mobile == undefined || $scope.form.mobile.length ==0 ){
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
        $scope.usernameExist = false
    }).catch(function (err) {
      $scope.mode = 'main';
      if (err.data.PARAMS == 'Username already taken') {
        $scope.usernameExist = true
      }
    })




  }

  $scope.verify = function() {
    $http({method : 'PATCH' , url : '/api/homepage/registration/' + $scope.form.reg + '/', data : $scope.form }).
    then(function(response) {
      console.log(response);
      // window.location.href = "/";
      $scope.details = true
    }, function(err) {
      console.log(err);
      if (err.status == 400) {
        $scope.validityChecked2 = true;
      }
    })
  }
  if (mobile.length>0) {
    console.log(mobile);
    $scope.form.mobile = mobile
    $scope.form.agree = true
    $scope.getOTP()
  }
  $scope.skip=function(){
    // if ($scope.autoActiveReg=='True') {
    //   $scope.showActiveMsg = false
    //   window.location.href = "/";
    // }else{
    //   $scope.showActiveMsg = true
    // }
    window.location.href = "/";
  }
  $scope.saveData=function(){
    console.log( $scope.form.reg);
    $scope.form.details='details'
    $http({method : 'POST' , url : '/api/homepage/updateInfo/', data : $scope.form }).
    then(function(response) {
      console.log(response);
      // if ($scope.autoActiveReg=='True') {
      //   $scope.showActiveMsg = false
      //   window.location.href = "/";
      // }else{
      //   $scope.showActiveMsg = true
      // }
       window.location.href = "/";
    }, function(err) {
      console.log(err);
      if (err.status == 400) {
      }
    })
  }
  $scope.continue = function () {
    window.location.href = "/";
  }
});
