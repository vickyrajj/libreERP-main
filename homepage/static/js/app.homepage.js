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
      // controller: 'controller.index'
    })
  $stateProvider
    .state('rpa_2019', {
      url: "/rpa_2019",
      templateUrl: '/static/ngTemplates/app.homepage.rpa_2019.html',
      // controller: 'controller.index'
    })
  $stateProvider
    .state('resources', {
      url: "/resources",
      templateUrl: '/static/ngTemplates/app.homepage.resources.html',
      controller: 'controller.resource'
    })


  $stateProvider
    .state('watchVideo', {
      url: "/watch/:name",
      templateUrl: '/static/ngTemplates/app.homepage.play.html',
      controller: 'controller.resource'
    })
  $stateProvider
    .state('resource_explore', {
      url: "/resources/:name",
      templateUrl: '/static/ngTemplates/app.homepage.guide.html',
      controller: 'controller.resource'
    })
  $stateProvider
    .state('custom', {
      url: "/custom_item/:name",
      templateUrl: '/static/ngTemplates/app.homepage.custom_items.html',
      controller: 'controller.resource'
    })
  $stateProvider
    .state('custom_detail', {
      url: "/custom_detail/:name",
      templateUrl: '/static/ngTemplates/app.homepage.custom_details.html',
      controller: 'controller.resource'
    })
  $stateProvider
    .state('doc', {
      url: "/docs/:name",
      templateUrl: '/static/ngTemplates/app.homepage.documentation.html',
      controller: 'controller.resource'
    })
  $stateProvider
    .state('chatbot', {
      url: "/chatbot",
      templateUrl: '/static/ngTemplates/app.homepage.chatbot.html',
      // controller: 'controller.ecommerce.PagesDetails'
    })
  $stateProvider
    .state('pdf_process', {
      url: "/pdf_process",
      templateUrl: '/static/ngTemplates/app.homepage.pdf_process.html',
      controller: 'controller.pdfprocess'
    })
  $stateProvider
    .state('nlp', {
      url: "/nlp",
      templateUrl: '/static/ngTemplates/app.homepage.nlp.html',
      controller: 'controller.nlp'
    })
  $stateProvider
    .state('excel_automation', {
      url: "/excel_automation",
      templateUrl: '/static/ngTemplates/app.homepage.excel_automation.html',
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

app.controller('controller.pdfprocess', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {
  $scope.properties = {
    // autoHeight:true,
    // animateIn: 'fadeIn',
    lazyLoad: true,
    items: 1,
    loop: true,
    autoplay: true,
    autoplayTimeout: 3000,
    dots: false,
    URLhashListener: true,
    autoplayHoverPause: true,
    startPosition: 'URLHash',
  };
  $scope.images = [{
      img: '/static/images/visual1.jpg',
      title: 'ABBYY Solutions',
      head: 'Content Intelligence for Robotic Process Automation (RPA)',
      para: 'Make robots smarter by turning unstructured content into structured, actionable information.',
      headcol: '#9AECFF',
      paracol: '#fff',
      btn1: 'LEARN MORE',
      btn2: 'DOWNLOAD  PAPER',

    },
    {
      img: '/static/images/visual2.jpg',
      title: 'ABBYY FineReader Engine',
      head: 'The most comprehensive OCR SDK for developers',
      para: 'Add text extraction, document conversion and classification to your software by integrating premium OCR technology.',
      headcol: '#9AECFF',
      paracol: '#fff',
      btn1: 'LEARN MORE',
      btn2: 'REQUEST TRAIL',
    },
    {
      img: '/static/images/visual3.jpg',
      title: 'ABBYY FineReader 14',
      head: 'Your documents in action',
      para: 'Edit, convert, and compare PDFs and scans ',
      headcol: '#fff',
      paracol: '#fff',
      btn1: 'LEARN MORE',
      btn2: 'DOWNLOAD TRAIL',
    },
    {
      img: '/static/images/visual4.jpg',
      title: 'ABBYY Real-Time Recognition SDK',
      head: 'Point and capture',
      para: 'New developer toolkit: texts viewed through smartphones instantly extracted and used in your app',
      headcol: '#fff',
      paracol: '#fff',
      btn1: 'MORE INFO',
      btn2: 'REQUEST TRAIL',
    },
    {
      img: '/static/images/visual5.jpeg',
      title: '',
      head: 'Accounts payablewhite pape',
      para: 'The Value of Intelligent Capture in Accounts Payable Automation',
      headcol: '#416678',
      paracol: '#000',
      btn1: 'REQUEST WITH PAPER',
    },
  ]
  $scope.property = {
    // autoHeight:true,
    // animateIn: 'fadeIn',
    lazyLoad: true,
    loop: true,
    autoplay: true,
    autoplayTimeout: 3000,
    dots: false,
    URLhashListener: true,
    autoplayHoverPause: true,
    startPosition: 'URLHash',
    responsiveClass: true,
    responsive: {
      0: {
        items: 1.5,

      },
      768: {
        items: 3,

      },
      1000: {
        items: 4,

      }
    }
  };

  $scope.navimg = [{
      img: '/static/images/nav1.jpg',
      text: 'Banking and Finance'
    },
    {
      img: '/static/images/nav2.jpg',
      text: 'Legal'
    },
    {
      img: '/static/images/nav3.jpg',
      text: 'Healthcare'
    },
    {
      img: '/static/images/nav4.jpg',
      text: 'Government'
    },
    {
      img: '/static/images/nav5.jpg',
      text: 'Insurance'
    },
    {
      img: '/static/images/nav6.jpg',
      text: 'Transportation'
    },
    {
      img: '/static/images/nav7.jpg',
      text: 'BPO'
    },
    {
      img: '/static/images/nav8.jpg',
      text: 'Education'
    },
  ]
});

app.controller('controller.resource', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {

  $scope.openResource = function(name) {
    $state.go('resource_explore', {
      name: name
    })
  }
  $scope.watchVideo = function(name, idx) {
    console.log(name + ' ' + idx);
    $state.transitionTo('watchVideo', {
      name: name + '&' + idx
    })
    // $state.transitionTo('watchVideo', {
    //   name: name + '&' + idx
    // }, {
    //   location: true,
    //   inherit: true,
    //   relative: $state.$current,
    //   notify: false
    // })
  }
  $scope.openCustom = function(name) {
    $state.go('custom', {
      name: name
    })
  }
  $scope.custom_detail = function(name, idx) {
    $state.go('custom_detail', {
      name: name + '&pk=' + idx
    })
  }

  $scope.openDoc = function(name) {
    $state.go('doc', {
      name: name
    })
  }

  $scope.show_benefit = true;
  $scope.show_dependencies = false;
  $scope.show_compatibility = false;
  $scope.l1 = "the background automation is very fast and the automation is safe because it’s totally independent from your web browsers and the salesforce layout";
  $scope.l2 = "implementation time is 5 to 10 times faster compared to traditional Ui-Automation. The speed of the activities are due to the wizards, which allow you to test everything during the design time. This significantly minimizes the testing time to almost no time at all. In a normal implementation, testing time is huge and lasts much longer than the design time.";
  $scope.l3 = "interactions between the robot and the software are greatly reduced, leading to a reduction in the number of errors. For example, in a normal Ui-Automation on Salesforce, a simple process takes two minutes and 40 seconds. This means it interacts with the web page approximately 85 times. The component, on the other hand takes about 11 seconds and interacts with the webpage only eight times, greatly minimizing the risk of error.";
  $scope.dependencies_content = "Salesforce REST API enabled.";
  $scope.compatibility_content = "Component is compatible with any Salseforce systems with version higher that V.42 (Spring 2018) .UiPath Studio 2017.1";

  $scope.changeview = function(val) {
    if (val == 'benefit') {
      $scope.show_benefit = true;
      $scope.show_dependencies = false;
      $scope.show_compatibility = false;
    } else if (val == 'dependencies') {
      $scope.show_benefit = false;
      $scope.show_dependencies = true;
      $scope.show_compatibility = false;
    } else if (val == 'compatibility') {
      $scope.show_benefit = false;
      $scope.show_dependencies = false;
      $scope.show_compatibility = true;
    }

  }
});
app.controller('controller.nlp', function($scope, $state, $http, $timeout, $interval, $uibModal) {

  $scope.show_c1 = true;
  $scope.show_c2 = false;
  $scope.show_c3 = false;
  $scope.status_c1 = "active"
  $scope.c1 = "NL API has shown it can accelerate our offering in the natural language understanding area and is a viable alternative to a custom model we had built for our initial use case.";
  $scope.c2 = "Classifying Opinion and Editorials can be time-consuming and difficult work for any data science team, but Cloud Natural Language was able to instantly identify clear topics with a high-level of confidence. This tool has saved me weeks, if not months, of work to achieve a level of accuracy that may not have been possible with our in-house resources.";
  $scope.c3 = "In the newsroom, precision and speed are critical to engaging our readers. Google Cloud Natural Language is unmatched in its accuracyfor content classification.AtHearst, we publish several thousand articles a day across 30 + properties and, withnatural language processing, we 're able to quickly gain insight into what content isbeing published and how it resonates with our audiences.";
  $scope.q1 = "Dan Nelson, Head of Data, Ocado Technology"
  $scope.q2 = "Jonathan Brooks-Bartlett, Data Scientist, News UK"
  $scope.q3 = "Naveed Ahmad, Senior Director of Data, Hearst"

  $scope.carousel = function(val) {
    if (val == '0') {
      $scope.show_c1 = true;
      $scope.show_c2 = false;
      $scope.show_c3 = false;
      $scope.status_c1 = "active"
      $scope.status_c2 = ""
      $scope.status_c3 = ""
    } else if (val == '1') {
      $scope.show_c1 = false;
      $scope.show_c2 = true;
      $scope.show_c3 = false;
      $scope.status_c2 = "active"
      $scope.status_c1 = ""
      $scope.status_c3 = ""
    } else if (val == '2') {
      $scope.show_c1 = false;
      $scope.show_c2 = false;
      $scope.show_c3 = true;
      $scope.status_c3 = "active"
      $scope.status_c1 = ""
      $scope.status_c2 = ""

    }

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


app.controller('controller.pricing', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce, $aside, $rootScope) {


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
            company: '',
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

        $scope.visitorDetails = $rootScope.getCookie("visitorDetails");
        if ($scope.visitorDetails != "") {
          $scope.form.firstName = JSON.parse($scope.visitorDetails).name || ''
          $scope.form.emailId = JSON.parse($scope.visitorDetails).email || ''
        }



        $scope.connect = function() {
          if ($scope.form.firstName == '' || $scope.form.emailId == '' || $scope.form.requirements == '' || $scope.form.comapny == '' || $scope.form.mobileNumber == '') {
            return;
          }
          var toSend = { ...$scope.form
          };
          toSend.name = $scope.form.firstName + ' ' + $scope.form.lastName;
          delete toSend.firstName;
          delete toSend.lastName;
          toSend.source = $rootScope.source;

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

        // $scope.otpSent = false;
        // $scope.invalidEmail = false;
        // $scope.apiKeyAlreadySent = false;
        // $scope.loading = false;
        $scope.refresh = function() {
          $scope.form = {
            email: '',
            otp: '',
            apiKey: ''
          }
        }
        $scope.booleanForm = {
          apiKey: '',
          otpSent: false,
          invalidEmail: false,
          apiKeyAlreadySent: false,
          loading: false,
          copied: false,
          correctOtp: true
        }

        $scope.refresh()
        $scope.$watch('form.email', function(newValue, oldValue) {
          if ($scope.booleanForm.invalidEmail) {
            $scope.booleanForm.invalidEmail = false;
          }
          if ($scope.booleanForm.apiKeyAlreadySent) {
            $scope.booleanForm.apiKeyAlreadySent = false;
          }

          if ($scope.booleanForm.loading) {
            $scope.booleanForm.loading = false;
          }
        })

        $scope.$watch('form.otp', function(newValue, oldValue) {
          if (!$scope.booleanForm.correctOtp) {
            $scope.booleanForm.correctOtp = true;
          }
        })

        $scope.sendOtp = function() {
          if ($scope.form.email == '') {
            return;
          }
          if ($scope.form.email.includes('gmail') || $scope.form.email.includes('outlook') || $scope.form.email.includes('yahoo')) {
            $scope.booleanForm.invalidEmail = true;
            return;
          }
          $scope.booleanForm.loading = true;
          $http({
            method: 'POST',
            url: apiManagerUrl + '/api/tools/generateAPIKEY/',
            data: {
              email: $scope.form.email
            }
          }).then(function(response) {
            $scope.booleanForm.loading = false;
            if (response.data.msg == 'Invalid Email') {
              //invlaide emailId
              console.log(response.data.msg);
              $scope.booleanForm.invalidEmail = true;
            } else if (response.data.msg == 'apiKey_exists') {
              //already sent
              // $scope.otpSent = true;
              $scope.booleanForm.apiKeyAlreadySent = true;
              console.log('already sent');
            } else if (response.data.msg == 'otp') {
              $scope.booleanForm.otpSent = true;
              //otp
            }
          })
        }
        $scope.submitOtp = function() {
          if ($scope.form.otp.length != 4) {
            $scope.booleanForm.correctOtp = false;
            return
          }
          $scope.booleanForm.loading = true;
          $http({
            method: 'POST',
            url: apiManagerUrl + '/api/tools/generateAPIKEY/',
            data: {
              email: $scope.form.email,
              otp: $scope.form.otp
            }
          }).then(function(response) {
            $scope.booleanForm.loading = false;
            if (response.data.msg == 'otpError') {
              //ot error
              console.log(response.data.msg);
              $scope.booleanForm.correctOtp = false;
            } else {
              //api key
              console.log(response.data.msg);
              $scope.booleanForm.correctOtp = true;
              $scope.booleanForm.apiKey = response.data.msg;
              document.getElementById('otp').classList.remove("till");
              document.getElementById('confirm').classList.add("till");
            }

          })
        }

        $scope.copyAPI = function(id) {
          var from = document.getElementById(id);
          var range = document.createRange();
          window.getSelection().removeAllRanges();
          range.selectNode(from);
          window.getSelection().addRange(range);
          document.execCommand('copy');
          window.getSelection().removeAllRanges();
          $scope.booleanForm.copied = true;
          $timeout(function() {
            $scope.booleanForm.copied = false;
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
