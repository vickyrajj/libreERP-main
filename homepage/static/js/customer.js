var app = angular.module("customerApp", ['ui.bootstrap' ]);
app.controller("cutomerController", function($scope , $http) {

  var emptyFile = new File([""], "");
  console.log('cominggggggggggg');
  $scope.displayReview = false;
  $scope.state = 'Dashboard';


  $scope.review = function () {
    $scope.state = 'Review';
    console.log('in review function');

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

    $scope.tabs = [];
    $scope.searchTabActive = true;

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

    $scope.closeTab = function(index) {
      $scope.tabs.splice(index, 1)
    }

    $scope.explore = function(indx) {
      console.log(indx);
      $scope.addTab({
        title: 'some',
        cancel: true,
        app: 'explore',
        data: $scope.reviewData[indx],
        active: true
      })
    }

  }


  $scope.settings = function () {
    $scope.state = 'Settings';
    $scope.cpForm = {};
    $http({
      method: 'GET',
      url:  '/api/support/reviewHomeCal/?customer&customerProfilePkList',
    }).
    then(function(response) {

      console.log(response.data);
      $http({
        method: 'GET',
        url:  '/api/support/customerProfile/'+response.data[0]+'/',
      }).
      then(function(response) {
        console.log(response.data);
        $scope.cpForm = response.data
      });

    });


    $scope.saveCustomerProfile = function () {
      var fd = new FormData();
      fd.append('call', $scope.cpForm .call );
      fd.append('email', $scope.cpForm .email );
      fd.append('callBack', $scope.cpForm .callBack);
      fd.append('chat', $scope.cpForm .chat);
      fd.append('name', $scope.cpForm .name);
      fd.append('videoAndAudio', $scope.cpForm .videoAndAudio);
      fd.append('ticket', $scope.cpForm .ticket);
      fd.append('vr', $scope.cpForm .vr);
      fd.append('service', $scope.cpForm .service);


      if ($scope.cpForm .windowColor != '') {
        fd.append('windowColor', $scope.cpForm .windowColor);
      }
      if ($scope.cpForm .supportBubbleColor != '') {
        fd.append('supportBubbleColor', $scope.cpForm .supportBubbleColor);
      }
      if ($scope.cpForm .dp && typeof $scope.cpForm .dp!='string' ) {
        fd.append('dp',$scope.cpForm .dp);
      }


      $http({
        method: 'PATCH',
        url:  '/api/support/customerProfile/'+$scope.cpForm.pk+'/',
        data: fd,
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).
      then(function(response) {
        console.log(response.data);
      });
    }



  }


  $scope.knowledgeBase = function () {
    $scope.state = 'Knowledge Base';
    $http({
      method: 'GET',
      url:  '/api/support/reviewHomeCal/?customer&customerProfilePkList',
    }).
    then(function(response) {
      console.log(response.data);
      $http({
        method: 'GET',
        url: '/api/support/documentation/?customer='+response.data[0],
      }).
      then(function(response) {
        $scope.custDocs = response.data
        console.log($scope.custDocs,'dddddddddddd');
      });
    });


    $scope.addDoc = function(idx){
      if (idx==-1) {
        $scope.docForm = {title:'',text:'',docs:emptyFile}
      }else {
        $scope.docForm = $scope.custDocs[idx]
      }
      console.log($scope.docForm);
    }




  }

});

app.controller("app.customer.reviews.explore", function($scope , $http ) {
  $scope.data = $scope.tab.data
});
