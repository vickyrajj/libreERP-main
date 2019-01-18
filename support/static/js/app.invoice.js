app.controller("businessManagement.invoice", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {
})
app.controller("businessManagement.invoice.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {
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
})
