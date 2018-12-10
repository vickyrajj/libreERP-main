app.controller("businessManagement.inventory", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {
$scope.offset = 0
$scope.fetchProdInventory = function(offset) {
  $http({
    method: 'GET',
    url: '/api/support/inventoryData/?limit=4&offset='+offset+'&search='+$scope.searchText
  }).
  then(function(response) {
    $scope.products = response.data.data
    $scope.total =  response.data.total
    // if()
  })
}
$scope.fetchProdInventory($scope.offset)

$scope.enterFun = function() {
  $scope.fetchProdInventory($scope.offset)
}

$scope.refresh = function () {
  $scope.fetchProdInventory($scope.offset)
}

$scope.next = function() {
  $scope.offset = $scope.offset + 4
  $scope.fetchProdInventory($scope.offset)
  if ($scope.products.length==0) {
    $scope.offset = $scope.offset - 4
    $scope.fetchProdInventory($scope.offset)
  }
}

$scope.prev = function() {
  if ($scope.offset == 0) {
    return
  }
  $scope.offset = $scope.offset - 4
  console.log('calling from prev');
  $scope.fetchProdInventory($scope.offset)
}

$scope.reset = function(){
  $rootScope.cart = []
}
$scope.reset()
$scope.addToCart=function(product){
  console.log(product,'aaaaaaaaaaaaaa');
  $rootScope.cart.push(product)
  console.log($rootScope.cart.length);
}



// $scope.getList = function(){
//   if($rootScope.cart.length>0){
//     for (var i = 0; i < $rootScope.cart.length; i++) {
//       return $http.get('/api/support/products/?part_no__contains=' + query).
//       then(function(response) {
//         return response.data;
//       }
//     }
//   }
// }
  $scope.toggle = function(pk, indx) {
  // $scope.prodInventories[indx].open = !$scope.prodInventories[indx].open
  for (var i = 0; i < $scope.products.length; i++) {
    if ($scope.products[i].productPk == pk) {
      $scope.products[i].open = !$scope.products[i].open
    }
  }
}

  $scope.new = function(){
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.inventory.modal.html',
      size: 'lg',
      controller: function($scope , $uibModalInstance){
        $scope.productSearch = function(query) {
          return $http.get('/api/support/products/?part_no__contains=' + query).
          then(function(response) {
            return response.data;
          })
        };
        $scope.reset=function(){
          $scope.form = {
            product:'',
            qty : 1,
            rate : 0,
          }
        }
        $scope.reset()
        $scope.saveProduct =  function(){
          var dataToSend = {
            product : $scope.form.product.pk,
            qty : $scope.form.qty,
            rate : $scope.form.rate
          }
          $http({
            method: 'POST',
            url: '/api/support/inventory/',
            data: dataToSend,
          }).
          then(function(response) {
            Flash.create('success', 'Saved');
            $scope.reset()
          });

        }
    },
  }).result.then(function() {}, function() {
      $scope.fetchProdInventory($scope.offset)
    });
}

$scope.getList = function(){
  console.log($rootScope.cart);
  $uibModal.open({
    templateUrl: '/static/ngTemplates/app.inventory.cart.modal.html',
    size: 'lg',
    resolve:{
      cartData: function() {
        return $rootScope.cart;
      }
    },
    controller: function($scope , $uibModalInstance,cartData){
      $scope.projectSearch = function(query) {
        return $http.get('/api/support/projects/?title__contains=' + query).
        then(function(response) {
          return response.data;
        })
      };

      $scope.userSearch = function(query) {
        return $http.get('/api/HR/userSearch/?first_name__contains=' + query).
        then(function(response) {
          return response.data;
        })
      };
      console.log(cartData,'aaaaaaaaaaa');
      $scope.cartData = cartData
      $scope.productsOrdered = []
      for (var i = 0; i < $scope.cartData.length; i++) {
        $http({
          method: 'GET',
          url: '/api/support/products/' + $scope.cartData[i]
        }).
          then(function(response) {
            $scope.productsOrdered.push(response.data);
          })
      }



      $scope.form = {}
      $scope.save = function(){
        console.log($scope.form.responsible,'kkkkkkkkkkkkkkkkk');
        if($scope.form.responsible==undefined){
            Flash.create('warning', 'Select Responsible person');
            return
        }
        if($scope.form.project==undefined){
            Flash.create('warning', 'Select Project');
            return
        }
        console.log( $scope.productsOrdered);
        var dataToSend = {
          products : $scope.productsOrdered,
          user : $scope.form.responsible.pk,
          project : $scope.form.project.pk,
        }
        $http({
          method: 'POST',
          url: '/api/support/order/',
          data : dataToSend
        }).
        then(function(response) {
          console.log(response.data,'kkkkkkkkk');
          $scope.values = response.data
        })
      }
      // $uibModalInstance.dismiss($scope.values)
  },
}).result.then(function() {}, function(values) {
    $scope.fetchProdInventory($scope.offset)
    // $scope.valueList = values
  });
}
// console.log($scope.valueList,'aaaaaaaaaaaahhhhhhhhhhhhhhhhhhhaaaaaaaaaa');

})
