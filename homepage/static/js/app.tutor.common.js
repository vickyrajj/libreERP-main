var app = angular.module('app', ['ui.bootstrap']);


app.config(function( $httpProvider, $provide) {

  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
});
app.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});
app.run(['$rootScope', '$http', '$uibModal', function($rootScope, $http, $uibModal) {
  $rootScope.$on('opensignInPopup', function(args,loggedIn) {
    console.log(args);
    console.log(loggedIn);

    if (loggedIn) {
      window.location.href='/account/'
    }else {
      $uibModal.open({
        templateUrl: '/static/ngTemplates/app.homepage.signin.html',
        size: 'lg',
        backdrop: false,
        controller: function($scope, $uibModalInstance, $timeout) {
          $scope.form = {
            number: '',
            otp: '',
            otpmode: false,
            errorMessage: '',
            errorType: 'default'
          }
          $scope.loginFunction = function() {
            console.log($scope.form);
            if (!$scope.form.otpmode) {
              if ($scope.form.number.length != 10) {
                $scope.form.errorMessage = 'Enter Valid Mobile Number'
                $scope.form.errorType = 'danger'
                return
              } else {
                $scope.form.errorMessage = ''
                $scope.form.errorType = 'default'
              }
              $http({
                method: 'POST',
                url: '/generateOTP',
                data: {
                  'id': $scope.form.number
                }
              }).
              then(function(response) {
                console.log(response.data);
                $scope.form.otpmode = true
              }, function(err) {
                if (err.status == 404) {
                  $http({
                    method: 'POST',
                    url: '/api/homepage/registration/',
                    data: {
                      mobile: $scope.form.number
                    }
                  }).
                  then(function(response) {
                    console.log(response.data);
                    $scope.form.errorMessage = 'You Have No Account , We Are Creating New Account For You'
                    $scope.form.errorType = 'warning'
                    $scope.form.otpmode = true
                    $scope.form.token = response.data.token
                  }).catch(function(err) {
                    $scope.form.errorMessage = 'Invalid Data'
                    $scope.form.errorType = 'danger'
                  })
                } else if (err.status == 400) {
                  $scope.form.errorMessage = 'No Account'
                  $scope.form.errorType = 'danger'
                } else if (err.status == 500) {
                  $scope.form.errorMessage = 'Error While Sending OTP'
                  $scope.form.errorType = 'danger'
                }
              });
            } else {
              console.log('enter otp mode');
              if ($scope.form.token != undefined) {
                var toSend = {
                  mobile: $scope.form.number,
                  mobileOTP: $scope.form.otp,
                  token: $scope.form.token
                }
              } else {
                var toSend = {
                  mobile: $scope.form.number,
                  mobileOTP: $scope.form.otp
                }
              }
              $http({
                method: 'POST',
                url: '/registerLite',
                data: toSend
              }).
              then(function(response) {
                console.log('Registered');
                window.location.reload(true);
              })
            }
          }
          $scope.close = function() {
            $uibModalInstance.dismiss('cancel');
          }

          $scope.slideDown = function() {
            $timeout(function() {
              console.log("sliding down");
              var element = document.getElementsByClassName('signup_modal');
              element[0].scrollIntoView({
                block: "end"
              });
            }, 1000)
          }

        },
      })

    }


  });

}]);
