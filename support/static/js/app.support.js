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
          spying:{value :'' , isTyping : false}
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
          spying:{value :'' , isTyping : false}
        })
      }
    });
  }, 1000);









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
    $scope.chatsInView.splice(index, 1)
    if (myUserIndex != undefined) {
      $scope.myUsers.splice(myUserIndex, 1)
    }
  }

  $scope.display = function(data) {
    $scope.msgText = $scope.templates[data].msg;
  }

  $scope.addToChat = function(indx , uid ) {


    // $scope.status = 'AP';
    // connection.session.publish('service.support.chat.' + uid, [$scope.status, $scope.me.pk], {}, {
    //   acknowledge: true
    // }).
    // then(function(publication) {
    //   console.log("Published");
    // });



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

    if ($scope.newUsers[indx].type=='videoCall') {
      // alert('open i frame')
      var body = document.getElementsByTagName("BODY")[0]
      var iframeDiv = document.createElement('div')
      iframeDiv.id = "iframeDiv"
      var iFrame = document.createElement('iframe')
      iFrame.src = $scope.newUsers[indx].url
      iFrame.style.position = "fixed";
      iFrame.style.top = "25%";
      iFrame.style.left = "25%";
      iFrame.style.width = "50%";
      iFrame.style.height = "50%";
      iframeDiv.appendChild(iFrame)
      body.appendChild(iframeDiv)
      // window.open($scope.newUsers[indx].url);
      return
    }

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
