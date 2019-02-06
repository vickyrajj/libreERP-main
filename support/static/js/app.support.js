// you need to first configure the stapp.config(function($stateProvider){
app.config(function($stateProvider, anTinyconProvider) {

  $stateProvider
    .state('businessManagement.support', {
      url: "/support",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.support.html',
          controller: 'businessManagement.support',
        }
      }
    })

  anTinyconProvider.setOptions({
    width: 7,
    height: 9,
    font: "10px arial",
    colour: "#ffffff",
    background: "#549A2F",
    fallback: true
  });
});

app.controller("businessManagement.support", function($scope, $state, $users, $stateParams, $http, Flash, $timeout, $interval, $uibModal, ngAudio, anTinycon) {


  $scope.newUsers = [];
  $scope.myUsers = [];

  // setTimeout(function () {
  //   alert('Going')
  //   // values you can provide fill,color,width,andFile name you want
  //   // mandetory values is path,
  //   let points=[{x:150,y:310},{x:250,y:110}]
  //
  //   function createPath(points=[],height=400,width=400){
  //     return new Promise((response,reject)=>{
  //       if(points.length==0){
  //         reject("Please provide points for path")
  //       }else{
  //         let values=" L"
  //         for (var i = 0; i < points.length; i++) {
  //           let x=points[i].x
  //           let y=height-points[i].y
  //            values+=values+x+" "+y+" "
  //         }
  //         myPath="M0 "+height+values+" L"+width+" "+height+" Z"
  //         resolve(myPath)
  //       }
  //     })
  //   }
  //
  //
  //   createPath(points,400,400).then((data)=>{
  //     $http({
  //       method: 'POST',
  //       url: '/api/support/createSVG/',
  //       data: {
  //         path: data,
  //         svgWidth:'400',
  //         svgHeight:'220',
  //         fill: 'purple',
  //         color: 'green',
  //         strokeWidth: '3',
  //         fileName: 'balram2',
  //       }
  //     }).then(function(response) {
  //       console.log(response);
  //     }).catch((error)=>{
  //       console.log(error);
  //     })
  //   }).catch((reason)=>{
  //     console.log(reason);
  //   })
  //
  //
  //
  //
  // }, 6000);

  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
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


  $scope.sendBackHeartBeat = function() {
    // var scope = angular.element(document.getElementById('chatTab')).scope();


    function heartbeat(args) {
      if (args[0] == 'popup') {
        console.log(args[2]);
        alert(args[1] + " has assigned " + args[2].uid + " uid chat to you!")
        $scope.myUsers.push(args[2]);
        connection.session.publish(wamp_prefix + 'service.support.chat.' + args[2].uid, ['AP', $scope.me.pk], {}, {
          acknowledge: true
        }).
        then(function(publication) {
          console.log("Published AP", args[2].uid);
        });

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            console.log('chat thread pk changed');
          }
        };
        xhttp.open('PATCH', '/api/support/chatThread/' + args[2].chatThreadPk + '/', true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        xhttp.send(JSON.stringify({
          user: $scope.me.pk
        }));
        return
      } else {
        return true
      }
    }



    connection.session.register(wamp_prefix + 'service.support.heartbeat.' + $scope.me.pk, heartbeat).then(
      function(res) {
        console.log("registered to service.support.heartbeat with " + $scope.me.pk);
      },
      function(err) {
        console.log("failed to registered: ");
      }
    );

  }



  Tinycon.setOptions({
    width: 7,
    height: 9,
    font: '11px arial',
    color: '#ffffff',
    background: '#00008B',
    fallback: true
  });

  $scope.sound = ngAudio.load("static/audio/notification.ogg");

  setInterval(function() {
    if ($scope.newUsers.length > 0) {
      Tinycon.setBubble($scope.newUsers.length);
      $scope.sound.play();
    } else {
      Tinycon.reset();
    }
  }, 5000);



  function sendMail(mailId, uid) {
    $http({
      method: 'POST',
      url: '/api/support/emailChat/',
      data: {
        email: mailId,
        uid: uid
      }
    }).then(function(response) {
      console.log('mail sent to ' + mailId);
    });
  }

  $scope.sendMailsToContact = function(contacts, chatUid) {
    for (var i = 0; i < contacts.length; i++) {
      var profile = $users.get(contacts[i])
      sendMail(profile.email, chatUid)
    }
  }


  var getCompDetails = function(companyPk) {
    return new Promise(function(resolve, reject) {
      $http({
        method: 'GET',
        url: '/api/support/getMyUser/?getCompanyDetails=' + companyPk,
      }).then(function(response) {
        console.log(response.data);
        resolve(response.data)
      }).catch((err) => {
        reject(err)
      })
    })
  }
  var getFirstMessage = function(companyPk) {
    return new Promise(function(resolve, reject) {
      $http({
        method: 'GET',
        url: '/api/support/customerProfile/pk=' + companyPk,
      }).then(function(response) {
        console.log(response.data, '888888888888888888');
        resolve(response.data)
      }).catch((err) => {
        reject(err)
      })
    })
  }



  setInterval(function() {
    for (let i = 0; i < $scope.newUsers.length; i++) {
      $http({
        method: 'GET',
        url: '/api/support/getChatStatus/?checkStatus&uid=' + $scope.newUsers[i].uid,
      }).
      then(function(response) {
        if (response.data.changeStatus) {
          getCompDetails(response.data.companyPk).then((data) => {
            $scope.sendMailsToContact(data.contactP, $scope.newUsers[i].uid)
          })
          $scope.newUsers.splice(i, 1);
        }
      });
    }
  }, 1000 * 60 * 1);

  setInterval(function() {

    for (let i = 0; i < $scope.myUsers.length; i++) {
      $http({
        method: 'GET',
        url: '/api/support/getChatStatus/?sendMail&uid=' + $scope.myUsers[i].uid,
      }).
      then(function(response) {
        if (response.data.sendMail) {
          getCompDetails(response.data.companyPk).then((data) => {
            $scope.sendMailsToContact(data.contactP, $scope.myUsers[i].uid)
          })
        }
      });
    }

  }, 1000 * 60 * 1);


  setInterval(function() {

    for (let i = 0; i < $scope.myUsers.length; i++) {
      if ($scope.myUsers[i].messages.length > 0) {
        let lastMsgPk = $scope.myUsers[i].messages[$scope.myUsers[i].messages.length - 1].pk;
        $http({
          method: 'GET',
          url: '/api/support/messageCheck/?uid=' + $scope.myUsers[i].uid + '&pk=' + lastMsgPk,
        }).
        then(function(response) {
          if (response.data.data.length > 0) {
            $http({
              method: 'GET',
              url: '/api/support/supportChat/?unDelMsg&values=' + JSON.stringify(response.data.data),
            }).
            then(function(response) {
              for (var l = 0; l < response.data.length; l++) {
                var dontPush = false;
                for (var m = 0; m < $scope.myUsers[i].messages.length; m++) {
                  if (response.data[l].pk == $scope.myUsers[i].messages[m].pk) {
                    dontPush = true;
                  }
                }
                if (!dontPush) {
                  $scope.myUsers[i].messages.push(response.data[l])
                }

              }
            });
          }
        });
      }
    }
  }, 20000);

  $scope.myCompanies = [];

  function fetchUsers() {
    if (connectionOpened) {
      $http({
        method: 'GET',
        url: '/api/support/getMyUser/?getMyUser=1&user=' + $scope.me.pk,
      }).then(function(response) {

        for (var i = 0; i < response.data.length; i++) {
          $scope.myUsers.push({
            name: response.data[i].name,
            email: response.data[i].email,
            uid: response.data[i].uid,
            chatThreadPk: response.data[i].chatThreadPk,
            messages: [],
            isOnline: true,
            unreadMsg: 0,
            boxOpen: false,
            companyPk: response.data[i].companyPk,
            servicePk: response.data[i].servicePk,
            spying: {
              value: '',
              isTyping: false
            },
            video: false,
            videoUrl: '',
            audio: false,
            audioUrl: '',
            isVideoShowing: true,
            alreadyDone: false,
            closeIframe: false
          })

          connection.session.publish(wamp_prefix + 'service.support.agent', [response.data[i].uid, 'R'], {}, {
            acknowledge: true
          }).
          then(function(publication) {
            console.log("Published");
          });
        }
        $scope.sendBackHeartBeat();
        $scope.getOpenedChatFromCookie();

      });
      $http({
        method: 'GET',
        url: '/api/support/getMyUser/?getNewComp=' + $scope.me.pk,
      }).then(function(response) {
        console.log(response.data, 'Got unhamdled');
        $scope.myCompanies = response.data
      });

      $http({
        method: 'GET',
        url: '/api/support/getMyUser/?getNewUser=1',
      }).then(function(response) {


        for (var i = 0; i < response.data.length; i++) {

          if ($scope.myCompanies.indexOf(response.data[i].companyPk) >= 0) {
            console.log(response.data, "555555555555555555555");
            $scope.newUsers.push({
              name: '',
              uid: response.data[i].uid,
              messages: [],
              isOnline: true,
              companyPk: response.data[i].companyPk,
              email: '',
              boxOpen: false,
              chatThreadPk: response.data[i].chatThreadPk,
              spying: {
                value: '',
                isTyping: false
              },
              video: false,
              videoUrl: '',
              audio: false,
              audioUrl: '',
              isVideoShowing: true,
              alreadyDone: false,
              closeIframe: false
            })
          }
        }
      });
      var myActiveTime = Date.now();

      function heartbeat() {
        return {
          ActiveUsers: $scope.myUsers,
          pk: $scope.me.pk,
          activeTime: myActiveTime
        }
      }
      connection.session.register(wamp_prefix + 'service.support.hhhhh.' + $scope.me.pk, heartbeat).then(
        function(res) {
          console.log("registered to service.support.hhhh ");
        },
        function(err) {
          console.log("failed to registered: ");
        });
      return
    } else {
      setTimeout(function() {
        // console.log('elseeeeeeeeeeeeeeeeee');
        fetchUsers()
      }, 500);
    }
  }
  fetchUsers();

  $scope.onNotification = function(uid, msg, i = 'a') {
    if (msg.length > 20) {
      msg = msg.substring(0, 20) + '....';
    }
    webNotification.showNotification(uid, {
      body: msg,
      icon: 'my-icon.ico',
      onClick: function onNotificationClicked() {
        console.log('Notification clicked');
        if (i == 'a') {

        } else {
          $scope.addToChat(i, uid)
        }

      },
      autoClose: 20000 //auto close the notification after 4 seconds (you can manually close it via hide function)
    }, function onShow(error, hide) {
      if (error) {
        window.alert('Unable to show notification: ' + error.message);
      } else {
        console.log('Notification Shown.');

        setTimeout(function hideNotification() {
          console.log('Hiding notification....');
          hide(); //manually close the notification (you can skip this if you use the autoClose option)
        }, 20000);
      }
    });
  }

  $scope.chatsInView = [];
  $scope.webRtcAddress = webRtcAddress
  $scope.data = {
    activeTab: 0,
  }
  $scope.data.xInView = 0;
  $scope.msgText = '';

  $scope.setxInView = function(indx) {
    $scope.xInView = indx;
  }

  $scope.closeChatBox = function(index, myUserIndex) {
    removeFromCookie($scope.chatsInView[index].uid);
    $scope.chatsInView.splice(index, 1)
    if (myUserIndex != undefined) {
      $scope.myUsers.splice(myUserIndex, 1)
    }
  }

  $scope.display = function(data) {
    $scope.msgText = $scope.templates[data].msg;
  }

  function removeFromCookie(uid) {
    for (var i = 0; i < openedUsers.length; i++) {
      if (openedUsers[i].uid == uid) {
        // console.log(openedUsers);
        openedUsers.splice(i, 1);
        // console.log(openedUsers);
      }
    }
    setCookie('openedChats', JSON.stringify(openedUsers), 30);
  }

  var openedUsers = []

  // anTinycon.setBubble(6);
  // anTinycon.setOptions({
  //     width: 7,
  //     height: 9,
  //     font: '10px arial',
  //     colour: '#ffffff',
  //     background: '#549A2F',
  //     fallback: true
  // });


  function addToCookie(uid, indx) {
    openedUsers.push({
      uid: uid,
      index: indx
    })
    setCookie('openedChats', JSON.stringify(openedUsers), 30);
    console.log('added index ' + indx);
  }

  $scope.addToChat = function(indx, uid) {
    addToCookie(uid, indx);
    for (var i = 0; i < $scope.chatsInView.length; i++) {
      if ($scope.myUsers[indx].uid == $scope.chatsInView[i].uid) {
        console.log('already in chat');
        return
      }
    }

    if ($scope.chatsInView.length < 4) {
      $scope.myUsers[indx].myUserIndex = indx
      $scope.chatsInView.push($scope.myUsers[indx])
      console.log('yess');
    } else {
      $scope.myUsers[indx].myUserIndex = indx
      $scope.chatsInView.push($scope.myUsers[indx])
      $scope.chatsInView.splice(0, 1)
      console.log('elseeee');
    }
  }

  $scope.getOpenedChatFromCookie = function() {
    console.log($scope.myUsers);
    var openedChats = getCookie('openedChats')
    if (openedChats.length == 0) {
      return
    }
    openedChats = JSON.parse(openedChats);
    console.log(openedChats);
    for (var i = 0; i < openedChats.length; i++) {
      for (var j = 0; j < $scope.myUsers.length; j++) {
        if ($scope.myUsers[j].uid == openedChats[i].uid) {
          if (openedChats[i].index != null) {
            $scope.addToChat(openedChats[i].index, openedChats[i].uid)
          }
        }
      }
    }
  }

  $scope.chatClose = function(idx, chatThreadPk) {
    console.log('coming in chatclose');
    var myUser = $scope.myUsers[idx];
    for (var i = 0; i < $scope.chatsInView.length; i++) {
      if (myUser.uid == $scope.chatsInView[i].uid) {
        $scope.chatsInView.splice(i, 1)
        console.log('removing from chat');
      }
    }
    $scope.myUsers.splice(idx, 1)
    $http({
      method: 'PATCH',
      url: '/api/support/chatThread/' + chatThreadPk + '/',
      data: {
        status: 'closed'
      }
    }).
    then(function(response) {
      Flash.create('success', 'Chat Has Closed')
      return
    });
  }
  $scope.count = 0;

  $scope.assignUser = function(indx, uid) {
    var newUserIndx = indx;
    var newUid = uid;

    $http({
      method: 'GET',
      url: '/api/support/chatThread/?uid=' + newUid
    }).
    then(function(response) {
      console.log(response.data[0].user);
      if (response.data[0].user) {
        Flash.create('warning', 'picked by someone else')
        $scope.newUsers.splice(newUserIndx, 1);
      } else {

        var toPatch = {
          user: $scope.me.pk,
          firstAssign: 1
        }

        $http({
          method: 'PATCH',
          url: '/api/support/chatThread/' + response.data[0].pk + '/',
          data: toPatch
        }).
        then(function(response) {

          $scope.myUsers.push($scope.newUsers[newUserIndx]);
          $scope.addToChat($scope.myUsers.length - 1, newUid)
          $scope.newUsers.splice(newUserIndx, 1);

          $scope.status = 'AP';
          connection.session.publish(wamp_prefix + 'service.support.chat.' + newUid, [$scope.status, $scope.me.pk], {}, {
            acknowledge: true
          }).
          then(function(publication) {
            console.log("Published AP", uid);
          });


          $scope.status = 'R';
          connection.session.publish(wamp_prefix + 'service.support.agent', [newUid, $scope.status], {}, {
            acknowledge: true
          }).
          then(function(publication) {
            console.log("Published");
          });

          $http({
            method: 'GET',
            url: '/api/support/supportChat/?user__isnull=True&uid=' + newUid
          }).
          then(function(response) {
            for (var i = 0; i < response.data.length; i++) {
              $http({
                method: 'PATCH',
                url: '/api/support/supportChat/' + response.data[i].pk + '/',
                data: {
                  user: $scope.me.pk
                }
              }).
              then(function(response) {
                // console.log(response.data);
              });
            }
          })
        }).catch(function(err) {
          Flash.create('warning', 'picked by someone else')
        })

      }



    })



  }

  // $scope.assignUser = function(indx, uid) {
  //
  //   $scope.myUsers.push($scope.newUsers[indx]);
  //   // $scope.count++;
  //   $scope.addToChat($scope.myUsers.length - 1, uid)
  //   $scope.newUsers.splice(indx, 1);
  //
  //   $http({
  //     method: 'GET',
  //     url: '/api/support/supportChat/?user__isnull=True&uid=' + uid
  //   }).
  //   then(function(response) {
  //     // console.log(response.data);
  //     for (var i = 0; i < response.data.length; i++) {
  //
  //       $http({
  //         method: 'PATCH',
  //         url: '/api/support/supportChat/' + response.data[i].pk + '/',
  //         data: {
  //           user: $scope.me.pk
  //         }
  //       }).
  //       then(function(response) {
  //         // console.log(response.data);
  //       });
  //
  //     }
  //
  //     $http({
  //       method: 'GET',
  //       url: '/api/support/chatThread/?uid=' + uid
  //     }).
  //     then(function(response) {
  //
  //       var chatThreadCreated = new Date(response.data[0].created).getTime()
  //       // console.log(chatThreadCreated);
  //
  //       var now = new Date().getTime();
  //       var toPatch = {
  //         user: $scope.me.pk,
  //         firstAssign: 1
  //       }
  //       // if (now - chatThreadCreated > 180000 ) {
  //       //   toPatch.isLate = true
  //       // }
  //
  //
  //
  //       $http({
  //         method: 'PATCH',
  //         url: '/api/support/chatThread/' + response.data[0].pk + '/',
  //         data: toPatch
  //       }).
  //       then(function(response) {
  //         // console.log(response.data);
  //       }).catch(function(err) {
  //         console.log(err);
  //         Flash.create('warning', 'this chat is already taken')
  //       })
  //     })
  //
  //   });
  //
  //   $scope.status = 'AP';
  //   connection.session.publish(wamp_prefix + 'service.support.chat.' + uid, [$scope.status, $scope.me.pk], {}, {
  //     acknowledge: true
  //   }).
  //   then(function(publication) {
  //     console.log("Published AP", uid);
  //   });
  //
  //
  //   $scope.status = 'R';
  //   connection.session.publish(wamp_prefix + 'service.support.agent', [uid, $scope.status], {}, {
  //     acknowledge: true
  //   }).
  //   then(function(publication) {
  //     console.log("Published");
  //   });
  //
  // }

});
