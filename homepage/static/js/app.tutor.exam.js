var app = angular.module('app', ['ui.bootstrap', 'flash', 'chart.js', ]);

app.config(function($httpProvider, ) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;

});

app.controller('main', function($scope, $http, $timeout, $interval, $uibModal) {

})


app.controller('exam', function($scope, $http, $timeout, $interval, $uibModal, $location) {
  $scope.initiateMath = function() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }

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
  $scope.timecount = []

  $http({
    method: 'GET',
    url: '/api/LMS/paper/' + $scope.quesId + '/'
  }).then(function(response) {
    $scope.paperData = response.data
    $scope.data.paperid = response.data.pk;
    $scope.timelimit.time = $scope.paperData.timelimit
    for (var i = 0; i < $scope.paperData.questions.length; i++) {
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

    $scope.call()


  })

  $scope.call = function() {
    $scope.theTime = Number($scope.timelimit.time) - 1;
    $scope.timeinsec = 60
    $scope.test = $scope.subquestions[0].ques;
    $scope.len = $scope.test.length
    $scope.options
    $scope.count = 0
    $scope.subcount = 0;
    $scope.selections = []
    $scope.pkforpatch = []
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
    $scope.selection = function(subcount, questionno, answerno) {

      $scope.selections[subcount].answers[questionno] = answerno;
      $scope.test[questionno].savedIndex = answerno;


    }
    setInterval(timer, 1000);

    function timer() {
      $scope.subquestions[$scope.subcount].ques[$scope.count].timer += 1
    }
    var interval;
    $scope.save = function(subval, val) {
      if ($scope.subquestions[subval].ques[val].option[$scope.selections[subval].answers[val]] != undefined) {
        $scope.selectedpk = $scope.subquestions[subval].ques[val].option[$scope.selections[subval].answers[val]].txt;
      } else {
        return
      }
      var answerpk = $scope.subquestions[subval].ques[val].solution
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
          $scope.pkforpatch.push(response.data.pk);
          $scope.subquestions[subval].ques[val].method = 'posted'
          $scope.subquestions[subval].ques[val].patchpk = response.data.pk
        });


      }

      if ($scope.subcount == subval) {


        if ($scope.count == $scope.test.length - 1) {
          $scope.count = $scope.count;
          $scope.questionno = $scope.count;
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
            if ($scope.test[$scope.count].status != 'answered' && $scope.test[$scope.count].status != 'reviewed' && $scope.test[$scope.count].status != 'attemptreviewed') {
              $scope.test[$scope.count].status = 'notanswered';
            };
          } else {

            $scope.count = $scope.count + 1;
            $scope.questionno = $scope.count;
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
      console.log($scope.subquestions[$scope.subcount].ques[$scope.count].timer);
      $scope.count = val;
      $scope.questionno = $scope.count;
      if ($scope.test[val].status != 'answered' && $scope.test[val].status != 'reviewed' && $scope.test[val].status != 'attemptreviewed') {
        $scope.test[val].status = 'notanswered'
      }
    }

    $timeout(function() {
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
        $scope.spend = function() {
          $scope.timecount = []
          console.log($scope.subquestions, 'questionsss');
          for (var i = 0; i < $scope.subquestions.length; i++) {
            $scope.timecount.push({
              sub: $scope.subquestions[i].subname,
            })
            $scope.timer = 0
            for (var j = 0; j < $scope.subquestions[i].ques.length; j++) {
              $scope.timer += $scope.subquestions[i].ques[j].timer
            }
            $scope.timecount[i].timer = $scope.timer
          }
          return $scope.timecount;
        }
        $scope.marks = 0;
        $scope.incorrect = 0;
        $scope.correct = 0;

        for (var i = 0; i < $scope.subtitle.length; i++) {
          if ($scope.subtitle[i].title == $scope.sublist[i] && $scope.subtitle[i].ques.length) {
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
          if ($scope.subtitle[i].ques.length) {
            $scope.total += $scope.subtitle[i].mark
            $scope.totalcorrect += $scope.subtitle[i].correct
            $scope.totalincorrect += $scope.subtitle[i].incorrect
          }
        }
        $scope.attempted = 0;
        $scope.notAnswered = 0;
        $scope.reviewed = 0;
        $scope.attemptedreview = 0;
        $scope.notview = 0;
        for (var i = 0; i < $scope.subquestions.length; i++) {
          for (var j = 0; j < $scope.subquestions[i].ques.length; j++) {
            if ($scope.subquestions[i].ques[j].status == "answered") {
              $scope.attempted += 1;
            } else if ($scope.subquestions[i].ques[j].status == "notanswered") {
              $scope.notAnswered += 1;
            } else if ($scope.subquestions[i].ques[j].status == "reviewed") {
              $scope.reviewed += 1;
            } else if ($scope.subquestions[i].ques[j].status == "attemptreviewed") {
              $scope.attemptedreview += 1;
            } else {
              $scope.notview += 1;
            }
          }

        }
        return $http({
          method: 'POST',
          url: '/api/LMS/paperhistory/',
          data: {
            user: $scope.userId,
            paper: $scope.quesId,
            mark: $scope.total,
            attempted: $scope.attempted + $scope.attemptedreview,
            notattempted: $scope.notAnswered,
            reviewed: $scope.reviewed,
            notview: $scope.notview,
            sessionTime: JSON.stringify($scope.spend())
          }
        }).then(function(response) {

           window.location.href = '/testresults/'

        });


      })
    }, 5000);

    $scope.finish = function(answerlist, questions) {
      $scope.subtitle = []
      for (var i = 0; i < $scope.sublist.length; i++) {
        $scope.subtitle.push({
          title: $scope.sublist[i],
          ques: []
        })
      }

      $scope.answerlist = function() {
        return $http({
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
          $scope.callmodal()
        });
      }
      $scope.answerlist()
      $scope.callmodal = function() {

        $scope.spend = function() {
          $scope.timecount = []
          console.log($scope.subquestions, 'questionsss');
          for (var i = 0; i < $scope.subquestions.length; i++) {
            $scope.timecount.push({
              sub: $scope.subquestions[i].subname,
            })
            $scope.timer = 0
            for (var j = 0; j < $scope.subquestions[i].ques.length; j++) {
              $scope.timer += $scope.subquestions[i].ques[j].timer
            }
            $scope.timecount[i].timer = $scope.timer
          }
          return $scope.timecount;
        }
        $scope.marks = 0;
        $scope.incorrect = 0;
        $scope.correct = 0;

        for (var i = 0; i < $scope.subtitle.length; i++) {
          if ($scope.subtitle[i].title == $scope.sublist[i] && $scope.subtitle[i].ques.length) {
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
          if ($scope.subtitle[i].ques.length) {
            $scope.total += $scope.subtitle[i].mark
            $scope.totalcorrect += $scope.subtitle[i].correct
            $scope.totalincorrect += $scope.subtitle[i].incorrect
          }
        }





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
            spend: function() {
              return $scope.spend();
            }
          },

          controller: function($scope, questions, $uibModalInstance, answerlist, userId, paperId, total, spend) {
            console.log(spend, 'spensddd');
            $scope.timeDetails = spend
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
            $scope.closeModal = function() {
              $uibModalInstance.dismiss('cancel');
            }
            $scope.arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
            $scope.submit = function() {
              console.log(JSON.stringify($scope.timeDetails), 'time counttttttt', $scope.timeDetails);
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
                  sessionTime: JSON.stringify($scope.timeDetails)
                }
              }).then(function(response) {
                console.log(response.data);
                $uibModalInstance.dismiss(response.data);
              });
            }
            if ($scope.theTime == 0 && $scope.timeinsec == 1) {
              $scope.submit()
            }

          },
        }).result.then(function() {

        }, function(reason) {

          if (reason.pk) {
            window.location.href = '/testresults/'
          }

        });
      }
    }
  };

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

app.controller('examresults', function($scope, $http, $timeout, $interval, $uibModal, ) {
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
    console.log(response.data);
    $scope.marks = response.data[response.data.length - 1].mark
    $scope.attemptresult = response.data[response.data.length - 1].attempted
    $scope.notattemptresult = response.data[response.data.length - 1].notattempted
    $scope.reviewresult = response.data[response.data.length - 1].reviewed
    $scope.notviewresult = response.data[response.data.length - 1].notview
    $scope.totalques = $scope.attemptresult + $scope.notattemptresult + $scope.reviewresult + $scope.notviewresult
    if (response.data[response.data.length - 1].sessionTime) {
      $scope.timecount = JSON.parse(response.data[response.data.length - 1].sessionTime);
      console.log($scope.timecount, 'timerrrrrrrrr');
    } else {
      $scope.timecount = []
    }

  });
  $scope.sublist = []
  $scope.subcount = []
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
    for (var i = 0; i < $scope.sublist.length; i++) {
      var count = 0;
      var arr = $scope.paperData.questions.filter(function(item) {
        if (item.ques.topic.subject.title == $scope.sublist[i]) {
          return true;
        }
      })
      $scope.subcount.push({
        name: $scope.sublist[i],
        count: arr.length
      })
    }
    console.log($scope.subcount, 'jjjj');
    $scope.showresults()
  })
  $scope.showresults = function() {
    $scope.subtitle = []
    for (var i = 0; i < $scope.sublist.length; i++) {
      $scope.subtitle.push({
        title: $scope.sublist[i],
        ques: [],
      })
    }
    $scope.getanswers = function() {
      return $http({
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
        $scope.genreteresults()
      });
    }
    $scope.getanswers()
    $scope.genreteresults = function() {
      $scope.marks = 0;
      $scope.incorrect = 0;
      $scope.correct = 0;

      for (var i = 0; i < $scope.subtitle.length; i++) {
        if ($scope.subtitle[i].title == $scope.sublist[i] && $scope.subtitle[i].ques.length) {
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
        } else {



        }
      }
      console.log($scope.subtitle, 'kkkkkk');
      $scope.total = 0;
      for (var i = 0; i < $scope.subtitle.length; i++) {
        $scope.total += $scope.subtitle[i].mark
      }
    }
  };


  $scope.arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
  $scope.colors = ["#29B999", "#ED6060"]
  $scope.labels1 = ['Correct', 'In Correct'];



})
