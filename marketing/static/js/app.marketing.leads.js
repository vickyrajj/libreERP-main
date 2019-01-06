app.controller("businessManagement.marketing.leads", function($scope, $state, $users, $stateParams, $http, Flash) {  
  $scope.data = {
    tableData: []
  };

  $scope.me = $users.get('mySelf');


  var views = [{
    name: 'list',
    icon: 'fa-bars',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.marketing.leads.item.html',
  }, ];

  $scope.Config = {
    url: '/api/marketing/leads/',
    views: views,
    itemsNumPerView: [12, 24, 48],
    searchField: 'mobileNumber',

  };

  $scope.tableAction = function(target, action, mode) {
    if (action == 'delete') {
      $http({
        method: 'DELETE',
        url: '/api/marketing/leads/' + parseInt(target) + '/'
      }).
      then(function(response) {
        Flash.create('success', 'Deleted');
        $scope.$broadcast('forceRefetch', {})
      })
    }else if (action == 'move') {
      $http({
        method: 'POST',
        url: '/api/marketing/convertLead/',
        data:{leadPk:parseInt(target)}
      }).
      then(function(response) {
        Flash.create('success', 'Successfully');
        $scope.$broadcast('forceRefetch', {})
      })

    }
    // for (var i = 0; i < $scope.data.tableData.length; i++) {
    //   if ($scope.data.tableData[i].pk == parseInt(target)) {
    //
    //
    //   }
    // }

  }

  $scope.searchTabActive = true;

  // $scope.tabs = [];
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
