var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'angular-owl-carousel-2', 'ui.bootstrap.datetimepicker', 'flash', 'ngAside', 'uiSwitch', 'chart.js', ]);
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
      for (var j = 0; j < $scope.subquestions[i].ques.length; j++) {
        $scope.subquestions[i].ques[j].timer = 0;
      }
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
    setInterval(timer,1000);
    function timer() {
      $scope.subquestions[$scope.subcount].ques[$scope.count].timer += 1
    }
    var interval;
    $scope.save = function(subval, val) {
      // clearInterval(interval);
      if ($scope.subquestions[subval].ques[val].option[$scope.selections[subval].answers[val]] != undefined) {
        $scope.selectedpk = $scope.subquestions[subval].ques[val].option[$scope.selections[subval].answers[val]].txt;
      } else {
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
      // setTimeout(function () {
      //    $location.path( '/testresults');
      // }, 10000);

      if ($scope.subcount == subval) {


        if ($scope.count == $scope.test.length - 1) {
          $scope.count = $scope.count;
          $scope.questionno = $scope.count;
          // interval = setInterval(timer(val), 1000);
          console.log($scope.test.length, 'ssss');
          if ($scope.test[val].savedIndex != null) {
            $scope.test[val].status = 'answered';
          }
        } else {
          if ($scope.test[val].savedIndex != null) {
            $scope.count = $scope.count + 1;
            $scope.questionno = $scope.count;
            // interval = setInterval(timer(val), 1000);
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
      // clearInterval(interval);
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
            // interval = setInterval(timer(val), 1000);
            $scope.questionno = $scope.count;
            $scope.test[val].status = 'attemptreviewed';
            if ($scope.test[$scope.count].status != 'answered' && $scope.test[$scope.count].status != 'reviewed' && $scope.test[$scope.count].status != 'attemptreviewed') {
              $scope.test[$scope.count].status = 'notanswered';
            };
          } else {

            $scope.count = $scope.count + 1;
            $scope.questionno = $scope.count;
            // interval = setInterval(timer(val), 1000);
            $scope.test[val].status = 'reviewed';
            if ($scope.test[$scope.count].status != 'answered' && $scope.test[$scope.count].status != 'reviewed' && $scope.test[$scope.count].status != 'attemptreviewed') {
              $scope.test[$scope.count].status = 'notanswered';
            }
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
      // clearInterval(interval);
      // interval = setInterval(timer(val), 1000);
      console.log($scope.subquestions[$scope.subcount].ques[val].timer,'kkk');
      $scope.count = val;
      $scope.questionno = $scope.count;
      if ($scope.test[val].status != 'answered' && $scope.test[val].status != 'reviewed' && $scope.test[val].status != 'attemptreviewed') {
        $scope.test[val].status = 'notanswered'
      }
    }

    $scope.finish = function(answerlist, questions) {
      $scope.subtitle = []
      for (var i = 0; i < $scope.sublist.length; i++) {
        $scope.subtitle.push({
          title: $scope.sublist[i],
          ques: []
        })
      }

      $http({
        method: 'GET',
        url: '/api/LMS/answer/?user=' + $scope.userId + '&paper=' + $scope.quesId,
      }).then(function(response) {
        for (var i = 0; i < response.data.length; i++) {
          if ($scope.sublist.includes(response.data[i].question.topic.subject.title)) {
            for (var j = 0; j < $scope.subtitle.length; j++) {
              if ($scope.subtitle[j].title == response.data[i].question.topic.subject.title) {
                $scope.subtitle[j].ques.push(response.data[i])
              }
            }

          }
        }
      });
      console.log($scope.subtitle.length, 'subttt');
      $scope.marks = 0;
      $scope.incorrect = 0;
      $scope.correct = 0;
      setTimeout(function() {

        for (var i = 0; i < $scope.subtitle.length; i++) {
          if ($scope.subtitle[i].title == $scope.sublist[i]) {
            $scope.marks = 0;
            $scope.incorrect = 0;
            $scope.correct = 0;
            for (var j = 0; j < $scope.subtitle[i].ques.length; j++) {
              if ($scope.subtitle[i].ques[j].correct == "no") {
                $scope.marks -= $scope.subtitle[i].ques[j].marksObtained
                $scope.incorrect += 1
                $scope.subtitle[i].mark = $scope.marks
                $scope.subtitle[i].incorrect = $scope.incorrect

              } else {
                $scope.marks += $scope.subtitle[i].ques[j].marksObtained
                $scope.correct += 1
                $scope.subtitle[i].mark = $scope.marks
                $scope.subtitle[i].correct = $scope.correct
              }
            }
          }
        }
        $scope.total = 0;
        for (var i = 0; i < $scope.subtitle.length; i++) {
          $scope.total += $scope.subtitle[i].mark
          $scope.totalcorrect += $scope.subtitle[i].correct
          $scope.totalincorrect += $scope.subtitle[i].incorrect
        }
        console.log($scope.subtitle, 'marksssssssss');
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
            userId: function() {
              return $scope.userId;
            },
            paperId: function() {
              return $scope.quesId;
            },
            total: function() {
              return $scope.total;
            },
          },

          controller: function($scope, questions, $uibModalInstance, answerlist, userId, paperId, total) {


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
            console.log(userId, paperId, 'useriddddd');
            $scope.arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
            $scope.submit = function() {
              $http({
                method: 'POST',
                url: '/api/LMS/paperhistory/',
                data: {
                  user: userId,
                  paper: paperId,
                  mark: total,
                  attempted: $scope.attempted + $scope.attemptedreview,
                  notattempted: $scope.notAnswered,
                  reviewed: $scope.reviewed,
                  notview: $scope.notview,

                }
              }).then(function(response) {

              });
              $uibModalInstance.close();

            }
            setTimeout(function () {
              return   $scope.submit();
            }, 10000);
            $scope.closeModal = function() {
              $uibModalInstance.dismiss();
            }

          },
        })
      }, 1000);
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
  $http({
    method: 'GET',
    url: '/api/LMS/paperhistory/?user=' + $scope.userId + '&paper=' + $scope.quesId
  }).then(function(response) {
    $scope.marks = response.data[response.data.length - 1].mark
    $scope.attemptresult = response.data[response.data.length - 1].attempted
    $scope.notattemptresult = response.data[response.data.length - 1].notattempted
    $scope.reviewresult = response.data[response.data.length - 1].reviewed
    $scope.notviewresult = response.data[response.data.length - 1].notview
    $scope.totalques = $scope.attemptresult + $scope.notattemptresult + $scope.reviewresult + $scope.notviewresult

  });
  $scope.sublist = []


  $http({
    method: 'GET',
    url: '/api/LMS/paper/' + $scope.quesId + '/'
  }).then(function(response) {
    $scope.paperData = response.data
    for (var i = 0; i < $scope.paperData.questions.length; i++) {
      var question = $scope.paperData.questions[i].ques.ques
      var option = $scope.paperData.questions[i].ques.optionsParts
      $scope.subname = $scope.paperData.questions[i].ques.topic.subject.title;
      if (!$scope.sublist.includes($scope.subname)) {
        $scope.sublist.push($scope.subname);
      } else {}
    }
  })
  setTimeout(function() {
    console.log($scope.sublist, 'sublistttt');
    $scope.subtitle = []
    for (var i = 0; i < $scope.sublist.length; i++) {
      $scope.subtitle.push({
        title: $scope.sublist[i],
        ques: []
      })
    }

    $http({
      method: 'GET',
      url: '/api/LMS/answer/?user=' + $scope.userId + '&paper=' + $scope.quesId,
    }).then(function(response) {
      if (!response.data.length) {

      } else {
        for (var i = 0; i < response.data.length; i++) {
          if ($scope.sublist.includes(response.data[i].question.topic.subject.title)) {
            for (var j = 0; j < $scope.subtitle.length; j++) {
              if ($scope.subtitle[j].title == response.data[i].question.topic.subject.title) {
                $scope.subtitle[j].ques.push(response.data[i])
              }
            }

          }
        }


      }
    });
    console.log($scope.subtitle.length, 'subttt');
    setTimeout(function() {
      $scope.marks = 0;
      $scope.incorrect = 0;
      $scope.correct = 0;

      for (var i = 0; i < $scope.subtitle.length; i++) {
        if ($scope.subtitle[i].title == $scope.sublist[i]) {
          $scope.marks = 0;
          $scope.incorrect = 0;
          $scope.correct = 0;
          for (var j = 0; j < $scope.subtitle[i].ques.length; j++) {
            if ($scope.subtitle[i].ques[j].correct == "no") {
              $scope.marks -= $scope.subtitle[i].ques[j].marksObtained
              $scope.incorrect += 1
              $scope.subtitle[i].mark = $scope.marks
              $scope.subtitle[i].incorrect = $scope.incorrect

            } else {
              $scope.marks += $scope.subtitle[i].ques[j].marksObtained
              $scope.correct += 1
              $scope.subtitle[i].mark = $scope.marks
              $scope.subtitle[i].correct = $scope.correct
            }
          }
        }
      }
      $scope.total = 0;
      console.log($scope.subtitle, 'marksssssssss');
      for (var i = 0; i < $scope.subtitle.length; i++) {
        $scope.total += $scope.subtitle[i].mark
      }
    }, 1000)
  }, 1000);


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
  $scope.colors = ["#29B999", "#ED6060"]

  $scope.labels1 = ['Correct', 'In Correct'];


  $scope.data1 = [
    [65, 59, 80, 81, 56, 55, 40],
  ];

})
app.controller('startexam', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {



  $http({
    method: 'GET',
    url: '/api/LMS/paperhistory/?user=' + user + '&paper=' + ques,
  }).then(function(response) {
    $scope.data = response.data.length;
    $scope.paper = ques.split('-').join('')
    $scope.url = "/" + blog + "/" + $scope.paper + "/practice/";

  })

  $scope.startexam = function() {


    $uibModal.open({
      templateUrl: '/static/ngTemplates/startexam.html',
      size: 'md',
      backdrop: true,
      resolve: {
        blogobj: function() {
          return blog;
        },
        quesobj: function() {
          return ques;
        },
        user: function() {
          return user;
        },
        paper: function() {
          return paper;
        }

      },
      controller: function($scope, $uibModalInstance, blogobj, quesobj, user, paper) {

        $scope.paper = quesobj.split('-').join('')
        $scope.url = "/" + blogobj + "/" + $scope.paper + "/practice/";
        $scope.closeModal = function() {
          $uibModalInstance.close()
        }
        $scope.next = function() {
          $http({
            method: 'GET',
            url: '/api/LMS/answer/?user=' + user + '&paper=' + paper,
          }).
          then(function(response) {
            $scope.answers = []
            for (var i = 0; i < response.data.length; i++) {
              $scope.answers.push(response.data[i].pk)
              console.log($scope.answers);
            }
            for (var i = 0; i < $scope.answers.length; i++) {
              console.log($scope.answers[i], 'answersss');
              $http({
                method: 'DELETE',
                url: '/api/LMS/answer/' + $scope.answers[i] + '/'
              }).
              then(function(response) {
                console.log(response.data);
              })
            }
          })
        }
      },
    })

  }


});
app.controller('testimonials', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce) {

  $scope.myObj = {
    "background-color": "#DDF6FB",
  }
  $scope.myObjcolor = {
    "background-color": "#E5E7FC",
  }

});

app.controller('accountController', function($scope, $state, $http, $timeout, $interval, $uibModal, $stateParams, $sce, Flash, $users, $aside) {

  console.log('account Controller');

  $scope.durationCal = function(st, ed) {
    console.log(st, ed);
    stDate = new Date(st)
    if (ed !== null && ed != undefined && ed.length > 0) {
      endDate = new Date(ed)
    } else {
      endDate = new Date()
    }
    var diff = Math.floor((endDate - stDate) / 60000)
    console.log(diff, 'in minutessssssssss');
    return diff + ' Min'
  }
  $scope.form = {
    minutes1: 0,
    minutes2: 0,
    hours1: 0,
    hours2: 0
  }
  $http({
    method: 'GET',
    url: '/api/HR/users/?mode=mySelf&format=json'
  }).
  then(function(response) {
    console.log('res', response.data);
    if (response.data.length == 1) {
      $scope.me = response.data[0]
      $http({
        method: 'GET',
        url: '/api/tutors/tutors24Profile/' + $scope.me.pk + '/'
      }).
      then(function(response) {
        console.log(response.data, 'tutorsProfile');
        $scope.profileData = response.data
        $scope.getUsersessions()
      })
    } else {
      $scope.me = {}
      $scope.profileData = {}
    }
  })

  $scope.getProfile = function() {
    $http({
      method: 'GET',
      url: '/api/tutors/Tutor24User/'
    }).
    then(function(response) {
      console.log(response.data, 'profileeeeeeeeeeeeeee');
      $scope.profile = response.data;
      $scope.profile.balance = response.data.tutorObj.balance;
      if ($scope.profile.balance == null || $scope.profile.balance == undefined) {
        var minutes = 0
        var hours = 0
      } else {
        var minutes = $scope.profile.balance % 60;
        var hours = parseInt($scope.profile.balance / 60);
      }
      $scope.form.minutes1 = parseInt(minutes / 10);
      $scope.form.minutes2 = minutes % 10;
      $scope.form.hours1 = parseInt(hours / 10);
      $scope.form.hours2 = hours % 10;
    })
  }
  $scope.getProfile();
  $scope.sessionLimit = 0
  $scope.showMore = true

  $scope.getUsersessions = function() {
    $scope.sessionLimit += 5
    if ($scope.profileData.typ == 'T') {
      var qry = 'tutor='
    } else {
      var qry = 'student='
    }
    $http({
      method: 'GET',
      url: '/api/tutors/tutors24Session/?started=true&' + qry + $scope.profileData.pk + '&limit=' + $scope.sessionLimit
    }).
    then(function(response) {
      console.log(response.data, 'user sessionsssss');
      $scope.userSessions = response.data.results
      if (response.data.next != null && response.data.next.length > 0) {
        $scope.showMore = true
      } else {
        $scope.showMore = false
      }
    })
  }

  $scope.viewSession = function(idx) {
    console.log(idx);
    $aside.open({
      templateUrl: '/static/ngTemplates/app.homepage.account.sessionDetails.html',
      placement: 'right',
      size: 'xl',
      backdrop: true,
      resolve: {
        sessionData: function() {
          return $scope.userSessions[idx];
        },
      },
      controller: function($scope, $uibModalInstance, sessionData) {
        console.log(sessionData);
        $scope.sessionData = sessionData
        $http({
          method: 'GET',
          url: '/api/tutors/tutors24Message/?session=' + $scope.sessionData.pk + '/'
        }).
        then(function(response) {
          console.log(response.data, 'message Data');
          $scope.chatData = response.data
        })

        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        }
      },
    }).result.then(function() {

    }, function(reason) {
      console.log(reason);
    });
  }

  $scope.editProfile = function() {
    console.log('edittttttt');
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.homepage.account.form.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        profileData: function() {
          return $scope.profileData;
        },
      },
      controller: function($scope, $uibModalInstance, profileData) {
        console.log(profileData);
        $scope.profileform = profileData
        if ($scope.profileform.school == 'S') {
          $scope.profileform.collegeMode = false
        } else {
          $scope.profileform.collegeMode = true
        }
        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        }
        $scope.save = function() {
          console.log($scope.profileform);
          var f = $scope.profileform
          var toSend = {
            standard: f.standard,
            school: 'S'
          }
          if (f.collegeMode) {
            toSend.school = 'C'
          }
          if (f.schoolName != null && f.schoolName.length > 0) {
            toSend.schoolName = f.schoolName
          }
          if (f.parentEmail != null && f.parentEmail.length > 0) {
            toSend.parentEmail = f.parentEmail
          }
          if (f.parentMobile != null && f.parentMobile.length > 0) {
            toSend.parentMobile = f.parentMobile
          }
          if (f.street != null && f.street.length > 0) {
            toSend.street = f.street
          }
          if (f.city != null && f.city.length > 0) {
            toSend.city = f.city
          }
          if (f.state != null && f.state.length > 0) {
            toSend.state = f.state
          }
          if (f.pinCode != null && f.pinCode.length > 0) {
            toSend.pinCode = f.pinCode
          }
          if (f.country != null && f.country.length > 0) {
            toSend.country = f.country
          }
          $http({
            method: 'PATCH',
            url: '/api/tutors/tutors24Profile/' + f.pk + '/',
            data: toSend
          }).
          then(function(response) {
            $uibModalInstance.dismiss(response.data);
          })

        }
      },
    }).result.then(function() {

    }, function(reason) {
      console.log(reason);
      if (reason.pk != undefined) {
        $scope.profileData = reason;
        Flash.create('success', 'Updated Successfull')
      }
    });
  }

  $scope.startSession = function() {
    console.log('start session');
    if ($scope.profile.tutorObj.standard == null || $scope.profile.tutorObj.standard == undefined || $scope.profile.tutorObj.standard.length == 0) {
      Flash.create('danger', 'Your profile is not complete please complete the profile in Account page')
      return;
    }
    if ($scope.profile.balance < 10) {
      Flash.create('danger', 'Balance low , Please add time into your account.')
      return;
    }
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.tutor.addSession.form.html',
      size: 'md',
      backdrop: false,
      controller: function($scope, $uibModalInstance, $users) {
        $scope.tutorsOnline = [];
        $scope.me = $users.get('mySelf');
        console.log($scope.me);
        $scope.form = {
          subject: null,
          topic: null,
          question: undefined
        }
        $scope.validity = {
          subject: false,
          topic: false,
          question: false
        }
        $scope.showErrors = false;
        $scope.subjects = [];
        $scope.topics = [];
        $scope.cancel = function() {
          $uibModalInstance.dismiss();
        }
        $http({
          method: 'GET',
          url: '/api/LMS/subject/'
        }).
        then(function(response) {
          $scope.subjects = response.data;
        });
        $scope.$watch('form.subject', function(newValue, oldValue) {
          console.log(newValue);
          if (newValue != null) {
            $http({
              method: 'GET',
              url: '/api/LMS/topic/?subject=' + newValue
            }).
            then(function(response) {
              $scope.topics = response.data;
            });
          }
        }, true)
        $scope.status = 'idle';
        $scope.wait = function wait(ms) {
          var start = new Date().getTime();
          var end = start;
          while (end < start + ms) {
            end = new Date().getTime();
          }
        }
        $scope.dismiss = function() {
          $uibModalInstance.dismiss();
        }
        $scope.sendTutoringRequest = function(sessionID) {
          var toSend = {
            student: $scope.me.pk,
            initialQuestion: $scope.form.question,
            subject: $scope.form.subject,
            topic: $scope.form.topic,
          }
          $http({
            method: 'POST',
            url: '/api/tutors/tutors24Session/',
            data: toSend
          }).
          then(function(response) {
            console.log("success");
            $scope.sessionID = response.data.pk;
            connection.session.publish('service.tutor.online', [{
              type: 'newSessionRequest',
              sessionID: response.data.pk,
              subject: 1,
              topic: 2,
              id: $scope.me.username
            }], {}, {
              acknowledge: true
            });
            $timeout(function() {
              $scope.tutorsOnline = tutorsOnline;
              console.log($scope.tutorsOnline.length + " tutors found");
              for (var i = 0; i < $scope.tutorsOnline.length; i++) {
                if ($scope.tutorsOnline[i].checked) {
                  continue
                }
                connection.session.publish('service.tutoring.call.' + $scope.tutorsOnline[i].tutorID, [{
                  type: 'newSessionRequest',
                  sessionID: $scope.sessionID,
                  id: $scope.me.username
                }], {}, {
                  acknowledge: true
                });
                $scope.tutorsOnline[i].checked = true;
              }
            }, 10000)
            $timeout(function() {
              $scope.status = 'noluck';
            }, 20000);
          })
        }
        $scope.tryAgain = function() {
          $scope.status = 'idle';
        };
        $scope.start = function() {
          console.log($scope.form);
          $scope.showErrors = true;
          if ($scope.form.subject == null) {
            $scope.validity.subject = false;
            return;
          }
          if ($scope.form.topic == null) {
            $scope.validity.topic = false;
            return;
          }
          if ($scope.form.question == undefined || $scope.form.question.length == 0) {
            $scope.validity.question = false;
            return;
          }
          $scope.status = 'starting';
          $scope.sendTutoringRequest(1);
        }
      },
    })
  }

  $scope.addHours = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.tutor.addHours.form.html',
      size: 'lg',
      backdrop: true,
      controller: function($scope, $http) {
        $scope.form = {
          minutes: 30,
          promoStatus: null,
          promo: '',
          promoPercent: 0,
          rate: 150
        }
        $scope.paymentParams = [];
        $scope.getDicount = function() {
          return $scope.form.rate * parseInt($scope.form.minutes) * $scope.form.promoPercent / (100 * 60);
        }
        $scope.getTax = function() {
          var total = $scope.form.rate * $scope.form.minutes / 60;
          return parseInt((total - $scope.getDicount()) * 0.18);
        }
        $scope.getTotal = function() {
          return $scope.form.rate * $scope.form.minutes / 60;
        }
        $scope.addPromoCode = function() {
          if ($scope.form.promo == 'FEE') {
            $scope.form.promoStatus = true;
            $scope.form.promoPercent = 50;
          } else {
            $scope.form.promoStatus = false;
            $scope.form.promoPercent = 0;
          }
        }
        $scope.getGrand = function() {
          return parseInt($scope.getTax() * 1.18 / 0.18);
        }
        $scope.add = function(val) {
          if ($scope.form.minutes == undefined || $scope.form.minutes.length == 0) {
            var prev = 0;
          } else {
            var prev = parseInt($scope.form.minutes);
          }
          $scope.form.minutes = prev + val;
        }
        $scope.makePayment = function() {
          var toSend = $scope.form;
          toSend.grandTotal = $scope.getGrand();
          $http({
            method: 'POST',
            url: '/api/ERP/paytmPayment/',
            data: toSend
          }).
          then(function(response) {
            $scope.paymentParams = response.data;
            $timeout(function() {
              $('#paymentSubmit').click();
            }, 500)
          })
        }
      },
    })
  }

});
