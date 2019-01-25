app.controller("businessManagement.deliveryChallan", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ){
  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.deliveryChallan.item.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/support/deliveryChallan/',
    filterSearch: true,
    searchField: 'challanNo',
    deletable: true,
    itemsNumPerView: [8, 16, 24],
  }


  $scope.tableAction = function(target, action, mode) {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'explore') {
          var title = 'Explore Challan : ';
          var appType = 'exploreChallan';
        }
        // else if (action == 'delete') {
        //   $http({
        //     method: 'DELETE',
        //     url: '/api/support/invoice/' + $scope.data.tableData[i].pk + '/'
        //   }).
        //   then(function(response) {
        //     Flash.create('success', 'Item Deleted');
        //   })
        //   $scope.data.tableData.splice(i, 1)
        //   return;
        // }



        $scope.addTab({
          title: title + $scope.data.tableData[i].challanNo,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
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


})
app.controller("businessManagement.deliveryChallan.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ){
$scope.form = $scope.data.tableData[$scope.tab.data.index]
$scope.materialIssue = $scope.form.materialIssue.materialIssue


})
