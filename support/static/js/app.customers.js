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


app.controller("businessManagement.customers", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

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
    url: '/api/ERP/service/',
    searchField: 'name',
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
        } else if (action == 'info') {
          var title = 'Details : ';
          var appType = 'companyInfo';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
          active: true
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

app.controller("businessManagement.customers.explore", function($scope, $state, $users, $stateParams, $http, Flash , $uibModal) {
  $scope.compDetails = $scope.tab.data
  $scope.custDetails = {}
  $http({
    method: 'GET',
    url: '/api/support/customerProfile/?service='+$scope.compDetails.pk,
  }).
  then(function(response) {
    $scope.custDetails = response.data[0]
    console.log($scope.custDetails,'dddddddddddd');
  });

  $scope.openChartPopoup = function(pk){
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.customer.chat.modal.html',
      size: 'md',
      backdrop: true,
      resolve: {
        cPk: function() {
          return $scope.custDetails.pk;
        }
      },
      controller: function($scope, $users , $timeout , $uibModalInstance , cPk) {
        $scope.cpk ;
        $http({
          method: 'GET',
          url: '/api/support/script/chatter/?pk='+cPk,
        }).
        then(function(response) {
          console.log('reeeeeeeeeeeeeeeeeeesssssssssss',response.data);
          $scope.cpk= response.data.data
          console.log($scope.cpk);
        });

        $timeout(function () {
          console.log(window.location.host,'hosttttttt');
          $scope.src = '<script src="' + "http://"+window.location.host+"/script/chatter-" + $scope.cpk + ".js" + '"></script>'
        }, 600);

      },
    })







  }

})

app.controller("businessManagement.customers.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.me = $users.get('mySelf')
  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.cpForm = {chat:false,call:false,email:false,videoAndAudio:false,vr:false,windowColor:'' , callBack:false , ticket: false , dp: emptyFile , name:'',supportBubbleColor:'#286EFA'}
  $scope.fetCustomerProfile = function(pk){
    $scope.cpForm.service = pk
    $http({
      method: 'GET',
      url: '/api/support/customerProfile/?service='+pk,
    }).
    then(function(response) {
      console.log(response.data);
      if (response.data[0].pk!=null) {
        $scope.cpForm = response.data[0]
        console.log($scope.cpForm,'fetching');
      }
    });
  }

  if ($scope.tab != undefined) {
    $scope.mode = 'edit';
    $scope.form = $scope.tab.data;
    if ($scope.form.address == null) {
      $scope.form.address = {
        street: null,
        city: null,
        state: null,
        pincode: null,
        country: null
      }
    }
    $scope.fetCustomerProfile($scope.form.pk)
  } else {
    $scope.mode = 'new';
    $scope.form = {
      name: '',
      telephone: '',
      about: '',
      contactPerson: '',
      mobile: '',
      address: {
        street: null,
        city: null,
        state: null,
        pincode: null,
        country: null
      },
      cin: '',
      tin: '',
      logo: '',
      web: ''
    }
  }

  $scope.saveCompanyDetails = function() {
    var f = $scope.form
    if (f.name.length == 0) {
      Flash.create('warning', 'Name Is Required')
      return
    }
    if (f.contactPerson != null && f.contactPerson.length > 0 && typeof f.contactPerson != 'object') {
      Flash.create('warning', 'Contact Person Must Be Suggested One')
      return
    }
    $scope.toSend = {
      name: f.name,
      user:$scope.me.pk
    }
    if (f.telephone != null && f.telephone.length > 0) {
      $scope.toSend.telephone = f.telephone
    }
    if (f.about != null && f.about.length > 0) {
      $scope.toSend.about = f.about
    }
    if (f.mobile != null && f.mobile.length > 0) {
      $scope.toSend.mobile = f.mobile
    }
    if (f.cin != null && f.cin.length > 0) {
      $scope.toSend.cin = f.cin
    }
    if (f.tin != null && f.tin.length > 0) {
      $scope.toSend.tin = f.tin
    }
    if (f.logo != null && f.logo.length > 0) {
      $scope.toSend.logo = f.logo
    }
    if (f.web != null && f.web.length > 0) {
      $scope.toSend.web = f.web
    }
    if (f.contactPerson != null && typeof f.contactPerson == 'object') {
      $scope.toSend.contactPerson = f.contactPerson.pk
    }

    console.log($scope.toSend);
    $scope.companysave = function() {
      console.log('save companyyyyyyyyyyyy');
      if ($scope.mode == 'new') {
        var method = 'POST'
        var url = '/api/ERP/service/'
      } else {
        var method = 'PATCH'
        var url = '/api/ERP/service/' + $scope.form.pk + '/'
      }
      $http({
        method: method,
        url: url,
        data: $scope.toSend
      }).
      then(function(response) {
        $scope.form = response.data;
        if ($scope.form.address == null) {
          $scope.form.address = {
            street: null,
            city: null,
            state: null,
            pincode: null,
            country: null
          }
        }
        $scope.cpForm.service = $scope.form.pk
        Flash.create('success', 'Saved');
        if ($scope.mode == 'new') {
          $scope.mode = 'edit'
        }
      }, function(err) {
        console.log(err,'err');
        Flash.create('danger', err.status + ' : ' + err.statusText + ': ' + err.data.name );
      });
    }

    // if (f.address!=null) {
      console.log('addressssssssssss' , f.address);

      if (f.address.street != null && f.address.street.length > 0 || f.address.city != null && f.address.city.length > 0 || f.address.state != null && f.address.state.length > 0 || f.address.country != null && f.address.country.length > 0) {
        var addData = f.address
        var method = 'POST'
        var url = '/api/ERP/address/'
        if (f.address.pk != undefined) {
          method = 'PATCH'
          url += f.address.pk + '/'
        }
        if (addData.pincode == null) {
          delete addData.pincode
        }
        $http({
          method: method,
          url: url,
          data: addData
        }).
        then(function(response) {
          $scope.form.address = response.data;
          $scope.toSend.address = response.data.pk;
          $scope.companysave()
        })
      }else {
        console.log('no addressssssssssss');
        $scope.companysave()
      }
    // }
  }



  $scope.saveCustomerProfile=function(){
    $scope.saveCompanyDetails()
    console.log($scope.cpForm);
    var cpF = $scope.cpForm
    if (cpF.windowColor == '') {
      delete cpF.windowColor
    }
    if (cpF.supportBubbleColor == '') {
      delete cpF.supportBubbleColor
    }
    var method = 'POST'
    var url = '/api/support/customerProfile/'
    if ($scope.cpForm.pk!=undefined) {
      method = 'PATCH'
      url += $scope.cpForm.pk + '/'
    }
    //
    // $http({
    //   method: method,
    //   url: url,
    //   data: cpF
    // }).
    // then(function(response) {
    //   $scope.cpForm = response.data;
    // });

    var fd = new FormData();
    fd.append('call', cpF.call );
    fd.append('email', cpF.email );
    fd.append('callBack', cpF.callBack);
    fd.append('chat', cpF.chat);
    fd.append('name', cpF.name);
    fd.append('videoAndAudio', cpF.videoAndAudio);
    fd.append('ticket', cpF.ticket);
    fd.append('vr', cpF.vr);
    fd.append('service', cpF.service);


    if (cpF.windowColor != '') {
      fd.append('windowColor', cpF.windowColor);
    }
    if (cpF.supportBubbleColor != '') {
      fd.append('supportBubbleColor', cpF.supportBubbleColor);
    }

    console.log(cpF.dp , 'dddddddddddddddddddddddddddddddddddddd');


    if (cpF.dp && typeof cpF.dp!='string' ) {

      fd.append('dp',cpF.dp);
      console.log('append');
    }

    $http({
      method: method,
      url: url,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      $scope.cpForm = response.data;
    })



  // }


  }

})
