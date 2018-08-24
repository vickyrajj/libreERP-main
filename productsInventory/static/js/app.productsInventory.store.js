app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.productsInventory.store', {
      url: "/store",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.productsInventory.store.html',
          controller: 'businessManagement.productsInventory.store',
        }
      }
    })
});
app.controller("businessManagement.productsInventory.store", function($scope, $http, Flash , $uibModal , $rootScope,$state) {

  $scope.data = {
    tableData: [],
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.productsInventory.store.item.html',
  }, ];



  $scope.config = {
    views: views,
    url: '/api/POS/store/',
    searchField: 'name',
    itemsNumPerView: [16, 32, 48],
  }
  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit : ';
          var appType = 'storeEditor';
        } else if (action == 'info') {
          var title = 'Details : ';
          var appType = 'storeInfo';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].pk +' ',
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
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

app.controller("businessManagement.productsInventory.store.explore", function($scope, $http, Flash , $uibModal , $rootScope,$state) {
    $scope.data = $scope.data.tableData;
    console.log($scope.data,'aaaaaaaaaaaaaaa');
})
