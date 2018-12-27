app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.deliveryCenter.offline', {
      url: "/offline",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.deliveryCenter.offline.html',
          controller: 'businessManagement.deliveryCenter.offline',
        }
      }
    })
});


app.controller('businessManagement.deliveryCenter.offline', function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $aside, $filter,$rootScope) {

  $scope.data = {
    processData: [],
    completedData: [],
  }

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.POS.invoice.item.html',
  }, ];

  $scope.processConfig = {
    views: views,
    url: '/api/POS/invoice/',
    searchField: 'id',
    itemsNumPerView: [6, 12, 24],
    getParams:[{key : 'status!' , value : 'Completed'}]
  }
  $scope.completedConfig = {
    views: views,
    url: '/api/POS/invoice/',
    searchField: 'id',
    itemsNumPerView: [6, 12, 24],
    getParams:[{key : 'status' , value : 'Completed'}]
  }

  $scope.processTableActionInvoice = function(target, action) {
    console.log(target, action);
    console.log($scope.data.processData);

    if (action == 'new') {
      console.log('newwwwwwwwwwwww');
    } else {
      for (var i = 0; i < $scope.data.processData.length; i++) {
        if ($scope.data.processData[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openInvoiceForm(i,'process');
          } else {
            $scope.openInvoiceinfoForm(i,'process');
          }
        }
      }
    }

  }

  $scope.completedTableActionInvoice = function(target, action) {
    console.log(target, action);
    console.log($scope.data.completedData);

    if (action == 'new') {
      console.log('newwwwwwwwwwwww');
    } else {
      for (var i = 0; i < $scope.data.completedData.length; i++) {
        if ($scope.data.completedData[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openInvoiceForm(i,'completed');
          } else {
            $scope.openInvoiceinfoForm(i,'completed');
          }
        }
      }
    }

  }


  $scope.searchTabActive = true;

  $scope.openInvoiceForm = function(idx,typ) {

    if (idx == undefined || idx == null) {
      var toRet =  {};
    } else {
      if (typ == 'completed') {
        var toRet = $scope.data.completedData[idx];
      }else {
        var toRet = $scope.data.processData[idx];
      }
    }

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.invoices.form.html',
      size: 'xl',
      backdrop: true,
      resolve: {
        invoice: function() {
          return toRet
        }
      },
      controller: 'controller.POS.invoice.form',
    }).result.then(function() {

    }, function() {

    });


  }

  $scope.openInvoiceinfoForm = function(idx,typ) {
    if (idx == undefined || idx == null) {
      var toRet =  {};
    } else {
      if (typ == 'completed') {
        var toRet = $scope.data.completedData[idx];
      }else {
        var toRet = $scope.data.processData[idx];
      }
    }
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.invoicesinfo.form.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        invoice: function() {
          return toRet
        }
      },
      controller: "controller.POS.invoicesinfo.form",
    }).result.then(function() {

    }, function() {

    });



  }


});
