app.controller("businessManagement.inventory", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {
  $scope.offset = 0
  $scope.text = {searchText:''}
  $scope.fetchProdInventory = function(offset) {
    console.log($scope.text.searchText,'hhhhhhh');
    if ($scope.text.searchText.length>0) {
      var url = '/api/support/inventoryData/?limit=7&offset=' + offset + '&search=' + $scope.text.searchText
    }else {
      var url = '/api/support/inventoryData/?limit=7&offset=' + offset
    }
    $http({
      method: 'GET',
      url: url
    }).
    then(function(response) {
      $scope.products = response.data.data
      $scope.total = response.data.total
      if($rootScope.cart.length){
        for (var i = 0; i < $rootScope.cart.length; i++) {
          for (var j = 0; j < $scope.products.length; j++) {
            if($rootScope.cart[i]==$scope.products[j].productPk){
              $scope.products[j].addedCart = true
            }
          }
        }
      }
    })
  }
  $scope.fetchProdInventory($scope.offset)

  $scope.enterFun = function() {
    $scope.fetchProdInventory($scope.offset)
  }

  $scope.refresh = function() {
    $scope.fetchProdInventory($scope.offset)
  }

  $scope.next = function() {
    $scope.offset = $scope.offset + 7
    $scope.fetchProdInventory($scope.offset)
    if ($scope.products.length == 0) {
      $scope.offset = $scope.offset - 7
      $scope.fetchProdInventory($scope.offset)
    }
  }

  $scope.prev = function() {
    if ($scope.offset == 0) {
      return
    }
    $scope.offset = $scope.offset - 7
    console.log('calling from prev');
    $scope.fetchProdInventory($scope.offset)
  }

  $scope.reset = function() {
    $rootScope.cart = []
    $scope.fetchProdInventory($scope.offset)
  }
  $scope.reset()
  $scope.addToCart = function(product,indx) {
    console.log(product, 'aaaaaaaaaaaaaa');
    $rootScope.cart.push(product)
    $scope.products[indx].addedCart = true
    console.log($rootScope.cart.length);
  }


  $scope.searchmaterial = {
    search : ""
  }



  $scope.getMaterialIssue = function(offset){
    console.log($scope.searchmaterial.search,'kkkkkkkkkkkkkkk');
    $http({
      method: 'GET',
      url: '/api/support/material/?limit=7&offset=' + offset+ '&search=' + $scope.searchmaterial.search
    }).
    then(function(response) {
      console.log(response.data, 'aaaaaaaaaaaaaa');
      $scope.materialIssue = response.data.results
      $scope.sum = []
      for (var i = 0; i < $scope.materialIssue.length; i++) {
        $scope.issue = $scope.materialIssue[i].materialIssue
        $scope.sum.push($scope.issue.map(function(m){
          return m.qty*m.price
        }).reduce(function(a,b){return a+b},0))
        console.log($scope.sum,'aaaaaaa');

      }
    })
  }

  $scope.offsetmaterial = 0



  $scope.refreshmaterial = function() {
    $scope.getMaterialIssue($scope.offset)
  }

  $scope.nextmaterial = function() {
    console.log($scope.materialIssue.length,'ooooo');
    if ($scope.materialIssue.length == 0) {
        $scope.offsetmaterial  =  $scope.offsetmaterial -7
      $scope.getMaterialIssue($scope.offsetmaterial)
    }
    $scope.offsetmaterial  = $scope.offsetmaterial  + 7
    $scope.getMaterialIssue($scope.offsetmaterial)
  }

  $scope.prevmaterial = function() {
    if ($scope.offsetmaterial== 0) {
      return
    }
    $scope.offsetmaterial =  $scope.offsetmaterial  - 7
    console.log('calling from prev');
    $scope.getMaterialIssue($scope.offsetmaterial)
  }

  $scope.enterFunmaterial = function() {
    $scope.getMaterialIssue($scope.offsetmaterial)
  }




  $scope.$watch('modeToggle', function(newValue, oldValue) {
    console.log(newValue, 'kkkkkkkkkkkkkkkkkk');
    if (newValue == true) {
      $scope.getMaterialIssue($scope.offsetmaterial)
    }
  });



//
//   $scope.$watch('modeToggle', function(newValue, oldValue) {
//   console.log(newValue, 'kkkkkkkkkkkkkkkkkk');
//   if (newValue == true) {
//     $http({
//       method: 'GET',
//       url: '/api/support/material/'
//     }).
//     then(function(response) {
//       $scope.materialIssue = response.data
//       for (var i = 0; i < $scope.materialIssue.length; i++) {
//
//         $scope.issue = $scope.materialIssue[i].materialIssue
//         $scope.sum.push($scope.issue.map(function(m){
//           return m.qty*m.price
//         }).reduce(function(a,b){return a+b},0))
//         console.log($scope.sum,'aaaaaaa');
//
//       }
//
//
//       console.log($scope.totalSum,'lllllllll');
//
//     })
//
//   }
// });

  // $scope.$watch('modeToggle', function(newValue, oldValue) {
  //   console.log(newValue, 'kkkkkkkkkkkkkkkkkk');
  //   if (newValue == true) {
  //     $http({
  //       method: 'GET',
  //       url: '/api/support/material/'
  //     }).
  //     then(function(response) {
  //       console.log(response.data, 'aaaaaaaaaaaaaa');
  //       $scope.materialIssue = response.data
  //
  //     })
  //
  //   }
  // });




  $scope.delete = function(pk, index) {
    $http({
      method: 'DELETE',
      url: '/api/support/material/' + pk + '/'
    }).
    then(function(response) {
      Flash.create('success', 'Deleted');
      console.log(index, 'jjjjj');
      $scope.materialIssue.splice(index, 1)
      $scope.sum.splice(index, 1)
    })
  }
  $scope.toggleMaterial = function(pk, indx) {
    // $scope.prodInventories[indx].open = !$scope.prodInventories[indx].open
    for (var i = 0; i < $scope.materialIssue.length; i++) {
      if ($scope.materialIssue[i].pk == pk) {
        $scope.materialIssue[i].open = !$scope.materialIssue[i].open
      }
    }
  }

  // modeToggle



  // $scope.getList = function(){
  //   if($rootScope.cart.length>0){
  //     for (var i = 0; i < $rootScope.cart.length; i++) {
  //       return $http.get('/api/support/products/?part_no__contains=' + query).
  //       then(function(response) {
  //         return response.data;
  //       }
  //     }
  //   }
  // }
  $scope.toggle = function(pk, indx) {
    // $scope.prodInventories[indx].open = !$scope.prodInventories[indx].open
    for (var i = 0; i < $scope.products.length; i++) {
      if ($scope.products[i].productPk == pk) {
        $scope.products[i].open = !$scope.products[i].open
      }
    }
  }

  $scope.new = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.inventory.modal.html',
      size: 'lg',
      controller: function($scope, $uibModalInstance) {
        $scope.productSearch = function(query) {
          return $http.get('/api/support/products/?part_no__contains=' + query).
          then(function(response) {
            return response.data;
          })
        };
        $scope.reset = function() {
          $scope.form = {
            product: '',
            qty: 1,
            rate: 0,
          }
        }
        $scope.reset()
        $scope.saveProduct = function() {
          var dataToSend = {
            product: $scope.form.product.pk,
            qty: $scope.form.qty,
            rate: $scope.form.rate
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

  $scope.getList = function() {
    console.log($rootScope.cart);
    if($rootScope.cart.length>0){
      $uibModal.open({
        templateUrl: '/static/ngTemplates/app.inventory.cart.modal.html',
        size: 'lg',
        resolve: {
          cartData: function() {
            return $rootScope.cart;
          }
        },
        controller: function($scope, $uibModalInstance, cartData) {
          $scope.projectSearch = function(query) {
            return $http.get('/api/support/projects/?title__contains=' + query).
            then(function(response) {
              return response.data;
            })
          };

          $scope.userSearch = function(query) {
            return $http.get('/api/HR/userSearch/?first_name__contains=' + query).
            then(function(response) {
              return response.data;
            })
          };
          console.log(cartData, 'aaaaaaaaaaa');
          $scope.cartData = cartData
          $scope.productsOrdered = []
          // $scope.productsOrderedpk = []
          for (var i = 0; i < $scope.cartData.length; i++) {
            $http({
              method: 'GET',
              url: '/api/support/products/' + $scope.cartData[i]
            }).
            then(function(response) {
              $scope.productsOrdered.push(response.data);
            //   $scope.productsOrderedpk = $scope.productsOrdered.map(function(product){
            //
            //   return  product.pk
            //
            // })

            })

          }

          $scope.delete = function(index){
            $scope.productsOrdered.splice(index,1);
          }
          // $scope.delete = function(pk,index){
          //   $http({method : 'DELETE' , url : '/api/support/products/' + pk + '/' }).
          //   then( function(response){
          //     Flash.create('success','Deleted' );
          //     console.log(index,'jjjjj');
          //     $scope.productsOrdered.splice(index,1)
          //   })



          $scope.form = {}
          $scope.save = function() {
            console.log($scope.form.responsible, 'kkkkkkkkkkkkkkkkk');
            if ($scope.form.responsible == undefined) {
              Flash.create('warning', 'Select Responsible person');
              return
            }
            if ($scope.form.project == undefined) {
              Flash.create('warning', 'Select Project');
              return
            }


            if ($scope.productsOrdered.length<=0) {

              Flash.create('warning', 'Add Products');
              return
            }

            var dataToSend = {
              products: $scope.productsOrdered,
              user: $scope.form.responsible.pk,
              project: $scope.form.project.pk,
            }
            $http({
              method: 'POST',
              url: '/api/support/order/',
              data: dataToSend
            }).
            then(function(response) {
              console.log(response.data, 'kkkkkkkkk');
              $scope.values = response.data
            })
          }
          // $uibModalInstance.dismiss($scope.values)
        },
      }).result.then(function() {}, function(values) {
        $scope.fetchProdInventory($scope.offset)
        // $scope.valueList = values
      });
    }
    else{
      Flash.create("warning",'Add items to Cart')
    }
  }

    $scope.download = function(){
      $uibModal.open({
        templateUrl: '/static/ngTemplates/app.inventory.stockcheck.modal.html',
        size: 'lg',
        controller: function($scope, $uibModalInstance) {
          $scope.off = 0;
        $scope.fectchStock = function(){
          $http({
              method: 'GET',
              url: '/api/support/inventoryData/?limit=7&offset=' + $scope.off ,
            }).
            then(function(response) {
              console.log(response.data,'dddddddddddddddd');
              $scope.stockdata = response.data.data

            })
        }
        $scope.fectchStock()

          $scope.refresh = function() {
            $scope.fectchStock($scope.off)
          }

          $scope.next = function() {
            $scope.off = $scope.off + 7
            $scope.fectchStock($scope.off)
            if ($scope.stockdata.length == 0) {

              $uibModalInstance.close()
            }
          }

          $scope.prev = function() {
            if ($scope.off == 0) {
              return
            }
            $scope.off = $scope.off - 7
            console.log('calling from prev');
            $scope.fectchStock($scope.off)
          }

          $scope.$watch('stockdata', function(newValue, oldValue) {
            if (typeof newValue == 'object'){
              console.log( newValue,'jkqqqqqqqqqqq');
              for(var i=0;i<$scope.stockdata.length;i++){

              }
            }
            // $http({
            //     method: 'PATCH',
            //     url: '/api/support/stockcheck/' ,
            //     data:
            //   }).
            //   then(function(response) {
            //     console.log(response.data,'dddddddddddddddd');
            //     $scope.stockdata = response.data.data
            //
            //   })
          });

          $scope.save = function (){

          }

        },
      })
    }


})
