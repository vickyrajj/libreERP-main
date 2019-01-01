
app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.deliveryCenter', {
      url: "/deliveryCenter",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.deliveryCenter.default.html',
          controller: 'businessManagement.deliveryCenter.default',
        },
        // "menu@businessManagement.deliveryCenter": {
        //   templateUrl: '/static/ngTemplates/genericMenu.html',
        //   controller: 'controller.generic.menu',
        // },
        // "@businessManagement.deliveryCenter": {
        //   templateUrl: '/static/ngTemplates/app.deliveryCenter.default.html',
        //   controller: 'businessManagement.deliveryCenter.default',
        // }
      }
    })
});

app.controller("businessManagement.deliveryCenter.default", function($scope, $http, Flash, $rootScope, $filter) {
  console.log('In Default Delivery Center Controller');
})

app.controller("app.deliveryCenter.orders.online", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $aside, $filter) {
  console.log('In online orderss Controller');
  $scope.currency = ""
  $http.get('/api/ERP/appSettings/?name__iexact=currencySymbol').
  then(function(response) {
    if (response.data[0] != null) {
        $scope.currency =response.data[0].value
      }
    })

  $scope.limit = 0
  $scope.invData = []
  $scope.intLength = 0
  $scope.showMore = true
  $scope.fetchInvData = function(){
    $scope.limit += 6
    $http.get('/api/ecommerce/order/?status__in=ordered,completed&offset=0&limit='+$scope.limit).
    then(function(response) {
      console.log('**********************', response.data.results);
      $scope.invData = response.data.results
      if (response.data.results.length == $scope.intLength) {
        $scope.showMore = false
      }else {
        $scope.showMore = true
        $scope.intLength = response.data.results.length
      }
    })
  }
  $scope.fetchInvData()

  $scope.rowActionClicked = function(target, action) {
    console.log(target, action);
    $scope.exploreOrder(target, 'created');
  }

  $scope.pglimit = 0
  $scope.pginvData = []
  $scope.pgintLength = 0
  $scope.pgshowMore = true
  $scope.pgfetchInvData = function(){
    $scope.pglimit += 2
    $http.get('/api/ecommerce/order/?orderQtyMap__status=packed&offset=0&limit='+$scope.pglimit).
    then(function(response) {
      console.log('**********************', response.data.results);
      $scope.pginvData = response.data.results
      if (response.data.results.length == $scope.pgintLength) {
        $scope.pgshowMore = false
      }else {
        $scope.pgshowMore = true
        $scope.pgintLength = response.data.results.length
      }
    })
  }
  $scope.pgfetchInvData()

  $scope.pgrowActionClicked = function(target, action) {
    console.log(target, action);
    $scope.exploreOrder(target, 'process');
  }

  $scope.exploreOrder = function(idx, typ) {
    if (typ == 'created') {
      var toRet = $scope.invData[idx];
    } else {
      var toRet = $scope.pginvData[idx];
    }
    console.log(toRet);
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.deliveryCenter.online.orders.explore.html',
      size: 'xxl',
      backdrop: true,
      resolve: {
        orderDt: function() {
          return toRet
        }
      },
      controller: 'businessManagement.deliveryCenter.orders.online.explore',
    }).result.then(function() {
    }, function() {
    });
  }


})

app.controller("app.deliveryCenter.orders.offline", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $aside, $filter) {
  console.log('In offline orderss Controller');
  $scope.hover = false;

  $scope.limit = 0
  $scope.invData = []
  $scope.intLength = 0
  $scope.showMore = true
  $scope.fetchInvData = function(){
    $scope.limit += 6
    $http.get('/api/POS/invoice/?status__icontains=Created&offset=0&limit='+$scope.limit).
    then(function(response) {
      console.log('**********************', response.data.results);
      $scope.invData = response.data.results
      if (response.data.results.length == $scope.intLength) {
        $scope.showMore = false
      }else {
        $scope.showMore = true
        $scope.intLength = response.data.results.length
      }
    })
  }
  $scope.fetchInvData()
  $scope.rowActionClicked = function(target, action) {
    console.log(target, action);
    if (action == 'edit') {
      $scope.openInvoiceForm(target, 'created');
    } else {
      $scope.openInvoiceinfoForm(target, 'created');
    }
  }

  $scope.pglimit = 0
  $scope.pginvData = []
  $scope.pgintLength = 0
  $scope.pgshowMore = true
  $scope.pgfetchInvData = function(){
    $scope.pglimit += 2
    $http.get('/api/POS/invoice/?status__icontains=In Progress&offset=0&limit='+$scope.pglimit).
    then(function(response) {
      console.log('**********************', response.data.results);
      $scope.pginvData = response.data.results
      if (response.data.results.length == $scope.pgintLength) {
        $scope.pgshowMore = false
      }else {
        $scope.pgshowMore = true
        $scope.pgintLength = response.data.results.length
      }
    })
  }
  $scope.pgfetchInvData()
  $scope.pgrowActionClicked = function(target, action) {
    console.log(target, action);
    if (action == 'edit') {
      $scope.openInvoiceForm(target, 'process');
    } else {
      $scope.openInvoiceinfoForm(target, 'process');
    }
  }

  $scope.openInvoiceForm = function(idx, typ) {
    if (typ == 'created') {
      var toRet = $scope.invData[idx];
    } else {
      var toRet = $scope.pginvData[idx];
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
      controller: 'businessManagement.deliveryCenter.orders.offline.invoice.form',
    }).result.then(function() {
    }, function() {
    });
  }

  $scope.openInvoiceinfoForm = function(idx, typ) {
    if (typ == 'created') {
      var toRet = $scope.invData[idx];
    } else {
      var toRet = $scope.pginvData[idx];
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
      controller: "businessManagement.deliveryCenter.orders.offline.invoicesinfo.form",
    }).result.then(function() {
    }, function() {
    });
  }

})

app.controller("businessManagement.deliveryCenter.orders.offline.invoicesinfo.form", function($scope, invoice, $http, Flash) {
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

app.controller("businessManagement.deliveryCenter.orders.offline.invoice.form", function($scope, invoice, $http, Flash, $rootScope, $filter) {

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

  $scope.deleteTable = function(index) {

    $scope.form.products.splice(index, 1);
    $scope.productsPks.splice(index, 1)
    $scope.onDelete = true
  };

  $scope.onDelete = false
  $scope.productsPks = []
  for (var i = 0; i < $scope.form.products.length; i++) {
    $scope.productsPks.push($scope.form.products[i].data.pk)

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


app.controller('businessManagement.deliveryCenter.orders.online.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $sce ,$uibModal,orderDt,$uibModalInstance) {
  $scope.orderData = orderDt
  console.log(orderDt);
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
    detail = getCookie("orderInvoicePrinterId");
    if (detail != "") {
      console.log('already there');
      document.cookie = encodeURIComponent("orderInvoicePrinterId") + "=deleted; expires=" + new Date(0).toUTCString()
    }
    setCookie("orderInvoicePrinterId", deviceNo, 365);
  }

  $scope.connectData = {
    deviceID: '123'
  }
  orderInvoicePrinterId = getCookie("orderInvoicePrinterId");
  console.log('devvvvvvvvvvvvvvvvvvvvv', orderInvoicePrinterId);
  if (orderInvoicePrinterId != "") {
    $scope.connectData.deviceID = orderInvoicePrinterId
  }
  $scope.connected = true
  $scope.connectDevice = function() {
    console.log('connect Deviceeeeeeeeeeeeee');
    if ($scope.connectData.deviceID.length == 0) {
      Flash.create('danger', 'Please Enter Device Id')
      return
    }
    console.log($scope.connectData.deviceID);
    createCookieDevice($scope.connectData.deviceID)
    $scope.connected = true

  }

  $scope.disconnectDevice = function() {
    $scope.connected = false
  }

  console.log('KKKKKKKKKKKKKKKK', $scope.orderData);
  $scope.order = $scope.orderData
  $scope.expanded = false;
  // $scope.sts = 'aaa'
  $scope.currency =''
  // $scope.currency = settings_currencySymbol;

  for (var i = 0; i < $scope.orderData.orderQtyMap.length; i++) {
    $scope.orderData.orderQtyMap[i].selected = false;
  }

  $http.get('/api/ERP/appSettings/?app=25&name__iexact=currencySymbol').
  then(function(response) {
    if (response.data[0] != null) {
        $scope.currency =response.data[0].value
      }
    })
    $scope.checkConditions = {splitOrder:false,thirdParty:false,changeStatus:false,posPrinting:false,showGst:true}
    $http.get('/api/ERP/appSettings/?app=25&name__iexact=isStoreGlobal').
    then(function(response) {
      console.log('ratingggggggggggggggggggg', response.data);
      if (response.data[0] != null) {
        if (response.data[0].flag) {
          $scope.checkConditions.showGst = false
        }
      }
    })
    $http.get('/api/ERP/appSettings/?app=25&name__iexact=splitOrderManagement').
    then(function(response) {
      console.log('ratingggggggggggggggggggg', response.data);
      if (response.data[0] != null) {
        if (response.data[0].flag) {
          $scope.checkConditions.splitOrder = true
        }
      }
    })
    $http.get('/api/ERP/appSettings/?app=25&name__iexact=thirdPartyCourier').
    then(function(response) {
      console.log('ratingggggggggggggggggggg', response.data);
      if (response.data[0] != null) {
        if (response.data[0].flag) {
          $scope.checkConditions.thirdParty = true
        }
      }
    })
    $http.get('/api/ERP/appSettings/?app=25&name__iexact=changeOrderStatusManually').
    then(function(response) {
      console.log('ratingggggggggggggggggggg', response.data);
      if (response.data[0] != null) {
        if (response.data[0].flag) {
          $scope.checkConditions.changeStatus = true
        }
      }
    })
    $http.get('/api/ERP/appSettings/?app=25&name__iexact=posPrinting').
    then(function(response) {
      console.log('ratingggggggggggggggggggg', response.data);
      if (response.data[0] != null) {
        if (response.data[0].flag) {
          $scope.checkConditions.posPrinting = true
        }
      }
    })

  $scope.orderItemCancel = function(idx) {
    console.log(idx, $scope.order.orderQtyMap[idx]);
    $http({
      method: 'PATCH',
      url: '  /api/ecommerce/orderQtyMap/' + $scope.order.orderQtyMap[idx].pk + '/',
      data: {
        status: 'cancelled'
      }
    }).
    then((function(idx) {
      return function(response) {
        console.log(response.data);
        $scope.order.orderQtyMap[idx].status = response.data.status
        $scope.order.orderQtyMap[idx].refundAmount = response.data.refundAmount
        $scope.order.orderQtyMap[idx].refundStatus = response.data.refundStatus
        var toSend = {value : response.data.pk};
        $http({method : 'POST' , url : '/api/ecommerce/sendStatus/' , data : toSend}).
        then(function(response) {
        })
        Flash.create('success', 'Item Has Been Cancelled');
        $scope.saveLog(idx, 'This Item Has Been Cancelled')
      }
    })(idx))
  }
  $scope.orderApproved = function(pk, typ) {
    console.log(pk, typ);
    if (typ) {
      var tosend = {
        approved: true,
        status: 'ordered'
      }
      $scope.msg='Order Has Been Approved'
    } else {
      var tosend = {
        approved: false,
        status: 'failed'
      }
      $scope.msg='Order Has Been Rejected'
    }
    $http({
      method: 'PATCH',
      url: '/api/ecommerce/order/' + pk + '/',
      data: tosend
    }).
    then(function(response) {
      console.log(response.data);
      Flash.create('success', 'Saved');
      $scope.order.approved = response.data.approved
      for (var i = 0; i < $scope.order.orderQtyMap.length; i++) {
        $scope.saveLog(i, $scope.msg)
      }
    })
  }
  $scope.openManifestFile=function(){
    window.open('/home/cioc/Desktop/libreERP-main/media_root/ecommerce/manifest/example_shipment_label794650.pdf','_blank');
  }
  $scope.openManifest = function(idx) {
    if (!$scope.checkConditions.thirdParty) {
      console.log('self Manifestttttttttt');
      var td = new Date()
      m = td.getMonth() + 1
      var awbNo = td.getDate().toString()+m.toString()+td.getFullYear().toString().substr(-2)+$scope.order.pk
      console.log(awbNo);
      $http({
        method: 'PATCH',
        url: '  /api/ecommerce/orderQtyMap/' + $scope.order.orderQtyMap[idx].pk + '/',
        data: {
          courierName: 'Self',
          courierAWBNo: awbNo,
          notes: 'Self',
        }
      }).
      then(function(response) {
        console.log(response.data);
        Flash.create('success', 'Saved');
        $scope.order.orderQtyMap[idx] = response.data
      })
    }else {
      $uibModal.open({
        templateUrl: '/static/ngTemplates/app.ecommerce.vendor.orders.manifestForm.html',
        size: 'lg',
        backdrop: true,
        resolve: {
          item: function() {
            return $scope.order.orderQtyMap[idx];
          }
        },
        controller: function($scope, item , $uibModalInstance) {
          $scope.item = item;
          console.log($scope.item);
          $scope.courierForm = {courierName:'',courierAWBNo:'',notes:''}
          if ($scope.item.courierName!=null&&$scope.item.courierName.length>0) {
            $scope.courierForm.courierName = $scope.item.courierName
            $scope.courierForm.courierAWBNo = $scope.item.courierAWBNo
            $scope.courierForm.notes = $scope.item.notes
          }
          $scope.saveManifest = function(){
            if ($scope.courierForm.courierName.length==0||$scope.courierForm.courierAWBNo.length==0||$scope.courierForm.notes.length==0) {
              Flash.create('warning','All Fields Are Required')
              return
            }
            $http({
              method: 'PATCH',
              url: '  /api/ecommerce/orderQtyMap/' + $scope.item.pk + '/',
              data: {
                courierName: $scope.courierForm.courierName,
                courierAWBNo: $scope.courierForm.courierAWBNo,
                notes: $scope.courierForm.notes,
              }
            }).
            then(function(response) {
              console.log(response.data,$scope.item);
              Flash.create('success', 'Saved');
              $uibModalInstance.dismiss(response.data);
            })
          }
        },
      }).result.then(function() {

      }, function(res) {
        console.log('87987987+9797987987979879',res,typeof(res));
        console.log('ssssssssssssss',$scope.order.orderQtyMap[idx]);
        if (typeof(res)!='string') {
          console.log('saveddddddddddddd');
          if ($scope.order.orderQtyMap[idx].courierName != null && $scope.order.orderQtyMap[idx].courierName.length >0) {
            $scope.saveLog(idx, 'Manifest Has Been Updated')
          }else {
            $scope.saveLog(idx, 'Manifest Has Been Created')
          }
          $scope.order.orderQtyMap[idx] = res
        }
      });
    }
  }
  $scope.saveLog = function(idx, msg) {
    console.log(idx, $scope.order.orderQtyMap[idx], msg);
    var tosend = {
      logTxt: msg,
      qMapPk: $scope.order.orderQtyMap[idx].pk
    }
    $http({
      method: 'POST',
      url: '/api/ecommerce/trackingLog/',
      data: tosend
    }).
    then((function(idx) {
      return function(response) {
        console.log(response.data);
        $scope.order.orderQtyMap[idx].logText = ''
        $scope.order.orderQtyMap[idx].trackingLog.push(response.data)
      }
    })(idx))
  }
  $scope.changeStatus = function(idx, sts) {
    $http({
      method: 'PATCH',
      url: '  /api/ecommerce/orderQtyMap/' + $scope.order.orderQtyMap[idx].pk + '/',
      data: {
        status: sts
      }
    }).
    then((function(idx, sts) {
      return function(response) {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        Flash.create('success', 'Status Changed To ' + sts);
        $scope.order.orderQtyMap[idx].status =   response.data.status
        // $scope.saveLog(idx, 'This Item Has ' + sts)
        if (sts=='reachedNearestHub') {
          sts = 'reached To Nearest Hub'
        }else if (sts=='outForDelivery') {
          sts = 'out For Delivery'
        }else if (sts=='returnToOrigin') {
          sts = 'return To Origin'
        }
        $scope.saveLog(idx, 'This Item Has Been ' + sts)
        // var toSend = {value : response.data.pk};
        // $http({method : 'POST' , url : '/api/ecommerce/sendStatus/' , data : toSend}).
        // then(function(response) {
        // })

        console.log(response.data.status,'aaaaahhhhh');
        if (response.data.status=='delivered'){
          console.log("delivered");
          var toSend = {value : response.data.pk};
          $http({method : 'POST' , url : '/api/ecommerce/sendDeliveredStatus/' , data : toSend}).
          then(function(response) {
            console.log(response.data);
          })
        }else{
          console.log("notdelivered");
          var toSend = {value : response.data.pk};
          $http({method : 'POST' , url : '/api/ecommerce/sendStatus/' , data : toSend}).
          then(function(response) {
          })
        }




      }
    })(idx, sts))
  }

  $scope.changeStatusForAll = function(status){
    for (var i = 0; i < $scope.order.orderQtyMap.length; i++) {
      $scope.changeStatus(i,status)
    }
  }
  $scope.generateManifestForAll = function () {
    console.log($scope.order);
    if (!$scope.checkConditions.thirdParty) {
      console.log('self courierrrrrrrrr');
      var td = new Date()
      m = td.getMonth() + 1
      var awbNo = td.getDate().toString()+m.toString()+td.getFullYear().toString().substr(-2)+$scope.order.pk
      console.log(awbNo);
      for (var i = 0; i < $scope.order.orderQtyMap.length; i++) {
        // if ($scope.order.orderQtyMap[i].selected) {
          $http({
            method: 'PATCH',
            url: '  /api/ecommerce/orderQtyMap/' + $scope.order.orderQtyMap[i].pk + '/',
            data: {
              courierName: 'Self',
              courierAWBNo: awbNo,
              notes: 'Self',
            }
          }).then((function(i){
            return function(response){
              $scope.order.orderQtyMap[i].courierName = response.data.courierName
              $scope.order.orderQtyMap[i].courierAWBNo = response.data.courierAWBNo
              console.log(response.data);
              if (i == $scope.order.orderQtyMap.length-1) {
                Flash.create('success', 'Saved');
              }
            }
          })(i))
        // }
      }
    }else {

      $scope.courierForm = {courierName:'',courierAWBNo:'',notes:''}
      $http({
        method:'GET',
        url:'/api/ecommerce/createShipment/?country=US&orderPk='+$scope.order.pk
      }).then(function (response) {
        console.log(response.data);
        $scope.courierForm.courierName = response.data.courierName
        $scope.courierForm.courierAWBNo = response.data.trackingID

        for (var i = 0; i < $scope.order.orderQtyMap.length; i++) {
          // if ($scope.order.orderQtyMap[i].selected) {
            if ($scope.courierForm.courierName.length==0||$scope.courierForm.courierAWBNo.length==0) {
              Flash.create('warning','All Fields Are Required')
              return
            }
            $http({
              method: 'PATCH',
              url: '  /api/ecommerce/orderQtyMap/' + $scope.order.orderQtyMap[i].pk + '/',
              data: {
                courierName: $scope.courierForm.courierName,
                courierAWBNo: $scope.courierForm.courierAWBNo,
                notes: 'AUTO GENERATED',
              }
            }).then((function(i){
              return function(response){
                $scope.order.orderQtyMap[i].courierName = response.data.courierName
                $scope.order.orderQtyMap[i].courierAWBNo = response.data.courierAWBNo
                console.log(response.data);
                if (i == $scope.order.orderQtyMap.length-1) {
                  Flash.create('success', 'Saved');
                }
              }
            })(i))
          // }
        }

      })
    }


  }
  $scope.addNewProduct = function(pk){
    console.log('order pkkkkkkkk',pk);
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.ecommerce.vendor.orders.addNewProduct.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        orderPk: function() {
          return pk;
        }
      },
      controller: function($scope, orderPk , $uibModalInstance) {
        $scope.newForm = {product:'',qty:1}
        $scope.productSearch = function(val) {
          return $http.get('/api/ecommerce/listing/?product__name__icontains=' + val + '&limit=10').
          then(function(response) {
            return response.data.results;
          })
        }
        $scope.saveNewOrder = function(){
          console.log($scope.newForm);
          var np = $scope.newForm
          if (typeof np.product != 'object') {
            Flash.create('warning','Please Select Suggested Product')
            return
          }
          $http({
            method: 'POST',
            url: '  /api/ecommerce/orderQtyMap/',
            data: {
              product: np.product.pk,
              qty: np.qty,
              totalAmount: np.product.product.price,
              prodSku: np.product.product.serialNo,
              discountAmount: 0,
            }
          }).
          then(function(response) {
            console.log(response.data);
            $http({
              method: 'PATCH',
              url: '  /api/ecommerce/order/' + orderPk + '/',
              data: {
                orderQtyMap: response.data.pk,
                addingNewQty: 'Yes',
              }
            }).
            then(function(response) {
              console.log(response.data);
              Flash.create('success', 'Saved');
              $uibModalInstance.dismiss(response.data);
            })
          })

        }
      },
    }).result.then(function() {

    }, function(res) {
      console.log('87987987+9797987987979879',res,typeof(res));
      console.log('ssssssssssssss',$scope.order);
      if (res.pk) {
        console.log('saveddddddddddddd');
        $scope.order = res
      }
    });
  }

});
