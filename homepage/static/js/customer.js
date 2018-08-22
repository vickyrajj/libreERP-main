var app = angular.module("customerApp", ['ui.bootstrap' , 'ui.tinymce' , 'ui.router']);


app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide) {

  // $urlRouterProvider.otherwise('/home');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;




});




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
    $scope.tinymceOptions = {
      selector: 'textarea',
      content_css : '/static/css/bootstrap.min.css',
      inline: false,
      plugins : 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
      skin: 'lightgray',
      theme : 'modern',
      height : 400,
      toolbar : 'saveBtn publishBtn cancelBtn headerMode bodyMode | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
    };
    $scope.state = 'Knowledge Base';
    $scope.custDetailsPk;
    $http({
      method: 'GET',
      url:  '/api/support/reviewHomeCal/?customer&customerProfilePkList',
    }).
    then(function(response) {
      console.log(response.data);
      $scope.custDetailsPk = response.data[0];
      $http({
        method: 'GET',
        url: '/api/support/documentation/?customer='+$scope.custDetailsPk,
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


    $scope.saveDoc = function(){
      console.log($scope.docForm);
      if ($scope.docForm.title==null||$scope.docForm.title.length==0) {
        Flash.create('warning', 'Title Is Required')
        return
      }
      console.log($scope.docForm.text==null);
      if (($scope.docForm.text==null || $scope.docForm.text.length==0) && ($scope.docForm.docs==null || $scope.docForm.docs==emptyFile)) {
        Flash.create('warning', 'Either Content Or Document File Is Required')
        return
      }

      var fd = new FormData();
      fd.append('title', $scope.docForm.title);
      fd.append('customer', $scope.custDetailsPk);
      if ($scope.docForm.text!=null && $scope.docForm.text.length>0) {
        fd.append('text', $scope.docForm.text);
      }
      if ($scope.docForm.docs!=null && typeof $scope.docForm.docs!='string' && $scope.docForm.docs!=emptyFile) {
        fd.append('docs', $scope.docForm.docs);
      }
      var method = 'POST'
      var url = '/api/support/documentation/'
      if ($scope.docForm.pk!=undefined) {
        method = 'PATCH'
        url += $scope.docForm.pk +'/'
      }
      console.log(fd);

      $http({
        method: method,
        url: url,
        data: fd,
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).
      then(function(response) {
        Flash.create('success', 'Saved');
        if ($scope.docForm.pk==undefined) {
          $scope.custDocs.push(response.data)
        }
        $scope.docForm = response.data
      })
    }

  }

});

app.controller("app.customer.reviews.explore", function($scope , $http ) {
  console.log($scope.tab.data);
  $scope.data = $scope.tab.data

  $scope.calculateTime = function (user , agent) {
    console.log('inside cal cccccccccccc');

    if (user!=undefined) {
      var usertime = new Date(user);
      var agenttime = new Date(agent);
      var diff = Math.floor((agenttime - usertime)/60000)
      if (diff<60) {
        return diff+' Mins';
      }else if (diff>=60 && diff<60*24) {
        return Math.floor(diff/60)+' Hrs';
      }else if (diff>=60*24) {
        return Math.floor(diff/(60*24))+' Days';
      }
    }else {
      return
    }

  }


});
