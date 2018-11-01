app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.productsInventory.report', {
      url: "/report",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.productsInventory.report.html',
          controller: 'businessManagement.productsInventory.report',
        }
      }
    })
});
app.controller("businessManagement.productsInventory.report", function($scope, $http, Flash , $uibModal , $rootScope,$state) {

})



app.controller("businessManagement.productsInventory.taxreport", function($scope, $http, Flash , $uibModal , $rootScope,$state) {
$scope.today = new Date();
$scope.form = {
  frm:new Date($scope.today.getFullYear(), $scope.today.getMonth(), 1),
  to :new Date(),
  mode : 'offline',
  typ:''
}


 console.log($scope.form ,'aaaaaaaaaaa');


$scope.getTaxList = function(){
  $scope.form.typ='data'
  $http({
    method: 'GET',
    url: '/api/POS/getTaxList/?mode=' +$scope.form.mode + '&frm=' +$scope.form.frm.toJSON() + '&to=' +$scope.form.to.toJSON() + '&typ=' +$scope.form.typ ,
  }).
  then(function(response) {
    console.log(response.data,'@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    $scope.details = response.data
  })
}


  $scope.$watch('form.frm' , function(newValue , oldValue) {
    $scope.getTaxList()
  })

  $scope.$watch('form.to' , function(newValue , oldValue) {
    $scope.getTaxList()
  })

  $scope.$watch('form.mode' , function(newValue , oldValue) {
    $scope.getTaxList()
  })


  $scope.downloadExcel = function() {
    $scope.form.typ='exceldata'
    window.open('/api/POS/getTaxList/?mode=' +$scope.form.mode + '&frm=' +$scope.form.frm.toJSON() + '&to=' +$scope.form.to.toJSON() + '&typ=' +$scope.form.typ)
  }
});
