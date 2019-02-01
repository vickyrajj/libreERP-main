var connection = new autobahn.Connection({
  url: wampServer,
  realm: 'default'
});

var webRtcAddress = webRtcAddress
var connectionOpened= false;


connection.onopen = function(session) {

  console.log("session established!");
   connectionOpened = true;

  function chatResonse(args) {

    var status = args[0];
    var msg = args[1];
    var friend = args[2];
    var scope = angular.element(document.getElementById('chatWindow' + friend)).scope();
    if (typeof scope != 'undefined') {
      scope.$apply(function() {
        if (status == "T" && !scope.$$childHead.isTyping) {
          scope.$$childHead.isTyping = true;
          setTimeout(function() {
            var scope = angular.element(document.getElementById('chatWindow' + friend)).scope();
            scope.$apply(function() {
              scope.$$childHead.isTyping = false;
            });
          }, 1500);
        } else if (status == "M") {
          scope.$$childHead.addMessage(msg, args[3])
        } else if (status == "MF") {
          scope.$$childHead.addMessage(msg, args[3])
        };
      });
    } else {
      if (status == 'T') {
        return;
      };
      var scope = angular.element(document.getElementById('main')).scope();
      scope.$apply(function() {
        scope.fetchAddIMWindow(args[3], friend);
      });
    };
  };

  processNotification = function(args) {
    var scope = angular.element(document.getElementById('main')).scope();
    scope.$apply(function() {
      scope.fetchNotifications(args[0]);
    });
  };

  processUpdates = function(args) {
    var scope = angular.element(document.getElementById('aside')).scope();
    if (typeof scope != 'undefined') {
      scope.$apply(function() {
        scope.refreshAside(args[0]);
      });
    }
  };

  processDashboardUpdates = function(args) {

    var scope = angular.element(document.getElementById('dashboard')).scope();
    if (typeof scope != 'undefined') {
      scope.$apply(function() {
        scope.refreshDashboard(args[0]);
      });
    }
  };

var isfocused=true;
var hasAccesss=true;

  supportChatResponse = function(args) {
    window.onblur = function (){
    	isfocused=false;
    }
    window.onfocus = function (){
    	isfocused=true;
    }
    var scope = angular.element(document.getElementById('chatTab')).scope();

    if (args[3]) {
      if(scope.myCompanies.indexOf(args[3])<0){
      hasAccesss=false
      }
    }
    if(!hasAccesss){
      return
    }

    console.log(args);

    function userExist() {
      for (var i = 0; i < scope.newUsers.length; i++) {
        if (scope.newUsers[i].uid == args[0]) {

          scope.onNotification(scope.newUsers[i].uid,args[2].message);
          if (args[1] == 'M') {
            scope.sound.play();
            scope.newUsers[i].messages.push(args[2])
            return true
          } else if (args[1] == 'MF') {
            scope.sound.play();

            // var attachment;
            var xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function() {
              if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(this.responseText)
                scope.newUsers[i].messages.push(data)
              }
            };

            xhttp.open('GET', '/api/support/supportChat/' + args[2].filePk + '/', true);
            xhttp.send();

          } else if (args[1] == 'ML') {
            scope.sound.play();
            scope.newUsers[i].messages.push(args[2])
          }else if (args[1] == 'VCS') {
            scope.sound.play();
            scope.newUsers[i].video = true
            scope.newUsers[i].videoUrl = args[4]
            //this is for video call
          }else if (args[1] == 'AC') {
            scope.sound.play();
            scope.newUsers[i].audio = true
            scope.newUsers[i].audioUrl = args[4]
            //this is for audio call
          }


          return true

        }
      }
      for (var i = 0; i < scope.myUsers.length; i++) {
        if (scope.myUsers[i].uid == args[0]) {
          if((!scope.myUsers[i].boxOpen||!isfocused) && args[1]=='M'){
            scope.onNotification(scope.myUsers[i].uid,args[2].message,i);
          }
          else if((!scope.myUsers[i].boxOpen||!isfocused) && args[1]=='VCS'){
            scope.onNotification(scope.myUsers[i].uid,"Video call!!!",i);
          }else if((!scope.myUsers[i].boxOpen||!isfocused) && args[1]=='AC'){
            scope.onNotification(scope.myUsers[i].uid,"Audio call!!!",i);
          }
          else if((!scope.myUsers[i].boxOpen||!isfocused) && args[1]=='MF'){
            scope.onNotification(scope.myUsers[i].uid,"Media File Receicved",i);
          }
          if (args[1] == 'M') {
            scope.sound.play();
            scope.myUsers[i].messages.push(args[2])
            scope.myUsers[i].unreadMsg += 1
            scope.myUsers[i].spying.value = ''
            // scope.myUsers[i].messages.push( {msg : args[2].msg, sentByMe:false , created:  args[2].created })
          } else if (args[1] == 'MF') {
            scope.sound.play();
            scope.myUsers[i].unreadMsg += 1
            var attachment;
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
              // console.log(this.readyState , this.status , 'onreadyyyyyyyyyyyyyyyyyy' );
              if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(this.responseText)
                scope.myUsers[i].messages.push(data)
                scope.myUsers[i].spying.value = ''
              }
            };
            xhttp.open('GET', '/api/support/supportChat/' + args[2].filePk + '/', true);
            xhttp.send();

          } else if (args[1] == 'ML') {
            scope.sound.play();
            scope.myUsers[i].messages.push(args[2])
            scope.myUsers[i].unreadMsg += 1
            scope.myUsers[i].spying.value = ''
          }else if (args[1] == 'CL') {
            scope.sound.play();
            args[2].created = new Date();
            scope.myUsers[i].messages.push(args[2])
            scope.myUsers[i].disableInput=true

            scope.myUsers[i].unreadMsg += 1
            scope.myUsers[i].spying.value=''
            //chat closed by user
          }else if (args[1] == 'FB') {
            scope.sound.play();
            args[2].created = new Date();
            if (args[2].usersFeedback.length==0) {
              args[2].usersFeedback = "NA"
            }
            scope.myUsers[i].messages.push(args[2])
            scope.myUsers[i].unreadMsg += 1
            scope.myUsers[i].spying.value=''
            //feedback from user with stars
          }else if (args[1] == 'VCS') {
            scope.sound.play();
            scope.myUsers[i].video = true
            scope.myUsers[i].videoUrl = args[4]
            //this is for video call
          }else if (args[1] == 'VCC') {
            // scope.myUsers[i].video = false
            //this is for video call closed
          }else if (args[1] == 'AC') {
            scope.sound.play();
            scope.myUsers[i].audio = true
            scope.myUsers[i].closeIframe = false
            scope.myUsers[i].audioUrl = args[4]
            //this is for audio call
          }else if(args[1]=='calledToHideVideo'){
            scope.myUsers[i].isVideoShowing = false
            scope.myUsers[i].alreadyDone=true
          }else if(args[1]=='calledToShowVideo'){
            scope.myUsers[i].isVideoShowing = true
            scope.myUsers[i].alreadyDone=false
          }
          else if(args[1]=='hideTheIframe'){
            scope.myUsers[i].closeIframe = true
          }
          else if(args[1]=='CustmorClosedTheChat'){
            scope.myUsers[i].AudioVideoOn = true
          }else if(args[1]=='CU'){
            scope.myUsers[i].currentUrl = args[2]
          }
          setTimeout(function() {
            var id = document.getElementById("scrollArea" + args[0]);
            if (id != null) {
              id.scrollTop = id.scrollHeight;
            }
          }, 500);

          return true
        }
      }
    }

    if (args[1] == 'T') {

      for (var i = 0; i < scope.myUsers.length; i++) {
        if (scope.myUsers[i].uid == args[0]) {
          scope.myUsers[i].spying.value = args[2]
          scope.myUsers[i].spying.isTyping = true

          setTimeout(function() {
            var id = document.getElementById("scrollArea" + args[0]);
            if (id != null) {
              id.scrollTop = id.scrollHeight;
            }
          }, 300);

          setTimeout(function (i) {
            scope.myUsers[i].spying.isTyping = false
          }, 2500, (i));
        }
      }

      return
    } else if (args[1] == 'R') {
      for (var i = 0; i < scope.newUsers.length; i++) {
        if (scope.newUsers[i].uid == args[0]) {
          scope.newUsers.splice(i, 1);
        }
      }
      return
    }

    if (userExist()) {

    } else {
      if(args[1]=='M'){
        scope.onNotification(args[0],args[2].message);
      }
      else if(args[1]=='VCS'){
          scope.onNotification(args[0],'Video Coming');
      }else if(args[1]=='AC'){
          scope.onNotification(args[0],'Audio Coming');
      }

      if ((args[1] == 'M' || args[1] == 'MF' || args[1] == 'ML') && args[2].user) {
        return
      }

      var detail = {
        name: '',
        uid: args[0],
        messages: [args[2]],
        isOnline: true,
        companyPk: args[3],
        email:'',
        unreadMsg:0,
        boxOpen:false,
        chatThreadPk: args[5],
        spying:{value :'' , isTyping : false},
        video:false,
        videoUrl:'',
        audio:false,
        audioUrl:'',
        isVideoShowing:true,
        AudioVideoOn:true,
        alreadyDone:false,
        closeIframe:false
      }

      if (args[4]) {
        detail.name = args[4].name
        detail.email = args[4].email
      }
      if (args[1] == 'M') {
        scope.sound.play();
        scope.newUsers.push(detail)
      } else if (args[1] == 'MF') {
        scope.sound.play();
        var attachment;
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText)
            scope.newUsers.push(detail)
          }
        };

        xhttp.open('GET', '/api/support/supportChat/' + args[2].filePk + '/', true);
        xhttp.send();
      } else if (args[1] == 'ML') {
        scope.sound.play();
        scope.newUsers.push(detail)
      }else if (args[1] == 'VCS') {
        scope.sound.play();
        detail.video = true;
        detail.videoUrl = args[6]
        scope.newUsers.push(detail)
      }else if (args[1] == 'AC') {
        scope.sound.play();
        detail.audio = true;
        detail.audioUrl = args[6]
        scope.newUsers.push(detail)
      }
    }

  };

   function checkOnline() {
    var scope = angular.element(document.getElementById('chatTab')).scope();
    if (scope) {
      for (var i = 0; i < scope.myUsers.length; i++) {
        session.call(wamp_prefix+'service.support.heartbeat.' + scope.myUsers[i].uid, []).
        then((function(i) {
          return function (res) {
            scope.myUsers[i].isOnline = true;
          }
        })(i) , (function(i) {
          return function (err) {
            scope.myUsers[i].isOnline = false;
          }
        })(i))
      }

      for (var i = 0; i < scope.newUsers.length; i++) {
        session.call(wamp_prefix+'service.support.heartbeat.' + scope.newUsers[i].uid, []).
        then((function(i) {
          return function (res) {
            scope.newUsers[i].isOnline = true;
          }
        })(i) , (function(i) {
          return function (err) {
            console.log(err,'err');
            scope.newUsers[i].isOnline = false;
          }
        })(i))
      }
    }
  }

  setInterval(function() {
    checkOnline();
  }, 7000)

  session.subscribe(wamp_prefix+'service.support.agent', supportChatResponse).then(
    function(sub) {
      console.log("registered to topic 'supportChatResponse'");
    },
    function(err) {
      console.log("failed to registered: " + err);
    }
  );

setTimeout(function () {
  var scope = angular.element(document.getElementById('main')).scope();
  session.subscribe(wamp_prefix+'service.support.agent.'+scope.me.pk, supportChatResponse).then(
    function(sub) {
      console.log("registered to topic 'supportChatResponse'");
    },
    function(err) {
      console.log("failed to registered: " + err);
    }
  );

}, 5000);


  session.subscribe(wamp_prefix+'service.chat.' + wampBindName, chatResonse).then(
    function(sub) {
      console.log("subscribed to topic 'chatResonse'");
    },
    function(err) {
      console.log("failed to subscribed: " + err);
    }
   );
  session.subscribe(wamp_prefix+'service.notification.' + wampBindName, processNotification).then(
    function(sub) {
      console.log("subscribed to topic 'notification'");
    },
    function(err) {
      console.log("failed to subscribed: " + err);
    }
  );
  session.subscribe(wamp_prefix+'service.updates.' + wampBindName, processUpdates).then(
    function(sub) {
      console.log("subscribed to topic 'updates'");
    },
    function(err) {
      console.log("failed to subscribed: " + err);
    }
  );
  session.subscribe(wamp_prefix+'service.dashboard.' + wampBindName, processDashboardUpdates).then(
    // for the various dashboard updates
    function(sub) {
      console.log("subscribed to topic 'dashboard'");
    },
    function(err) {
      console.log("failed to subscribed: " + err);
    }
  );
};

connection.onclose = function(reason, details) {
  console.log("Connection lost: " + reason);
}
connection.open();

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
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
