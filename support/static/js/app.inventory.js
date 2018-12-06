app.controller("businessManagement.inventory", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {

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
  })
}

})
