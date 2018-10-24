app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.warehouse', {
      url: "/warehouse",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
        },
        "menu@businessManagement.warehouse": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller: 'controller.generic.menu',
        },
        "@businessManagement.warehouse": {
          templateUrl: '/static/ngTemplates/app.warehouse.default.html',
          controller: 'businessManagement.warehouse.default',
        }
      }
    })
  // .state('businessManagement.warehouse.expenses', {
  //   url: "/service",
  //   templateUrl: '/static/ngTemplates/app.warehouse.service.html',
  //   controller: 'businessManagement.warehouse.service'
  // })

});


app.controller('businessManagement.warehouse.default', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $aside, $timeout, $uibModal) {
  // settings main page controller
  console.log('ssssssssssssssssss');
  $scope.serchField = ''
  $scope.$watch('serchField', function(newValue, oldValue) {
    console.log(newValue);
    var url = '/api/warehouse/contract/'
    // if (newValue.length == 0) {
    //   var url = '/api/warehouse/dashboardInvoices/'
    // } else {
    //   var url = '/api/warehouse/dashboardInvoices/?cName=' + newValue
    // }
    $http({
      method: 'GET',
      url: url
    }).
    then(function(response) {
      $scope.invData = response.data
    })
  })
  $scope.invoiceDetails = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.warehouse.invoiceDetails.html',
      size: 'xl',
      backdrop: true,
      resolve: {
      },
      controller: function($scope, $uibModalInstance) {

        $scope.selectDate = new Date()

        $scope.$watch('selectDate', function(newValue, oldValue) {

        $http({
          method: 'GET',
          url: '/api/warehouse/invoice/?createdval='+ newValue.toJSON()
        }).
        then(function(response) {
          $scope.invoice = response.data
        });
      })
      }
    })
  }

  $scope.extraData = function(contractPk, frmDate, toDate) {
    console.log(frmDate, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.warehouse.invoice.html',
      size: 'xl',
      backdrop: false,
      resolve: {
        contract: function() {
          return contractPk;
        },
        frmDate: function() {
          return $scope.frmDate
        },
        toDate: function() {
          return $scope.toDate
        }
      },
      controller: function($scope, contract, frmDate, toDate, $uibModalInstance) {

        $scope.dataDetails = []
        $scope.contractPk = contract

        $http({
          method: 'GET',
          url: '/api/warehouse/contract/' + $scope.contractPk + '/'
        }).
        then(function(response) {
          console.log(response.data, 'aaaaaaaaaaaaaaaaaaaaaaaaaa');
          $scope.contract = response.data
        });


        $scope.frmDate = frmDate;
        $scope.toDate = toDate;

        $scope.form = {
          quantity: 0,
          amount: 0,
          qty: 0,
          rate: 0,
          productMeta: ''
        };
        $scope.searchTaxCode = function(c) {
          return $http.get('/api/clientRelationships/productMeta/?code__contains=' + c).
          then(function(response) {
            return response.data;
          })
        }
        $scope.$watch('form.productMeta', function(newValue, oldValue) {
          if (typeof newValue == 'object') {
            $scope.showTaxCodeDetails = true;
          } else {
            $scope.showTaxCodeDetails = false;
          }
        })
        $scope.$watch('form.qty', function(newValue, oldValue) {
          if (newValue > 0) {
            $scope.form.amount = newValue * $scope.form.rate;
          } else {
            $scope.form.amount = 0;
          }
        })


        $scope.add = function() {
          $scope.dataDetails.push($scope.form)
          $scope.form = {}
        }

        $scope.close = function() {
          $uibModalInstance.dismiss('cancel');
        }
        // $scope.download = function(){
        //   console.log($scope.dataDetails);
        //   $http({
        //     method: 'GET',
        //     url: '/api/warehouse/downloadMonthlyInvoice/?valPK='+$scope.contractPk+'&from='+ $scope.frmDate+'&to='+$scope.toDate+'&dataDetails='+$scope.dataDetails,
        //
        //
        //   }).
        //   then(function(response) {
        //
        //   })
        // }



        $scope.createInvoice = function() {
          console.log();
          $scope.total = 0
          if ($scope.dataDetails.length > 0) {
            for (var i = 0; i < $scope.dataDetails.length; i++) {
              $scope.amount = $scope.dataDetails[i].amount
              console.log($scope.amount);
              $scope.total += $scope.amount
            }
          }

          $scope.price = $scope.contract.rate
          $scope.sqrt = $scope.contract.areas.areaLength * $scope.contract.quantity
          $scope.cost = $scope.contract.rate * $scope.sqrt * 30
          if ($scope.contract.company.gst.slice(0, 2) == '29') {
            $scope.gst = 9
            $scope.cgst = 9
            $scope.igst = 0
            $scope.taxtot = $scope.gst + $scope.cgst + $scope.igst
          } else {
            $scope.gst = 0
            $scope.cgst = 0
            $scope.igst = 18
            $scope.taxtot = $scope.gst + $scope.cgst + $scope.igst
          }
          $scope.tot = $scope.cost + $scope.total
          $scope.tax = ($scope.tot * $scope.taxtot) / 100
          $scope.grandtot = $scope.tot + $scope.tax
          console.log($scope.grandtot,'aaaaaaaaaaaaaaaaaaaaaa');
          $scope.grandtot = Math.round($scope.grandtot)
          console.log($scope.grandtot,'aaaaaaaaaaaaaaaaaaaaaa');
          var dataToSend = {
            contract: $scope.contract.pk,
            data: JSON.stringify($scope.dataDetails),
            fromDate: $scope.frmDate.toJSON().split('T')[0],
            toDate: $scope.toDate.toJSON().split('T')[0],
            value: $scope.tot,
            grandTotal: $scope.grandtot

          }


          $http({
            method: 'POST',
            url: '/api/warehouse/invoice/',
            data: dataToSend
          }).
          then(function(response) {
            Flash.create('success', 'Saved');
          }, function(err) {
            Flash.create('danger', 'Error');
          })
        }
      },
    }).result.then(function() {

    }, function() {


    });
  }

  $scope.createInvoice = function(id, from, to) {
    for (var i = 0; i < $scope.invoiceData.length; i++) {
      if ($scope.invoiceData[i].pk == id) {

        $scope.price = $scope.invoiceData[i].rate
        $scope.sqrt = $scope.invoiceData[i].areas.areaLength * $scope.invoiceData[i].quantity
        $scope.cost = $scope.invoiceData[i].rate * $scope.sqrt * 30
        if ($scope.invoiceData[i].company.gst.slice(0, 2) == '29') {
          $scope.gst = 9
          $scope.cgst = 9
          $scope.igst = 0
          $scope.taxtot = $scope.gst + $scope.cgst + $scope.igst
        } else {
          $scope.gst = 0
          $scope.cgst = 0
          $scope.igst = 18
          $scope.taxtot = $scope.gst + $scope.cgst + $scope.igst
        }
        $scope.tax = ($scope.cost * $scope.taxtot) / 100
        $scope.grandtot = $scope.cost + $scope.tax
        console.log($scope.grandtot,'aaaaaaaaaaaaaaaaaaaaaa');
        $scope.grandtot = Math.round($scope.grandtot)
        console.log($scope.grandtot,'aaaaaaaaaaaaaaaaaaaaaa');
      }
    }
    var dataToSend = {
      contract: id,
      fromDate: $scope.frmDate.toJSON().split('T')[0],
      toDate: $scope.toDate.toJSON().split('T')[0],
      value: $scope.cost,
      grandTotal: $scope.grandtot

    }


    $http({
      method: 'POST',
      url: '/api/warehouse/invoice/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
    }, function(err) {
      Flash.create('danger', 'Error');
    })

  }


  $scope.changeStatus = function(status, indx) {
    $scope.invData[indx].status = status;


    if (status == 'billed') {
      $uibModal.open({
        template: '<div style="padding:30px;"><div class="form-group"><label>Due Date</label>' +
          '<div class="input-group" >' +
          '<input type="text" class="form-control" show-weeks="false" uib-datepicker-popup="dd-MMMM-yyyy" ng-model="contract.dueDate" is-open="status.opened" />' +
          '<span class="input-group-btn">' +
          '<button type="button" class="btn btn-default" ng-click="status.opened = true;"><i class="glyphicon glyphicon-calendar"></i></button>' +
          '</span>' +
          '</div><p class="help-block">Auto set based on Deal due period.</p>' +
          '</div></div>',
        size: 'sm',
        backdrop: true,
        resolve: {
          contract: function() {
            return $scope.invData[indx];
          },
        },
        controller: function($scope, contract) {
          $scope.contract = contract;
          var dueDate = new Date();
          // dueDate.setDate(dueDate.getDate() + contract.duePeriod);
          console.log('kkkkkkkkkkk', $scope.contract.dueDate);
          if ($scope.contract.dueDate == null) {
            console.log('sssssssss', dueDate);
            $scope.contract.dueDate = dueDate;
          }
          console.log($scope.contract.dueDate);
          // $scope.deal = deal;
        },
      }).result.then(function() {

      }, (function(indx, status) {
        return function() {
          console.log(indx);
          console.log($scope.invData[indx].dueDate);

          $http({
            method: 'PATCH',
            url: '/api/warehouse/invoice/' + $scope.invData[indx].pk + '/',
            data: {
              status: status,
              dueDate: $scope.invData[indx].dueDate.toISOString().substring(0, 10)
            }
          }).
          then(function(response) {
            $http({
              method: 'GET',
              url: '/api/warehouse/downloadInvoice/?saveOnly=1&contract=' + response.data.pk
            }).
            then(function(response) {
              Flash.create('success', 'Saved')
            }, function(err) {
              Flash.create('danger', 'Error occured')
            })
          })



        }
      })(indx, status));



    } else if (status == 'dueElapsed') {

      var sacCode = 998311;
      var c = $scope.invData[indx];
      for (var i = 0; i < c.data.length; i++) {
        if (c.data[i].taxCode == sacCode) {
          return;
        }
      }

      var fineAmount = $scope.invData[indx].value * $scope.deal.duePenalty * (1 / 100)

      $http({
        method: 'GET',
        url: '/api/clientRelationships/productMeta/?code=' + sacCode
      }).
      then((function(indx) {
        return function(response) {
          var quoteInEditor = $scope.invData[indx]
          var productMeta = response.data[0];
          var subTotal = fineAmount * (1 + productMeta.taxRate / 100)
          quoteInEditor.data.push({
            currency: $scope.deal.currency,
            type: 'onetime',
            tax: productMeta.taxRate,
            desc: 'Late payment processing charges',
            rate: fineAmount,
            quantity: 1,
            taxCode: productMeta.code,
            totalTax: fineAmount * (productMeta.taxRate / 100),
            subtotal: subTotal
          })

          quoteInEditor.value += subTotal
          var url = '/api/warehouse/invoice/' + quoteInEditor.pk + '/'
          var method = 'PATCH'
          var dataToSend = {
            deal: $scope.deal.pk,
            data: JSON.stringify(quoteInEditor.data),
            value: quoteInEditor.value
          };
          $http({
            method: method,
            url: url,
            data: dataToSend
          }).
          then(function(response) {
            $http({
              method: 'GET',
              url: '/api/warehouse/downloadInvoice/?saveOnly=1&contract=' + response.data.pk
            }).
            then(function(response) {
              Flash.create('success', 'Saved')
            }, function(err) {
              Flash.create('error', 'Error occured')
            })
          })
        }
      })(indx))


    } else {

      $http({
        method: 'PATCH',
        url: '/api/warehouse/invoice/' + $scope.invData[indx].pk + '/',
        data: {
          status: status
        }
      }).
      then(function(response) {
        Flash.create('success', 'Saved')
      })

    }

    if (status == 'received') {
      $scope.invData.splice(indx, 1)
    }


  }

  $http({
    method: 'GET',
    url: '/api/warehouse/contract'
  }).
  then(function(response) {
    $scope.invoiceData = response.data
  }, function(err) {
    Flash.create('error', 'Error occured')
  })
  var date = new Date();
  $scope.frmDate = new Date(date.getFullYear(), date.getMonth(), 1),
    $scope.toDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
})


// app.config(function($stateProvider){
//
//   $stateProvider
//   .state('businessManagement.warehouse', {
//     url: "/warehouse",
//     views: {
//        "": {
//           templateUrl: '/static/ngTemplates/genericAppBase.html',
//        },
//        "menu@businessManagement.warehouse": {
//           templateUrl: '/static/ngTemplates/genericMenu.html',
//           controller : 'controller.generic.menu',
//         },
//         "@businessManagement.warehouse": {
//           templateUrl: '/static/ngTemplates/app.warehouse.default.html',
//
//           controller : 'businessManagement.warehouse.default',
//         }
//     }
//   })
//
// });
// app.controller("businessManagement.warehouse.default", function($scope , $state , $users ,  $stateParams , $http , Flash , $uibModal) {
//
// });
//
//           // controller : 'businessManagement.warehouse.default',
//         }
//     }
//   })
//   // .state('businessManagement.warehouse.expenses', {
//   //   url: "/service",
//   //   templateUrl: '/static/ngTemplates/app.warehouse.service.html',
//   //   controller: 'businessManagement.warehouse.service'
//   // })
//
// });


// app.controller('businessManagement.warehouse.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
//   // settings main page controller
//
//
// })
