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
      var visitorPk = JSON.parse(visitorDetails).visitorPk
      createActivity()
    } else {
      var uid = new Date().getTime()
      var visitorPk;
      $http({
        method: 'POST',
        url: '/api/ERP/visitor/',
        data: {
          uid: uid
        }
      }).
      then(function(response) {
        visitorPk = response.data.pk;
        createActivity()
        $rootScope.setCookie("visitorDetails", JSON.stringify({
          uid: response.data.uid,
          name: "",
          email: "",
          visitorPk: response.data.pk
        }), 365);
      })

    }

    function createActivity() {
      if ($rootScope.newTime) {
        $rootScope.timeSpentInSec = (new Date().getTime() - $rootScope.newTime) / 1000;
        console.log(from.name, $rootScope.timeSpentInSec, uid);
        toSend = {
          visitor: visitorPk,
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
    .state('industry', {
      url: "/industry",
      templateUrl: '/static/ngTemplates/app.homepage.industry.html',
      // controller: 'controller.industry'
    })

  $stateProvider
    .state('bpo', {
      url: "/bpo",
      templateUrl: '/static/ngTemplates/app.homepage.bpo.html',
      // controller: 'controller.bpo'
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
      templateUrl: '/static/ngTemplates/app.homepage.career.html',
      // controller: 'controller.ecommerce.PagesDetails'
    })

  $stateProvider
    .state('pricing', {
      url: "/pricing",
      templateUrl: '/static/ngTemplates/app.homepage.pricing.html',
      controller: 'controller.pricing'
    })

  $stateProvider
    .state('conatact_us', {
      url: "/conatact_us",
      templateUrl: '/static/ngTemplates/app.homepage.contact_us.html',
      // controller: 'controller.ecommerce.PagesDetails'
    })

  $stateProvider
    .state('remote', {
      url: "/remote",
      templateUrl: '/static/ngTemplates/app.homepage.remote.html',
      // controller: 'controller.ecommerce.PagesDetails'
    })

  $stateProvider
    .state('training', {
      url: "/training",
      templateUrl: '/static/ngTemplates/app.homepage.training.html',
      // controller: 'controller.ecommerce.PagesDetails'
    })
  $stateProvider
    .state('impliment', {
      url: "/impliment",
      templateUrl: '/static/ngTemplates/app.homepage.impliment.html',
      // controller: 'controller.ecommerce.PagesDetails'
    })
  $stateProvider
    .state('rpa', {
      url: "/rpa",
      templateUrl: '/static/ngTemplates/app.homepage.rpa.html',
      // controller: 'controller.ecommerce.PagesDetails'
    })
  $stateProvider
    .state('finance', {
      url: "/finance",
      templateUrl: '/static/ngTemplates/app.homepage.finance.html',
      // controller: 'controller.ecommerce.PagesDetails'
    })
  $stateProvider
    .state('pages', {
      url: "/:title",
      templateUrl: '/static/ngTemplates/app.homepage.page.html',
      // controller: 'controller.ecommerce.PagesDetails'
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


app.controller('controller.pricing', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce, $aside) {


  $http({
    method: 'GET',
    url: erpUrl + '/api/marketing/leads/'
  }).then(function(response) {
    console.log(response.data);
  })

  $scope.contactSales = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.homepage.contactSale.modal.html',
      size: 'lg',
      backdrop: true,
      controller: function($scope, Flash, $uibModalInstance) {
        $scope.thankYou = false;

        $scope.refresh = function() {
          $scope.form = {
            firstName: '',
            lastName: '',
            emailId: '',
            mobileNumber: '',
            requirements: '',
            jobLevel: '',
            comapany: '',
            companyCategory: '',
            companyExpertise: '',
            country: ''
          }

          $scope.companyCategory = ['Please Select', 'Automative', 'Banking', 'Biotechnology', 'Construction', 'Chemicals', 'Consulting', 'Education', 'Electroncics', 'Entertainment', 'Finance', 'Food & Bevarage', 'Government', 'Healthcare', 'IT', 'Insurance', 'Machinery', 'Manufacturing', 'Pharmaceuticals', 'Retail', 'Public Sector', 'Telecommunications', 'Transport', 'Other']
          $scope.jobLevel = ['Please Select', 'Individual Contributor', 'Manager', 'Director', 'Vice President', 'Executive', 'Other'];
          $scope.companyExpertise = ['Please Select', 'Administrative', 'Analyst/Consultancy/Advisor', 'Account & Financing', 'Product', 'HR', 'Marketing', 'IT/Developer/Engineer', 'Legal', 'Purchasing', 'Sales', 'Other']
          $scope.country = ['Please Select', 'India', 'Other']

        }
        $scope.refresh()

        $scope.connect = function() {
          if ($scope.form.firstName == '' || $scope.form.emailId == '' || $scope.form.requirements == '' || $scope.form.comapny == '') {
            return;
          }
          var toSend = { ...$scope.form
          };
          toSend.name = $scope.form.firstName + ' ' + $scope.form.lastName;
          delete toSend.firstName;
          delete toSend.lastName;

          console.log(toSend);


          $http({
            method: 'POST',
            url: erpUrl + '/api/marketing/leads/',
            data: toSend
          }).then(function(response) {
            console.log(response.data);
            $scope.refresh();
            $scope.thankYou = true;
          })
        }

        $scope.closeModal = function() {
          $uibModalInstance.dismiss();
        }
      },
    })
  }

  $scope.generateApiKey = function() {
    // $aside.open({
    //   templateUrl : '/static/ngTemplates/app.homepage.generateApiKey.modal.html',
    //   placement: 'right',
    //   size: 'md',
    //   backdrop : true,
    //   controller: function($scope,Flash) {
    //
    //
    //   }
    // })

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.homepage.generateApiKey.modal.html',
      size: 'md',
      backdrop: true,
      controller: function($scope, Flash, $uibModalInstance, $timeout) {

        $timeout(function() {
          document.getElementById('otp').classList.add("till");
        }, 100);

        $scope.otpSent = false;
        $scope.invalidEmail = false;
        $scope.refresh = function() {
          $scope.form = {
            email: '',
            otp: '',
            apiKey: ''
          }
          $scope.apiKey = ''
        }

        $scope.refresh()
        $scope.$watch('form.email', function(newValue, oldValue) {
          if ($scope.invalidEmail) {
            $scope.invalidEmail = false;
          }
        })

        $scope.sendOtp = function() {
          if ($scope.form.email == '') {
            return;
          }
          if ($scope.form.email.includes('gmail') || $scope.form.email.includes('outlook') || $scope.form.email.includes('yahoo')) {
            $scope.invalidEmail = true;
            return;
          }
          $http({
            method: 'POST',
            url: erpUrl + '/api/ERP/generateApiKey/',
            data: {
              email: $scope.form.email
            }
          }).then(function(response) {
            $scope.otpSent = true;
          })
        }
        $scope.correctOtp = true;
        $scope.submitOtp = function() {
          if ($scope.form.otp.length < 4 || $scope.form.otp.length > 4) {
            $scope.correctOtp = false;
            return
          }

          $scope.correctOtp = true;
          $scope.apiKey = 'SDFSDFSsdfSDfsdfsdWERwerQQ!@#123123sgsgsGSDFFFFFFf'
          document.getElementById('otp').classList.remove("till");
          document.getElementById('confirm').classList.add("till");

          // $http({
          //   method:'POST',
          //   url:'/api/ERP/generateApiKey/',
          //   data:{email:$scope.form.email, otp: ''}
          // }).then(function (response) {
          //   $scope.correctOtp = true;
          //   $scope.apiKey = 'SDFSDFSsdfSDfsdfsdWERwerQQ!@#123123sgsgsGSDFFFFFFf'
          //   document.getElementById('otp').classList.remove("till");
          //   document.getElementById('confirm').classList.add("till");
          // })

        }
        $scope.copied = false;
        $scope.copyAPI = function(id) {
          var from = document.getElementById(id);
          var range = document.createRange();
          window.getSelection().removeAllRanges();
          range.selectNode(from);
          window.getSelection().addRange(range);
          document.execCommand('copy');
          window.getSelection().removeAllRanges();
          $scope.copied = true;
          $timeout(function() {
            $scope.copied = false;
          }, 1000);
        }

        $scope.closeModal = function() {
          $uibModalInstance.dismiss();
        }
      },
    })


  }

});

app.controller('controller.index', function($scope, $state, $http, $timeout, $interval, $uibModal, $rootScope, $sce) {
  $scope.properties = {
    // autoHeight:true,
    // animateIn: 'fadeIn',
    lazyLoad: true,
    items: 6,
    loop: true,
    autoplay: true,
    autoplayTimeout: 3000,
    dots: false
  };


  // $scope.articles = [{
  //     date: new Date(),
  //     title: 'das',
  //     description: "",
  //     link: '/',
  //     image: '/static/images/some.jpg'
  //   },
  //   {
  //     date: new Date(),
  //     title: 'das',
  //     description: "",
  //     link: '/',
  //     image: '/static/images/some.jpg'
  //   },
  //   {
  //     date: new Date(),
  //     title: 'das',
  //     description: "",
  //     link: '/',
  //     image: '/static/images/some.jpg'
  //   },
  //   {
  //     date: new Date(),
  //     title: 'das',
  //     description: "",
  //     link: '/',
  //     image: '/static/images/some.jpg'
  //   },
  //   {
  //     date: new Date(),
  //     title: 'das',
  //     description: "",
  //     link: '/',
  //     image: '/static/images/some.jpg'
  //   },
  // ]

  $scope.fetchBlogs = function() {
    $http.get('/api/PIM/blog/?limit=6').
    then(function(response) {
      $scope.articles = response.data.results;
      $scope.articles[0].header = $sce.trustAsHtml($scope.articles[0].header);
    })
  }
  $scope.fetchBlogs();

  $scope.openBlog = function(name, pk) {
    $state.go('blogDetails', {
      name: name + '&' + pk
    })
  }


  $scope.friends = [{
      name: 'John',
      age: 25,
      dp: '/static/images/airbus-logo.png'
    },
    {
      name: 'Mary',
      age: 40,
      dp: '/static/images/amad.png'
    },
    {
      name: 'Peter',
      age: 85,
      dp: '/static/images/autodesk-logo.png'
    },
    {
      name: 'Peter',
      age: 85,
      dp: '/static/images/benchmark.png'
    },
    {
      name: 'Peter',
      age: 85,
      dp: '/static/images/direct-line-group-logo.png'
    },
  ];


  $scope.brands = [{
      name: 'apache',
      age: 0,
      dp: '/static/images/apache.png'
    },
    {
      name: 'blender',
      age: 1,
      dp: '/static/images/blender.png'
    },
    {
      name: 'dis',
      age: 2,
      dp: '/static/images/dis.png'
    },
    {
      name: 'dropbox',
      age: 3,
      dp: '/static/images/dropbox.jpg'
    },
    {
      name: 'ima',
      age: 4,
      dp: '/static/images/ima.png'
    },
    {
      name: 'noname',
      age: 5,
      dp: '/static/images/noname.png'
    },
    {
      name: 'skill',
      age: 6,
      dp: '/static/images/skill.png'
    },
    {
      name: 'zendesk',
      age: 7,
      dp: '/static/images/zendesk.png'
    },
  ];


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


  $scope.elementInViewport = function(el) {
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
              visitorPk: JSON.parse($scope.visitorDetails).visitorPk,
            }), 365);
          }


          var dataToSend = {
            dated: $scope.form.dated.toJSON().split('T')[0],
            slot: $scope.form.slot,
            emailId: $scope.form.emailId,
            name: $scope.form.name,
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
              $scope.refresh()
            });

            $scope.visitorDetails = $rootScope.getCookie("visitorDetails");
            $http({
              method: 'PATCH',
              url: '/api/ERP/visitor/' + JSON.parse($scope.visitorDetails).visitorPk + '/',
              data: {
                demoRequested: true,
                email: JSON.parse($scope.visitorDetails).email,
                name: JSON.parse($scope.visitorDetails).name
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
    if (JSON.parse($scope.visitorDetails).email != '' && JSON.parse($scope.visitorDetails).email != undefined) {
      $scope.subscribeForm = {
        email: JSON.parse($scope.visitorDetails).email
      }
    }
  } else {
    $scope.subscribeForm = {
      email: ''
    }
  }


  $scope.blogSubscribed = false;


  $scope.subscribeToBlogs = function() {

    if ($scope.subscribeForm.email == '') {
      return;
    }

    $http({
      method: 'POST',
      url: erpUrl + '/api/marketing/conatacts/',
      data: {
        email: $scope.subscribeForm.email
      }
    }).then(function(response) {
      Flash.create('success', 'Subscribed');
    })



    if ($scope.visitorDetails != "") {
      $rootScope.setCookie("visitorDetails", JSON.stringify({
        uid: JSON.parse($scope.visitorDetails).uid,
        name: JSON.parse($scope.visitorDetails).name,
        email: $scope.subscribeForm.email,
        visitorPk: JSON.parse($scope.visitorDetails).visitorPk,
      }), 365);
    }

    $http({
      method: 'PATCH',
      url: '/api/ERP/visitor/' + JSON.parse($scope.visitorDetails).visitorPk + '/',
      data: {
        blogsSubscribed: true,
        email: $scope.subscribeForm.email
      }
    }).then(function(response) {
      console.log(response.data);
      $scope.subscribeForm = {
        email: ''
      }
      $scope.blogSubscribed = true;
      Flash.create('success', 'Subscribed');
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

app.controller('careers.modal.apply', function($scope, $state, $http, $timeout, $uibModal, data, $uibModalInstance, $sce) {
  $scope.job = data;
  console.log($scope.job);
  var emptyFile = new File([""], "");
  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css: '/static/css/bootstrap.min.css',
    inline: false,
    plugins: 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme: 'modern',
    height: 300,
    toolbar: 'undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
    setup: function(editor) {
      // editor.addButton();
    },
  };
  if ($scope.job.skill != null && $scope.job.skill.length > 0) {
    $scope.job.skill = $sce.trustAsHtml($scope.job.skill);
  }
  $scope.resetForm = function() {
    $scope.form = {
      'firstname': '',
      'lastname': '',
      'email': '',
      'mobile': '',
      'coverletter': '',
      'resume': emptyFile,
      'aggree': true
    }
  }

  $scope.resetForm();
  $scope.rsD = ''
  $scope.msg = ''
  $scope.save = function() {
    console.log($scope.form, 'aaaaaaaaaaa');
    var f = $scope.form;
    if (f.firstname.length == 0) {
      return
    }
    if (f.email.length == 0) {
      return
    }
    if (f.aggree == false) {
      return
    }
    if (f.mobile.length == 0) {
      return
    }
    $scope.rsD = ''
    if (f.resume == emptyFile) {
      $scope.rsD = 'Please Upload Resume In PDF Formate'
      return
    }
    var r = f.resume.name.split('.')[1]
    console.log(r);
    if (r != 'pdf') {
      $scope.rsD = 'Please Upload Resume In PDF Formate'
      return
    }
    var url = '/api/recruitment/jobsList/';
    var fd = new FormData();
    console.log(f.resume, 'aaaaaaaa');
    // if (f.resume != null && f.resume != emptyFile) {
    //   console.log("aaaaaaaaaa");
    // }
    fd.append('resume', f.resume)
    fd.append('firstname', f.firstname);
    fd.append('email', f.email);
    fd.append('mobile', f.mobile);
    fd.append('job', $scope.job.pk);
    if (f.aggree) {
      fd.append('aggree', f.aggree);
    }
    if (f.coverletter.length > 0) {
      fd.append('coverletter', f.coverletter);
    }
    if (f.lastname.length > 0) {
      fd.append('lastname', f.lastname);
    }

    console.log(fd, 'aaaaaaaaaaaaaa');
    var method = 'POST';

    $http({
      method: method,
      url: url,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      console.log(response.data);
      if (response.data.res == 'Sucess') {
        $scope.resetForm();
        $scope.msg = 'Applied Sucessfully'
        $timeout(function() {
          $uibModalInstance.dismiss();
        }, 3000);
      } else {
        $scope.msg = 'Errors In The Form'
      }
    })
  }


  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };



})
