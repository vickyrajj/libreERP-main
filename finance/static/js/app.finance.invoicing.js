app.controller('businessManagement.finance.invoicing', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.finance.invoicing.item.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/finance/outBoundInvoice/',
    searchField: 'poNumber',
    itemsNumPerView: [12, 24, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit : ';
          var appType = 'InvoiceEditor';
        } else                   {
          var title = 'Details : ';
          var appType = 'InvoiceExplore';
        }
        $scope.addTab({
          title: title + $scope.data.tableData[i].poNumber,
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

})

app.controller('businessManagement.finance.invoicing.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $uibModal, $timeout) {
  $scope.getQtyDetails = function(pk){
    $http.get('/api/finance/outBoundInvoiceQty/?outBound=' + pk).
    then(function(response) {
      console.log(response.data);
      $scope.products = response.data
    })
  }
  $scope.getprojetDetails = function(pk){
    $http.get('/api/projects/project/?ourBoundInvoices=' + pk).
    then(function(response) {
      console.log(response.data);
      if (response.data.length==1) {
        $scope.data.project = response.data[0]
      }else {
        $scope.data.project == null
      }
    })
  }
  $scope.data = $scope.data.tableData[$scope.tab.data.index]
  $scope.products = []
  $scope.getprojetDetails($scope.data.pk)
  $scope.getQtyDetails($scope.data.pk)
  $scope.changeStatus = function(sts){
    console.log(sts);
    if (sts==undefined) {
      var toSend = {isInvoice:true}
    }else {
      var toSend = {status:sts}
    }
    $http({
      method: 'PATCH',
      url: '/api/finance/outBoundInvoice/' + $scope.data.pk + '/',
      data:toSend
    }).
    then(function(response) {
      Flash.create('success', 'Updated');
      $scope.data.status = response.data.status
      $scope.data.isInvoice = response.data.isInvoice
    })
  }

  $scope.sentEmail=function(){
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.finance.sendEmailInvoicing.modal.html',
      size: 'lg',
      backdrop: false,
      resolve: {
        data: function() {
          return $scope.data;
        }
      },
      controller: function($scope , data,$uibModalInstance,$rootScope){
        $scope.close = function() {
            $uibModalInstance.close();
        }
        $scope.email = data.email

        $scope.send=function(){
          var toSend = {
            value: data.pk,
            email: $scope.email,
            typ:'outbond'
          }
          $http({
            method: 'POST',
            url: '/api/finance/sendInvoice/',
            data: toSend
          }).
          then(function() {
            Flash.create('success', 'Email sent successfully')
          })
        }
      },
    }).result.then(function() {

    }, function() {

    });
  }
})

app.controller('businessManagement.finance.invoicing.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $uibModal, $timeout) {

  $scope.getQtyDetails = function(pk){
    $http.get('/api/finance/outBoundInvoiceQty/?outBound=' + pk).
    then(function(response) {
      console.log(response.data);
      $scope.products = response.data
    })
  }
  $scope.getprojetDetails = function(pk){
    $http.get('/api/projects/project/?ourBoundInvoices=' + pk).
    then(function(response) {
      console.log(response.data);
      if (response.data.length==1) {
        $scope.form.project = response.data[0]
      }else {
        $scope.form.project == null
      }
    })
  }
  $scope.resetForm = function() {
    $scope.form = {
      isInvoice: false,
      poNumber: '',
      name: '',
      personName: '',
      phone: '',
      email: '',
      address: '',
      pincode: '',
      state: '',
      city: '',
      country: '',
      pin_status: '1',
      deliveryDate: new Date(),
      payDueDate: new Date(),
      gstIn: '',
      project: '',
      costcenter: '',
      bussinessunit: ''
    }
    $scope.products = []
  }
  if (typeof $scope.tab == 'undefined') {
    $scope.mode = 'new';
    $scope.resetForm()
  } else {
    $scope.mode = 'edit';
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
    $scope.products = []
    $scope.getprojetDetails($scope.form.pk)
    $scope.getQtyDetails($scope.form.pk)
  }

  $scope.form.pincodeData = []

  $scope.$watch('form.pincode', function(newValue, oldValue) {
    if (newValue != null && newValue.length > 0) {
      $http.get('/api/ERP/genericPincode/?pincode__iexact=' + newValue).
      then(function(response) {
        if (response.data.length == 1) {
          $scope.form.pincodeData = response.data
        } else {
          $scope.form.pincodeData = []
        }
      })
    }
  })
  $scope.projectSearch = function(query) {
    return $http.get('/api/projects/project/?limit=10&title__icontains=' + query).
    then(function(response) {
      return response.data.results;
    })
  };
  $scope.costCenterSearch = function(query) {
    return $http.get('/api/finance/costCenter/?limit=10&name__icontains=' + query).
    then(function(response) {
      return response.data.results;
    })
  };
  $scope.unitSearch = function(query) {
    return $http.get('/api/organization/unit/?limit=10&name__icontains=' + query).
    then(function(response) {
      return response.data.results;
    })
  };
  $scope.addTableRow = function() {
    if ($scope.products.length > 0) {
      var obj = $scope.products[$scope.products.length - 1]
      if (obj.product.length == 0 || obj.price.length == 0 || obj.qty.length == 0) {
        Flash.create('danger', 'Please Fill Previous Row Data')
        return
      }
    }
    $scope.products.push({
      product: '',
      price: 0,
      qty: 0,
      hsn: '',
      tax: 0,
      total: 0,
    });
  }
  $scope.deleteData = function(pkVal, idx) {
    console.log(pkVal, idx);
    if (pkVal == undefined) {
      $scope.products.splice(idx, 1)
      return
    } else {
      $http({
        method: 'DELETE',
        url: '/api/finance/outBoundInvoiceQty/' + pkVal + '/'
      }).
      then(function(response) {
        $scope.products.splice(idx, 1)
        return
      })
    }
  }
  $scope.searchTaxCode = function(c) {
    return $http.get('/api/clientRelationships/productMeta/?limit=10&description__icontains=' + c).
    then(function(response) {
      return response.data.results;
    })
  }
  $scope.productSearch = function(c) {
    return $http.get('/api/finance/outBoundInvoiceQty/?limit=10&product__icontains=' + c).
    then(function(response) {
      return response.data.results;
    })
  }

  $scope.$watch('products', function(newValue, oldValue) {
    for (var i = 0; i < $scope.products.length; i++) {
      if ($scope.products[i].hsn!=null&&$scope.products[i].hsn.pk) {
        $scope.products[i].tax = $scope.products[i].hsn.taxRate
      } else {
        $scope.products[i].tax = 0
      }
      if (typeof $scope.products[i].price=='string') {
        if ($scope.products[i].price.length > 0) {
          $scope.products[i].price = parseFloat($scope.products[i].price)
        }else {
          $scope.products[i].price = 0
        }
      }
      if (typeof $scope.products[i].qty=='string') {
        if ($scope.products[i].qty.length > 0) {
          $scope.products[i].qty = parseFloat($scope.products[i].qty)
        }else {
          $scope.products[i].qty = 0
        }
      }
      tx = parseFloat($scope.products[i].tax)
      p = parseFloat($scope.products[i].price)
      q = parseInt($scope.products[i].qty)
      var txAmount = parseFloat(((tx * p) / 100).toFixed(2))
      $scope.products[i].total = Math.round(((p + txAmount) * q), 2)
    }
  }, true)

  $scope.saveOutBound = function() {
    var f = $scope.form
    console.log(f);
    console.log($scope.products);
    if (f.poNumber.length == 0 || f.name.length == 0 || f.personName.length == 0 || f.phone.length == 0 || f.email.length == 0 || f.address.length == 0 || f.pincode.length == 0 || f.gstIn.length == 0) {
      Flash.create('danger', 'All Fields Are Required')
      return
    }
    if (f.pincode.length > 0 && f.pincodeData.length == 0) {
      Flash.create('danger', 'Invalid PinCode')
      return
    }
    if ($scope.mode=='new') {
      if (f.project.length == 0 && f.costcenter.length == 0 && f.bussinessunit.length == 0) {
        Flash.create('danger', 'Mention Either Project , Costcenter Or BusinessUnit')
        return
      }
      if (f.project != null && f.project.length > 0 && f.project.pk == undefined) {
        Flash.create('danger', 'Select Proper Project')
        return
      }
      if (f.costcenter != null && f.costcenter.length > 0 && f.costcenter.pk == undefined) {
        Flash.create('danger', 'Select Proper Cost center')
        return
      }
      if (f.bussinessunit != null && f.bussinessunit.length > 0 && f.bussinessunit.pk == undefined) {
        Flash.create('danger', 'Select Proper Bussiness Unit')
        return
      }
    }
    var dataToSend = {
      isInvoice: f.isInvoice,
      poNumber: f.poNumber,
      name: f.name,
      personName: f.personName,
      phone: f.phone,
      email: f.email,
      address: f.address,
      pincode: f.pincode,
      state: f.pincodeData[0].state,
      city: f.pincodeData[0].city,
      country: f.pincodeData[0].country,
      pin_status: f.pincodeData[0].pin_status,
      gstIn: f.gstIn,
    }
    if (typeof f.deliveryDate == 'object') {
      dataToSend.deliveryDate = f.deliveryDate.toJSON().split('T')[0]
    }
    if (typeof f.payDueDate == 'object') {
      dataToSend.payDueDate = f.payDueDate.toJSON().split('T')[0]
    }
    if ($scope.mode=='new') {
      if (f.project != null && f.project.pk) {
        dataToSend.project = f.project.pk
      }
      if (f.costcenter != null && f.costcenter.pk) {
        dataToSend.costcenter = f.costcenter.pk
      }
      if (f.bussinessunit != null && f.bussinessunit.pk) {
        dataToSend.bussinessunit = f.bussinessunit.pk
      }
    }
    console.log(dataToSend);
    var method = 'POST'
    var url = '/api/finance/outBoundInvoice/'
    if ($scope.mode == 'edit') {
      method = 'PATCH'
      url += f.pk + '/'
    }
    $http({
      method: method,
      url: url,
      data: dataToSend
    }).
    then(function(response) {
      if ($scope.products.length > 0) {
        for (var i = 0; i < $scope.products.length; i++) {
          if (typeof $scope.products[i].product == 'object') {
            $scope.products[i].product = $scope.products[i].product.product
          }
          if ($scope.products[i].product.length > 0) {
            var toSend = {
              outBound: response.data.pk,
              product: $scope.products[i].product,
              price: $scope.products[i].price,
              qty: $scope.products[i].qty,
              tax: $scope.products[i].tax,
              total: $scope.products[i].total,
            }
            if ($scope.products[i].hsn != null && $scope.products[i].hsn.pk) {
              toSend.hsn = $scope.products[i].hsn.pk
            }
            var method = 'POST'
            var url = '/api/finance/outBoundInvoiceQty/'
            if ($scope.products[i].pk) {
              method = 'PATCH'
              url += $scope.products[i].pk + '/'
            }
            $http({
              method: method,
              url: url,
              data: toSend
            }).
            then((function(i) {
              return function(response) {
                console.log('ressssssssssss',response.data);
                $scope.products[i] = response.data
              }
            })(i))
          }
        }
      }
      $timeout(function() {
        Flash.create('success', response.status + ' : ' + response.statusText);
        if ($scope.mode=='new') {
          $scope.resetForm()
        }
      }, 1500);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }



})
