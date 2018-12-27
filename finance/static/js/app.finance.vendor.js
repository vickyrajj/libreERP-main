app.controller('businessManagement.finance.vendor', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.finance.vendor.item.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/finance/vendorprofile/',
    filterSearch: true,
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
    getParams: [{
      key: 'vendor',
      value: true
    }]
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit VendorProfile :';
          var appType = 'vendorEditor';
        } else if (action == 'details') {
          var title = 'Details :';
          var appType = 'vendorExplorer';
        } else if (action == 'invoiceDetails') {
          var title = 'Invoice :';
          var appType = 'vendorInvoice';
        }


        console.log({
          title: title + $scope.data.tableData[i].service.name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        });


        $scope.addTab({
          title: title + $scope.data.tableData[i].service.name,
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

  $scope.$on('exploreCustomer', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.addTab({
      "title": "Details :" + input.vendor.service,
      "cancel": true,
      "app": "vendorExplorer",
      "data": {
        "pk": input.vendor.pk
      },
      "active": true
    })
  });

  $scope.$on('exploreInvoice', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.addTab({
      "title": "Details :" + input.vendor.service,
      "cancel": true,
      "app": "vendorInvoice",
      "data": {
        "pk": input.vendor.pk
      },
      "active": true
    })
  });


  $scope.$on('editCustomer', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.addTab({
      "title": "Edit :" + input.vendor.service,
      "cancel": true,
      "app": "vendorEditor",
      "data": {
        "pk": input.vendor.pk,
        vendor: input.vendor
      },
      "active": true
    })
  });


})


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

app.controller("businessManagement.finance.vendor.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, ) {

  $scope.resetForm = function() {
    $scope.form = {
      contactperson: '',
      mobile: '',
      email: '',
      paymentTerm: '',
      contentDocs: emptyFile,
      service: ''
    }
  }

  $scope.companySearch = function(query) {
    return $http.get('/api/ERP/service/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  //--------------------------------------------------------------------

  $scope.showCreateCompanyBtn = false;
  $scope.companyExist = false;
  $scope.me = $users.get('mySelf');

  $scope.companySearch = function(query) {
    return $http.get('/api/ERP/service/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.$watch('form.service', function(newValue, oldValue) {
    // console.log(newValue);
    if (typeof newValue == "string" && newValue.length > 0) {
      $scope.showCreateCompanyBtn = true;
      $scope.companyExist = false;
      $scope.showCompanyForm = false;
    } else if (typeof newValue == "object") {
      $scope.companyExist = true;
    } else {
      $scope.showCreateCompanyBtn = false;
      $scope.showCompanyForm = false;
    }

    if (newValue == '') {
      $scope.showCreateCompanyBtn = false;
      $scope.showCompanyForm = false;
      $scope.companyExist = false;
    }

  });

  $scope.openCreateService = function() {
    // console.log($scope.form.service, '-----------------');
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.finance.vendor.create.form.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        data: function() {
          return $scope.form.service;
        }
      },
      controller: function($scope, data, $uibModalInstance) {
        // console.log(data);
        $scope.form = {
          service: data,
          mobile: '',
          about: '',
          telephone: '',
          cin: '',
          tin: '',
          logo: '',
          web: '',
          address: {
            street: null,
            city: null,
            state: null,
            country: null,
            pincode: null
          }
        }
        if (typeof data == 'object') {
          $scope.form.service = data.name
          $scope.form.mobile = data.mobile
          $scope.form.telephone = data.telephone
          $scope.form.tin = data.tin
          $scope.form.cin = data.cin
          $scope.form.address = data.address
          $scope.form.logo = data.logo
          $scope.form.web = data.web
          $scope.form.about = data.about

        } else {
          $scope.form.service = data
        }
        //------------------------------------------------------------------------
        $scope.createCompany = function() {
          var method = 'POST'
          var addUrl = '/api/ERP/address/'
          var serviceUrl = '/api/ERP/service/'
          if ($scope.form.address.pk) {
            method = 'PATCH'
            addUrl = addUrl + $scope.form.address.pk + '/'
            serviceUrl = serviceUrl + data.pk + '/'
          }
          // console.log(addUrl,serviceUrl);
          $http({
            method: method,
            url: addUrl,
            data: $scope.form.address
          }).
          then(function(response) {
            var dataToSend = {
              name: $scope.form.service,
              mobile: $scope.form.mobile,
              about: $scope.form.about,
              address: response.data.pk,
              telephone: $scope.form.telephone,
              cin: $scope.form.cin,
              tin: $scope.form.tin,
              logo: $scope.form.logo,
              web: $scope.form.web,
            };
            $http({
              method: method,
              url: serviceUrl,
              data: dataToSend
            }).
            then(function(response) {
              Flash.create('success', 'Saved');
              $uibModalInstance.dismiss(response.data);
            });
          })
        }
      }, //----controller ends
    }).result.then(function(f) {
      $scope.fetchData();
    }, function(f) {
      // console.log('777777777777777777777777', f);
      if (typeof f == 'object') {
        $scope.form.service = f
      }
    });

  }

  // -----------------------------------------------------------------------------

  if (typeof $scope.tab == 'undefined') {
    $scope.mode = 'new';
    $scope.resetForm()
  } else {
    $scope.mode = 'edit';
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
  }
  console.log($scope.form, '---------------');
  $scope.createVendor = function() {
    if ($scope.form.contactPerson == null || $scope.form.contactPerson.length == 0) {
      Flash.create('warning', 'Please Mention Contact Person Name')
      return
    }
    var fd = new FormData();
    fd.append('contactPerson', $scope.form.contactPerson);
    if ($scope.form.service != null && typeof $scope.form.service == 'object') {
      fd.append('service', $scope.form.service.pk);
    }
    if ($scope.form.contentDocs != null && $scope.form.contentDocs != emptyFile) {
      fd.append('contentDocs', $scope.form.contentDocs);
    }
    if ($scope.form.mobile != null && $scope.form.mobile.length > 0) {
      fd.append('mobile', $scope.form.mobile);
    }
    if ($scope.form.email != null && $scope.form.email.length > 0) {
      fd.append('email', $scope.form.email);

    }
    if ($scope.form.paymentTerm != null && $scope.form.paymentTerm.length > 0) {
      fd.append('paymentTerm', $scope.form.paymentTerm);
    }
    $http({
      method: 'POST',
      url: '/api/finance/vendorprofile/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      if ($scope.mode == 'new') {
        $scope.resetForm()
      }
    });
  }

  $scope.updateVendor = function() {
    var addUrl = '/api/ERP/address/'
    var vendorUrl = '/api/finance/vendorprofile/'
    var serviceUrl = '/api/ERP/service/'
    var addData = {
      street: $scope.form.service.address.street,
      city: $scope.form.service.address.city,
      state: $scope.form.service.address.state,
      country: $scope.form.service.address.country,
      pincode: $scope.form.service.address.pincode,
    }
    var servData = {
      telephone: $scope.form.service.telephone,
      cin: $scope.form.service.cin,
      tin: $scope.form.service.tin,
      logo: $scope.form.service.logo,
      web: $scope.form.service.web,
    };
    $http({
      method: 'PATCH',
      url: addUrl + $scope.form.service.address.pk + '/',
      data: addData,
    }).
    then(function(response) {
      Flash.create('success', 'Updated');
    });
    $http({
      method: 'PATCH',
      url: serviceUrl + $scope.form.service.pk + '/',
      data: servData,
    }).
    then(function(response) {
      Flash.create('success', 'Updated');
    });
    var fd = new FormData();
    fd.append('contactPerson', $scope.form.contactPerson);
    if ($scope.form.service != null && typeof $scope.form.service == 'object') {
      fd.append('service', $scope.form.service.pk);
    }
    if ($scope.form.contentDocs != null && $scope.form.contentDocs != emptyFile) {
      fd.append('contentDocs', $scope.form.contentDocs);
    }
    if ($scope.form.mobile != null && $scope.form.mobile.length > 0) {
      fd.append('mobile', $scope.form.mobile);
    }
    if ($scope.form.email != null && $scope.form.email.length > 0) {
      fd.append('email', $scope.form.email);

    }
    if ($scope.form.paymentTerm != null && $scope.form.paymentTerm.length > 0) {
      fd.append('paymentTerm', $scope.form.paymentTerm);
    }
    $http({
      method: 'PATCH',
      url: vendorUrl + $scope.form.pk + '/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).then(function(response) {
      Flash.create('success', 'Updated vdnr');
      if ($scope.mode == 'new') {
        $scope.resetForm()
      }
    });
  }

})

app.controller("businessManagement.finance.vendor.item", function($scope, $state, $users, $stateParams, $http, Flash) {



})



app.controller("businessManagement.finance.vendor.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {


  if ($scope.tab == undefined) {
    $scope.resetForm();
  } else {
    $scope.vendorData = $scope.data.tableData[$scope.tab.data.index]
  }

  $scope.items = []

  $scope.addTableRow = function() {
    $scope.items.push({
      particular: '',
      rate: 0,
    });
    console.log($scope.items);
  }

  $scope.deleteTable = function(index) {
    if ($scope.items[index].pk != undefined) {
      $http({
        method: 'DELETE',
        url: '/api/finance/VendorService/' + $scope.items[index].pk + '/'
      }).
      then((function(index) {
        return function(response) {
          $scope.items.splice(index, 1);
          Flash.create('success', 'Deleted');
        }
      })(index))

    } else {
      $scope.items.splice(index, 1);
    }
  };


  $scope.fetchData = function(index) {
    $http({
      method: 'GET',
      url: '/api/finance/vendorservice/?vendorProfile=' + $scope.vendorData.pk

    }).
    then(function(response) {
      $scope.vendorServiceData = response.data;
      // console.log('---------------------------------');
      console.log($scope.vendorServiceData);
    })
  }
  $scope.fetchData()


  $scope.deleteData = function(pk, index) {
    // console.log('---------------delelelele------------');
    // console.log($scope.vendorServiceData);
    $scope.vendorServiceData.splice(index, 1);
    $http({
      method: 'DELETE',
      url: '/api/finance/vendorservice/' + pk + '/'
    }).
    then((function(index) {
      return function(response) {

        Flash.create('success', 'Deleted');
      }
    })(index))

  }
  $scope.save = function() {

    for (var i = 0; i < $scope.items.length; i++) {
      if ($scope.items[i].particular.length == 0) {
        Flash.create('warning', 'Please Remove Empty Rows');
        return
      }
    }
    for (var i = 0; i < $scope.items.length; i++) {
      var url = '/api/finance/vendorservice/'
      var method = 'POST';
      if ($scope.items[i].pk != undefined) {
        url += $scope.items[i].pk + '/'
        method = 'PATCH';
      }
      var toSend = {
        particular: $scope.items[i].particular,
        rate: $scope.items[i].rate,
        vendorProfile: $scope.vendorData.pk,
      }
      // console.log(toSend);
      $http({
        method: method,
        url: url,
        data: toSend
      }).
      then((function(i) {
        return function(response) {
          $scope.vendorServiceData.push(response.data)
          if (i == $scope.items.length - 1) {
            Flash.create('success', 'Saved');
            $scope.items = []
          }
          // $scope.items[i].pk = response.data.pk;
          // $scope.resetRow()
        }
      })(i))
    }

  }

  $scope.openUpload = function() {
    console.log('-----------------came to function');
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.finance.vendor.upload.form.html',
      size: 'md',
      backdrop: true,
      resolve: {
        fdata: function() {
          return $scope.vendorData;
        }
      },
      controller: function($scope, fdata, $uibModalInstance) {

        $scope.form = {
          'dated': new Date(),
          'dueDate': '',
          'amount': '',
          'invoice': emptyFile,
        }
        $scope.reset = function() {
          $scope.form = {
            'dated': new Date(),
            'dueDate': '',
            'amount': '',
            'invoice': emptyFile,
          }
        }

        $scope.saveInvoice = function() {
          var method = 'POST'
          var Url = '/api/finance/vendorinvoice/'
          var fd = new FormData();
          if ($scope.form.invoice != emptyFile) {
            fd.append('invoice', $scope.form.invoice)
          }else{
              Flash.create('danger', 'Please upload the invoice');
          }
          fd.append('vendorProfile', fdata.pk);
          fd.append('dated', $scope.form.dated.toJSON().split('T')[0]);
          fd.append('amount', $scope.form.amount);
          fd.append('dueDate', $scope.form.dueDate.toJSON().split('T')[0]);
          $http({
            method: method,
            url: Url,
            data: fd,
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            Flash.create('success', 'Saved');
            // $scope.vendorInvoiceData.push(response.data)
            $uibModalInstance.dismiss(response.data);
          });
        }
      }, //----controller ends--------------
    }).result.then(function(f) {

    }, function(f) {
      console.log($scope.vendorInvoiceData, );
      // $scope.vendorInvoiceData.push(f)
      $scope.fetchInvoiceData();
    });
  } //--------------openUploadfunction ends------------------

  //----------------fetch invoice -----------
  if ($scope.tab == undefined) {} else {
    $scope.invoiceData = $scope.data.tableData[$scope.tab.data.index]
  }

  $scope.fetchInvoiceData = function() {
    $http({
      method: 'GET',
      url: '/api/finance/vendorinvoice/?vendorProfile=' + $scope.invoiceData.pk

    }).
    then(function(response) {
      $scope.vendorInvoiceData = response.data;
    })
  }
  $scope.fetchInvoiceData()



  //-------------------delete invoice-----------------
  $scope.deleteInvoice = function(pk, index) {
    console.log('---------------delelelele------------');
    // console.log($scope.vendorServiceData);
    $scope.vendorServiceData.splice(index, 1);
    $http({
      method: 'DELETE',
      url: '/api/finance/vendorinvoice/' + pk + '/'
    }).
    then((function(index) {
      return function(response) {
        $scope.fetchInvoiceData()
        Flash.create('success', 'Deleted');
      }
    })(index))

  }

  //-----------------chnage status and  apply date to approvedon and disbursedon
  $scope.setStatus = function(pk, idx, approved, disbursed) {
    console.log(idx, $scope.vendorInvoiceData[idx]);
    $http({
      method: 'PATCH',
      url: '/api/finance/vendorinvoice/' + pk + '/',
      data: {
        approved: approved,
        disbursed: disbursed,
      }
    }).then(function(response) {
      $scope.vendorInvoiceData[idx] = response.data
      console.log($scope.vendorInvoiceData);
      Flash.create('success', 'Saved');
    });
  }


})
