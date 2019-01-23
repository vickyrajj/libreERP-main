app.controller("businessManagement.invoice", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.invoice.item.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/support/invoice/',
    filterSearch: true,
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [6, 12, 18],
    // getParams: [{
    //   key: 'name',
    //   value: true
    // }]
  }


  $scope.tableAction = function(target, action, mode) {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Invoice : ';
          var appType = 'invoiceEditor';
        }
        else if (action == 'explore') {
          var title = 'Explore Invoice : ';
          var appType = 'invoiceExplore';
        }
        else if (action == 'delete') {
          $http({
            method: 'DELETE',
            url: '/api/support/invoice/' + $scope.data.tableData[i].pk + '/'
          }).
          then(function(response) {
            Flash.create('success', 'Item Deleted');
          })
          $scope.data.tableData.splice(i, 1)
          return;
        }



        $scope.addTab({
          title: title + $scope.data.tableData[i].invoiceNumber,
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
app.controller("businessManagement.invoice.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {
$scope.products = []
  $scope.fetchData = function() {

    $http({
      method: 'GET',
      url: '/api/support/invoiceQty/?invoice=' + $scope.form.pk
    }).
    then(function(response) {
      $scope.products = response.data
    })

  }

  if (typeof $scope.tab == 'undefined') {
    $scope.form = {}
  } else {
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
    $scope.fetchData()
  }


  $scope.$watch('form.isDetails', function(newValue, oldValue) {
    if(newValue==true){
      $scope.form.shipName = $scope.form.billName
      $scope.form.shipAddress = $scope.form.billAddress
      $scope.form.shipGst = $scope.form.billGst
      $scope.form.shipState = $scope.form.billState
      $scope.form.shipCode = $scope.form.billCode
    }
    else{
      $scope.form.shipName =''
      $scope.form.shipAddress = ''
      $scope.form.shipGst = ''
      $scope.form.shipState = ''
      $scope.form.shipCode =''
    }
  })
  $scope.products = []
  $scope.addTableRow = function(indx) {
    if ($scope.products.length > 0) {
      var obj = $scope.products[$scope.products.length - 1]
      if (obj.part_no.length == 0) {
        Flash.create('danger', 'Please Fill Previous Row Data')
        return
      }
    }
    $scope.products.push({
      part_no: '',
      description_1: '',
      qty:0,
      customs_no:'',
      price: 0,
      taxableprice:0,
      cgst : 0,
      cgstVal:0,
      sgst:0,
      sgstVal:0,
      igst:0,
      igstVal:0,
      total:0
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
        url: '/api/support/invoiceQty/' + pkVal + '/'
      }).
      then(function(response) {
        $scope.products.splice(idx, 1)
        return
      })
    }
  }
  $scope.close=function(){
    $uibModalInstance.dismiss();
  }

  $scope.saveInvoice=function(){

    if($scope.form.project){
      $scope.form.project = $scope.form.project.pk
    }


    if(!$scope.form.pk){
      var method = 'POST'
      var url = '/api/support/invoice/'
    }
    else{
        var method = 'PATCH'
        var url = '/api/support/invoice/' + $scope.form.pk +'/'

    }
    if (typeof $scope.form.invoiceDate == 'object') {
        $scope.form.invoiceDate = $scope.form.invoiceDate.toJSON().split('T')[0]
    }
    else{
        $scope.form.invoiceDate = $scope.form.invoiceDate
    }
    $http({
      method: method,
      url: url,
      data: $scope.form,
    }).
    then(function(response) {
      console.log(response.data);
      $scope.form= response.data
      Flash.create('success', 'Saved');
      for (var i = 0; i < $scope.products.length; i++) {
        if(!$scope.products[i].product){
          var sendVal = {
            product : $scope.products[i].pk,
            invoice : response.data.pk,
            part_no : $scope.products[i].part_no,
            description_1 : $scope.products[i].description_1,
            customs_no : $scope.products[i].customs_no,
            price : $scope.products[i].price,
            qty : $scope.products[i].qty,
            taxableprice : $scope.products[i].taxableprice,
            cgst : $scope.products[i].cgst,
            cgstVal : $scope.products[i].cgstVal,
            sgst : $scope.products[i].sgst,
            sgstVal : $scope.products[i].sgstVal,
            igst : $scope.products[i].igst,
            igstVal : $scope.products[i].igstVal,
            total : $scope.products[i].total,
          }
          var url = '/api/support/invoiceQty/'
          var method = 'POST'
        }
        else{
          var sendVal = {
            product : $scope.products[i].product.pk,
            invoice : response.data.pk,
            part_no : $scope.products[i].part_no,
            description_1 : $scope.products[i].description_1,
            customs_no : $scope.products[i].customs_no,
            price : $scope.products[i].price,
            qty : $scope.products[i].qty,
            taxableprice : $scope.products[i].taxableprice,
            cgst : $scope.products[i].cgst,
            cgstVal : $scope.products[i].cgstVal,
            sgst : $scope.products[i].sgst,
            sgstVal : $scope.products[i].sgstVal,
            igst : $scope.products[i].igst,
            igstVal : $scope.products[i].igstVal,
            total : $scope.products[i].total,
          }
          var url = '/api/support/invoiceQty/' + $scope.products[i].pk + '/'
          var method = 'PATCH'
        }
        $http({
          method: method,
          url: url,
          data: sendVal,
        }).
        then(function(response) {
        })
      }

    })
  }

  $scope.productSearch = function(query) {
    return $http.get('/api/support/products/?limit=10&part_no__contains=' + query).
    then(function(response) {
      return response.data.results;
    })
  };

  var gstData = '29AABCB6326Q1Z6'
$scope.$watch('form.billGst', function(newValue, oldValue) {
  if (newValue!=undefined){
    $scope.gstcode = gstData.substring(0, 2)
    $scope.gstCal = newValue.substring(0, 2)
  }
})




$scope.$watch('products', function(newValue, oldValue) {
  for (var i = 0; i < newValue.length; i++) {
    // console.log(typeof newValue[i],'hhhhhhhhhhhh');
    if(typeof newValue[i].part_no=='object'){
      delete newValue[i].part_no.pk
      $scope.products[i] = newValue[i].part_no
      $scope.products[i].qty = 1
      $scope.products[i].taxableprice = parseFloat(newValue[i].part_no.price*$scope.products[i].qty)
      if($scope.gstcode === $scope.gstCal){
        $scope.products[i].cgst = 9
        $scope.products[i].cgstVal = parseFloat((($scope.products[i].cgst*$scope.products[i].taxableprice)/100).toFixed(2))
        $scope.products[i].sgst = 9
        $scope.products[i].sgstVal = parseFloat((($scope.products[i].sgst*$scope.products[i].taxableprice)/100).toFixed(2))
        $scope.products[i].igst = 0
        $scope.products[i].igstVal = 0
      }
      else{
        $scope.products[i].cgst = 0
        $scope.products[i].cgstVal = 0
        $scope.products[i].sgst = 0
        $scope.products[i].sgstVal = 0
        $scope.products[i].igst = 18
        $scope.products[i].igstVal = parseFloat((($scope.products[i].igst*$scope.products[i].taxableprice)/100).toFixed(2))
      }
      $scope.products[i].total=parseFloat(($scope.products[i].taxableprice+$scope.products[i].cgstVal+$scope.products[i].sgstVal+$scope.products[i].igstVal).toFixed(2))
    }
    else{
      $scope.products[i].price = parseFloat(newValue[i].price)
      $scope.products[i].taxableprice = parseFloat(newValue[i].price*newValue[i].qty)
      $scope.products[i].cgst = newValue[i].cgst
      $scope.products[i].cgstVal = parseFloat((($scope.products[i].cgst*$scope.products[i].taxableprice)/100).toFixed(2))
      $scope.products[i].sgst = newValue[i].sgst
      $scope.products[i].sgstVal = parseFloat((($scope.products[i].sgst*$scope.products[i].taxableprice)/100).toFixed(2))
      $scope.products[i].igst = newValue[i].igst
      $scope.products[i].igstVal = parseFloat((($scope.products[i].igst*$scope.products[i].taxableprice)/100).toFixed(2))
      $scope.products[i].total =parseFloat(($scope.products[i].taxableprice+$scope.products[i].cgstVal+$scope.products[i].sgstVal+$scope.products[i].igstVal).toFixed(2))
    }
  }

},true)

})
app.controller("businessManagement.invoice.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {
    $scope.data = $scope.data.tableData[$scope.tab.data.index]
    console.log($scope.data,'aaaaaaa');
})
