var app = angular.module('app', [ 'ui.bootstrap']);
// $scope, $state, $users, $stateParams, $http, $timeout, $uibModal , $sce,$rootScope


app.config(function($httpProvider) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
})


app.controller('main', function($scope, $http, $interval) {
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

app.controller('startexam', function($scope, $http, $timeout, $interval, $uibModal) {



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
            }
            for (var i = 0; i < $scope.answers.length; i++) {
              $http({
                method: 'DELETE',
                url: '/api/LMS/answer/' + $scope.answers[i] + '/'
              }).
              then(function(response) {
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
