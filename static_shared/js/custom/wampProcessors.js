var connection = new autobahn.Connection({
  url: 'ws://' + 'wamp.cioc.in' + ':8001/ws',
  realm: 'default'
});

// "onopen" handler will fire when WAMP session has been established ..
connection.onopen = function(session) {

  console.log("session established!");

  // our event handler we will subscribe on our topic
  //
  function chatResonse(args) {
    console.log(args);

    var status = args[0];
    var msg = args[1];
    var friend = args[2];
    var scope = angular.element(document.getElementById('chatWindow' + friend)).scope();
    console.log(scope);
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
          console.log('attach file');
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
    console.log(args);
    var scope = angular.element(document.getElementById('dashboard')).scope();
    console.log(scope);

    if (typeof scope != 'undefined') {
      scope.$apply(function() {
        scope.refreshDashboard(args[0]);
      });
    }
  };

  supportChatResponse = function(args) {
    var scope = angular.element(document.getElementById('chatTab')).scope();

    console.log(scope, args);
    // console.log(args);

    function userExist() {
      for (var i = 0; i < scope.newUsers.length; i++) {
        if (scope.newUsers[i].uid == args[0]) {
          console.log('yes');
          if (args[1] == 'M') {
            scope.sound.play();
            scope.newUsers[i].messages.push(args[2])
            return true
          } else if (args[1] == 'MF') {
            scope.sound.play();

            // var attachment;
            var xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function() {
              console.log(this.readyState, this.status, 'onreadyyyyyyyyyyyyyyyyyy');
              if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
                var data = JSON.parse(this.responseText)
                // attachment = data.attachment

                scope.newUsers[i].messages.push(data)

                // if (data.type=='image') {
                //   console.log('img');
                //   scope.newUsers[i].messages.push(data)
                // }else if (args[2].type=='audio') {
                //   console.log('audiio');
                //   scope.newUsers[i].messages.push(data)
                // }else if (args[2].type=='video') {
                //   console.log('video');
                //   scope.newUsers[i].messages.push(data)
                // }else if (args[2].type=='application') {
                //   console.log('doc');
                //   scope.newUsers[i].messages.push(data)
                // }

              }
            };

            xhttp.open('GET', '/api/support/supportChat/' + args[2].filePk + '/', true);
            xhttp.send();


          } else if (args[1] == 'ML') {
            scope.sound.play();
            scope.newUsers[i].messages.push(args[2])
          }


          return true

        }
      }
      for (var i = 0; i < scope.myUsers.length; i++) {
        if (scope.myUsers[i].uid == args[0]) {
          console.log('yes');
          if (args[1] == 'M') {
            scope.sound.play();
            scope.myUsers[i].messages.push(args[2])
            // if (!scope.myUsers[i].boxOpen) {
            //   scope.myUsers[i].boxOpen = false
            // }
            scope.myUsers[i].unreadMsg += 1
            // scope.myUsers[i].messages.push( {msg : args[2].msg, sentByMe:false , created:  args[2].created })
          } else if (args[1] == 'MF') {
            scope.sound.play();
            scope.myUsers[i].unreadMsg += 1
            var attachment;
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
              // console.log(this.readyState , this.status , 'onreadyyyyyyyyyyyyyyyyyy' );
              if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
                var data = JSON.parse(this.responseText)
                // attachment = data.attachment
                // console.log('attachment' , attachment);
                scope.myUsers[i].messages.push(data)

                // if (args[2].type=='image') {
                //   console.log('image' , attachment);
                //   scope.myUsers[i].messages.push( {msg:"", img : attachment, sentByMe:false , created:  args[3] })
                // }else if (args[2].type=='audio') {
                //   console.log('audiio');
                //   scope.myUsers[i].messages.push( {msg:"", audio : attachment, sentByMe:false , created:  args[3] })
                // }else if (args[2].type=='video') {
                //   console.log('video');
                //   scope.myUsers[i].messages.push( {msg:"", video : attachment, sentByMe:false , created:  args[3] })
                // }else if (args[2].type=='doc') {
                //   console.log('doc');
                //   scope.myUsers[i].messages.push( {msg:"", doc : attachment, sentByMe:false , created:  args[3] })
                // }



              }
            };
            xhttp.open('GET', '/api/support/supportChat/' + args[2].filePk + '/', true);
            xhttp.send();




          } else if (args[1] == 'ML') {
            scope.sound.play();
            scope.myUsers[i].messages.push(args[2])
            scope.myUsers[i].unreadMsg += 1
          }
          console.log('scroll');

          setTimeout(function() {
            var id = document.getElementById("scrollArea" + args[0]);
            console.log(id.scrollHeight);
            id.scrollTop = id.scrollHeight;
            console.log(id);
          }, 200);

          return true
        }
      }
    }

    if (userExist()) {
      console.log('yesssssssssssss');
    } else {
      console.log('no');
      console.log(args);
      if (args[1] == 'M') {
        scope.sound.play();
        console.log(args, 'argssssssssss');
        scope.newUsers.push({
          name: '',
          uid: args[0],
          messages: [args[2]],
          isOnline: true
        })
      } else if (args[1] == 'MF') {
        scope.sound.play();
        var attachment;
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var data = JSON.parse(this.responseText)
            // attachment = data.attachment
            scope.newUsers.push({
              name: '',
              uid: args[0],
              messages: [args[2]],
              isOnline: true
            })

            // if (args[2].type=='image') {
            //   scope.newUsers.push( {name : '', uid: args[0],  messages : [{msg:"", img : attachment, sentByMe:false , created:  args[3] }], isOnline:true }  )
            // }else if (args[2].type=='audio') {
            //   scope.newUsers.push( {name : '', uid: args[0],  messages : [{msg:"", audio : attachment, sentByMe:false , created:  args[3] }], isOnline:true }  )
            // }else if (args[2].type=='video') {
            //   scope.newUsers.push( {name : '', uid: args[0],  messages : [{msg:"", video : attachment, sentByMe:false , created:  args[3] }], isOnline:true }  )
            // }else if (args[2].type=='doc') {
            //   scope.newUsers.push( {name : '', uid: args[0],  messages : [{msg:"", doc : attachment , sentByMe:false , created:  args[3] }], isOnline:true }  )
            // }


          }
        };

        xhttp.open('GET', '/api/support/supportChat/' + args[2].filePk + '/', true);
        xhttp.send();


        return true
      } else if (args[1] == 'ML') {
        scope.sound.play();
        scope.newUsers.push({
          name: '',
          uid: args[0],
          messages: [args[2]],
          isOnline: true
        })
      }
    }

    if (args[1] == 'O') {
      var uid = args[0];
      var status = 'O';
      connection.session.publish('service.support.chat.' + uid, [status], {}, {
        acknowledge: true
      }).
      then(function(publication) {
        console.log("Published");
      });
    } else if (args[1] == 'T') {
      console.log('typingggggggggg cccccc');
      // console.log(scope.$$childHead.isTyping);
      // scope.$$childHead.isTyping = true;
    }

  };

  session.subscribe('service.support.agent', supportChatResponse).then(
    function(sub) {
      console.log("subscribed to topic 'supportChatResponse'");
    },
    function(err) {
      console.log("failed to subscribed: " + err);
    }
  );


  session.subscribe('service.chat.' + wampBindName, chatResonse).then(
    function(sub) {
      console.log("subscribed to topic 'chatResonse'");
    },
    function(err) {
      console.log("failed to subscribed: " + err);
    }
  );
  session.subscribe('service.notification.' + wampBindName, processNotification).then(
    function(sub) {
      console.log("subscribed to topic 'notification'");
    },
    function(err) {
      console.log("failed to subscribed: " + err);
    }
  );
  session.subscribe('service.updates.' + wampBindName, processUpdates).then(
    function(sub) {
      console.log("subscribed to topic 'updates'");
    },
    function(err) {
      console.log("failed to subscribed: " + err);
    }
  );
  session.subscribe('service.dashboard.' + wampBindName, processDashboardUpdates).then(
    // for the various dashboard updates
    function(sub) {
      console.log("subscribed to topic 'dashboard'");
    },
    function(err) {
      console.log("failed to subscribed: " + err);
    }
  );

};


// fired when connection was lost (or could not be established)
//
connection.onclose = function(reason, details) {
  console.log("Connection lost: " + reason);
}
connection.open();
