app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.deliveryCenter.online', {
      url: "/online",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.deliveryCenter.online.html',
          controller: 'businessManagement.deliveryCenter.online',
        }
      }
    })
});


app.controller('businessManagement.deliveryCenter.online', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $sce) {

  $scope.data = {
    processData: [],
    completedData: [],
  }

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.deliveryCenter.online.orders.item.html',
  }, ];

  $scope.processconfig = {
    views: views,
    url: '/api/ecommerce/order/',
    searchField: 'status',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
    getParams:[{key : 'status!' , value : 'completed'}]
  }
  $scope.completedconfig = {
    views: views,
    url: '/api/ecommerce/order/',
    searchField: 'id',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
    getParams:[{key : 'status' , value : 'completed'}]
  }

  $scope.processTableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.processData);

    for (var i = 0; i < $scope.data.processData.length; i++) {
      if ($scope.data.processData[i].pk == parseInt(target)) {
        if (action == 'info') {
          var title = 'Order Details : ';
          var appType = 'orderInfo';
        }

        $scope.addTab({
          title: title + $scope.data.processData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            order: $scope.data.processData[i]
          },
          active: true
        })
      }
    }

  }

  $scope.completedTableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.completedData);

    for (var i = 0; i < $scope.data.completedData.length; i++) {
      if ($scope.data.completedData[i].pk == parseInt(target)) {
        if (action == 'info') {
          var title = 'Order Details : ';
          var appType = 'orderInfo';
        }

        $scope.addTab({
          title: title + $scope.data.completedData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            order: $scope.data.completedData[i]
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

});

app.controller('businessManagement.deliveryCenter.orders.item', function($scope, $http, $aside, $state, Flash, $users, $filter) {
  $scope.currency = ""
  $http.get('/api/ERP/appSettings/?name__iexact=currencySymbol').
  then(function(response) {
    if (response.data[0] != null) {
        $scope.currency =response.data[0].value
      }
    })

})


app.controller('businessManagement.deliveryCenter.orders.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $sce ,$uibModal) {
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

  console.log('KKKKKKKKKKKKKKKK', $scope.tab.data.order);
  $scope.order = $scope.tab.data.order
  $scope.expanded = false;
  // $scope.sts = 'aaa'
  $scope.currency =''
  // $scope.currency = settings_currencySymbol;

  for (var i = 0; i < $scope.tab.data.order.orderQtyMap.length; i++) {
    $scope.tab.data.order.orderQtyMap[i].selected = false;
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
