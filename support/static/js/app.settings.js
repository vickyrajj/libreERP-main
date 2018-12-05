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

// app.controller("support.products.form", function($scope, $state, $users, $stateParams, $http, Flash, $rootScope ,$permissions , $timeout ,) {
//
//   $scope.form={sheet:emptyFile}
//   $scope.uploadSheet = function(){
//     if ($scope.form.sheet == emptyFile) {
//        Flash.create('warning' , 'Please Select File');
//        return
//     }
//
//     var fd = new FormData();
//     fd.append('excelFile', $scope.form.sheet);
//
//     $http({
//       method: 'POST',
//       url: 'api/support/ProductsUpload/',
//       data: fd,
//       transformRequest: angular.identity,
//       headers: {
//         'Content-Type': undefined
//       }
//     }).
//     then(function(response) {
//       $scope.form = {sheet:emptyFile};
//       Flash.create('success', 'Saved')
//       // $uibModalInstance.dismiss();
//     })
//
//   }
// })

app.controller("businessManagement.settings", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {

  $scope.data = {
    tableData: []
  };


  views = [{
    name: 'table',
    icon: 'fa-bars',
    template: '/static/ngTemplates/genericTable/tableDefault.html',
  }, ];


  var multiselectOptions = [{
    icon: 'fa fa-plus',
    text: 'upload'
  }, ];



  $scope.config = {
    views: views,
    url: '/api/support/products/',
    searchField: 'part_no',
    fields: ['part_no', 'weight', 'price', 'description_2', 'description_1'],
    checkbox: false,
    multiselectOptions: multiselectOptions,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    if (action == 'upload') {

      $scope.uploadProduct()
    }
  }

  $scope.uploadProduct = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.settings.products.html',
      size: 'lg',

      controller: function($scope, $uibModalInstance) {
        $scope.form = {
          sheet: emptyFile
        }
        $scope.uploadSheet = function() {
          if ($scope.form.sheet == emptyFile) {
            Flash.create('warning', 'Please Select File');
            return
          }

          var fd = new FormData();
          fd.append('excelFile', $scope.form.sheet);

          $http({
            method: 'POST',
            url: 'api/support/ProductsUpload/',
            data: fd,
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            $scope.form = {
              sheet: emptyFile
            };
            Flash.create('success', 'Saved')
            $uibModalInstance.dismiss();
          })

        }

      },
    });
  }

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

app.controller('businessManagement.seettings.mcgGeneralise', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $rootScope) {

  $scope.generaliseMsg = function() {
    $http({
      method: 'GET',
      url: '/api/HR/smsClassifier/'
    }).
    then(function(response) {
      console.log(response.data);
      Flash.create('success', 'Generalised Sucessfully');
    })
  }

})

app.controller('businessManagement.seettings.negativeKeywords.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $rootScope) {
  $scope.wordForm = {
    name: '',
    typ: 'negativeWord'
  }
  $scope.mode = 'new'
  $scope.msg = 'Create'
  $scope.$on('keyWordUpdate', function(event, input) {
    console.log("recieved");
    console.log(input.data);
    $scope.msg = 'Update'
    $scope.wordForm = input.data
    $scope.mode = 'edit'

  });
  $scope.saveKeyWord = function() {
    console.log('7777777777777777777', $scope.wordForm);
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
      name: $scope.wordForm.name,
      typ: $scope.wordForm.typ,
    }
    $http({
      method: method,
      url: url,
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', $scope.msg + 'd');
      $rootScope.$broadcast('forceRefetch', {});
      $scope.wordForm = {
        name: '',
        typ: 'negativeWord'
      }
      $scope.mode = 'new'
      $scope.msg = 'Create'
    })
  }

})

app.controller('businessManagement.seettings.bankId.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $rootScope) {
  $scope.gEmailForm = {
    name: '',
    typ: 'bankIds'
  }
  $scope.mode = 'new'
  $scope.msg = 'Create'
  $scope.$on('GEmailUpdate', function(event, input) {
    console.log("recieved");
    console.log(input.data);
    $scope.msg = 'Update'
    $scope.gEmailForm = input.data
    $scope.mode = 'edit'

  });
  $scope.saveGEmail = function() {
    console.log('7777777777777777777', $scope.gEmailForm);
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
      name: $scope.gEmailForm.name,
      typ: $scope.gEmailForm.typ,
    }
    $http({
      method: method,
      url: url,
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', $scope.msg + 'd');
      $rootScope.$broadcast('forceRefetch', {});
      $scope.gEmailForm = {
        name: '',
        typ: 'bankIds'
      }
      $scope.mode = 'new'
      $scope.msg = 'Create'
    })
  }

})

app.controller('businessManagement.seettings.socialId.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $rootScope) {
  $scope.sEmailForm = {
    name: '',
    typ: 'socialIds'
  }
  $scope.mode = 'new'
  $scope.msg = 'Create'
  $scope.$on('SEmailUpdate', function(event, input) {
    console.log("recieved");
    console.log(input.data);
    $scope.msg = 'Update'
    $scope.sEmailForm = input.data
    $scope.mode = 'edit'

  });
  $scope.saveSEmail = function() {
    console.log('7777777777777777777', $scope.sEmailForm);
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
      name: $scope.sEmailForm.name,
      typ: $scope.sEmailForm.typ,
    }
    $http({
      method: method,
      url: url,
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', $scope.msg + 'd');
      $rootScope.$broadcast('forceRefetch', {});
      $scope.sEmailForm = {
        name: '',
        typ: 'socialIds'
      }
      $scope.mode = 'new'
      $scope.msg = 'Create'
    })
  }

})
