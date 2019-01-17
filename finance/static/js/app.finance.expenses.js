app.controller('businessManagement.finance.expenses', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  // settings main page controller

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.finance.inboundInvoices.item.html',
  }, ];

  var options = {
    main: {
      icon: 'fa-pencil',
      text: 'edit'
    },
  };

  $scope.config = {
    views: views,
    url: '/api/finance/purchaseorder/',
    searchField: 'name',
    getParams : [{key : 'isInvoice' , value : false}],
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

  // $scope.tableAction = function(target , action , mode){
  //   for (var i = 0; i < $scope.data.tableData.length; i++) {
  //     if ($scope.data.tableData[i].pk == parseInt(target)) {
  //       if (action == 'details') {
  //         var title = 'Details :';
  //         var appType = 'PO Details';
  //       } else if (action == 'edit') {
  //         var title = 'edit :';
  //         var appType = 'PO Edit';
  //       }
  //       $scope.addTab({
  //         title: title + $scope.data.tableData[i].name,
  //         cancel: true,
  //         app: appType,
  //         data: {
  //           pk: target,
  //           index: i
  //         },
  //         active: true
  //       })
  //     }
  //   }
  // }




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
      phone : '',
      email : '',
      pincode : 0,
      poNumber : '',
      quoteNumber : '',
      quoteDate:'',
      terms : '',
      project : '',
      // costcenter : '',
      bussinessunit : '',
    }
  }
  $scope.mode = 'new';
  $scope.getAllData = function(){
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

  $scope.refresh = function(){
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

  $scope.save = function() {
    // .toJSON().split('T')[0])
    console.log($scope.form.deliveryDate, typeof $scope.form.deliveryDate);
    if(typeof $scope.form.deliveryDate == 'object'){
      $scope.form.deliveryDate = $scope.form.deliveryDate.toJSON().split('T')[0]
    }
    else{
      $scope.form.deliveryDate = $scope.form.deliveryDate
    }
    if(typeof $scope.form.quoteDate == 'object'){
      $scope.form.quoteDate = $scope.form.quoteDate.toJSON().split('T')[0]
    }
    else{
      $scope.form.quoteDate = $scope.form.quoteDate
    }



    if ($scope.mode == 'new') {
      if($scope.form.name==''||$scope.form.address==''){
        Flash.create('danger','Fill the Details')
        return
      }
      var dataToSend = {
        name:$scope.form.name,
        personName : $scope.form.personName,
        address : $scope.form.address,
        phone : $scope.form.phone,
        email : $scope.form.email,
        pincode : $scope.form.pincode,
        deliveryDate : $scope.form.deliveryDate,
        poNumber : $scope.form.poNumber,
        quoteNumber : $scope.form.quoteNumber,
        quoteDate :  $scope.form.quoteDate,
        terms :  $scope.form.terms,
      }

      if($scope.form.project!=undefined){
          dataToSend.project = $scope.form.project.pk
        if($scope.form.project.costCenter!=undefined||$scope.form.project.costCenter!=null){
          console.log($scope.form.project.costCenter);
          $scope.form.costCenter = $scope.form.project.costCenter
          dataToSend.costcenter = $scope.form.costCenter.pk
          if($scope.form.costCenter.unit!=undefined){
            $scope.form.bussinessunit = $scope.form.costCenter.unit
            dataToSend.bussinessunit = $scope.form.bussinessunit.pk
          }
        }
      }
      if($scope.form.costcenter!=undefined||$scope.form.costcenter!=null){
        dataToSend.costcenter = $scope.form.costcenter.pk
        if($scope.form.costcenter.unit!=undefined||$scope.form.costcenter.unit!=null){
          $scope.form.bussinessunit = $scope.form.costcenter.unit
          dataToSend.bussinessunit = $scope.form.bussinessunit.pk
        }
      }

      if($scope.form.bussinessunit!=undefined||$scope.form.bussinessunit!=null){
        dataToSend.bussinessunit = $scope.form.bussinessunit.pk
      }
      console.log(dataToSend,'aaaaaaaaa');
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
            then(function(response) {})
          }
        }
        $scope.resetForm()
        $scope.products = []
        $scope.options = false
      }, function(response) {
        Flash.create('danger', response.status + ' : ' + response.statusText);
      })
    }
    else{
      var dataToSend = {
        name:$scope.form.name,
        personName : $scope.form.personName,
        address : $scope.form.address,
        phone : $scope.form.phone,
        email : $scope.form.email,
        pincode : $scope.form.pincode,
        deliveryDate : $scope.form.deliveryDate,
        poNumber : $scope.form.poNumber,
        quoteNumber : $scope.form.quoteNumber,
        quoteDate :  $scope.form.quoteDate,
        terms :  $scope.form.terms,
    }
    if($scope.form.project!=undefined){
        dataToSend.project = $scope.form.project.pk
      if($scope.form.project.costCenter!=undefined||$scope.form.project.costCenter!=null){
        console.log($scope.form.project.costCenter);
        $scope.form.costCenter = $scope.form.project.costCenter
        dataToSend.costcenter = $scope.form.costCenter.pk
        if($scope.form.costCenter.unit!=undefined){
          $scope.form.bussinessunit = $scope.form.costCenter.unit
          dataToSend.bussinessunit = $scope.form.bussinessunit.pk
        }
      }
    }
    if($scope.form.costcenter!=undefined||$scope.form.costcenter!=null){
      dataToSend.costcenter = $scope.form.costCenter.pk
      if($scope.form.costcenter.unit!=undefined||$scope.form.costcenter.unit!=null){
        $scope.form.bussinessunit = $scope.form.costcenter.unit
        dataToSend.bussinessunit = $scope.form.bussinessunit.pk
      }
    }

    if($scope.form.bussinessunit!=undefined||$scope.form.bussinessunit!=null){
      dataToSend.bussinessunit = $scope.form.bussinessunit.pk
    }

      $http({
        method: 'PATCH',
        url: '/api/finance/purchaseorder/' + $scope.form.pk +'/',
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
            if($scope.products[i].pk){
              method = 'PATCH',
              url = '/api/finance/purchaseorderqty/' + $scope.products[i].pk +'/'
            }
            else{
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

$scope.deleteData = function(pkVal,idx){
  console.log(pkVal,idx);
  if(pkVal==undefined){
      $scope.products.splice(idx, 1)
      return
  }
  else{
    $http({
      method: 'DELETE',
      url: '/api/finance/purchaseorderqty/' + pkVal + '/'
    }).
    then(function(response) {
      $scope.products.splice(idx, 1)
      return
    })
  }
  }



})
app.controller('businessManagement.finance.purchaseOrder.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  $scope.data = $scope.data.tableData[$scope.tab.data.index]
  $scope.getAllData = function(){
    $http({
      method: 'GET',
      url: '/api/finance/purchaseorderqty/?purchaseorder=' + $scope.data.pk,
    }).
    then(function(response) {
      $scope.products = response.data
    })
  }


$scope.getAllData()

$scope.sendForApproval=function(){
  dataToSend = {
    status:'Sent'
  }
  $http({
    method: 'PATCH',
    url: '/api/finance/purchaseorder/' + $scope.data.pk +'/',
    data: dataToSend
  }).then(function(response) {
     $scope.data = response.data
    })

}
$scope.approve=function(){
  dataToSend = {
    status:'Approved'
  }
  $http({
    method: 'PATCH',
    url: '/api/finance/purchaseorder/' + $scope.data.pk +'/',
    data: dataToSend
  }).then(function(response) {
     $scope.data = response.data
    })
}
$scope.reject=function(){
  dataToSend = {
    status:'created'
  }
  $http({
    method: 'PATCH',
    url: '/api/finance/purchaseorder/' + $scope.data.pk +'/',
    data: dataToSend
  }).then(function(response) {
     $scope.data = response.data
    })

}


})

app.controller('businessManagement.finance.inboundInvoices.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.resetForm = function() {
    $scope.form = {
      name: '',
      address: '',
      personName: '',
      phone : '',
      email : '',
      pincode : 0,
      poNumber : '',
      quoteNumber : '',
      quoteDate:'',
      terms : '',
      project : '',
      // costcenter : '',
      bussinessunit : '',
      poNumber:'',
      products:[]
    }
  }

  $scope.resetForm()
  $scope.projectSearch = function(query) {
      return $http.get('/api/projects/project/?title__contains=' + query).
      then(function(response) {
        return response.data;
      })
  };

  $scope.addTableRow = function(indx) {
    $scope.form.products.push({
      product: '',
      price: 0,
      qty: 0,
      productMeta:'',
      tax:'',
      total:0
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
      return $http.get('/api/finance/purchaseorder/?poNumber__contains=' + query).
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


  $scope.$watch('form.poNumber', function(newValue, oldValue) {
    console.log(newValue,'aaaaaaaaaa');
    if (newValue != undefined || newValue != null) {
      console.log(newValue);
      $scope.form.pk = newValue.pk
      $scope.form.name = newValue.name
      $scope.form.address = newValue.address
      $scope.form.personName = newValue.personName
      $scope.form.phone = newValue.phone
      $scope.form.email = newValue.email
      $scope.form.pincode = newValue.pincode
      $scope.form.status = newValue.status
      $scope.form.quoteNumber = newValue.quoteNumber
      $scope.form.quoteDate = newValue.quoteDate
      $scope.form.deliveryDate = newValue.deliveryDate
      $scope.form.terms = newValue.terms
      $scope.form.costcenter = newValue.costcenter
      $scope.form.bussinessunit = newValue.bussinessunit
      $scope.form.project = newValue.project
      $scope.form.isInvoice = newValue.isInvoice
      if($scope.form.pk){
        $http({
          method: 'GET',
          url: '/api/finance/purchaseorderqty/?purchaseorder=' + $scope.form.pk,
        }).
        then(function(response) {
          $scope.form.products = response.data
        })
      }
      else{
          $scope.form.products =[]
      }
    }
  })

  $scope.$watch('form.products', function(newValue, oldValue) {
  console.log(newValue);
  for (var i = 0; i < newValue.length; i++) {
    if(newValue[i].productMeta){
      $scope.form.products[i].productMeta = newValue[i].productMeta
      $scope.form.products[i].tax = newValue[i].productMeta.taxRate
      $scope.form.products[i].total = ((newValue[i].qty*newValue[i].price) * newValue[i].productMeta.taxRate/ (100+newValue[i].productMeta.taxRate)).toFixed(2)
    }
  }
  },true)

  $scope.saveInvoice = function(){
    if($scope.form.pk){
      console.log('heeeeeerrrrrrrreeeeeeeeeeeeeee');
    }else{
      console.log('thhhhhhhhhhhhttttttttttttteeeeerrrrrreeeeeee');
    }
  }




})
