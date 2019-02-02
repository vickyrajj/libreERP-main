app.controller('main', function($scope, $rootScope, $http, $timeout, $interval, $uibModal, $document) {

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


  $scope.signin = function(loggedIn) {
    $rootScope.$broadcast('opensignInPopup', loggedIn);
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
