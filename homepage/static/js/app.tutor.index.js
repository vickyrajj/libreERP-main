app.controller('main', function($scope, $http, $interval,$uibModal,$rootScope) {
  $scope.device = {
    name:''
  }
  function lgDevice(x) {
    if (x.matches) {
      $scope.device.name = 'large'
    }
  }

  function smDevice(x) {
    if (x.matches) {
      $scope.device.name = 'small'
    }
  }

  var sm = window.matchMedia("(max-width: 600px)")
  smDevice(sm) // Call listener function at run time
  sm.addListener(smDevice) // Attach listener function on state changes

  var lg = window.matchMedia("(min-width: 600px)")
  lgDevice(lg)
  lg.addListener(lgDevice)
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

  $scope.signin = function(loggedIn) {
      $rootScope.$broadcast('opensignInPopup', loggedIn);

  }
})
