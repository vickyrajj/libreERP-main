app.controller('home.manageUsers', function($scope, $http, $aside, $state, Flash, $users, $filter) {

  var views = [{
    name: 'table',
    icon: 'fa-bars',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.HR.users.item.html',
  }, ];



  var multiselectOptions = [];

  $scope.config = {
    url: '/api/HR/users/',
    views: views,
    multiselectOptions: multiselectOptions,
    searchField: 'username',
    itemsNumPerView: [6, 12, 24],
  };

  $scope.tabs = [];
  $scope.searchTabActive = true;
  $scope.data = {
    tableData: []
  };

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {

      if ($scope.tabs[i].app == input.app) {
        if ((typeof $scope.tabs[i].data.url != 'undefined' && $scope.tabs[i].data.url == input.data.url) || (typeof $scope.tabs[i].data.pk != 'undefined' && $scope.tabs[i].data.pk == input.data.pk)) {
          $scope.tabs[i].active = true;
          alreadyOpen = true;
        }
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }




  // create new user
  $scope.newUser = {
    username: '',
    firstName: '',
    lastName: '',
    password: ''
  };
  $scope.createUser = function() {
    dataToSend = {
      username: $scope.newUser.username,
      first_name: $scope.newUser.firstName,
      last_name: $scope.newUser.lastName,
      password: $scope.newUser.password
    };
    $http({
      method: 'POST',
      url: '/api/HR/usersAdminMode/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
      $scope.newUser = {
        username: '',
        firstName: '',
        lastName: '',
        password: ''
      };
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }


  $scope.tableAction = function(target, action, mode) {
    if (typeof mode == 'undefined') {
      if (action == 'editProfile') {
        u = $users.get(target)
        $scope.addTab({
          title: 'Edit Profile for ' + u.first_name + ' ' + u.last_name,
          cancel: true,
          app: 'editProfile',
          data: u,
          active: true
        })
      } else if (action == 'editMaster') {
        var userData = $users.get(target)
        console.log(target);
        $scope.addTab({
          title: 'Edit master data  for ' + userData.first_name + ' ' + userData.last_name,
          cancel: true,
          app: 'editMaster',
          data: userData,
          active: true
        })
      } else if (action == 'editPermissions') {
        u = $users.get(target)
        $http.get('/api/ERP/application/?user=' + u.username).
        success((function(target) {
          return function(data) {
            u = $users.get(target)
            permissionsFormData = {
              appsToAdd: data,
              url: target,
            }
            $scope.addTab({
              title: 'Edit permissions for ' + u.first_name + ' ' + u.last_name,
              cancel: true,
              app: 'editPermissions',
              data: permissionsFormData,
              active: true
            })
          }
        })(target));
      } else if (action == 'profile') {
        var userData = $users.get(target)
        console.log(target, '--------------dsjhvfshdfhsdvfhsvdfhdsvh');
        $scope.addTab({
          title: 'View profile ' + userData.first_name + ' ' + userData.last_name,
          cancel: true,
          app: 'profile',
          data: userData,
          active: true
        })
      }
    }
  }

  $scope.updateUserPermissions = function(index) {
    var userData = $scope.tabs[index].data;
    if (userData.appsToAdd.length == 0) {
      Flash.create('warning', 'No new permission to add')
      return;
    }
    var apps = [];
    for (var i = 0; i < userData.appsToAdd.length; i++) {
      apps.push(userData.appsToAdd[i].pk)
    }
    var dataToSend = {
      user: getPK(userData.url),
      apps: apps,
    }
    $http({
      method: 'POST',
      url: '/api/ERP/permission/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })

  }

  $scope.getPermissionSuggestions = function(query) {
    return $http.get('/api/ERP/application/?name__contains=' + query)
  }

  $scope.updateUserMasterDetails = function(index) {
    var userData = $scope.tabs[index].data;
    dataToSend = {
      username: userData.username,
      last_name: userData.last_name,
      first_name: userData.first_name,
      is_staff: userData.is_staff,
      is_active: userData.is_active,
    }
    if (userData.password != '') {
      dataToSend.password = userData.password
    }
    $http({
      method: 'PATCH',
      url: userData.url.replace('users', 'usersAdminMode'),
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }


});


app.controller('controller.manageUsers.editProfile', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout) {
  console.log($scope.tab);
  $scope.form = $scope.tab.data.tutors24Profile;

  console.log($scope.form);

  $scope.form.is_tutor = true;
  if ($scope.form.typ == 'S') {
    $scope.form.is_tutor = false;
  }

  $scope.updateProfile = function(index) {
    var data = $scope.form;

    var fd = new FormData();

    if ($scope.form.is_tutor) {
      fd.append('typ', 'T');
    } else {
      fd.append('typ', 'S');
    }
    fd.append('school', data.school);
    fd.append('schoolName', data.schoolName);
    fd.append('standard', data.standard);
    fd.append('street', data.street);
    fd.append('city', data.city);
    fd.append('pinCode', data.pinCode);
    fd.append('state', data.state);
    fd.append('country', data.country);
    fd.append('parentEmail', data.parentEmail);
    fd.append('parentMobile', data.parentMobile);
    fd.append('detail', data.detail);
    $http({
      method: 'PATCH',
      url: '/api/tutors/tutors24Profile/' + data.pk + '/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
    })
  };




})


app.controller('controller.profile', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout) {

  $scope.data = $scope.tab.data;
  $scope.profile = $scope.data.profile;
  $scope.tutorData = $scope.data.tutors24Profile;
  $scope.detail = $scope.data.tutors24Profile.detail.split("||");
});
