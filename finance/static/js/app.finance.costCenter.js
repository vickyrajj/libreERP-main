app.controller('businessManagement.finance.costCenter.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, cCenter, $uibModalInstance) {
  console.log(cCenter);
  if (cCenter.pk) {
    $scope.mode = 'edit';
    $scope.form = cCenter
  } else {
    $scope.mode = 'new';
    $scope.form = {
      head: '',
      name: '',
      code: '',
      account: '',
    }
  }
  $scope.accountSearch = function(query) {
    return $http.get('/api/finance/account/?number__icontains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?limit=10&username__contains=' + query).
    then(function(response) {
      return response.data.results;
    })
  }
  $scope.getuserName = function(user) {
    if (user) {
      ret = user.first_name
      if (user.last_name) {
        ret += ' ' + user.last_name
      }
      return ret
    }
  }
  $scope.getAccountName = function(acc) {
    if (acc) {
      return acc.number + ' ( ' + acc.bank + ' )'
    }
  }
  $scope.savecCenter = function() {
    console.log($scope.form);
    var f = $scope.form
    if (f.head.length == 0 || f.head.pk == undefined || f.account.length == 0 || f.account.pk == undefined || f.name.length == 0 || f.code.length == 0) {
      Flash.create('warning', 'All Fields Are Required');
      return;
    }
    var toSend = {
      name: f.name,
      code: f.code,
      head: f.head.pk,
      account: f.account.pk,
    }
    console.log(toSend);
    var url = '/api/finance/costCenter/';
    if ($scope.mode == 'new') {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += $scope.form.pk + '/';
    }
    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      $uibModalInstance.dismiss('saved')
    })
  }
});

app.controller('businessManagement.finance.costCenter', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $uibModal) {
  console.log('const center');
  $scope.data = {
    tableData: []
  };
  var multiselectOptions = [{
    icon: 'fa fa-plus',
    text: 'new'
  }, ];
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.finance.costCenter.item.html',
  }, ];
  $scope.config = {
    views: views,
    url: '/api/finance/costCenter/',
    searchField: 'name',
    itemsNumPerView: [12, 24, 48],
    multiselectOptions: multiselectOptions,
  }
  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);
    if (action == 'new') {
      console.log('new');
      $scope.openCcForm();
    } else if (action == 'delete') {
      console.log('delete', target);
      // $http({
      //   method: 'DELETE',
      //   url: '/api/finance/costCenter/' + target + '/'
      // }).
      // then(function(response) {
      //   Flash.create('success', 'Deleted');
      //   $scope.$broadcast('forceRefetch', {})
      // })
    } else {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          if (action == 'costCenterBrowser') {
            $scope.addTab({
              title: 'Browse Cost Center : ' + $scope.data.tableData[i].pk,
              cancel: true,
              app: 'costCenterBrowser',
              data: {
                pk: target,
                index: i,
                cData: $scope.data.tableData[i]
              },
              active: true
            })
          } else {
            $scope.openCcForm($scope.data.tableData[i]);
          }
        }
      }
    }
  }
  $scope.openCcForm = function(data) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.finance.costCenter.form.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        cCenter: function() {
          if (data == undefined || data == null) {
            return {};
          } else {
            return data;
          }
        },
      },
      controller: 'businessManagement.finance.costCenter.form',
    }).result.then(function() {

    }, function(res) {
      if (res == 'saved') {
        console.log('refreshinggggggg');
        $scope.$broadcast('forceRefetch', {})
      }

    });
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
})

app.controller('businessManagement.finance.costCenter.item', function($scope, $http) {

});

app.controller('businessManagement.finance.costCenter.explore', function($scope, $http) {

  console.log($scope.tab);
  $scope.costCenter = $scope.tab.data.cData

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.finance.costCenter.project.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/projects/project/',
    searchField: 'title',
    deletable: false,
    itemsNumPerView: [12, 24, 48],
    getParams: [{
      "key": 'costCenter',
      "value": $scope.costCenter.pk
    }],
  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    if (action == 'more') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          $scope.addTab({
            title: 'Account details : ' + $scope.data.tableData[i].number,
            cancel: true,
            app: 'accountBrowser',
            data: {
              pk: target,
              index: i
            },
            active: true
          })
        }
      }
    }
  }
});
