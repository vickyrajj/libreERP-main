var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'flash', 'ngSanitize', 'ngAnimate', 'anim-in-out', 'mwl.confirm', 'ui.bootstrap.datetimepicker', 'rzModule', 'ngMeta']);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide, $locationProvider) {

  $urlRouterProvider.otherwise('/');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
  $locationProvider.html5Mode(true);
  // $cookies.set("time" : new Date())

});

app.run(['$rootScope', '$state', '$stateParams', '$users', '$http', function($rootScope, $state, $stateParams, $users, $http, $timeout) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.previousState;
  $rootScope.currentState;
  var startTime = new Date();
  $rootScope.$on("$stateChangeError", console.log.bind(console));
  $rootScope.$on("$stateChangeSuccess", function(params, to, toParams, from, fromParams) {
    $rootScope.previousState = from.name;
    $rootScope.currentState = to.name;
    // $timeout(function() {
    //   window.scrollTo(0, 0);
    // }, 1000)
    setTimeout(function() {
      window.scrollTo(0, 0);
    }, 1000);

    var me = $users.get('mySelf');

    var now = new Date();
    var timeSpent = (now.getTime() - startTime.getTime()) / 1000;
    startTime = new Date();
    console.log('time spent', timeSpent, 'on', $rootScope.previousState);


    function getCookie(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      console.log(decodedCookie, 'hhhhhhhhhhhhhhhhhhhhhh');
      var ca = decodedCookie.split(';');
      console.log(ca);
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }


    function setCookie(cname, cvalue, exdays) {
      console.log('set cookie');
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    if (me != null) {
      if ($rootScope.previousState == '') {
        console.log('logged in ');
        dataToSend = {
          user: me.pk,
          typ: 'loggedIn'
        }

      }

      if ($rootScope.previousState == 'details') {
        var data = {
          timeSpent: timeSpent,
          product: fromParams.id
        }
        data = JSON.stringify(data)
        dataToSend = {
          user: me.pk,
          typ: 'productView',
          product: fromParams.id,
          data: data
        }
        $http({
          method: 'POST',
          url: '/api/ecommerce/activities/',
          data: dataToSend
        }).
        then(function(response) {
          console.log(response.data);
        })
      }

      if ($rootScope.previousState == 'categories') {
        var data = {
          timeSpent: timeSpent,
          category: fromParams.name
        }
        data = JSON.stringify(data)
        dataToSend = {
          user: me.pk,
          typ: 'categoryView',
          data: data
        }
        $http({
          method: 'POST',
          url: '/api/ecommerce/activities/',
          data: dataToSend
        }).
        then(function(response) {
          console.log(response.data);
        })
      }
    } else {
      console.log('cookieeee', $rootScope.previousState);
      if ($rootScope.previousState == 'details') {
        console.log(fromParams);
        var data = {
          timeSpent: timeSpent,
          product: fromParams.id
        }
        data = JSON.stringify(data)
        dataToSend = {
          typ: 'productView',
          product: fromParams.id,
          data: data
        }
        detail = getCookie("unknownUserRecentViewed");
        if (detail != "") {
          console.log('already there');
          document.cookie = encodeURIComponent("unknownUserRecentViewed") + "=deleted; expires=" + new Date(0).toUTCString()
        }
        setCookie("unknownUserRecentViewed", JSON.stringify(dataToSend), 365);
      }

    }


  });
}]);

app.config(function($stateProvider) {

  $stateProvider
    .state('ecommerce', {
      url: "/",
      templateUrl: '/static/ngTemplates/app.ecommerce.list.html',
      controller: 'controller.ecommerce.list'
    })

  $stateProvider
    .state('details', {
      url: "/details/:id/:name/:sku",
      templateUrl: '/static/ngTemplates/app.ecommerce.details.html',
      controller: 'controller.ecommerce.details'
    })

  $stateProvider
    .state('blog', {
      url: "/blog",
      templateUrl: '/static/ngTemplates/app.ecommerce.blog.html',
      controller: 'controller.ecommerce.blog'
    })

  $stateProvider
    .state('pages', {
      url: "/:title",
      templateUrl: '/static/ngTemplates/app.ecommerce.PagesDetails.html',
      controller: 'controller.ecommerce.PagesDetails'
    })

  $stateProvider
    .state('categories', {
      url: "/categories/:name",
      templateUrl: '/static/ngTemplates/app.ecommerce.categories.html',
      controller: 'controller.ecommerce.categories'
    })

  $stateProvider
    .state('checkout', {
      url: "/checkout/:pk",
      templateUrl: '/static/ngTemplates/app.ecommerce.checkout.html',
      controller: 'controller.ecommerce.checkout'
    })

  $stateProvider
    .state('account', {
      url: "/user/account",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.ecommerce.account.html',
        },
        "menu@account": {
          templateUrl: '/static/ngTemplates/app.ecommerce.account.menu.html',
        },
        "topMenu@account": { //this is for top menu for mobile view
          templateUrl: '/static/ngTemplates/app.ecommerce.account.topMenu.html',
        },
        "@account": {
          templateUrl: '/static/ngTemplates/app.ecommerce.account.default.html',
        }
      }
    })

    .state('account.cart', {
      url: "/cart",
      templateUrl: '/static/ngTemplates/app.ecommerce.account.cart.html',
      controller: 'controller.ecommerce.account.cart'
    })
    .state('account.orders', {
      url: "/orders",
      templateUrl: '/static/ngTemplates/app.ecommerce.account.orders.html',
      controller: 'controller.ecommerce.account.orders'
    })
    .state('account.settings', {
      url: "/settings",
      templateUrl: '/static/ngTemplates/app.ecommerce.account.settings.html',
      controller: 'controller.ecommerce.account.settings'
    })
    .state('account.support', {
      url: "/support",
      templateUrl: '/static/ngTemplates/app.ecommerce.account.support.html',
      controller: 'controller.ecommerce.account.support'
    })
    .state('account.saved', {
      url: "/saved",
      templateUrl: '/static/ngTemplates/app.ecommerce.account.saved.html',
      controller: 'controller.ecommerce.account.saved'
    })


});

app.controller('controller.ecommerce.blog', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash, $window) {
  console.log('bloggggggggggggggggggggggggggggggggggg');
  $window.scrollTo(0, 0)
  document.title = 'Sterling Select |  Blog'
  document.querySelector('meta[name="description"]').setAttribute("content", 'Sterling Select Online Shopping Blogs')

  $scope.showNext = false
  $scope.showPrev = false
  $scope.start = 0
  $scope.rangeNo = 3
  $scope.end = $scope.start + $scope.rangeNo
  $scope.bData = function(start, end) {
    if (start > 0) {
      $scope.showPrev = true
    } else {
      $scope.showPrev = false
    }
    if (end >= $scope.blogFullLength) {
      $scope.showNext = false
    } else {
      $scope.showNext = true
    }
    $scope.blogData = $scope.blogFullData.slice(start, end)
  }
  $scope.change = function(a) {
    if (a == 'nxt') {
      $scope.start = $scope.end
      $scope.end = $scope.start + $scope.rangeNo
      $scope.bData($scope.start, $scope.end)
    } else if (a == 'prev') {
      $scope.end = $scope.start
      $scope.start = $scope.end - $scope.rangeNo
      $scope.bData($scope.start, $scope.end)
    }
    window.scrollTo(0, 0);
  }
  $http({
    method: 'GET',
    url: '/api/ecommerce/genericImage/'
  }).
  then(function(response) {
    console.log(response.data, 'imagesssssssss');
    if (response.data.length > 0) {
      $scope.genericImage = response.data[0]
    } else {
      $scope.genericImage = {}
    }
  })
  $http({
    method: 'GET',
    url: '/api/PIM/blog/?homeBlog'
  }).
  then(function(response) {
    console.log(response.data);
    $scope.blogFullData = response.data
    $scope.blogFullLength = response.data.length
    $scope.bData($scope.start, $scope.end)
  })

})


app.controller('ecommerce.search.typeheadResult', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash, $window) {
  $scope.genericSearchImage = $rootScope.genericImage
  $scope.me = $users.get('mySelf');
  // if($scope.me!=null){
  $scope.$watch('match', function(newValue, oldValue) {
    console.log($scope.match);
    $scope.match.model.added = 0
    if ($scope.me) {
      if ($rootScope.inCart != undefined) {
        for (var i = 0; i < $rootScope.inCart.length; i++) {
          if ($scope.match.model.serialNo) {
            if ($scope.match.model.serialNo == $rootScope.inCart[i].prodSku) {
              $scope.match.model.added = $rootScope.inCart[i].qty
              break;
            }
          }
        }
      }
    }
    if (!$scope.me) {
      if ($rootScope.addToCart != undefined) {
        for (var i = 0; i < $rootScope.addToCart.length; i++) {
          if ($scope.match.model.serialNo) {
            if ($scope.match.model.serialNo == $rootScope.addToCart[i].prodSku) {
              $scope.match.model.added = $rootScope.addToCart[i].qty
              break;
            }
          }
        }
      }
    }
  })
  // }

  // if($scope.me==null){
  //   console.log("kkkkkkkkkkhhhhhhhhhh");
  //   $scope.$watch('match' , function(newValue , oldValue) {
  //     $scope.match.model.added = false
  //     for (var i = 0; i < $rootScope.inCart.length; i++) {
  //       if ($scope.match.model.pk == $rootScope.addToCart[i].product.pk) {
  //           console.log("kkkkkkkkkkhhhhhhhhhh" );
  //         $scope.match.model.added = true;
  //         break;
  //
  //       }
  //     }
  //   })
  // }

  $scope.searchImage = false


  $http.get('/api/ERP/appSettings/?app=25&name__iexact=searchImage').
  then(function(response) {
    if (response.data[0] != null) {
      if (response.data[0].flag) {
        $scope.searchImage = true
      }
    }
  });


  $scope.addToCart = function(model) {

    // for (var i = 0; i < $rootScope.inCart.length; i++) {
    //   if ($rootScope.inCart[i].product.pk == model.pk) {
    //     if ($rootScope.inCart[i].prodSku!=model.serialNo) {
    //       Flash.create('warning' , 'You cant buy product and combo together')
    //       return
    //     }
    //   }
    // }



    console.log('coming here', model);
    var dataToSend = {
      product: model.pk,
      qty: 1,
      typ: 'cart',
      user: $users.get('mySelf').pk,
      prodSku: model.serialNo
    }
    console.log(dataToSend);
    $http({
      method: 'POST',
      url: '/api/ecommerce/cart/',
      data: dataToSend
    }).
    then(function(response) {
      $scope.match.model.added = 1;

      var prod_variants = response.data.product.product_variants
      for (var i = 0; i < prod_variants.length; i++) {
        if (prod_variants[i].sku == response.data.prodSku) {
          response.data.prod_var = prod_variants[i]
        }
      }

      $rootScope.inCart.push(response.data);
    });
  }

  $scope.incrementCart = function(modal) {
    console.log(modal, 'aaaaaaaaaaaaaaaaaaaaaaa');
    $scope.match.model.added++
      for (var i = 0; i < $rootScope.inCart.length; i++) {
        if ($rootScope.inCart[i].product.pk == modal.pk) {
          if ($rootScope.inCart[i].typ == 'cart') {
            $rootScope.inCart[i].qty = $rootScope.inCart[i].qty + 1;
            $http({
              method: 'PATCH',
              url: '/api/ecommerce/cart/' + $rootScope.inCart[i].pk + '/',
              data: {
                qty: $rootScope.inCart[i].qty
              }
            }).
            then(function(response) {})
          }
        }
      }
  }
  $scope.decrementCart = function(modal) {
    $scope.match.model.added--
      for (var i = 0; i < $rootScope.inCart.length; i++) {
        if ($rootScope.inCart[i].product.pk == modal.pk) {
          if ($rootScope.inCart[i].typ == 'cart') {
            if ($scope.match.model.added == 0) {
              $rootScope.inCart[i].qty = $rootScope.inCart[i].qty - 1;
              $http({
                method: 'DELETE',
                url: '/api/ecommerce/cart/' + $rootScope.inCart[i].pk + '/',
              }).
              then(function(response) {
                Flash.create('success', 'Removed From Cart');

              })
              $rootScope.inCart.splice(i, 1)
            } else if ($scope.match.model.added != 0) {
              $rootScope.inCart[i].qty = $rootScope.inCart[i].qty - 1;
              $http({
                method: 'PATCH',
                url: '/api/ecommerce/cart/' + $rootScope.inCart[i].pk + '/',
                data: {
                  qty: $rootScope.inCart[i].qty
                }
              }).
              then(function(response) {})

            }
          }
        }
      }
  }

  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    console.log(decodedCookie, 'hhhhhhhhhhhhhhhhhhhhhh');
    var ca = decodedCookie.split(';');
    console.log(ca);
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function setCookie(cname, cvalue, exdays) {
    console.log('set cookie');
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  $scope.addToCartCookie = function(model) {
    $http({
      method: 'GET',
      url: '/api/ecommerce/listing/' + model.pk + '/'
    }).
    then(function(response) {
      console.log(response.data, 'aaaaaaaaaaaaaaa');
      console.log(model.serialNo);
      console.log(response.data.product.howMuch);
      if (response.data.product.howMuch==null) {
        return
      }
      for (var i = 0; i < response.data.product_variants.length; i++) {
        if(response.data.product_variants[i].sku == model.serialNo){
          console.log('hereeeee');
            $scope.item = {'productName':response.data.product.name,'qty':1 , 'prodSku': response.data.product_variants[i].sku , 'prod_howMuch':response.data.product_variants[i].unitPerpack * response.data.product.howMuch , 'price':response.data.product_variants[i].discountedPrice ,'unit':response.data.product.unit , 'prodPk': response.data.pk}
            break;
        }else {
          $scope.item = {'productName':response.data.product.name,'qty':1 , 'prodSku': response.data.product.serialNo , 'prod_howMuch':response.data.product.howMuch , 'price':response.data.product.discountedPrice ,'unit':response.data.product.unit , 'prodPk': response.data.pk}
        }
      }

      if (response.data.product_variants.length==0) {
        $scope.item = {'productName':response.data.product.name,'qty':1 , 'prodSku': response.data.product.serialNo , 'prod_howMuch':response.data.product.howMuch , 'price':response.data.product.discountedPrice ,'unit':response.data.product.unit , 'prodPk': response.data.pk}
      }

      // $scope.item = {'productName':response.data.product.name,'qty':1 , 'prodSku': $scope.match.model.serialNo , 'prod_howMuch':$scope.match.model.howMuch , 'price':$scope.selectedProdVar.amnt ,'unit':$scope.match.model.unit , 'prodPk': $scope.list.pk}
      //
      // $scope.item = {
      //   'product': response.data,
      //   'qty': 1
      // }
      detail = getCookie("addToCart");
      if (detail != "") {
        console.log('already there');
        $rootScope.addToCart = JSON.parse(detail)
        document.cookie = encodeURIComponent("addToCart") + "=deleted; expires=" + new Date(0).toUTCString()
      }
      console.log($scope.item);
      $rootScope.addToCart.push($scope.item)
      $scope.match.model.added = 1;
      setCookie("addToCart", JSON.stringify($rootScope.addToCart), 365);
      console.log($rootScope.addToCart);
    })
  }
  $scope.incrementCookie = function(details) {
    $scope.match.model.added++
      for (var i = 0; i < $rootScope.addToCart.length; i++) {
        console.log(details.pk, 'aaaaaaaaaaaaa');
        if ($rootScope.addToCart[i].prodSku == details.serialNo) {
          $rootScope.addToCart[i].qty = $rootScope.addToCart[i].qty + 1
          setCookie("addToCart", JSON.stringify($rootScope.addToCart), 365);
        }
      }
  }

  $scope.decrementCookie = function(details) {
    $scope.match.model.added--
      for (var i = 0; i < $rootScope.addToCart.length; i++) {
        if ($rootScope.addToCart[i].prodSku == details.serialNo) {
          // $rootScope.addToCart[i].qty = $rootScope.addToCart[i].qty-1
          // setCookie("addToCart", JSON.stringify($rootScope.addToCart) , 365);
          if ($scope.match.model.added == 0) {
            setCookie("addToCart", "", -1, '/');
            $rootScope.addToCart.splice(i, 1);
            setCookie("addToCart", JSON.stringify($rootScope.addToCart), 365);
            return
          } else {
            $rootScope.addToCart[i].qty = $rootScope.addToCart[i].qty - 1
            setCookie("addToCart", JSON.stringify($rootScope.addToCart), 365);
            return
          }
        }
      }
  }
})

app.controller('ecommerce.body', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash, $window) {


  console.log($rootScope.addToCart, 'aaaaaaaaaaaaaaaaaaaagggggggggggggggggggggggg');

  $scope.var1 = "hello";

  // $scope.cart = $rootScope.inCart;
  console.log($scope.cart);
  $scope.data = {
    total: 0
  };

  $scope.$watch('inCart', function(newValue, oldValue) {
    $scope.data.total = 0;
    var price = 0;
    console.log("called cart");
    for (var i = 0; i < $rootScope.inCart.length; i++) {
      console.log($rootScope.inCart[i].prodSku, $rootScope.inCart[i].product.product.serialNo);
      if ($rootScope.inCart[i].prodSku == $rootScope.inCart[i].product.product.serialNo) {
        console.log('if');
        price = $rootScope.inCart[i].product.product.discountedPrice
      } else {
        console.log('else');
        price = $rootScope.inCart[i].prodVarPrice
      }
      $scope.data.total += price * $rootScope.inCart[i].qty
      console.log($scope.data.total);
    }
  }, true)

  $scope.checkout = function() {
    $state.go('checkout', {
      pk: 'cart'
    });
    $timeout(function() {
      window.scrollTo(0, 0);
    }, 1000)
  }






  $scope.changeQty = function(value, data) {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    for (var i = 0; i < $rootScope.inCart.length; i++) {
      if ($rootScope.inCart[i].product.pk == value) {
        if ($rootScope.inCart[i].typ == 'cart') {
          if (data == 'increase') {
            $rootScope.inCart[i].qty = $rootScope.inCart[i].qty + 1;
          }
          if (data == 'decrease') {
            $rootScope.inCart[i].qty = $rootScope.inCart[i].qty - 1;
          }
          if ($rootScope.inCart[i].qty > 0) {
            $http({
              method: 'PATCH',
              url: '/api/ecommerce/cart/' + $rootScope.inCart[i].pk + '/',
              data: {
                qty: $rootScope.inCart[i].qty
              }
            }).
            then(function(response) {

            })
          } else if ($rootScope.inCart[i].qty == 0) {
            $http({
              method: 'DELETE',
              url: '/api/ecommerce/cart/' + $rootScope.inCart[i].pk + '/',
            }).
            then(function(response) {
              Flash.create('success', 'Removed From Cart');

            })
            $rootScope.inCart.splice(i, 1)
            return
          }

        }
      }

    }
  }

  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    console.log(decodedCookie, 'hhhhhhhhhhhhhhhhhhhhhh');
    var ca = decodedCookie.split(';');
    console.log(ca);
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function setCookie(cname, cvalue, exdays) {
    console.log('set cookie');
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }


  $scope.updateCookieDetail = function(indx, value) {
    console.log(indx, value)
    if (value == "increase") {
      $rootScope.addToCart[indx].qty++
        setCookie("addToCart", JSON.stringify($rootScope.addToCart), 365);
      return
    }
    if (value == "decrease") {
      $rootScope.addToCart[indx].qty--
        if ($rootScope.addToCart[indx].qty == 0) {
          setCookie("addToCart", "", -1, '/');
          $rootScope.addToCart.splice(indx, 1);
          setCookie("addToCart", JSON.stringify($rootScope.addToCart), 365);
          return
        }
      else {
        setCookie("addToCart", JSON.stringify($rootScope.addToCart), 365);
        return
      }

    }

  }





  // $http({
  //   method: 'GET',
  //   url: '/api/ecommerce/listingLite/'
  // }).
  // then(function(response) {
  //   for (var i = 0; i < response.data.length; i++) {
  //     for (var j = 0; j < $rootScope.addToCart.length; j++) {
  //       console.log(response.data[i] , 'hhhhhhhhhhhhhh');
  //       if (response.data[i].pk == $rootScope.addToCart[j].product.pk) {
  //         $rootScope.addToCart[j].in_stock = response.data[i].in_stock
  //
  //       }
  //     }
  //   }
  //
  // })








  $scope.$watch('addToCart', function(newValue, oldValue) {
    $scope.data.totalVal = 0;
    if ($rootScope.addToCart != undefined) {
      for (var i = 0; i < $rootScope.addToCart.length; i++) {
        $scope.data.totalVal += $rootScope.addToCart[i].price * $rootScope.addToCart[i].qty
      }
    }
  }, true)


  $scope.mainPage = function() {
    window.location = '/login';
  }
  $rootScope.genericImage = {}
  $http({
    method: 'GET',
    url: '/api/ecommerce/genericImage/'
  }).
  then(function(response) {
    console.log(response.data);
    if (response.data.length > 0) {
      $rootScope.genericImage = response.data[0]
    }
  })
});


app.controller('controller.ecommerce.PagesDetails', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash, $window) {

  // $scope.data = $scope.$parent.data; // contains the pickUpTime , location and dropInTime
  $window.scrollTo(0, 0)
  console.log('paramsssssssssssss', $state.params.title);

  document.title = 'Sterling Select |  ' + $state.params.title.split('-').join(' ')
  document.querySelector('meta[name="description"]').setAttribute("content", 'Sterling Select Online Shopping')

  $scope.title = $state.params.title

  if ($scope.title == undefined || $scope.title == '') {
    $state.go('ecommerce', {})
  } else if ($scope.title == 'faq' || $scope.title == 'contact-us') {
    $state.go('account.support', {})
  } else {
    $http({
      method: 'GET',
      url: '/api/ecommerce/pages/?pageurl__icontains=' + $scope.title
    }).
    then(function(response) {
      console.log('pageeeeeeeeeeeeeeeee', response.data);
      if (response.data.length > 0) {
        $scope.pageData = response.data[0];
        $scope.typ = 'page'
      } else {
        $http({
          method: 'GET',
          url: '/api/PIM/blog/?shortUrl__icontains=' + $scope.title + '&homeBlog'
        }).
        then(function(response) {
          console.log('bloggggggggggggg', response.data);
          if (response.data.length > 0) {
            $scope.blogData = response.data[0]
            $scope.typ = 'blog'
          } else {
            $scope.typ = 'nothing'
          }
        }, function(err) {
          $scope.typ = 'nothing'
          $state.go('ecommerce', {})
        })
      }
    })
  }


});

app.controller('controller.ecommerce.details', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash, $window, ngMeta, $filter, Flash) {

  $scope.me = $users.get('mySelf');
  $scope.showRatings = false
  console.log('paramssssssss', $scope.me, $state.params);
  document.title = $state.params.name + ' Online At Best Price Only On Sterling Select'
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=rating').
  then(function(response) {
    console.log('ratingggggggggggggggggggg', response.data);
    if (response.data[0] != null) {
      if (response.data[0].flag) {
        $scope.showRatings = true
      }
    }
  })
  $scope.showDescription = false
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=description').
  then(function(response) {
    console.log('ratingggggggggggggggggggg', response.data);
    if (response.data[0] != null) {
      if (response.data[0].flag) {
        $scope.showDescription = true
      }
    }
    console.log($scope.showDescription);
  })

  $scope.next = ''
  $scope.data = $scope.$parent.data; // contains the pickUpTime , location and dropInTime'
  console.log($scope.data);
  $scope.breadcrumbList = [];
  $scope.details = {};
  $window.scrollTo(0, 0)
  $scope.offset = 0
  $scope.reviews = []
  $scope.showOptions = true
  // $scope.prodVariant = ''
  $scope.getRatings = function(offset) {
    $http({
      method: 'GET',
      url: '/api/ecommerce/rating/?productDetail=' + $scope.details.pk + '&limit=4&offset=' + offset
    }).
    then(function(response) {
      $scope.reviews = response.data.results
      $scope.next = response.data.next
    });
  }
  $http({
    method: 'GET',
    url: '/api/ecommerce/listingLite/' + $state.params.id + '/'
  }).
  then(function(response) {
    $scope.details = response.data

    // for (var i = 0; i < $scope.details.product_variants.length; i++) {
    //   if ($scope.details.product_variants[i].sku == $state.params.sku) {
    //     $scope.prodVariant = $scope.details.product_variants[i]
    //   }
    // }

    // if (!$scope.me) {
    //   if ($rootScope.addToCart != undefined) {
    //     for (var i = 0; i < $rootScope.addToCart.length; i++) {
    //       if ($rootScope.addToCart[i].prodSku == $scope.details.prodSku) {
    //         $scope.details.added_cart = $rootScope.addToCart[i].qty
    //       }
    //     }
    //   }
    // }
    if ($rootScope.multiStore) {
      for (var i = 0; i < $scope.details.product.storeQty.length; i++) {
        if ($scope.details.product.storeQty[i].store.pincode == $rootScope.pin) {
          if ($scope.details.product.storeQty[i].quantity <= 0) {
            $scope.showOptions = false
          }
        }
      }
    } else {
      if ($scope.details.product.inStock <= 0) {
        $scope.showOptions = false
      }
    }
    console.log(response.data);
    console.log(response.data.product.description);
    document.querySelector('meta[name="description"]').setAttribute("content", response.data.product.description)
    $scope.details.specifications = JSON.parse($scope.details.specifications);
    var parent = response.data.parentType
    while (parent) {
      $scope.breadcrumbList.push(parent.name)
      parent = parent.parent
    }
    $scope.getRatings($scope.offset)
    if ($rootScope.multiStore) {
      lurl = '/api/ecommerce/listingLite/?parentValue=' + $scope.details.parentType.pk + '&detailValue=' + $scope.details.pk + '&pin=' + $rootScope.pin + '&multipleStore'
    } else {
      lurl = '/api/ecommerce/listingLite/?parentValue=' + $scope.details.parentType.pk + '&detailValue=' + $scope.details.pk
    }
    $http({
      method: 'GET',
      url: lurl
    }).
    then(function(response) {
      console.log("ghhhghfhfhffgfgfdfg");
      $scope.suggest = response.data
    });
  });

  $timeout(function() {
    $scope.breadcrumbList = $scope.breadcrumbList.slice().reverse();
  }, 1000);


  $scope.ratings = {
    meta: [5, 4, 3, 2, 1],
    counts: [15, 10, 1, 1, 1],
    averageRating: 4.5
  };
  $scope.form = {
    rating: '',
    reviewText: '',
    reviewHeading: '',
    reviewEditor: false,
    ratable: true
  }

  $scope.pictureInView = 0;

  $scope.changePicture = function(pic) {
    $scope.pictureInView = pic;
  }



  $scope.addToCart = function(inputPk) {
    // $http({
    //   method: 'GET',
    //   url: '/api/ecommerce/cart/?user=' + $scope.me.pk
    // }).
    // then(function(response) {
    //   for (var i = 0; i < response.data.length; i++) {
    //     if (response.data[i].product.pk == dataToSend.product) {
    //       if (response.data[i].typ == 'cart') {
    //         Flash.create('warning', 'This Product is already in cart');
    //         return
    //       } else if (response.data[i].typ == 'favourite') {
    //         console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
    //         $http({
    //           method: 'PATCH',
    //           url: '/api/ecommerce/cart/' + response.data[i].pk + '/',
    //           data: {
    //             qty: 1,
    //             typ: 'cart'
    //           }
    //         }).
    //         then(function(response) {
    //           Flash.create('success', 'Product added to cart');
    //           $rootScope.inCart.push(response.data);
    //         })
    //         response.data[i].typ = 'cart'
    //         return
    //       }
    //     }
    //   }
    dataToSend = {
      product: inputPk,
      user: getPK($scope.me.url),
      qty: 1,
      typ: 'cart'
    }
    if ($scope.prodVariant == '') {
      dataToSend.prodSku = $scope.details.product.serialNo
    } else {
      dataToSend.prodSku = $scope.selectedProdVar.sku
    }

    $http({
      method: 'POST',
      url: '/api/ecommerce/cart/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', 'Product added in cart');
      $scope.details.added_cart = 1

      var prod_variants = response.data.product.product_variants
      for (var i = 0; i < prod_variants.length; i++) {
        if (prod_variants[i].sku == response.data.prodSku) {
          response.data.prod_var = prod_variants[i]
        }
      }


      $rootScope.inCart.push(response.data);
      return
    })
    // })
  }

  $scope.increment = function(inputPk) {

    for (var i = 0; i < $rootScope.inCart.length; i++) {
      if ($rootScope.inCart[i].prodSku == $scope.selectedProdVar.sku) {
        if ($rootScope.inCart[i].typ == 'cart') {
          console.log($rootScope.inCart[i]);
          // if ($rootScope.inCart[i].prodSku!=$scope.selectedProdVar.sku) {
          //   Flash.create('warning' , 'You cant buy product and combo together')
          //   return
          // }

          $rootScope.inCart[i].qty = $rootScope.inCart[i].qty + 1;
          $http({
            method: 'PATCH',
            url: '/api/ecommerce/cart/' + $rootScope.inCart[i].pk + '/',
            data: {
              qty: $rootScope.inCart[i].qty
            }
          }).
          then(function(response) {})


        }
      }
    }
    $scope.details.added_cart++
  }
  $scope.decrement = function(inputPk) {
    $scope.details.added_cart--
      for (var i = 0; i < $rootScope.inCart.length; i++) {
        if ($rootScope.inCart[i].prodSku == $scope.selectedProdVar.sku) {
          if ($rootScope.inCart[i].typ == 'cart') {
            if ($scope.details.added_cart == 0) {
              $rootScope.inCart[i].qty = $rootScope.inCart[i].qty - 1;
              $http({
                method: 'DELETE',
                url: '/api/ecommerce/cart/' + $rootScope.inCart[i].pk + '/',
              }).
              then(function(response) {
                Flash.create('success', 'Removed From Cart');

              })
              $rootScope.inCart.splice(i, 1)
              $scope.details.added_saved = 0
            } else if ($scope.details.added_cart != 0) {
              $rootScope.inCart[i].qty = $rootScope.inCart[i].qty - 1;
              $http({
                method: 'PATCH',
                url: '/api/ecommerce/cart/' + $rootScope.inCart[i].pk + '/',
                data: {
                  qty: $rootScope.inCart[i].qty
                }
              }).
              then(function(response) {})

            }
          }
        }
      }
  }


  $scope.buy = function(input) {
    console.log(input);
    $state.go('checkout', {
      pk: input.pk
    })
  }



  $scope.sendReview = function() {

    // if (mode == 'rating') {
    if ($scope.form.rating == '') {
      Flash.create('danger', 'Please provide rating')
    }
    // } else {
    if ($scope.form.reviewText == '') {
      Flash.create('danger', 'No review heading to post')
      return;
    }
    if ($scope.form.reviewHeading == '') {
      Flash.create('danger', 'No review to post')
      return;
    }
    //post request
    var toSend = {
      rating: $scope.form.rating,
      textVal: $scope.form.reviewText,
      headingVal: $scope.form.reviewHeading,
      // user:$scope.me.pk,
      productDetail: $scope.details.pk
    }
    $http({
      method: 'POST',
      url: '/api/ecommerce/rating/',
      data: toSend
    }).
    then(function(response) {
      if ($scope.reviews.length < 4) {
        $scope.reviews.push(response.data)
      } else {
        $scope.offset += 4
        $scope.getRatings($scope.offset)
      }
      Flash.create('success', 'Your review is added')
      $scope.form.rating = 0
      $scope.form.reviewText = ''
      $scope.form.reviewHeading = ''

    })

  }

  $scope.nextReviews = function() {
    $scope.offset = $scope.offset + 4
    $scope.getRatings($scope.offset)

  }
  $scope.prevReviews = function() {
    $scope.offset = $scope.offset - 4
    $scope.getRatings($scope.offset)

  }


  // $scope.getSuggestion = function() {
  //
  // }




  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    console.log(decodedCookie, 'hhhhhhhhhhhhhhhhhhhhhh');
    var ca = decodedCookie.split(';');
    console.log(ca);
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }


  function setCookie(cname, cvalue, exdays) {
    console.log('set cookie');
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }


  $scope.incrementCookie = function(details) {
    $scope.details.added_cart++
      for (var i = 0; i < $rootScope.addToCart.length; i++) {
        console.log(details.pk, 'aaaaaaaaaaaaa');
        if ($rootScope.addToCart[i].prodSku == $scope.selectedProdVar.sku) {
          $rootScope.addToCart[i].qty = $rootScope.addToCart[i].qty + 1
          setCookie("addToCart", JSON.stringify($rootScope.addToCart), 365);
        }
      }
  }

  $scope.decrementCookie = function(details) {
    console.log("aaaaaaaaaaaaaaaaaaa");
    $scope.details.added_cart--
      for (var i = 0; i < $rootScope.addToCart.length; i++) {
        if ($rootScope.addToCart[i].prodSku == $scope.selectedProdVar.sku) {
          // $rootScope.addToCart[i].qty = $rootScope.addToCart[i].qty-1
          // setCookie("addToCart", JSON.stringify($rootScope.addToCart) , 365);
          if ($scope.details.added_cart == 0) {
            setCookie("addToCart", "", -1, '/');
            $rootScope.addToCart.splice(i, 1);
            setCookie("addToCart", JSON.stringify($rootScope.addToCart), 365);
            return
          } else {
            $rootScope.addToCart[i].qty = $rootScope.addToCart[i].qty - 1
            setCookie("addToCart", JSON.stringify($rootScope.addToCart), 365);
            return
          }
        }
      }
  }


  $scope.recentlyViewed = {}
  if ($scope.me != null) {
    if ($rootScope.multiStore) {
      rurl = '/api/ecommerce/activities/?user=' + $scope.me.pk + '&typ=productView&limit=2' + '&pin=' + $rootScope.pin + '&multipleStore'
    } else {
      rurl = '/api/ecommerce/activities/?user=' + $scope.me.pk + '&typ=productView&limit=2'
    }
    $http({
      method: 'GET',
      url: rurl
    }).
    then(function(response) {
      console.log(response.data.results);
      if (response.data.results.length > 0) {
        if (response.data.results[0].product.pk == $scope.details.pk) {
          if (response.data.results.length > 1) {
            $scope.recentlyViewed = response.data.results[1]
            console.log($scope.recentlyViewed.product.files, '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');

          }
        } else {
          $scope.recentlyViewed = response.data.results[0]
          console.log($scope.recentlyViewed, 'kkkkkkkkkkkkkkkkkkkkkkk');

        }
      }

    })
  } else {
    detail = getCookie("unknownUserRecentViewed");
    if (detail != "") {
      console.log('already there');
      $scope.recentlyViewed = JSON.parse(detail)
      $http({
        method: 'GET',
        url: '/api/ecommerce/listing/' + $scope.recentlyViewed.product + '/'
      }).
      then(function(response) {
        $scope.recentlyViewed.product = response.data
        console.log("hhhhhhhhhhhhhhhhhhh", $scope.recentlyViewed.product);

      })
    }
  }
  setTimeout(function() {
    console.log($scope.recentlyViewed);
  }, 1000);



  $scope.createCookieDetail = function(product) {
    console.log(product, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    if ($rootScope.addToCart != undefined) {
      for (var i = 0; i < $rootScope.addToCart.length; i++) {
        if ($rootScope.addToCart[i].prodSku == $scope.selectedProdVar.sku) {
          Flash.create("warning", "Product Already in Cart")
          return
        }
      }
    }

    $scope.details.added_cart++
      $scope.item = {'productName':$scope.details.product.name,'qty':1 , 'prodSku': $scope.selectedProdVar.sku , 'prod_howMuch':$scope.selectedProdVar.qty , 'price':$scope.selectedProdVar.amnt ,'unit':$scope.selectedProdVar.unit , 'prodPk': $scope.details.pk}

      // $scope.item = {
      //   'product': product,
      //   'qty': 1
      // }
    detail = getCookie("addToCart");
    $rootScope.addToCart = []
    if (detail != "") {
      console.log('already there');
      $rootScope.addToCart = JSON.parse(detail)
      document.cookie = encodeURIComponent("addToCart") + "=deleted; expires=" + new Date(0).toUTCString()
    }
    $rootScope.addToCart.push($scope.item)
    setCookie("addToCart", JSON.stringify($rootScope.addToCart), 365);
  }




  $scope.getProdVar = function() {

    $scope.prod_var = $scope.details.product_variants;
    $scope.prodVarList = []
    $scope.details.product.unit = $filter('getUnit')($scope.details.product.unit);
    var str = $filter('convertUnit')($scope.details.product.howMuch, $scope.details.product.unit) + ' - Rs ' + $scope.details.product.discountedPrice
    $scope.prodVarList = [{
      str: str,
      qty: $scope.details.product.howMuch,
      amnt: $scope.details.product.discountedPrice,
      unit: $scope.details.product.unit,
      sku: $scope.details.product.serialNo
    }];

    if ($scope.prod_var) {
      for (var i = 0; i < $scope.prod_var.length; i++) {
        str = $filter('convertUnit')($scope.prod_var[i].unitPerpack * $scope.details.product.howMuch, $scope.details.product.unit) + ' - Rs ' + $scope.prod_var[i].price
        $scope.prodVarList.push({
          str: str,
          qty: $scope.prod_var[i].unitPerpack * $scope.details.product.howMuch,
          amnt: $scope.prod_var[i].price,
          unit: $scope.details.product.unit,
          sku: $scope.prod_var[i].sku,
          disc: $scope.prod_var[i].discountedPrice
        })
      }
    }

    console.log($state.params.sku);
    for (var i = 0; i < $scope.prodVarList.length; i++) {
      console.log($scope.prodVarList);
      if ($scope.prodVarList[i].sku == $state.params.sku) {
        console.log($state.params.sku);
        $scope.selectedProdVar = $scope.prodVarList[i];
      } else {
        $scope.selectedProdVar = $scope.prodVarList[0];
      }
    }


    console.log($scope.selectedProdVar);

    $scope.$watch('selectedProdVar', function(newValue, oldValue) {
      if ($scope.selectedProdVar.qty != null) {
        $scope.quantity = $filter('convertUnit')($scope.selectedProdVar.qty, $scope.selectedProdVar.unit);
      }
      console.log($scope.quantity, 'rrrr');

      if (newValue.sku != undefined) {

        if ($scope.me) {
          for (var i = 0; i < $rootScope.inCart.length; i++) {
            if (newValue.sku == $rootScope.inCart[i].prodSku) {
              console.log($rootScope.inCart[i].qty, 'if');
              $scope.details.added_cart = $rootScope.inCart[i].qty
              return
            } else {
              $scope.details.added_cart = 0
            }
          }
        }else {
          for (var i = 0; i < $rootScope.addToCart.length; i++) {
            if (newValue.sku == $rootScope.addToCart[i].prodSku) {
              console.log($rootScope.addToCart[i].qty, 'if');
              $scope.details.added_cart = $rootScope.addToCart[i].qty
              return
            } else {
              $scope.details.added_cart = 0
            }
          }
        }




        if ($scope.details.product.serialNo == newValue.sku) {
          console.log('parent');

          // $scope.list.price = $scope.list.product.discountedPrice
        } else {
          // $scope.list.product.price = newValue.amnt
          console.log('child');

          $scope.details.price = newValue.amnt
        }
      }
    })

  }


  $timeout(function() {
    $scope.getProdVar()
  }, 800);






});


app.controller('controller.ecommerce.categories', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash, $window) {
  $scope.showFilter = false
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=filter').
  then(function(response) {
    console.log('ratingggggggggggggggggggg', response.data);
    if (response.data[0] != null) {
      if (response.data[0].flag) {
        $scope.showFilter = true
      }
    }
  })
  $scope.data = $scope.$parent.data; // contains the pickUpTime , location and dropInTime
  $window.scrollTo(0, 0)
  $scope.minValue;
  $scope.maxValue
  console.log($state.params);
  document.title = $state.params.name.split('_').join(' ') + ' | Buy ' + $state.params.name.split('_').join(' ') + ' At Best Price In India | Sterling Select'
  document.querySelector('meta[name="description"]').setAttribute("content", 'Sterling Select Online Shopping')


  $scope.slider = {
    minValue: 200,
    maxValue: 600,
    options: {
      floor: 0,
      ceil: 1000,
      step: 10,
      noSwitching: true,
      translate: function(value) {
        return '₹' + value;
      }
    }
  };


  $scope.breadcrumbList = [];
  $scope.category = {}
  $scope.fields;


  $http({
    method: 'GET',
    url: '/api/ecommerce/genericProduct/?name__iexact=' + $state.params.name.split('_').join(' ')
  }).
  then(function(response) {
    $scope.category = response.data[0];
    $scope.fields = $scope.category.fields;
    $scope.category.fields = [];
    var parent = response.data[0].parent
    while (parent) {
      $scope.breadcrumbList.push(parent.name)
      parent = parent.parent
    }
    if ($rootScope.multiStore) {
      gurl = '/api/ecommerce/genericProduct/?genericValue=' + response.data[0].pk + '&pin=' + $rootScope.pin + '&multipleStore'
    } else {
      gurl = '/api/ecommerce/genericProduct/?genericValue=' + response.data[0].pk
    }
    $http({
      method: 'GET',
      url: gurl,
    }).
    then(function(response) {
      console.log(response.data);
      $scope.categories = response.data;

    })

  });

  $scope.choices = {};

  $timeout(function() {
    $scope.category.fields = $scope.fields;
    for (var i = 0; i < $scope.category.fields.length; i++) {
      if ($scope.category.fields[i].data) {
        $scope.category.fields[i].data = JSON.parse($scope.category.fields[i].data)
      }
      if ($scope.category.fields[i].fieldType == 'choice') {
        for (var j = 0; j < $scope.category.fields[i].data.length; j++) {
          // console.log($scope.category.fields[i].data[j]);
          $scope.category.fields[i].data[j] = {
            name: $scope.category.fields[i].data[j],
            selected: false
          }
          // $scope.category.fields[i].choices.push()
        }
      }
      $scope.category.fields[i].val = '';
    }

    if ($rootScope.multiStore) {
      lurl = '/api/ecommerce/listing/?parent=' + $scope.category.pk + '&recursive=1' + '&pin=' + $rootScope.pin + '&multipleStore'
    } else {
      lurl = '/api/ecommerce/listing/?parent=' + $scope.category.pk + '&recursive=1'
    }

    $http({
      method: 'GET',
      url: lurl
    }).
    then(function(response) {
      $scope.listingSearch = response.data;

      if ($rootScope.addToCart.length > 0) {
        console.log("gggggggggggggggggggggggggggggggggggggg");
        for (var i = 0; i < $rootScope.addToCart.length; i++) {
          for (var j = 0; j < $scope.listingSearch.length; j++) {
            if ($scope.listingSearch[j].pk == $rootScope.addToCart[i].product.pk) {
              $scope.listingSearch[j].added_cart = $rootScope.addToCart[i].qty
            }
          }
        }
      }
    })
    $scope.breadcrumbList = $scope.breadcrumbList.slice().reverse();
  }, 1500);






  $scope.filter = function() {

    params = {
      minPrice: $scope.slider.minValue,
      maxPrice: $scope.slider.maxValue,
      fields: {},
      sort: $scope.data.sort
    }

    for (var i = 0; i < $scope.category.fields.length; i++) {
      if ($scope.category.fields[i].fieldType == 'choice') {
        var arr = []
        for (var j = 0; j < $scope.category.fields[i].data.length; j++) {
          if ($scope.category.fields[i].data[j].selected) {
            arr.push($scope.category.fields[i].data[j].name)
          }
        }
        if (arr.length > 0) {
          var a = $scope.category.fields[i].name
          // params.fields.push({a : arr})
          params.fields[a] = arr
        }
      } else {
        if ($scope.category.fields[i].val) {
          var a = $scope.category.fields[i].name
          // params.fields.push({a : $scope.category.fields[i].val})
          params.fields[a] = $scope.category.fields[i].val
        }
      }
    }

    console.log("gggggggggggggggggggggggggggg");
    console.log($scope.category.pk, 'aaaaaaaaaaaaaaaaaaaaaaa');
    if ($rootScope.multiStore) {
      lurl = '/api/ecommerce/listing/?parent=' + $scope.category.pk + '&recursive=1' + '&pin=' + $rootScope.pin + '&multipleStore'
    } else {
      lurl = '/api/ecommerce/listing/?parent=' + $scope.category.pk + '&recursive=1'
    }
    $http({
      method: 'GET',
      url: lurl,
      params: params
    }).
    then(function(response) {
      $scope.listingSearch = response.data;

      if ($rootScope.addToCart.length > 0) {
        console.log("gggggggggggggggggggggggggggggggggggggg");
        for (var i = 0; i < $rootScope.addToCart.length; i++) {
          for (var j = 0; j < $scope.listingSearch.length; j++) {
            if ($scope.listingSearch[j].pk == $rootScope.addToCart[i].product.pk) {
              $scope.listingSearch[j].added_cart = $rootScope.addToCart[i].qty
            }
          }
        }
      }
    })
  }

});



app.controller('controller.ecommerce.account', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash) {
  // for the dashboard of the account tab
});

app.controller('controller.ecommerce.account.cart', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash, $rootScope, $filter) {
  $scope.data = {
    tableData: [],
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.account.cart.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/ecommerce/cart/',
    // searchField: 'product__product__name',
    getParams: [{
      key: 'user',
      value: $scope.me.pk
    }, {
      key: 'typ',
      value: 'cart'
    }],
    deletable: true,
    itemsNumPerView: [8, 16, 32],
  }

  console.log('in cartttttttttt', $rootScope.inCart);
  document.title = 'Sterling Select | Shopping Cart'
  document.querySelector('meta[name="description"]').setAttribute("content", 'Sterling Select Online Shopping')

  // $timeout(function () {
  //   for (var i = 0; i < $scope.data.tableData.length; i++) {
  //     var prod_variants = $scope.data.tableData[i].product.product_variants
  //     for (var j = 0; j < prod_variants.length; j++) {
  //       if (prod_variants[j].sku == $scope.data.tableData[i].prodSku) {
  //         $scope.data.tableData[i].prod_var = prod_variants[j]
  //         console.log($scope.data.tableData[i].prod_var);
  //       }
  //     }
  //   }
  // }, 1000);

  $scope.tableAction = function(target, action, mode) {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'deleteItem') {
          console.log("kkkkkkkkkkkkkkkkkk", $scope.data.tableData[i].pk);
          $http({
            method: 'DELETE',
            url: '/api/ecommerce/cart/' + $scope.data.tableData[i].pk + '/'
          }).
          then(function(response) {
            Flash.create('success', 'Item removed from cart');
          })
          $scope.data.tableData.splice(i, 1)
          $rootScope.inCart.splice(i, 1)
          // $scope.calcTotal();
        } else if (action == 'addQty') {
          $scope.data.tableData[i].qty = $scope.data.tableData[i].qty + 1;
          $http({
            method: 'PATCH',
            url: '/api/ecommerce/cart/' + $scope.data.tableData[i].pk + '/',
            data: {
              qty: $scope.data.tableData[i].qty
            }
          }).
          then(function(response) {})
          // $scope.calcTotal();
        } else if (action == 'substractQty') {
          $scope.data.tableData[i].qty = $scope.data.tableData[i].qty - 1;
          $http({
            method: 'PATCH',
            url: '/api/ecommerce/cart/' + $scope.data.tableData[i].pk + '/',
            data: {
              qty: $scope.data.tableData[i].qty
            }
          }).
          then(function(response) {})
          // $scope.calcTotal();
        } else if (action == 'favourite') {
          console.log("aaaaaaaaaaaaaaaaaa");
          $http({
            method: 'PATCH',
            url: '/api/ecommerce/cart/' + $scope.data.tableData[i].pk + '/',
            data: {
              typ: 'favourite'
            }
          }).
          then(function(response) {$rootScope.inFavourite.push(response.data)})
          $scope.data.tableData[i].typ = 'favourite';
          $scope.data.tableData.splice(i, 1)
          $rootScope.inCart.splice(i, 1)

        } else if (action == 'unfavourite') {
          console.log("aaaaaaaaaaaaaaaaaa");
          $http({
            method: 'PATCH',
            url: '/api/ecommerce/cart/' + $scope.data.tableData[i].pk + '/',
            data: {
              typ: 'cart'
            }
          }).
          then(function(response) {})
          $scope.data.tableData[i].typ = 'cart';
        }
      }
    }
  }


  console.log($scope.data.tableData.length, 'kkkkkkkkkkggggggggkkkkkkkkkkk');





  $scope.calcTotal = function() {
    $scope.total = 0;
    var price = 0;
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].prodSku != $scope.data.tableData[i].product.product.serialNo) {
        price = $scope.data.tableData[i].prodVarPrice
      } else {
        price = $scope.data.tableData[i].product.product.discountedPrice
      }
      $scope.total = $scope.total + (price * $scope.data.tableData[i].qty)
    }
    return $scope.total
  }



  $scope.checkout = function() {
    $state.go('checkout', {
      pk: 'cart'
    })
  }

});

app.controller('controller.ecommerce.account.saved', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash, $filter) {

  console.log('coming in save controller..');

  $scope.data = {
    tableData: [],
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.account.saved.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/ecommerce/cart/',
    searchField: 'Name',
    getParams: [{
      key: 'user',
      value: $scope.me.pk
    }, {
      key: 'typ',
      value: 'favourite'
    }],
    deletable: true,
    itemsNumPerView: [8, 16, 32],
  }
  console.log($scope.data.tableData);
  document.title = 'Sterling Select | Saved Products'
  document.querySelector('meta[name="description"]').setAttribute("content", 'Sterling Select Online Shopping')
  $scope.tableAction = function(target, action, mode) {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'unfavourite') {
          $http({
            method: 'PATCH',
            url: '/api/ecommerce/cart/' + $scope.data.tableData[i].pk + '/',
            data: {
              typ: 'cart',
              qty: 1
            }
          }).
          then(function(response) {
              console.log(response.data,'kkkkkkkkkkkkkkkkkk');
              $rootScope.inCart.push(response.data)
          })
          $scope.data.tableData.splice(i, 1)
          $rootScope.inFavourite.splice(i, 1)
        } else if (action == 'deleteItem') {
          console.log("jjjjjjjjjjjjjjjjjjjj");
          $http({
            method: 'DELETE',
            url: '/api/ecommerce/cart/' + $scope.data.tableData[i].pk + '/'
          }).
          then(function(response) {
            Flash.create('success', 'Item removed from favourite');
          })
          $scope.data.tableData.splice(i, 1)
          $rootScope.inFavourite.splice(i, 1)
          // $rootScope.inCart.splice(i, 1)
          // $scope.calcTotal();
        }
      }
    }

  }



});

app.controller('controller.ecommerce.account.saved.item', function($scope, $rootScope, $http, $state) {})

app.controller('controller.ecommerce.account.cart.item', function($scope, $rootScope, $http, $state) {

})

app.controller('controller.ecommerce.account.orders', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash) {



  $scope.data = {
    tableData: [],
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.account.orders.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/ecommerce/order/',
    searchField: 'status',
    getParams: [{
      key: 'user',
      value: $scope.me.pk
    }],
    deletable: true,
    itemsNumPerView: [4, 16, 32],
  }



  $timeout(function() {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      $scope.data.tableData[i].showInfo = false;
      for (var j = 0; j < $scope.data.tableData[i].orderQtyMap.length; j++) {
        $scope.data.tableData[i].orderQtyMap[j].selected = false;
      }
    }
  }, 1500);


  document.title = 'Sterling Select | My Orders'
  document.querySelector('meta[name="description"]').setAttribute("content", 'Sterling Select Online Shopping')

  $scope.tableAction = function(target, action, mode) {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {

        if (action == 'toggleInfo') {
          $scope.data.tableData[i].showInfo = !$scope.data.tableData[i].showInfo;
        } else if (action == 'cancel') {

          $scope.itemsToBeDeleted = [];


          for (var j = 0; j < $scope.data.tableData[i].orderQtyMap.length; j++) {
            if ($scope.data.tableData[i].orderQtyMap[j].selected == true) {
              if ($scope.data.tableData[i].orderQtyMap[j].status == 'created' || $scope.data.tableData[i].orderQtyMap[j].status == 'packed') {
                $scope.itemsToBeDeleted.push($scope.data.tableData[i].orderQtyMap[j])
              } else {
                // $scope.data.tableData[i].orderQtyMap[j].selected = false;
                Flash.create('warning', 'selected items cant be cancelled')
                return
              }
            }
          }

          if ($scope.itemsToBeDeleted.length > 0) {
            $uibModal.open({
              templateUrl: '/static/ngTemplates/app.ecommerce.orders.cancelModalWindow.html',
              size: 'md',
              backdrop: true,
              resolve: {
                items: function() {
                  return $scope.itemsToBeDeleted;
                }
              },
              controller: function($scope, items, $state, $http, $timeout, $uibModal, $users, Flash, $uibModalInstance) {
                console.log('in modal windddddddd', items);
                $scope.state = 'cancel';
                $scope.items = items;
                $scope.amtToBeRefunded = 0;

                for (var i = 0; i < $scope.items.length; i++) {
                  $scope.amtToBeRefunded = $scope.amtToBeRefunded + ($scope.items[i].ppAfterDiscount.toFixed(2) * $scope.items[i].qty)
                }

                $scope.cancel = function() {
                  for (var i = 0; i < $scope.items.length; i++) {
                    var pk = $scope.items[i].pk
                    $http({
                      method: 'PATCH',
                      url: '/api/ecommerce/orderQtyMap/' + pk + '/',
                      data: {
                        status: 'cancelled'
                      }
                    }).
                    then(function(response) {
                      var toSend = {
                        value: response.data.pk
                      };
                      $http({
                        method: 'POST',
                        url: '/api/ecommerce/sendStatus/',
                        data: toSend
                      }).
                      then(function(response) {})
                      $rootScope.$broadcast('forceRefetch', {});
                      Flash.create('success', 'selected items cancelled')
                      $uibModalInstance.close();
                    })
                  }
                }

              },
            }).result.then(function() {

            }, function() {

            });
          } else {
            Flash.create('warning', 'Please select items to cancel')
          }


        } else if (action == 'return') {

          $scope.itemsToBeReturned = [];

          for (var j = 0; j < $scope.data.tableData[i].orderQtyMap.length; j++) {
            if ($scope.data.tableData[i].orderQtyMap[j].selected == true) {
              if ($scope.data.tableData[i].orderQtyMap[j].status == 'delivered') {
                $scope.itemsToBeReturned.push($scope.data.tableData[i].orderQtyMap[j])
              } else {
                // $scope.data.tableData[i].orderQtyMap[j].selected = false;
                Flash.create('warning', 'selected items cant be returned')
                return
              }
            }
          }

          if ($scope.itemsToBeReturned.length > 0) {
            console.log($scope.itemsToBeReturned);
            $uibModal.open({
              templateUrl: '/static/ngTemplates/app.ecommerce.orders.cancelModalWindow.html',
              size: 'md',
              backdrop: true,
              resolve: {
                items: function() {
                  return $scope.itemsToBeReturned;
                }
              },
              controller: function($scope, items, $state, $http, $timeout, $uibModal, $users, Flash, $uibModalInstance) {
                console.log('in modal windddddddd', items);
                $scope.state = 'return';
                $scope.items = items;
                $scope.amtToBeRefunded = 0;

                for (var i = 0; i < $scope.items.length; i++) {
                  $scope.amtToBeRefunded = $scope.amtToBeRefunded + (($scope.items[i].totalAmount - $scope.items[i].discountAmount) * $scope.items[i].qty)
                }

                $scope.return = function() {
                  for (var i = 0; i < $scope.items.length; i++) {
                    var pk = $scope.items[i].pk
                    $http({
                      method: 'PATCH',
                      url: '/api/ecommerce/orderQtyMap/' + pk + '/',
                      data: {
                        status: 'returned'
                      }
                    }).
                    then(function(response) {
                      console.log(response.data);
                      var toSend = {
                        value: response.data.pk
                      };
                      $http({
                        method: 'POST',
                        url: '/api/ecommerce/sendStatus/',
                        data: toSend
                      }).
                      then(function(response) {})
                      $rootScope.$broadcast('forceRefetch', {});
                      Flash.create('success', 'selected items returned')
                      $uibModalInstance.close();
                    })
                  }

                }

              },
            }).result.then(function() {

            }, function() {

            });
          } else {
            Flash.create('warning', 'Please select item to return')
          }


        }

      }
    }
  }

});

app.controller('controller.ecommerce.account.settings', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash) {
  $scope.me = $users.get('mySelf');
  document.title = 'Sterling Select | My Settings'
  document.querySelector('meta[name="description"]').setAttribute("content", 'Sterling Select Online Shopping')
  $scope.refresh = function() {
    $scope.form = {
      title: '',
      landMark: '',
      street: '',
      city: '',
      state: '',
      pincode: null,
      country: 'India',
      primary: false
    }
  }
  $scope.refresh()
  $scope.update = function(idx) {
    $scope.form = $scope.savedAddress[idx]
    if ($scope.savedAddress[idx].pk == $scope.pa) {
      $scope.form.primary = true
    } else {
      $scope.form.primary = false
    }
    // $scope.savedAddress.splice(idx, 1)
  }

  $scope.delete = function(idx) {
    console.log($scope.savedAddress[idx]);
    $http({
      method: 'DELETE',
      url: '/api/ecommerce/address/' + $scope.savedAddress[idx].pk + '/'
    }).
    then(function(response) {
      $scope.savedAddress.splice(idx, 1)
      Flash.create('success', "Address Deleted");
    })
  }

  $scope.showMessage = false
  $scope.$watch('form.pincode', function(newValue, oldValue) {
    if (newValue != null) {
      if (newValue.length == 6) {
        $http({
          method: 'GET',
          url: '/api/ecommerce/genericPincode/?pincode__iexact=' + newValue
        }).
        then(function(response) {
          if (response.data.length > 0) {
            $scope.showMessage = false
            $scope.form.city = response.data[0].city
            $scope.form.state = response.data[0].state
          } else {
            $scope.showMessage = true
          }
          $http({
            method: 'GET',
            url: '/api/ecommerce/addPincode/?pincodes__iexact=' + newValue
          }).
          then(function(response) {
            if (response.data.length == 0) {
              $scope.showMessage = true
            }
          })
        })
      } else if (newValue.length < 6) {
        $scope.showMessage = false
        $scope.form.city = ''
        $scope.form.state = ''
      }
    }
  })







  $scope.fetchaddress = function() {
    $http({
      method: 'GET',
      url: '/api/ecommerce/address/?user=' + $scope.me.pk
    }).
    then(function(response) {
      $scope.savedAddress = response.data
      $scope.pa = 0
      for (var i = 0; i < $scope.savedAddress.length; i++) {
        if ($scope.me.profile.primaryAddress == $scope.savedAddress[i].pk) {
          $scope.pa = $scope.savedAddress[i].pk
        }
      }
    })
  }
  $scope.fetchaddress()


  $scope.saveAddress = function() {
    if ($scope.form.title.length == 0 || $scope.form.city.length == 0 || $scope.form.state.length == 0) {
      Flash.create('warning', 'Fill the required Data')
      return
    }
    dataToSend = $scope.form;
    // if ($scope.form.pincode == null) {
    //   delete dataToSend.pincode
    // }
    var method = 'POST'
    var url = '/api/ecommerce/address/'
    if ($scope.form.pk != undefined) {
      method = 'PATCH'
      url = url + $scope.form.pk + '/'
    }
    $http({
      method: method,
      url: url,
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', 'Added');
      $scope.refresh()
      $scope.fetchaddress()
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }

});

app.controller('controller.ecommerce.account.support', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash) {

  document.title = 'Sterling Select | HelpCenter -  FAQ About Contextual Advertising , Online Advertising , Online Ads'
  document.querySelector('meta[name="description"]').setAttribute("content", 'Sterling Select Online Shopping')

  $http({
    method: 'GET',
    url: '/api/ecommerce/frequentlyQuestions/'
  }).
  then(function(response) {
    $scope.fAQ = response.data
  })

  $scope.message = {
    invoiceNo: '',
    subject: '',
    body: ''
  };
  $scope.sendMessage = function() {
    if ($scope.me == undefined || $scope.me == '' || $scope.message.invoiceNo == '' || $scope.message.body == '') {
      Flash.create("warning", "Please add all details")
    } else {
      dataToSend = {
        email: $scope.message.email,
        mobile: $scope.me.profile.mobile,
        invoiceNo: $scope.message.invoiceNo,
        subject: $scope.message.subject,
        message: $scope.message.body
      }
    }
    $http({
      method: 'POST',
      url: '/api/ecommerce/supportFeed/',
      data: dataToSend
    }).
    then(function(response) {
      $scope.message = {
        invoiceNo: '',
        subject: '',
        body: ''
      };
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }


});



app.controller('controller.ecommerce.account', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash) {

});


app.controller('controller.ecommerce.checkout', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash, $filter) {
  $rootScope.totalLimit = false
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=orderLimit').
  then(function(response) {
    if (response.data[0] != null) {
      console.log(response.data[0].value, 'aaaaaaaaaaaaaaaaaa');
      $rootScope.limitValue = parseInt(response.data[0].value)
      console.log(response.data[0].value, 'aaaaaaaaaaaaaaaaaa');
      if (response.data[0].value > 0) {
        if ($scope.totalAfterPromo > $rootScope.limitValue || $scope.totalAfterDiscount > $rootScope.limitValue) {
          $rootScope.totalLimit = true
        } else {
          $rootScope.totalLimit = false
        }
      }
    }
  })

  // if ($scope.dataToSend.modeOfPayment == 'COD') {
  //   if ($scope.totalLimit = true) {
  //     if ($scope.totalAfterPromo > 5000 || $scope.totalAfterDiscount > 5000) {
  //       $scope.warningMessage = true
  //     }
  //     else {
  //       $scope.warningMessage = false
  //       $scope.dataToSend.paidAmount = 0
  //     }
  //   } else {
  //     $scope.warningMessage = false
  //     $scope.dataToSend.paidAmount = 0
  //   }
  // } else {
  //     $scope.warningMessage = false
  //   $scope.dataToSend.paidAmount = 0
  // }
  $scope.me = $users.get('mySelf');
  $scope.data = {
    quantity: 1,
    shipping: 'express',
    stage: 'review',
    promoCode: '',
    modeOfPayment: 'Card',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      mobileNo: $scope.me.profile.mobile,
      landMark: ''
    },
    billingAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      mobileNo: $scope.me.profile.mobile,
      billingLandMark: ''
    }
  };

  $scope.cartProducts = [];
  $scope.itemProduct = [];

  document.title = 'Sterling Select | Review Order > Select Shipping Address > Place Order'
  document.querySelector('meta[name="description"]').setAttribute("content", 'Sterling Select Online Shopping')
  $scope.fetchaddress = function() {
    $http({
      method: 'GET',
      url: '/api/ecommerce/address/?user=' + $scope.me.pk
    }).
    then(function(response) {
      $scope.savedAddress = response.data
      console.log($scope.savedAddress);
      $scope.pa = 0
      console.log($scope.data.address);
      for (var i = 0; i < $scope.savedAddress.length; i++) {
        if ($scope.me.profile.primaryAddress == $scope.savedAddress[i].pk) {
          $scope.pa = $scope.savedAddress[i].pk
          $scope.data.address = $scope.savedAddress[i]
          console.log($scope.data.address);
          if ($scope.data.address.mobileNo == null || $scope.data.address.mobileNo.length == 0) {
            $scope.data.address.mobileNo = $scope.me.profile.mobile
          }
          // $scope.data.address.landMark = ''
        }
      }
    })
  }
  $scope.fetchaddress()
  $scope.saved = false


  $scope.ChangeAdd = function(idx, value) {
    console.log(value);
    if (value == "use") {
      $scope.addressview = false
      $scope.idx = null
      $scope.saved = true
      Flash.create('success', 'Address Added');

    } else if (value == "edit") {
      $scope.idx = null
      $scope.idxVal = idx
      $scope.addressview = true
    }
    // mob = $scope.data.address.mobileNo
    $scope.data.address = $scope.savedAddress[idx]
    if ($scope.data.address.mobileNo == null || $scope.data.address.mobileNo.length == 0) {
      $scope.data.address.mobileNo = $scope.me.profile.mobile
    }
    // $scope.data.address.mobileNo = mob
    // $scope.data.address.landMark = ''
  }
  $scope.change = function() {
    $scope.saved = false
    $scope.data.address = {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      mobileNo: $scope.me.profile.mobile,
      landMark: ''
    }
  }
  $scope.cancel = function() {
    $scope.newAdr = false
    $scope.addressview = false
  }

  $scope.resetAdd = function() {
    $scope.newAdr = true
    $scope.idx = null
    $scope.addressview = false
    $scope.data.address = {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      mobileNo: $scope.me.profile.mobile,
      landMark: ''
    }
  }
  $scope.show = function(idx) {
    $scope.addressview = false
    $scope.idx = idx
    $scope.newAdr = false
  }
  $scope.showMessage = false
  $scope.$watch('data.address.pincode', function(newValue, oldValue) {
    if (newValue != null) {
      if (newValue.length == 6) {
        $http({
          method: 'GET',
          url: '/api/ecommerce/genericPincode/?pincode__iexact=' + newValue
        }).
        then(function(response) {
          if (response.data.length > 0) {
            $scope.showMessage = false
            $scope.data.address.city = response.data[0].city
            $scope.data.address.state = response.data[0].state
          } else {
            $scope.showMessage = true
          }
          $http({
            method: 'GET',
            url: '/api/ecommerce/addPincode/?pincodes__iexact=' + newValue
          }).
          then(function(response) {
            if (response.data.length == 0) {
              $scope.showMessage = true
            }
          })
        })
      } else if (newValue.length < 6) {
        $scope.showMessage = false
        $scope.data.address.city = ''
        $scope.data.address.state = ''
      }
    }
  })

  $scope.$watch('data.billingAddress.pincode', function(newValue, oldValue) {
    if (newValue != null) {
      if (newValue.length == 6) {
        $http({
          method: 'GET',
          url: '/api/ecommerce/genericPincode/?pincode__iexact=' + newValue
        }).
        then(function(response) {
          if (response.data.length > 0) {
            $scope.data.billingAddress.city = response.data[0].city
            $scope.data.billingAddress.state = response.data[0].state
          }
        })
      } else if (newValue.length < 6) {
        $scope.data.billingAddress.city = ''
        $scope.data.billingAddress.state = ''
      }
    }
  })



  $scope.saveAdd = function() {
    if ($scope.data.address.street.length == 0) {
      Flash.create('danger', 'Please Fill Address Details');
      return;
    }
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.ecommerce.checkout.addressmodel.html',
      size: 'md',
      backdrop: true,
      resolve: {
        add: function() {
          return $scope.data.address;
        }
      },
      controller: function($scope, $state, $http, $timeout, $uibModal, $users, Flash, $uibModalInstance, add ) {
        $scope.adrForm = add;
        if ($scope.adrForm.title == undefined) {
          $scope.adrForm.title = ''
        }
        $scope.adrForm.primary = false
        $scope.saveAdrForm = function() {
          if ($scope.adrForm.title.length == 0) {
            Flash.create('danger', 'Please Mention Some Title');
            return;
          }
          if ($scope.adrForm.pincode.length == 0) {
            delete $scope.adrForm.pincode
          }
          var method = 'POST'
          var url = '/api/ecommerce/address/'
          if ($scope.adrForm.pk) {
            method = 'PATCH'
            url += $scope.adrForm.pk + '/'
          }

          $http({
            method: method,
            url: url,
            data: $scope.adrForm
          }).
          then(function(response) {
            Flash.create('success', 'Added');
            $scope.adrForm = response.data
            $uibModalInstance.dismiss($scope.adrForm);
          }, function(response) {
            Flash.create('danger', response.status + ' : ' + response.statusText);
          })

        }
      },
    }).result.then(function() {

    }, function(f) {
      if (typeof(f) != 'string') {
        $scope.data.address.pk = f.pk
        $scope.savedAddress.push($scope.data.address)
      }

    });
  }


  $scope.calcTotal = function() {
    $scope.total = 0;
    $scope.totalAfterDiscount = 0;
    var price = 0;
    var discountedPrice = 0;
    if ($state.params.pk == 'cart') {
      for (var i = 0; i < $scope.cartItems.length; i++) {
        if ($scope.cartItems[i].prodSku == $scope.cartItems[i].product.product.serialNo) {
          price = $scope.cartItems[i].product.product.price
          discountedPrice = $scope.cartItems[i].product.product.discountedPrice
        } else {
          price = $scope.cartItems[i].prodVarPrice
          discountedPrice = $scope.cartItems[i].prod_var.discountedPrice
        }
        $scope.total = $scope.total + (price * $scope.cartItems[i].qty)
        $scope.totalAfterDiscount = $scope.totalAfterDiscount + (discountedPrice * $scope.cartItems[i].qty)
      }
    } else {
      $scope.total = $scope.item.product.price * $scope.item.qty
      $scope.totalAfterDiscount = $scope.item.product.discountedPrice * $scope.item.qty
    }
  }



  if ($state.params.pk == 'cart') {
    $http({
      method: 'GET',
      url: '  /api/ecommerce/cart/?user=' + $scope.me.pk + '&typ=cart'
    }).
    then(function(response) {
      $scope.cartItems = response.data;
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaa");


      for (var i = 0; i < $scope.cartItems.length; i++) {
        var prod_variants = $scope.cartItems[i].product.product_variants
        for (var j = 0; j < prod_variants.length; j++) {
          if (prod_variants[j].sku == $scope.cartItems[i].prodSku) {
            $scope.cartItems[i].prod_var = prod_variants[j]
          }
        }
      }
      $scope.calcTotal();
    })
  } else {
    $http({
      method: 'GET',
      url: '/api/ecommerce/listing/' + $state.params.pk + '/'
    }).
    then(function(response) {
      $scope.item = response.data;
      $scope.item.qty = 1;
      //  $scope.itemProduct.push({pk:$scope.item.pk, qty : $scope.item.qty })
      $scope.calcTotal();
    })
  }

  $scope.changeQty = function() {
    $scope.calcTotal();
  }
  $scope.promoDiscount = 0
  $scope.applyPromo = function() {
    if ($scope.msg == '') {
      return
    }
    $http({
      method: 'GET',
      url: '  /api/ecommerce/promoCheck/?name=' + $scope.data.promoCode
    }).
    then(function(response) {
      $scope.msg = response.data.msg
      if (response.data.msg == 'Success') {
        $scope.promoDiscount = response.data.val;
        $scope.totalAfterPromo = $scope.totalAfterDiscount - ($scope.promoDiscount / 100) * $scope.totalAfterDiscount
      } else {
        $scope.data.promoCode = ''
      }
    })
  }






  $scope.dataToSend = {sameAsShipping:true}

  $scope.$watch('dataToSend.sameAsShipping' , function(newValue , oldValue) {
    console.log(newValue);
    if (newValue == false) {
      $scope.showFields = true;

    }else {
      $scope.showFields = false;
      $scope.dataToSend.billingAddress = ''
    }
  })

  $scope.next = function() {
    console.log($scope.totalAfterPromo, $scope.totalAfterDiscount, '**************************8');
    if ($rootScope.limitValue) {
      if ($scope.totalAfterPromo > $rootScope.limitValue || $scope.totalAfterDiscount > $rootScope.limitValue) {
        $rootScope.totalLimit = true
      } else {
        $rootScope.totalLimit = false
      }
    }
    window.scrollTo(0, 0);
    if ($scope.data.stage == 'review') {
      $scope.dataToSend.promoCode = $scope.data.promoCode;
      $scope.dataToSend.promoCodeDiscount = $scope.promoDiscount;
      console.log($scope.cartItems, $scope.cartProducts, '$$$$$$$$$$$$$$$$$$$');
      if ($scope.cartItems != undefined) {
        for (var i = 0; i < $scope.cartItems.length; i++) {
          for (var j = 0; j < $scope.cartProducts.length; j++) {
            if ($scope.cartProducts[j].prodSku == $scope.cartItems[i].prodSku) {

              $scope.cartProducts.splice(j, 1)
            }
          }
          if ($scope.cartItems[i].product.in_stock == 'false') {
            Flash.create('danger', 'Please Select Valid Products')
            return
          } else {
            if ($scope.cartItems[i].qty <= 0 || $scope.cartItems[i].qty == undefined) {
              Flash.create('danger', 'Please Select Valid quantity')
              return
            } else {
              // var prodSku
              // if ($scope.cartItems[i].prodSku==$scope.cartItems[i].product.product.serialNo) {
              //   prodSku = $scope.cartItems[i].product.product.serialNo
              // }else {
              //     prodSku = $scope.cartItems[i].prodSku
              // }
              $scope.cartProducts.push({
                pk: $scope.cartItems[i].product.pk,
                qty: $scope.cartItems[i].qty,
                prodSku: $scope.cartItems[i].prodSku
              })
            }
          }
        }
        $scope.dataToSend.products = $scope.cartProducts
      } else {
        console.log('direct buyyyyyyyyyyyyyyyyyyyyy');
        for (var i = 0; i < $scope.itemProduct.length; i++) {
          if ($scope.itemProduct[i].pk == $scope.item.pk) {
            console.log('updatinggggggggggggggggg');
            $scope.itemProduct.splice(i, 1)
          }
        }
        $scope.itemProduct.push({
          pk: $scope.item.pk,
          qty: $scope.item.qty,
          prodSku: $scope.item.product.serialNo
        })
        $scope.dataToSend.products = $scope.itemProduct
      }
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa', $scope.dataToSend.products);
      if ($scope.dataToSend.products.length > 0) {
        if ($scope.dataToSend.products[0].pk == undefined) {
          Flash.create('danger', 'Please Select Valid Product')
          return
        }
      } else {
        Flash.create('danger', 'Please Select The Product')
        return
      }
      $scope.data.stage = 'shippingDetails';
    } else if ($scope.data.stage == 'shippingDetails') {


      if ($scope.data.address.mobileNo == '' || $scope.data.address.street == '' || $scope.data.address.city == '' || $scope.data.address.pincode == '' || $scope.data.address.country == '' || $scope.data.address.state == '' || $scope.data.address.landMark == '') {
        Flash.create('warning', 'Please Fill All Details')
        return
      } else {
        $scope.dataToSend.mobile = $scope.me.profile.mobile
        $scope.dataToSend.address = $scope.data.address
        if($scope.dataToSend.sameAsShipping == true){
          $scope.dataToSend.billingAddress = $scope.data.address
        }
        else{
            $scope.dataToSend.billingAddress = $scope.data.billingAddress
        }
      }
      $scope.data.stage = 'payment';

    }
  }

  $scope.prev = function() {
    if ($scope.data.stage == 'shippingDetails') {
      $scope.data.stage = 'review';
    } else if ($scope.data.stage == 'payment') {
      $scope.data.stage = 'shippingDetails';
    } else if ($scope.data.stage == 'onlinePayment') {
      $scope.data.stage = 'payment';
    }
  }

  $scope.pay = function() {
    $scope.data.stage = 'onlinePayment'
  }

  $scope.order = function() {
    console.log("aaaaaaaaaaaaaaaaaaaa");
    $scope.dataToSend.modeOfPayment = $scope.data.modeOfPayment
    $scope.dataToSend.modeOfShopping = 'online'
    if ($scope.dataToSend.modeOfPayment == 'COD') {
      $scope.dataToSend.paidAmount = 0
    } else {
      $scope.dataToSend.paidAmount = 0
    }

    $scope.data.stage = 'processing';
    if ($rootScope.multiStore) {
      console.log('multiiiiiiiiiiiiii');
      $scope.dataToSend.storepk = $rootScope.storepk
    }
    console.log($scope.dataToSend);




    $http({
      method: 'POST',
      url: '  /api/ecommerce/createOrder/',
      data: $scope.dataToSend
    }).
    then(function(response) {
      $scope.order = response.data
      $scope.data.stage = 'confirmation';
      $rootScope.inCart = [];
      $rootScope.inFavourite = [];
      $scope.item = [];
      console.log('in cart', $rootScope.inCart);
    })

  }


  $scope.addWishList = function(i, value) {
    $http({
      method: 'PATCH',
      url: '/api/ecommerce/cart/' + value + '/',
      data: {
        typ: 'favourite',
        qty: null
      }
    }).
    then(function(response) {
      $scope.cartItems.splice(i, 1)
      $rootScope.inCart.splice(i, 1)
      $scope.calcTotal()
    })

  }


})


app.controller('ecommerce.main', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, $interval, Flash) {
  console.log('logooooooooooooooooooooo',ICON_LOGO);
  $rootScope.ICON_LOGO = ICON_LOGO
  $scope.me = $users.get('mySelf')
  $rootScope.companyPhone = ''
  $rootScope.companyEmail = ''
  $scope.showCartImage = false;
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=phone').
  then(function(response) {
    $rootScope.companyPhone = response.data[0].value
  })
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=email').
  then(function(response) {
    $rootScope.companyEmail = response.data[0].value
  })

  $http.get('/api/ERP/appSettings/?app=25&name__iexact=isCartImage').
  then(function(response) {
    console.log('ratingggggggggggggggggggg', response.data);
    if (response.data[0] != null) {
      if (response.data[0].flag) {
        $scope.showCartImage = true
      }
    }
  })







  $rootScope.addToCart = []
  $scope.addTCart = getCookie('addToCart')
  if ($scope.addTCart != '') {
    $rootScope.addToCart = JSON.parse($scope.addTCart)
  }

  $scope.mainPage = function() {
    window.location = '/login';
  }



  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    console.log(decodedCookie);
    var ca = decodedCookie.split(';');
    console.log(ca);
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  console.log(getCookie('userPincode'));

  console.log('firstttttttttttttttttttttttttttttttttttttttttttttt');
  $rootScope.multiStore = false
  $rootScope.pin = 0
  $rootScope.storepk = 0
  $scope.openPinPopup = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.ecommerce.pincodeEnquiry.form.html',
      size: 'md',
      backdrop: false,
      // resolve: {
      //   product: function() {
      //
      //   }
      // },
      controller: 'controller.ecommerce.pincodeEnquiry.modal',
    }).result.then(function() {

    }, function() {

    });
  }
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=multipleStore').
  then(function(response) {
    console.log('ratingggggggggggggggggggg', response.data);
    if (response.data[0] != null) {
      if (response.data[0].flag) {
        $rootScope.multiStore = true
        var pincode = getCookie('userPincode')
        console.log('pinnnnnnnnnnnnnnnn', pincode);
        $rootScope.pin = pincode
        if (pincode == "") {
          $scope.openPinPopup()
        } else {
          $http.get('/api/POS/store/?pincode=' + pincode).
          then(function(response) {
            console.log(response.data);
            if (response.data.length > 0) {
              $rootScope.pin = response.data[0].pincode
              $rootScope.storepk = response.data[0].pk
              $rootScope.$broadcast('filterForStore', {
                pin: response.data[0].pincode
              });
              $rootScope.$broadcast('filterForCategoryStore', {
                pin: response.data[0].pincode
              });
            }
          })
        }
      }
    }
  })
  $scope.onBtnEnter = false
  $scope.onDropdownEnter = false
  $scope.onChildEnter = false
  $scope.SortByCategory = false
  $scope.selectedOne = function(data){
    // console.log('dataaaaaaaaaaaaaaaa',data);
    $scope.childData = data
  }
  $scope.resetAll = function(){
    // console.log('resettinggggggggg');
    $scope.childData = {}
  }


  $scope.bannerImage = false


  $http.get('/api/ERP/appSettings/?app=25&name__iexact=bannerImage').
  then(function(response) {
    if (response.data[0] != null) {
      if (response.data[0].flag) {
        $scope.bannerImage = true
      }
      if ($scope.bannerImage) {
        $scope.paddingTop = '9.5vh';
      }else {
        $scope.paddingTop = '0px;';
      }
    }
  });




  // $scope.closedropDowns = function(event){
  //   console.log(event);
  //   event.x = 0
  //   event.offsetX = 0
  //   // $scope.onBtnEnter = false
  //   // $scope.onDropdownEnter = false
  //   // $scope.onChildEnter = false
  // }

  $scope.me = $users.get('mySelf')
  $rootScope.inCart = [];
  $rootScope.inFavourite = [];
  $scope.data = {
    location: null
  }
  $scope.params = {
    location: null
  } // to be used to store different parameter by the users on which the search result will be filtered out

  $scope.loginPage = function() {
    window.location = '/login';
  }
  $scope.logoutPage = function() {
    window.location = '/logout';
  }
  $scope.registerPage = function() {
    window.location = '/register';
  }

  $http.get('/api/ERP/appSettingsAdminMode/?name=SortByCategory').
  then(function(response) {
    console.log('SortByCategory',response.data);
    if (response.data.length>0) {
      $scope.SortByCategory = response.data[0].flag
    }
  })

  $http.get('/api/ecommerce/categorySortList/').
  then(function(response) {
    console.log('categories Listtttttttttt',response.data);
    $scope.categoriesList = response.data
  })

  $scope.genericProductSearch = function(query) {
    if ($rootScope.multiStore) {
      surl = '/api/ecommerce/searchProduct/?search=' + query + '&pin=' + $rootScope.pin + '&multipleStore&limit=6'
    } else {
      surl = '/api/ecommerce/searchProduct/?search=' + query + '&limit=6'
    }
    return $http.get(surl).
    then(function(response) {
      console.log(response.data, 'lllllllllllllllll');
      return response.data;
    })
  };

  $scope.searchProduct = {
    product: ''
  };

  $scope.bannerText = false
  $http.get('/api/ERP/appSettings/?app=25&name__iexact=bannerText').
  then(function(response) {
    if (response.data[0] != null) {
      if (response.data[0].flag) {
        $scope.bannerText = true
      }
    }
  })
  $scope.search = function() {
    if (typeof $scope.searchProduct.product == 'object') {
      if ($scope.searchProduct.product.typ == 'list') {
        console.log($scope.searchProduct);
        $state.go('details', {
          id: $scope.searchProduct.product.pk,
          name: $scope.searchProduct.product.name.split(' ').join('-')
        })
      } else {
        $state.go('categories', {
          name: $scope.searchProduct.product.name
        })
      }
      $scope.searchProduct.product = '';
    }
  }

  $scope.$watch('searchProduct.product', function(newValue, oldValue) {
    if (newValue != null && typeof newValue == 'object') {
      if (newValue.typ == 'list') {
        console.log(newValue);
        $state.go('details', {
          id: newValue.pk,
          name: newValue.name.split(' ').join('-'),
          sku: newValue.serialNo
        })
      } else {
        $state.go('categories', {
          name: newValue.name
        })
      }
      $scope.searchProduct.product = '';
    }
  }, true);

  $scope.slide = {
    banners: [],
    active: 0
  };
  $scope.slideMobile = {
    banners: [],
    active: 0
  };

  $http({
    method: 'GET',
    url: '/api/ecommerce/offerBanner/?level=1'
  }).
  then(function(response) {
    // for (var i = 0; i < response.data.length; i++) {
    //   s = response.data[i].params;
    //   s = s.split(':')[1];
    //   s = s.split('}')[0];
    //   response.data[i].params = {id : parseInt(s)}
    // }
    $scope.slide.banners = response.data;
    if ($scope.slide.banners.length > 5) {
      $scope.slide.banners = $scope.slide.banners.slice(0, 5)
    }
    $scope.slide.active = 0
    if ($scope.slide.banners.length > 1) {
      $scope.slide.lastbanner = $scope.slide.banners.length - 1
    } else {
      $scope.slide.lastbanner = 0
    }

    console.log(response.data, 'fffff');

    $scope.slideMobile.banners = response.data;
    if ($scope.slideMobile.banners.length > 3) {
      $scope.slideMobile.banners = response.data.slice(0, 3);
    }
    $scope.slideMobile.active = 0
    if ($scope.slideMobile.banners.length > 1) {
      $scope.slideMobile.lastbanner = $scope.slideMobile.banners.length - 1
    } else {
      $scope.slideMobile.lastbanner = 0
    }
    console.log($scope.slide.banners);
    console.log($scope.slideMobile.banners);
  })
  $scope.changeSlide = function(index) {
    console.log('aaaaaaaaaaaaaaaaaaaaaaa', index);
    $scope.slide.active = index;
  }

  $scope.change = function(value) {
    if (value == "next") {
      if ($scope.slide.active == undefined) {
        $scope.slide.active = 0
      }
      if ($scope.slide.active == $scope.slide.lastbanner) {
        $scope.slide.active = 0;
      } else {
        $scope.slide.active += 1;
      }
    } else if (value == "previous") {
      console.log($scope.slide.active);
      console.log($scope.slide.active, $scope.slide.lastbanner);
      if ($scope.slide.active == undefined) {
        $scope.slide.active = 0;
      } else {
        $scope.slide.active -= 1;
      }

      if ($scope.slide.active < 0) {
        console.log("kkkkkkkkkkkkkkkkk");
        $scope.slide.active = $scope.slide.lastbanner
      }
    }
  }




  $interval(function() {
    if ($scope.slide.active == undefined) {
      $scope.slide.active = 0
    }
    if ($scope.slide.active == $scope.slide.lastbanner) {
      $scope.slide.active = 0;
    } else {
      $scope.slide.active += 1;
    }
  }, 3000);


  $scope.changeSlideMobile = function(index) {
    $scope.slideMobile.active = index;
  }

  $interval(function() {
    if ($scope.slideMobile.active == undefined) {
      $scope.slideMobile.active = 0
    }
    if ($scope.slideMobile.active == $scope.slideMobile.lastbanner) {
      $scope.slideMobile.active = 0;
    } else {
      $scope.slideMobile.active += 1;
    }
  }, 3000);

  // $interval(function() {
  //   $scope.slideMobile.active += 1;
  //   if ($scope.slideMobile.active == 3) {
  //     $scope.slideMobile.active = 0;
  //   }
  // }, 3000);


  // $scope.increaseSlide = function(index) {
  //   console.log(index,'aaaaaaaaa');
  //   $scope.banners= index+1;
  // }
  //
  // $scope.decreaseSlide = function(index) {
  //   $scope.slide.active = index-1;
  // }

  $scope.feedback = {
    email: '',
    mobile: null,
    message: ''
  };

  // $scope.feddbackPannel = false
  $scope.feedbackstatus = function() {

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.ecommerce.feedBack.html',
      size: 'md',
      backdrop: false,
      controller: 'controller.ecommerce.feedBack.modal',
    }).result.then(function() {

    }, function() {

    });
  }

  $scope.faq = function() {

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.ecommerce.FAQ.html',
      size: 'lg',
      backdrop: false,
      controller: 'controller.ecommerce.FAQ.modal',
    }).result.then(function() {

    }, function() {

    });
  }


  $scope.contactUs = function() {
    $scope.me = $users.get('mySelf')
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.ecommerce.contact.html',
      size: 'md',
      backdrop: false,
      controller: 'controller.ecommerce.contact.modal',
    }).result.then(function() {

    }, function() {

    });
  }
  // $scope.close = function() {
  //   $scope.feddbackPannel = false
  // }



  $scope.settings = {};
  $http({
    method: 'GET',
    url: '/api/ERP/appSettings/?app=25'
  }).
  then(function(response) {
    for (var i = 0; i < response.data.length; i++) {
      $scope.settings[response.data[i].name] = response.data[i].value;
    }
    console.log($scope.settings);
  })

  $scope.data.pickUpTime = null;
  $scope.data.dropInTime = null;
  if ($scope.me != null) {
    $http({
      method: 'GET',
      url: '/api/ecommerce/cart/?user=' + $scope.me.pk
    }).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        if (response.data[i].typ == 'cart') {

          var prod_variants = response.data[i].product.product_variants

          for (var j = 0; j < prod_variants.length; j++) {
            if (prod_variants[j].sku == response.data[i].prodSku) {
              response.data[i].prod_var = prod_variants[j]
            }
          }

          $rootScope.inCart.push(response.data[i])
        }
        if (response.data[i].typ == 'favourite') {
          $rootScope.inFavourite.push(response.data[i])
        }
      }
    })
  }

  if ($scope.me != null) {
    $http({
      method: 'GET',
      url: '/api/ecommerce/order/?user=' + $scope.me.pk
    }).
    then(function(response) {
      $rootScope.inInvoice = response.data
    })
  }




  if ($scope.me) {
    console.log($rootScope.addToCart , 'gggggggggggggggggggggg');
    console.log($rootScope.inCart);
    if ($rootScope.addToCart.length > 0) {
      if ($rootScope.inCart.length > 0) {
        console.log("comeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
        for (var i = 0; i < $rootScope.addToCart.length; i++) {
          for (var j = 0; j < $rootScope.inCart.length; j++) {
            if ($rootScope.addToCart[i].prodSku == $rootScope.inCart[j].prodSku) {
              if ($rootScope.inCart[j].typ == 'cart') {
                $http({
                  method: 'PATCH',
                  url: '/api/ecommerce/cart/' + $rootScope.inCart[j].pk + '/',
                  data: {
                    qty: $rootScope.addToCart[i].qty
                  }
                }).
                then(function(response) {})
                $rootScope.inCart[i].qty = $rootScope.addToCart[i].qty

              }
              //  else if ($rootScope.inCart[j].typ == 'favourite') {
              //   $http({
              //     method: 'PATCH',
              //     url: '/api/ecommerce/cart/' + $rootScope.inCart[j].pk + '/',
              //     data: {
              //       typ: 'cart',
              //       qty: $rootScope.addToCart[i].qty
              //     }
              //   }).
              //   then(function(response) {})
              //   $rootScope.inCart[i].typ = 'cart'
              //   $rootScope.inCart[i].qty = $rootScope.addToCart[i].qty
              //   return
              // }
            }
          }

          for (var j = 0; j < $rootScope.inFavourite.length; j++) {
              if ($rootScope.addToCart[i].prodSku == $rootScope.inFavourite[j].prodSku) {
                if ($rootScope.inFavourite[j].typ == 'favourite') {
                  $http({
                    method: 'PATCH',
                    url: '/api/ecommerce/cart/' + $rootScope.inFavourite[j].pk + '/',
                    data: {
                      typ: 'cart',
                      qty: $rootScope.addToCart[i].qty
                    }
                  }).
                  then(function(response) {
                    $rootScope.inCart.push(response.data)
                    $rootScope.inFavourite.splice(i, 1)
                  })

                }
              }
          }
          $http({
            method: 'POST',
            url: '/api/ecommerce/cart/',
            data: {
              typ: 'cart',
              qty: $rootScope.addToCart[i].qty,
              product: $rootScope.addToCart[i].prodPk,
              user: getPK($scope.me.url),
              prodSku: $rootScope.addToCart[i].prodSku
            }
          }).
          then(function(response) {
            if (response.data.length > 0) {
              for (var i = 0; i < response.data.length; i++) {
                $rootScope.inCart.push(response.data[0])
              }
            }

          })
        }
      } else {
        console.log('posdtttttttttttttttttttttttttttt');
        for (var i = 0; i < $rootScope.addToCart.length; i++) {
          $http({
            method: 'POST',
            url: '/api/ecommerce/cart/',
            data: {
              typ: 'cart',
              qty: $rootScope.addToCart[i].qty,
              product: $rootScope.addToCart[i].prodPk,
              user: getPK($scope.me.url),
              prodSku: $rootScope.addToCart[i].prodSku
            }
          }).
          then(function(response) {
            if (response.data.length > 0) {
              for (var i = 0; i < response.data.length; i++) {
                $rootScope.inCart.push(response.data[0])
              }
            }

          })
        }

      }

      function setCookie(cname, cvalue, exdays) {
        console.log('set cookie');
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      }


      detail = getCookie("addToCart");
      if (detail != "") {
        console.log('already there');
        setCookie("addToCart", "", -1);
        // document.cookie = encodeURIComponent("addToCart") + "=deleted; expires=" + new Date(0).toUTCString()
      }
      window.location = '/checkout/cart';
      $scope.cart = $rootScope.inCart;
      $rootScope.addToCart = []
    }



  }


  $scope.headerUrl = '/static/ngTemplates/app.ecommerce.header.html';
  $scope.footerUrl = '/static/ngTemplates/app.ecommerce.footer.html';


  $scope.$watch('data.location', function(newValue, oldValue) {
    if (newValue != null && typeof newValue == 'object') {
      $http({
        method: 'GET',
        url: '/api/ecommerce/locationDetails/?id=' + newValue.place_id
      }).
      then(function(response) {
        $scope.params.location = response.data.result;
        console.log($scope.params.location.geometry.location);
        // lat lon is available in location.geometry.location.lat or lng
      })
    }
  }, true);

  $scope.getLocationSuggeations = function(query) {
    return $http.get('/api/ecommerce/suggestLocations/?query=' + query).
    then(function(response) {
      return response.data.predictions;
    })
  }

  $scope.refreshResults = function() {
    $state.go('ecommerce', {}, {
      reload: true
    })
    // if (angular.isDefined($scope.$$childHead.fetchListings)) {
    //   $scope.$$childHead.fetchListings()
    // }else {
    //   $scope.$$childTail.fetchListings()
    // }
  }

});
app.controller('controller.ecommerce.pincodeEnquiry.modal', function($scope, $rootScope, $state, $http, $users, $interval, $uibModal, $uibModalInstance, Flash) {
  $scope.close = function() {
    $uibModalInstance.close();
  }
  $scope.form = {
    pincode: ''
  }

  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    console.log(decodedCookie);
    var ca = decodedCookie.split(';');
    console.log(ca);
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {

        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function setCookie(cname, cvalue, exdays) {
    console.log('set cookie');
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function createCookieDetail(pincode) {
    console.log('create cookieeeeeeeee', pincode);
    detail = getCookie("userPincode");
    if (detail != "") {
      console.log('already there');
      document.cookie = encodeURIComponent("userPincode") + "=deleted; expires=" + new Date(0).toUTCString()
    }
    setCookie("userPincode", pincode, 365);
  }

  $scope.checkPincode = function() {
    console.log($scope.form.pincode.toString().length);
    if ($scope.form.pincode.toString().length != 6) {
      Flash.create('danger', "Please enter a correct Pincode");
      return
    }

    // createCookieDetail($scope.form.pincode)

    $scope.showSpinner = false

    $http.get('/api/POS/store/?pincode=' + $scope.form.pincode).
    then(function(response) {
      console.log(response.data);
      $scope.stores = response.data
      if (response.data.length > 0) {
        $rootScope.pin = response.data[0].pincode
        createCookieDetail(response.data[0].pincode)
        $scope.showSpinner = true
        $rootScope.$broadcast('filterForStore', {
          pin: response.data[0].pincode
        });
        $rootScope.$broadcast('filterForCategoryStore', {
          pin: response.data[0].pincode
        });
        setTimeout(function() {
          $scope.showSpinner = false
          $uibModalInstance.close();
        }, 2000);
      } else {
        $scope.form.pincode = ''
      }
    })
  }
  console.log($scope.stores, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaakkkkkkkkkkkkkkkkkkk');
});

app.controller('controller.ecommerce.FAQ.modal', function($scope, $rootScope, $state, $http, $timeout, $uibModal, $users, Flash, $uibModalInstance) {
  $scope.me = $users.get('mySelf')

  $scope.close = function() {
    $uibModalInstance.close();
  }


  $http({
    method: 'GET',
    url: '/api/ecommerce/frequentlyQuestions/'
  }).
  then(function(response) {
    $scope.fAQ = response.data
  })
  $scope.ind = -1
  $scope.collapsed = function(indx) {
    console.log(indx);
    $scope.ind = indx
  }

  $scope.message = {
    email: '',
    mobile: '',
    invoiceNo: '',
    subject: '',
    body: ''
  };
  $scope.sendMessage = function() {
    if ($scope.me == null || $scope.me == undefined) {
      if ($scope.message.invoiceNo == '' || $scope.message.body == '' || $scope.message.mobile == '' || $scope.message.email == '') {
        Flash.create("warning", "Please Add Email and Mobile")
      } else {
        var dataToSend = {
          email: $scope.message.email,
          mobile: $scope.message.mobile,
          invoiceNo: $scope.message.invoiceNo,
          subject: $scope.message.subject,
          message: $scope.message.body
        }
      }
    } else {
      if ($scope.message.invoiceNo == '' || $scope.message.body == '' || $scope.message.email == '') {
        Flash.create("warning", "Please Add Email and Mobile")
      } else {
        var dataToSend = {
          email: $scope.message.email,
          mobile: $scope.me.profile.mobile,
          invoiceNo: $scope.message.invoiceNo,
          subject: $scope.message.subject,
          message: $scope.message.body
        }
      }

    }

    console.log(dataToSend);
    $http({
      method: 'POST',
      url: '/api/ecommerce/supportFeed/',
      data: dataToSend
    }).
    then(function(response) {
      $scope.message = {
        email: '',
        mobile: '',
        invoiceNo: '',
        subject: '',
        body: ''
      };
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }


});
app.controller('controller.ecommerce.feedBack.modal', function($scope, $rootScope, $state, $http, $users, $interval, $uibModal, $uibModalInstance, Flash) {
  $scope.me = $users.get('mySelf')
  $scope.close = function() {
    $uibModalInstance.close();
  }

  $scope.feedback = {
    email: '',
    subject: '',
    mobile: null,
    message: ''
  };
  $scope.sendFeedback = function() {
    console.log($scope.me, 'aaaaaaaaa')
    if ($scope.me == null || $scope.me == undefined) {
      console.log('kkkkkkkkkkkkkkk')
      if ($scope.feedback.email == '' || $scope.feedback.mobile == 5 || $scope.feedback.message == '') {
        Flash.create("warning", "Please Add Email and Mobile")
      } else {
        var toSend = {
          email: $scope.feedback.email,
          mobile: $scope.feedback.mobile,
          subject: $scope.feedback.subject,
          message: $scope.feedback.message,
        }
      }
    } else {
      if ($scope.feedback.email == '' || $scope.feedback.message == '') {
        Flash.create("warning", "Please Add Email and Mobile")
      } else {
        var toSend = {
          email: $scope.feedback.email,
          mobile: $scope.me.profile.mobile,
          subject: $scope.feedback.subject,
          message: $scope.feedback.message,
        }
      }

    }
    $http({
      method: 'POST',
      url: '/api/ecommerce/supportFeed/',
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Thank you!');
      $scope.feedback = {
        email: '',
        subject: '',
        mobile: null,
        message: ''
      };
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }
});

app.controller('controller.ecommerce.contact.modal', function($scope, $rootScope, $state, $http, $users, $interval, $uibModal, $uibModalInstance, Flash) {
  //   $http({
  //   method: 'GET',
  //   url: '/api/ecommerce/frequentlyQuestions/'
  // }).
  // then(function(response) {
  //   $scope.fAQ = response.data
  // })

  // $scope.message = {
  //   subject: '',
  //   body: ''
  // };
  // $scope.sendMessage = function() {
  //   $http({
  //     method: 'POST',
  //     url: '/api/ecommerce/support/',
  //     data: $scope.message
  //   }).
  //   then(function(response) {
  //     $scope.message = {
  //       subject: '',
  //       body: ''
  //     };
  //     Flash.create('success', response.status + ' : ' + response.statusText);
  //   }, function(response) {
  //     Flash.create('danger', response.status + ' : ' + response.statusText);
  //   })
  // }

  $scope.close = function() {
    $uibModalInstance.close();
  }


  $scope.sendFeedback = function() {
    // if ($scope.me==null){
    //   console.log("aaaaaaaa");
    //   if ($scope.feedback.email == '') {
    //     Flash.create('danger', 'Please provide details')
    //   }
    //   else{
    //     var toSend = {
    //       email: $scope.feedback.email,
    //       mobile: $scope.feedback.mobile,
    //       message: $scope.feedback.message,
    //     }
    //   }
    // }
    // else{
    //   var toSend = {
    //     email: $scope.feedback.email,
    //     mobile: $scope.feedback.mobile,
    //     message: $scope.feedback.message,
    //   }
    // }


    console.log("aaaaaaaa");
    if ($scope.feedback.email == '') {
      Flash.create('danger', 'Please provide details')
    } else {
      console.log($scope.feedback.email, 'aaaaa');
      var toSend = {
        email: $scope.feedback.email,
        mobile: $scope.feedback.mobile,
        message: $scope.feedback.message,
      }
    }


    $http({
      method: 'POST',
      url: '/api/ecommerce/supportFeed/',
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Thank you!');
      $scope.feedback = {
        email: '',
        mobile: null,
        message: ''
      };
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }
});


app.controller('controller.ecommerce.list', function($scope, $rootScope, $state, $http, Flash, $users, $interval, $filter) {

  document.title = 'Buy Products Online At Best Price In India | Sterling Select'
  document.querySelector('meta[name="description"]').setAttribute("content", 'Sterling Select Online Shopping')

  $scope.me = $users.get('mySelf');
  console.log('multiiiiiiiiiiiiiiiiiiiii', $rootScope.multiStore, $rootScope.pin);

  $scope.secondBanner = false

  $scope.listProdLimit = 24;
  $scope.listProdOffset = 0;


  $http.get('/api/ERP/appSettings/?app=25&name__iexact=secondBanner').
  then(function(response) {
    if (response.data[0] != null) {
      if (response.data[0].flag) {
        $scope.secondBanner = true
      }
    }
  });


  setTimeout(function() {
    console.log($rootScope.pin);
    if ($rootScope.multiStore) {
      $rootScope.$broadcast('filterForStore', {
        pin: $rootScope.pin
      });
      $rootScope.$broadcast('filterForCategoryStore', {
        pin: $rootScope.pin
      });
    } else {
      $http({
        method: 'GET',
        url: '/api/ecommerce/listingLite/?limit='+$scope.listProdLimit
      }).
      then(function(response) {
        $scope.listingProductsData1 = response.data.results.slice(0, 12);
        $scope.listingProductsData2 = response.data.results.slice(12, 24);

        // for (var i = 0; i < $rootScope.addToCart.length; i++) {
        //   if ($rootScope.addToCart.length > 0) {
        //     for (var j = 0; j < $scope.listingProducts.length; j++) {
        //       if ($scope.listingProducts[j].pk == $rootScope.addToCart[i].product.pk) {
        //         $scope.listingProducts[j].added_cart = $rootScope.addToCart[i].qty
        //         console.log($scope.listingProducts[j].added_cart, 'aaaaaaaaaaaaaaaaaaaaaaaa');
        //       }
        //     }
        //     for (var j = 0; j < $scope.listingRemainingProducts.length; j++) {
        //       if ($scope.listingRemainingProducts[j].pk == $rootScope.addToCart[i].product.pk) {
        //         $scope.listingRemainingProducts[j].added_cart = $rootScope.addToCart[i].qty
        //         console.log($scope.listingRemainingProducts[j].added_cart, 'aaaaaaaaaaaaaaaaaaaaaaaa');
        //       }
        //     }
        //
        //   }
        // }
      })

      $http({
        method: 'GET',
        url: '/api/ecommerce/genericProduct/'
      }).
      then(function(response) {
        $scope.genericProducts = response.data;
      })
    }
  }, 1000);


  $scope.showMore = function () {
    $scope.listProdLimit = 12
    $scope.listProdOffset = $scope.listProdOffset + 24;
    if ($rootScope.multiStore) {
      $rootScope.$broadcast('filterForStore', {
        pin: $rootScope.pin
      });
      $rootScope.$broadcast('filterForCategoryStore', {
        pin: $rootScope.pin
      });
    } else {
      $http({
        method: 'GET',
        url: '/api/ecommerce/listingLite/?limit='+$scope.listProdLimit+'&offset='+$scope.listProdOffset
      }).
      then(function(response) {
        console.log(response.data.results);
        $scope.listingProductsData2 = $scope.listingProductsData2.concat(response.data.results)
        console.log($scope.listingProductsData1);
        console.log($scope.listingProductsData2);

        // $scope.listingProductsData2 = response.data.results.slice(0, 12);
    });
  }
}

  $scope.recentlyViewed = [];
  // $scope.recentViewsArr = [];
  //
  if ($scope.me != null) {
    if ($rootScope.multiStore) {
      rurl = '/api/ecommerce/activities/?user=' + $scope.me.pk + '&typ=productView&limit=4' + '&pin=' + $rootScope.pin + '&multipleStore'
    } else {
      rurl = '/api/ecommerce/activities/?user=' + $scope.me.pk + '&typ=productView&limit=4'
    }
    $http({
      method: 'GET',
      url: rurl
    }).
    then(function(response) {
      for (var i = 0; i < response.data.results.length; i++) {
        $scope.recentlyViewed.push(response.data.results[i].product)
      }

    })
  }

  $http({
    method: 'GET',
    url: '/api/ecommerce/suggestedItem/'
  }).
  then(function(response) {
    console.log('%%%%%%%%', response.data.results);
    $scope.suggestedProducts = response.data.results

  })


  $scope.subSlide = {
    banners: [],
    active: 0
  };
  $scope.subSlideMobile = {
    banners: [],
    active: 0
  };

  $http({
    method: 'GET',
    url: '/api/ecommerce/offerBanner/?level=2'
  }).
  then(function(response) {
    $scope.subSlide.banners = response.data;
    if ($scope.subSlide.banners.length > 5) {
      $scope.subSlide.banners = $scope.slide.banners.slice(0, 5)
    }
    if ($scope.subSlide.banners.length > 1) {
      $scope.subSlide.lastbanner = $scope.subSlide.banners.length - 1
      $scope.subSlide.img = $scope.subSlide.banners[0].image
      $scope.subSlide.title = $scope.subSlide.banners[0].title
    } else {
      $scope.subSlide.lastbanner = 0
    }


    console.log(response.data, 'fffff');

    $scope.subSlideMobile.banners = response.data;
    if ($scope.subSlideMobile.banners.length > 3) {
      $scope.subSlideMobile.banners = response.data.slice(0, 3);
    }
    if ($scope.subSlideMobile.banners.length > 1) {
      $scope.subSlideMobile.lastbanner = $scope.subSlideMobile.banners.length - 1
      $scope.subSlideMobile.img = $scope.subSlideMobile.banners[0].imagePortrait
      $scope.subSlideMobile.title = $scope.subSlideMobile.banners[0].title

    } else {
      $scope.subSlideMobile.lastbanner = 0
    }

  })
  // $scope.changesubSlide = function(index) {
  //   $scope.subSlide.active = index;
  // }


  $interval(function() {
    if ($scope.subSlide.active == undefined) {
      $scope.subSlide.active = 0
    }
    if ($scope.subSlide.active == $scope.subSlide.lastbanner) {
      $scope.subSlide.active = 0;
    } else {
      $scope.subSlide.active += 1;
    }
    if ($scope.subSlideMobile.banners[$scope.subSlideMobile.active] != undefined) {
      $scope.subSlide.img = $scope.subSlide.banners[$scope.subSlide.active].image
      $scope.subSlide.title = $scope.subSlide.banners[$scope.subSlide.active].title
    }
  }, 3000);

  // $scope.changeSlideMobile = function(index) {
  //   $scope.subSlideMobile.active = index;
  // }

  $interval(function() {
    if ($scope.subSlideMobile.active == undefined) {
      $scope.subSlideMobile.active = 0
    }
    if ($scope.subSlideMobile.active == $scope.subSlideMobile.lastbanner) {
      $scope.subSlideMobile.active = 0;
    } else {
      $scope.subSlideMobile.active += 1;
    }
    if ($scope.subSlideMobile.banners[$scope.subSlideMobile.active] != undefined) {
      $scope.subSlideMobile.img = $scope.subSlideMobile.banners[$scope.subSlideMobile.active].imagePortrait
      // console.log($scope.subSlideMobile.img, 'aaaaaaaaaaaaaaaaaaaaaaaaaa');
      $scope.subSlideMobile.title = $scope.subSlideMobile.banners[$scope.subSlideMobile.active].title
    }
  }, 3000);


  $scope.addToCart = function(inputPk) {
    console.log('coming in addddddddddddddd');
    dataToSend = {
      product: inputPk,
      user: getPK($scope.me.url),
      qty: 1,
      typ: 'cart',
    }
    console.log(dataToSend);
    console.log('in cart', $rootScope.inCart);


    for (var i = 0; i < $rootScope.inCart.length; i++) {
      if ($rootScope.inCart[i].product.pk == dataToSend.product) {
        if ($rootScope.inCart[i].typ == 'cart') {
          Flash.create('warning', 'This Product is already in cart');
          return
        } else {
          $http({
            method: 'PATCH',
            url: '/api/ecommerce/cart/' + $rootScope.inCart[i].pk + '/',
            data: {
              typ: 'cart'
            }
          }).
          then(function(response) {
            console.log(response.data, 'aaaaaaaaaaaaaaaaaaaaaa');
            Flash.create('success', 'Product added to cart');
          })
          $rootScope.inCart[i].typ = 'cart'
          return
        }

      }
    }
    $http({
      method: 'POST',
      url: '/api/ecommerce/cart/',
      data: dataToSend
    }).
    then(function(response) {
      console.log(response.data, 'bbbbbbbbbbbbbbbbbbbbbbbbb');
      Flash.create('success', 'Product added in cart');
      $rootScope.inCart.push(response.data);
    })
  }


  $scope.$on('filterForStore', function(event, input) {
    console.log("recieved");
    console.log(input);
    $http({
      method: 'GET',
      url: '/api/ecommerce/listingLite/?pin=' + input.pin + '&multipleStore&limit=24'
    }).
    then(function(response) {
      $scope.listingProductsData1 = response.data.results.slice(0, 12);
      $scope.listingProductsData2 = response.data.results.slice(12, 24);

      if ($rootScope.addToCart.length > 0) {
        for (var i = 0; i < $rootScope.addToCart.length; i++) {
          for (var j = 0; j < $scope.listingProductsData1.length; j++) {
            if ($scope.listingProductsData1[j].pk == $rootScope.addToCart[i].product.pk) {
              $scope.listingProductsData1[j].added_cart = $rootScope.addToCart[i].qty
            }
          }
          for (var j = 0; j < $scope.listingProductsData2.length; j++) {
            if ($scope.listingProductsData2[j].pk == $rootScope.addToCart[i].product.pk) {
              $scope.listingProductsData2[j].added_cart = $rootScope.addToCart[i].qty
            }
          }
        }
      }

      // setTimeout(function () {
      // }, 1000);
    })
  });

  $scope.$on('filterForCategoryStore', function(event, input) {
    console.log("recieved category");
    console.log(input);
    $http({
      method: 'GET',
      url: '/api/ecommerce/genericProduct/?pin=' + input.pin + '&multipleStore'
    }).
    then(function(response) {
      console.log('categoryyyyyyyyy dataaaaaaaaaaaaaaaa', response.data);
      $scope.genericProducts = response.data;
      // setTimeout(function () {
      // }, 1000);

    })
  });



});
