// <<<<<<< HEAD
app.config(function($stateProvider) {
  $stateProvider.state('businessManagement.warehouse.custCommodity', {
    url: "/custCommodity",
    templateUrl: '/static/ngTemplates/app.warehouse.custCommodity.html',
    controller: 'businessManagement.warehouse.custCommodity'
  });
});



app.controller("businessManagement.warehouse.custCommodity", function($scope, $state, $users, $stateParams, $http, Flash, ) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.custCommodity.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/warehouse/customercommodity/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'details') {
          var title = 'Contact Details : ';
          var appType = 'contactExplorer';
        } else if (action == 'delete') {
          $http({
            method: 'DELETE',
            url: '/api/warehouse/customercommodity/' + $scope.data.tableData[i].pk + '/'
          }).
          then(function(response) {
            Flash.create('success', 'Item Deleted');
          })
          $scope.data.tableData.splice(i, 1)
          return;
        }
        console.log("sampleee");
        console.log($scope.data.tableData[i]);
        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          // data: {
          //   pk: target,
          //   index: i,
          //   contract : $scope.data.tableData[i]
          // },
          data: $scope.data.tableData[i],
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


  $scope.contactSearch = function(query) {
    return $http.get('/api/warehouse/contact/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };



  $scope.form = {
    contact: [],
    name: '',
    qty: '',
    qty: '',

  }



  $scope.addCustCommodities = function() {
    var dataToSend = {
      contact: $scope.form.contact.pk,
    }
    $http({
      method: 'POST',
      url: '/api/warehouse/customercommodity/',
      data: dataToSend
    }).
    then(function(response) {
      var dataToSend = {
        customercommodity: response.data.pk,
        name: $scope.form.name,
        qty: $scope.form.qty,
        typ: $scope.form.type,
      }
      $http({
        method: 'POST',
        url: '/api/warehouse/commodity/',
        data: dataToSend
      }).
      then(function(response) {
        var dataToSend = {
          commodity: response.data.pk,
          checkIn: response.data.qty,
          balance: response.data.qty
        }
        $http({
          method: 'POST',
          url: '/api/warehouse/commodityQty/',
          data: dataToSend
        }).
        then(function(response) {})
        $scope.form.qty = null;
        $scope.form.name = '';
        $scope.form.type = null;
      })
    })
  }
});
app.controller("businessManagement.warehouse.custCommodity.explore", function($scope, $state, $users, $stateParams, $http, Flash, ) {
  $scope.comodities = []
  $scope.comodityData = []
  $scope.contact = $scope.tab.data;

  $http({
    method: 'GET',
    url: '/api/warehouse/commodity/?customercommodity=' + $scope.contact.pk
  }).
  then(function(response) {
    console.log(response.data);
    $scope.comodities = response.data
  })
  $scope.expand = function(value, indx) {
    $scope.idx = indx
    $http({
      method: 'GET',
      url: '/api/warehouse/commodityQty/?commodity=' + value
    }).
    then(function(response) {
      console.log(response.data);
      $scope.comodityData = response.data
    })
  }
  $scope.ShowHide = function() {
    $scope.idx = -1;
  }
  $scope.commodty = {
    quanty: 0
  }

  $scope.addCommodities = function() {
    var dataToSend = {
      customercommodity: $scope.contact.pk,
      name: $scope.form.name,
      qty: $scope.form.qty,
      typ: $scope.form.type,
    }
    $http({
      method: 'POST',
      url: '/api/warehouse/commodity/',
      data: dataToSend
    }).
    then(function(response) {
      $scope.comodities.push(response.data)
      var dataToSend = {
        commodity: response.data.pk,
        checkIn: response.data.qty,
        balance: response.data.qty
      }
      $http({
        method: 'POST',
        url: '/api/warehouse/commodityQty/',
        data: dataToSend
      }).
      then(function(response) {
        $scope.comodityData.push(response.data)
        $scope.commodty.quanty = 0;
      })
      $scope.form.qty = null;
      $scope.form.name = '';
      $scope.form.type = null;
    })
  }
  $scope.checkIn = function(value, qty, idx) {
    console.log(value, qty, idx);
    for (var i = 0; i < $scope.comodities.length; i++) {
      if ($scope.comodities[i].pk == value) {
        $scope.comodities[i].qty = $scope.comodities[i].qty + $scope.commodty.quanty
        var dataToSend = {
          qty: $scope.comodities[i].qty
        }
        $http({
          method: 'PATCH',
          url: '/api/warehouse/commodity/' + $scope.comodities[i].pk + '/',
          data: dataToSend
        }).
        then(function(response) {
          // $scope.comodities.push(response.data)
          var dataToSend = {
            commodity: value,
            checkIn: $scope.commodty.quanty,
            balance: response.data.qty
          }
          $http({
            method: 'POST',
            url: '/api/warehouse/commodityQty/',
            data: dataToSend
          }).
          then(function(response) {
            $scope.comodityData.push(response.data)
            $scope.commodty.quanty = 0;
          })
        })
      }
    }
  }
  $scope.checkOut = function(value, qty, idx) {

    console.log(value);
    for (var i = 0; i < $scope.comodities.length; i++) {
      if ($scope.comodities[i].pk == value) {
        $scope.comodities[i].qty = $scope.comodities[i].qty - $scope.commodty.quanty
        var dataToSend = {
          qty: $scope.comodities[i].qty
        }
        $http({
          method: 'PATCH',
          url: '/api/warehouse/commodity/' + $scope.comodities[i].pk + '/',
          data: dataToSend
        }).
        then(function(response) {
          // $scope.comodities.push(response.data)
          var dataToSend = {
            commodity: value,
            checkOut: $scope.commodty.quanty,
            balance: response.data.qty
          }
          $http({
            method: 'POST',
            url: '/api/warehouse/commodityQty/',
            data: dataToSend
          }).
          then(function(response) {
            $scope.comodityData.push(response.data)
            $scope.commodty.quanty = 0;
          })
        })
      }

    }
  }
  $scope.close = function() {
    $uibModalInstance.dismiss('cancel');
  }
  $scope.downloadItems = function() {
    console.log($scope.contract);
    window.open('/api/warehouse/downloadExcelReponse/?contactData=' + $scope.contact.pk)
  }
  var date = new Date();
  $scope.form = {
    from: new Date(date.getFullYear(), date.getMonth(), 1),
    to: new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }
  $scope.downloadIn = function(comm) {
    window.open('/api/warehouse/downloadReceipt/?commodity=' + comm + '&fromDate=' + $scope.form.from.toJSON() + '&to=' + $scope.form.to.toJSON())
  }

  $scope.delete = function(value, indx) {
    $http({
      method: 'DELETE',
      url: '/api/warehouse/commodity/' + value + '/',
    }).
    then(function(response) {
      $scope.comodities.splice(indx, 1)
    })
  }
});
