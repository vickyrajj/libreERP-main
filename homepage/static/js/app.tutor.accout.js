var app = angular.module('app', [ 'ui.bootstrap', 'flash', 'ngAside','uiSwitch']);

app.config(function( $httpProvider) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
})

app.controller('main', function($scope, $http, $interval) {

})

app.controller('accountController', function($scope, $http, $timeout, $interval, $uibModal, Flash, $aside) {

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
        url: '/api/tutors/tutors24Profile/?user=' + $scope.me.pk
      }).
      then(function(response) {
        console.log(response.data, 'tutorsProfile');
        $scope.profileData = response.data[0]
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
          url: '/api/tutors/tutors24Message/?session=' + $scope.sessionData.pk
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
      controller: function($scope, $uibModalInstance) {
        $scope.tutorsOnline = [];
        // $scope.me = $users.get('mySelf');
        $scope.me = {}
        $http({
          method: 'GET',
          url: '/api/HR/users/?mode=mySelf&format=json'
        }).
        then(function(response) {
          console.log('res', response.data);
          if (response.data.length == 1) {
            $scope.me = response.data[0]
          }
          console.log($scope.me);
        })
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
