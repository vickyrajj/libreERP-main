var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'angular-owl-carousel-2', 'ui.bootstrap.datetimepicker', 'flash', 'ngAside']);


app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide, $locationProvider) {

  $urlRouterProvider.otherwise('/');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
  $locationProvider.html5Mode(true);



});

app.run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on("$stateChangeError", console.log.bind(console));
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
      url: "/blogs/:pk",
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
    .state('pages', {
      url: "/:title",
      templateUrl: '/static/ngTemplates/app.homepage.page.html',
      // controller: 'controller.ecommerce.PagesDetails'
    })




});

app.controller('controller.blogDetails', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {

  console.log($stateParams);

  $scope.blogPk = $stateParams.pk

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


});


app.controller('controller.blogs', function($scope, $state, $http, $timeout, $interval, $uibModal) {


  $scope.offset = 0;
  $scope.emailAddress = '';

  $scope.fetchBlogs = function() {
    $http.get('/api/PIM/blog/?limit=14&offset=' + $scope.offset).
    then(function(response) {
      $scope.blogs = response.data.results;

      console.log($scope.blogs);

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

  $scope.openBlog = function(pk) {
    $state.go('blogDetails', {
      pk: pk
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
            comapny: '',
            companyCategory: '',
            companyExpertise: '',
            country: ''
          }

          $scope.companyCategory = ['Automative', 'Banking', 'Biotechnology', 'Construction', 'Chemicals', 'Consulting', 'Education', 'Electroncics', 'Entertainment', 'Finance', 'Food & Bevarage', 'Government', 'Healthcare', 'IT', 'Insurance', 'Machinery', 'Manufacturing', 'Pharmaceuticals', 'Retail', 'Public Sector', 'Telecommunications', 'Transport', 'Other']
          $scope.jobLevel = ['Individual Contributor', 'Manager', 'Director', 'Vice President', 'Executive', 'Other'];
          $scope.companyExpertise = ['Administrative', 'Analyst/Consultancy/Advisor', 'Account & Financing', 'Product', 'HR', 'Marketing', 'IT/Developer/Engineer', 'Legal', 'Purchasing', 'Sales', 'Other']
          $scope.country = ['India', 'Other']


        }
        $scope.refresh()

        $scope.connect = function() {
          if ($scope.form.firstName == '' || $scope.form.emailId == '' || $scope.form.comapny == '' || $scope.form.companyCategory == '' || $scope.form.companyExpertise == '' || $scope.form.country == '') {
            return;
          }
          var toSend = {
            name: $scope.form.firstName + $scope.form.lastName,
            emailId: $scope.form.emailId,
            requirments: $scope.form.requirments,
            role: $scope.form.role
          }
          $http({
            method: 'POST',
            url: erpUrl + '/api/marketing/leads/',
            data: toSend
          }).then(function(data) {
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
      controller: function($scope, Flash, $uibModalInstance) {
        $scope.thankYou = false;
        $scope.refresh = function() {
          $scope.form = {
            email: ''
          }
        }

        $scope.refresh()

        $scope.sendOtp = function() {
          if ($scope.form.email == '') {
            return;
          }
          $scope.thankYou = true;
          // $http({
          //   method:'POST',
          //   url:'',
          //   data:{}
          // }).then(function (data) {
          //   console.log(response.data);
          // })
        }

        $scope.closeModal = function() {
          $uibModalInstance.dismiss();
        }
      },
    })


  }

});

app.controller('controller.index', function($scope, $state, $http, $timeout, $interval, $uibModal) {
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


  $scope.articles = [{
      date: new Date(),
      title: 'das',
      description: "",
      link: '/',
      image: '/static/images/some.jpg'
    },
    {
      date: new Date(),
      title: 'das',
      description: "",
      link: '/',
      image: '/static/images/some.jpg'
    },
    {
      date: new Date(),
      title: 'das',
      description: "",
      link: '/',
      image: '/static/images/some.jpg'
    },
    {
      date: new Date(),
      title: 'das',
      description: "",
      link: '/',
      image: '/static/images/some.jpg'
    },
    {
      date: new Date(),
      title: 'das',
      description: "",
      link: '/',
      image: '/static/images/some.jpg'
    },
    // {date : new Date() , title : 'das' , description : "" , link : '/' , image : '/static/images/some.jpg'},
  ]


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


app.controller('main', function($scope, $state, $http, $timeout, $interval, $uibModal) {

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
          // if($scope.form.dated == null || $scope.form.dated == undefined){
          //   Flash.create("warning","PLease Select Date")
          //   return;
          // }
          // if($scope.form.emailId == '' || $scope.form.emailId == undefined){
          //   console.log("dddffffffffffff");
          //   Flash.create('danger', 'Please fill Email Id')
          //   return;
          // }

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
