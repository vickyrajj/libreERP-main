app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.reviews', {
    url: "/reviews",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.reviews.html',
        controller: 'businessManagement.reviews',
      }
    }
  })
});
app.controller("businessManagement.reviews.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {
  $scope.msgData = $scope.tab.data
  console.log($scope.tab.data);
})
app.controller("businessManagement.reviews", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

  $scope.data = {
    tableData: []
  };

  $scope.form = {date:new Date(),user:''}
  $scope.reviewData = []
  $scope.getData = function(date,user){
    console.log('@@@@@@@@@@@@@@@@@@',date,user);
    var url = '/api/support/reviewHomeCal/?'
    if (typeof date == 'object') {
      url += '&date=' + date.toJSON().split('T')[0]
    }
    if (typeof user == 'object') {
      url += '&user=' + user.pk
    }
    $http({
      method: 'GET',
      url: url,
    }).
    then(function(response) {
      // $scope.custDetails = response.data[0]
      console.log(response.data,'dddddddddddd',typeof response.data);
      $scope.reviewData =response.data
    });
  }
  $scope.getData($scope.form.date,$scope.form.user)
  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response){
      return response.data;
    })
  };
  $scope.filterData = function(){
    if (typeof $scope.form.date =='string') {
      Flash.create('warning','Please Select Proper Date')
      return
    }
    if (typeof $scope.form.user == 'string' && $scope.form.user.length > 0) {
      Flash.create('warning','Please Select Suggested User')
      return
    }else if (typeof $scope.form.user == 'object') {
      var user = $scope.form.user
    }else {
      var user = ''
    }
    $scope.getData($scope.form.date,user)
  }
  // views = [{
  //   name: 'list',
  //   icon: 'fa-th-large',
  //   template: '/static/ngTemplates/genericTable/genericSearchList.html',
  //   itemTemplate: '/static/ngTemplates/app.reviews.items.html',
  // }, ];
  //
  //
  // $scope.config = {
  //   views: views,
  //   url: '/api/support/supportChat/',
  //   searchField: 'name',
  //   itemsNumPerView: [16, 32, 48],
  // }


  $scope.tableAction = function(target) {
    // console.log(target, action, mode);
    console.log($scope.reviewData[target]);
    var appType = 'Info';
    $scope.addTab({
      title: 'Agent : ' + $scope.reviewData[target][0].uid,
      cancel: true,
      app: 'AgentInfo',
      data: $scope.reviewData[target],
      active: true
    })

    // for (var i = 0; i < $scope.reviewData.length; i++) {
    //   if ($scope.reviewData[i].pk == parseInt(target)) {
    //     if (action == 'edit') {
    //       var title = 'Edit : ';
    //       var appType = 'companyEdit';
    //     } else if (action == 'info') {
    //       var title = 'Details : ';
    //       var appType = 'companyInfo';
    //     }
    //
    //     $scope.addTab({
    //       title: title + $scope.reviewData[i].pk,
    //       cancel: true,
    //       app: appType,
    //       data: $scope.reviewData[i],
    //       active: true
    //     })
    //   }
    // }
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
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

});
