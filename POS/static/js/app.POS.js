app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.POS', {
      url: "/POS",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.POS.default.html',
          controller: 'businessManagement.POS.default',
        }
      }
    })
});

app.controller("controller.POS.invoice.form", function($scope, invoice, $http, Flash) {

  if (invoice.pk != undefined) {
    $scope.mode = 'edit';
    $scope.invoice = invoice;
    $scope.form = invoice;

    $scope.form.receivedDate = new Date($scope.form.receivedDate);
    $scope.form.duedate = new Date($scope.form.duedate);

    if (typeof $scope.form.products == 'string') {
      $scope.form.products = JSON.parse($scope.form.products)
      console.log($scope.invoice);
    }

  } else {
    $scope.mode = 'new';
    $scope.invoice = {
      name: '',
      id: emptyFile
    }
  }
  $scope.addTableRow = function() {
    $scope.form.products.push({
      data: "",
      quantity: 1
    });
    console.log($scope.form.products);
  }
  $scope.deleteTable = function(index) {
    $scope.form.products.splice(index, 1);
  };

  $scope.subTotal = function() {
    var subTotal = 0;
    angular.forEach($scope.form.products, function(item) {
      if (item.data.productMeta != undefined) {
        subTotal += (item.quantity * (item.data.productMeta.taxRate * item.data.price / 100 + item.data.price));
      }
    })
    return subTotal.toFixed(2);
  }
  $scope.subTotalTax = function() {
    var subTotalTax = 0;
    angular.forEach($scope.form.products, function(item) {
      if (item.data.productMeta != undefined) {
        subTotalTax += (item.data.productMeta.taxRate * item.data.price / 100);
      }
    })
    return subTotalTax.toFixed(2);
  }
  $scope.productSearch = function(query) {
    return $http.get('/api/POS/product/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  }

  $scope.saveInvoiceForm = function() {

    var f = $scope.form;
    if (typeof $scope.invoice.duedate == 'object') {
      var date = $scope.invoice.duedate.toJSON().split('T')[0];
    } else {
      var date = $scope.invoice.duedate
    }
    var toSend = {
      // invoicedate: date,
      duedate: date,
      products: JSON.stringify(f.products),
      amountRecieved : f.amountRecieved,
      paymentRefNum : f.paymentRefNum,
      receivedDate : f.receivedDate.toJSON().split('T')[0],
      modeOfPayment : f.modeOfPayment,
    }

    $http({
      method: 'PATCH',
      url: '/api/POS/invoice/' + f.pk + '/',
      data: toSend,
    }).
    then(function(response) {
      // $scope.form.pk = response.data.pk;
      Flash.create('success', 'Saved');
    })
  }


})


app.controller("POS.invoice.item", function($scope) {
  if (typeof $scope.data.products == 'string') {
    $scope.data.products = JSON.parse($scope.data.products);
  }

  if ($scope.$parent.$parent.$parent.customer != undefined) {
    $scope.showControls = false;
  } else {
    $scope.showControls = true;
  }

  $scope.hover = false;

});


app.controller("controller.POS.productMeta.form", function($scope, $http, Flash) {

  $scope.resetForm = function() {
    $scope.configureForm = {
      'description': '',
      'code': '',
      'taxRate': '',
      'typ': 'HSN'
    }
  }

  if ($scope.tab == undefined) {
    $scope.resetForm();
  } else {
    $scope.configureForm = $scope.tab.data.meta;
  }


  $scope.saveproductMeta = function() {
    var f = $scope.configureForm;
    if ($scope.configureForm.pk == undefined) {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += $scope.configureForm.pk + '/';
    }
    var toSend = {
      description: f.description,
      code: f.code,
      taxRate: f.taxRate,
      hsn: f.hsn,
      sac: f.sac

    }

    $http({
      method: method,
      url: '/api/clientRelationships/productMeta/',
      data: toSend
    }).
    then(function(response) {
      $scope.configureForm.pk = response.data.pk;
      Flash.create('success', 'Saved');
    })

  }
})

app.controller("controller.POS.productinfo.form", function($scope, product) {

  if (product.pk != undefined) {
    $scope.mode = 'edit';
    $scope.product = product;
  } else {
    $scope.mode = 'new';
    $scope.product = {
      name: '',
      img: emptyFile
    }
  }


  // $scope.products=products;

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40, 50, 30, 44, 55, 66]

  ];
  $scope.onClick = function(points, evt) {
    console.log(points, evt);
  };

  $scope.data = {
    productInfotableData: []
  };
  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.POS.inventoryLog.item.html',
  }, ];

  $scope.configProductInfo = {
    views: views,
    url: '/api/POS/inventoryLog/',
    // searchField: 'orderID',
    itemsNumPerView: [8, 16, 24],
    getParams: [{
      key: 'product',
      value: product.pk
    }]
  }

  $scope.tableActionProductInfo = function(target, action, mode) {
    console.log($scope.data.productInfotableData);
    for (var i = 0; i < $scope.data.productInfotableData.length; i++) {
      if ($scope.data.productInfotableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'ProductMeta :';
          var appType = 'productMetaEdit';
        }

        $scope.addTab({
          title: title + $scope.data.productInfotableData[i].pk,
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


})
app.controller("controller.POS.customer.form", function($scope, customer, $http, Flash, $uibModalInstance) {
  console.log(customer);
  if (customer.pk != undefined) {
    $scope.mode = 'edit';
    $scope.customer = customer;
    $scope.invoiceMode = false;
  } else {
    $scope.mode = 'new';
    if (customer.name == undefined) {
      var name = '';
      $scope.invoiceMode = false;
    } else {
      $scope.invoiceMode = true;
      var name = customer.name;
    }
    $scope.customer = {
      'name': name,
      'company': '',
      'email': '',
      'mobile': '',
      'notes': '',
      'pan': '',
      'gst': '',
      'street': '',
      'city': '',
      'state': '',
      'pincode': '',
      'country': 'India',
      'streetBilling': '',
      'cityBilling': '',
      'stateBilling': '',
      'pincodeBilling': '',
      'countryBilling': 'India',
      'sameAsShipping': false,
      pk: null
    }
  }

  $scope.save = function() {
    var f = $scope.customer;
    if (f.name.length == 0) {
      Flash.create('warning', 'Name can not be left blank');
      return;
    }

    if ($scope.invoiceMode) {

    }

    var toSend = {
      name: f.name,
      sameAsShipping: f.sameAsShipping
    }

    var toPut = ['company', 'email', 'mobile', 'notes', 'pan', 'gst', 'street', 'city', 'state', 'pincode', 'country', 'streetBilling', 'cityBilling', 'stateBilling', 'pincodeBilling', 'countryBilling']

    for (var i = 0; i < toPut.length; i++) {
      var val = f[toPut[i]];
      if (val != undefined && val.length > 0) {
        toSend[toPut[i]] = val;
      }
    }

    var url = '/api/POS/customer/';
    if ($scope.mode == 'new') {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += $scope.customer.pk + '/';
    }

    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      $scope.customer.pk = response.data.pk;
      $scope.mode = 'edit';
      if ($scope.mode == 'new') {
        Flash.create('success', 'Saved');
      } else {
        Flash.create('success', 'Created');
      }
      if ($scope.invoiceMode) {
        console.log("will close");
        $uibModalInstance.dismiss('created||' + response.data.pk)
      }
    })
  }

})

app.controller("controller.POS.customerinfo.form", function($scope, customer, $http) {

  if (customer.pk != undefined) {
    $scope.mode = 'edit';
    $scope.customer = customer;
    $scope.form = customer;
    $scope.invoice = customer;
  } else {
    $scope.mode = 'new';
    $scope.customer = {
      name: '',
      email: emptyFile
    }
  }
  console.log($scope.customer);
  console.log("/api/POS/invoice/?customer=" + $scope.customer.pk);
  $http({
    method: "GET",
    url: "/api/POS/invoice/?customer=" + $scope.customer.pk,
  }).
  then(function(response) {
    $scope.invoices = response.data;
  })

})

app.controller("controller.POS.invoicesinfo.form", function($scope, invoice, $http, Flash) {

  if (invoice.pk != undefined) {
    $scope.mode = 'edit';
    $scope.invoice = invoice;
    $scope.form = invoice;
    if (typeof $scope.invoice.products == 'string') {
      $scope.invoice.products = JSON.parse($scope.invoice.products);
    }

    $scope.form = invoice;
  } else {
    $scope.mode = 'new';
    $scope.invoice = {
      name: '',
      id: emptyFile
    }
  }
  $scope.subTotal = function() {
    var subTotal = 0;
    angular.forEach($scope.form.products, function(item) {
      if (item.data != undefined) {
        subTotal += (item.quantity * (item.data.productMeta.taxRate * item.data.price / 100 + item.data.price));
      }
    })
    return subTotal.toFixed(2);
  }

  $scope.modeofpayment = ["card", "netBanking", "cash", "cheque"];
  $scope.save = function() {

    var f = $scope.form;
    console.log(f);
    if (f.amountRecieved.length == 0) {
      Flash.create('warning', 'Amount can not be left blank');
      return;
    }

    console.log(f.amountRecieved);
    console.log(f.modeOfPayment);
    var toSend = {
      amountRecieved: f.amountRecieved,
      modeOfPayment: f.modeOfPayment,
      paymentRefNum: f.paymentRefNum,
      receivedDate: f.receivedDate.toJSON().split('T')[0]
    }
    console.log(toSend);



    $http({
      method: 'PATCH',
      url: '/api/POS/invoice/' + f.pk + '/',
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
    })
  }

})

app.controller("controller.POS.productForm.modal", function($scope, product, $http, Flash) {
  console.log(product);
  $scope.$watch('product.productMeta', function(newValue, oldValue) {
    if (typeof newValue == 'object') {
      $scope.showTaxCodeDetails = true;
    } else {
      $scope.showTaxCodeDetails = false;
    }
  })

  $scope.searchTaxCode = function(c) {
    return $http.get('/api/clientRelationships/productMeta/?description__contains=' + c).
    then(function(response) {
      return response.data;
    })
  }

  if (product.pk != undefined) {
    $scope.mode = 'edit';
    $scope.product = product;
    $http({
      method: 'GET',
      url: '/api/POS/productVerient/?parent=' + $scope.product.pk
    }).
    then(function(response) {
      $scope.productData = response.data;
    })
  } else {
    $scope.mode = 'new';
    $scope.product = {
      'name': '',
      'productMeta': '',
      'price': '',
      'displayPicture': emptyFile,
      'serialNo': '',
      'description': '',
      'inStock': 0,
      'cost': 0,
      'logistics': 0,
      'serialId': '',
      'reorderTrashold': 0,
      'pk': null
    }
  }

  $scope.save = function() {
    console.log('entered');
    console.log($scope.product.productMeta);
    console.log($scope.product.productMeta.pk);

    var f = $scope.product;
    var url = '/api/POS/product/';
    if ($scope.mode == 'new') {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += $scope.product.pk + '/';
    }

    var fd = new FormData();
    if (f.displayPicture != emptyFile && typeof f.displayPicture != 'string' && f.displayPicture != null) {
      fd.append('displayPicture', f.displayPicture)
    }

    if (f.name.length == 0) {
      Flash.create('warning', 'Name can not be blank');
      return;
    }
    fd.append('name', f.name);
    fd.append('productMeta', f.productMeta.pk);
    fd.append('price', f.price);
    fd.append('serialNo', f.serialNo);
    fd.append('description', f.description);
    fd.append('inStock', f.inStock);
    fd.append('cost', f.cost);
    fd.append('logistics', f.logistics);
    fd.append('serialId', f.serialId);
    fd.append('reorderTrashold', f.reorderTrashold);


    console.log(f.displayPicture);
    console.log(fd);

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
      $scope.product.pk = response.data.pk;
      if ($scope.mode == 'new') {
        $scope.product.pk = response.data.pk;
        $scope.mode = 'edit';
      }
      Flash.create('success', 'Saved')
    })
  }

  $scope.deleteProduct = function(pk, ind) {
    $http({
      method: 'DELETE',
      url: '/api/POS/productVerient/' + pk + '/'
    }).
    then((function(ind) {
      return function(response) {
        $scope.productData.splice(ind, 1);
        Flash.create('success', 'Deleted');
      }
    })(ind))

  }

  $scope.productVerientForm = {
    'sku': '',
    'unitPerpack': 1
  }
  $scope.productData = [];

  $scope.saveUnits = function() {
    console.log('aaaaaaaaaaaaa');
    var f = $scope.productVerientForm;
    var toSend = {
      parent: $scope.product.pk,
      sku: f.sku,
      unitPerpack: f.unitPerpack
    }

    $http({
      method: 'POST',
      url: '/api/POS/productVerient/',
      data: toSend
    }).
    then(function(response) {
      $scope.productVerientForm.pk = response.data.pk;
      $scope.productData.push(response.data);
      Flash.create('success', 'Saved');
    })
  }


});


function getMonday( date ) {
    var day = date.getDay() || 7;
    if( day !== 1 )
        date.setHours(-24 * (day - 1));
    return date;
}


app.controller("businessManagement.POS.default", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $aside) {

  // $scope.modeofpayment = ["card", "netBanking", "cash", "cheque"];

  $scope.today = new Date();
  $scope.firstDay = new Date($scope.today.getFullYear(), $scope.today.getMonth(), 1);
  $scope.monday = getMonday(new Date());


  $scope.graphForm = {graphType : 'week'}

  $scope.$watch('graphForm.graphType' , function(newValue , oldValue) {

    if (newValue == 'day') {
      var toSend = {date : $scope.today};
    }else if (newValue == 'week') {
      var toSend = {from : $scope.monday , to : $scope.today};
    }else {
      var toSend = {from : $scope.firstDay , to : $scope.today};
    }

    $http({method : 'POST' , url : '/api/POS/salesGraphAPI/' , data : toSend}).
    then(function(response) {
      $scope.stats = response.data;

      $scope.data2 = [$scope.stats.totalCollections.amountRecieved__sum, $scope.stats.totalSales.grandTotal__sum];

      $scope.labels = [];
      // $scope.series = ['Series A'];
      $scope.trendData = [
        []
      ];

      for (var i = 0; i < $scope.stats.trend.length; i++) {
        $scope.stats.trend[i]
        $scope.trendData[0].push($scope.stats.trend[i].sum)
        $scope.labels.push($scope.stats.trend[i].created)
      }


      // $scope.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      // // $scope.series = ['Series A'];
      // $scope.data = [
      //   [65, 59, 80, 81, 56, 55, 50, 60, 71, 66, 77, 44]
      // ];


    })



  })

  $scope.productSearch = function(query) {
    console.log("called");
    return $http.get('/api/POS/product/?search=' + query + '&limit=10').
    then(function(response) {
      return response.data.results;
    })
  }

  $scope.data = {
    tableData: [],
    invoiceDataTable: [],
    customerDataTable: [],
    // productMetatableData: []
  };



  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.POS.product.item.html',
  }, ];


  var productmultiselectOptions = [{
    icon: 'fa fa-wrench',
    text: 'taxCodes'
  }, {
    icon: 'fa fa-plus',
    text: 'bulkUpload'
  }, {
    icon: 'fa fa-plus',
    text: 'new'
  }, ];

  var multiselectOptions = [{
    icon: 'fa fa-plus',
    text: 'new'
  }, ];

  var multiselectOptions = [{
    icon: 'fa fa-plus',
    text: 'new'
  }, ];

  $scope.config = {
    views: views,
    url: '/api/POS/product/',
    filterSearch : true,
    searchField : 'Name or SKU or Description',
    itemsNumPerView: [6, 12, 24],
    multiselectOptions: productmultiselectOptions,
  }

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.POS.customer.item.html',
  }, ];

  $scope.configCustomer = {
    views: views,
    url: '/api/POS/customer/',
    searchField: 'name',
    itemsNumPerView: [6, 12, 24],
    multiselectOptions: multiselectOptions,
  }
  //
  //
  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.POS.invoice.item.html',
  }, ];

  $scope.configInvoice = {
    views: views,
    url: '/api/POS/invoice/',
    searchField: 'id',
    itemsNumPerView: [6, 12, 24],
    multiselectOptions: multiselectOptions,
  }






  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);
    console.log($scope.tableData);
    if (action == 'new') {
      $scope.openProductForm();
    } else if (action == 'bulkUpload') {
      $scope.openProductBulkForm();
    } else if (action == 'taxCodes') {
      $scope.openProductConfigureForm();
    } else {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openProductForm(i);
            console.log('editing');
          } else {
            $scope.openProductInfo(i);
          }
        }
      }
    }



  }

  $scope.tableActionCustomer = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.customerDataTable);

    if (action == 'new') {
      $scope.openCustomerForm();
    } else {
      for (var i = 0; i < $scope.data.customerDataTable.length; i++) {
        if ($scope.data.customerDataTable[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openCustomerForm(i);
          } else {
            $scope.openCustomerInfo(i);
          }
        }
      }
    }

  }

  $scope.tableActionInvoice = function(target, action) {
    console.log(target, action);
    console.log($scope.data.invoiceDataTable);

    if (action == 'new') {
      $scope.createInvoice();
    } else {
      for (var i = 0; i < $scope.data.invoiceDataTable.length; i++) {
        if ($scope.data.invoiceDataTable[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openInvoiceForm(i);
          } else {
            $scope.openInvoiceinfoForm(i);
          }
        }
      }
    }

  }


  $scope.mode = 'home';
  // $scope.mode = 'invoice'
  $scope.tabs = [];
  $scope.searchTabActive = true;
  var dummyDate = new Date();

  var onlyDate = new Date(dummyDate.getFullYear(), dummyDate.getMonth(), dummyDate.getDate()); // 2013-07-30 23:59:59

  $scope.getInvoiceID = function() {
    $http({method : 'GET' , url : '/api/POS/getNextAvailableInvoiceID/'}).
    then(function(response) {
      $scope.form.serialNumber = response.data.pk;
    })
  }



  $scope.resetForm = function() {
    var dummyDate = new Date();

    var onlyDate = new Date(dummyDate.getFullYear(), dummyDate.getMonth(), dummyDate.getDate()); // 2013-07-30 23:59:59
    $scope.form = {
      customer: '',
      invoiceDate: onlyDate,
      totalTax: 0,
      grandTotal: 0,
      deuDate: onlyDate,
      modeOfPayment: 'cash',
      serialNumber : '',
      receivedDate : new Date(),
      products: [{
        data: '',
        quantity: 1
      }],
      // returnquater : 'jan-march'
    }

    $scope.getInvoiceID();

  }

  $scope.returnquaters = ['jan-march', 'april-june', 'july-sep', 'oct-dec']

  $scope.resetForm();

  $scope.subTotal = function() {
    var subTotal = 0;
    angular.forEach($scope.form.products, function(item) {
      if (item.data.productMeta != undefined) {
        subTotal += (item.quantity * (item.data.productMeta.taxRate * item.data.price / 100 + item.data.price));
      }
    })
    return subTotal.toFixed(2);
  }
  $scope.subTotalTax = function() {
    var subTotalTax = 0;
    angular.forEach($scope.form.products, function(item) {
      if (item.data.productMeta != undefined) {
        subTotalTax += (item.data.productMeta.taxRate * item.data.price / 100);
      }
    })
    return subTotalTax.toFixed(2);
  }

  console.log(onlyDate);
  $scope.customerNameSearch = function(query) {
    return $http.get('/api/POS/customer/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.$watch('form.customer', function(newValue, oldValue) {
    console.log(newValue);
    if (typeof newValue == "string" && newValue.length > 0) {
      $scope.showCreateCustomerBtn = true;
      $scope.customerExist = false;
      $scope.showCustomerForm = false;
    } else if (typeof newValue == "object") {
      $scope.customerExist = true;
    } else {
      $scope.showCreateCustomerBtn = false;
      $scope.showCustomerForm = false;
    }

    if (newValue == '') {
      $scope.showCreateCustomerBtn = false;
      $scope.showCustomerForm = false;
      $scope.customerExist = false;
    }

  });


  $scope.createInvoice = function() {
    $scope.mode = 'invoice';
  }
  $scope.goHome = function() {
    $rootScope.$broadcast('forceRefetch', {});
    $scope.mode = 'home';
  }

  $scope.openCustomerForm = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.customer.form.html',
      size: 'md',
      backdrop: true,
      resolve: {
        customer: function() {
          if (idx == undefined || idx == null) {
            if ($scope.mode == 'invoice' && typeof $scope.form.customer != 'object') {
              return {
                name: $scope.form.customer
              };
            } else if (typeof $scope.form.customer == 'object') {
              return $scope.form.customer;
            } else {
              return {};
            }
          } else {
            return $scope.data.customerDataTable[idx];
          }
        }
      },
      controller: "controller.POS.customer.form",

    }).result.then(function(d) {
      console.log(d);
    }, function(d) {
      console.log(d);
      $rootScope.$broadcast('forceRefetch', {});
      if ($scope.form.customer.pk != undefined) {
        $http({
          method: 'GET',
          url: '/api/POS/customer/' + $scope.form.customer.pk + '/'
        }).
        then(function(response) {
          $scope.form.customer = response.data;
        })
      }

      if (d.split('||')[0] == 'created') {
        $http({
          method: 'GET',
          url: '/api/POS/customer/' + d.split('||')[1] + '/'
        }).then(function(response) {
          $scope.form.customer = response.data;
        })
      }
    });


  }

  // $scope.openCustomerForm();

  $scope.openProductInfo = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.productinfo.form.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        product: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.data.tableData[idx];
          }
        }
      },
      controller: "controller.POS.productinfo.form",
    }).result.then(function() {

    }, function() {
      $rootScope.$broadcast('forceRefetch', {});
    });



  }

  $scope.openInvoiceinfoForm = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.invoicesinfo.form.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        invoice: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.data.invoiceDataTable[idx];
          }
        }
      },
      controller: "controller.POS.invoicesinfo.form",
    }).result.then(function() {

    }, function() {

    });



  }

  $scope.openCustomerInfo = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.customerinfo.form.html',
      size: 'xl',
      backdrop: true,
      resolve: {
        customer: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.data.customerDataTable[idx];
          }
        }
      },
      controller: "controller.POS.customerinfo.form",
    }).result.then(function() {

    }, function() {

    });



  }

  $scope.openProductForm = function(idx) {


    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.product.form.html',
      size: 'xl',
      backdrop: true,
      resolve: {
        product: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.data.tableData[idx];
          }
        }
      },
      controller: 'controller.POS.productForm.modal',
    }).result.then(function() {

    }, function() {

    });




  }

  $scope.openProductConfigureForm = function(idx) {
    $aside.open({
      templateUrl: '/static/ngTemplates/app.POS.productConfigureForm.html',
      placement: 'right',
      size: 'xl',
      backdrop: true,
      resolve: {

      },
      controller: function($scope) {
        $scope.data = {
          productMetatableData: []
        };


        var views = [{
          name: 'list',
          icon: 'fa-th-large',
          template: '/static/ngTemplates/genericTable/genericSearchList.html',
          itemTemplate: '/static/ngTemplates/app.POS.productMeta.item.html',
        }, ];

        $scope.configProductMeta = {
          views: views,
          url: '/api/clientRelationships/productMeta/',
          searchField: 'name',
          itemsNumPerView: [8, 16, 24],
        }

        $scope.tableActionProductMeta = function(target, action, mode) {
          console.log($scope.data.productMetatableData);
          for (var i = 0; i < $scope.data.productMetatableData.length; i++) {
            if ($scope.data.productMetatableData[i].pk == parseInt(target)) {
              if (action == 'edit') {
                var title = 'ProductMeta :';
                var appType = 'productMetaEdit';
                $scope.addTab({
                  title: title + $scope.data.productMetatableData[i].pk,
                  cancel: true,
                  app: appType,
                  data: {
                    pk: target,
                    index: i,
                    meta: $scope.data.productMetatableData[i]
                  },
                  active: true
                })
              }else if (action == 'delete') {

                $http({method : 'DELETE' , url : '/api/clientRelationships/productMeta/' + target + '/'}).
                then(function(response) {
                  Flash.create('success' , 'Deleted');
                  $scope.$broadcast('forceRefetch',)
                })

              }


            }
          }

        }

        $scope.tabs = [];
        $scope.searchTabActive = true;

        $scope.closeTab = function(index) {
          $scope.tabs.splice(index, 1)
        }

        $scope.addTab = function(input) {
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



      },
    }).result.then(function() {

    }, function() {

    });


  }

  $scope.openProductBulkForm = function(idx) {


    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.product.bulkForm.html',
      size: 'md',
      backdrop: true,
      // resolve: {
      //   product: function() {
      //
      //     console.log($scope.products[idx]);
      //     if (idx == undefined || idx == null) {
      //       return {};
      //     } else {
      //       return $scope.products[idx];
      //     }
      //   }
      // },
      controller: function($scope, ) {

        $scope.bulkForm = {
          xlFile: emptyFile,
          success: false,
          usrCount: 0
        }
        $scope.upload = function() {
          if ($scope.bulkForm.xlFile == emptyFile) {
            Flash.create('warning', 'No file selected')
            return
          }
          console.log($scope.bulkForm.xlFile);
          var fd = new FormData()
          fd.append('xl', $scope.bulkForm.xlFile);
          console.log('*************', fd);
          $http({
            method: 'POST',
            url: '/api/POS/bulkProductsCreation/',
            data: fd,
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            Flash.create('success', 'Created');
            $scope.bulkForm.usrCount = response.data.count;
            $scope.bulkForm.success = true;
          })

        }

      },
    }).result.then(function() {

    }, function() {

    });


  }


  $scope.openInvoiceForm = function(idx) {


    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.invoices.form.html',
      size: 'xl',
      backdrop: true,
      resolve: {
        invoice: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.data.invoiceDataTable[idx];
          }
        }
      },
      controller: 'controller.POS.invoice.form',
    }).result.then(function() {

    }, function() {

    });


  }


  $scope.onClick = function(points, evt) {
    console.log(points, evt);
  };

  $scope.labels2 = ["Sales", "Collections"];



  $scope.addRow = function() {
    $scope.form.products.push({
      data: "",
      quantity: 1
    });
    console.log($scope.form.products);

  }

  $scope.delete = function(index) {
    $scope.form.products.splice(index, 1);
  };

  $scope.saveInvoice = function() {

    var f = $scope.form;
    console.log(f);
    for (var i = 0; i < f.products.length; i++) {
      var fd = new FormData();
      fd.append('inStock', (f.products[i].data.inStock - f.products[i].quantity));

      if (f.products[i].data.pk == undefined) {
        continue;
      }

      var url = '/api/POS/product/' + f.products[i].data.pk + '/'
      $http({
        method: 'PATCH',
        url: url,
        data: fd,
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).
      then(function(response) {

      })
    }
    if (f.serialNumber.length == 0) {
      Flash.create('warning', 'serialNumber can not be left blank');
      return;
    }

    if (f.customer.pk == undefined) {
      Flash.create('warning' , 'Please select a customer');
      return;
    }


    if (f.products.length == 1 &&  f.products[0].data == "" ) {
      Flash.create('danger' , 'There is no product to generate invoice for')
      return;
    }


    var toSend = {
      serialNumber: f.serialNumber,
      invoicedate: f.invoiceDate.toJSON().split('T')[0],
      reference: f.reference,
      duedate: f.deuDate.toJSON().split('T')[0],
      returnquater: f.returnquater,
      modeOfPayment : f.modeOfPayment,
      products: JSON.stringify(f.products),
      customer: f.customer.pk,
      grandTotal: $scope.subTotal(),
      totalTax: $scope.subTotalTax(),
      amountRecieved : f.amountRecieved,
      paymentRefNum : f.paymentRefNum,
      receivedDate : f.receivedDate.toJSON().split('T')[0],
    }
    // var returnquaterParts=toSend.returnquater.split('/');
    // toSend.returnquater=returnquaterParts[2]+'-'+returnquaterParts[0]+'-'+returnquaterParts[1];
    // var returndateParts=toSend.returndate.split('/');
    // toSend.returndate=returndateParts[2]+'-'+returndateParts[0]+'-'+returndateParts[1];
    // console.log(typeof toSend.returnquater,toSend.returnquater);
    console.log(toSend);
    var url = '/api/POS/invoice/';
    if ($scope.form.pk == undefined) {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += $scope.form.pk + '/';
    }

    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      $scope.form.pk = response.data.pk;
      Flash.create('success', 'Saved');
    })
  }


});