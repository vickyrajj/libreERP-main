var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'angular-owl-carousel-2', 'ui.bootstrap.datetimepicker', 'flash', 'ngAside']);
// $scope, $state, $users, $stateParams, $http, $timeout, $uibModal , $sce,$rootScope


app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {


  $urlRouterProvider.otherwise('/');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;

})


app.controller('main', function($scope, $http, $sce, $interval, $uibModal) {
  console.log("main loded");
  $scope.crmBannerID = 1;

  $scope.mainBannerImages = []
  $scope.bannerID = 0;
  $scope.typings = ["Online tutoring", "24x7 online help", "CBSE Preparation", "IIT JEE Preparation", "AIPMT Preparation"]
  $scope.typeIndex = 0;
  $scope.videoLink = '';

  $scope.videoLink = $sce.trustAsResourceUrl('https://www.youtube.com/embed/JC-Dpwb-Sk8');

  $interval(function() {

    $scope.typeIndex += 1;
    if ($scope.typeIndex == $scope.typings.length) {
      $scope.typeIndex = 0;
    }

  }, 5000)

  $interval(function() {
    $scope.bannerID += 1;
    if ($scope.bannerID == $scope.mainBannerImages.length) {
      $scope.bannerID = 0;
    }
  }, 2000)

  $interval(function() {
    $scope.crmBannerID += 1;
    if ($scope.crmBannerID == 12) {
      $scope.crmBannerID = 1;
    }
  }, 1000)


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

  $scope.signin = function() {
    console.log('-------------innnnnnnnnnnn');
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.homepage.signin.html',
      size: 'lg',
      backdrop: false,
      controller: function($scope, $uibModalInstance, $timeout, Flash) {
        $scope.form = {
          number: '',
          otp: '',
          otpmode: false,
          errorMessage: '',
          errorType: 'default'
        }
        $scope.loginFunction = function() {
          console.log($scope.form);
          if (!$scope.form.otpmode) {
            if ($scope.form.number.length != 10) {
              $scope.form.errorMessage = 'Enter Valid Mobile Number'
              $scope.form.errorType = 'danger'
              return
            } else {
              $scope.form.errorMessage = ''
              $scope.form.errorType = 'default'
            }
            $http({
              method: 'POST',
              url: '/generateOTP',
              data: {
                'id': $scope.form.number
              }
            }).
            then(function(response) {
              console.log(response.data);
              $scope.form.otpmode = true
            }, function(err) {
              if (err.status == 404) {
                $http({
                  method: 'POST',
                  url: '/api/homepage/registration/',
                  data: {
                    mobile: $scope.form.number
                  }
                }).
                then(function(response) {
                  console.log(response.data);
                  $scope.form.errorMessage = 'You Have No Account , We Are Creating New Account For You'
                  $scope.form.errorType = 'warning'
                  $scope.form.otpmode = true
                  $scope.form.token = response.data.token
                }).catch(function(err) {
                  $scope.form.errorMessage = 'Invalid Data'
                  $scope.form.errorType = 'danger'
                })
              } else if (err.status == 400) {
                $scope.form.errorMessage = 'No Account'
                $scope.form.errorType = 'danger'
              } else if (err.status == 500) {
                $scope.form.errorMessage = 'Error While Sending OTP'
                $scope.form.errorType = 'danger'
              }
            });
          } else {
            console.log('enter otp mode');
            if ($scope.form.token != undefined) {
              var toSend = {
                mobile: $scope.form.number,
                mobileOTP: $scope.form.otp,
                token: $scope.form.token
              }
            } else {
              var toSend = {
                mobile: $scope.form.number,
                mobileOTP: $scope.form.otp
              }
            }
            $http({
              method: 'POST',
              url: '/registerLite',
              data: toSend
            }).
            then(function(response) {
              console.log('Registered');
              window.location.href = "/";
            })
          }
        }
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

});


app.controller('exam', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce, Flash, $location) {

  $scope.sublist = []
  $scope.subquestions = []
  $scope.data = []
  $http({
    method: 'GET',
    url: '/api/LMS/paper/1/'
  }).then(function(response) {
    // $scope.paperData = response.data
    for (var i = 0; i < response.data.questions.length; i++) {
      $scope.data.push(response.data.questions[i].ques)
    }

    // $scope.data.push(response.data.questions.ques)
    // for (var i = 0; i < $scope.paperData.questions.length; i++) {
    //   $scope.paperData.questions[i].ques
    //   $scope.sublist.push($scope.paperData.questions[i].ques.topic.subject.title);
    //   $scope.subname = $scope.paperData.questions[i].ques.topic.subject.title;
    //
    //   console.log($scope.paperData.questions[i].ques.topic.subject.title, 'lll');
    // }

  })
  // for (var i = 0; i < $scope.data.length; i++) {
  //   $scope.sublist.push($scope.data.topic.subject.title);
  //   console.log($scope.sublist, 'ooo');
  //   $scope.subname = $scope.data[i].topic.subject.title;
  //   for (var i = 0; i < $scope.sublist.length; i++) {
  //     $scope.subquestions.push({
  //       subname: $scope.sublist[i],
  //       ques: []
  //     })
  //   }
  //   for (var i = 0; i < $scope.subquestions.length; i++) {
  //     if ($scope.subname == $scope.subquestions[i].subname) {
  //
  //       $scope.subquestions[i].ques.push($scope.paperData.questions[i].ques.ques)
  //     }
  //   }
  // }


  console.log($scope.data.length, 'vvv');
  $scope.questionList = [{
      subject: "Maths",
      testquestions: [{

          Question: "When $a \\neq 0$, there are two solutions to $ax^2 + bx + c = 0$ and they are $x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$",
          Options: [
            '$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$',
            '$ax^2 + bx + c = 0$',
            '$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$',
            '$a \\neq 0$'
          ],
          savedIndex: null
        },
        {
          Question: 'Limit $\\lim_{x\\to\\infty} f(x)$',
          Options: [
            '$\\lim_{x\to\\infty} f(x)$',
            '$\\lim_{x\to\\infty} f(x)$',
            '$\\lim_{x\to\\infty} f(x)$',
            '$\\lim_{x\to\\infty} f(x)$'
          ],
          savedIndex: null
        },
        {
          Question: 'Sum $\\sum_{n=1}^{\\infty} 2^{-n} = 1$',
          Options: [
            '$\\sum_{n=1}^{\\infty} 2^{-n} = 6$',
            '$\\sum_{n=5}^{\\infty} 3^{-n} = 4$',
            '$\\sum_{n=9}^{\\infty} 5^{-n} = 19$',
            '$\\sum_{n=11}^{\\infty} 1^{-n} = 30$'
          ],
          savedIndex: null
        },
        {
          Question: 'Find the Answer:$$ (a^n)^{r+s} = a^{nr+ns}  $$',
          Options: [
            'Integer',
            'sodales',
            'finibus',
            'ultricies'
          ],
          savedIndex: null
        },
        {
          Question: 'Integral $\\int_{a}^{b} x^2 dx$',
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
      ]
    },
    {
      subject: "Physics",
      testquestions: [{

          Question: 'In physics, the mass-energy equivalence is stated by the equation $E=mc^2$, discovered in 1905 by who?',
          Options: [
            'Albert Einstein',
            'Tesla',
            'Newton',
            'Joul'
          ],
          savedIndex: null
        },
        {
          Question: 'Fusce euismod nisi vitae magna faucibus dignissim vitae in lectus.',
          Options: [
            'blap',
            'bluri',
            'bleep',
            'blue'
          ],
          savedIndex: null
        },
      ]
    },
    {
      subject: "Chemistry",
      testquestions: [{

          Question: 'Choose correct One:${2LiOH_{(s)} + CO_{2(g)} -> Li_{2}CO_{3(s)} + H_{2}O_{(g)}}$',
          Options: [
            '${2LiOH_{(s)} + CO_{2(g)} -> H_{2}O_{(g)}}$',
            '${2LiOH_{(s)} + CO_{2(g)} -> H_{2}O_{(g)}}+Li_{2}CO_{3(s)}$',
            '${2LiOH_{(s)} + CO_{2(g)} -> H_{2}O_{(g)}}+Li_{2}CO_{3(s)}$',
            '${2LiOH_{(s)} + CO_{2(g)} -> H_{2}O_{(g)}}$'
          ],
          savedIndex: null
        },


      ]
    },




  ];
  $scope.test = $scope.questionList[0].testquestions;
  $scope.len = $scope.test.length
  $scope.options
  $scope.count = 0
  $scope.subcount = 0;
  $scope.selections = []
  for (var i = 0; i < $scope.questionList.length; i++) {
    $scope.selections[i]
  }
  $scope.subjectSelect = function(sub, idx) {
    console.log($scope.selections, 'lll');
    $scope.questionList[idx].testquestions[0].status = "notanswered";
    for (var i = 0; i < $scope.questionList.length; i++) {
      if ($scope.sublist[i] == sub) {
        if (idx == $scope.subcount) {
          $scope.count = $scope.count;
        } else {
          $scope.count = 0;
        }

        $scope.subcount = idx;
        $scope.test = $scope.questionList[i].testquestions;
        $scope.len = $scope.test.length

      }
    }
  }






  for (var i = 0; i < $scope.questionList.length; i++) {
    $scope.selections.push({
      answers: []
    })
    // for (var j = 0; j < $scope.questionList[i].testquestions.length; j++) {
    //   $scope.selections[i].answer[j].push(null)
    // }
  }
  console.log($scope.selections[0]);
  $scope.selection = function(subcount, questionno, answerno) {

    $scope.selections[subcount].answers[questionno] = answerno;
    $scope.test[questionno].savedIndex = answerno;

  }
  $scope.save = function(subval, val) {

    if ($scope.subcount == subval) {

      if ($scope.count == $scope.test.length - 1) {
        $scope.count = $scope.count;
        $scope.questionno = $scope.count;
        $scope.test[val].status = 'answered';
      } else {
        if ($scope.test[val].savedIndex != null) {
          $scope.count = $scope.count + 1;
          $scope.questionno = $scope.count;
          $scope.test[val].status = 'answered';
          if ($scope.test[$scope.count].status != 'answered' && $scope.test[$scope.count].status != 'reviewed' && $scope.test[$scope.count].status != 'attemptreviewed') {
            $scope.test[$scope.count].status = 'notanswered';
          }

        } else {

          // Flash.create('danger','Please Select One Option')
          Flash.create('warning', 'Please Mention The Name');
          return
        }
      }
    }


  }
  $scope.review = function(subval, val) {
    if ($scope.subcount == subval) {

      if ($scope.count == $scope.test.length - 1) {
        $scope.count = $scope.count;
        $scope.questionno = $scope.count;
        if ($scope.test[val].savedIndex != null) {
          $scope.test[val].status = 'attemptreviewed';
        } else {
          $scope.test[val].status = 'reviewed';
        }
      } else {
        if ($scope.test[val].savedIndex != null) {
          $scope.count = $scope.count + 1;
          $scope.questionno = $scope.count;
          $scope.test[val].status = 'attemptreviewed';
          $scope.test[$scope.count].status = 'notanswered';
        } else {

          $scope.count = $scope.count + 1;
          $scope.questionno = $scope.count;
          $scope.test[val].status = 'reviewed';
          $scope.test[$scope.count].status = 'notanswered';
          // Flash.create('danger','Please Select One Option')
          Flash.create('warning', 'Please Select The option');
          return
        }
      }
    }


  }
  $scope.clearselection = function(subval, val) {
    if ($scope.subcount == subval) {

      $scope.selections[subval].answers[val] = null;
      $scope.test[val].status = 'notanswered';
      $scope.test[val].savedIndex = null;
    }
  }
  $scope.queclick = function(val) {

    $scope.count = val;
    $scope.questionno = $scope.count;
    if ($scope.test[val].status != 'answered' && $scope.test[val].status != 'reviewed' && $scope.test[val].status != 'attemptreviewed') {
      $scope.test[val].status = 'notanswered'
    }
  }
  $scope.finish = function(answerlist, questions) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/examsubmit.html',
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


        $scope.questions = questions
        $scope.attempted = 0;
        $scope.notAnswered = 0;
        $scope.reviewed = 0;
        $scope.attemptedreview = 0;
        $scope.notview = 0;
        for (var i = 0; i < $scope.questions.length; i++) {
          for (var j = 0; j < $scope.questions[i].testquestions.length; j++) {
            if ($scope.questions[i].testquestions[j].status == "answered") {
              $scope.attempted += 1;
            } else if ($scope.questions[i].testquestions[j].status == "notanswered") {
              $scope.notAnswered += 1;
            } else if ($scope.questions[i].testquestions[j].status == "reviewed") {
              $scope.reviewed += 1;
            } else if ($scope.questions[i].testquestions[j].status == "attemptreviewed") {
              $scope.attemptedreview += 1;
            } else {
              $scope.notview += 1;
            }
          }

          // if ($scope.questions[i].status == 'answered') {
          //   $scope.attempted += 1;
          // } else if ($scope.questions[i].status == 'notanswered') {
          //   $scope.notAnswered += 1;
          // } else if ($scope.questions[i].status == 'reviewed') {
          //   $scope.reviewed += 1;
          // } else if ($scope.questions[i].status == 'attemptreviewed') {
          //   $scope.attemptedreview += 1;
          // } else {
          //   $scope.notview += 1;
          // }

        }
        $scope.arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        $scope.submit = function() {
          $uibModalInstance.close();
          // $scope.params = {
          //   'attempt': $scope.attempted + $scope.attemptedreview,
          //   'notattempt': $scope.notAnswered,
          //   'reviewed': $scope.reviewed,
          //   'notview': $scope.notview,
          //   'answerlist': $scope.questions
          // }
          //
          // $state.go("testresults", $scope.params);
          // var params = {
          //   'attempt': $scope.attempted + $scope.attemptedreview,
          //   'notattempt': $scope.notAnswered,
          //   'reviewed': $scope.reviewed,
          //   'notview': $scope.notview,
          //   'answerlist': $scope.questions
          // };
          // $http({
          //   method: 'POST',
          //   data: params,
          //   url: '/api/'
          // }).then(function(response) {
          //   dataShare.sendData(response);
          //   $location.path('/testresult');
          // });
        }
        $scope.closeModal = function() {
          $uibModalInstance.dismiss();
        }

      },
    })
  }
});

app.controller('examresults', function($rootScope, $scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce, Flash, ) {

  $scope.$on('data_shared', function() {
    $scope.data = dataShare.getData();
  });
  $scope.arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
  $scope.testresult = {
    attempt: 2,
    notattempt: 3,
    reviewed: 2,
    answerlist: 3,
    answerlist: []
  }
  $scope.summary = $stateParams;
  console.log($scope.summary);
  $scope.scorecard = $scope.summary.answerlist;
  $scope.correctanswers = [0, 1, 2, 2, 1, 1, 2, 3, 3, 2, 1, 0, 0, 2, 2, 1, 3, 2, 1, 0, 0, 2, 2, 1];
  $scope.exam = [{
    attempted: []
  }, {
    notattempt: []
  }, {
    notview: []
  }, {
    review: []
  }];
  $scope.exam.attempted = [];
  $scope.exam.notattempt = [];
  $scope.exam.notview = [];
  $scope.exam.review = [];

  if ($scope.scorecard != null) {

    for (var i = 0; i < $scope.scorecard.length; i++) {
      $scope.attempted = 0;
      $scope.notanswer = 0;
      $scope.notview = 0;
      $scope.review = 0;
      for (var j = 0; j < $scope.scorecard[i].testquestions.length; j++) {
        if ($scope.scorecard[i].testquestions[j].status == 'answered') {
          $scope.attempted += 1;

        } else if ($scope.scorecard[i].testquestions[j].status == 'notanswered') {
          $scope.notanswer += 1;

        } else if ($scope.scorecard[i].testquestions[j].status == 'reviewed') {
          $scope.review += 1;

        } else if ($scope.scorecard[i].testquestions[j].status == 'attemptreviewed') {
          $scope.attempted += 1;

        } else if (($scope.scorecard[i].testquestions[j].status == 'default') || (!$scope.scorecard[i].testquestions[j].status)) {
          $scope.notview += 1;

        }
      }

      $scope.exam.attempted.push($scope.attempted);
      $scope.exam.notattempt.push($scope.notanswer);
      $scope.exam.notview.push($scope.notview);
      $scope.exam.review.push($scope.review);

    }
  }


  $scope.countforcorrect = 0;
  $scope.countforincorrect = 0;
  $scope.unattempt = 0;
  $scope.checkanswers = function(arr1, arr2) {
    if (arr1 == null || arr2 == null) {
      return;
    } else {
      arr1.forEach(function(item1, idx1) {
        arr2.forEach(function(item2, idx2) {
          if (idx1 === idx2) {
            if (item1 != null && item2 != null && item1 === item2) {
              $scope.countforcorrect += 1;
            } else if (item1 != null && item2 != null && item1 != item2) {
              $scope.countforincorrect += 1;
            } else {
              $scope.unattempt += 1;
            }
          }
        })
      });
    }
  }
  $scope.checkanswers($scope.correctanswers, $scope.summary.answerlist);

  $scope.labels = ["Attempted", "Not Attempted", "Reviewed", "Not Visited"];
  $scope.data = [$scope.summary.attempt, $scope.summary.notattempt, $scope.summary.reviewed, $scope.summary.notview];
  $scope.colors = ["#29B999", "#ED6060", "#D2D2D2", "#565FB8"]

  $scope.labels1 = ['Attempted', 'Not Attempted', 'Not Visited', 'Reviewed'];


  $scope.data1 = [
    [65, 59, 80, 81, 56, 55, 40],
  ];

})
app.controller('testimonials', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {

  $scope.myObj = {
    "background-color": "#DDF6FB",
  }
  $scope.myObjcolor = {
    "background-color": "#E5E7FC",
  }

});
