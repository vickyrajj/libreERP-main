app.controller('home.manageUsers.mailAccount', function($scope, $http) {
  $scope.generateMailPasskey = function() {
    console.log($scope);
    console.log($scope.data);
    $http({
      method: 'PATCH',
      url: '/api/mail/account/' + $scope.data.mailAccount.pk + '/?user=' + $scope.data.mailAccount.user
    }).
    then(function(response) {
      $scope.data.mailAccount = response.data;
    });
  }
});



app.controller('sudo.manageUsers.editPayroll', function($scope, $http, Flash) {

  $scope.user = $scope.tab.data;

  $http({
    method: 'GET',
    url: '/api/HR/payroll/' + $scope.tab.data.payroll.pk + '/'
  }).
  then(function(response) {
    $scope.form = response.data;
  })

  $scope.save = function() {
    // make patch request
    var f = $scope.form;
    dataToSend = {
      user: f.pk,
      hra: f.hra,
      special: f.special,
      lta: f.lta,
      basic: f.basic,
      adHoc: f.adHoc,
      policyNumber: f.policyNumber,
      provider: f.provider,
      amount: f.amount,
      noticePeriodRecovery: f.noticePeriodRecovery,
      al: f.al,
      ml: f.ml,
      adHocLeaves: f.adHocLeaves,
      joiningDate: f.joiningDate.toJSON().split('T')[0],
      off: f.off,
      accountNumber: f.accountNumber,
      ifscCode: f.ifscCode,
      bankName: f.bankName,
      deboarded: f.deboarded,
      lastWorkingDate: f.lastWorkingDate.toJSON().split('T')[0],

    }

    $http({
      method: 'PATCH',
      url: '/api/HR/payroll/' + f.pk + '/',
      data: dataToSend
    }).
    then(function(response) {

      // $scope.data.pk=response.data.pk

      Flash.create('success', response.status + ' : ' + response.statusText);
      // }, function(response){
      //    Flash.create('danger', response.status + ' : ' + response.statusText);
    }, function(err) {

    })



  }




});


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
        // target is the url of the object
        if (typeof mode == 'undefined') {
          if (action == 'im') {
            $scope.$parent.$parent.addIMWindow(target);
          } else if (action == 'editProfile') {
            console.log(target,'-----------pk of item');
            for (var i = 0; i < $scope.data.tableData.length; i++) {
              if ($scope.data.tableData[i].pk == target) {
                u = $users.get(target)
                $http.get('/api/HR/users/' + target + '/').
                success((function(target) {
                  return function(response) {
                    $scope.form = response
                    console.log($scope.form,'---------------respppppp in scoppppppp');
                    console.log(response);
                    u = $users.get(target)
                    $scope.addTab({
                      title: 'Edit Profile for ' + u.first_name + ' ' + u.last_name,
                      cancel: true,
                      app: 'editProfile',
                      data: response,
                      active: true
                    })

                    console.log($scope.tabs);
                  }
                })(target));
              }
            }

          } else if (action == 'social') {
            $state.go('home.social', {
              id: target
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
          } else if (action == 'editDesignation') {
            for (var i = 0; i < $scope.data.tableData.length; i++) {
              if ($scope.data.tableData[i].pk == target) {
                u = $users.get(target)
                $http.get('/api/HR/designation/' + $scope.data.tableData[i].designation + '/').
                success((function(target) {
                  return function(response) {
                    response.userPK = target;
                    // console.log(target);
                    u = $users.get(target)
                    console.log("will add tab profile : ");
                    console.log(response);
                    $scope.addTab({
                      title: 'Edit Designation for ' + u.first_name + ' ' + u.last_name,
                      cancel: true,
                      app: 'editDesignation',
                      data: response,
                      active: true
                    })

                    console.log($scope.tabs);
                  }
                })(target));
              }
            }
          } else if (action == 'editPayroll') {
            for (var i = 0; i < $scope.data.tableData.length; i++) {
              if ($scope.data.tableData[i].pk == target) {
                u = $users.get(target)
                $http.get('/api/HR/payroll/' + $scope.data.tableData[i].payroll.pk + '/').
                success((function(target) {
                  return function(response) {
                    u = $users.get(target)
                    console.log("will add tab payroll : ");
                    console.log(response);
                    $scope.addTab({
                      title: 'Edit payroll for ' + u.first_name + ' ' + u.last_name,
                      cancel: true,
                      app: 'editPayroll',
                      data: response,
                      active: true
                    })

                    console.log($scope.tabs);

                  }
                })(target));
              }
            }
          }
          // for the single select actions
        } else {
          if (mode == 'multi') {
            console.log(target);
            console.log(action);
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

      $scope.updateProfile = function(index) {
        var data = $scope.tabs[index].data.tutors24Profile;
        console.log('hdsfhdsvfhsvdfhvsdjk', index, '------and pk iiiiiiisssssss',data.pk);
        var fd = new FormData();
        fd.append('typ', data.typ);
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


        $scope.editDesignation = function(index) {
          // var userData = $scope.tabs[index].data;
          // dataToSend = {
          //
          //
          // }
          // if (userData.password != '') {
          //   dataToSend.password = userData.password
          // }
          // $http({method : 'PATCH' , url : userData.url.replace('users' , 'usersAdminMode') , data : dataToSend }).
          // then(function(response){
          //    Flash.create('success', response.status + ' : ' + response.statusText);
          // }, function(response){
          //    Flash.create('danger', response.status + ' : ' + response.statusText);
          // });
        }

        $scope.Reporting = function(query) {
          // console.log('************',query);
          console.log("@@@@@@@@@@@@@@");
          return $http.get('/api/HR/users/?username__contains=' + query).
          then(function(response) {
            console.log('@', response.data)
            return response.data;
          })
        };








        $scope.save = function() {
          console.log('entered');
          var f = $scope.form;
          var toSend = {
            'reportingTo': f.reportingTo.pk,
            'primaryApprover': f.primaryApprover.pk,
            'secondaryApprover': f.secondaryApprover.pk,
          }
          console.log('222222222', toSend);

          $scope.me = $users.get('mySelf');
          $http({
            method: 'POST',
            url: '/api/HR/designation/',
            data: toSend,
          }).
          then(function(response) {
            $scope.form.pk = response.data.pk;
            Flash.create('success', 'Saved')
            // $scope.fetchData();
            //  $scope.$broadcast('forceRefetch',)
            //    $scope.$broadcast('forcerefresh', response.data);
            //  $route.reload();
          })
        }
        //
        // var name=$scope.tabs[index].data;
        // console.log('@@@@@@@@@@@@@@@@',name);







        // $scope.editPayroll = function(index){
        //   var userData = $scope.tabs[index].data;
        //   dataToSend = {
        //     user : userData.pk,
        //     // last_name : userData.last_name,
        //     // first_name : userData.first_name,
        //     // is_staff : userData.is_staff,
        //     // is_active : userData.is_active,
        //     hra : userData.hra,
        //     special : userData.special,
        //     lta : userData.lta,
        //     basic : userData.basic,
        //     adHoc : userData.adHoc,
        //     policyNumber : userData.policyNumber,
        //     provider : userData.provider,
        //     amount : userData.amount,
        //     noticePeriodRecovery : userData.noticePeriodRecovery,
        //     al : userData.al,
        //     ml : userData.ml,
        //     adHocLeaves : userData.adHocLeaves,
        //     joiningDate : userData.joiningDate.toJSON().split('T')[0],
        //     off : userData.off,
        //     accountNumber : userData.accountNumber,
        //     ifscCode : userData.ifscCode,
        //     bankDetais : userData.bankName,
        //
        //
        //   }
        //   // if (userData.password != '') {
        //   //   dataToSend.password = userData.password
        //   // }
        //   $http({method : 'POST' , url :'/api/HR/payroll/'  , data : dataToSend }).
        //   then(function(response){
        //     console.log('before',$scope.data);
        //     $scope.data.pk=response.data.pk
        //     console.log('0000',$scope.data);
        //      Flash.create('success', response.status + ' : ' + response.statusText);
        //   }, function(response){
        //      Flash.create('danger', response.status + ' : ' + response.statusText);
        //   });
        // }


      });


    app.controller('controller.profile', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout) {

      $scope.data = $scope.tab.data;
      console.log($scope.data);


      console.log('aaaaaaaaaaaaaaaaaaaaaa', $scope.data.pk);
      $http({
        method: 'GET',
        url: '/api/HR/payroll/?user=' + $scope.data.userPK
      }).
      then(function(response) {
        $scope.payroll = response.data[0];
        console.log($scope.payroll);
      })
      console.log('((((((((((((((()))))))))))))))', $scope.data.userPK);
      $http({
        method: 'GET',
        url: '/api/HR/designation/?user=' + $scope.data.userPK
      }).
      then(function(response) {
        console.log(response.data, '&&&&&&&&&&&&&&&&&&&&&&&7');
        $scope.designation = response.data[0];
        console.log($scope.designation);


        if (typeof $scope.designation.division == 'number') {
          $http({
            method: 'GET',
            url: '/api/organization/divisions/' + $scope.designation.division + '/'
          }).
          then(function(response) {
            $scope.designation.division = response.data;
          })
        }

        if (typeof $scope.designation.unit == 'number') {
          $http({
            method: 'GET',
            url: '/api/organization/unit/' + $scope.designation.unit + '/'
          }).
          then(function(response) {
            $scope.designation.unit = response.data;
          })

        }

      })




    });
