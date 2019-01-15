app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.uiSettings', {
    url: "/uiSettings",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.uiSettings.html',
        controller: 'businessManagement.customerSettings',
      }
    }
  })
});


app.controller("settings.customerPrescripts", function($scope, $state,$permissions, $http, $rootScope, Flash, $timeout) {

  $http({
    method: 'GET',
    url: '/api/ERP/service/?contactPerson='+$scope.me.pk
  }).then(function(response) {
    $scope.services = response.data
    $scope.activeService = response.data[0]
    $scope.setActiveService($scope.activeService)
  })


  $scope.prescriptPerm = false;

  $timeout(function () {
    $scope.prescriptPerm =  $permissions.myPerms('module.prescript.createDelete')
  }, 1500);

  $scope.setActiveService = function (s) {
    $scope.activeService = s
    $http({
      method: 'GET',
      url: '/api/support/cannedResponses/?service=' + $scope.activeService.pk,
    }).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        response.data[i].display = false
        $scope.prescripts.push(response.data[i])
      }
    });
    $scope.prescripts = []
    $scope.prescriptForm = {
      text: '',
      service: $scope.activeService.pk
    }
  }

  $scope.editPrescript = function (p) {
    $scope.prescriptForm = p
  }


  $scope.savePrescript = function() {

    if ($scope.prescriptForm.text.length>200) {
      Flash.create('warning','prescript length is too long')
      return
    }

    if ($scope.prescriptForm.text != '') {

      if ($scope.prescriptForm.pk) {
        $http({
          method: 'PATCH',
          url: '/api/support/cannedResponses/'+$scope.prescriptForm.pk +'/',
          data: {text:$scope.prescriptForm.text}
        }).
        then(function(response) {
          response.data.display = false
          for (var i = 0; i < $scope.prescripts.length; i++) {
            if ($scope.prescripts[i].pk == response.data.pk) {
                $scope.prescripts[i] = response.data
            }
          }
          $scope.prescriptForm = {
            text: '',
            service: $scope.activeService.pk
          }
          Flash.create('success', 'Edited Successfully')
        });
      }else {
        $http({
          method: 'POST',
          url: '/api/support/cannedResponses/',
          data: $scope.prescriptForm
        }).
        then(function(response) {
          console.log(response.data);
          response.data.display = false
          $scope.prescripts.push(response.data)
          $scope.prescriptForm = {
            text: '',
            service: $scope.activeService.pk
          }
          Flash.create('success', 'Created Successfully')
        });
      }
    }else {
      Flash.create('warning', 'Prescipt can not be empty')
    }
  }


  $scope.deletePrescript = function (pk , indx) {
      $http({method : 'DELETE' , url : '/api/support/cannedResponses/' + pk +'/'}).
      then(function(response) {
        $scope.prescripts.splice(indx , 1);
        $scope.prescriptForm = {
          text: '',
          service: $scope.compDetails.pk
        }
        Flash.create('success', 'Deleted Successfully')
      })
  }

})

app.controller("businessManagement.customerSettings", function($scope, $state, $http, $rootScope, Flash) {

  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css: '/static/css/bootstrap.min.css',
    inline: false,
    plugins: 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme: 'modern',
    height: 200,
    toolbar: 'saveBtn publishBtn cancelBtn headerMode bodyMode | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
  };


  $rootScope.state = 'Settings';
  $scope.cpForm = {};
  $http({
    method: 'GET',
    url: '/api/support/reviewHomeCal/?customer&customerProfilePkList&offset=15&limit=15',
  }).
  then(function(response) {
    console.log(response.data);
    $http({
      method: 'GET',
      url: '/api/support/customerProfile/' + response.data[0] + '/',
    }).
    then(function(response) {
      console.log(response.data);
      $scope.cpForm = response.data
    });
  });

  $scope.saveCustomerProfile = function() {
    var fd = new FormData();
    fd.append('call', $scope.cpForm.call);
    fd.append('email', $scope.cpForm.email);
    fd.append('callBack', $scope.cpForm.callBack);
    fd.append('chat', $scope.cpForm.chat);
    fd.append('name', $scope.cpForm.name);
    fd.append('video', $scope.cpForm.video);
    fd.append('audio', $scope.cpForm.audio);
    fd.append('ticket', $scope.cpForm.ticket);
    fd.append('vr', $scope.cpForm.vr);
    fd.append('service', $scope.cpForm.service);

    if ($scope.cpForm.windowColor != '') {
      fd.append('windowColor', $scope.cpForm.windowColor);
    }
    if ($scope.cpForm.supportBubbleColor != '') {
      fd.append('supportBubbleColor', $scope.cpForm.supportBubbleColor);
    }
    if ($scope.cpForm.iconColor != '') {
      fd.append('iconColor', $scope.cpForm.iconColor);
    }
    if ($scope.cpForm.firstMessage != '') {
      fd.append('firstMessage', $scope.cpForm.firstMessage);
    }
    if ($scope.cpForm.dp && typeof $scope.cpForm.dp != 'string') {
      fd.append('dp', $scope.cpForm.dp);
    }

    if ($scope.cpForm.chatIconPosition != '') {
      fd.append('chatIconPosition', $scope.cpForm.chatIconPosition);
    }
    if ($scope.cpForm.chatIconType != '') {
      fd.append('chatIconType', $scope.cpForm.chatIconType);
    }

    $http({
      method: 'PATCH',
      url: '/api/support/customerProfile/' + $scope.cpForm.pk + '/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      console.log(response.data);
      Flash.create('success', 'Saved')

    });
  }
})
