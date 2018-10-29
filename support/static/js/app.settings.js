app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.settings', {
    url: "/settings",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.settings.html',
        controller: 'businessManagement.settings',
      }
    }
  })
});


app.controller("businessManagement.settings", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope ,$permissions , $timeout) {

  $scope.me = $users.get('mySelf')

  $scope.data = {
    tableNKWordsData: [],
    tableGEmailData: [],
    tableSEmailData: [],
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.settings.negativeKeywords.items.html',
  }, ];
  $scope.NKWordsConfig = {
    views: views,
    url: '/api/HR/settingTypes/',
    searchField: 'name',
    getParams: [{
      key: 'typ',
      value: 'negativeWord'
    }],
    itemsNumPerView: [16, 32, 48],
  }

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.settings.bankId.items.html',
  }, ];
  $scope.GEmailConfig = {
    views: views,
    url: '/api/HR/settingTypes/',
    searchField: 'name',
    getParams: [{
      key: 'typ',
      value: 'bankIds'
    }],
    itemsNumPerView: [16, 32, 48],
  }

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.settings.socialId.items.html',
  }, ];
  $scope.SEmailConfig = {
    views: views,
    url: '/api/HR/settingTypes/',
    searchField: 'name',
    getParams: [{
      key: 'typ',
      value: 'socialIds'
    }],
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableNKWordsAction = function(target, action, mode) {
    console.log(target, action, mode);
    for (var i = 0; i < $scope.data.tableNKWordsData.length; i++) {
      if ($scope.data.tableNKWordsData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          $rootScope.$broadcast('keyWordUpdate', {data:$scope.data.tableNKWordsData[i]});
          return
        }else if (action == 'delete') {
          $http({method : 'DELETE' , url : '/api/HR/settingTypes/' + target + '/'}).
          then(function(response) {
            Flash.create('success' , 'Deleted');
            $scope.$broadcast('forceRefetch', {});
          })
          return
        }

      }
    }
  }

  $scope.tableGEmailAction = function(target, action, mode) {
    console.log(target, action, mode);
    for (var i = 0; i < $scope.data.tableGEmailData.length; i++) {
      if ($scope.data.tableGEmailData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          $rootScope.$broadcast('GEmailUpdate', {data:$scope.data.tableGEmailData[i]});
          return
        }else if (action == 'delete') {
          $http({method : 'DELETE' , url : '/api/HR/settingTypes/' + target + '/'}).
          then(function(response) {
            Flash.create('success' , 'Deleted');
            $scope.$broadcast('forceRefetch', {});
          })
          return
        }

      }
    }
  }

  $scope.tableSEmailAction = function(target, action, mode) {
    console.log(target, action, mode);
    for (var i = 0; i < $scope.data.tableSEmailData.length; i++) {
      if ($scope.data.tableSEmailData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          $rootScope.$broadcast('SEmailUpdate', {data:$scope.data.tableSEmailData[i]});
          return
        }else if (action == 'delete') {
          $http({method : 'DELETE' , url : '/api/HR/settingTypes/' + target + '/'}).
          then(function(response) {
            Flash.create('success' , 'Deleted');
            $scope.$broadcast('forceRefetch', {});
          })
          return
        }

      }
    }
  }

  $scope.searchTabActive = true;


})

app.controller('businessManagement.seettings.mcgGeneralise', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$rootScope) {

  $scope.generaliseMsg = function(){
    $http({method : 'GET' , url : '/api/HR/smsClassifier/'}).
    then(function(response) {
      console.log(response.data);
      Flash.create('success', 'Generalised Sucessfully');
    })
  }

})

app.controller('businessManagement.seettings.negativeKeywords.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$rootScope) {
  $scope.wordForm = {name:'', typ:'negativeWord'}
  $scope.mode = 'new'
  $scope.msg = 'Create'
  $scope.$on('keyWordUpdate', function(event, input) {
    console.log("recieved");
    console.log(input.data);
    $scope.msg = 'Update'
    $scope.wordForm = input.data
    $scope.mode = 'edit'

  });
  $scope.saveKeyWord = function(){
    console.log('7777777777777777777',$scope.wordForm);
    if ($scope.wordForm.name == null || $scope.wordForm.name.length == 0) {
      Flash.create('warning', 'Please Mention The Keyword')
      return;
    }
    var method = 'POST'
    var url = '/api/HR/settingTypes/'
    if ($scope.mode == 'edit') {
      method = 'PATCH'
      url = url + $scope.wordForm.pk + '/'
    }
    dataToSend = {
      name : $scope.wordForm.name,
      typ : $scope.wordForm.typ,
    }
    $http({method : method , url : url, data : dataToSend }).
    then(function(response) {
      Flash.create('success', $scope.msg + 'd');
      $rootScope.$broadcast('forceRefetch', {});
      $scope.wordForm = {name:'', typ:'negativeWord'}
      $scope.mode = 'new'
      $scope.msg = 'Create'
    })
  }

})

app.controller('businessManagement.seettings.bankId.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$rootScope) {
  $scope.gEmailForm = {name:'', typ:'bankIds'}
  $scope.mode = 'new'
  $scope.msg = 'Create'
  $scope.$on('GEmailUpdate', function(event, input) {
    console.log("recieved");
    console.log(input.data);
    $scope.msg = 'Update'
    $scope.gEmailForm = input.data
    $scope.mode = 'edit'

  });
  $scope.saveGEmail = function(){
    console.log('7777777777777777777',$scope.gEmailForm);
    if ($scope.gEmailForm.name == null || $scope.gEmailForm.name.length == 0) {
      Flash.create('warning', 'Please Mention The Email')
      return;
    }
    var method = 'POST'
    var url = '/api/HR/settingTypes/'
    if ($scope.mode == 'edit') {
      method = 'PATCH'
      url = url + $scope.gEmailForm.pk + '/'
    }
    dataToSend = {
      name : $scope.gEmailForm.name,
      typ : $scope.gEmailForm.typ,
    }
    $http({method : method , url : url, data : dataToSend }).
    then(function(response) {
      Flash.create('success', $scope.msg + 'd');
      $rootScope.$broadcast('forceRefetch', {});
      $scope.gEmailForm = {name:'', typ:'bankIds'}
      $scope.mode = 'new'
      $scope.msg = 'Create'
    })
  }

})

app.controller('businessManagement.seettings.socialId.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$rootScope) {
  $scope.sEmailForm = {name:'', typ:'socialIds'}
  $scope.mode = 'new'
  $scope.msg = 'Create'
  $scope.$on('SEmailUpdate', function(event, input) {
    console.log("recieved");
    console.log(input.data);
    $scope.msg = 'Update'
    $scope.sEmailForm = input.data
    $scope.mode = 'edit'

  });
  $scope.saveSEmail = function(){
    console.log('7777777777777777777',$scope.sEmailForm);
    if ($scope.sEmailForm.name == null || $scope.sEmailForm.name.length == 0) {
      Flash.create('warning', 'Please Mention The Email')
      return;
    }
    var method = 'POST'
    var url = '/api/HR/settingTypes/'
    if ($scope.mode == 'edit') {
      method = 'PATCH'
      url = url + $scope.sEmailForm.pk + '/'
    }
    dataToSend = {
      name : $scope.sEmailForm.name,
      typ : $scope.sEmailForm.typ,
    }
    $http({method : method , url : url, data : dataToSend }).
    then(function(response) {
      Flash.create('success', $scope.msg + 'd');
      $rootScope.$broadcast('forceRefetch', {});
      $scope.sEmailForm = {name:'', typ:'socialIds'}
      $scope.mode = 'new'
      $scope.msg = 'Create'
    })
  }

})
