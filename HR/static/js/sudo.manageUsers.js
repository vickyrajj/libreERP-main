app.controller('admin.manageUsers.mailAccount', function($scope, $http) {
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

app.controller('sudo.manageUsers.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout) {

  $scope.data = $scope.tab.data;
  console.log($scope.data);


  $http({
    method: 'GET',
    url: '/api/HR/payroll/?user=' + $scope.data.userPK
  }).
  then(function(response) {
    $scope.payroll = response.data[0];
    console.log($scope.payroll);
  })
  $http({
    method: 'GET',
    url: '/api/HR/designation/?user=' + $scope.data.userPK
  }).
  then(function(response) {
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

app.controller('sudo.manageUsers.editPayroll', function($scope, $http, Flash, $users) {
  console.log($scope.tab.data);
  $scope.user = $users.get($scope.tab.data.user);

  $scope.form = $scope.tab.data;
  $scope.save = function() {
    console.log(typeof $scope.form.joiningDate);
    // make patch request
    var f = $scope.form;
    dataToSend = {
      // user: f.pk,
      hra: f.hra,
      special: f.special,
      lta: f.lta,
      basic: f.basic,
      taxSlab: f.taxSlab,
      adHoc: f.adHoc,
      policyNumber: f.policyNumber,
      provider: f.provider,
      amount: f.amount,
      noticePeriodRecovery: f.noticePeriodRecovery,
      notice: f.notice,
      probation: f.probation,
      probationNotice: f.probationNotice,
      al: f.al,
      ml: f.ml,
      adHocLeaves: f.adHocLeaves,
      off: f.off,
      accountNumber: f.accountNumber,
      ifscCode: f.ifscCode,
      bankName: f.bankName,
      deboarded: f.deboarded,
      PFUan: f.PFUan,
      pan: f.pan,


    }

    if (typeof f.joiningDate == 'object') {
      dataToSend.joiningDate = f.joiningDate.toJSON().split('T')[0]
    } else {
      dataToSend.joiningDate = f.joiningDate
    }

    // if (typeof f.lastWorkingDate == 'object') {
    //   dataToSend.lastWorkingDate = f.lastWorkingDate.toJSON().split('T')[0]
    // } else {
    //   dataToSend.lastWorkingDate = f.lastWorkingDate
    // }

    if (f.lastWorkingDate != null) {
      dataToSend.lastWorkingDate = f.lastWorkingDate.toJSON().split('T')[0]
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

app.controller('sudo.manageUsers.editDesignation', function($scope, $http, Flash, $users) {

  // $scope.user = $users.get($scope.tab.data.user);

  $scope.divisionSearch = function(query) {
    return $http.get('/api/organization/divisions/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data);
      return response.data;
    })
  };

  $scope.unitSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/unit/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };

  $scope.depSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/departments/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };

  $scope.roleSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/role/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };

  $scope.form = $scope.tab.data;

  if (typeof $scope.form.reportingTo == 'number') {
    $scope.form.reportingTo = $users.get($scope.form.reportingTo);
  }

  if (typeof $scope.form.secondaryApprover == 'number') {
    $scope.form.secondaryApprover = $users.get($scope.form.secondaryApprover);
  }

  if (typeof $scope.form.primaryApprover == 'number') {
    $scope.form.primaryApprover = $users.get($scope.form.primaryApprover);
  }
  if (typeof $scope.form.division == 'number') {
    $http({
      method: 'GET',
      url: '/api/organization/divisions/' + $scope.form.division + '/'
    }).
    then(function(response) {
      $scope.form.division = response.data;
    })
  }

  if (typeof $scope.form.unit == 'number') {
    $http({
      method: 'GET',
      url: '/api/organization/unit/' + $scope.form.unit + '/'
    }).
    then(function(response) {
      $scope.form.unit = response.data;
    })
  }

  if (typeof $scope.form.department == 'number') {
    $http({
      method: 'GET',
      url: '/api/organization/departments/' + $scope.form.department + '/'
    }).
    then(function(response) {
      $scope.form.department = response.data;
    })
  }

  if (typeof $scope.form.role == 'number') {
    $http({
      method: 'GET',
      url: '/api/organization/role/' + $scope.form.role + '/'
    }).
    then(function(response) {
      $scope.form.role = response.data;
    })
  }





  console.log('pppppppppppppppppppp', $scope.tab.data);
  $scope.save = function() {
    // make patch request
    var f = $scope.form;
    console.log(f);
    dataToSend = {
      // user: f.pk,
      // reportingTo: f.reportingTo.pk,
      // primaryApprover: f.primaryApprover.pk,
      // secondaryApprover: f.secondaryApprover.pk,
      // division: f.division.pk,
      // unit: f.unit.pk,
      // department: f.department.pk,
      // role: f.role.pk

    }
    if (f.reportingTo != null && typeof f.reportingTo == 'object') {
      dataToSend.reportingTo = f.reportingTo.pk
    }
    if (f.primaryApprover != null && typeof f.primaryApprover == 'object') {
      dataToSend.primaryApprover = f.primaryApprover.pk
    }
    if (f.secondaryApprover != null && typeof f.secondaryApprover == 'object') {
      dataToSend.secondaryApprover = f.secondaryApprover.pk
    }
    if (f.division != null && typeof f.division == 'object') {
      dataToSend.division = f.division.pk
    }
    if (f.unit != null && typeof f.unit == 'object') {
      dataToSend.unit = f.unit.pk
    }
    if (f.department != null && typeof f.department == 'object') {
      dataToSend.department = f.department.pk
    }
    if (f.role != null && typeof f.role == 'object') {
      dataToSend.role = f.role.pk
    }
    console.log(dataToSend);
    $http({
      method: 'PATCH',
      url: '/api/HR/designation/' + f.pk + '/',
      data: dataToSend
    }).
    then(function(response) {

      // $scope.form.pk = response.data.pk;
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(err) {})
  }



  // Kra controller
  $scope.kraForm = {
    responsibility: '',
    target: 0,
    period: 'yearly',
    KRAs: []
  }

  $scope.resetForm = function() {
    $scope.kraForm.responsibility = '';
    $scope.kraForm.target = 0;
    $scope.kraForm.period = 'yearly';
  }

  $http({
    method: 'GET',
    url: '/api/organization/KRA/?user=' + $scope.form.userPK
  }).
  then(function(response) {
    $scope.kraForm.KRAs = response.data;
    console.log('kraaaaaaaaaaaaaa', $scope.kraForm.KRAs);
  })


  $scope.responsibilitySearch = function(query) {
    return $http.get('/api/organization/responsibility/?title__contains=' + query).
    then(function(response) {
      return response.data;
    })
  }

  $scope.saveKra = function() {

    var f = $scope.kraForm;
    console.log('kraaaaaaaa', f);
    if (f.responsibility == null || f.responsibility.length == 0) {
      Flash.create('warning', 'Responsibility Is required');
      return
    }
    if (f.target == null || f.target.length == 0) {
      Flash.create('warning', 'Target Is required');
      return
    }
    var toSend = {
      target: f.target,
      period: f.period,
      user: $scope.form.userPK
    }
    if (typeof f.responsibility == 'object') {
      toSend.responsibility = f.responsibility.pk
    }

    var method = 'POST';
    var url = '/api/organization/KRA/';
    if (typeof f.pk != 'undefined') {
      method = 'PATCH';
      url += f.pk + '/';
    }
    console.log(toSend);

    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      $scope.kraForm.KRAs.push(response.data);
      $scope.resetForm();
      if ($scope.kraForm.pk) {
        delete $scope.kraForm.pk
      }

    }, function(err) {
      Flash.create('danger', 'Already assigned , Please edit if required');
    });


  }

  $scope.saveWeightage = function() {
    var a = 0
    for (var i = 0; i < $scope.kraForm.KRAs.length; i++) {
      console.log($scope.kraForm.KRAs[i].weightage, typeof $scope.kraForm.KRAs[i].weightage);
      a = a + $scope.kraForm.KRAs[i].weightage
    }
    console.log(a);
    if (a > 100) {
      Flash.create('warning', 'Sum should be lessthan 100');
      return
    } else {
      for (var i = 0; i < $scope.kraForm.KRAs.length; i++) {
        console.log('weighttttttttttttt', $scope.kraForm.KRAs[i].weightage);
        var toSend = {
          target: $scope.kraForm.KRAs[i].target,
          period: $scope.kraForm.KRAs[i].period,
          weightage: $scope.kraForm.KRAs[i].weightage
        }
        $http({
          method: 'PATCH',
          url: '/api/organization/KRA/' + $scope.kraForm.KRAs[i].pk + '/',
          data: toSend
        }).
        then(function(response) {
          Flash.create('success', 'Saved');
        });
      }
    }
  }

  $scope.deleteKRA = function(indx) {
    $http({
      method: 'DELETE',
      url: '/api/organization/KRA/' + $scope.kraForm.KRAs[indx].pk
    }).
    then((function(indx) {
      return function(response) {
        $scope.kraForm.KRAs.splice(indx, 1);
        Flash.create('danger', 'Removed');
      }
    })(indx))
  }

  $scope.editKRA = function(indx) {
    $scope.kraForm.responsibility = $scope.kraForm.KRAs[indx].responsibility;
    $scope.kraForm.target = $scope.kraForm.KRAs[indx].target;
    $scope.kraForm.period = $scope.kraForm.KRAs[indx].period;
    $scope.kraForm.pk = $scope.kraForm.KRAs[indx].pk;
    $scope.kraForm.KRAs.splice(indx, 1);
  }



});



app.controller('sudo.admin.editProfile', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout) {

  $scope.page = 1;
  $scope.maxPage = 3;
  console.log($scope.tab);

  $scope.data = $scope.tab.data;
  $scope.next = function() {
    console.log("came to next");
    if ($scope.page < $scope.maxPage) {
      $scope.page += 1;
    }
  }

  $scope.prev = function() {
    if ($scope.page > 1) {
      $scope.page -= 1;
    }
  }

  $scope.files = {
    "displayPicture": emptyFile,
  }

  $scope.saveFirstPage = function() {
    var prof = $scope.data;
    console.log($scope.data);
    var fd = new FormData();


    if (prof.empID=='') {
      Flash('success' , 'Please fill eemployee id')
      return
    }
    fd.append('empID', prof.empID)
    fd.append('prefix', prof.prefix)
    fd.append('gender', prof.gender)
    fd.append('displayPicture', $scope.files.displayPicture)




    // var dataToSend = {
    //   empID: prof.empID,
    //   prefix: prof.prefix,
    //   dateOfBirth: prof.dateOfBirth.toJSON().split('T')[0],
    //
    //   gender: prof.gender,
    //   permanentAddressStreet: prof.permanentAddressStreet,
    //   permanentAddressCity: prof.permanentAddressCity,
    //   permanentAddressPin: prof.permanentAddressPin,
    //   permanentAddressState: prof.permanentAddressState,
    //   permanentAddressCountry: prof.permanentAddressCountry,
    //   sameAsShipping: prof.sameAsShipping,
    //   localAddressStreet: prof.localAddressStreet,
    //   localAddressCity: prof.localAddressCity,
    //   localAddressPin: prof.localAddressPin,
    //   localAddressState: prof.localAddressState,
    //   localAddressCountry: prof.localAddressCountry,
    //   email: prof.email,
    //   mobile: prof.mobile,
    //   emergency: prof.emergencyName + '::' + prof.emergencyNumber,
    //   bloodGroup: prof.bloodGroup,
    // }


    // if (prof.married) {
    //   console.log(prof.anivarsary, typeof prof.anivarsary);
    //   dataToSend.married = prof.married;
    //   if (typeof prof.anivarsary == 'object') {
    //     dataToSend.anivarsary = prof.anivarsary.toJSON().split('T')[0]
    //   } else {
    //     dataToSend.anivarsary = prof.anivarsary
    //   }
    // }

    // if (typeof prof.dateOfBirth == 'object') {
    //   dataToSend.dateOfBirth = prof.dateOfBirth.toJSON().split('T')[0]
    // } else {
    //   dataToSend.dateOfBirth = prof.dateOfBirth
    // }

    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + prof.pk + '/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', "Saved");
    })


  }

  // $scope.saveSecondPage = function() {
  //
  //
  //   var f = $scope.data;
  //   var dataToSend = {
  //     website: f.website,
  //     almaMater: f.almaMater,
  //     pgUniversity: f.pgUniversity,
  //     docUniversity: f.docUniversity,
  //     fathersName: f.fathersName,
  //     mothersName: f.mothersName,
  //     wifesName: f.wifesName,
  //     childCSV: f.childCSV,
  //     note1: f.note1,
  //     note2: f.note2,
  //     note3: f.note3,
  //   }
  //
  //   $http({
  //     method: 'PATCH',
  //     url: '/api/HR/profileAdminMode/' + f.pk + '/',
  //     data: dataToSend
  //   }).
  //   then(function(response) {
  //     Flash.create('success', "Saved");
  //   })
  //
  // }

  $scope.files = {
    "displayPicture": emptyFile,
    // 'TNCandBond': emptyFile,
    // 'resume': emptyFile,
    // 'certificates': emptyFile,
    // 'transcripts': emptyFile,
    // 'otherDocs': emptyFile,
    // 'resignation': emptyFile,
    // 'vehicleRegistration': emptyFile,
    // 'appointmentAcceptance': emptyFile,
    // 'pan': emptyFile,
    // 'drivingLicense': emptyFile,
    // 'cheque': emptyFile,
    // 'passbook': emptyFile,
    // 'sign': emptyFile,
    // 'IDPhoto': emptyFile
  }

  $scope.saveFiles = function() {
    var f = $scope.files;
    var fd = new FormData();

    var fileFields = ['displayPicture', 'TNCandBond', 'resume', 'certificates', 'transcripts', 'otherDocs', 'resignation', 'vehicleRegistration', 'appointmentAcceptance', 'pan', 'drivingLicense', 'cheque', 'passbook', 'sign', 'IDPhoto']
    for (var i = 0; i < fileFields.length; i++) {
      if ($scope.files[fileFields[i]] != emptyFile) {
        fd.append(fileFields[i], $scope.files[fileFields[i]])
      }
    }
    if (fd.displayPicture == null || fd.displayPicture == emptyFile || typeof fd.displayPicture == 'string') {
      delete fd.displayPicture
    }

    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + $scope.data.pk + '/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      console.log(response);
      Flash.create('success', "Saved");

    })
  }

  $scope.save = function() {
     $scope.saveFirstPage();
    // if ($scope.page == 1) {
    //   $scope.saveFirstPage();
    // } else if ($scope.page == 2) {
    //   $scope.saveSecondPage();
    // } else {
    //   $scope.saveFiles();
    // }
  }

});


app.controller('admin.editCustomer',function($scope,$http,Flash){

if (typeof $scope.tab != 'undefined') {
  console.log($scope.tab.data);


  $scope.newCustomer = $scope.tab.data
  // $scope.newCustomer.password = ''
  $scope.newCustomer.access='full_access';


  // $scope.newCustomer=$scope.data.tableData[$scope.tab.data.index];
  // console.log($scope.newCustomer);
  $scope.mode = 'edit';


}else {
  $scope.mode = 'new';
  $scope.newCustomer = {
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    email:'',
    access: 'full_access'
  };

}

  $scope.full_access_app = [];
  $scope.rest_access_app = [];

  $http({
    method: 'GET',
    url: '/api/organization/role/?name__icontains=Full Access',
  }).
  then(function(response) {
    console.log(response.data);
    for (var i = 0; i < response.data[0].applications.length; i++)
      $scope.full_access_app[i] = response.data[0].applications[i].pk;
    console.log($scope.full_access_app);
  });


  $http({
    method: 'GET',
    url: '/api/organization/role/?name__icontains=Restricted Access',
  }).
  then(function(response) {
    console.log(response.data);
    for (var i = 0; i < response.data[0].applications.length; i++)
      $scope.rest_access_app[i] = response.data[0].applications[i].pk;
    console.log($scope.rest_access_app);
  });


  $scope.createCustomer = function() {
    $scope.$broadcast('forceRefetch',)


    //
    // if ($scope.newCustomer.password=='') {
    //   Flash.create('warning', "password cannot be empty" )
    //   return
    // }
    //
    // if ($scope.newCustomer.access == undefined) {
    //   Flash.create('warning', "password cannot be empty" )
    //   return
    // }
    console.log($scope.newCustomer);

    // return

    dataToSend = {
      username: $scope.newCustomer.username,
      first_name: $scope.newCustomer.first_name,
      last_name: $scope.newCustomer.last_name,
      password: $scope.newCustomer.password,
      email:$scope.newCustomer.email
    };


    if ($scope.newCustomer.access == 'full_access')
      $scope.app = $scope.full_access_app
    else {
      $scope.app = $scope.rest_access_app;
    }


    if ($scope.mode == 'new') {
      $scope.method="POST";
      $scope.urlCust='/api/HR/usersAdminMode/'
      // $scope.urlPerm =
    }else {
      $scope.method="PATCH"
      $scope.urlCust='/api/HR/usersAdminMode/'+$scope.newCustomer.pk+'/'
      // $scope.urlPerm =
      dataToSend.is_staff =  $scope.newCustomer.is_staff
      dataToSend.is_active =  $scope.newCustomer.is_active
      dataToSend.email =  $scope.newCustomer.email
    }

    console.log(dataToSend);

    $http({
      method: $scope.method,
      url: $scope.urlCust,
      data: dataToSend
    }).then(function(response) {

      $http({
        method: 'POST',
        url: '/api/ERP/permission/',
        data: {
          apps: $scope.app,
          user: response.data.pk
        }
      }).then(function(resp) {
        console.log(resp.data);

      })

      Flash.create('success', response.status + ' : ' + response.statusText);
      console.log(response.data);


      if ($scope.mode == 'new') {
        $scope.newCustomer = {
          username: '',
          firstName: '',
          lastName: '',
          password: '',
          access: 'full_access'
        };
      }

    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }


})



app.controller('admin.manageUsers', function($scope, $http, $aside, $state, Flash, $users, $filter) {

  // var views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
  //     {name : 'thumbnail' , icon : 'fa-th-large' , template : '/static/ngTemplates/empSearch/tableThumbnail.html'},
  //     {name : 'icon' , icon : 'fa-th' , template : '/static/ngTemplates/empSearch/tableIcon.html'},
  //     {name : 'graph' , icon : 'fa-pie-chart' , template : '/static/ngTemplates/empSearch/tableGraph.html'}
  //   ];

  var views = [{
      name: 'table',
      icon: 'fa-bars',
      template: '/static/ngTemplates/genericTable/genericSearchList.html',
      itemTemplate: '/static/ngTemplates/app.HR.manage.users.items.html'
    },
    // {name : 'thumbnail' , icon : 'fa-th-large' , template : '/static/ngTemplates/empSearch/tableThumbnail.html'},
    // {name : 'icon' , icon : 'fa-th' , template : '/static/ngTemplates/empSearch/tableIcon.html'},
    // {name : 'graph' , icon : 'fa-pie-chart' , template : '/static/ngTemplates/empSearch/tableGraph.html'}
  ];

  var options = {
    main: {
      icon: 'fa-envelope-o',
      text: 'im'
    },
    others: [{
        icon: '',
        text: 'social'
      },
      {
        icon: '',
        text: 'editProfile'
      },
      {
        icon: '',
        text: 'editDesignation'
      },
      {
        icon: '',
        text: 'editPermissions'
      },
      {
        icon: '',
        text: 'editMaster'
      },
      {
        icon: '',
        text: 'editPayroll'
      },
      {
        icon: '',
        text: 'viewProfile'
      },
    ]
  };

  var multiselectOptions = [{
      icon: 'fa fa-book',
      text: 'Learning'
    },
    {
      icon: 'fa fa-bar-chart-o',
      text: 'Performance'
    },
    {
      icon: 'fa fa-envelope-o',
      text: 'message'
    },
  ];

  $scope.config = {
    url: '/api/HR/users/',
    views: views,
    options: options,
    itemsNumPerView: [12, 24, 48],
    getParams: [{
      key: 'getCustomers',
      value: 0
    }],
    searchField: 'username',
  };



  var viewsCustomer = [{
      name: 'table',
      icon: 'fa-bars',
      template: '/static/ngTemplates/genericTable/genericSearchList.html',
      itemTemplate: '/static/ngTemplates/app.HR.manage.customers.items.html'
    }];



  $scope.configCustomer = {
    url: '/api/HR/users/',
    views: viewsCustomer,
    itemsNumPerView: [12, 24, 48],
    getParams: [{
      key: 'getCustomers',
      value: 1
    }],
    searchField: 'username',
  };

  $scope.tabs = [];
  $scope.searchTabActive = true;
  $scope.data = {
    tableData: []
  };


  $scope.dataCustomer = {
    tableDataCustomer: []
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
    password: '',
  };


  $scope.createUser = function() {

    dataToSend = {
      username: $scope.newUser.username,
      first_name: $scope.newUser.firstName,
      last_name: $scope.newUser.lastName,
      password: $scope.newUser.password,
      email:$scope.newUser.email_id
    };

    console.log(dataToSend);

    $http({
      method: 'POST',
      url: '/api/HR/usersAdminMode/',
      data: dataToSend
    }).
    then(function(response) {

      Flash.create('success', response.status + ' : ' + response.statusText);
      $scope.$broadcast('forceRefetch',)
      $scope.newUser = {
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        email: '',
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
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == target) {
            u = $users.get(target)
            $http.get('/api/HR/profileAdminMode/' + $scope.data.tableData[i].profile.pk + '/').
            success((function(target) {
              return function(response) {
                u = $users.get(target)
                console.log("will add tab profile : ");
                console.log(response);
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
        console.log(target);
        $http({
          method: 'GET',
          url: '/api/HR/usersAdminMode/' + target + '/'
        }).
        then(function(response) {
          console.log(response.data, 'res');
          $http({
            method: 'GET',
            url: '/api/mail/account/?user=' + target
          }).
          then((function(userData) {
            return function(response) {
              userData.mailAccount = response.data[0];
              $scope.addTab({
                title: 'Edit master data  for ' + userData.first_name + ' ' + userData.last_name,
                cancel: true,
                app: 'editMaster',
                data: userData,
                active: true
              })
            }
          })(response.data))
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
              role: ''
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
      } else if (action == 'viewProfile') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == target) {
            u = $users.get(target)
            $http.get('/api/HR/profileAdminMode/' + $scope.data.tableData[i].profile.pk + '/').
            success((function(target) {
              return function(response) {
                response.userPK = target;
                u = $users.get(target)
                console.log("will add tab profile : ");
                console.log(response);
                $scope.addTab({
                  title: 'Profile for ' + u.first_name + ' ' + u.last_name,
                  cancel: true,
                  app: 'viewProfile',
                  data: response,
                  active: true
                })

                console.log($scope.tabs);
              }
            })(target));
          }
        }
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


  $scope.tableActionCustomer = function(target, action, mode) {
    console.log(target, action, mode);
    // console.log($scope.dataCustomer.tableDataCustomer);

    for (var i = 0; i < $scope.dataCustomer.tableDataCustomer.length; i++) {
      if ($scope.dataCustomer.tableDataCustomer[i].pk == parseInt(target)) {
        if (action == 'editCustomer') {
          var title = 'Edit Customer :' ;
          var appType = 'editCustomerForm';
          // var response
          $http({
            method: 'GET',
            url: '/api/HR/usersAdminMode/' + target + '/'
          }).
          then(function(response) {
            console.log(response.data);
            $scope.addTab({
              title: title + response.data.username,
              cancel: true,
              app: appType,
              data: response.data,
              active: true
            })
          });

        } else if (action == 'deleteCustomer') {
          $http({method : 'DELETE' , url : '/api/HR/usersAdminMode/' + $scope.dataCustomer.tableDataCustomer[i].pk +'/'}).
          then(function(response) {
            $scope.dataCustomer.tableDataCustomer.splice(i , 1);
            Flash.create('success', 'Deleted Successfully')
          })
          return
        }

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

  $scope.role = {
    selected: '',
    tabIndex: '',
  }

  $scope.$watch('tabs[role.tabIndex].data.role', function(newValue, oldValue) {
    if (typeof newValue == 'object') {
      console.log($scope.role);
      console.log($scope.tabs[$scope.role.tabIndex].data.role);
      $scope.tabs[$scope.role.tabIndex].data.appsToAdd = $scope.tabs[$scope.role.tabIndex].data.role.applications
      $scope.tabs[$scope.role.tabIndex].data.role = ''
    }
  })

  $scope.roleSearch = function(query) {
    return $http.get('/api/organization/role/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.getPermissionSuggestions = function(query) {
    return $http.get('/api/ERP/application/?name__contains=' + query)
  }

  $scope.updateProfile = function(index) {
    userData = $scope.tabs[index].data;
    var fd = new FormData();
    for (key in userData) {
      if (key != 'url' && userData[key] != null) {
        if ($scope.profileFormStructure[key].type.indexOf('integer') != -1) {
          if (userData[key] != null) {
            fd.append(key, parseInt(userData[key]));
          }
        } else if ($scope.profileFormStructure[key].type.indexOf('date') != -1) {
          if (userData[key] != null) {
            fd.append(key, $filter('date')(userData[key], "yyyy-MM-dd"));
          }
        } else if ($scope.profileFormStructure[key].type.indexOf('url') != -1 && (userData[key] == null || userData[key] == '')) {
          // fd.append( key , 'http://localhost');
        } else {
          fd.append(key, userData[key]);
        }
      }
    }
    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + userData.pk + '/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  };

  $scope.updateUserMasterDetails = function(index) {
    var userData = $scope.tabs[index].data;
    dataToSend = {
      username: userData.username,
      last_name: userData.last_name,
      first_name: userData.first_name,
      is_staff: userData.is_staff,
      is_active: userData.is_active,
      email:userData.email
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


  $scope.Reporting = function(query) {
    // console.log('************',query);
    console.log("@@@@@@@@@@@@@@");
    return $http.get('/api/HR/users/?username__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };


});
