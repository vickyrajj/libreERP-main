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

app.controller("businessManagement.customerSettings", function($scope, $state, $http, $rootScope) {

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
    url: '/api/support/reviewHomeCal/?customer&customerProfilePkList',
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
    fd.append('videoAndAudio', $scope.cpForm.videoAndAudio);
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
    });
  }
})
