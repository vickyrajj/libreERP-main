

app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.customers', {
    url: "/customers",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.customers.html',
        controller: 'businessManagement.customers',
      }
    }
  })
});


app.controller("businessManagement.customers", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope ,$permissions , $timeout) {


  $scope.me = $users.get('mySelf')

  $scope.createPerm = $permissions.myPerms('module.customer.create')

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.customers.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/HR/users/',
    searchField: 'name',
    getParams: [{
      key: 'getCustomers',
      value: 1
    }],
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit : ';
          var appType = 'companyEdit';
        } else if (action == 'customerExplore') {
          var title = 'Details : ';
          var appType = 'customerExplore';
        } else if (action == 'document') {
          var title = 'Document : ';
          var appType = 'document';
        }
        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
          active: true,
        })

      }
    }
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
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

});

app.controller("customer.emails.details", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal,$aside,deal,$uibModalInstance,$sce) {
  $scope.msg = deal

  if (typeof $scope.msg.body == 'string') {
    $scope.msg.body = $sce.trustAsHtml(deal.body);
  }

  $scope.cancel = function(e) {
    $uibModalInstance.dismiss();
  };
  $scope.changeCategory = function() {
    $http({
      method: 'PATCH',
      url: '/api/HR/email/' + $scope.msg.pk + '/',
      data: {'category':$scope.msg.category},
    }).
    then(function(response) {
      Flash.create('success', 'Updated');
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  };
})

app.controller("customer.location.details", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal,$aside,deal,$uibModalInstance,$sce) {
  $scope.msg = deal

  $scope.cancel = function(e) {
    $uibModalInstance.dismiss();
  };
  $scope.changeCategory = function() {
    $http({
      method: 'PATCH',
      url: '/api/HR/email/' + $scope.msg.pk + '/',
      data: {'category':$scope.msg.category},
    }).
    then(function(response) {
      Flash.create('success', 'Updated');
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  };
})

app.controller("customer.bankStatement.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal,$aside) {

  $scope.form = {xlFile : emptyFile , success : false}
  $scope.upload = function() {
    if ($scope.form.xlFile == emptyFile) {
      Flash.create('warning' , 'Please Select Proper Excel File')
      return
    }
    var fd = new FormData()
    fd.append('excelFile' , $scope.form.xlFile);
    fd.append('user' , $scope.$parent.$parent.getParams[0].value);
    $http({
      method: 'POST',
      url: '/api/HR/bankStatementUpload/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success' , 'Created');
      $scope.form.success = true;
    })
  }

})

app.controller("customer.explore.call", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal,$aside) {
  $scope.sameDate = function(prev , curr) {
    if (typeof curr == 'string') {
      prev = new Date(prev);
      curr = new Date(curr);
    }
    return curr.getFullYear() === prev.getFullYear() &&
    curr.getMonth() === prev.getMonth() &&
    curr.getDate() === prev.getDate()
  }
})

app.controller("customer.bankStatement.details", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal,$aside,$uibModalInstance,rawData,bankData) {
  $scope.data = rawData
  $scope.bankData = bankData
  $scope.cancel = function(e) {
    $uibModalInstance.dismiss();
  };
})

app.controller("customer.explore.location", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal,$aside) {
  $scope.sameDate = function(prev , curr) {
    if (typeof curr == 'string') {
      prev = new Date(prev);
      curr = new Date(curr);
    }
    return curr.getFullYear() === prev.getFullYear() &&
    curr.getMonth() === prev.getMonth() &&
    curr.getDate() === prev.getDate()
  }

  $scope.openLocationInfo = function(dt) {
    $aside.open({
      templateUrl : '/static/ngTemplates/app.customer.location.info.html',
      placement: 'right',
      size: 'xl',
      resolve: {
        deal : function() {
          return dt;
        },
      },
      controller : 'customer.location.details'
    })

  }

  $scope.seeLocation = function(dat){
    $scope.openLocationInfo(dat);
  }
})


app.controller("businessManagement.customers.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal,$aside,$timeout) {
  $scope.data = $scope.tab.data
  $scope.form={mobile:''}
  $scope.status = false
  if($scope.data.profile.mobile==null){
    $scope.status = true
  }
  else{
    $scope.mobileEdit = true

  }
  $scope.showEdit=function(){
    $scope.status = true
    $scope.mobileEdit = false
  }
  $scope.saveMobile=function(){
    var toSend = {
      mobile :  $scope.form.mobile,
    }
    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + $scope.data.profile.pk + '/',
      data: toSend,
    }).
    then(function(response) {
      $scope.data.profile.mobile = response.data.mobile
      $scope.form.mobile=''
      $scope.status = false
      $scope.mobileEdit = true
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }

  $scope.dataVal = {
    smsData: [],
    callData: [],
    locationData: [],
    mobileContactData: [],
    bankStatementsData: [],
    emailData:[]
  };



  smsviews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/tableDefault.html',
    // itemTemplate: '/static/ngTemplates/app.customers.sms.item.html',
  }, ];

  callviews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/app.callsList.html',
    // itemTemplate: '/static/ngTemplates/app.customers.call.item.html',
  }, ];

  locationviews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/app.loctionList.html',
    // itemTemplate: '/static/ngTemplates/app.customers.location.item.html',
  }, ];

  mobileContactviews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.customers.contacts.items.html',
  }, ];



  $scope.smsConfig = {
    views: smsviews,
    url: '/api/HR/sms/',
    searchField: 'frm',
    getParams : [{key : 'user' , value : $scope.data.pk}],
    fields : ['frm','to','body','dated'],
    itemsNumPerView: [16, 32, 48],

  }
  $scope.callConfig = {
    views: callviews,
    url: '/api/HR/call/',
    searchField: 'frmOrTo',
    getParams : [{key : 'user' , value : $scope.data.pk}],
    itemsNumPerView: [16, 32, 48],
  }

  var multiselectOptions = [{icon : 'fa fa-map-marker' , text : 'fetchLocation' },
    // {icon : 'fa fa-bar-chart-o' , text : 'Performance' },
    // {icon : 'fa fa-envelope-o' , text : 'message' },
  ];
  var options = {main : {icon : 'fa-map-marker', text: 'Location'}};

  $scope.locationConfig = {
    views: locationviews,
    url: '/api/HR/location/',
    searchField: 'lat',
    getParams : [{key : 'user' , value : $scope.data.pk}],
    itemsNumPerView: [16, 32, 48],
    multiselectOptions:multiselectOptions,
    // options: options
  }
  $scope.mobileContactConfig = {
    views: mobileContactviews,
    url: '/api/HR/mobilecontact/',
    searchField: 'name',
    getParams : [{key : 'user' , value : $scope.data.pk}],
    itemsNumPerView: [16, 32, 48],
  }
  // var options = {main : {icon : 'fa-info', text: 'Info'}};

  bankStatementViews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.customers.bankStatements.items.html',
  }, ];

  $scope.bankStatementConfig = {
    views: bankStatementViews,
    url: '/api/HR/bankStatement/',
    searchField: 'bankAct__accNumber',
    getParams : [{key : 'bankAct__user' , value : $scope.data.pk}],
    itemsNumPerView: [16, 32, 48],
    canCreate : true,
    editorTemplate : '/static/ngTemplates/app.customer.bankStatement.form.html',
  }

  emailViews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.customers.emails.items.html',
  }, ];

  var multiselectOptions = [{icon : 'fa fa-envelope-o' , text : 'fetchNew' },{icon : 'fa fa-envelope' , text : 'fetchOld' }];
  $scope.emailConfig = {
    views: emailViews,
    url: '/api/HR/email/',
    filterSearch: true,
    searchField: 'subject or frm',
    getParams : [{key : 'user' , value : $scope.data.pk}],
    itemsNumPerView: [16, 32, 48],
    multiselectOptions, multiselectOptions,
    drills : [
      {icon : 'fa fa-bars' , name : 'Options' , btnClass : 'default' , options : [
        {key : 'Inbox', value : true},
        {key : 'Sent', value : true},
      ]}
    ]
  }

  $scope.emailtableAction = function(target, action, mode) {
    if (mode == 'multi') {
      if (action == 'fetchNew') {
        $scope.getToken('new')
      }else if (action == 'fetchOld') {
        $scope.getToken('old')
      }
    }else {
      if (action == 'Info') {
        for (var i = 0; i < $scope.dataVal.emailData.length; i++) {
          if ($scope.dataVal.emailData[i].pk == parseInt(target)) {
            $scope.openEmailInfo($scope.dataVal.emailData[i]);
          }
        }
      }
    }
  }

  $scope.banktableAction = function(target, action, mode) {
    if (action == 'Info') {
      for (var i = 0; i < $scope.dataVal.bankStatementsData.length; i++) {
        if ($scope.dataVal.bankStatementsData[i].pk == parseInt(target)) {
          $scope.openbankStatementInfo($scope.dataVal.bankStatementsData[i]);
        }
      }
    }else if (action == 'bankGraph') {
      for (var i = 0; i < $scope.dataVal.bankStatementsData.length; i++) {
        if ($scope.dataVal.bankStatementsData[i].pk == parseInt(target)) {
          $scope.dataVal.bankStatementsData[i].showInfo = !$scope.dataVal.bankStatementsData[i].showInfo
        }
      }
    }
  }

  $scope.openbankStatementInfo = function(dt) {
    $http({
      method: 'GET',
      url: '/api/HR/rawData/?bankstatement=' + dt.pk
    }).
    then(function(response) {
      $aside.open({
        templateUrl : '/static/ngTemplates/app.customer.bankStatement.info.html',
        placement: 'right',
        size: 'xl',
        resolve: {
          rawData : function() {
            return response.data;
          },
          bankData : function() {
            return dt;
          },
        },
        controller : 'customer.bankStatement.details'
      })
    })

  }

  $scope.openEmailInfo = function(dt) {
    $aside.open({
      templateUrl : '/static/ngTemplates/app.customer.email.info.html',
      placement: 'right',
      size: 'xl',
      resolve: {
        deal : function() {
          return dt;
        },
      },
      controller : 'customer.emails.details'
    })

  }

  $scope.tableAction = function(target, action, mode) {

    if (action == 'fetchLocation') {




      connection.session.publish('service.tracker.7840850111', [] , {}, {
        acknowledge: true
      }).
      then(function(publication) {

      });

    }
    // if (action == 'Location') {
    //   console.log("Location infooooooo");
    //   for (var i = 0; i < $scope.dataVal.locationData.length; i++) {
    //     if ($scope.dataVal.locationData[i].pk == parseInt(target)) {
    //       $scope.openLocationInfo($scope.dataVal.locationData[i]);
    //     }
    //   }
    // }
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
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


  $scope.getToken = function(typ){
    $http({
      method: 'GET',
      url: '/api/HR/emailSave/?userId=' +$scope.data.pk
    }).
    then(function(response) {
      $scope.createData(typ)
    })

  }

  $scope.createData = function(typ){
    $http({
      method: 'GET',
      url: '/api/HR/emailDataSave/?userId=' +$scope.data.pk + '&typ=' + typ
    }).
    then(function(response) {

      $http({method : 'GET' , url : '/api/HR/users/' +  $scope.data.pk +'/'  }).
      then( function(response) {
        $scope.data = response.data;
      })


    })
  }

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July" , "Aug" , "Sep" , "Oct" , "Nov" , "Dec"];
  $scope.series = ['Series A', 'Series B'];
  // $scope.chartData = [
  //   [65, 59, 80, 81, 56, 55, 40, 55 , 22, 54, 22, 99, 22],
  //   [28, 48, 40, 19, 86, 27, 90, 55 , 22, 54, 22, 99, 22]
  // ];
  $scope.chartData = [[],[]];
  $scope.onClick = function (points, evt) {
  };
  $scope.debtVsSavingsChartoptions = {
    scales: {
          xAxes: [{
            display: true
          }],
          yAxes: [{
            display: true
          }],
        }
  };


  $scope.incNumber = [];
  $scope.incCount = [];
  $scope.outNumber = [];
  $scope.outCount = [];
  $scope.msdNumber = [];
  $scope.msdCount = [];

  $scope.fetchGraphDetils = function(idx){
    $http({
      method: 'GET',
      url: '/api/HR/fetchGraphData/?year=' + $scope.bankRawYearsList[idx] + '&user=' +  $scope.data.pk
    }).
    then(function(response) {
      $scope.chartData = [response.data.debList,response.data.cdtList];
    })
  }

  var thisYear = new Date().getFullYear()
  $scope.bankRawYearsList = [thisYear-2,thisYear-1,thisYear]
  $scope.graphIdx = 2
  $scope.graphYearsLength = 3
  $scope.fetchGraphDetils($scope.graphIdx)
  $http({
    method: 'GET',
    url: '/api/HR/userCallHistoryGraph/?user=' + $scope.data.pk
  }).
  then(function(response) {
    $scope.incNumber = response.data.incNumber
    $scope.incCount = response.data.incCount
    $scope.outNumber = response.data.outNumber
    $scope.outCount = response.data.outCount
    $scope.msdNumber = response.data.msdNumber
    $scope.msdCount = response.data.msdCount
  })

  $scope.prevGraph = function(){
    $scope.graphIdx = $scope.graphIdx - 1
    $scope.fetchGraphDetils($scope.graphIdx)
  }
  $scope.nextGraph = function(){
    $scope.graphIdx = $scope.graphIdx + 1
    $scope.fetchGraphDetils($scope.graphIdx)
  }


  // $timeout(function () {
  //     console.log($scope.dataVal.bankStatementsData);
  //     for (var i = 0; i < $scope.dataVal.bankStatementsData.length; i++) {
  //       $scope.getBSData(i)
  //     }
  // }, 1500);
  // $scope.getBSData = function(i){
  //   console.log(i,$scope.dataVal.bankStatementsData[i].pk);
  //   $http({
  //     method: 'GET',
  //     url: '/api/HR/getBankStatementsData/?pk=' + $scope.dataVal.bankStatementsData[i].pk
  //   }).
  //   then((function(i) {
  //     return function(response) {
  //       console.log(i,'ressssssssssss',response.data);
  //       $scope.dataVal.bankStatementsData[i].bankData = response.data
  //       $scope.dataVal.bankStatementsData[i].graphLabels = response.data.graphLabels
  //       $scope.dataVal.bankStatementsData[i].graphData = response.data.graphData
  //
  //     }
  //   })(i))
  // }


})



app.controller("businessManagement.customers.form", function($scope, $state, $users, $stateParams, $http, Flash) {



})
