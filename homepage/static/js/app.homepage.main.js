var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'angular-owl-carousel-2', 'ui.bootstrap.datetimepicker', 'flash', 'ngAside']);
// $scope, $state, $users, $stateParams, $http, $timeout, $uibModal , $sce,$rootScope


app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
})

app.run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on("$stateChangeError", console.log.bind(console));
}]);


app.controller('main', function($scope, $http, $sce, $interval, $uibModal) {
  // $scope.me = $users.get('mySelf');
  $scope.crmBannerID = 1;



  $scope.device = {
    name: ''
  }

  function lgDevice(x) {
    if (x.matches) {
      $scope.device.name = 'large'
    }
  }

  function smDevice(x) {
    if (x.matches) {
      $scope.device.name = 'small'
    }
  }

  function elgDevice(x) {
    if (x.matches) {
      $scope.device.name = 'extralarge'
    }
  }


  var sm = window.matchMedia("(max-width: 600px)")
  smDevice(sm) // Call listener function at run time
  sm.addListener(smDevice) // Attach listener function on state changes

  var lg = window.matchMedia("(min-width: 601px) and (max-width: 1400px) ")
  lgDevice(lg)
  lg.addListener(lgDevice)

  var elg = window.matchMedia("(min-width: 1401px)")
  elgDevice(elg)
  elg.addListener(elgDevice)


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


app.controller('exam', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce, Flash, $location, $rootScope) {
  console.log('exam controllerrrrrrrrrrrrr');
  console.log(USERID, 'quesidddddddddddddddddd');
  if (QUESID != undefined) {
    $scope.quesId = QUESID
  } else {
    $scope.quesId = 1
  }
  if (USERID != undefined) {
    $scope.userId = USERID
  } else {
    return
  }
  $scope.sublist = []
  $scope.subquestions = []
  $scope.timelimit = {
    time: ''
  }
  $scope.data = {
    paperid: ''
  }

  $http({
    method: 'GET',
    url: '/api/LMS/paper/' + $scope.quesId + '/'
  }).then(function(response) {
    $scope.paperData = response.data
    $scope.data.paperid = response.data.pk;
    $scope.timelimit.time = $scope.paperData.timelimit
    for (var i = 0; i < $scope.paperData.questions.length; i++) {
      console.log($scope.paperData.questions[i].ques.solutionParts.txt, 'ttttttttttt');
      var question = $scope.paperData.questions[i].ques.ques
      var option = $scope.paperData.questions[i].ques.optionsParts
      $scope.subname = $scope.paperData.questions[i].ques.topic.subject.title;
      if ($scope.paperData.questions[i].ques.solutionParts[0] == undefined) {
        $scope.solution = 'null'
      } else {
        $scope.solution = $scope.paperData.questions[i].ques.solutionParts[0].txt
      }
      if (!$scope.sublist.includes($scope.subname)) {
        $scope.sublist.push($scope.subname);
        $scope.subquestions.push({
          subname: $scope.subname,
          ques: []
        })
        $scope.subquestions[i].ques.push({
          que: question,
          option: option,
          status: 'default',
          pk: $scope.paperData.questions[i].ques.pk,
          user: $scope.paperData.questions[i].ques.user,
          solution: $scope.solution,
          mark: $scope.paperData.questions[i].marks,
          negativemark: $scope.paperData.questions[i].negativeMarks,
        })
      } else {
        for (var j = 0; j < $scope.subquestions.length; j++) {
          if ($scope.subquestions[j].subname == $scope.subname) {
            $scope.subquestions[j].ques.push({
              que: question,
              option: option,
              status: 'default',
              pk: $scope.paperData.questions[i].ques.pk,
              user: $scope.paperData.questions[i].ques.user,
              solution: $scope.solution,
              mark: $scope.paperData.questions[i].marks,
              negativemark: $scope.paperData.questions[i].negativeMarks,
            })
          }
        }
      }
    }


  })

  setTimeout(function() {
    $scope.theTime = Number($scope.timelimit.time) - 1;
    $scope.timeinsec = 60
    $scope.test = $scope.subquestions[0].ques;
    $scope.len = $scope.test.length
    $scope.options
    $scope.count = 0
    $scope.subcount = 0;
    $scope.selections = []
    $scope.pkforpatch = []
    console.log($scope.subquestions, 'pppp');
    for (var i = 0; i < $scope.subquestions.length; i++) {
      $scope.selections[i]
    }
    $scope.subjectSelect = function(sub, idx) {
      if ($scope.subquestions[idx].ques[0].status == "default") {
        $scope.subquestions[idx].ques[0].status = "notanswered";
      }
      for (var i = 0; i < $scope.subquestions.length; i++) {
        if ($scope.subquestions[i].subname == sub) {
          if (idx == $scope.subcount) {
            $scope.count = $scope.count;
          } else {
            $scope.count = 0;
          }

          $scope.subcount = idx;
          $scope.test = $scope.subquestions[i].ques;
          $scope.len = $scope.test.length

        }
      }
    }
    for (var i = 0; i < $scope.subquestions.length; i++) {
      $scope.selections.push({
        answers: []
      })
    }
    console.log($scope.selections[0]);
    $scope.selection = function(subcount, questionno, answerno) {

      $scope.selections[subcount].answers[questionno] = answerno;
      $scope.test[questionno].savedIndex = answerno;

    }
    $scope.save = function(subval, val) {
      if($scope.subquestions[subval].ques[val].option[$scope.selections[subval].answers[val]]!=undefined){
        $scope.selectedpk = $scope.subquestions[subval].ques[val].option[$scope.selections[subval].answers[val]].txt;
      }else{
        return
      }
      var answerpk = $scope.subquestions[subval].ques[val].solution
      console.log($scope.selectedpk, answerpk, 'asdf');
      if ($scope.selectedpk == answerpk) {
        $scope.marks = $scope.subquestions[subval].ques[val].mark;
        $scope.correct = 'yes';
      } else {
        $scope.marks = $scope.subquestions[subval].ques[val].negativemark;
        $scope.correct = 'no';
      }
      if ($scope.test[val].savedIndex == null) {
        $scope.evaluate = 'False'
      } else {
        $scope.evaluate = 'True'
        var dataToPost = {
          question: $scope.subquestions[subval].ques[val].pk,
          user: $scope.subquestions[subval].ques[val].user,
          paper: $scope.data.paperid,
          evaluated: $scope.evaluate,
          correct: $scope.correct,
          marksObtained: $scope.marks,
        }
        $http({
          method: 'POST',
          data: dataToPost,
          url: '/api/LMS/answer/'
        }).
        then(function(response) {
          console.log(response.data);
          $scope.pkforpatch.push(response.data.pk);
          $scope.subquestions[subval].ques[val].method = 'posted'
          $scope.subquestions[subval].ques[val].patchpk = response.data.pk
          console.log($scope.subquestions[subval].ques[val], 'kjhg');
        });


      }


      if ($scope.subcount == subval) {


        if ($scope.count == $scope.test.length - 1) {
          $scope.count = $scope.count;
          $scope.questionno = $scope.count;
          console.log($scope.test.length, 'ssss');
          if ($scope.test[val].savedIndex != null) {
            $scope.test[val].status = 'answered';
          }
        } else {
          if ($scope.test[val].savedIndex != null) {
            $scope.count = $scope.count + 1;
            $scope.questionno = $scope.count;
            $scope.test[val].status = 'answered';
            if ($scope.test[$scope.count].status != 'answered' && $scope.test[$scope.count].status != 'reviewed' && $scope.test[$scope.count].status != 'attemptreviewed') {
              $scope.test[$scope.count].status = 'notanswered';
            }

          } else {
            console.log($scope.test.length, 'xxx');
            Flash.create('warning', 'Please Select One Option');
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
            Flash.create('warning', 'Please Select One Option');
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
      $http({
        method: 'GET',
        url: '/api/LMS/answer/?user=' + $scope.userId + '&paper=' + $scope.quesId + '/'
      }).then(function(response) {
        if (!response.data.length ) {

        }else{


        }
      });

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
          },
          userId:function() {
            return $scope.userId;
          },
          quesId:function() {
            return $scope.quesId;
          },
        },

        controller: function($scope, questions, $uibModalInstance, answerlist,userId,quesId) {


          $scope.questions = questions
          $scope.attempted = 0;
          $scope.notAnswered = 0;
          $scope.reviewed = 0;
          $scope.attemptedreview = 0;
          $scope.notview = 0;
          for (var i = 0; i < $scope.questions.length; i++) {
            for (var j = 0; j < $scope.questions[i].ques.length; j++) {
              if ($scope.questions[i].ques[j].status == "answered") {
                $scope.attempted += 1;
              } else if ($scope.questions[i].ques[j].status == "notanswered") {
                $scope.notAnswered += 1;
              } else if ($scope.questions[i].ques[j].status == "reviewed") {
                $scope.reviewed += 1;
              } else if ($scope.questions[i].ques[j].status == "attemptreviewed") {
                $scope.attemptedreview += 1;
              } else {
                $scope.notview += 1;
              }
            }

          }
          $scope.arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
          $scope.submit = function() {
            $http({
              method: 'POST',
              url: '/api/LMS/paperhistory/',
              data:{
                user:userId,
                paper:paperId,
              }
            }).then(function(response) {
              if (!response.data.length ) {

              }else{


              }
            });
            $uibModalInstance.close();

          }
          $scope.closeModal = function() {
            $uibModalInstance.dismiss();
          }

        },
      })
    }
  }, 1000);

  $interval(function() {
    if ($scope.theTime != 0) {
      $scope.theTime -= 1;
    }
  }, 60000);
  $interval(function() {
    if ($scope.timeinsec != 1) {
      $scope.timeinsec -= 1;
    } else {
      $scope.timeinsec = 60;
    }
  }, 1000);


});

app.controller('examresults', function($rootScope, $scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce, Flash, ) {


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
