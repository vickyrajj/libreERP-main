app.controller("businessManagement.inventory", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {
$scope.offset = 0
$scope.fetchProdInventory = function(offset) {
  $http({
    method: 'GET',
    url: '/api/support/inventoryData/?limit=4&offset='+offset+'&search='+$scope.searchText
  }).
  then(function(response) {
    console.log(response.data,'aaaaaaaaaaa');
    $scope.products = response.data.data
    $scope.total =  response.data.total
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



  $scope.toggle = function(pk, indx) {
  // $scope.prodInventories[indx].open = !$scope.prodInventories[indx].open
  for (var i = 0; i < $scope.products.length; i++) {
    if ($scope.products[i].productPk == pk) {
      $scope.products[i].open = !$scope.products[i].open
    }
  }
}

  $scope.new = function(){
    console.log("aaaaaaaaaaaa");
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

})
