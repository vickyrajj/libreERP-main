
app.config(function($stateProvider){
  $stateProvider.state('businessManagement.warehouse.service', {
    url: "/service",
    templateUrl: '/static/ngTemplates/app.warehouse.service.html',
    controller: 'businessManagement.warehouse.service'
  });
});


// app.controller("businessManagement.warehouse.service", function($scope, $state, $users, $stateParams, $http, Flash, $timeout, $uibModal) {
//
// })



// app.controller('businessManagement.warehouse.service.form' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
//   // settings main page controller
//   $scope.mode = 'new';
//   $scope.form = {number : undefined , ifsc : undefined, bankAddress: undefined, personal : false}
//
//   if ($scope.form.personal== false) {
//     $scope.form.users = [];
//   }else {
//     if ($scope.form.users.length > 1) {
//       $scope.form.users = null;
//     }else {
//       $scope.form.users = $scope.form.users[0];
//
//     }
//   }
//
//   if ($scope.mode == 'new') {
//
//   }
//
//
// });


app.controller('businessManagement.warehouse.service', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$rootScope,Flash) {

  $scope.data = {tableData : []};

  views = [{name : 'list' , icon : 'fa-th-large' ,
      template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
      itemTemplate : '/static/ngTemplates/app.warehouse.service.item.html',
    },
  ];

  $scope.$on('editPromocode', function(event, input) {
    console.log("recieved");
    console.log(input.data);
    $scope.msg = 'Update'
    $scope.form = input.data
    $scope.mode = 'edit'

  });

  $scope.config = {
    views : views,
    url : '/api/clientRelationships/productMeta/',
    searchField: 'number',
    deletable : true,
    itemsNumPerView : [12,24,48],
  }

console.log($scope.data.tableData,'aaaaaaaaaaaaaaaaaaaaaaaaaaaa');

  $scope.tableAction = function(target , action , mode){
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){
          if (action == 'editService') {
            $rootScope.$broadcast('editPromocode', {data:$scope.data.tableData[i]});
          }
        }
      }
  }


  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index){
    $scope.tabs.splice(index , 1)
  }

  $scope.addTab = function( input ){
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      }else{
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

$scope.reset=function(){
  $scope.form = {
    description:'',
    typ:'',
    code:'',
    taxRate:0
  }
}
$scope.reset()
$scope.mode ='new'
$scope.newService = function(){
  $scope.form = {}
  $scope.mode ='new'
}
$scope.saveService = function(){
  console.log($scope.form.description,$scope.form.typ,$scope.form.code,$scope.form.taxRate,'aaaaaaaaaaaa');
  if($scope.form.description==''){
    Flash.create('warning','Add name')
    return;
  }
  if($scope.form.typ==''){
    Flash.create('warning','Select Type')
    return;
  }
  if($scope.form.code==''){
    Flash.create('warning','Add Code')
    return;
  }
  // if($scope.form.taxRate)
  var dataToSend = {
    description: $scope.form.description,
    typ:$scope.form.typ,
    code:$scope.form.code,
    taxRate:$scope.form.taxRate,
    // user: $scope.me.pk
  }
  $http({
    method: 'POST',
    url: '/api/clientRelationships/productMeta/',
    data: dataToSend
  }).
  then(function(response) {
    $scope.form = {}
    $scope.reset()
    Flash.create('success', 'Created');
  })
}

});
