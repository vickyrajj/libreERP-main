var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'angular-owl-carousel-2', 'ui.bootstrap.datetimepicker', 'flash', 'ngAside']);


app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide, $locationProvider, $urlMatcherFactoryProvider) {

  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
});

app.run(['$rootScope', '$state', '$stateParams', '$http', function($rootScope, $state, $stateParams, $http) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on("$stateChangeError", console.log.bind(console));

  $rootScope.$on("$stateChangeSuccess", function(params, to, toParams, from, fromParams) {

    window.scrollTo(0, 0);

    var visitorDetails = $rootScope.getCookie("visitorDetails");
    if (visitorDetails != "") {
      var uid = JSON.parse(visitorDetails).uid
      $rootScope.visitorPk = JSON.parse(visitorDetails).visitorPk
      createActivity()
    } else {
      var uid = new Date().getTime()
      $rootScope.visitorPk;
      $http({
        method: 'POST',
        url: '/api/ERP/visitor/',
        data: {
          uid: uid
        }
      }).
      then(function(response) {
        $rootScope.visitorPk = response.data.pk;
        createActivity()
        $rootScope.setCookie("visitorDetails", JSON.stringify({
          uid: response.data.uid,
          name: "",
          email: "",
          visitorPk: $rootScope.visitorPk,
          blogSubscribed: false
        }), 365);
      })

    }

    function createActivity() {
      if ($rootScope.newTime) {
        $rootScope.timeSpentInSec = (new Date().getTime() - $rootScope.newTime) / 1000;
        console.log(from.name, $rootScope.timeSpentInSec, uid);
        toSend = {
          visitor: $rootScope.visitorPk,
          page: from.name,
          timeDuration: $rootScope.timeSpentInSec
        }
        console.log(toSend);
        $http({
          method: 'POST',
          url: '/api/ERP/activity/',
          data: toSend
        }).
        then(function(response) {
          // console.log(response.data);
        })

        $rootScope.newTime = new Date().getTime();
      } else {
        $rootScope.newTime = new Date().getTime();
      }
    }



  });
}]);


app.controller('main', function($scope, $rootScope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce, $document) {

  $scope.initiateMath = function() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }


  $scope.menu = false;
  $scope.show_menu = function() {
    console.log('clickedddddd');

    if ($scope.menu == true) {
      $scope.menu = false;
    } else {
      $scope.menu = true;
    }
  }


  function elementInViewport(el) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    while (el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
    }

    return (
      top >= window.pageYOffset &&
      left >= window.pageXOffset &&
      (top + height) <= (window.pageYOffset + window.innerHeight) &&
      (left + width) <= (window.pageXOffset + window.innerWidth)
    );
  }

  $timeout(function() {
    var activeElem = document.getElementById('activeli');
    var isElementinView = elementInViewport(activeElem);

    if (!isElementinView) {
      console.log('scroll');
      var objDiv = document.getElementById("leftSection");
      // objDiv.scrollIntoView()
      // objDiv.scrollTop = objDiv.scrollHeight;
    }

  }, 2000);


  $scope.signin = function() {
    $rootScope.$broadcast('opensignInPopup', {});
  }

  $scope.displ = false;
  $scope.load_q = function(idx) {
    $scope.displ = true;
    $scope.idx = idx
  }
  $scope.toTheTop = function(id) {
    // $document.scrollTopAnimated(0, 5000).then(function() {
    //   console && console.log('You just scrolled to the top!');
    // });
    console.log(id);
    var ele = document.getElementById('q' + id)
    console.log(ele);
    console.log(ele.scrollHeight);
    ele.scrollIntoView();
    $scope.menu = false;
  }

  // window.onscroll = function() {
  //   $scope.flybutton()
  // };
  //
  // $scope.flybutton = function() {
  //   document.getElementById("flybtn").style.display = "block";
  //   document.getElementById("flybtn1").style.display = "block";
  //   setTimeout(function() {
  //     document.getElementById("flybtn").style.display = "none";
  //     document.getElementById("flybtn1").style.display = "none";
  //   }, 1000);
  // }

})
