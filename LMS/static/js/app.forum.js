app.config(function($stateProvider) {
  $stateProvider.state('home.forum', {
    url: "/forum",
    templateUrl: '/static/ngTemplates/app.LMS.forum.html',
    controller: 'home.LMS.forum'
  });
});

app.controller("home.LMS.forum", function($scope, $state, $users, $stateParams, $http, Flash, $timeout) {
  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.forumthread.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/LMS/forumthread/',
    searchField: 'ques',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }
  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Paper :';
          var appType = 'paperEditor';
        } else if (action == 'details') {
          var title = 'Paper Details :';
          var appType = 'paperExplorer';
        }


        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            paper: $scope.data.tableData[i]
          },
          active: true
        })
      }
    }

  }
})
