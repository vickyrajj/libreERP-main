// you need to first configure the states for this app

app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.productsInventory', {
      url: "/productsInventory",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',

        },
        "menu@businessManagement.productsInventory": {
           templateUrl: '/static/ngTemplates/genericMenu.html',
           controller : 'controller.generic.menu',
         },
         "@businessManagement.productsInventory": {
           templateUrl: '/static/ngTemplates/app.productsInventory.default.html',
           controller: 'businessManagement.productsInventory.default',
           // controller : 'projectManagement.LMS.default',
         }
      }
    })
});


app.controller("businessManagement.productsInventory.edit", function($scope, $http, Flash , $rootScope) {

  console.log($scope.data);
  $scope.activepk = 0
  $scope.selectedStore=function(store,idx){
    $scope.activepk = store.pk
    $scope.storeindex = idx
    $scope.storeSelected = store
    document.getElementById("updatequantity").focus();
  }

  $scope.save = function(increase) {
    if ($rootScope.multiStores) {
      if ($scope.activepk == 0) {
        Flash.create('warning','Please Select The Store')
        return
      }else {
        if (increase) {
          var final = $scope.data.qty + $scope.storeSelected.quantity;
        }else{
          var final =  $scope.storeSelected.quantity - $scope.data.qty;
        }
        $http({method : 'PATCH' , url : '/api/POS/storeQty/' + $scope.storeSelected.pk + '/' , data : {quantity : final}}).then(function(response) {
          $scope.data.storeQty[$scope.storeindex] = response.data;
          $scope.data.qty = 0;
          Flash.create('success' , 'Saved');
          // $rootScope.$broadcast('closeEditModalWindow' , {})

        })
      }
    }else {
      if (increase) {
        var final = $scope.data.qty + $scope.data.inStock;
      }else{
        var final =  $scope.data.inStock - $scope.data.qty;
      }
      $http({method : 'PATCH' , url : '/api/POS/product/' + $scope.data.pk + '/' , data : { inStock : final , typ : "user" }}).then(function(response) {
        $scope.data.inStock = response.data.inStock;
        $scope.data.qty = 0;
        Flash.create('success' , 'Saved');
        $rootScope.$broadcast('closeEditModalWindow' , {})
        console.log("broadcast : closeEditModalWindow");
        // console.log($scope.$parent);
        // $scope.$parent.$uibModalInstance.dismiss();
      })
    }

  }


});

app.controller("businessManagement.productsInventory.default", function($scope, $http, Flash , $uibModal , $rootScope,$state) {

  // $http({method : 'GET' , url : '/api/POS/product/'})

  $rootScope.multiStores = false
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=multipleStore').
  then(function(response) {
    console.log('ratingggggggggggggggggggg',response.data);
    if(response.data[0]!=null){
      if (response.data[0].flag) {
        $rootScope.multiStores = true
      }
    }
  })

  $scope.refreshDashboard = function(input) {
    console.log(input);
    if (input.action == 'updated' && input.type == 'productsInventory') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == input.pk) {
          $scope.data.tableData[i].inStock = input.inStock;
        }
      }
    }

  }

  console.log();


  $scope.data = {
    tableData: [],
  };

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/tableDefault.html',
    // itemTemplate: '/static/ngTemplates/app.POS.product.item.html',
  }, ];

  var options = {main : {icon : 'fa-info', text: 'Info'} ,
    others : [{icon : '' , text : 'editMaster' },
      ]
    };


  var multiselectOptions = [{icon : 'fa fa-shopping-cart' , text : 'Reorder' },{icon : 'fa fa-file' , text : 'stockReport' },
    {icon : 'fa fa-file' , text : 'reorderingReport' }

  ];

  $scope.config = {
    views: views,
    url: '/api/POS/product/',
    searchField : 'Name or SKU or Description',
    itemsNumPerView: [20, 40, 80],
    fields : ['name' , 'price' , 'serialNo' , 'inStock'],
    options : options,
    filterSearch : true,
    multiSelect : false,
    multiselectOptions : multiselectOptions,
    editorTemplate :  '/static/ngTemplates/app.productsInventory.product.modal.html',
  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);

    if (action == 'reorderingReport') {

      window.open( "/api/POS/reorderingReport/", "_blank")
      // $scope.openProductForm();
    } else if (action == 'stockReport') {
      window.open( "/api/POS/stockReport/", "_blank")
    } else if (action == 'Reorder') {
      $state.go('businessManagement.productsInventory.purchaseOrder')
    }else {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          if (action == 'editMaster') {
            $scope.openProductForm(i);
            console.log('editing');
          } else {
            $scope.openProductInfo(i);
          }
        }
      }
    }



  }


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

  $scope.openProductForm = function(idx) {

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.product.form.html',
      size: 'xl',
      backdrop: true,
      resolve: {
        product: function() {

          console.log($scope.data.tableData[idx]);
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

});
