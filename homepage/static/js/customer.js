var app = angular.module("customerApp", []);
app.controller("cutomerController", function($scope , $http ) {


  console.log('cominggggggggggg');
  $scope.displayReview = false;



  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

  $scope.review = function () {
    console.log('in review function');
    $scope.displayReview = true;

    $scope.addTab({
      title: 'some',
      cancel: true,
      app: appType,
      data: $scope.data.tableData[i],
      active: true
    })




    $http({
      method: 'GET',
      url:  '/api/support/reviewHomeCal/',
    }).
    then(function(response) {
      // $scope.custDetails = response.data[0]
      console.log(response.data);
      $scope.reviewData = response.data[0]
      // $scope.reviewData = $scope.reviewData[0]
      console.log($scope.reviewData);
    });




  }
  //
  //
  // console.log('hello');



});
