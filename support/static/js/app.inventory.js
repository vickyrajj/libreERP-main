app.controller("businessManagement.inventory", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {

  $scope.new = function(){
    console.log("aaaaaaaaaaaa");
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.inventory.modal.html',
      size: 'lg',
      controller: function($scope , $uibModalInstance){

    },
  })
}

})
