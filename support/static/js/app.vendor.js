app.controller("businessManagement.vendor", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.vendor.explore.html',
  }, ];

  $scope.config = {
    views: views,
    url: 'api/support/vendor/',
    filterSearch: true,
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
    // getParams: [{
    //   key: 'name',
    //   value: true
    // }]
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Vendor :';
          var appType = 'vendorEditor';
        }


        console.log({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        });


        $scope.addTab({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
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



  $scope.form = {
    name: '',
    mobile: '',
    email: '',
    gst: '',
    street: '',
    city: '',
    pincode: '',
    state: '',
    country: '',
  }
  $scope.resetForm = function() {
    $scope.form = {
      name: '',
      mobile: '',
      email: '',
      gst: '',
      street: '',
      city: '',
      pincode: '',
      state: '',
      country: '',
    }
  }
  if (typeof $scope.tab == 'undefined') {
    $scope.mode = 'new';
    $scope.resetForm()
  } else {
    $scope.mode = 'edit';
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
  }


  $scope.createVendor = function() {
    console.log('rfsefdsfgrtret--------------');
    var dataTosend = {
      name: $scope.form.name,
      mobile: $scope.form.mobile,
      email: $scope.form.email,
      gst: $scope.form.gst,
      street: $scope.form.street,
      city: $scope.form.city,
      pincode: $scope.form.pincode,
      state: $scope.form.state,
      country: $scope.form.country,
    };
    $http({
      method: 'POST',
      url: 'api/support/vendor/',
      data: dataTosend
    }).
    then(function(response) {
      console.log('hhhhhhhhhhh');
      Flash.create('success', 'Saved');
      $scope.resetForm()
    });
  }



});
