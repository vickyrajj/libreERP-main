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

app.controller("controller.POS.invoice.form", function($scope, invoice, $http, Flash, $rootScope, $filter) {


  console.log(invoice,'invoiceinvoiceinvoiceinvoiceinvoice');

  if (invoice.pk != undefined) {
    $scope.mode = 'edit';
    $scope.invoice = invoice;
    $scope.form = invoice;
    $scope.DuplicateData = invoice;

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
  // $scope.deletedProducts = []
  // $scope.productBackup = []
  $scope.deleteTable = function(index) {
    // var pData = $scope.form.products[index]
    // $scope.deletedProducts.push({url:'/api/POS/product/' + pData.data.pk + '/',inStock:pData.data.inStock + pData.quantity})
    // $scope.productBackup.splice(index,1)
    $scope.form.products.splice(index, 1);
    $scope.productsPks.splice(index, 1)
    $scope.onDelete = true
  };

  $scope.onDelete = false
  $scope.productsPks = []
  for (var i = 0; i < $scope.form.products.length; i++) {
    $scope.productsPks.push($scope.form.products[i].data.pk)
    // $scope.productBackup.push({pk:$scope.form.products[i].data.pk,qty:$scope.form.products[i].data.inStock + $scope.form.products[i].quantity})
  }
  $scope.$watch('form.products', function(newValue, oldValue) {
    if ($scope.onDelete) {
      $scope.onDelete = false
      return
    }
    console.log('ssssssssssssssssssss', oldValue.length, newValue.length, oldValue, newValue);
    if (oldValue.length != newValue.length || typeof oldValue[oldValue.length - 1].data == 'string') {
      if (newValue.length == 1) {
        if (typeof newValue[0].data == 'object') {
          $scope.productsPks.push(newValue[0].data.pk)
        }
      }
      if (newValue.length > 1) {
        if (typeof newValue[newValue.length - 1].data == 'object') {
          if ($scope.productsPks.indexOf(newValue[newValue.length - 1].data.pk) >= 0) {
            Flash.create('warning', 'This Product Has Already Added')
            $scope.form.products[newValue.length - 1].data = ''
          } else {
            console.log('pushingggggggggggggggg');
            $scope.productsPks.push(newValue[newValue.length - 1].data.pk)
          }
        }
      }
    }
    console.log('pkssssssssssssssss', $scope.productsPks);

  }, true)

  $scope.subTotal = function() {
    var subTotal = 0;
    var item;
    for (var i = 0; i < $scope.form.products.length; i++) {
      if ($scope.form.products[i].data!="" && $scope.form.products[i].data.product!=undefined) {
        item = $scope.form.products[i]
        var taxRate = item.data.product.productMeta!= null && item.data.product.productMeta!= undefined? item.data.product.productMeta.taxRate : 0;
        if (item.data.productVariant!=null) {
          subTotal += item.quantity * (item.data.productVariant.price + (taxRate * item.data.productVariant.price / 100))
        }else {
          subTotal += item.quantity * (item.data.product.price + (taxRate * item.data.product.price / 100))
        }
      }
    }
    $scope.posSubtotal = Math.round(subTotal)
    return $scope.posSubtotal.toFixed(2);
  }
  $scope.subTotalTax = function() {
    var subTotalTax = 0;
    var item;
    for (var i = 0; i < $scope.form.products.length; i++) {
      item = $scope.form.products[i]
      if ($scope.form.products[i].data!="" && $scope.form.products[i].data.product!=undefined ) {
        var taxRate = item.data.product.productMeta != null && item.data.product.productMeta != undefined ? item.data.product.productMeta.taxRate : 0;

        if (item.data.productVariant!=null) {
          subTotalTax += item.quantity * (taxRate * item.data.productVariant.price / 100)
        }else {
          subTotalTax += item.quantity * (taxRate * item.data.product.price / 100)
        }
      }
    }
    return subTotalTax.toFixed(2);
  }
  // $scope.productSearch = function(query) {
  //   return $http.get('/api/POS/product/?name__contains=' + query).
  //   then(function(response) {
  //     return response.data;
  //   })
  // }
  $scope.productSearch = function(query) {
    if (query.length > 0) {

      console.log("called1");
      var url = '/api/POS/storeQty/?product__name__contains' + query + '&limit=10'
      // var url = '/api/POS/product/?search=' + query + '&limit=10'
      if ($rootScope.multiStore) {
        console.log($rootScope.storepk);
        if ($rootScope.storepk > 0) {
          url = url + '&store=' + $rootScope.storepk
        } else {
          Flash.create('warning', 'Please Select Store First')
          return
        }
      } else {
        url = url + '&master=true'
      }
      return $http.get(url).
      then(function(response) {
        // console.log(response.data.results);
        // return response.data.results;
        var res;
        for (var i = 0; i < response.data.results.length; i++) {
          res = response.data.results[i]
          console.log(res);
          if (res.productVariant) {
            // console.log(res.productVariant);
            res.name = res.product.name + ' ' + $filter('convertUnit')(res.productVariant.unitPerpack * res.product.howMuch, res.product.unit)
          } else {
            res.name = res.product.name + ' ' + $filter('convertUnit')(res.product.howMuch, res.product.unit)
          }
        }

        return response.data.results;
      })
    }

  }
  $scope.instockUpdate = function(url, inStockData) {
    $http({
      method: 'PATCH',
      url: url,
      data: inStockData,
    }).
    then(function(response) {

    })
  }

  $scope.saveInvoiceForm = function() {
    var f = $scope.form;
    if (typeof $scope.invoice.duedate == 'object') {
      var date = $scope.invoice.duedate.toJSON().split('T')[0];
    } else {
      var date = $scope.invoice.duedate
    }
    // for (var i = 0; i < $scope.deletedProducts.length; i++) {
    //   console.log('dellllllllll',$scope.deletedProducts[i].url,$scope.deletedProducts['inStock']);
    //   // $scope.instockUpdate($scope.deletedProducts[i].url,{'inStock':$scope.deletedProducts['inStock']})
    // }
    // for (var i = 0; i < f.products.length; i++) {
    //   console.log("products............................",f.products[i].data.inStock ,f.products[i].quantity);
    //   if (f.products[i].data.pk == undefined) {
    //     continue;
    //   }
    //
    //   var inStockData = {'inStock':f.products[i].data.inStock - f.products[i].quantity};
    //
    //   for (var j = 0; j < $scope.productBackup.length; j++) {
    //     if (f.products[i].data.pk == $scope.productBackup[j].pk) {
    //       if (f.products[i].quantity > $scope.productBackup[j].qty) {
    //         var val = f.products[i].quantity - $scope.productBackup[j].qty
    //         var inStockData = {'inStock':f.products[i].data.inStock - val};
    //       }else if ($scope.productBackup[j].qty > f.products[i].quantity) {
    //         var val = $scope.productBackup[j].qty - f.products[i].quantity
    //         var inStockData = {'inStock':f.products[i].data.inStock + val};
    //       }else {
    //         var inStockData = {'inStock':f.products[i].data.inStock};
    //       }
    //       $scope.productBackup.splice(j,1)
    //     }
    //   }
    //
    //   var url = '/api/POS/product/' + f.products[i].data.pk + '/'
    //   console.log('alllllllll',url,inStockData);
    //   // $scope.instockUpdate(url,inStockData)
    //
    // }
    console.log("aaaaaaaaaaaaaaf");
    if (f.amountRecieved == undefined) {
      Flash.create('warning', 'Enter valid Received Amount');
      return;
    }

    var toSend = {
      // invoicedate: date,
      duedate: date,
      products: JSON.stringify(f.products),
      amountRecieved: f.amountRecieved,
      paymentRefNum: f.paymentRefNum,
      receivedDate: f.receivedDate.toJSON().split('T')[0],
      modeOfPayment: f.modeOfPayment,
    }
    if ($rootScope.multiStore) {
      toSend.storepk = $rootScope.storepk
    }

    $http({
      method: 'PATCH',
      url: '/api/POS/invoice/' + f.pk + '/',
      data: toSend,
    }).
    then(function(response) {
      // $scope.form.pk = response.data.pk;
      Flash.create('success', 'Saved');
    },function (err) {
      console.log(err);
      Flash.create('danger', err.data.detail);
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
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    var f = $scope.configureForm;
    if (f.description == null || f.description.length == 0 || f.code == null || f.code.length == 0 || f.taxRate == null || f.taxRate.length == 0 || f.typ == null || f.typ.length == 0) {
      Flash.create('warning', 'All Fields Are Required')
      return
    }
    if ($scope.configureForm.pk == undefined) {
      var method = 'POST';
      var url = '/api/POS/productMeta/'
    } else {
      var method = 'PATCH';
      url = '/api/POS/productMeta/' + $scope.configureForm.pk + '/';
    }
    var toSend = {
      description: f.description,
      code: f.code,
      taxRate: f.taxRate,
      typ: f.typ,

    }

    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      if ($scope.configureForm.pk == undefined) {
        Flash.create('success', 'Saved');
        $scope.resetForm();
      } else {
        Flash.create('success', 'Updated');
        $scope.configureForm = response.data
      }
    })

  }
})

app.controller("controller.POS.productinfo.form", function($scope, product, $http) {

  console.log(product);

  if (product.pk != undefined) {
    $scope.mode = 'edit';
    $scope.product = product;
    $scope.categoriesList = []
    // $scope.storeData = []
    // $scope.checkStore = []
    // for (var i = 0; i < $scope.product.storeQty.length; i++) {
    //   $scope.storeData.push($scope.product.storeQty[i].pk)
    //   $scope.checkStore.push($scope.product.storeQty[i].store.pk)
    // }
    if ($scope.product.compositionQtyMap == null) {
      $scope.compositionQtyMap = []
    } else {
      $scope.compositionQtyMap = JSON.parse($scope.product.compositionQtyMap)
    }

    $http({
      method: 'GET',
      url: '/api/POS/productVerient/?parent=' + $scope.product.pk
    }).
    then(function(response) {
      $scope.productData = response.data;
    })
    for (var i = 0; i < $scope.product.compositions.length; i++) {
      var a = {
        category: $scope.product.compositions[i],
        qty: 1
      }


      if ($scope.compositionQtyMap[i] != undefined) {
        a.qty = $scope.compositionQtyMap[i].qty
      }
      $scope.categoriesList.push(a)
    }
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

    if (f.mobile == null || f.mobile.length == 0) {
      Flash.create('warning', 'Mobile can not be left blank');
      return;
    }

    var toSend = {
      name: f.name,
      sameAsShipping: f.sameAsShipping,
      mobile: f.mobile
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
      Flash.create('success', 'Saved');
      // if ($scope.mode == 'new') {
      //   Flash.create('success', 'Saved');
      // } else {
      //   Flash.create('success', 'Created');
      // }
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
  console.log(invoice);
  $scope.invoice = invoice
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
  $scope.changeInvoiceStatus = function(inv){
    console.log(inv);
    if (inv.status == 'Created') {
      var toSend = {status:'In Progress'}
    }else {
      var toSend = {status:'Completed'}
    }

    $http({
      method: 'PATCH',
      url: '/api/POS/invoice/' + inv.pk + '/',
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      $scope.invoice = response.data
    })

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
    if (f.amountRecieved == undefined) {
      Flash.create('warning', 'Enter valid Received Amount');
      return;
    }
    if (f.amountRecieved.length == 0) {
      Flash.create('warning', 'Amount can not be left blank');
      return;
    }


    var toSend = {
      amountRecieved: f.amountRecieved,
      modeOfPayment: f.modeOfPayment,
      paymentRefNum: f.paymentRefNum,
    }
    if (f.receivedDate != null) {
      if (typeof f.receivedDate == 'object') {
        toSend.receivedDate = f.receivedDate.toJSON().split('T')[0]
      } else {
        toSend.receivedDate = f.receivedDate
      }
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

app.controller("controller.POS.productForm.modal", function($scope, product,newProduct, $http, Flash,$uibModalInstance) {
  console.log(product,newProduct, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  $scope.newProduct = newProduct
  console.log(typeof $scope.newProduct);


  $scope.multiStores = false
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=multipleStore').
  then(function(response) {
    console.log('ratingggggggggggggggggggg', response.data);
    if (response.data[0] != null) {
      if (response.data[0].flag) {
        $scope.multiStores = true
      }
    }
  })
  $scope.$watch('product.productMeta', function(newValue, oldValue) {
    if (typeof newValue == 'object') {
      $scope.showTaxCodeDetails = true;
    } else {
      $scope.showTaxCodeDetails = false;
    }
  })

  $scope.searchTaxCode = function(c) {
    return $http.get('/api/POS/productMeta/?description__contains=' + c).
    then(function(response) {
      return response.data;
    })
  }
  $scope.categorySearch = function(c) {
    return $http.get('/api/POS/product/?search=' + c + '&limit=10').
    then(function(response) {
      console.log(response.data);
      return response.data.results;
    })
  }

  $scope.storeStore = function(storesearch) {
    return $http.get('/api/POS/store/?search=' + storesearch + '&limit=10').
    then(function(response) {
      console.log(response.data);
      return response.data.results;
    })
  }


  $scope.categoriesList = []
  $scope.compositionQtyMap = []
  $scope.categoriesPk = []
  $scope.categoryForm = {
    category: '',
    qty: 1,
    unit: product.unit
  }
  // $scope.storeData = []
  // $scope.checkStore = []
  // $scope.storeData.pk = []

  if (product.pk != undefined) {
    $scope.mode = 'edit';
    $scope.product = product;
    // for (var i = 0; i < $scope.product.storeQty.length; i++) {
    //   $scope.storeData.push($scope.product.storeQty[i].pk)
    //   $scope.checkStore.push($scope.product.storeQty[i].store.pk)
    // }
    if ($scope.product.compositionQtyMap == null || $scope.product.compositionQtyMap.length == 0 || $scope.product.compositionQtyMap.length == '') {
      $scope.compositionQtyMap = []
    } else {
      $scope.compositionQtyMap = JSON.parse($scope.product.compositionQtyMap)
    }

    $http({
      method: 'GET',
      url: '/api/POS/productVerient/?parent=' + $scope.product.pk
    }).
    then(function(response) {
      $scope.productData = response.data;
    })

    for (var i = 0; i < $scope.product.compositions.length; i++) {
      $scope.categoriesPk.push($scope.product.compositions[i].pk)
      var a = {
        category: $scope.product.compositions[i],
        qty: 1
      }
      if ($scope.compositionQtyMap[i] != undefined) {
        a.qty = $scope.compositionQtyMap[i].qty
      }
      if ($scope.compositionQtyMap[i]!= undefined && $scope.compositionQtyMap[i].unit != undefined) {
        a.unit = $scope.compositionQtyMap[i].unit
      }
      $scope.categoriesList.push(a)
    }

  }
  else if(typeof $scope.newProduct== 'object'){
      $scope.mode = 'edit';
      $scope.product = $scope.newProduct
    }
  else if(typeof $scope.newProduct== 'string'){
      $scope.mode = 'new';
      $scope.product = {
        'name': $scope.newProduct,
        'productMeta': '',
        'price': 0,
        'displayPicture': emptyFile,
        'serialNo': '',
        'description': '',
        'alias': '',
        'inStock': 0,
        'cost': 0,
        'logistics': 0,
        'serialId': '',
        'reorderTrashold': 0,
        'pk': null,
        'unit': '',
        'grossWeight':'',
        'discount': 0,
        'storeQty': [],
        'howMuch': '',
      }
    }
  else {
    $scope.mode = 'new';
    $scope.product = {
      'name': '',
      'productMeta': '',
      'price': 0,
      'displayPicture': emptyFile,
      'serialNo': '',
      'description': '',
      'alias': '',
      'inStock': 0,
      'cost': 0,
      'logistics': 0,
      'serialId': '',
      'reorderTrashold': 0,
      'pk': null,
      'unit': '',
      'grossWeight':'',
      'discount': 0,
      'storeQty': [],
      'howMuch': '',
    }
  }
  $scope.storeDetail = {
    'store': '',
    'quantity': ''
  }

  // $scope.savestore = function() {
  //   console.log($scope.storeDetail, $scope.storeData, $scope.checkStore);
  //   if ($scope.checkStore.indexOf($scope.storeDetail.store.pk) >= 0) {
  //     Flash.create('warning', 'This Store Has Already Added')
  //     return
  //   }
  //   var method = 'POST'
  //   var url = '/api/POS/storeQty/'
  //   if ($scope.storeDetail.editpk != undefined && $scope.storeDetail.editpk > 0) {
  //     method = 'PATCH'
  //     url = url + $scope.storeDetail.editpk + '/'
  //   }
  //   var sendData = {
  //     store: $scope.storeDetail.store.pk,
  //     quantity: $scope.storeDetail.quantity
  //   }
  //   $http({
  //     method: method,
  //     url: url,
  //     data: sendData,
  //   }).
  //   then(function(response) {
  //     Flash.create('success', 'Saved')
  //     console.log(response.data);
  //     $scope.product.storeQty.push(response.data)
  //     $scope.storeData.push(response.data.pk)
  //     $scope.checkStore.push(response.data.store.pk)
  //     $scope.storeDetail = {
  //       'store': '',
  //       'quantity': ''
  //     }
  //   })
  //
  // }

  $scope.addCategories = function() {
    if ($scope.product.unit == null) {
      Flash.create('warning','Please select Unit type')
      return;
    }else {
      $scope.categoryForm.unit = $scope.product.unit
    }
    if (typeof $scope.categoryForm.category != 'object') {
      Flash.create('warning', 'Category Should Be Suggested One');
      return;
    }
    if ($scope.categoriesPk.indexOf($scope.categoryForm.category.pk) >= 0) {
      Flash.create('warning', 'This Category Has Already Added');
      return;
    }
    $scope.categoriesList.push($scope.categoryForm)
    $scope.categoriesPk.push($scope.categoryForm.category.pk)

    $scope.compositionQtyMap.push({
      'categoryPk': $scope.categoryForm.category.pk,
      'qty': $scope.categoryForm.qty,
      'unit': $scope.product.unit
    })

    $scope.categoryForm = {
      category: '',
      qty: 1,
      unit: $scope.product.unit
    }
  }
  $scope.editCategories = function(idx) {
    $scope.categoryForm = {
      category: $scope.categoriesList[idx].category,
      qty: $scope.categoriesList[idx].qty,
      unit: $scope.product.unit
    }
    $scope.categoriesList.splice(idx, 1)
    $scope.categoriesPk.splice(idx, 1)
    $scope.compositionQtyMap.splice(idx, 1)
  }
  $scope.removeCategories = function(idx) {
    console.log($scope.categoriesList);


    $scope.categoriesList.splice(idx, 1)
    $scope.categoriesPk.splice(idx, 1)
    $scope.compositionQtyMap.splice(idx, 1)

    console.log($scope.categoriesList);

  }


  $scope.$watch("product.price*productVerientForm.unitPerpack", function(result) {
    $scope.productVerientForm.price = result;
  });

  $scope.save = function() {
    console.log($scope.categoriesList);
    console.log($scope.compositionQtyMap);
    // console.log($scope.storeData.length, 'lllllllllllllllllllllllll');
    console.log('entered', $scope.product.discount, 'aaaa');
    // console.log($scope.product.productMeta);
    // console.log($scope.product.productMeta.pk);


    var f = $scope.product;
    console.log(f.price, 's');
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
    if (f.price == undefined) {
      Flash.create('warning', 'Enter valid MRP');
      return;
    }
    // if (f.inStock == undefined) {
    //   Flash.create('warning', 'Add a valid number of items In Stock');
    //   return;
    // }
    if (f.price.length == 0 || f.price < 0) {
      Flash.create('warning', 'MRP Is Required');
      return;
    }
    // if (f.inStock.length == 0 || f.inStock < 0) {
    //   Flash.create('warning', 'Add a valid number of items In Stock');
    //   return;
    // }
    if (f.discount < 0 || f.discount > 100 || f.price.length < 0) {
      Flash.create('warning', 'discount should in range 0-100');
      return;
    }

    if (f.unit == null) {
      Flash.create('warning', 'Please select unit type');
      return;
    }
    if (isNaN(f.howMuch) || f.howMuch == null) {
      Flash.create('warning', 'Enter valid How much');
      return;
    }

    fd.append('name', f.name);
    fd.append('price', f.price);
    fd.append('cost', f.cost);
    fd.append('serialNo', f.serialNo);
    fd.append('description', f.description);
    fd.append('grossWeight', f.grossWeight);
    fd.append('logistics', f.logistics);
    fd.append('serialId', f.serialId);
    fd.append('reorderTrashold', f.reorderTrashold);
    fd.append('discount', f.discount);
    if (f.productMeta != null && typeof f.productMeta == 'object') {
      console.log('cameeee');
      fd.append('productMeta', f.productMeta.pk);
    }
    if (f.unit != null && f.unit.length > 0) {
      fd.append('unit', f.unit);
    }
    if (f.alias != null && f.alias.length > 0) {
      fd.append('alias', f.alias);
    }
    if (f.howMuch != null && f.howMuch > 0) {
      fd.append('howMuch', f.howMuch);
    }


    if ($scope.categoriesList.length > 0) {
      fd.append('haveComposition', true);
      fd.append('compositions', $scope.categoriesPk);
      fd.append('compositionQtyMap', JSON.stringify($scope.compositionQtyMap));
      console.log($scope.categoriesPk);
      console.log($scope.compositionQtyMap);
      console.log(JSON.stringify($scope.compositionQtyMap));
    } else {
      fd.append('haveComposition', false);
      fd.append('compositions', []);
      fd.append('compositionQtyMap', '');
    }
    // fd.append('storeQty', $scope.storeData)
    // if($scope.storeData.length>0){
    //
    //   fd.append('storeQty' , $scope.storeData)
    //
    // }


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
      Flash.create('success', 'Saved')
      console.log(response.data, 'aaaaaaaaa');
      $scope.product.pk = response.data.pk;
      if ($scope.mode == 'new') {
        $scope.product.pk = response.data.pk;
        $scope.mode = 'edit';
        if($scope.newProduct.length>0){
          $uibModalInstance.dismiss(response.data)
        }
        if (response.data.serialNo ==="") {
          $http({
            method: 'POST',
            url: '/api/POS/addProductSKU/',
            data:{
              value:response.data.pk
            }
          }).
          then(function(response) {
              $scope.product.serialNo = response.data
          })

        }
      }
      else{
        if(typeof $scope.newProduct == 'object'){
          $uibModalInstance.dismiss(response.data)
        }
      }
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

  // $scope.deleteStore = function(pk, ind) {
  //   $http({
  //     method: 'DELETE',
  //     url: '/api/POS/storeQty/' + pk + '/'
  //   }).
  //   then((function(ind) {
  //     return function(response) {
  //       $scope.product.storeQty.splice(ind, 1);
  //       $scope.storeData.splice(ind, 1);
  //       $scope.checkStore.splice(ind, 1);
  //       Flash.create('success', 'Deleted');
  //     }
  //   })(ind))
  //
  // }
  // $scope.editStore = function(ind) {
  //   console.log($scope.product.storeQty[ind]);
  //   $scope.storeDetail = {
  //     'store': $scope.product.storeQty[ind].store,
  //     'quantity': $scope.product.storeQty[ind].quantity,
  //     'editpk': $scope.product.storeQty[ind].pk
  //   }
  //   $scope.product.storeQty.splice(ind, 1);
  //   $scope.storeData.splice(ind, 1);
  //   $scope.checkStore.splice(ind, 1);
  //
  // }

  $scope.productVerientForm = {
    'sku': '',
    'unitPerpack': 2,
    'price': '',
    'serialId': '',
    'prodDesc' :''
  }

  $scope.productData = [];
  $scope.saveUnits = function() {
    console.log('aaaaaaaaaaaaa');
    var f = $scope.productVerientForm;


    if ($scope.product.unit =='Size' || $scope.product.unit =='Size and Color' ) {
        if (isNaN(parseInt(f.unitPerpack))) {
          Flash.create('warning','Format of Size os not correct')
          return ;
        }
    }

    if (f.price == null || f.price.length == 0) {
      Flash.create('warning', 'Please enter secondary SKU price')
      return
    }

    if (f.sku == null || f.sku.length == 0) {
      Flash.create('warning', 'Please enter Secondary SKU')
      return
    }

    if (f.serialId == null || f.serialId.length == 0) {
      Flash.create('warning', 'Please enter Secondary Serial Id')
      return
    }

    var toSend = {
      parent: $scope.product.pk,
      sku: f.sku,
      unitPerpack: f.unitPerpack,
      price: f.price,
      serialId: f.serialId
    }

    if (f.prodDesc!='' && f.prodDesc != null ) {
      // toSend.prodDesc = f.prodDesc
      prodDescArr  = f.prodDesc.split(',')
      var constSku = toSend.sku
      for (var i = 0; i < prodDescArr .length; i++) {
        var toSend2 = {...toSend}
        toSend2.prodDesc = prodDescArr[i]
        toSend2.sku = constSku +'&'+ prodDescArr[i]

        console.log(toSend2);

        $http({
          method: 'POST',
          url: '/api/POS/productVerient/',
          data: toSend2
        }).
        then(function(response) {
          $scope.productData.push(response.data);
          $scope.productVerientForm = {
            'sku': '',
            'unitPerpack': 2,
            'serialId': '',
            'prodDesc':''
          }
          Flash.create('success', 'Saved');
        }, function(err) {
          console.log(err);
          Flash.create('danger', err.statusText)
        })
      }

    }else {
      $http({
        method: 'POST',
        url: '/api/POS/productVerient/',
        data: toSend
      }).
      then(function(response) {
        $scope.productData.push(response.data);
        $scope.productVerientForm = {
          'sku': '',
          'unitPerpack': 2,
          'serialId': ''
        }
        Flash.create('success', 'Saved');
      }, function(err) {
        console.log(err);
        Flash.create('danger', err.statusText)
      })
    }

  }


});


function getMonday(date) {
  var day = date.getDay() || 7;
  if (day !== 1)
    date.setHours(-24 * (day - 1));
  return date;
}


app.controller("businessManagement.POS.default", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $aside, $filter,$rootScope) {

  // $scope.modeofpayment = ["card", "netBanking", "cash", "cheque"];
  // $scope.posShowAll = true
  // if (settings_posScanner) {
  //   $scope.posShowAll = false
  // }

// console.log(settings_posScanner,'@@@@@@@@@@@@@@@@@@@@@@@@');

  $http({
    method: 'POST',
    url: '/api/POS/addProductSKU/',
  }).
  then(function(response) {

  })

 $scope.posShowAll = true
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=posScanner').
  then(function(response) {
    console.log(response.data);
    if(response.data.length>0){
      if (response.data[0].flag) {
         $scope.posShowAll = false
      }
    }
    console.log($scope.posShowAll);
  })

  $scope.today = new Date();
  $scope.firstDay = new Date($scope.today.getFullYear(), $scope.today.getMonth(), 2);
  $scope.monday = getMonday(new Date());


  $scope.graphForm = {
    graphType: 'week'
  }

  $scope.$watch('graphForm.graphType', function(newValue, oldValue) {

    if (newValue == 'day') {
      var toSend = {
        date: $scope.today
      };
    } else if (newValue == 'week') {
      var toSend = {
        from: $scope.monday,
        to: $scope.today
      };
    } else {
      var toSend = {
        from: $scope.firstDay,
        to: $scope.today
      };
    }

    $http({
      method: 'POST',
      url: '/api/POS/salesGraphAPI/',
      data: toSend
    }).
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

  // $scope.posProductDel = false
  // $http.get('/api/ERP/appSettings/?app=25&name__iexact=posProduct').
  // then(function(response) {
  //   if(response.data[0]!=null){
  //     if (response.data[0].flag) {
  //       $scope.posProductDel = true
  //     }
  //   }
  //   console.log($scope.posProductDel,'aaaaaaaaaaaaa');
  // })


  $scope.productSearch = function(query) {
    if (query.length > 0) {

      console.log("called1");
      var url = '/api/POS/storeQty/?product__name__icontains=' + query + '&limit=10'
      // var url = '/api/POS/product/?search=' + query + '&limit=10'
      if ($rootScope.multiStore) {
        console.log($rootScope.storepk);
        if ($rootScope.storepk > 0) {
          url = url + '&store=' + $rootScope.storepk
        } else {
          Flash.create('warning', 'Please Select Store First')
          return
        }
      } else {
        url = url + '&master=true'
      }
      return $http.get(url).
      then(function(response) {
        // console.log(response.data.results);
        // return response.data.results;
        var res;
        for (var i = 0; i < response.data.results.length; i++) {
          res = response.data.results[i]
          console.log(res);
          if (res.productVariant) {
            // console.log(res.productVariant);
            res.name = res.product.name + ' ' + $filter('convertUnit')(res.productVariant.unitPerpack * res.product.howMuch, res.product.unit)
          } else {
            res.name = res.product.name + ' ' + $filter('convertUnit')(res.product.howMuch, res.product.unit)
          }
        }

        return response.data.results;
      })
    }

  }

  $scope.data = {
    tableData: [],
    invoiceDataTable: [],
    customerDataTable: [],
    // productMetatableData: []
  };

  $scope.data.tableData.posProductDel = $scope.posProductDel

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
    filterSearch: true,
    searchField: 'Name or SKU',
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
    } else if (action == 'delete') {
      $http({
        method: 'DELETE',
        url: '/api/POS/product/' + target + '/'
      }).
      then(function(response) {
        Flash.create('success', 'Deleted');
        $scope.$broadcast('forceRefetch', )
      })
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
    $http({
      method: 'GET',
      url: '/api/POS/getNextAvailableInvoiceID/'
    }).
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
      serialNumber: '',
      receivedDate: new Date(),
      products: [{
        data: '',
        quantity: 1
      }],
      cMobileNumber:'',
      // returnquater : 'jan-march'
    }
    $scope.wampData = []
    $scope.productsPks = []

    $scope.getInvoiceID();

  }

  $scope.returnquaters = ['jan-march', 'april-june', 'july-sep', 'oct-dec']

  $scope.resetForm();
  $scope.posSubtotal = 0

  $scope.subTotal = function() {
    var subTotal = 0;
    var item;
    for (var i = 0; i < $scope.form.products.length; i++) {
      if ($scope.form.products[i].data!="" && $scope.form.products[i].data.product!=undefined) {
        item = $scope.form.products[i]
        var taxRate = item.data.product.productMeta!= null && item.data.product.productMeta!= undefined? item.data.product.productMeta.taxRate : 0;
        if (item.data.productVariant!=null) {
          subTotal += item.quantity * (item.data.productVariant.price + (taxRate * item.data.productVariant.price / 100))
        }else {
          subTotal += item.quantity * (item.data.product.price + (taxRate * item.data.product.price / 100))
        }
      }
    }
    $scope.posSubtotal = Math.round(subTotal)
    return $scope.posSubtotal.toFixed(2);
  }
  $scope.subTotalTax = function() {
    var subTotalTax = 0;
    var item;
    for (var i = 0; i < $scope.form.products.length; i++) {
      item = $scope.form.products[i]
      if ($scope.form.products[i].data!="" && $scope.form.products[i].data.product!=undefined ) {
        var taxRate = item.data.product.productMeta != null && item.data.product.productMeta != undefined ? item.data.product.productMeta.taxRate : 0;

        if (item.data.productVariant!=null) {
          subTotalTax += item.quantity * (taxRate * item.data.productVariant.price / 100)
        }else {
          subTotalTax += item.quantity * (taxRate * item.data.product.price / 100)
        }
      }
    }
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


  $scope.sai = 'kiran'
  $rootScope.multiStore = false
  $rootScope.storepk = 0

  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    console.log(decodedCookie);
    var ca = decodedCookie.split(';');
    console.log(ca);
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function setCookie(cname, cvalue, exdays) {
    console.log('set cookie');
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function createCookieDevice(deviceNo) {
    console.log('create cookieeeeeeeee', deviceNo);
    detail = getCookie("connectedDevice");
    if (detail != "") {
      console.log('already there');
      document.cookie = encodeURIComponent("connectedDevice") + "=deleted; expires=" + new Date(0).toUTCString()
    }
    setCookie("connectedDevice", deviceNo, 365);
  }

  function createCookieStore(store) {
    console.log('create cookieeeeeeeee', store);
    detail = getCookie("selectedStore");
    if (detail != "") {
      console.log('already there');
      document.cookie = encodeURIComponent("selectedStore") + "=deleted; expires=" + new Date(0).toUTCString()
    }
    setCookie("selectedStore", store, 365);
  }

  $scope.storeForm = {
    'name': ''
  }
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=multipleStore').
  then(function(response) {
    console.log('ratingggggggggggggggggggg', response.data);
    if (response.data[0] != null) {
      if (response.data[0].flag) {
        $rootScope.multiStore = true
        selectedStore = getCookie("selectedStore");
        console.log('strrrrrrrrrrrrrrr', selectedStore);
        if (selectedStore != "") {
          $scope.storeForm.name = JSON.parse(selectedStore)
          $rootScope.storepk = $scope.storeForm.name.pk
          // $scope.connectDevice()
        }
      }
    }
  })

  $scope.$watch('storeForm.name', function(newValue, oldValue) {
    if (typeof newValue == 'object') {
      $rootScope.storepk = newValue.pk
      createCookieStore(JSON.stringify(newValue))
    }
  })

  $scope.storeSearch = function(query) {
    return $http.get('/api/POS/store/?name__icontains=' + query).
    then(function(response) {
      return response.data;
    })
  }
  $scope.form.cMobileRequired = false
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=customerAddress').
  then(function(response) {
    console.log('ratingggggggggggggggggggg', response.data);
    if (response.data[0] != null) {
      if (response.data[0].flag) {
        $scope.form.cMobileRequired = true
      }
    }
  })
  $scope.openInvoiceCustomerForm = function(){
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.Invoice.newCustomer.form.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        mobile: function() {
          return $scope.form.cMobileNumber
        }
      },
      controller: function($scope,$uibModalInstance,mobile) {
        $scope.cstForm = {mobile:mobile,name:'',pincode:'',city:'',state:'',country:'India',street:''}
        $scope.$watch('cstForm.pincode', function(newValue, oldValue) {
          if (newValue != null) {
            if (newValue.length == 6) {
              $http({
                method: 'GET',
                url: '/api/ecommerce/genericPincode/?pincode__iexact=' + newValue
              }).
              then(function(response) {
                if (response.data.length > 0) {
                  $scope.cstForm.city = response.data[0].city
                  $scope.cstForm.state = response.data[0].state
                }
              })
            }
          }
        })
        $scope.saveCust = function(){
          if ($scope.cstForm.name.length==0) {
            Flash.create('warning', 'Please Enter Customer Name')
            return
          }
          var f = $scope.cstForm
          var toSend = {name:f.name,mobile:f.mobile,pincode:f.pincode,country:f.country,state:f.state,city:f.city,street:f.street}

          $http({
            method: 'POST',
            url: '/api/POS/customer/',
            data: toSend
          }).
          then(function(response) {
            Flash.create('success', 'Saved');
            $uibModalInstance.dismiss(response.data)

          })
        }

      },
    }).result.then(function() {

    }, function(a) {
      console.log(a);
      if (typeof a == 'object') {
        $scope.form.customer = a
      }


    });
  }

  $scope.customerSeacrh = function() {
    $scope.form.customer = ''
    if ($scope.form.cMobileNumber.length<10) {
      Flash.create('warning', 'Please Enter Proper Miobile Number')
      return
    }
    $http({
      method: 'GET',
      url: '/api/POS/customer/?mobile__icontains=' + $scope.form.cMobileNumber
    }).
    then(function(response) {
      console.log('resssssssss', response.data);
      if (response.data.length>0) {
        $scope.form.customer = response.data[0]
      }else {
        $scope.form.customer = ''
        $scope.openInvoiceCustomerForm()
      }
    })
  }


  $scope.connectData = {
    deviceID: '123'
  }
  $scope.connected = false
  // console.log(wampSession,'wamp sessionnnnnnn');
  $scope.connectDevice = function() {
    console.log('connect Deviceeeeeeeeeeeeee');
    if ($scope.connectData.deviceID.length == 0) {
      Flash.create('danger', 'Please Enter Device Id')
      return
    }
    console.log($scope.connectData.deviceID);
    createCookieDevice($scope.connectData.deviceID)

    wampSession.subscribe('service.POS.device.' + $scope.connectData.deviceID, $scope.processScannerNotification).then(
      function(sub) {
        console.log('sssssssssssssss', sub);
        $scope.subId = sub
        console.log("subscribed to 'POS'");
        $scope.connected = true
      },
      function(err) {
        console.log("failed to subscribed: " + err);
      }
    );

  }

  connectedDevice = getCookie("connectedDevice");
  console.log('devvvvvvvvvvvvvvvvvvvvv', connectedDevice);
  if (connectedDevice != "") {
    $scope.connectData.deviceID = connectedDevice
    // $scope.connectDevice()
  }


  $scope.disconnectDevice = function() {
    console.log($scope.subId);
    wampSession.unsubscribe($scope.subId).then(
      function() {
        console.log("unSubscribed to 'POS'");
        $scope.connectData = {
          deviceID: '123'
        }
        $scope.connected = false
      },
      function() {
        console.log("failed to subscribed: " + err);
      }
    );
  }

  $scope.processScannerNotification = function(args) {
    console.log('cameeeeeeeeeeeeeee');
    console.log(args);
    $scope.a = args[0].parent
    console.log($scope.a);
    $http({
      method: 'GET',
      url: '/api/POS/product/?serialNo=' + $scope.a
    }).
    then(function(response) {
      console.log('resssssssss', response.data);
      if (response.data.length > 0) {
        if ($scope.wampData.indexOf($scope.a) >= 0) {
          var idx = $scope.wampData.indexOf($scope.a)
        } else {
          $scope.wampData.push($scope.a)
          var idx = -1
        }
        console.log($scope.wampData);
        if ($scope.wampData.length == 1) {
          if (idx >= 0) {
            $scope.form.products[idx].quantity += 1
          } else {
            $scope.form.products = [{
              data: response.data[0],
              quantity: 1
            }]
          }
        } else {
          if (idx >= 0) {
            $scope.form.products[idx].quantity += 1
          } else {
            $scope.form.products.push({
              data: response.data[0],
              quantity: 1
            })
          }
        }
      }
    })
  }
  $scope.payPopup = function() {
    if ($scope.form.cMobileRequired && typeof $scope.form.customer != 'object') {
      Flash.create('danger', 'Please Add The Customer Address')
      return;
    }
    if ($rootScope.multiStore) {
      if (typeof $scope.storeForm.name == 'string') {
        Flash.create('danger', 'Please Select The Store')
        return;
      }
    }
    if ($scope.form.products.length == 0 || $scope.form.products.length == 1 && typeof $scope.form.products[0].data == 'string') {
      Flash.create('danger', 'There is no product to generate invoice for')
      return;
    }
    if (typeof $scope.form.products[$scope.form.products.length - 1].data == "string") {
      Flash.create('danger', 'Please Delete Unwanted Empty Row')
      return;
    }
    $scope.qty = 0
    for (var i = 0; i < $scope.form.products.length; i++) {
      $scope.qty += $scope.form.products[i].quantity
    }
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.product.payPopup.html',
      size: 'xl',
      backdrop: true,
      resolve: {
        amount: function() {
          return $scope.posSubtotal
        },
        qty: function() {
          return $scope.qty
        }
      },
      controller: function($scope, amount, qty, $uibModalInstance) {




        console.log('in popupppppp',qty ,  amount, typeof(amount));
        $scope.payMode = 'cash'
        $scope.receivedAmount = ''
        $scope.posSaved = false
        $scope.amount = amount
        $scope.qty = qty
        $scope.returnAmount = 0
        $scope.cardTyp = {
          refNumber: ''
        }
        $scope.payform = {
          amount: null
        }
        $scope.addNum = function(num) {
          document.getElementById("hiddeninput").focus();
          if (num == 'clear') {
            $scope.receivedAmount = $scope.receivedAmount.slice(0, -1)
          } else {
            $scope.receivedAmount += num
          }
          if ($scope.receivedAmount.length > 0) {
            $scope.returnAmount = parseInt($scope.receivedAmount) - $scope.amount
            $scope.payform.amount = parseInt($scope.receivedAmount)
          } else {
            $scope.returnAmount = $scope.amount
            $scope.payform.amount = null
          }
        }
        $scope.$watch('payform.amount', function(newValue, oldValue) {
          if (newValue == null) {
            $scope.receivedAmount = ''
          } else {
            $scope.receivedAmount = newValue.toString()
          }
          if ($scope.receivedAmount.length > 0) {
            $scope.returnAmount = parseInt($scope.receivedAmount) - $scope.amount
          } else {
            $scope.returnAmount = $scope.amount
          }
        })
        $scope.$watch('payMode', function(newValue, oldValue) {
          if (newValue == 'cash') {
            console.log('paymodeeeeeeeeeeee', newValue);
            document.getElementById("hiddeninput").focus();
          }
        })
        $scope.savePosPopup = function(typ) {
          if (typ=='PAYED') {
            if ($scope.payMode == 'cash') {
              document.getElementById("hiddeninput").focus();
              if ($scope.receivedAmount.length > 0) {
                if ($scope.amount > parseInt($scope.receivedAmount)) {
                  Flash.create('danger', 'Please Receive Proper Amount')
                  return
                }
                $scope.returnAmount = parseInt($scope.receivedAmount) - $scope.amount
                console.log($scope.returnAmount);
              } else {
                document.getElementById("hiddeninput").focus();
                Flash.create('warning', 'Please Enter Receivd Amount')
                return
              }
            } else if ($scope.payMode == 'card') {
              if ($scope.cardTyp.refNumber.length == 0) {
                Flash.create('warning', 'Please Enter Payment Reference number')
                return
              }
            }
            $rootScope.$broadcast('POSPayPopup', {
              payMode: $scope.payMode,
              amountRecieved: parseInt($scope.receivedAmount),
              paymentRefNum: $scope.cardTyp.refNumber,
              typ:typ
            })
          }else {
            $rootScope.$broadcast('POSPayPopup', {
              typ:typ
            })
          }

          setTimeout(function() {
            $scope.posSaved = true
            $scope.CancelPosPopup()
          }, 1000);
        }
        $scope.CancelPosPopup = function() {
          $uibModalInstance.dismiss()
        }

      },
    }).result.then(function() {

    }, function(a) {
      console.log(a);
      // Flash.create('sucess','Payment Done !')

    });

  }

  $scope.$on('POSPayPopup', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.saveInvoice(input)
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
      size: 'xxl',
      backdrop: true,
      resolve: {
        product: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.data.tableData[idx];
          }
        },
        newProduct: function() {
            return '';
        },
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
          url: '/api/POS/productMeta/',
          searchField: 'description',
          itemsNumPerView: [8, 16, 24],
        }

        $scope.tableActionProductMeta = function(target, action, mode) {
          console.log($scope.data.productMetatableData);
          for (var i = 0; i < $scope.data.productMetatableData.length; i++) {
            if ($scope.data.productMetatableData[i].pk == parseInt(target)) {
              if (action == 'edit') {
                var title = 'ProductMeta : ';
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
              } else if (action == 'delete') {

                $http({
                  method: 'DELETE',
                  url: '/api/POS/productMeta/' + target + '/'
                }).
                then(function(response) {
                  Flash.create('success', 'Deleted');
                  $scope.$broadcast('forceRefetch', )
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
    if ($scope.form.products.length > 0 && typeof $scope.form.products[$scope.form.products.length - 1].data == "string") {
      Flash.create('danger', 'Please Fill The Current Row')
      return;
    }
    $scope.form.products.push({
      data: "",
      quantity: 1
    });
    console.log($scope.form.products);

  }

  $scope.delete = function(index) {
    $scope.form.products.splice(index, 1);
    $scope.wampData.splice(index, 1)
    $scope.productsPks.splice(index, 1)
    $scope.onDelete = true
  };

  $scope.onDelete = false
  $scope.productsPks = []
  $scope.$watch('form.products', function(newValue, oldValue) {
    if ($scope.onDelete) {
      $scope.onDelete = false
      return
    }
    console.log('ssssssssssssssssssss', oldValue.length, newValue.length, oldValue, newValue);
    if (oldValue.length != newValue.length || typeof oldValue[oldValue.length - 1].data == 'string') {
      if (newValue.length == 1) {
        if (typeof newValue[0].data == 'object') {
          $scope.productsPks.push(newValue[0].data.pk)
        }
      }
      if (newValue.length > 1) {
        if (typeof newValue[newValue.length - 1].data == 'object') {
          if ($scope.productsPks.indexOf(newValue[newValue.length - 1].data.pk) >= 0) {
            Flash.create('warning', 'This Product Has Already Added')
            $scope.form.products[newValue.length - 1].data = ''
          } else {
            console.log('pushingggggggggggggggg');
            $scope.productsPks.push(newValue[newValue.length - 1].data.pk)
          }
        }
      }
    }
    console.log('pkssssssssssssssss', $scope.productsPks);

  }, true)

  $scope.saveInvoice = function(a) {


    console.log(a);
    //  $scope.form.invoiceDate =

    $scope.form.invoiceDateVal = new Date($scope.form.invoiceDate);
    $scope.form.invoiceDt = new Date($scope.form.invoiceDateVal.getTime() + (24 * 60 * 60 * 1000));

    $scope.form.deuDateVal = new Date($scope.form.deuDate);
    $scope.form.deuDt = new Date($scope.form.deuDateVal.getTime() + (24 * 60 * 60 * 1000));

    console.log($scope.form , 'form');

    var f = $scope.form;


    if (a == undefined) {
      if (f.serialNumber.length == 0) {
        Flash.create('warning', 'serialNumber can not be left blank');
        return;
      }

      if (f.customer.pk == undefined) {
        Flash.create('warning', 'Please select a customer');
        return;
      }


      if (f.products.length == 1 && f.products[0].data == "") {
        Flash.create('danger', 'There is no product to generate invoice for')
        return;
      }
      var toSend = {
        serialNumber: f.serialNumber,
        invoicedate: f.invoiceDt.toJSON().split('T')[0],
        reference: f.reference,
        duedate: f.deuDt.toJSON().split('T')[0],
        returnquater: f.returnquater,
        modeOfPayment: f.modeOfPayment,
        products: JSON.stringify(f.products),
        customer: f.customer.pk,
        grandTotal: $scope.subTotal(),
        totalTax: $scope.subTotalTax(),
        amountRecieved: f.amountRecieved,
        paymentRefNum: f.paymentRefNum,
        receivedDate: f.receivedDate.toJSON().split('T')[0],
      }
    } else {
      var toSend = {
        serialNumber: f.serialNumber,
        products: JSON.stringify(f.products),
        grandTotal: $scope.subTotal(),
        totalTax: $scope.subTotalTax(),
      }
      toSend.connectedDevice = $scope.connectData.deviceID
      if (typeof f.customer == 'object') {
        toSend.customer = f.customer.pk
      }

      if (a.typ == 'COD') {
        toSend.modeOfPayment = 'cashOnDelivery'
      }else {
        toSend.modeOfPayment = a.payMode

        if (a.payMode == 'cash') {
          toSend.amountRecieved = a.amountRecieved
        } else if (a.payMode == 'card') {
          toSend.paymentRefNum = a.paymentRefNum
        }

      }
    }

    console.log(toSend);

    // for (var i = 0; i < f.products.length; i++) {
    //   console.log("products............................");
    //   var fd = new FormData();
    //   fd.append('inStock', (f.products[i].data.inStock - f.products[i].quantity));
    //
    //   if (f.products[i].data.pk == undefined) {
    //     continue;
    //   }
    //
    //   console.log(fd,url,f.products[i].data.inStock,f.products[i].quantity,'jjjjjjjjjjjjjjjjjjjjjjjjjjj');
    //   var url = '/api/POS/product/' + f.products[i].data.pk + '/'
    //   $http({
    //     method: 'PATCH',
    //     url: url,
    //     data: fd,
    //     transformRequest: angular.identity,
    //     headers: {
    //       'Content-Type': undefined
    //     }
    //   }).
    //   then(function(response) {
    //
    //   })
    // }


    // var returnquaterParts=toSend.returnquater.split('/');
    // toSend.returnquater=returnquaterParts[2]+'-'+returnquaterParts[0]+'-'+returnquaterParts[1];
    // var returndateParts=toSend.returndate.split('/');
    // toSend.returndate=returndateParts[2]+'-'+returndateParts[0]+'-'+returndateParts[1];
    // console.log(typeof toSend.returnquater,toSend.returnquater);
    if ($rootScope.multiStore) {
      toSend.storepk = $rootScope.storepk
    }
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
      console.log('sssssssssssss', response.data);
      $scope.form.pk = response.data.pk;
      Flash.create('success', 'Saved');
      if (a != undefined) {
        $scope.resetForm()
      }
    })
  }



});
