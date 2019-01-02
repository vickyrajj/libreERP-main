var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'angular-owl-carousel-2', 'ui.bootstrap.datetimepicker', 'flash', 'ngAside']);


app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide, $locationProvider) {

  $urlRouterProvider.otherwise('/');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
  $locationProvider.html5Mode(true);

});

app.run(['$rootScope', '$state', '$stateParams', '$http', function($rootScope, $state, $stateParams, $http) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on("$stateChangeError", console.log.bind(console));

  $rootScope.$on("$stateChangeSuccess", function(params, to, toParams, from, fromParams) {

    window.scrollTo(0, 0);


    var visitorDetails = $rootScope.getCookie("visitorDetails");
    if (visitorDetails != "") {
      var uid = JSON.parse(visitorDetails).uid
      $rootScope.visitorPk = JSON.parse(visitorDetails).visitorPk
      createActivity()
    } else {
      var uid = new Date().getTime()
      $rootScope.visitorPk;
      $http({
        method: 'POST',
        url: '/api/ERP/visitor/',
        data: {
          uid: uid
        }
      }).
      then(function(response) {
        $rootScope.visitorPk = response.data.pk;
        createActivity()
        $rootScope.setCookie("visitorDetails", JSON.stringify({
          uid: response.data.uid,
          name: "",
          email: "",
          visitorPk: $rootScope.visitorPk,
          blogSubscribed: false
        }), 365);
      })

    }

    function createActivity() {
      if ($rootScope.newTime) {
        $rootScope.timeSpentInSec = (new Date().getTime() - $rootScope.newTime) / 1000;
        console.log(from.name, $rootScope.timeSpentInSec, uid);
        toSend = {
          visitor: $rootScope.visitorPk,
          page: from.name,
          timeDuration: $rootScope.timeSpentInSec
        }
        console.log(toSend);
        $http({
          method: 'POST',
          url: '/api/ERP/activity/',
          data: toSend
        }).
        then(function(response) {
          console.log(response.data);
        })

        $rootScope.newTime = new Date().getTime();
      } else {
        $rootScope.newTime = new Date().getTime();
      }
    }



  });
}]);


// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc

app.config(function($stateProvider) {

  $stateProvider
    .state('home', {
      url: "/",
      templateUrl: '/ngTemplates/app.homepage.index.html',
      controller: 'controller.index'
    })

  $stateProvider
    .state('enroll', {
      url: "/enroll",
      templateUrl: '/static/ngTemplates/app.homepage.enroll.html',
      controller: 'controller.enroll'
    })

  $stateProvider
    .state('contact', {
      url: "/contact",
      templateUrl: '/static/ngTemplates/app.homepage.contact.html',
      controller: 'controller.contact'
    })

  $stateProvider
    .state('about', {
      url: "/about",
      templateUrl: '/static/ngTemplates/app.homepage.about.html',
      // controller: 'controller.about'
    })
});


app.controller('controller.index', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {

  $scope.onHover = function(val) {
    document.getElementById('owltext' + val).classList.add('changingFont')
    document.getElementById('owlpoint' + val).classList.add('changingColor')
  }
  $scope.offHover = function(val) {
    document.getElementById('owltext' + val).classList.remove('changingFont')
    document.getElementById('owlpoint' + val).classList.remove('changingColor')
  }
  var d = function(num1, num2, num3, num4) {
    document.getElementById('drop' + num1).classList.add('divcolor')
    document.getElementById('drop' + num2).classList.remove('divcolor')
    document.getElementById('drop' + num3).classList.remove('divcolor')
    document.getElementById('drop' + num4).classList.remove('divcolor')
  }
  $scope.drop = function(val) {
    if (val == 0) {
      d(val, 1, 2, 3)
    } else if (val == 1) {
      d(val, 0, 2, 3)
    } else if (val == 2) {
      d(val, 1, 0, 3)
    } else {
      d(val, 1, 0, 2)

    }
    // $scope.clasname = document.getElementsByClassName('collapse');
  }






})

app.controller('controller.enroll', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {
  $scope.list = [1, 2, 3, 4]
  $scope.isDisabled = false;

  $scope.dropdown = function(val) {
    for (var i = 0; i < $scope.list.length; i++) {
      document.getElementById('drop' + $scope.list[i]).classList.remove("filter");
    }
    if ($scope.list.includes(val)) {
      $scope.list.splice(val - 1, 1)
      for (var i = 0; i < $scope.list.length; i++) {
        document.getElementById('drop' + $scope.list[i]).classList.add("filter");

      }
    }

    $scope.clasname = document.getElementsByClassName('open');
    if ($scope.clasname.length > 0) {
      for (var i = 0; i < $scope.list.length; i++) {
        document.getElementById('drop' + $scope.list[i]).classList.remove("filter");
      }
    }
    $scope.list = [1, 2, 3, 4]

  }
  $(window).click(function(e) {
    for (var i = 0; i < $scope.list.length; i++) {
      document.getElementById('drop' + $scope.list[i]).classList.remove("filter");
    }
  });
  $scope.properties = {
    lazyLoad: true,
    dots: true,
    autoplay:true,
    autoplayTimeout:3000,
    URLhashListener: true,
    autoplayHoverPause: true,
    startPosition: 'URLHash',
    center: true,
    loop: true,
    // margin:10,
    responsive: {
      0: {
        items: 1,

      },
      768: {
        items: 1,

      },
      1000: {
        items: 3,

      }
    }
  };
  $scope.cardss = [{
      img1: '/static/images/24tut/img1.jpeg',
      title: 'Kids Complementary Maths',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor ',
      img2: '/static/images/24tut/author1.png',
      name: 'Penny Tailor',
      price: '15.00 ',
    },
    {
      img1: '/static/images/24tut/img1.jpeg',
      title: 'Language Learning Crash Course ',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor ',
      img2: '/static/images/24tut/author1.png',
      name: 'Penny Tailor nathasa',
      price: '15.00 ',
    },
    {
      img1: '/static/images/24tut/img1.jpeg',
      title: 'General Logical Analysis',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor ',
      img2: '/static/images/24tut/author1.png',
      name: 'Penny Tailor',
      price: '15.00 ',
    },
  ]
})



app.controller('main', function($scope, $state, $http, $timeout, $interval, $uibModal, $rootScope) {


  $rootScope.getCookie = function(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
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


  $rootScope.setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  $scope.device = {
    smallDevice: false
  }

  $scope.smDevice = function(x) {
    if (x.matches) {
      console.log('trueeeeeeee');
      $scope.device.smallDevice = true;
    }
  }

  $scope.lgDevice = function(x) {
    if (x.matches) {
      console.log('false');
      $scope.device.smallDevice = false;
    }
  }

  $scope.sm = window.matchMedia("(max-width: 768px)")
  $scope.smDevice($scope.sm)
  $scope.sm.addListener($scope.smDevice)

  $scope.lg = window.matchMedia("(min-width: 768px)")
  $scope.lgDevice($scope.lg)
  $scope.lg.addListener($scope.lgDevice)


  $scope.toggleNavbar = false;

  $rootScope.source = 'EpsilonAI'


  $scope.langOptions = [{
      flag: '/static/images/flags/USA-1.svg',
      code: 'en',
      lang: 'EN'
    },
    {
      flag: '/static/images/flags/Japan.svg',
      code: 'jp',
      lang: 'JP'
    },
    {
      flag: '/static/images/flags/Germany.svg',
      code: 'de',
      lang: 'DE'
    },
    {
      flag: '/static/images/flags/France.svg',
      code: 'fr',
      lang: 'FR'
    },
    {
      flag: '/static/images/flags/flag-Spain.svg',
      code: 'es',
      lang: 'ES'
    },
  ]

  $scope.data = {
    currentLang: $scope.langOptions[0]
  }

  $scope.changeLan = function(lang) {
    $scope.data.currentLang = lang;
    Cookies.set('lang', lang.code);
    location.reload();
  }

  if (Cookies.get('lang') != undefined) {
    for (var i = 0; i < $scope.langOptions.length; i++) {
      if ($scope.langOptions[i].code == Cookies.get('lang')) {
        $scope.data.currentLang = $scope.langOptions[i];
        break;
      }
    }
  }

  var cookieAccepted = $rootScope.getCookie("accepted");
  if (cookieAccepted != "") {
    cookieAccepted = JSON.parse(cookieAccepted)
    if (cookieAccepted.accepted) {
      $scope.show_cokie_agree = false;
    } else {
      $scope.show_cokie_agree = true;
    }
  } else {
    $scope.show_cokie_agree = true;
  }

  var visitorDetails = $rootScope.getCookie("visitorDetails");
  $rootScope.cookie = function(val) {
    $scope.show_cokie_agree = false;
    if (visitorDetails != "") {
      var uid = JSON.parse(visitorDetails).uid
      $rootScope.setCookie("accepted", JSON.stringify({
        'accepted': true,
        'uid': uid
      }), 365)
    }
  }

  $scope.schedule = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.homepage.schedule.modal.html',
      size: 'lg',
      backdrop: true,
      controller: function($scope, Flash) {
        $scope.calendar = true
        $scope.thankYou = false

        $scope.refresh = function() {
          $scope.form = {
            dated: new Date(),
            slot: '8 - 9',
            emailId: '',
            name: ''
          }
        }
        $scope.refresh()

        $scope.visitorDetails = $rootScope.getCookie("visitorDetails");
        if ($scope.visitorDetails != "") {
          $scope.form.name = JSON.parse($scope.visitorDetails).name || ''
          $scope.form.emailId = JSON.parse($scope.visitorDetails).email || ''
        }


        $scope.timeSlot = [{
            'time': '8 - 9'
          },
          {
            'time': '9 - 10'
          },
          {
            'time': '10 - 11'
          },
          {
            'time': '11 - 12'
          },
          {
            'time': '13 - 14'
          },
          {
            'time': '14 - 15'
          },
          {
            'time': '15 - 16'
          },
          {
            'time': '16 - 17'
          },
        ]




        $scope.scheduleMeeting = function() {
          if ($scope.form.emailId == '' || $scope.form.name == '') {
            return;
          }

          $scope.visitorDetails = $rootScope.getCookie("visitorDetails");
          if ($scope.visitorDetails != "") {
            $rootScope.setCookie("visitorDetails", JSON.stringify({
              uid: JSON.parse($scope.visitorDetails).uid,
              name: $scope.form.name,
              email: $scope.form.emailId,
              visitorPk: $rootScope.visitorPk,
              blogSubscribed: JSON.parse($scope.visitorDetails).blogSubscribed
            }), 365);
          }


          var dataToSend = {
            dated: $scope.form.dated.toJSON().split('T')[0],
            slot: $scope.form.slot,
            emailId: $scope.form.emailId,
            name: $scope.form.name,
            source: $rootScope.source
          }

          $http({
            method: 'POST',
            url: erpUrl + '/api/marketing/schedule/',
            data: dataToSend
          }).
          then(function(response) {

            Flash.create('success', 'Saved');
            $scope.calendar = false
            $scope.thankYou = true
            $http({
              method: 'POST',
              url: erpUrl + '/api/marketing/inviteMail/',
              data: {
                value: response.data.pk
              }
            }).
            then(function(response) {
              // $scope.refresh()
            });

            $http({
              method: 'PATCH',
              url: '/api/ERP/visitor/' + $rootScope.visitorPk + '/',
              data: {
                demoRequested: true,
                email: $scope.form.emailId,
                name: $scope.form.name
              }
            }).then(function(response) {
              console.log(response.data);
            })


          });

        }


      },
    })
  }




  // $scope.jobs = []

  // $http.get('/api/recruitment/jobsList/?status=Active').
  // then(function(response) {
  //   console.log(response.data, 'aaaaaa');
  //   $scope.jobs = response.data;
  // })

  // $scope.apply = function(idx) {
  //   $uibModal.open({
  //     templateUrl: '/static/ngTemplates/app.careers.modal.apply.html',
  //     size: 'lg',
  //     backdrop: false,
  //     resolve: {
  //       data: function() {
  //         return $scope.jobs[idx];
  //       }
  //     },
  //     controller: "careers.modal.apply",
  //   }).result.then(function() {
  //
  //   }, function() {
  //
  //   });
  // }
  console.log('here');
  $scope.show = [false, false, false, false]
  $scope.keepshow = false;


  $scope.visitorDetails = $rootScope.getCookie("visitorDetails");
  if ($scope.visitorDetails != "") {
    $scope.subscribeForm = {}
    $scope.subscribeForm.email = JSON.parse($scope.visitorDetails).email || ''
    $scope.subscribeForm.blogSubscribed = JSON.parse($scope.visitorDetails).blogSubscribed || false
  } else {
    $scope.subscribeForm = {
      email: '',
      blogSubscribed: false
    }
  }

  $scope.subscribeToBlogs = function() {
    if ($scope.subscribeForm.email == '') {
      return;
    }
    $http({
      method: 'POST',
      url: erpUrl + '/api/marketing/conatacts/',
      data: {
        email: $scope.subscribeForm.email,
        source: $rootScope.source
      }
    }).then(function(response) {
      Flash.create('success', 'Subscribed');
    })

    $scope.subscribeForm.blogSubscribed = true

    $rootScope.setCookie("visitorDetails", JSON.stringify({
      uid: JSON.parse($scope.visitorDetails).uid,
      name: JSON.parse($scope.visitorDetails).name,
      email: $scope.subscribeForm.email,
      visitorPk: $rootScope.visitorPk,
      blogSubscribed: $scope.subscribeForm.blogSubscribed
    }), 365);

    $http({
      method: 'PATCH',
      url: '/api/ERP/visitor/' + $rootScope.visitorPk + '/',
      data: {
        blogsSubscribed: true,
        email: $scope.subscribeForm.email
      }
    }).then(function(response) {
      console.log(response.data);
    })
  }

});




app.directive('fileModel', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function() {
        scope.$apply(function() {
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);
