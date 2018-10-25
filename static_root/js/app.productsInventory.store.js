app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.productsInventory.store', {
      url: "/store",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.productsInventory.store.html',
          controller: 'businessManagement.productsInventory.store',
        }
      }
    })
});
app.controller("businessManagement.productsInventory.store", function($scope, $http, Flash , $uibModal , $rootScope,$state) {

  $scope.data = {
    tableData: [],
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.productsInventory.store.item.html',
  }, ];



  $scope.config = {
    views: views,
    url: '/api/POS/store/',
    searchField: 'name',
    itemsNumPerView: [16, 32, 48],
  }
  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      console.log($scope.data.tableData[i],'ffffffffffffffffffff');
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'storeEditor') {
          var title = 'Edit : ';
          var appType = 'storeEditor';
        } else if (action == 'storeInfo') {
          var title = 'Details : ';
          var appType = 'storeInfo';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].pk +' ',
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
          active: true
        })
      }
    }
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
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


app.controller("businessManagement.productsInventory.store.form", function($scope, $http, Flash , $uibModal , $rootScope,$state) {
  $scope.resetForm = function(){
      $scope.form = {name:'',mobile:'',email:'',address:'',pincode:''}

  }

  if ($scope.tab != undefined) {
    $scope.mode = 'edit';
    console.log('aaaaaaaaaaaa', $scope.tab.data);
    $scope.form = $scope.tab.data;
  } else {
    $scope.mode = 'new';
    $scope.resetForm()
  }


    $scope.save = function() {
      console.log('entered');
      var f = $scope.form;

      if (f.name == null || f.name.length==0) {
        Flash.create('warning','Please Add Store Name')
        return
      }
      if (f.mobile == null || f.mobile.length==0) {
        Flash.create('warning','Please Add Mobile Number')
        return
      }
      if (f.email == null || f.email.length==0) {
        Flash.create('warning','Please Add Email')
        return
      }
      if (f.address == null || f.address.length==0) {
        Flash.create('warning','Please Add Address')
        return
      }
      if (f.pincode == null || f.pincode.length==0) {
        Flash.create('warning','Please Add Pincode')
        return
      }
      var url = '/api/POS/store/';
      if ($scope.mode == 'new') {
        var method = 'POST';
      } else {
        var method = 'PATCH';
        url += f.pk + '/'
      }

      var toSend = {
        name:f.name,
        mobile:f.mobile,
        email:f.email,
        address:f.address,
        pincode:f.pincode
      }
      console.log('dataaaaaaaaaaaaaaaaaaa',toSend);

      $http({
        method: method,
        url: url,
        data: toSend,
      }).
      then(function(response) {
        Flash.create('success', 'Saved')
        if ($scope.mode == 'new') {
          $scope.resetForm()
        }
      }, function(err) {
        Flash.create('danger' , 'Some Internal Error')
      })
    }

})

app.controller("businessManagement.productsInventory.store.explore", function($scope, $http, Flash , $uibModal , $rootScope,$state) {
    $scope.data = $scope.tab.data;
})
