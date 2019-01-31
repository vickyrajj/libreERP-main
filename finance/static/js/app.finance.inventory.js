app.controller('businessManagement.finance.inventory' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions,$uibModal){
  // settings main page controller

  // $scope.data = {tableData : []};
  //
  // views = [{name : 'list' , icon : 'fa-th-large' ,
  //     template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
  //     itemTemplate : '/static/ngTemplates/app.finance.outflow.item.html',
  //   },
  // ];
  //
  // var options = {
  //   main : {icon : 'fa-pencil', text: 'edit'} ,
  //   };
  //
  // $scope.config = {
  //   views : views,
  //   url : '/api/finance/costCenter/',
  //   searchField: 'name',
  //   deletable : true,
  //   itemsNumPerView : [12,24,48],
  // }
  //
  //
  // $scope.tableAction = function(target , action , mode){
  //   console.log(target , action , mode);
  //   console.log($scope.data.tableData);
  //
  //   if (action == 'costCenterBrowser') {
  //     for (var i = 0; i < $scope.data.tableData.length; i++) {
  //       if ($scope.data.tableData[i].pk == parseInt(target)){
  //         $scope.addTab({title : 'Browse Cost Center : ' + $scope.data.tableData[i].pk , cancel : true , app : 'costCenterBrowser' , data : {pk : target, index : i} , active : true})
  //       }
  //     }
  //   }
  //
  // }
  //
  // $scope.tabs = [];
  // $scope.searchTabActive = true;
  //
  // $scope.closeTab = function(index){
  //   $scope.tabs.splice(index , 1)
  // }
  //
  // $scope.addTab = function( input ){
  //     console.log(JSON.stringify(input));
  //   $scope.searchTabActive = false;
  //   alreadyOpen = false;
  //   for (var i = 0; i < $scope.tabs.length; i++) {
  //     if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
  //       $scope.tabs[i].active = true;
  //       alreadyOpen = true;
  //     }else{
  //       $scope.tabs[i].active = false;
  //     }
  //   }
  //   if (!alreadyOpen) {
  //     $scope.tabs.push(input)
  //   }
  // }
  $scope.getAll=function(){
    $http({
      method: 'GET',
      url: '/api/finance/inventory/'
    }).
    then(function(response) {
      $scope.inventoryData = response.data
    })
  }
  $scope.getAll()

  $scope.deleteData=function(pkVal,indx){
    $http({
      method: 'DELETE',
      url: '/api/finance/inventory/'+ pkVal
    }).
    then(function(response) {
      $scope.inventoryData.splice(indx,1)
    })

  }

  $scope.toggle = function(pk, indx) {
    for (var i = 0; i < $scope.inventoryData.length; i++) {
      if ($scope.inventoryData[i].pk == pk) {
        // console.log("here",$scope.inventoryData[i].open,$scope.inventoryData[i].open);
        // $scope.inventoryData[i].open = !$scope.inventoryData[i].open
        // console.log($scope.inventoryData[i].open);
        $scope.inventoryData[i].open = true
      }
      else{
          $scope.inventoryData[i].open = false
      }
    }
  }
  $scope.addInventory = function(){
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.finance.inventoryProduct.modal.html',
      size: 'lg',
      backdrop: false,
      // resolve: {
      //   data: function() {
      //     return $scope.data;
      //   }
      // },


      controller: function($scope ,$uibModalInstance,$rootScope){
        $scope.close = function() {
            $uibModalInstance.close();
        }
        $scope.refresh=function(){
          $scope.form={
            value: 0,
            rate: '',
            name: '',
            refurnished: 0
          }
        }

        $scope.refresh()

        $scope.saveInventory=function(){
          if($scope.form.name==undefined||$scope.form.name==''){
            Flash.create("warning",'Add name')
            return
          }
          if($scope.form.value==undefined||$scope.form.value==''){
            Flash.create("warning",'Add Quantity')
            return
          }
          if($scope.form.rate==undefined||$scope.form.rate==''){
            Flash.create("warning",'Add Price')
            return
          }
          var toSend = {
            value: $scope.form.value,
            qtyAdded:$scope.form.value,
            rate: $scope.form.rate,
            name: $scope.form.name,
            refurnished : $scope.form.refurnished,
            refurnishedAdded : $scope.form.refurnished,
          }
          $http({
            method: 'POST',
            url: '/api/finance/inventory/',
            data: toSend
          }).
          then(function(response) {
            console.log("hereeeeeeeeeee",response.data);
            $http({
              method: 'POST',
              url: '/api/finance/inventoryLog/',
              data: {
                inventory:response.data.pk,
                value: $scope.form.value,
                refurnished : $scope.form.refurnished,
              }
            }).
            then(function() {
              Flash.create("success",'Saved')
              $scope.refresh()
            })
          })
        }
      },
    }).result.then(function() {

      $scope.getAll()
    }, function() {

    });
  }


  $scope.editData=function(pk,qty,refQty){
    if(qty==undefined&&refQty==undefined){
      Flash.create("warning",'Add Quantity')
      return
    }
    if(refQty==undefined||refQty==''){
      refQty = 0
    }
    else{
      refQty = '-'+refQty
    }
    if(qty==undefined||qty==''){
      qty = 0
    }
    else{
      qty = '-'+qty
    }
    $http({
      method: 'PATCH',
      url: '/api/finance/inventory/' + pk +'/',
      data: {value:qty,refurnished:refQty}
    }).
    then(function(response) {
      $http({
        method: 'POST',
        url: '/api/finance/inventoryLog/',
        data: {
          inventory:response.data.pk,
          value: qty,
          refurnished:refQty
        }
      }).
      then(function() {
        Flash.create("success",'Saved')
        $scope.getAll()
      })
    })

  }

  // $scope.addTab({"title":"Browse Cost Center : 1","cancel":true,"app":"costCenterBrowser","data":{"pk":1,"index":0},"active":true});

})
