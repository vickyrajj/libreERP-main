var app = angular.module("customerApp", ['ui.bootstrap']);
app.controller("cutomerController", function($scope , $http ) {


  console.log('cominggggggggggg');
  $scope.displayReview = false;
  $scope.reviewData = []

  $scope.data = {
    tableData: []
  };




  $scope.review = function () {
    console.log('in review function');
    $scope.displayReview = true;


    $http({
      method: 'GET',
      url:  '/api/support/reviewHomeCal/?customer',
    }).
    then(function(response) {
      // $scope.custDetails = response.data[0]
      console.log(response.data);
      $scope.reviewData = response.data
      // $scope.reviewData = $scope.reviewData[0]
      console.log($scope.reviewData);
    });


    $scope.tableAction = function(target) {
      // console.log(target, action, mode);
      console.log($scope.reviewData[target]);
      var appType = 'Info';
      $scope.addTab({
        title: 'Chat : ' + $scope.reviewData[target][0].uid,
        cancel: true,
        app: 'ChatInfo',
        data: $scope.reviewData[target],
        active: true
      })

    }

    $scope.tabs = [];
    $scope.searchTabActive = true;

    $scope.closeTab = function(index) {
      $scope.tabs.splice(index, 1)
    }

    $scope.addTab = function(input) {
      // console.log(JSON.stringify(input));
      $scope.searchTabActive = false;
      alreadyOpen = false;
      for (var i = 0; i < $scope.tabs.length; i++) {
        console.log($scope.tabs[i].data[0].id,input.data[0].id, $scope.tabs[i].app ,input.app);
        if ($scope.tabs[i].data[0].id == input.data[0].id && $scope.tabs[i].app == input.app) {
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














    // $scope.tabs = [];
    // $scope.searchTabActive = true;
    //
    // $scope.addTab = function(input) {
    //   console.log(JSON.stringify(input));
    //   $scope.searchTabActive = false;
    //   alreadyOpen = false;
    //   for (var i = 0; i < $scope.tabs.length; i++) {
    //     if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
    //       $scope.tabs[i].active = true;
    //       alreadyOpen = true;
    //     } else {
    //       $scope.tabs[i].active = false;
    //     }
    //   }
    //   if (!alreadyOpen) {
    //     $scope.tabs.push(input)
    //   }
    // }
    //
    // $scope.closeTab = function(index) {
    //   $scope.tabs.splice(index, 1)
    // }
    //
    // $scope.explore = function(indx) {
    //   console.log(indx);
    //   $scope.addTab({
    //     title: 'some',
    //     cancel: true,
    //     app: 'explore',
    //     data: $scope.reviewData[indx],
    //     active: true
    //   })
    // }
  }
  //
  //
  // console.log('hello');
});

app.controller("app.customer.reviews.explore", function($scope , $http ) {
  console.log($scope.tab.data);
  $scope.data = $scope.tab.data
});
