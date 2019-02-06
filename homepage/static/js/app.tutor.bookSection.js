// app.controller('main', function($scope, $rootScope, $http, $timeout, $interval, $uibModal, $document) {
//
//   $scope.initiateMath = function() {
//     MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
//   }
//
//   $scope.menu = false;
//   $scope.show_menu = function() {
//     console.log('clickedddddd');
//
//     if ($scope.menu == true) {
//       $scope.menu = false;
//     } else {
//       $scope.menu = true;
//     }
//   }
//
//
//   function elementInViewport(el) {
//     var top = el.offsetTop;
//     var left = el.offsetLeft;
//     var width = el.offsetWidth;
//     var height = el.offsetHeight;
//
//     while (el.offsetParent) {
//       el = el.offsetParent;
//       top += el.offsetTop;
//       left += el.offsetLeft;
//     }
//
//     return (
//       top >= window.pageYOffset &&
//       left >= window.pageXOffset &&
//       (top + height) <= (window.pageYOffset + window.innerHeight) &&
//       (left + width) <= (window.pageXOffset + window.innerWidth)
//     );
//   }
//
//   $timeout(function() {
//     var activeElem = document.getElementById('activeli');
//     var isElementinView = elementInViewport(activeElem);
//
//     if (!isElementinView) {
//       console.log('scroll');
//       var objDiv = document.getElementById("leftSection");
//       // objDiv.scrollIntoView()
//       // objDiv.scrollTop = objDiv.scrollHeight;
//     }
//
//   }, 2000);



  // $scope.displ = false;
  // $scope.load_q = function(idx) {
  //   $scope.displ = true;
  //   $scope.idx = idx
  // }
  // $scope.toQuestion = function(id) {
  //   console.log(id);
  //   var ele = document.getElementById('q' + id)
  //   console.log(ele);
  //   console.log(ele.scrollHeight);
  //   ele.scrollIntoView();
  //   $scope.menu = false;
  // }
// })
