app.controller("businessManagement.stockReport", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.stockReport.item.html',
  }, ];


  var multiselectOptions = [{
    icon: 'fa fa-plus',
    text: 'new'
  }];

  $scope.config = {
    views: views,
    url: '/api/support/stockCheckReport/',
    filterSearch: true,
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [6, 12, 18],
    multiselectOptions: multiselectOptions,
    // getParams: [{
    //   key: 'name',
    //   value: true
    // }]
  }


  $scope.tableAction = function(target, action, mode) {
    if (action == 'new') {
      console.log("gggggggggggggggg");
      $scope.createStock()
    }
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        // if (action == 'edit') {
        //   var title = 'Edit Vendor :';
        //   var appType = 'vendorEditor';
        // }
        // else if (action == 'delete') {
        //   $http({
        //     method: 'DELETE',
        //     url: '/api/support/vendor/' + $scope.data.tableData[i].pk + '/'
        //   }).
        //   then(function(response) {
        //     Flash.create('success', 'Item Deleted');
        //   })
        //   $scope.data.tableData.splice(i, 1)
        //   return;
        // }



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

  $scope.createStock = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.stockReport.create.html',
      backdrop:false,
      size: 'lg',
      controller: function($scope, $uibModalInstance) {
        $scope.products = []
        $scope.getAll = function(){
          $http({
            method: 'GET',
            url: '/api/support/stockCheck/'
          }).
          then(function(response) {
            console.log(response.data);
            $scope.count = response.data[0].count
            $scope.data = response.data[0].data
            console.log($scope.data,'aaaaaaaaa');
            if($scope.data.pk!=undefined){
              console.log("heeeeeeeerrrrrrrrrrreeeeeeeeeeee",$scope.data.pk);
              $http({
                method: 'GET',
                url: '/api/support/stockCheckItem/' +$scope.data.pk
              }).
              then(function(response) {
                $scope.products = response.data
                return
              })
            }
            else{
              console.log("thhhhhhhhhhhhhheeeeeeeerrrrrrrrrrrreeeeeeeee");
              $scope.products =[]
              return
            }

          })
        }
        $scope.getAll()

        $scope.productSearch = function(query) {
          return $http.get('/api/support/products/?part_no__contains=' + query).
          then(function(response) {
            return response.data;
          })
        };
        $scope.refresh = function() {
          $scope.form = {
            product: '',
            qty: 1
          }
        }
        $scope.refresh()
        $scope.saveReport = function() {
          $http({
            method: 'POST',
            url: '/api/support/stockCheckReport/',
          }).
          then(function(response) {
            Flash.create('success', 'Saved');
            $scope.getAll()
          })
        }


        $scope.addProduct = function() {
          for (var i = 0; i < $scope.products.length; i++) {
            if ($scope.products[i].product.pk == $scope.form.product.pk) {
              Flash.create('danger', 'Product already added');
              return
            }
          }
          if($scope.form.product==''||typeof $scope.form.product!='object'){
            Flash.create('danger', 'Please Select a product');
            return
          }
          $scope.products.push({
            product: $scope.form.product,
            qty: $scope.form.qty,
          });
          $scope.refresh()
        }

      $scope.saveAll = function(){
        for (var i = 0; i < $scope.products.length; i++) {
          if($scope.products[i].pk){
            var method = 'PATCH'
            var url = '/api/support/stockCheckItem/' + $scope.products[i].pk +'/'
          }
          else{
            var method = 'POST'
            var url = '/api/support/stockCheckItem/'
          }
          var dataToSend = {
            product : $scope.products[i].product.pk,
            qty : $scope.products[i].qty,
            stockReport : $scope.data.pk
          }
          $http({
            method: method,
            url: url,
            data : dataToSend,
          }).
          then(function(response) {
            Flash.create('success', 'Saved');
            $scope.products[i-1] = response.data
          })
        }
      }

      $scope.deleteData=function(idx){
        for (var i = 0; i < $scope.products.length; i++) {
          if(i==idx){
            if($scope.products[i].pk){
              $http({
                method: 'DELETE',
                url: '/api/support/stockCheckItem/' + $scope.products[i].pk + '/'
              }).
              then(function(response) {
                Flash.create('success', 'Deleted');
                $scope.products.splice(idx, 1)
                return
              })
            }
            else{
              $scope.products.splice(idx, 1)
              return
            }
          }
        }
      }
      $scope.close = function() {
        $uibModalInstance.dismiss();
      }
      },
    });
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
