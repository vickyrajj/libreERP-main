var app = angular.module("customerApp", ['ui.bootstrap' ]);


// app.config(function($stateProvider) {
//
//   $stateProvider
//     .state('customer', {
//       url: "/customer/home/:name",
//       templateUrl: '/static/ngTemplates/app.ecommerce.list.html',
//       controller: 'controller.ecommerce.list'
//     })
//
//   // $stateProvider
//   //   .state('details', {
//   //     url: "/details/:id",
//   //     templateUrl: '/static/ngTemplates/app.ecommerce.details.html',
//   //     controller: 'controller.ecommerce.details'
//   //   })
//   //
//   // $stateProvider
//   //   .state('categories', {
//   //     url: "/categories/:name",
//   //     templateUrl: '/static/ngTemplates/app.ecommerce.categories.html',
//   //     controller: 'controller.ecommerce.categories'
//   //   })
//   //
//   // $stateProvider
//   //   .state('checkout', {
//   //     url: "/checkout/:pk",
//   //     templateUrl: '/static/ngTemplates/app.ecommerce.checkout.html',
//   //     controller: 'controller.ecommerce.checkout'
//   //   })
//   //
//   // $stateProvider
//   //   .state('account', {
//   //     url: "/account",
//   //     views: {
//   //       "": {
//   //         templateUrl: '/static/ngTemplates/app.ecommerce.account.html',
//   //       },
//   //       "menu@account": {
//   //         templateUrl: '/static/ngTemplates/app.ecommerce.account.menu.html',
//   //       },
//   //       "topMenu@account": { //this is for top menu for mobile view
//   //         templateUrl: '/static/ngTemplates/app.ecommerce.account.topMenu.html',
//   //       },
//   //       "@account": {
//   //         templateUrl: '/static/ngTemplates/app.ecommerce.account.default.html',
//   //       }
//   //     }
//   //   })
//   //
//   //   .state('account.cart', {
//   //     url: "/cart",
//   //     templateUrl: '/static/ngTemplates/app.ecommerce.account.cart.html',
//   //     controller: 'controller.ecommerce.account.cart'
//   //   })
//   //   .state('account.orders', {
//   //     url: "/orders",
//   //     templateUrl: '/static/ngTemplates/app.ecommerce.account.orders.html',
//   //     controller: 'controller.ecommerce.account.orders'
//   //   })
//   //   .state('account.settings', {
//   //     url: "/settings",
//   //     templateUrl: '/static/ngTemplates/app.ecommerce.account.settings.html',
//   //     controller: 'controller.ecommerce.account.settings'
//   //   })
//   //   .state('account.support', {
//   //     url: "/support",
//   //     templateUrl: '/static/ngTemplates/app.ecommerce.account.support.html',
//   //     controller: 'controller.ecommerce.account.support'
//   //   })
//   //   .state('account.saved', {
//   //     url: "/saved",
//   //     templateUrl: '/static/ngTemplates/app.ecommerce.account.saved.html',
//   //     controller: 'controller.ecommerce.account.saved'
//   //   })
//
// });


app.controller("cutomerController", function($scope , $http) {

  var emptyFile = new File([""], "");
  console.log('cominggggggggggg');
  $scope.displayReview = false;
  $scope.reviewData = []

  $scope.data = {
    tableData: []
  };


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
  console.log($scope.tab.data);
  $scope.data = $scope.tab.data
});
