var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'angular-owl-carousel-2', 'ui.bootstrap.datetimepicker', 'flash', 'ngAside']);
// $scope, $state, $users, $stateParams, $http, $timeout, $uibModal , $sce,$rootScope


app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {


  $urlRouterProvider.otherwise('/');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;

})
app.controller('main', function($scope, $http, $sce, $interval, $uibModal) {
  console.log("main loded");
  $scope.crmBannerID = 1;

  $scope.mainBannerImages = []
  $scope.bannerID = 0;
  $scope.typings = ["Online tutoring", "24x7 online help", "CBSE Preparation", "IIT JEE Preparation", "AIPMT Preparation"]
  $scope.typeIndex = 0;
  $scope.videoLink = '';

  $scope.videoLink = $sce.trustAsResourceUrl('https://www.youtube.com/embed/JC-Dpwb-Sk8');

  $interval(function() {

    $scope.typeIndex += 1;
    if ($scope.typeIndex == $scope.typings.length) {
      $scope.typeIndex = 0;
    }

  }, 5000)

  $interval(function() {
    $scope.bannerID += 1;
    if ($scope.bannerID == $scope.mainBannerImages.length) {
      $scope.bannerID = 0;
    }
  }, 2000)

  $interval(function() {
    $scope.crmBannerID += 1;
    if ($scope.crmBannerID == 12) {
      $scope.crmBannerID = 1;
    }
  }, 1000)


  $scope.onHover = function(val) {
    document.getElementById('owltext' + val).classList.add('changingFont')
    document.getElementById('owlpoint' + val).classList.add('changingColor')
  }
  $scope.offHover = function(val) {
    document.getElementById('owltext' + val).classList.remove('changingFont')
    document.getElementById('owlpoint' + val).classList.remove('changingColor')
  }

  $scope.active = null
  $scope.drop = function(val) {
    if (val == 0) {
      if ($scope.active == 0) {
        $scope.active = null
      } else {
        $scope.active = 0
      }
    } else if (val == 1) {
      if ($scope.active == 1) {
        $scope.active = null
      } else {
        $scope.active = 1
      }
    } else if (val == 2) {
      if ($scope.active == 2) {
        $scope.active = null
      } else {
        $scope.active = 2
      }

    } else {
      if ($scope.active == 3) {
        $scope.active = null
      } else {
        $scope.active = 3
      }
    }
  }

  $scope.playVideo = function() {

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.homepage.player.html',
      size: 'md',
      backdrop: true,

      controller: function($scope, $uibModalInstance) {
        $scope.close = function() {
          $uibModalInstance.dismiss('cancel');
        }
        $scope.pauseOrPlay = function(ele) {
          var video = angular.element(ele.srcElement);
          video[0].pause(); // video.play()
        }
      },
    })

  }

  $scope.signin = function() {
    console.log('-------------innnnnnnnnnnn');
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.homepage.signin.html',
      size: 'lg',
      backdrop: false,
      controller: function($scope, $uibModalInstance, $timeout, Flash) {
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
                  data: {mobile:$scope.form.number}
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
            if ($scope.form.token!=undefined) {
              var toSend = {mobile:$scope.form.number,mobileOTP:$scope.form.otp,token:$scope.form.token}
            }else {
              var toSend = {mobile:$scope.form.number,mobileOTP:$scope.form.otp}
            }
            $http({
              method: 'POST',
              url: '/registerLite',
              data: toSend
            }).
            then(function(response) {
              console.log('Registered');
              window.location.href = "/";
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


app.config(function($stateProvider) {
  $stateProvider
    .state('courses', {
      url: "/courses/:courseType",
      templateUrl: function(params) {
        return '/courses/' + params.courseType + '/';
      },
      // controller: 'controller.chapter'
    })
})
