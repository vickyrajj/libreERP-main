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
      templateUrl: '/ngTemplates/career.html',
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
      // controller: 'controller.ncert'
    })
  $stateProvider
    .state('policy', {
      url: "/policy",
      templateUrl: '/ngTemplates/policy.html',
      // controller: 'controller.policy'
    })
  $stateProvider
    .state('refund', {
      url: "/refund",
      templateUrl: '/ngTemplates/refund.html',
      // controller: 'controller.refund'
    })
  $stateProvider
    .state('terms', {
      url: "/terms",
      templateUrl: '/ngTemplates/terms.html',
      // controller: 'controller.terms'
    })
  $stateProvider
    .state('desclaimer', {
      url: "/desclaimer",
      templateUrl: '/ngTemplates/desclaimer.html',
      // controller: 'controller.terms'
    })
  $stateProvider
    .state('disclaimer', {
      url: "/disclaimer",
      templateUrl: '/ngTemplates/disclaimer.html',
      controller: 'controller.disclaimer'
    })
  $stateProvider
    .state('exam', {
      url: "/exam",
      templateUrl: 'static/ngTemplates/app.homepage.exam.html',
      controller: 'controller.exam'
    })
  $stateProvider
    .state('examresults', {
      url: "/examresults",
      templateUrl: 'static/ngTemplates/app.homepage.examresults.html',
      params: {
        'attempt': null,
        'notattempt': null,
        'reviewed': null,
        'notview': null,
        'answerlist': null
      },
      controller: 'controller.examresults'
    })

});

app.controller('controller.examresults', function($rootScope, $scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce, Flash) {
  console.log($stateParams.answerlist);
  $scope.arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
  $scope.summary = $stateParams;
  $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  $scope.series = ['Series A', 'Series B'];

  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
})

app.controller('controller.exam', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce, Flash) {
  $scope.questionList = [{

      Question: 'Nunc gravida neque nec neque rutrum elementum.',
      Options: [
        'vitae',
        'turpis',
        'egestas',
        'elementum'
      ],
      savedIndex: null
    },
    {
      Question: 'Fusce euismod nisi vitae magna faucibus dignissim vitae in lectus.',
      Options: [
        'blap',
        'bluri',
        'bleep',
        'bramp'
      ],
      savedIndex: null
    },
    {
      Question: 'Curabitur bibendum velit in magna scelerisque, ac sodales nisl ornare.',
      Options: [
        'Nullam',
        'mollis',
        'lacus',
        'scelerisque'
      ],
      savedIndex: null
    },
    {
      Question: 'Vestibulum porta neque vitae turpis egestas elementum.',
      Options: [
        'Integer',
        'sodales',
        'finibus',
        'ultricies'
      ],
      savedIndex: null
    },
    {
      Question: 'Nam tempus ante pellentesque, molestie mi id, fringilla velit.',
      Options: [
        'Suspendisse',
        'hendrerit',
        'volutpat',
        'scelerisque'
      ],
      savedIndex: null
    },
    {
      Question: 'Nullam non risus in nisi sollicitudin consequat.',
      Options: [
        'Quisque',
        'porttitor',
        'tempor',
        'vulputate'
      ],
      savedIndex: null
    },
    {
      Question: 'Etiam ultricies sem ac ipsum venenatis molestie.',
      Options: [
        'Etiam',
        'blandit',
        'porttitor',
        'sollicitudin'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Proin vitae sem consequat, dapibus elit sit amet, malesuada odio.',
      Options: [
        'Pellentesque',
        'scelerisque',
        'elementum',
        'Nullam'
      ],
      savedIndex: null
    },
    {
      Question: 'Etiam ultricies sem ac ipsum venenatis molestie.',
      Options: [
        'Etiam',
        'blandit',
        'porttitor',
        'sollicitudin'
      ],
      savedIndex: null
    },


  ];
  $scope.options
  $scope.count = 0

  $scope.selections = []
  for (var i = 0; i < $scope.questionList.length; i++) {
    $scope.selections.push(null)
  }
  $scope.selection = function(questionno, answerno) {
    $scope.selections[questionno] = answerno;
    $scope.questionList[questionno].savedIndex = answerno;
    console.log(questionno, answerno);
    console.log($scope.selections, );
  }
  $scope.save = function(val) {


    if ($scope.count == $scope.questionList.length - 1) {
      $scope.count = $scope.count;
      $scope.questionList[val].status = 'answered';
    } else {
      if ($scope.questionList[val].savedIndex != null) {
        $scope.count = $scope.count + 1;
        $scope.questionList[val].status = 'answered';
        $scope.questionList[$scope.count].status = 'notanswered';
      } else {

        // Flash.create('danger','Please Select One Option')
        Flash.create('warning', 'Please Mention The Name');
        return
      }
    }


  }
  $scope.review = function(val) {
    if ($scope.count == $scope.questionList.length - 1) {
      $scope.count = $scope.count;
      if ($scope.questionList[val].savedIndex != null) {
        $scope.questionList[val].status = 'attemptreviewed';
      } else {
        $scope.questionList[val].status = 'reviewed';
      }
    } else {
      if ($scope.questionList[val].savedIndex != null) {
        $scope.count = $scope.count + 1;
        $scope.questionList[val].status = 'attemptreviewed';
        $scope.questionList[$scope.count].status = 'notanswered';
      } else {
        console.log('nooooooo');
        $scope.count = $scope.count + 1;
        $scope.questionList[val].status = 'reviewed';
        $scope.questionList[$scope.count].status = 'notanswered';
        // Flash.create('danger','Please Select One Option')
        Flash.create('warning', 'Please Select The option');
        return
      }
    }

  }
  $scope.clearselection = function(val) {
    $scope.selections[val] = null;
    $scope.questionList[val].status = 'notanswered';
    $scope.questionList[val].savedIndex = null;
  }
  $scope.queclick = function(val) {

    $scope.count = val;
    if ($scope.questionList[val].status != 'answered' && $scope.questionList[val].status != 'reviewed' && $scope.questionList[val].status != 'attemptreviewed') {
      $scope.questionList[val].status = 'notanswered'
    }
  }
  $scope.finish = function(answerlist, questions) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.homepage.examsubmit.html',
      size: 'md',
      backdrop: true,
      resolve: {
        questions: function() {
          return questions;
        },
        answerlist: function() {
          return answerlist;
        }
      },

      controller: function($scope, questions, $uibModalInstance, answerlist) {
        console.log(answerlist, 'llllll');
        $scope.questions = questions
        $scope.attempted = 0;
        $scope.notAnswered = 0;
        $scope.reviewed = 0;
        $scope.attemptedreview = 0;
        $scope.notview = 0;
        for (var i = 0; i < $scope.questions.length; i++) {
          if ($scope.questions[i].status == 'answered') {
            $scope.attempted += 1;
          } else if ($scope.questions[i].status == 'notanswered') {
            $scope.notAnswered += 1;
          } else if ($scope.questions[i].status == 'reviewed') {
            $scope.reviewed += 1;
          } else if ($scope.questions[i].status == 'attemptreviewed') {
            $scope.attemptedreview += 1;
          } else {
            $scope.notview += 1;
          }

        }
        $scope.arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        $scope.submit = function() {
          $uibModalInstance.close();
          $scope.params = {
            'attempt': $scope.attempted + $scope.attemptedreview,
            'notattempt': $scope.notAnswered,
            'reviewed': $scope.reviewed,
            'notview': $scope.notview,
            'answerlist': answerlist
          }

          $state.go("examresults", $scope.params);
        }
        $scope.closeModal = function() {
          $uibModalInstance.dismiss();
        }

      },
    })
  }
});


app.controller('controller.courses', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {


  $scope.bookscontent = [{
      'class': 'head1',
      'title': '01. Ncert Maths',
      'chapter': [{
          'page': '1',
          'content': '1a. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '3',
          'content': '1b. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '5',
          'content': '1c. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '8',
          'content': '1d. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '12',
          'content': '1e. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '14',
          'content': '1f. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '17',
          'content': '1g. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },


      ]
    },
    {
      'class': 'head1',
      'title': '02. Ncert Science',
      'chapter': [{
          'page': '1',
          'content': '2a. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '3',
          'content': '2b. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '5',
          'content': '2c. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '8',
          'content': '2d. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '12',
          'content': '2e. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '14',
          'content': '2f. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '19',
          'content': '2g. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },
        {
          'page': '20',
          'content': '2h. Lorem ipsum dolor sit amet, consectetur adipisicing elit',
        },


      ]
    },
  ];
  $scope.items = [{
      "class1": "click1",
      "class2": "class1",
      "click": "clicks(1)",
      "head": 'Books',

    },
    {
      "class1": "click2",
      "class2": "class2",
      "click": "clicks(2)",
      "head": 'Videos',

    },
    {
      "class1": "click3",
      "class2": "class3",
      "click": "clicks(3)",
      "head": 'Test Series',

    },
    {
      "class1": "click4",
      "class2": "class4",
      "click": "clicks(4)",
      "head": 'Forums',

    },
    {
      "class1": "click5",
      "class2": "class5",
      "click": "clicks(5)",
      "head": 'Lecture Notes',

    }
  ];


  $scope.properties = {
    URLhashListener: true,
    startPosition: 'URLHash',
    loop: false,
    items: 1,
  };

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



  $scope.clicks = function(val) {
    if (val == 1) {
      console.log('llllll');
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




  $scope.headclick = function(val) {;
    $scope.bookscontent[val].view = !$scope.bookscontent[val].view;
  }
  $scope.loadcontent = function(val, length) {
    console.log(length);
    $scope.bookscontent[val].view1 = !$scope.bookscontent[val].view1;
    $scope.len = length;



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

      controller: function($scope, ) {
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



app.controller('main', function($scope, $state, $http, $timeout, $interval, $uibModal, $rootScope, Flash) {


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
