var app = angular.module('app',  ['ui.router', 'ui.bootstrap','angular-owl-carousel-2']);


app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide ,  $locationProvider) {

  $urlRouterProvider.otherwise('/');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
  $locationProvider.html5Mode(true);



});

app.run([ '$rootScope', '$state', '$stateParams', function ($rootScope,   $state,   $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", console.log.bind(console));
  }
]);

// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc


app.config(function($stateProvider) {

  $stateProvider
    .state('home', {
      url: "/",
      templateUrl: '/static/ngTemplates/app.homepage.index.html',
      controller: 'controller.index'
    })

  $stateProvider
    .state('blog', {
      url: "/blog",
      templateUrl: '/static/ngTemplates/app.homepage.blogs.html',
      // controller: 'controller.blogs'
    })

  $stateProvider
    .state('pages', {
      url: "/:title",
      templateUrl: '/static/ngTemplates/app.homepage.page.html',
      // controller: 'controller.ecommerce.PagesDetails'
    })




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


  $scope.articles = [
    {date : new Date() , title : 'das' , description : "" , link : '/' , image : '/static/images/some.jpg'},
    {date : new Date() , title : 'das' , description : "" , link : '/' , image : '/static/images/some.jpg'},
    {date : new Date() , title : 'das' , description : "" , link : '/' , image : '/static/images/some.jpg'},
    {date : new Date() , title : 'das' , description : "" , link : '/' , image : '/static/images/some.jpg'},
    {date : new Date() , title : 'das' , description : "" , link : '/' , image : '/static/images/some.jpg'},
  ]


  $scope.friends = [
   {name:'John', age:25,dp:'/static/images/airbus-logo.png'},
   {name:'Mary', age:40,dp:'/static/images/amad.png'},
   {name:'Peter', age:85,dp:'/static/images/autodesk-logo.png'},
   {name:'Peter', age:85,dp:'/static/images/benchmark.png'},
   {name:'Peter', age:85,dp:'/static/images/direct-line-group-logo.png'},
];



})


app.controller('main', function($scope, $state, $http, $timeout, $interval, $uibModal) {



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
    if (f.coverletter.length>0) {
      fd.append('coverletter', f.coverletter);
    }
    if (f.lastname.length>0) {
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
        $timeout(function () {
          $uibModalInstance.dismiss();
        }, 3000);
      }else {
        $scope.msg = 'Errors In The Form'
      }
    })
  }


  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };



})
