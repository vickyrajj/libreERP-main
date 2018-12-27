app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.deliveryCenter.online', {
      url: "/online",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.deliveryCenter.online.html',
          controller: 'businessManagement.deliveryCenter.online',
        }
      }
    })
});


app.controller('businessManagement.deliveryCenter.online', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $sce) {

  $scope.data = {
    processData: [],
    completedData: [],
  }

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.vendor.orders.item.html',
  }, ];

  $scope.processconfig = {
    views: views,
    url: '/api/ecommerce/order/',
    searchField: 'status',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
    getParams:[{key : 'status!' , value : 'completed'}]
  }
  $scope.completedconfig = {
    views: views,
    url: '/api/ecommerce/order/',
    searchField: 'id',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
    getParams:[{key : 'status' , value : 'completed'}]
  }

  $scope.processTableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.processData);

    for (var i = 0; i < $scope.data.processData.length; i++) {
      if ($scope.data.processData[i].pk == parseInt(target)) {
        if (action == 'info') {
          var title = 'Order Details : ';
          var appType = 'orderInfo';
        }

        $scope.addTab({
          title: title + $scope.data.processData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            order: $scope.data.processData[i]
          },
          active: true
        })
      }
    }

  }

  $scope.completedTableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.completedData);

    for (var i = 0; i < $scope.data.completedData.length; i++) {
      if ($scope.data.completedData[i].pk == parseInt(target)) {
        if (action == 'info') {
          var title = 'Order Details : ';
          var appType = 'orderInfo';
        }

        $scope.addTab({
          title: title + $scope.data.completedData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            order: $scope.data.completedData[i]
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

});
