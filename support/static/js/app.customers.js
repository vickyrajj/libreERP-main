app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.customers', {
    url: "/customers",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.customers.html',
        controller: 'businessManagement.customers',
      }
    }
  })
});


app.controller("businessManagement.customers", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope ,$permissions , $timeout) {


  $scope.me = $users.get('mySelf')

  $scope.createPerm = $permissions.myPerms('module.customer.create')

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.customers.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/HR/users/',
    searchField: 'name',
    getParams: [{
      key: 'getCustomers',
      value: 1
    }],
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit : ';
          var appType = 'companyEdit';
        } else if (action == 'customerExplore') {
          var title = 'Details : ';
          var appType = 'customerExplore';
        } else if (action == 'document') {
          var title = 'Document : ';
          var appType = 'document';
        }
        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
          active: true,
        })

      }
    }
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

});

app.controller("businessManagement.customers.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
  $scope.data = $scope.tab.data
  $scope.form={mobile:''}
  $scope.status = false
  if($scope.data.profile.mobile==null){
    $scope.status = true
  }
  else{
    $scope.mobileEdit = true

  }
  $scope.showEdit=function(){
    $scope.status = true
    $scope.mobileEdit = false
  }
  $scope.saveMobile=function(){
    var toSend = {
      mobile :  $scope.form.mobile,
    }
    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + $scope.data.profile.pk + '/',
      data: toSend,
    }).
    then(function(response) {
      console.log(response.data,'aaaaaaaaaaaaaa');
      $scope.data.profile.mobile = response.data.mobile
      $scope.form.mobile=''
      $scope.status = false
      $scope.mobileEdit = true
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }

  $scope.dataVal = {
    smsData: [],
    callData: [],
    locationData: [],
    mobileContactData: []
  };



  smsviews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/tableDefault.html',
    // itemTemplate: '/static/ngTemplates/app.customers.sms.item.html',
  }, ];

  callviews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/tableDefault.html',
    // itemTemplate: '/static/ngTemplates/app.customers.call.item.html',
  }, ];

  locationviews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/tableDefault.html',
    // itemTemplate: '/static/ngTemplates/app.customers.location.item.html',
  }, ];

  mobileContactviews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/tableDefault.html',
    // itemTemplate: '/static/ngTemplates/app.customers.mobileContact.item.html',
  }, ];



  $scope.smsConfig = {
    views: smsviews,
    url: '/api/HR/sms/',
    searchField: 'frm',
    getParams : [{key : 'user' , value : $scope.data.pk}],
    itemsNumPerView: [16, 32, 48],

  }
  $scope.callConfig = {
    views: callviews,
    url: '/api/HR/call/',
    searchField: 'frmOrTo',
    getParams : [{key : 'user' , value : $scope.data.pk}],
    itemsNumPerView: [16, 32, 48],
  }

  var multiselectOptions = [{icon : 'fa fa-map-marker' , text : 'fetchLocation' },
    // {icon : 'fa fa-bar-chart-o' , text : 'Performance' },
    // {icon : 'fa fa-envelope-o' , text : 'message' },
  ];

  $scope.locationConfig = {
    views: locationviews,
    url: '/api/HR/location/',
    searchField: 'lat',
    getParams : [{key : 'user' , value : $scope.data.pk}],
    itemsNumPerView: [16, 32, 48],
    multiselectOptions:multiselectOptions
  }
  $scope.mobileContactConfig = {
    views: mobileContactviews,
    url: '/api/HR/mobilecontact/',
    searchField: 'name',
    getParams : [{key : 'user' , value : $scope.data.pk}],
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    if (action == 'fetchLocation') {

      console.log("will fetch location");


      connection.session.publish('service.tracker.7840850111', [] , {}, {
        acknowledge: true
      }).
      then(function(publication) {
        console.log("Published");
      });

    }
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }


  $scope.getToken = function(){
    $http({
      method: 'GET',
      url: '/api/HR/emailSave/?userId=' +$scope.data.pk
    }).
    then(function(response) {
    })

  }

  $scope.createData = function(){
    $http({
      method: 'GET',
      url: '/api/HR/emailDataSave/'
    }).
    then(function(response) {
    })
  }

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.chartData = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  $scope.options = {
    scales: {
      yAxes: [
        {
          gridLines : {
              display : false
          }
        }
      ]
    }
  };





})



app.controller("businessManagement.customers.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  // $scope.tinymceOptions = {
  //   selector: 'textarea',
  //   content_css: '/static/css/bootstrap.min.css',
  //   inline: false,
  //   plugins: 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
  //   skin: 'lightgray',
  //   theme: 'modern',
  //   height: 180,
  //   toolbar: 'saveBtn publishBtn cancelBtn headerMode bodyMode | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
  // };
  //
  // $scope.me = $users.get('mySelf')
  // $scope.userSearch = function(query) {
  //   return $http.get('/api/HR/userSearch/?getCustomers&username__contains=' + query).
  //   then(function(response) {
  //     return response.data;
  //   })
  // };
  // $scope.cpForm = {
  //   chat: false,
  //   call: false,
  //   email: false,
  //   videoAndAudio: false,
  //   vr: false,
  //   windowColor: '#000000',
  //   callBack: false,
  //   ticket: false,
  //   dp: emptyFile,
  //   name: '',
  //   supportBubbleColor: '#286EFA',
  //   iconColor: '#FFFFFF',
  //   firstMessage: ''
  // }
  // $scope.fetCustomerProfile = function(pk) {
  //   $scope.cpForm.service = pk
  //   $http({
  //     method: 'GET',
  //     url: '/api/support/customerProfile/?service=' + pk,
  //   }).
  //   then(function(response) {
  //     console.log(response.data);
  //     if (response.data[0].pk != null) {
  //       $scope.cpForm = response.data[0]
  //       console.log($scope.cpForm, 'fetching');
  //     }
  //   });
  // }
  //
  // if ($scope.tab != undefined) {
  //   $scope.mode = 'edit';
  //   $scope.form = $scope.tab.data;
  //   $scope.form.cpName = ''
  //   $scope.form.contactPersonPks = []
  //   for (var i = 0; i < $scope.form.contactPerson.length; i++) {
  //     $scope.form.contactPersonPks.push($scope.form.contactPerson[i].pk)
  //   }
  //   if ($scope.form.address == null) {
  //     $scope.form.address = {
  //       street: null,
  //       city: null,
  //       state: null,
  //       pincode: null,
  //       country: null
  //     }
  //   }
  //   $scope.fetCustomerProfile($scope.form.pk)
  // } else {
  //   $scope.mode = 'new';
  //   $scope.form = {
  //     name: '',
  //     telephone: '',
  //     about: '',
  //     contactPerson: [],
  //     contactPersonPks: [],
  //     cpName:'',
  //     mobile: '',
  //     address: {
  //       street: null,
  //       city: null,
  //       state: null,
  //       pincode: null,
  //       country: null
  //     },
  //     cin: '',
  //     tin: '',
  //     logo: '',
  //     web: ''
  //   }
  // }
  //
  // $scope.addPerson = function(person){
  //   console.log(person);
  //   if (typeof person != 'object') {
  //     Flash.create('warning' , 'Please Select Suggested Person')
  //     return;
  //   }
  //   if ($scope.form.contactPersonPks.indexOf(person.pk)> -1) {
  //     Flash.create('warning' , 'This Person Has Already Added')
  //     return;
  //   }
  //   $http({
  //     method:'GET',
  //     url:'/api/ERP/service/?contactPerson='+ person.pk
  //   }).
  //   then(function(response) {
  //     if (response.data.length>0) {
  //       Flash.create('warning' , 'You can not add this person')
  //       return ;
  //     }else {
  //       $scope.form.contactPerson.push(person)
  //       $scope.form.contactPersonPks.push(person.pk)
  //       $scope.form.cpName = ''
  //     }
  //   })
  //
  // }
  //
  // $scope.removePerson = function(idx){
  //   $scope.form.contactPerson.splice(idx,1)
  //   $scope.form.contactPersonPks.splice(idx,1)
  //
  // }
  //
  //
  //
  // $scope.saveCompanyDetails = function() {
  //   var f = $scope.form
  //   if (f.name.length == 0) {
  //     Flash.create('warning', 'Name Is Required')
  //     return
  //   }
  //
  //   $scope.toSend = {
  //     name: f.name,
  //     user: $scope.me.pk,
  //     contactPerson : $scope.form.contactPersonPks
  //   }
  //   if (f.telephone != null && f.telephone.length > 0) {
  //     $scope.toSend.telephone = f.telephone
  //   }
  //   if (f.about != null && f.about.length > 0) {
  //     $scope.toSend.about = f.about
  //   }
  //   if (f.mobile != null && f.mobile.length > 0) {
  //     $scope.toSend.mobile = f.mobile
  //   }
  //   if (f.cin != null && f.cin.length > 0) {
  //     $scope.toSend.cin = f.cin
  //   }
  //   if (f.tin != null && f.tin.length > 0) {
  //     $scope.toSend.tin = f.tin
  //   }
  //   if (f.logo != null && f.logo.length > 0) {
  //     $scope.toSend.logo = f.logo
  //   }
  //   if (f.web != null && f.web.length > 0) {
  //     $scope.toSend.web = f.web
  //   }
  //
  //   console.log($scope.toSend);
  //   $scope.companysave = function() {
  //     console.log('save companyyyyyyyyyyyy');
  //     if ($scope.mode == 'new') {
  //       var method = 'POST'
  //       var url = '/api/ERP/service/'
  //     } else {
  //       var method = 'PATCH'
  //       var url = '/api/ERP/service/' + $scope.form.pk + '/'
  //     }
  //     $http({
  //       method: method,
  //       url: url,
  //       data: $scope.toSend
  //     }).
  //     then(function(response) {
  //       $scope.form = response.data;
  //       if ($scope.form.address == null) {
  //         $scope.form.address = {
  //           street: null,
  //           city: null,
  //           state: null,
  //           pincode: null,
  //           country: null
  //         }
  //       }
  //       $scope.cpForm.service = $scope.form.pk
  //       Flash.create('success', 'Saved');
  //       if ($scope.mode == 'new') {
  //         $scope.mode = 'edit'
  //       }
  //     }, function(err) {
  //       console.log(err, 'err');
  //       if (err.data.detail) {
  //         Flash.create('danger', err.data.detail);
  //       }else {
  //         Flash.create('danger', err.status + ' : ' + err.statusText + ': ' + err.data.name);
  //       }
  //     });
  //   }
  //
  //
  //   console.log('addressssssssssss', f.address);
  //
  //   if (f.address.street != null && f.address.street.length > 0 || f.address.city != null && f.address.city.length > 0 || f.address.state != null && f.address.state.length > 0 || f.address.country != null && f.address.country.length > 0) {
  //     var addData = f.address
  //     var method = 'POST'
  //     var url = '/api/ERP/address/'
  //     if (f.address.pk != undefined) {
  //       method = 'PATCH'
  //       url += f.address.pk + '/'
  //     }
  //     if (addData.pincode == null) {
  //       delete addData.pincode
  //     }
  //     $http({
  //       method: method,
  //       url: url,
  //       data: addData
  //     }).
  //     then(function(response) {
  //       $scope.form.address = response.data;
  //       $scope.toSend.address = response.data.pk;
  //       $scope.companysave()
  //     })
  //   } else {
  //     console.log('no addressssssssssss');
  //     $scope.companysave()
  //   }
  //
  // }
  //
  //
  //
  // $scope.saveCustomerProfile = function() {
  //   $scope.saveCompanyDetails()
  //   console.log($scope.cpForm);
  //   var fd = new FormData();
  //
  //   var cpF = $scope.cpForm
  //   if (cpF.windowColor == '') {
  //     delete cpF.windowColor
  //   }
  //   if (cpF.supportBubbleColor == '') {
  //     delete cpF.supportBubbleColor
  //   }
  //   if (cpF.iconColor == '') {
  //     delete cpF.iconColor
  //   }
  //   if (cpF.firstMessage == null || cpF.firstMessage == '') {
  //     delete cpF.firstMessage
  //     console.log('thereee', cpF.firstMessage);
  //   } else {
  //     fd.append('firstMessage', cpF.firstMessage);
  //     console.log('not thereee', cpF.firstMessage);
  //   }
  //   if (cpF.name == null || cpF.name == '') {
  //     delete cpF.name
  //   } else {
  //     fd.append('name', cpF.name);
  //   }
  //   var method = 'POST'
  //   var url = '/api/support/customerProfile/'
  //   if ($scope.cpForm.pk != undefined) {
  //     method = 'PATCH'
  //     url += $scope.cpForm.pk + '/'
  //   }
  //
  //   fd.append('call', cpF.call);
  //   fd.append('email', cpF.email);
  //   fd.append('callBack', cpF.callBack);
  //   fd.append('chat', cpF.chat);
  //   fd.append('videoAndAudio', cpF.videoAndAudio);
  //   fd.append('ticket', cpF.ticket);
  //   fd.append('vr', cpF.vr);
  //   fd.append('service', cpF.service);
  //
  //   console.log(cpF.name);
  //   console.log($scope.cpForm);
  //
  //   if (cpF.windowColor != '') {
  //     fd.append('windowColor', cpF.windowColor);
  //   }
  //   if (cpF.supportBubbleColor != '') {
  //     fd.append('supportBubbleColor', cpF.supportBubbleColor);
  //   }
  //   if (cpF.iconColor != '') {
  //     fd.append('iconColor', cpF.iconColor);
  //   }
  //
  //
  //
  //   console.log(cpF.dp, 'dddddddddddddddddddddddddddddddddddddd');
  //
  //
  //   if (cpF.dp && typeof cpF.dp != 'string') {
  //
  //     fd.append('dp', cpF.dp);
  //     console.log('append');
  //   }
  //
  //   $http({
  //     method: method,
  //     url: url,
  //     data: fd,
  //     transformRequest: angular.identity,
  //     headers: {
  //       'Content-Type': undefined
  //     }
  //   }).
  //   then(function(response) {
  //     $scope.cpForm = response.data;
  //     console.log(response.data);
  //   })
  //
  //
  //
  //
  //
  // }


})
