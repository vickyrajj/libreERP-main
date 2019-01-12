var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'angular-owl-carousel-2', 'ui.bootstrap.datetimepicker', 'flash', 'ngAside']);


app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide, $locationProvider, $urlMatcherFactoryProvider) {

  $urlRouterProvider.otherwise('/');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
  $locationProvider.html5Mode(true);
  $urlMatcherFactoryProvider.strictMode(false);

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
          // console.log(response.data);
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
      templateUrl: '/static/ngTemplates/app.tutorsHomepage.index.html',
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
    .state('services', {
      url: "/services",
      templateUrl: '/static/ngTemplates/app.homepage.services.html',
      controller: 'controller.services'
    })

  $stateProvider
    .state('about', {
      url: "/about",
      templateUrl: '/static/ngTemplates/app.homepage.about.html',
      // controller: 'controller.about'
    })
  $stateProvider
    .state('career', {
      url: "/career",
      templateUrl: '/ngTemplates/tutorsCareer.html',
      // controller: 'controller.about'
    })
  $stateProvider
    .state('testimonials', {
      url: "/testimonials",
      templateUrl: '/static/ngTemplates/app.homepage.testimonials.html',
      controller: 'controller.testimonials'
    })
  $stateProvider
    .state('courses', {
      url: "/courses",
      templateUrl: '/static/ngTemplates/app.homepage.courses.html',
      controller: 'controller.courses'
    })
  $stateProvider
    .state('ncert', {
      url: "/ncert",
      templateUrl: '/static/ngTemplates/app.homepage.ncert.html',
      controller: 'controller.ncert'
    })
  $stateProvider
    .state('policy', {
      url: "/policy",
      templateUrl: '/ngTemplates/tutorsPolicy.html',
      // controller: 'controller.policy'
    })
  $stateProvider
    .state('refund', {
      url: "/refund",
      templateUrl: '/ngTemplates/tutorsRefund.html',
      // controller: 'controller.refund'
    })
  $stateProvider
    .state('terms', {
      url: "/terms",
      templateUrl: '/ngTemplates/tutorsTerms.html',
      // controller: 'controller.terms'
    })
  $stateProvider
    .state('desclaimer', {
      url: "/desclaimer",
      templateUrl: '/ngTemplates/tutorsDisclaimer.html',
      // controller: 'controller.terms'
    })


  $stateProvider
    .state('blogs', {
      url: "/blogs",
      templateUrl: '/static/ngTemplates/app.homepage.blogs.html',
      controller: 'controller.blogs'
    })

  $stateProvider
    .state('blogDetails', {
      url: "/blogs/:name",
      templateUrl: '/static/ngTemplates/app.homepage.blogDetails.html',
      controller: 'controller.blogDetails'
    })

  $stateProvider
    .state('solutions', {
      url: "/hc-verma-solutions",
      templateUrl: '/dynamicTemplates/hc-verma-solutions.html',
      // controller: 'controller.solutions'
    })
  $stateProvider
    .state('chapter', {
      url: "/hc-verma-solutions/:chapterName",
      // templateUrl: '/dynamicTemplates/chapterName',
      templateUrl: function(params) {
        return '/dynamicTemplates/' + params.chapterName + '.html';
      },
      controller: 'controller.chapter'
    })
  $stateProvider
    .state('courseVideo', {
      url: "/courseVideo",
      templateUrl: '/static/ngTemplates/app.homepage.courseVideo.html',
      controller: 'controller.courseVideo'
    })

});

app.controller('controller.ncert', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {


  $http({
    method: 'GET',
    url: '/api/LMS/getLevelsAndBooks/'
  }).then(function(response) {
    console.log(response);

    $scope.levelsAndBooks = response.data.LevelsAndBooks
  }, function(error) {
    console.log(error);
  })

});





app.controller('controller.blogDetails', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {

  console.log($stateParams);

  $scope.blogPk = $stateParams.name.split('&')[1]

  $http.get('/api/PIM/blog/' + $scope.blogPk + '/').
  then(function(response) {
    $scope.blogDetail = response.data
    console.log($scope.blogDetail);

    $scope.blogDetail.source = $sce.trustAsHtml($scope.blogDetail.source);
  })

  $scope.fetchRecentPosts = function() {
    $http.get('/api/PIM/blog/?limit=5').
    then(function(response) {
      console.log(response);
      $scope.recentPosts = response.data.results
    });
  }

  $scope.fetchRecentPosts()


  $scope.openBlog = function(name, pk) {
    $state.go('blogDetails', {
      name: name + '&' + pk
    })
  }

});


app.controller('controller.chapter', function($scope, $rootScope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce, $document) {

  $scope.initiateMath = function() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }


  $scope.menu = false;
  $scope.show_menu = function() {
    console.log('clickedddddd');

    if ($scope.menu == true) {
      $scope.menu = false;
    } else {
      $scope.menu = true;
    }
  }


  function elementInViewport(el) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    while (el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
    }

    return (
      top >= window.pageYOffset &&
      left >= window.pageXOffset &&
      (top + height) <= (window.pageYOffset + window.innerHeight) &&
      (left + width) <= (window.pageXOffset + window.innerWidth)
    );
  }

  $timeout(function() {
    var activeElem = document.getElementById('activeli');
    var isElementinView = elementInViewport(activeElem);

    if (!isElementinView) {
      console.log('scroll');
      var objDiv = document.getElementById("leftSection");
      // objDiv.scrollIntoView()
      // objDiv.scrollTop = objDiv.scrollHeight;
    }

  }, 2000);


  $scope.signin = function() {
    $rootScope.$broadcast('opensignInPopup', {});
  }

  $scope.displ = false;
  $scope.load_q = function(idx) {
    $scope.displ = true;
    $scope.idx = idx
  }
  $scope.toTheTop = function(id) {
    // $document.scrollTopAnimated(0, 5000).then(function() {
    //   console && console.log('You just scrolled to the top!');
    // });
    console.log(id);
    var ele = document.getElementById('q' + id)
    console.log(ele);
    console.log(ele.scrollHeight);
    ele.scrollIntoView();
    $scope.menu = false;
  }

  // window.onscroll = function() {
  //   $scope.flybutton()
  // };
  //
  // $scope.flybutton = function() {
  //   document.getElementById("flybtn").style.display = "block";
  //   document.getElementById("flybtn1").style.display = "block";
  //   setTimeout(function() {
  //     document.getElementById("flybtn").style.display = "none";
  //     document.getElementById("flybtn1").style.display = "none";
  //   }, 1000);
  // }

})
app.controller('controller.courses', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {

  $scope.bookscontent = [{
      'class': 'head1',
      'title': '01. Ncert Maths',
      'chapter': {
        'one': '1a. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        'two': '1b. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        'three': '1c. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        'four': '1d. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        'five': '1e. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        'six': '1f. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        'seven': '1g. Lorem ipsum dolor sit amet, consectetur adipisicing elit'

      }
    },
    {
      'class': 'head1',
      'title': '02. Ncert Science',
      'chapter': {
        'one': '2a. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        'two': '2b. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        'three': '2c. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        'four': '2d. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        'five': '2e. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        'six': '2f. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        'seven': '2g. Lorem ipsum dolor sit amet, consectetur adipisicing elit'
      }
    },
  ];


  $scope.videos = false;
  $scope.books = false;
  $scope.testseries = false;
  $scope.forum = false;
  $scope.refbook = false;
  $scope.click = null;

  $scope.smDevice = function(x) {
    if (x.matches) {
      console.log('trueeeeeeee');
      $scope.device.smallDevice = true;
    }
  }


  $scope.sm = window.matchMedia("(max-width: 768px)")
  $scope.smDevice($scope.sm)
  $scope.sm.addListener($scope.smDevice)

  $scope.clicks = function(val) {
    if (val == 1) {
      $scope.books = !$scope.books;
      $scope.testseries = false;
      $scope.forum = false;
      $scope.videos = false;
      $scope.refbook = false;
      if ($scope.device.smallDevice == true) {

      } else {
        if ($scope.books == true) {
          $scope.class1 = "triangle-hover";
          $scope.class4 = "";
          $scope.class2 = "";
          $scope.class3 = "";
          $scope.class5 = "";
        } else {
          $scope.class1 = "";
          $scope.class4 = "";
          $scope.class2 = "";
          $scope.class3 = "";
          $scope.class5 = "";
        }


      }



    } else if (val == 2) {
      $scope.books = false;
      $scope.testseries = false;
      $scope.forum = false;
      $scope.videos = !$scope.videos;
      $scope.refbook = false;
      if ($scope.device.smallDevice == true) {

      } else {
        if ($scope.videos == true) {
          $scope.class2 = "triangle-hover";
          $scope.class4 = "";
          $scope.class1 = "";
          $scope.class3 = "";
          $scope.class5 = "";
        } else {
          $scope.class1 = "";
          $scope.class4 = "";
          $scope.class2 = "";
          $scope.class3 = "";
          $scope.class5 = "";
        }


      }

    } else if (val == 3) {
      $scope.books = false;
      $scope.testseries = !$scope.testseries;
      $scope.forum = false;
      $scope.videos = false;
      $scope.refbook = false;
      if ($scope.device.smallDevice == true) {

      } else {

        if ($scope.testseries == true) {
          $scope.class3 = "triangle-hover";
          $scope.class1 = "";
          $scope.class4 = "";
          $scope.class2 = "";
          $scope.class5 = "";
        } else {
          $scope.class1 = "";
          $scope.class4 = "";
          $scope.class2 = "";
          $scope.class3 = "";
          $scope.class5 = "";
        }


      }
    } else if (val == 4) {
      $scope.books = false;
      $scope.testseries = false;
      $scope.forum = !$scope.forum;
      $scope.videos = false;
      $scope.refbook = false;
      if ($scope.device.smallDevice == true) {

      } else {
        if ($scope.forum == true) {
          $scope.class4 = "triangle-hover";
          $scope.class1 = "";
          $scope.class2 = "";
          $scope.class3 = "";
          $scope.class5 = "";
        } else {
          $scope.class1 = "";
          $scope.class4 = "";
          $scope.class2 = "";
          $scope.class3 = "";
          $scope.class5 = "";
        }


      }
    } else {
      $scope.books = false;
      $scope.testseries = false;
      $scope.forum = false;
      $scope.videos = false;
      $scope.refbook = !$scope.refbook
      if ($scope.device.smallDevice == true) {

      } else {
        if ($scope.refbook == true) {
          $scope.class5 = "triangle-hover1";
          $scope.class1 = "";
          $scope.class2 = "";
          $scope.class3 = "";
          $scope.class4 = "";
        } else {
          $scope.class1 = "";
          $scope.class4 = "";
          $scope.class2 = "";
          $scope.class3 = "";
          $scope.class5 = "";
        }


      }
    }
  }
  $scope.bgrand = function () {

            return  '#' + Math.floor(Math.random()*16777215).toString(16)


    };
    $scope.arr = [];



  $scope.refbooks = [{
    'name': 'concept of Physics',
    'img': '/static/images/24tut/hcv.jpg',
    'author': 'HC-Verma',
    'detail':'Textbook for class 12'
  }, {
    'name': 'concept of Chemistry',
    'img': '/static/images/24tut/cbook.jpg',
    'author': 'HC-Verma',
    'detail':'Textbook for class 12'
  }, {
    'name': 'concept of Maths',
    'img': '/static/images/24tut/math.jpg',
    'author': 'HC-Verma',
    'detail':'Textbook for class 12'
  }, {
    'name': 'concept of Biology',
    'img': '/static/images/24tut/bio.jpg',
    'author': 'HC-Verma',
    'detail':'Textbook for class 12'

  }, ]
  for (var i = 0; i < $scope.refbooks .length; i++) {
    var color = $scope.bgrand ();
    $scope.arr.push(color)
    // console.log($scope.arr);
  }

  $scope.headclick = function(val) {
    $scope.bookscontent[val].view = !$scope.bookscontent[val].view;
  }
  $scope.loadcontent = function(val) {
    $scope.bookscontent[val].view1 = !$scope.bookscontent[val].view1;
  }

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

app.controller('controller.contact', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {
  $scope.display
})

app.controller('controller.disclaimer', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {})

app.controller('controller.testimonials', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {

  $scope.myObj = {
    "background-color": "#DDF6FB",
  }
  $scope.myObjcolor = {
    "background-color": "#E5E7FC",
  }

});

app.controller('controller.blogs', function($scope, $state, $http, $timeout, $interval, $uibModal) {


  $scope.offset = 0;
  $scope.emailAddress = '';

  $scope.fetchBlogs = function() {
    $scope.blogs = [];
    $http.get('/api/PIM/blog/?limit=14&offset=' + $scope.offset).
    then(function(response) {
      $scope.blogs = response.data.results;
      $scope.firstSection = $scope.blogs.slice(0, 4)
      $scope.second_sec1 = $scope.blogs.slice(4, 7)
      $scope.second_sec2 = $scope.blogs.slice(7, 10)
      $scope.thirdSection = $scope.blogs.slice(10, 14)
    })
  }


  $scope.fetchRecentPosts = function() {
    $http.get('/api/PIM/blog/?limit=5').
    then(function(response) {
      $scope.recentPosts = response.data.results
    });
  }

  $scope.fetchRecentPosts()
  $scope.fetchBlogs()

  $scope.openBlog = function(name, pk) {
    $state.go('blogDetails', {
      name: name + '&' + pk
    })
  }


  $scope.sendUpdates = function() {
    console.log($scope.emailAddress);
  }




  $scope.nextBtn = function() {
    $scope.offset = $scope.offset + 14
    $scope.fetchBlogs()
  }

  $scope.prevBtn = function() {
    if ($scope.offset >= 14) {
      $scope.offset = $scope.offset - 14
      $scope.fetchBlogs()
    }
  }

});

app.controller('controller.blogExplore', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {

  console.log($stateParams);

  $scope.blogPk = $stateParams.name.split('&')[1]

  $http.get('/api/PIM/blog/' + $scope.blogPk + '/').
  then(function(response) {
    $scope.blogDetail = response.data
    console.log($scope.blogDetail);

    $scope.blogDetail.source = $sce.trustAsHtml($scope.blogDetail.source);
  })

  $scope.fetchRecentPosts = function() {
    $http.get('/api/PIM/blog/?limit=5').
    then(function(response) {
      console.log(response);
      $scope.recentPosts = response.data.results
    });
  }

  $scope.fetchRecentPosts()


  $scope.openBlog = function(name, pk) {
    $state.go('blogDetails', {
      name: name + '&' + pk
    })
  }

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

  $scope.active = null
  $scope.drop = function(val) {
    if (val == 0) {
      if ($scope.active == 0) {
        $scope.active = null
      } else {
        $scope.active = 0
      }
    } else if (val == 1) {
      if ($scope.active == 1) {
        $scope.active = null
      } else {
        $scope.active = 1
      }
    } else if (val == 2) {
      if ($scope.active == 2) {
        $scope.active = null
      } else {
        $scope.active = 2
      }

    } else {
      if ($scope.active == 3) {
        $scope.active = null
      } else {
        $scope.active = 3
      }
    }
  }

  $scope.playVideo = function() {

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.homepage.player.html',
      size: 'md',
      backdrop: true,

      controller: function($scope, $uibModalInstance) {
        $scope.close = function() {
          $uibModalInstance.dismiss('cancel');
        }
        $scope.pauseOrPlay = function(ele) {
          var video = angular.element(ele.srcElement);
          video[0].pause(); // video.play()
        }
      },
    })

  }


})

app.controller('controller.enroll', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {

  $scope.active1 = false;
  $scope.active2 = false;
  $scope.active3 = false;
  $scope.active4 = false;
  var addfilter = function(val1, val2, val3) {
    document.getElementById('drop' + val1).classList.add("filter");
    document.getElementById('drop' + val2).classList.add("filter");
    document.getElementById('drop' + val3).classList.add("filter");
  }
  var removefilter = function(val1, val2, val3, val4) {
    document.getElementById('drop' + val1).classList.remove("filter");
    document.getElementById('drop' + val2).classList.remove("filter");
    document.getElementById('drop' + val3).classList.remove("filter");
    document.getElementById('drop' + val4).classList.remove("filter");
  }

  $scope.dropdown = function(val) {
    if (val == 1) {
      if ($scope.active1 == false) {
        console.log('hhh');
        addfilter(2, 3, 4);
        $scope.active2 = false;
        $scope.active3 = false;
        $scope.active4 = false;
        $scope.active1 = true;
      } else {
        console.log('lll');
        removefilter(1, 2, 3, 4)
        $scope.active1 = false;
      }

    } else if (val == 2) {
      if ($scope.active2 == false) {
        addfilter(4, 3, 1);
        $scope.active1 = false;
        $scope.active3 = false;
        $scope.active4 = false;
        $scope.active2 = true;
      } else {
        removefilter(1, 2, 3, 4)
        $scope.active2 = false;
      }

    } else if (val == 3) {
      if ($scope.active3 == false) {
        addfilter(2, 1, 4);
        $scope.active2 = false;
        $scope.active1 = false;
        $scope.active4 = false;
        $scope.active3 = true;
      } else {
        removefilter(1, 2, 3, 4)
        $scope.active3 = false;
      }

    } else if (val == 4) {
      if ($scope.active4 == false) {
        addfilter(2, 3, 1);
        $scope.active2 = false;
        $scope.active3 = false;
        $scope.active1 = false;
        $scope.active4 = true;
      } else {
        removefilter(1, 2, 3, 4)
        $scope.active4 = false;
      }

    }
    // for (var i = 0; i < $scope.list.length; i++) {
    //   document.getElementById('drop' + $scope.list[i]).classList.remove("filter");
    // }
    // $scope.clasname = document.getElementsByClassName('open');
    // if ($scope.clasname.length > 0) {
    //   console.log($scope.mainid,'kkk');
    //     for (var i = 0; i < $scope.list.length; i++) {
    //       $scope.mainid = document.querySelector('.open').id
    //       if($scope.mainid == 'open'){
    //       document.getElementById('drop' + $scope.list[i]).classList.remove("filter");
    //
    //     }else{
    //       if ($scope.list.includes(val)) {
    //         $scope.list.splice(val - 1, 1)
    //         for (var i = 0; i < $scope.list.length; i++) {
    //           document.getElementById('drop' + $scope.list[i]).classList.add("filter");
    //
    //         }
    //     }
    //
    //     }
    //   }
    //
    // } else {
    //   console.log('hhhh');
    //   if ($scope.list.includes(val)) {
    //     $scope.list.splice(val - 1, 1)
    //     for (var i = 0; i < $scope.list.length; i++) {
    //       document.getElementById('drop' + $scope.list[i]).classList.add("filter");
    //
    //     }
    //   }
    // }
    // for (var i = 0; i < $scope.list.length; i++) {
    //   document.getElementById('drop' + $scope.list[i]).classList.remove("filter");
    // }

  }

  $(window).click(function(e) {
    removefilter(1, 2, 3, 4);
    $scope.active1 = false;
    $scope.active2 = false;
    $scope.active3 = false;
    $scope.active4 = false;
  });
  $scope.properties = {
    lazyLoad: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 3000,
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
  $scope.active = null
  $scope.drop = function(val) {
    if (val == 0) {
      if ($scope.active == 0) {
        $scope.active = null
      } else {
        $scope.active = 0
      }
    } else if (val == 1) {
      if ($scope.active == 1) {
        $scope.active = null
      } else {
        $scope.active = 1
      }
    } else if (val == 2) {
      if ($scope.active == 2) {
        $scope.active = null
      } else {
        $scope.active = 2
      }

    } else {
      if ($scope.active == 3) {
        $scope.active = null
      } else {
        $scope.active = 3
      }
    }
  }
})



app.controller('main', function($scope, $state, $http, $timeout, $interval, $uibModal, $rootScope) {

  $rootScope.$state = $state;


  $rootScope.$on('opensignInPopup', function() {
    $scope.signin()
  });


  $scope.signin = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.homepage.signin.html',
      size: 'lg',
      backdrop: false,
      controller: function($scope, $uibModalInstance) {
        $scope.close = function() {
          $uibModalInstance.dismiss('cancel');
        }

        $scope.slideDown = function() {
          $timeout(function() {
            console.log("sliding down");
            var element = document.getElementsByClassName('signup_modal');
            element[0].scrollIntoView({
              block: "end"
            });
          }, 1000)
        }

      },
    })
  }

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
