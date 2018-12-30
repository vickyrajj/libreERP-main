app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.deliveryCenter.offline', {
      url: "/offline",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.deliveryCenter.offline.html',
          controller: 'businessManagement.deliveryCenter.offline',
        }
      }
    })
});


app.controller('businessManagement.deliveryCenter.offline', function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $aside, $filter, $rootScope) {

  $scope.data = {
    processData: [],
    completedData: [],
  }

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.deliveryCenter.offline.orders.item.html',
  }, ];

  $scope.processConfig = {
    views: views,
    url: '/api/POS/invoice/',
    searchField: 'id',
    itemsNumPerView: [6, 12, 24],
    getParams: [{
      key: 'status!',
      value: 'Completed'
    }]
  }
  $scope.completedConfig = {
    views: views,
    url: '/api/POS/invoice/',
    searchField: 'id',
    itemsNumPerView: [6, 12, 24],
    getParams: [{
      key: 'status',
      value: 'Completed'
    }]
  }

  $scope.processTableActionInvoice = function(target, action) {
    console.log(target, action);
    console.log($scope.data.processData);

    if (action == 'new') {
      console.log('newwwwwwwwwwwww');
    } else {
      for (var i = 0; i < $scope.data.processData.length; i++) {
        if ($scope.data.processData[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openInvoiceForm(i, 'process');
          } else {
            $scope.openInvoiceinfoForm(i, 'process');
          }
        }
      }
    }

  }

  $scope.completedTableActionInvoice = function(target, action) {
    console.log(target, action);
    console.log($scope.data.completedData);

    if (action == 'new') {
      console.log('newwwwwwwwwwwww');
    } else {
      for (var i = 0; i < $scope.data.completedData.length; i++) {
        if ($scope.data.completedData[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openInvoiceForm(i, 'completed');
          } else {
            $scope.openInvoiceinfoForm(i, 'completed');
          }
        }
      }
    }

  }


  $scope.searchTabActive = true;

  $scope.openInvoiceForm = function(idx, typ) {

    if (idx == undefined || idx == null) {
      var toRet = {};
    } else {
      if (typ == 'completed') {
        var toRet = $scope.data.completedData[idx];
      } else {
        var toRet = $scope.data.processData[idx];
      }
    }

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.invoices.form.html',
      size: 'xl',
      backdrop: true,
      resolve: {
        invoice: function() {
          return toRet
        }
      },
      controller: 'businessManagement.deliveryCenter.offline.invoice.form',
    }).result.then(function() {

    }, function() {

    });


  }

  $scope.openInvoiceinfoForm = function(idx, typ) {
    if (idx == undefined || idx == null) {
      var toRet = {};
    } else {
      if (typ == 'completed') {
        var toRet = $scope.data.completedData[idx];
      } else {
        var toRet = $scope.data.processData[idx];
      }
    }
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.invoicesinfo.form.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        invoice: function() {
          return toRet
        }
      },
      controller: "businessManagement.deliveryCenter.offline.invoicesinfo.form",
    }).result.then(function() {

    }, function() {

    });



  }


});


app.controller("businessManagement.deliveryCenter.offline.item", function($scope) {
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

app.controller("businessManagement.deliveryCenter.offline.invoicesinfo.form", function($scope, invoice, $http, Flash) {
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

app.controller("businessManagement.deliveryCenter.offline.invoice.form", function($scope, invoice, $http, Flash, $rootScope, $filter) {

  console.log(invoice, 'invoiceinvoiceinvoiceinvoiceinvoice');

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
      if ($scope.form.products[i].data != "" && $scope.form.products[i].data.product != undefined) {
        item = $scope.form.products[i]
        var taxRate = item.data.product.productMeta != null && item.data.product.productMeta != undefined ? item.data.product.productMeta.taxRate : 0;
        if (item.data.productVariant != null) {
          subTotal += item.quantity * (item.data.productVariant.price + (taxRate * item.data.productVariant.price / 100))
        } else {
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
      if ($scope.form.products[i].data != "" && $scope.form.products[i].data.product != undefined) {
        var taxRate = item.data.product.productMeta != null && item.data.product.productMeta != undefined ? item.data.product.productMeta.taxRate : 0;

        if (item.data.productVariant != null) {
          subTotalTax += item.quantity * (taxRate * item.data.productVariant.price / 100)
        } else {
          subTotalTax += item.quantity * (taxRate * item.data.product.price / 100)
        }
      }
    }
    return subTotalTax.toFixed(2);
  }

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
    }, function(err) {
      console.log(err);
      Flash.create('danger', err.data.detail);
    })
  }



})
