app.controller("businessManagement.marketing.presentations", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.sai = 'Kiran'
  // $scope.data = {
  //   tableData: []
  // };
  //
  // $scope.me = $users.get('mySelf');
  //
  //
  // var views = [{
  //   name: 'list',
  //   icon: 'fa-bars',
  //   template: '/static/ngTemplates/genericTable/genericSearchList.html',
  //   itemTemplate: '/static/ngTemplates/app.marketing.presentations.item.html',
  // }, ];
  //
  // $scope.Config = {
  //   url: '/api/marketing/schedule/',
  //   views: views,
  //   itemsNumPerView: [12, 24, 48],
  //   filterSearch: true,
  //   searchField: 'Search..',
  //
  // };
  //
  // $scope.tableAction = function(target, action, mode) {
  //   for (var i = 0; i < $scope.data.tableData.length; i++) {
  //     // if ($scope.data.tableData[i].pk == parseInt(target)) {
  //     //   if (action == 'info') {
  //     //     $scope.addTab({
  //     //       title: 'Explore Presentation : ' + $scope.data.tableData[i].pk,
  //     //       cancel: true,
  //     //       app: 'presentationInfo',
  //     //       data: {
  //     //         pk: target,
  //     //         index: i
  //     //       },
  //     //       active: true
  //     //     })
  //     //   }
  //     //
  //     // }
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

app.controller("businessManagement.marketing.leads.Explore", function($scope, $state, $users, $stateParams, $http, Flash , $uibModal) {

  if ($scope.tab != undefined) {
    console.log($scope.data.tableData[$scope.tab.data.index]);
    $scope.contactData = $scope.data.tableData[$scope.tab.data.index]
  }

})
