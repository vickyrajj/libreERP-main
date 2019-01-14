app.controller('businessManagement.finance.pettyCash', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  $scope.me = $users.get('mySelf');
  console.log($scope.me);
  $scope.form = {amount:1,project:'',account:'',description:'',heading:'',attachment:emptyFile}

  $http.get('/api/finance/account/?personal=true&contactPerson=' + $scope.me.pk).
  then(function(response) {
    console.log(response.data);
    // response.data = []
    // response.data = response.data.splice(0,1)
    $scope.userAccounts = response.data;
    if (response.data.length>0) {
      if (response.data.length==1) {
        $scope.form.accountIdx = 0
      }else {
        $scope.form.accountIdx = -1
      }
    }
  })

  $scope.titleSearch = function(query) {
    return $http.get('/api/finance/expenseHeading/?title__icontains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.projectSearch = function(query) {
    return $http.get('/api/projects/project/?title__icontains=' + query).
    then(function(response) {
      return response.data;
    })
  };




  // $scope.data = {
  //   tableData: []
  // };
  //
  // views = [{
  //   name: 'list',
  //   icon: 'fa-th-large',
  //   template: '/static/ngTemplates/genericTable/genericSearchList.html',
  //   itemTemplate: '/static/ngTemplates/app.finance.outflow.item.html',
  // }, ];
  //
  // var options = {
  //   main: {
  //     icon: 'fa-pencil',
  //     text: 'edit'
  //   },
  // };
  //
  // $scope.config = {
  //   views: views,
  //   url: '/api/finance/costCenter/',
  //   searchField: 'name',
  //   deletable: true,
  //   itemsNumPerView: [12, 24, 48],
  // }
  //
  //
  // $scope.tableAction = function(target, action, mode) {
  //   console.log(target, action, mode);
  //   console.log($scope.data.tableData);
  //
  //   if (action == 'costCenterBrowser') {
  //     for (var i = 0; i < $scope.data.tableData.length; i++) {
  //       if ($scope.data.tableData[i].pk == parseInt(target)) {
  //         $scope.addTab({
  //           title: 'Browse Cost Center : ' + $scope.data.tableData[i].pk,
  //           cancel: true,
  //           app: 'costCenterBrowser',
  //           data: {
  //             pk: target,
  //             index: i
  //           },
  //           active: true
  //         })
  //       }
  //     }
  //   }
  //
  // }
  //
  // $scope.tabs = [];
  // $scope.searchTabActive = true;
  //
  // $scope.closeTab = function(index) {
  //   $scope.tabs.splice(index, 1)
  // }
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


})
