var app = angular.module("customerApp", ['ui.bootstrap' , 'ui.tinymce' , 'ui.router','chart.js',]);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide) {
  // $urlRouterProvider.otherwise('/home');
  $urlRouterProvider.otherwise('/');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
});

app.run(['$rootScope', '$state', '$stateParams',  function($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on("$stateChangeError", console.log.bind(console));
}]);

app.config(function($stateProvider) {
  $stateProvider
    .state('reviews', {
      url: "/reviews",
      templateUrl: '/static/ngTemplates/app.customer.reviews.html',
      controller: 'app.customer.reviews'
    })
  $stateProvider
    .state('settings', {
      url: "/settings",
      templateUrl: '/static/ngTemplates/app.customer.settings.html',
      controller: 'app.customer.settings'
    })
    $stateProvider
      .state('knowledgeBase', {
        url: "/knowledgeBase",
        templateUrl: '/static/ngTemplates/app.customer.knowledgeBase.html',
        controller: 'app.customer.knowledgeBase'
      })

  // $stateProvider
  //   .state('customer', {
  //     url: "/",
  //     views: {
  //       "": {
  //         templateUrl: '/static/ngTemplates/app.ecommerce.account.html',
  //       },
  //       "@customer": {
  //         templateUrl: '/static/ngTemplates/app.ecommerce.account.default.html',
  //       }
  //     }
  //   })
  //   .state('customer.reviews', {
  //     url: "/reviews",
  //     templateUrl: '/static/ngTemplates/app.ecommerce.account.cart.html',
  //     controller: 'controller.ecommerce.account.cart'
  //   })

});


app.controller("app.customer.reviews", function($scope ,$state, $http,$rootScope ) {
  $rootScope.state = 'Reviews';
  $scope.reviewData = []

  console.log('in review function');

  $http({
    method: 'GET',
    url:  '/api/support/reviewHomeCal/?customer',
  }).
  then(function(response) {
    $scope.reviewData = response.data
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

})
app.controller("app.customer.settings", function($scope ,$state, $http ,$rootScope) {

  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css : '/static/css/bootstrap.min.css',
    inline: false,
    plugins : 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme : 'modern',
    height : 100,
    toolbar : 'saveBtn publishBtn cancelBtn headerMode bodyMode | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
  };


  $rootScope.state = 'Settings';
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

    if ($scope.cpForm.windowColor != '') {
      fd.append('windowColor', $scope.cpForm.windowColor);
    }
    if ($scope.cpForm.supportBubbleColor != '') {
      fd.append('supportBubbleColor', $scope.cpForm.supportBubbleColor);
    }
    if ($scope.cpForm.firstMessage != '') {
      fd.append('firstMessage', $scope.cpForm.firstMessage);
    }
    if ($scope.cpForm.dp && typeof $scope.cpForm.dp!='string' ) {
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
})
app.controller("app.customer.knowledgeBase", function($scope ,$state, $http,$rootScope ) {
  $rootScope.state = 'KnowledgeBase';
  var emptyFile = new File([""], "");
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
  // $scope.state = 'Knowledge Base';
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
})


app.controller("cutomerController", function($scope , $http,$rootScope) {
  console.log('cominggggggggggg');
  $rootScope.state = 'Dashboard';
  $scope.sai = 'kiran'
  // setTimeout(function () {
  //   var elid = document.getElementById('dashboardBar')
  //   elid.height = 10
  //   elid.width = 100
  // }, 1000);

  $scope.barlabels = [];
  $scope.series = ['Series A', 'Series B'];

  $scope.barData = [];
  // $scope.colours = ['#72C02C', '#3498DB'];
  $scope.sharesOptions = {
    scales: {
      xAxes: [{
        stacked: true,
      }],
      yAxes: [{
        stacked: true
      }]
    }
  };

  $scope.barColours = [{
    backgroundColor: "#71A0F2",
    borderColor: "#71A0F2"
  }, {
    backgroundColor: "#0080FF",
    borderColor: "#0080FF"
  }];

  $http({
    method: 'GET',
    url:  '/api/support/reviewHomeCal/?customer&customerProfilePkList',
  }).
  then(function(response) {
    console.log(response.data);
    if (response.data.length>0) {
      id = response.data[0]
    }else {
      id = 0
    }
    // $http({
    //   method: 'GET',
    //   url:  '/api/support/customerProfile/'+response.data[0]+'/',
    // }).
    // then(function(response) {
    //   console.log(response.data);
    //   $scope.cpForm = response.data
    // });
    console.log(id ,'ffffffffffffffffffffffffffffffffffffffffff');
    $http({
      method: 'GET',
      url: '/api/support/gethomeCal/?perticularUser='+id,
    }).
    then(function(response) {
      console.log(response.data,'dddddddddddd',typeof response.data);
      $scope.totalChats = response.data.totalChats
      $scope.missedChats = response.data.missedChats
      $scope.agentChatCount = response.data.agentChatCount
      $scope.barData = response.data.graphData
      console.log($scope.barData);
      $scope.barlabels = response.data.graphLabels
      $scope.avgChatDuration = response.data.avgChatDuration
      $scope.firstResTimeAvgAll = response.data.firstResTimeAvgAll
      $scope.avgRatingAll = response.data.avgRatingAll
      $scope.avgRespTimeAll = response.data.avgRespTimeAll
      $scope.changeInChat = response.data.changeInChat
    });
  });
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