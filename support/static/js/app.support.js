// you need to first configure the stapp.config(function($stateProvider){
app.config(function($stateProvider) {

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
});

app.controller("businessManagement.support", function($scope, $state, $users, $stateParams, $http, Flash, $timeout, $interval, $uibModal) {


  $scope.newUsers = [];
  $scope.myUsers = [];


  function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
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


  setTimeout(function () {
    $http({
      method: 'GET',
      url: '/api/support/getMyUser/?getMyUser=1&user=' + $scope.me.pk,
    }).then(function(response) {
      // console.log(response.data , 'distinct resssssssssss');
      for (var i = 0; i < response.data.length; i++) {
        // console.log(response.data[i]);
        // console.log(response.data[i].chatThreadPk);
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
          spying:{value :'' , isTyping : false},
          video:false,
          videoUrl:''
        })

        connection.session.publish('service.support.agent', [response.data[i].uid, 'R'], {}, {
          acknowledge: true
        }).
        then(function(publication) {
          console.log("Published");
        });

      }
    });

    $http({
      method: 'GET',
      url: '/api/support/getMyUser/?getNewUser=1',
    }).then(function(response) {
      // console.log(response.data , 'Got unhamdled');
      for (var i = 0; i < response.data.length; i++) {
        // console.log(response.data[i]);
        $scope.newUsers.push({
          name: '',
          uid: response.data[i].uid,
          messages: [],
          isOnline: true,
          companyPk: response.data[i].companyPk,
          email:'',
          boxOpen:false,
          chatThreadPk: response.data[i].chatThreadPk,
          spying:{value :'' , isTyping : false},
          video:false,
          videoUrl:''
        })
      }
    });
  }, 1000);

  $scope.onNotification=function(uid,msg,i='a'){


    if(msg.length>20){
      msg= msg.substring(0,20)+'....';
    }
    webNotification.showNotification(uid, {

            body:msg,
            icon: 'my-icon.ico',
            onClick: function onNotificationClicked() {
                console.log('Notification clicked');
                if(i=='a'){

                } else{
                  $scope.addToChat(i,uid)
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
  $scope.data = {
    activeTab: 0,
  }

  $scope.data.xInView = 0;

  $scope.msgText = '';

  $scope.setxInView = function(indx) {
    $scope.xInView = indx;
  }

  $scope.closeChatBox = function(index, myUserIndex) {
    console.log('dfddcominh in closesssssss');
    console.log('dfdfdfs '+index+' ' + myUserIndex);
    removeFromCookie($scope.chatsInView[index].uid);
    $scope.chatsInView.splice(index, 1)
    if (myUserIndex != undefined) {
      $scope.myUsers.splice(myUserIndex, 1)
    }
  }

  $scope.display = function(data) {
    $scope.msgText = $scope.templates[data].msg;
  }

function removeFromCookie(uid){
  for (var i = 0; i < openedUsers.length; i++) {
    if(openedUsers[i].uid==uid){
      console.log(openedUsers);
      openedUsers.splice(i, 1);
      console.log(openedUsers);
    }
  }
  setCookie('openedChats',JSON.stringify(openedUsers),30);
  // console.log('removed index '+indx);
}

  var openedUsers=[]

    function addToCookie(uid,indx){
      openedUsers.push({
        uid:uid,
        index:indx
      })
        setCookie('openedChats',JSON.stringify(openedUsers),30);
        console.log('added index '+indx);
    }

  $scope.addToChat = function(indx , uid ) {

    console.log(indx);
    console.log(uid);
    // $scope.status = 'AP';
    // connection.session.publish('service.support.chat.' + uid, [$scope.status, $scope.me.pk], {}, {
    //   acknowledge: true
    // }).
    // then(function(publication) {
    //   console.log("Published");
    // });
    addToCookie(uid,indx);


    console.log('comingggg in add to chat');
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

  // $scope.removeChat = function(indx) {
  //   for (var i = 0; i < $scope.chatsInView.length; i++) {
  //     if ($scope.myUsers[indx].uid == $scope.chatsInView[i].uid) {
  //       $scope.chatsInView.splice(i,1)
  //       console.log('removing from chat');
  //       return
  //     }
  //   }
  // }


  $scope.getOpenedChatFromCookie= function(){
      var openedChats=JSON.parse(getCookie('openedChats'));
      console.log(JSON.parse(getCookie('openedChats')));
      for (var i = 0; i < openedChats.length; i++) {
      $scope.addToChat(openedChats[i].index,openedChats[i].uid)
    }
  }
  setTimeout(function () {
      $scope.getOpenedChatFromCookie();
  }, 2000);

    // $scope.addToChat(openedChats[i].index,openedChats[i].uid)




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


  // $scope.tabs=[
  //   {
  //     name: "Templates",
  //     active:"true",
  //     icon: "indent"
  //   },
  //   {
  //     name: "Events",
  //     active:"false",
  //     icon: "clock-o"
  //   },
  //   {
  //     name: "Comments",
  //     active:"true",
  //     icon: "envelope-o"
  //   }
  // ]
  //
  // $scope.comments = [{msg:"hii,how are you,i am fine",date:"2nd march",time:"2.00 pm"},{msg:"hello,how are you",date:"3nd march",time:"6.00 pm"},{msg:"In computer programming, a comment is a programmer-readable explanation or annotation in the source code of a computer program. They are added with the purpose of making the source code easier for humans to understand, and are generally ignored by compilers and interpreters.",date:"5th march",time:"4.00 pm"},{msg:"yups,how are you",date:"1st march",time:"8.00 pm"}]

  $scope.assignUser = function(indx, uid) {

    $scope.myUsers.push($scope.newUsers[indx]);
    $scope.newUsers.splice(indx, 1);

    $http({
      method: 'GET',
      url: '/api/support/supportChat/?user__isnull=True&uid=' + uid
    }).
    then(function(response) {
      console.log(response.data);
      for (var i = 0; i < response.data.length; i++) {

        $http({
          method: 'PATCH',
          url: '/api/support/supportChat/' + response.data[i].pk + '/',
          data: {
            user: $scope.me.pk
          }
        }).
        then(function(response) {
          console.log(response.data);
        });

      }

      $http({
        method: 'GET',
        url: '/api/support/chatThread/?uid=' + uid
      }).
      then(function(response) {
        $http({
          method: 'PATCH',
          url: '/api/support/chatThread/' + response.data[0].pk + '/',
          data: {
            user: $scope.me.pk
          }
        }).
        then(function(response) {
          console.log(response.data);
        });
      })

    });

    $scope.status = 'AP';
    connection.session.publish('service.support.chat.' + uid, [$scope.status, $scope.me.pk], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Published AP" , uid);
    });


    $scope.status = 'R';
    connection.session.publish('service.support.agent', [uid, $scope.status], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Published");
    });



  }

});
