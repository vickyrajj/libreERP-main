var projectsStepsData = [{
    indx: 1,
    text: 'created',
    display: 'Created'
  },
  {
    indx: 2,
    text: 'Sent',
    display: 'Sent For Approval'
  },
  {
    indx: 3,
    text: 'GRN',
    display: 'GRN'
  },
  {
    indx: 4,
    text: 'Approved',
    display: 'Approved'
  },
  // {
  //   indx: 4,
  //   text: 'ongoing',
  //   display: 'OnGoing'
  // },
];


app.controller('businessManagement.finance.expenses', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  // settings main page controller

  $scope.data = {
    tableData: [],
    invoiceData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.finance.purchaseOrder.item.html',
  }, ];

  // var options = {
  //   main: {
  //     icon: 'fa-pencil',
  //     text: 'edit'
  //   },
  // };

  $scope.config = {
    views: views,
    url: '/api/finance/purchaseorder/',
    searchField: 'name',
    getParams: [{
      key: 'isInvoice',
      value: false
    }],
    deletable: true,
    itemsNumPerView: [12, 24, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'details') {
          var title = 'PO Details :';
          var appType = 'details';
        } else if (action == 'edit') {
          var title = 'edit :';
          var appType = 'edit';
        } else if (action == 'delete') {
          console.log("aaaaaaaa");
          $http({
            method: 'DELETE',
            url: '/api/finance/purchaseorder/' + $scope.data.tableData[i].pk + '/'
          }).
          then(function(response) {})
          $scope.data.tableData.splice(i, 1)
          return
        }
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

  invoiceViews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.finance.inboundInvoices.item.html',
  }, ];

  // var options = {
  //   main: {
  //     icon: 'fa-pencil',
  //     text: 'edit'
  //   },
  // };

  $scope.invoiceConfig = {
    views: invoiceViews,
    url: '/api/finance/purchaseorder/',
    searchField: 'name',
    getParams: [{
      key: 'isInvoice',
      value: true
    }],
    deletable: true,
    itemsNumPerView: [12, 24, 48],
  }


  $scope.invoicetableAction = function(target, action, mode) {

    for (var i = 0; i < $scope.data.invoiceData.length; i++) {
      if ($scope.data.invoiceData[i].pk == parseInt(target)) {
        if (action == 'details') {
          var title = 'Invoice Details :';
          var appType = 'idetails';
        }else if (action == 'edit') {
          var title = 'edit :';
          var appType = 'editinvoice';
        } else if (action == 'delete') {
          $http({
            method: 'DELETE',
            url: '/api/finance/purchaseorder/' + $scope.data.invoiceData[i].pk + '/'
          }).
          then(function(response) {})
          $scope.data.invoiceData.splice(i, 1)
          return
        }
        $scope.addTab({
          title: title + $scope.data.invoiceData[i].name,
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

  // $scope.addTab({"title":"Browse Cost Center : 1","cancel":true,"app":"costCenterBrowser","data":{"pk":1,"index":0},"active":true});

})

app.controller('businessManagement.finance.purchaseOrder.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {


  $scope.resetForm = function() {
    $scope.form = {
      name: '',
      address: '',
      personName: '',
      phone: '',
      email: '',
      pincode: '',
      state: '',
      pin_status: '',
      city: '',
      country: '',
      poNumber: '',
      quoteNumber: '',
      quoteDate: '',
      terms: '',
      project: '',
      costcenter: '',
      bussinessunit: '',
    }
  }
  $scope.mode = 'new';
  $scope.getAllData = function() {
    $http({
      method: 'GET',
      url: '/api/finance/purchaseorderqty/?purchaseorder=' + $scope.form.pk,
    }).
    then(function(response) {
      $scope.products = response.data
    })
  }
  if (typeof $scope.tab == 'undefined') {
    $scope.mode = 'new';
    $scope.resetForm()
    $scope.products = []
    $scope.options = false
  } else {
    $scope.mode = 'edit';
    $scope.products = []
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
    $scope.getAllData()
    $scope.options = true
  }
  $scope.showButton = true

  $scope.addTableRow = function(indx) {
    $scope.products.push({
      product: '',
      price: 0,
      qty: 0
    });
    $scope.showButton = false
  }

  $scope.refresh = function() {
    $scope.resetForm()
    $scope.options = false
  }


  $scope.showOption = function() {
    if ($scope.options == false) {
      $scope.options = true
    } else {
      $scope.options = false
    }
  }


  $scope.projectSearch = function(query) {
    return $http.get('/api/projects/project/?title__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.productSearch = function(query) {
    return $http.get('/api/finance/purchaseorderqty/?product__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.pinSearch = function(query) {
    return $http.get('/api/ERP/genericPincode/?pincode__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.costCenterSearch = function(query) {
    return $http.get('/api/finance/costCenter/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.bussinessUnit = function(query) {
    return $http.get('/api/organization/unit/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.$watch('products', function(newValue, oldValue) {
    for (var i = 0; i < newValue.length; i++) {
      if(typeof newValue[i].product == 'object'){
        $scope.products[i].product= newValue[i].product.product
      }
    }
  }, true)

  $scope.save = function() {
    // .toJSON().split('T')[0])
    if (typeof $scope.form.deliveryDate == 'object') {
      $scope.form.deliveryDate = $scope.form.deliveryDate.toJSON().split('T')[0]
    } else {
      $scope.form.deliveryDate = $scope.form.deliveryDate
    }
    if (typeof $scope.form.quoteDate == 'object') {
      $scope.form.quoteDate = $scope.form.quoteDate.toJSON().split('T')[0]
    } else {
      $scope.form.quoteDate = $scope.form.quoteDate
    }



    if ($scope.mode == 'new') {
      if ($scope.form.name == '' || $scope.form.address == '') {
        Flash.create('danger', 'Fill the Details')
        return
      }
      var dataToSend = {
        name: $scope.form.name,
        personName: $scope.form.personName,
        address: $scope.form.address,
        phone: $scope.form.phone,
        email: $scope.form.email,
        pincode: $scope.form.pincode.pincode,
        state: $scope.form.pincode.state,
        city: $scope.form.pincode.city,
        country: $scope.form.pincode.country,
        pin_status: $scope.form.pincode.pin_status,
        deliveryDate: $scope.form.deliveryDate,
        // poNumber: $scope.form.poNumber,
        quoteNumber: $scope.form.quoteNumber,
        quoteDate: $scope.form.quoteDate,
        terms: $scope.form.terms,
      }

      if ($scope.form.project != undefined) {
        dataToSend.project = $scope.form.project.pk
        if ($scope.form.project.costCenter != undefined || $scope.form.project.costCenter != null) {
          $scope.form.costCenter = $scope.form.project.costCenter
          dataToSend.costcenter = $scope.form.costCenter.pk
          if ($scope.form.costCenter.unit != undefined) {
            $scope.form.bussinessunit = $scope.form.costCenter.unit
            dataToSend.bussinessunit = $scope.form.bussinessunit.pk
          }
        }
      }
      if ($scope.form.costcenter != undefined || $scope.form.costcenter != null) {
        dataToSend.costcenter = $scope.form.costcenter.pk
        if ($scope.form.costcenter.unit != undefined || $scope.form.costcenter.unit != null) {
          $scope.form.bussinessunit = $scope.form.costcenter.unit
          dataToSend.bussinessunit = $scope.form.bussinessunit.pk
        }
      }

      if ($scope.form.bussinessunit != undefined || $scope.form.bussinessunit != null) {
        dataToSend.bussinessunit = $scope.form.bussinessunit.pk
      }
      $http({
        method: 'POST',
        url: '/api/finance/purchaseorder/',
        data: dataToSend
      }).
      then(function(response) {
        Flash.create('success', response.status + ' : ' + response.statusText);
        if ($scope.products.length > 0) {
          for (var i = 0; i < $scope.products.length; i++) {
            var toSend = {
              product: $scope.products[i].product,
              qty: $scope.products[i].qty,
              price: $scope.products[i].price,
              purchaseorder: response.data.pk,
            }
            $http({
              method: 'POST',
              url: '/api/finance/purchaseorderqty/',
              data: toSend
            }).
            then(function(response) {

            })
          }
        }
        // $http({
        //   method: 'PATCH',
        //   url: '/api/finance/purchaseorder/' + response.data.pk + '/',
        //   data: {
        //     poNumber: response.data.pk
        //   }
        // }).
        // then(function(response) {})
        $scope.resetForm()
        $scope.products = []
        $scope.options = false
      }, function(response) {
        Flash.create('danger', response.status + ' : ' + response.statusText);
      })
    } else {
      if (typeof $scope.form.pincode == 'object') {
        var data = $scope.form.pincode
        $scope.form.pincode = data['pincode'],
          $scope.form.state = data['state'],
          $scope.form.city = data['city'],
          $scope.form.country = data['country'],
          $scope.form.pin_status = data['pin_status']
      } else {
        $scope.form.pincode = $scope.form.pincode,
          $scope.form.state = $scope.form.state,
          $scope.form.city = $scope.form.city,
          $scope.form.country = $scope.form.country,
          $scope.form.pin_status = $scope.form.pin_status
      }
      var dataToSend = {
        name: $scope.form.name,
        personName: $scope.form.personName,
        address: $scope.form.address,
        phone: $scope.form.phone,
        email: $scope.form.email,
        pincode: $scope.form.pincode,
        state: $scope.form.state,
        city: $scope.form.city,
        country: $scope.form.country,
        pin_status: $scope.form.pin_status,
        deliveryDate: $scope.form.deliveryDate,
        // poNumber: $scope.form.poNumber,
        quoteNumber: $scope.form.quoteNumber,
        quoteDate: $scope.form.quoteDate,
        terms: $scope.form.terms,
      }
      if ($scope.form.project != undefined) {
        dataToSend.project = $scope.form.project.pk
        if ($scope.form.project.costCenter != undefined || $scope.form.project.costCenter != null) {
          $scope.form.costCenter = $scope.form.project.costCenter
          dataToSend.costcenter = $scope.form.costCenter.pk
          if ($scope.form.costCenter.unit != undefined) {
            $scope.form.bussinessunit = $scope.form.costCenter.unit
            dataToSend.bussinessunit = $scope.form.bussinessunit.pk
          }
        }
      }
      if ($scope.form.costcenter != undefined || $scope.form.costcenter != null) {
        dataToSend.costcenter = $scope.form.costCenter.pk
        if ($scope.form.costcenter.unit != undefined || $scope.form.costcenter.unit != null) {
          $scope.form.bussinessunit = $scope.form.costcenter.unit
          dataToSend.bussinessunit = $scope.form.bussinessunit.pk
        }
      }
      if ($scope.form.bussinessunit != undefined || $scope.form.bussinessunit != null) {
        dataToSend.bussinessunit = $scope.form.bussinessunit.pk
      }
      $http({
        method: 'PATCH',
        url: '/api/finance/purchaseorder/' + $scope.form.pk + '/',
        data: dataToSend
      }).
      then(function(response) {
        Flash.create('success', response.status + ' : ' + response.statusText);
        if ($scope.products.length > 0) {
          for (var i = 0; i < $scope.products.length; i++) {
            var toSend = {
              product: $scope.products[i].product,
              qty: $scope.products[i].qty,
              price: $scope.products[i].price,
              purchaseorder: response.data.pk
            }
            if ($scope.products[i].pk) {
              method = 'PATCH',
                url = '/api/finance/purchaseorderqty/' + $scope.products[i].pk + '/'
            } else {
              method = 'POST'
              url = '/api/finance/purchaseorderqty/'
            }
            $http({
              method: method,
              url: url,
              data: toSend
            }).
            then(function(response) {})
          }
        }
      }, function(response) {
        Flash.create('danger', response.status + ' : ' + response.statusText);
      })
    }
  }


  $scope.deleteData = function(pkVal, idx) {
    console.log(pkVal, idx);
    if (pkVal == undefined) {
      $scope.products.splice(idx, 1)
      return
    } else {
      $http({
        method: 'DELETE',
        url: '/api/finance/purchaseorderqty/' + pkVal + '/'
      }).
      then(function(response) {
        $scope.products.splice(idx, 1)
        Flash.create('success', 'Deleted');
        return
      })
    }
  }
})
app.controller('businessManagement.finance.purchaseOrder.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$uibModal) {
  $scope.projectSteps = {
    steps: projectsStepsData
  }

  $scope.data = $scope.data.tableData[$scope.tab.data.index]

  $scope.updateStatus = function() {
    for (var i = 0; i < $scope.projectSteps.steps.length; i++) {
      if ($scope.projectSteps.steps[i].text == $scope.data.status) {
        $scope.data.selectedStatus = $scope.projectSteps.steps[i].indx;
        break;
      }
    }
  }
  $scope.updateStatus()
  $scope.getAllData = function() {
    $http({
      method: 'GET',
      url: '/api/finance/purchaseorderqty/?purchaseorder=' + $scope.data.pk,
    }).
    then(function(response) {
      $scope.products = response.data
    })
  }


  $scope.getAllData()
  $scope.saveData = function() {
    $http({
      method: 'PATCH',
      url: '/api/finance/purchaseorder/' + $scope.data.pk + '/',
      data:{
        status: 'Approved'
      }
    }).then(function(response) {
      $scope.data = response.data
      $scope.updateStatus()
      for (var i = 0; i < $scope.products.length; i++) {
        $http({
          method: 'PATCH',
          url: '/api/finance/purchaseorderqty/' + $scope.products[i].pk + '/',
          data: {
            receivedQty: $scope.products[i].receivedQty,
          }
        }).
        then(function(response) {})
      }
    })
  }

  // $scope.bankList = [
  //   {'name' : 'Allahabad Bank'},
  //   {'name' : '	Andhra Bank'},
  //   {'name' : 'Bank of Baroda'},
  //   {'name' : 'Bank of India'},
  //   {'name' : 'Bank of Maharashtra'},
  //   {'name' : 'Canara Bank'},
  //   {'name' : 'Central Bank of India'},
  //   {'name' : 'Corporation Bank'},
  //   {'name' : 'Dena Bank'},
  //   {'name' : 'Indian Bank'},
  //   {'name' : 'Indian Overseas Bank'},
  //   {'name' : 'Oriental Bank of Commerce'},
  //   {'name' : 'Punjab National Bank'},
  //   {'name' : 'Punjab & Sind Bank'},
  //   {'name' : 'Syndicate Bank'},
  //   {'name' : 'UCO Bank'},
  //   {'name' : 'Union Bank of India'},
  //   {'name' : 'United Bank of India'},
  //   {'name' : 'Vijaya Bank'},
  //   {'name' : 'IDBI Bank Ltd'},
  //   {'name' : 'Bharatiya Mahila Bank'},
  //   {'name' : 'State Bank of India'},
  //   {'name' : 'State Bank of Bikaner'},
  //   {'name' : 'State Bank of Hyderabad'},
  //   {'name' : 'State Bank of Mysore'},
  //   {'name' : 'State Bank of Patiala'},
  //   {'name' : 'State Bank of Travancore'},
  // ]



  $scope.sendForApproval = function() {
    dataToSend = {
      status: 'Sent'
    }
    $http({
      method: 'PATCH',
      url: '/api/finance/purchaseorder/' + $scope.data.pk + '/',
      data: dataToSend
    }).then(function(response) {
      $scope.data = response.data
      $scope.updateStatus()
    })
  }
  $scope.approve = function() {
    dataToSend = {
      status: 'GRN'
    }
    $http({
      method: 'PATCH',
      url: '/api/finance/purchaseorder/' + $scope.data.pk + '/',
      data: dataToSend
    }).then(function(response) {
      $scope.data = response.data
      $scope.updateStatus()
    })
  }
  $scope.reject = function() {
    dataToSend = {
      status: 'created'
    }
    $http({
      method: 'PATCH',
      url: '/api/finance/purchaseorder/' + $scope.data.pk + '/',
      data: dataToSend
    }).then(function(response) {
      $scope.data = response.data
      $scope.updateStatus()
    })

  }
  $scope.invoice = false
  $scope.addToInvoice = function() {
    console.log('gggggggggggggggggggggggg');
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.finance.purchaseOrder.bankDetails.modal.html',
      size: 'lg',
      backdrop: false,
      resolve: {
        data: function() {
          return $scope.data.pk;
        }
      },
      controller: function($scope , data,$uibModalInstance,$rootScope){
        // $scope.data.pk = data
        $scope.bankList = [
          'Allahabad Bank',
          'Andhra Bank',
          'Bank of Baroda',
          'Bank of India',
          'Bank of Maharashtra',
          'Canara Bank',
          'Central Bank of India',
          'Corporation Bank',
          'Dena Bank',
          'Indian Bank',
          'Indian Overseas Bank',
          'Oriental Bank of Commerce',
          'Punjab National Bank',
          'Punjab & Sind Bank',
          'Syndicate Bank',
          'UCO Bank',
          'Union Bank of India',
          'United Bank of India',
          'Vijaya Bank',
          'IDBI Bank Ltd',
          'Bharatiya Mahila Bank',
          'State Bank of India',
          'State Bank of Bikaner',
          'State Bank of Hyderabad',
          'State Bank of Mysore',
          'State Bank of Patiala',
          'State Bank of Travancore',
        ]

        $scope.close = function() {
            $uibModalInstance.close();
        }


        $scope.saveBankDetails = function() {
          if ($scope.data.accNo != $scope.data.reaccNo || $scope.data.accNo == undefined || $scope.data.reaccNo == undefined) {
            Flash.create('danger', 'Account Number Doesnt Match');
            return
          }
          if ($scope.data.ifsc != $scope.data.reifsc || $scope.data.ifsc == undefined || $scope.data.reifsc == undefined) {
            Flash.create('danger', 'IFSC Number Doesnt Match');
            return
          }
          if ($scope.data.bankName == undefined) {
            Flash.create('danger', 'Add Bank Name');
            return
          }
          dataToSend = {
            accNo: $scope.data.accNo,
            ifsc: $scope.data.ifsc,
            bankName: $scope.data.bankName,
            isInvoice: true,
          }
          $http({
            method: 'PATCH',
            url: '/api/finance/purchaseorder/' + data + '/',
            data: dataToSend
          }).then(function(response) {
            Flash.create('success', 'Saved');
            // $scope.data = response.data
            // $scope.data.reaccNo = response.data.accNo
            //  $scope.data.reifsc = response.data.ifsc
          })
          $rootScope.$broadcast('forceRefetch', {});
          $uibModalInstance.close();
        }
      },
    }).result.then(function() {

    }, function() {

    });
    // $scope.invoice = true
    // if ($scope.data.accNo != null || $scope.data.ifsc != null) {
    //   $scope.data.reaccNo = $scope.data.accNo
    //   $scope.data.reifsc = $scope.data.ifsc
    // }
    $scope.data = response.data
    // $scope.updateStatus()
  }




})

app.controller('businessManagement.finance.inboundInvoices.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.resetForm = function() {
    $scope.form = {
      name: '',
      address: '',
      personName: '',
      phone: '',
      email: '',
      pincode: 0,
      city: '',
      state: '',
      country: '',
      poNumber: '',
      paymentDueDate: '',
      invoiceTerms: '',
      terms: '',
      project: '',
      costcenter : '',
      bussinessunit: '',
      products: [],
      accNo:'',
      reaccNo:'',
      ifsc:'',
      reifsc:'',
      bankName:''
    }
  }
  $scope.mode = 'new';
  $scope.getAllData = function() {
    $http({
      method: 'GET',
      url: '/api/finance/purchaseorderqty/?purchaseorder=' + $scope.form.pk,
    }).
    then(function(response) {
      $scope.form.products = response.data
    })
  }
  if (typeof $scope.tab == 'undefined') {
    $scope.mode = 'new';
    $scope.resetForm()
    $scope.products = []
    $scope.options = false
  } else {
    $scope.mode = 'edit';
    $scope.products = []
    $scope.form = $scope.data.invoiceData[$scope.tab.data.index]
    $scope.form.reaccNo = $scope.form.accNo
    $scope.form.reifsc = $scope.form.ifsc
    $scope.getAllData()
    $scope.options = true
  }


  $scope.bankList = [
    'Allahabad Bank',
    'Andhra Bank',
    'Bank of Baroda',
    'Bank of India',
    'Bank of Maharashtra',
    'Canara Bank',
    'Central Bank of India',
    'Corporation Bank',
    'Dena Bank',
    'Indian Bank',
    'Indian Overseas Bank',
    'Oriental Bank of Commerce',
    'Punjab National Bank',
    'Punjab & Sind Bank',
    'Syndicate Bank',
    'UCO Bank',
    'Union Bank of India',
    'United Bank of India',
    'Vijaya Bank',
    'IDBI Bank Ltd',
    'Bharatiya Mahila Bank',
    'State Bank of India',
    'State Bank of Bikaner',
    'State Bank of Hyderabad',
    'State Bank of Mysore',
    'State Bank of Patiala',
    'State Bank of Travancore',
  ]
  $scope.projectSearch = function(query) {
    return $http.get('/api/projects/project/?title__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.productSearch = function(query) {
    return $http.get('/api/finance/purchaseorderqty/?product__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.refresh = function() {
    $scope.resetForm()
  }

  $scope.addTableRow = function(indx) {
    $scope.form.products.push({
      product: '',
      price: 0,
      receivedQty: 0,
      productMeta: '',
      hsn: '',
      tax: '',
      total: 0
    });
    // $scope.showButton = false
  }

  $scope.costCenterSearch = function(query) {
    return $http.get('/api/finance/costCenter/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.bussinessUnit = function(query) {
    return $http.get('/api/organization/unit/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.poSearch = function(query) {
      return $http.get('/api/finance/purchaseorder/?pk__contains=' + query+'&isInvoice=false&status=Approved').
    then(function(response) {
      return response.data;
    })
  };

  $scope.productMetaSearch = function(query) {
    return $http.get('/api/clientRelationships/productMeta/?code__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.pinSearch = function(query) {
    return $http.get('/api/ERP/genericPincode/?pincode__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };


  $scope.$watch('form.poNumber', function(newValue, oldValue) {
    if (typeof newValue == "object") {
      $scope.form.pk = newValue.pk
      $scope.form.name = newValue.name
      $scope.form.address = newValue.address
      $scope.form.personName = newValue.personName
      $scope.form.phone = newValue.phone
      $scope.form.email = newValue.email
      $scope.form.pincode = newValue.pincode
      $scope.form.city = newValue.city
      $scope.form.state = newValue.state
      $scope.form.country = newValue.country
      $scope.form.status = newValue.status
      $scope.form.quoteNumber = newValue.quoteNumber
      $scope.form.quoteDate = newValue.quoteDate
      $scope.form.deliveryDate = newValue.deliveryDate
      $scope.form.terms = newValue.terms
      $scope.form.costcenter = newValue.costcenter
      $scope.form.bussinessunit = newValue.bussinessunit
      $scope.form.project = newValue.project
      $scope.form.isInvoice = newValue.isInvoice
      if ($scope.form.pk) {
        $http({
          method: 'GET',
          url: '/api/finance/purchaseorderqty/?purchaseorder=' + $scope.form.pk,
        }).
        then(function(response) {
          $scope.form.products = response.data
        })
      } else {
        $scope.form.products = []
      }
    }
  })

  $scope.$watch('form.products', function(newValue, oldValue) {
    for (var i = 0; i < newValue.length; i++) {
      if (typeof newValue[i].hsn == 'object') {
        $scope.form.products[i].tax = newValue[i].hsn.taxRate
        $scope.form.products[i].total = ((newValue[i].receivedQty * newValue[i].price) +  (((newValue[i].receivedQty * newValue[i].price)*$scope.form.products[i].tax)/100) ).toFixed(2)
        $scope.form.products[i].productMeta = newValue[i].hsn
        $scope.form.products[i].hsn = newValue[i].productMeta.code
      }
      if(typeof newValue[i].product == 'object'){
        $scope.form.products[i].product= newValue[i].product.product
      }
    }
  }, true)

  $scope.saveInvoice = function() {
    if (typeof $scope.form.pincode == 'object') {
      var data = $scope.form.pincode
      $scope.form.pincode = data['pincode'],
        $scope.form.state = data['state'],
        $scope.form.city = data['city'],
        $scope.form.country = data['country'],
        $scope.form.pin_status = data['pin_status']
    } else {
      $scope.form.pincode = $scope.form.pincode,
        $scope.form.state = $scope.form.state,
        $scope.form.city = $scope.form.city,
        $scope.form.country = $scope.form.country,
        $scope.form.pin_status = $scope.form.pin_status
    }
    if (typeof $scope.form.deliveryDate == 'object') {
      $scope.form.deliveryDate = $scope.form.deliveryDate.toJSON().split('T')[0]
    } else {
      $scope.form.deliveryDate = $scope.form.deliveryDate
    }
    if (typeof $scope.form.paymentDueDate == 'object') {
      $scope.form.paymentDueDate = $scope.form.paymentDueDate.toJSON().split('T')[0]
    } else {
      $scope.form.paymentDueDate = $scope.form.paymentDueDate
    }
    // if (typeof $scope.form.poNumber == 'object') {
    //   $scope.form.poNumber = $scope.form.poNumber.poNumber
    // } else {
    //   $scope.form.poNumber = $scope.form.poNumber
    // }



    if ($scope.form.accNo != $scope.form.reaccNo || $scope.form.accNo == undefined || $scope.form.reaccNo == undefined) {
      Flash.create('danger', 'Account Number Doesnt Match');
      return
    }
    if ($scope.form.ifsc != $scope.form.reifsc || $scope.form.ifsc == undefined || $scope.form.reifsc == undefined) {
      Flash.create('danger', 'IFSC Number Doesnt Match');
      return
    }
    if ($scope.form.bankName == undefined) {
      Flash.create('danger', 'Add Bank Name');
      return
    }
    if ($scope.form.pk) {
      // $scope.form.isInvoice = true

      var dataToSend = {
        name: $scope.form.name,
        personName: $scope.form.personName,
        address: $scope.form.address,
        phone: $scope.form.phone,
        email: $scope.form.email,
        pincode: $scope.form.pincode,
        state: $scope.form.state,
        city: $scope.form.city,
        country: $scope.form.country,
        pin_status: $scope.form.pin_status,
        deliveryDate: $scope.form.deliveryDate,
        // poNumber: $scope.form.poNumber,
        paymentDueDate: $scope.form.paymentDueDate,
        gstIn: $scope.form.gstIn,
        invoiceTerms: $scope.form.invoiceTerms,
        // poNumber: $scope.form.poNumber,
        isInvoice: true,
        accNo: $scope.form.accNo,
        ifsc: $scope.form.ifsc,
        bankName: $scope.form.bankName,
      }
      if ($scope.form.project != undefined) {
        dataToSend.project = $scope.form.project.pk
        if ($scope.form.project.costCenter != undefined || $scope.form.project.costCenter != null) {
          $scope.form.costCenter = $scope.form.project.costCenter
          dataToSend.costcenter = $scope.form.costCenter.pk
          if ($scope.form.costCenter.unit != undefined) {
            $scope.form.bussinessunit = $scope.form.costCenter.unit
            dataToSend.bussinessunit = $scope.form.bussinessunit.pk
          }
        }
      }
      if ($scope.form.costcenter != undefined || $scope.form.costcenter != null) {
        dataToSend.costcenter = $scope.form.costcenter.pk
        if ($scope.form.costcenter.unit != undefined || $scope.form.costcenter.unit != null) {
          $scope.form.bussinessunit = $scope.form.costcenter.unit
          dataToSend.bussinessunit = $scope.form.bussinessunit.pk
        }
      }

      if ($scope.form.bussinessunit != undefined || $scope.form.bussinessunit != null) {
        dataToSend.bussinessunit = $scope.form.bussinessunit.pk
      }
      $http({
        method: 'PATCH',
        url: '/api/finance/purchaseorder/' + $scope.form.pk + '/',
        data: dataToSend
      }).
      then(function(response) {

        if ($scope.form.products.length > 0) {
          for (var i = 0; i < $scope.form.products.length; i++) {
            if (typeof $scope.form.products[i].hsn == 'object') {
              $scope.form.products[i].hsn = $scope.form.products[i].hsn.code
              $scope.form.products[i].tax = $scope.form.products[i].hsn.taxRate
              $scope.form.products[i].productMeta = $scope.form.products[i].hsn
            } else {
              $scope.form.products[i].hsn = $scope.form.products[i].hsn
              $scope.form.products[i].tax = $scope.form.products[i].tax
              $scope.form.products[i].productMeta = $scope.form.products[i].productMeta
            }

            var toSend = {
              product: $scope.form.products[i].product,
              receivedQty: $scope.form.products[i].receivedQty,
              price: $scope.form.products[i].price,
              purchaseorder: response.data.pk,
              hsn: $scope.form.products[i].hsn,
              tax: $scope.form.products[i].tax,
              productMeta: $scope.form.products[i].productMeta.pk,
              total: $scope.form.products[i].total
            }
            if ($scope.form.products[i].pk) {
              method = 'PATCH',
                url = '/api/finance/purchaseorderqty/' + $scope.form.products[i].pk + '/'
            } else {
              method = 'POST'
              url = '/api/finance/purchaseorderqty/'
            }
            $http({
              method: method,
              url: url,
              data: toSend
            }).
            then(function(response) {
              if($scope.form.poNumber!=undefined||$scope.form.poNumber!=null){
                $scope.resetForm()
              }
              Flash.create('success', 'Saved');
            })
          }
        }
      })
      // $scope.resetForm()
    } else {
      var dataToSend = {
        name: $scope.form.name,
        personName: $scope.form.personName,
        address: $scope.form.address,
        phone: $scope.form.phone,
        email: $scope.form.email,
        pincode: $scope.form.pincode,
        state: $scope.form.state,
        city: $scope.form.city,
        country: $scope.form.country,
        pin_status: $scope.form.pin_status,
        deliveryDate: $scope.form.deliveryDate,
        // poNumber: $scope.form.poNumber,
        paymentDueDate: $scope.form.paymentDueDate,
        gstIn: $scope.form.gstIn,
        invoiceTerms: $scope.form.invoiceTerms,
        // poNumber: $scope.form.poNumber,
        isInvoice: true,
        accNo: $scope.form.accNo,
        ifsc: $scope.form.ifsc,
        bankName: $scope.form.bankName,
      }
      if ($scope.form.project != undefined) {
        dataToSend.project = $scope.form.project.pk
        if ($scope.form.project.costCenter != undefined || $scope.form.project.costCenter != null) {
          $scope.form.costCenter = $scope.form.project.costCenter
          dataToSend.costcenter = $scope.form.costCenter.pk
          if ($scope.form.costCenter.unit != undefined) {
            $scope.form.bussinessunit = $scope.form.costCenter.unit
            dataToSend.bussinessunit = $scope.form.bussinessunit.pk
          }
        }
      }
      if ($scope.form.costcenter != undefined || $scope.form.costcenter != null) {
        dataToSend.costcenter = $scope.form.costcenter.pk
        if ($scope.form.costcenter.unit != undefined || $scope.form.costcenter.unit != null) {
          $scope.form.bussinessunit = $scope.form.costcenter.unit
          dataToSend.bussinessunit = $scope.form.bussinessunit.pk
        }
      }

      if ($scope.form.bussinessunit != undefined || $scope.form.bussinessunit != null) {
        dataToSend.bussinessunit = $scope.form.bussinessunit.pk
      }
      $http({
        method: 'POST',
        url: '/api/finance/purchaseorder/',
        data: dataToSend
      }).
      then(function(response) {
        Flash.create('success', 'Saved');
        if ($scope.form.products.length > 0) {
          for (var i = 0; i < $scope.form.products.length; i++) {
            if (typeof $scope.form.products[i].hsn == 'object') {
              $scope.form.products[i].hsn = $scope.form.products[i].hsn.code
              $scope.form.products[i].tax = $scope.form.products[i].hsn.taxRate
              $scope.form.products[i].productMeta = $scope.form.products[i].hsn
            } else {
              $scope.form.products[i].hsn = $scope.form.products[i].hsn
              $scope.form.products[i].tax = $scope.form.products[i].tax
              $scope.form.products[i].productMeta = $scope.form.products[i].productMeta
            }
            var toSend = {
              product: $scope.form.products[i].product,
              receivedQty: $scope.form.products[i].receivedQty,
              price: $scope.form.products[i].price,
              purchaseorder: response.data.pk,
              hsn: $scope.form.products[i].hsn,
              tax: $scope.form.products[i].tax,
              productMeta: $scope.form.products[i].productMeta.pk,
              total: $scope.form.products[i].total
            }
            if ($scope.form.products[i].pk) {
              method = 'PATCH',
                url = '/api/finance/purchaseorderqty/' + $scope.form.products[i].pk + '/'
            } else {
              method = 'POST'
              url = '/api/finance/purchaseorderqty/'
            }
            $http({
              method: method,
              url: url,
              data: toSend
            }).
            then(function(response) {
              console.log("heeeeeeeeeeerrrrrrrrreeeeeeeeee");
              $scope.resetForm()
            })
          }
        }
      })
    }
  }
  $scope.deleteData = function(pkVal, idx) {
    if (pkVal == undefined) {
      $scope.form.products.splice(idx, 1)
      return
    } else {
      $http({
        method: 'DELETE',
        url: '/api/finance/purchaseorderqty/' + pkVal + '/'
      }).
      then(function(response) {
        $scope.form.products.splice(idx, 1)
        Flash.create('success', 'Deleted');
        return
      })
    }
  }



})

app.controller('businessManagement.finance.inboundInvoices.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$uibModal) {
  $scope.data = $scope.data.invoiceData[$scope.tab.data.index]
  $scope.getAllData = function() {
    $http({
      method: 'GET',
      url: '/api/finance/purchaseorderqty/?purchaseorder=' + $scope.data.pk,
    }).
    then(function(response) {
      $scope.products = response.data
    })
  }


  $scope.getAllData()


  $scope.sentEmail=function(){
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.finance.sendEmail.modal.html',
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
            typ:'inbond'
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
