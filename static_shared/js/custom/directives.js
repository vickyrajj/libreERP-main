app.directive("mathjaxBind", function() {
  return {
    restrict: "A",
    controller: ["$scope", "$element", "$attrs",
      function($scope, $element, $attrs) {
        $scope.$watch($attrs.mathjaxBind, function(texExpression) {
          $element.html(texExpression);
          MathJax.Hub.Queue(["Typeset", MathJax.Hub, $element[0]]);
        });
      }
    ]
  };
});

app.directive('tabsStrip', function() {
  return {
    templateUrl: '/static/ngTemplates/tabsStrip.html',
    restrict: 'E',
    replace: true,
    scope: {
      tabs: '=',
      active: '='
    },
    controller: function($scope, $state, $stateParams) {
      $scope.changeTab = function(index) {
        for (var i = 0; i < $scope.tabs.length; i++) {
          $scope.tabs[i].active = false;
        }
        $scope.tabs[index].active = true;
        $scope.active = index;
      }

      $scope.$watch('active', function(newValue, oldValue) {
        $scope.changeTab(newValue);
      })
    },
  };
});

app.directive('commentInput', function() {
  return {
    templateUrl: '/static/ngTemplates/inputWithFile.html',
    restrict: 'E',
    replace: true,
    scope: {
      text: '=',
      doc: '=',
      saveNote: '='
    },
    controller: function($scope, $state, $stateParams) {

      $scope.randomKey = '' + new Date().getTime();

      if ($scope.doc == null || $scope.doc == undefined) {
        $scope.doc = emptyFile;
      }
      if ($scope.text == null || $scope.doc == undefined) {
        $scope.text = '';
      }
      $scope.browseForFile = function() {
        if ($scope.doc.size != 0) {
          $scope.doc = emptyFile;
          return;
        }
        $('#noteEditorFile' + $scope.randomKey).click();
      }

      $scope.$watch('doc', function(newValue, oldValue) {
        // console.log(newValue);
      })
    },
  };
});

app.directive('wizard', function() {
  return {
    templateUrl: '/static/ngTemplates/wizard.html',
    restrict: 'E',
    replace: true,
    scope: {
      active: '=',
      editable: '=',
      steps: '=',
      error: '='
    },
    controller: function($scope, $state, $stateParams) {

      $scope.activeBackup = -2;
      $scope.wizardClicked = function(indx) {
        if ($scope.editable) {
          $scope.active = indx;
          $scope.activeBackup = -2;
        }
      }

      $scope.resetHover = function(indx) {
        if ($scope.editable && $scope.activeBackup != -2) {
          $scope.active = $scope.activeBackup;
          $scope.activeBackup = -2;
        }
      }

      $scope.activateTemp = function(indx) {
        if ($scope.editable) {
          $scope.activeBackup = $scope.active;
          $scope.active = indx;
        }
      }

    },
  };
});

app.directive('breadcrumb', function() {
  return {
    templateUrl: '/static/ngTemplates/breadcrumb.html',
    restrict: 'E',
    replace: true,
    scope: false,
    controller: function($scope, $state, $stateParams) {
      var stateName = $state.current.name;
      $scope.stateParts = stateName.split('.');
      for (key in $stateParams) {
        if (typeof $stateParams[key] != 'undefined' && $stateParams[key] != '' && typeof parseInt($stateParams[key]) != 'number') {
          $scope.stateParts.push($stateParams[key]);
        };
      };
    },
  };
});

app.directive('userField', function() {
  return {
    templateUrl: '/static/ngTemplates/userInputField.html',
    restrict: 'E',
    replace: true,
    scope: {
      user: '=',
      url: '@',
      label: '@',
    },
    controller: function($scope, $state, $http, Flash) {
      $scope.userSearch = function(query) {
        return $http.get($scope.url + '?username__contains=' + query).
        then(function(response) {
          return response.data;
        })
      };
      $scope.getName = function(u) {
        if (typeof u == 'undefined' || u == null) {
          return '';
        }
        return u.first_name + '  ' + u.last_name;
      }
    },
  };
});

app.directive('usersField', function() {
  return {
    templateUrl: '/static/ngTemplates/usersInputField.html',
    restrict: 'E',
    replace: true,
    scope: {
      data: '=',
      url: '@',
      col: '@',
      label: '@',
      viewOnly: '@'
    },
    controller: function($scope, $state, $http, Flash) {
      $scope.d = {
        user: undefined
      };
      if (typeof $scope.col != 'undefined') {
        $scope.showResults = true;
      } else {
        $scope.showResults = false;
      }

      if (typeof $scope.viewOnly != 'undefined') {
        $scope.viewOnly = false;
      }
      // $scope.user = undefined;
      $scope.userSearch = function(query) {
        return $http.get($scope.url + '?username__contains=' + query).
        then(function(response) {
          for (var i = 0; i < response.data.length; i++) {
            if ($scope.data.indexOf(response.data[i]) != -1) {
              response.data.splice(i, 1);
            }
          }
          return response.data;
        })
      };
      $scope.getName = function(u) {
        if (typeof u == 'undefined') {
          return '';
        }
        return u.first_name + '  ' + u.last_name;
      }

      $scope.removeUser = function(index) {
        $scope.data.splice(index, 1);
      }

      $scope.addUser = function() {
        for (var i = 0; i < $scope.data.length; i++) {
          if ($scope.data[i] == $scope.d.user.pk) {
            Flash.create('danger', 'User already a member of this group')
            return;
          }
        }


        $scope.data.push($scope.d.user.pk);
        $scope.d.user = undefined;
      }
    },
  };
});

app.directive('mediaField', function() {
  return {
    templateUrl: '/static/ngTemplates/mediaInputField.html',
    restrict: 'E',
    replace: true,
    scope: {
      data: '=',
      url: '@',
    },
    controller: function($scope, $state, $http, Flash) {
      $scope.form = {
        mediaType: '',
        url: ''
      }
      $scope.switchMediaMode = function(mode) {
        $scope.form.mediaType = mode;
      }

      $scope.getFileName = function(f) {
        var parts = f.split('/');
        return parts[parts.length - 1];
      }

      $scope.removeMedia = function(index) {
        $http({
          method: 'DELETE',
          url: $scope.url + $scope.data[index].pk + '/'
        }).
        then(function(response) {
          $scope.data.splice(index, 1);
        })
      }
      $scope.postMedia = function() {
        var fd = new FormData();
        fd.append('mediaType', $scope.form.mediaType);
        fd.append('link', $scope.form.url);
        if (['doc', 'image', 'video'].indexOf($scope.form.mediaType) != -1 && $scope.form.file != emptyFile) {
          fd.append('attachment', $scope.form.file);
        } else if ($scope.form.url == '') {
          Flash.create('danger', 'No file to attach');
          return;
        }
        url = $scope.url;
        $http({
          method: 'POST',
          url: url,
          data: fd,
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        }).
        then(function(response) {
          $scope.data.push(response.data);
          $scope.form.file = emptyFile;
          Flash.create('success', response.status + ' : ' + response.statusText);
        }, function(response) {
          Flash.create('danger', response.status + ' : ' + response.statusText);
        });
      }
    },
  };
});

app.directive('genericForm', function() {
  return {
    templateUrl: '/static/ngTemplates/genericForm.html',
    restrict: 'E',
    replace: true,
    scope: {
      template: '=',
      submitFn: '&',
      data: '=',
      formTitle: '=',
      wizard: '=',
      maxPage: '=',
    },
    controller: function($scope, $state) {
      $scope.page = 1;

      $scope.next = function() {
        $scope.page += 1;
        if ($scope.page > $scope.maxPage) {
          $scope.page = $scope.maxPage;
        }
      }
      $scope.prev = function() {
        $scope.page -= 1;
        if ($scope.page < 1) {
          $scope.page = 1;
        }
      }
    },
  };
});
app.directive('reviewInfo', function() {
  return {
    templateUrl: '/static/ngTemplates/reviewInfo.html',
    restrict: 'E',
    replace: true,
    scope: {
      data: '=',
    },
    controller: function($scope, $state, $http, $permissions, $timeout, $uibModal) {
    if($scope.data.chatThreadData!=null){

      $scope.msgData=[]
      $scope.fullChatData=[]
      console.log($scope.data);
      $scope.msgData = $scope.data.chatThreadData
      $scope.fullChatData=$scope.data.supportChatData
      $scope.commentPerm = false;

      $timeout(function () {
        $scope.commentPerm =  $permissions.myPerms('module.reviews.comment')
      }, 500);

      $scope.reviewForm = {message:''}

      $scope.calculateTime = function(user, agent) {

        if (user != undefined) {
          var usertime = new Date(user);
          var agenttime = new Date(agent);
          var diff = Math.floor((agenttime - usertime) / 60000)
          if (diff < 60) {
            return diff + ' Mins';
          } else if (diff >= 60 && diff < 60 * 24) {
            return Math.floor(diff / 60) + ' Hrs';
          } else if (diff >= 60 * 24) {
            return Math.floor(diff / (60 * 24)) + ' Days';
          }
        } else {
          return
        }
      }

      $scope.reviewCommentData = []
      $http({
        method: 'GET',
        url: '/api/support/reviewComment/?user='+$scope.msgData.user_id+'&uid='+$scope.msgData.uid+'&chatedDate='+$scope.msgData.created.split('T')[0],
      }).
      then(function(response) {
        $scope.reviewCommentData =response.data
      });

      $http({
        method: 'GET',
        url: '/api/support/chatThread/?uid='+$scope.msgData.uid
      }).
      then(function(response) {
        console.log(response.data,'dddddddddddd',typeof response.data);
        $scope.myChatThreadData =response.data[0]
      });



      $scope.audio_chat={
        agent:null,
        visitor:null
      };
      $scope.video_chat={
        agent:null,
        visitor:null
      };

      $scope.typ=$scope.msgData.typ
      if($scope.msgData.typ=='audio'){
        $scope.audio_chat={
          agent:'/media/agent'+$scope.msgData.uid+'.mp3',
          visitor:'/media/local'+$scope.msgData.uid+'.mp3'
        }
      }

      else if($scope.msgData.typ=='video'){
        $scope.video_chat={
          agent:'/media/agent'+$scope.msgData.uid+'.webm',
          visitor:'/media/local'+$scope.msgData.uid+'.webm'
        }
        $scope.screen_video='/media/screen'+$scope.msgData.uid+'.webm'
      }

      var stream_agent,stream_visitor,canvas_agent,canvas_visitor,ctx_agent,ctx_visitor,unique_agent_video_id,unique_visitor_video_id;

      setTimeout(function () {

        if($scope.video_chat||$scope.audio_chat){

          if ($scope.video_chat.agent) {
              unique_agent_video_id="vid_agent"+$scope.myChatThreadData.uid;
              unique_visitor_video_id="vid_visitor"+$scope.myChatThreadData.uid;
              stream_agent  = document.getElementById(unique_agent_video_id);
              stream_visitor  = document.getElementById(unique_visitor_video_id);
              canvas_agent = document.getElementById('canvas_agent');
              canvas_visitor = document.getElementById('canvas_visitor');
              ctx_agent = canvas_agent.getContext('2d');
              ctx_visitor = canvas_visitor.getContext('2d');
              w=200; h=200;
              canvas_agent.width = w;
              canvas_agent.height = h;
              canvas_visitor.width = w;
              canvas_visitor.height = h;

          }
          else if($scope.audio_chat.agent){
              stream_agent  = document.getElementById("aud_agent");
              stream_visitor  = document.getElementById("aud_visitor");
          }
        }
      }, 900);
      setTimeout(function () {
      if(stream_agent.readyState>0&&stream_agent.readyState>0){
              $scope.slider = {
                  value: 0,
                  options: {
                      floor: 0,
                      ceil: stream_agent.duration,
                      step: 0,
                      rightToLeft: false
                  }
              };
              $scope.vol_slider = {
                value: 10,
                options: {
                  floor:0,
                  ceil:10,
                  showSelectionBar: true,
                  getSelectionBarColor: function(value) {
                   if (value <= 3)
                       return 'red';
                   if (value <= 6)
                       return 'orange';
                   if (value <= 9)
                       return 'yellow';
                   return '#2AE02A';
                 }
               }
             };
              var StopSliderOnPause;
              function handleSliderForVideo(){
                StopSliderOnPause=setInterval(function () {
                  $scope.slider.options.ceil=stream_agent.duration;
                  if($scope.slider.value+1>=stream_agent.duration){
                    clearInterval(StopSliderOnPause);
                    $scope.play_pause=false;
                    $scope.slider.value=0;
                    stream_agent.pause();
                    stream_visitor.pause();
                  }
                  else{
                    $scope.slider.value=stream_agent.currentTime;
                  }
                },500);
              }
              $scope.$watch('vol_slider.value', function(newValue, oldValue) {
                stream_agent.volume=newValue/10;
                stream_visitor.volume=newValue/10;
              });
              $scope.$watch('slider.value', function(newValue, oldValue) {
                if(newValue-oldValue>1||oldValue-newValue>1){
                  stream_agent.currentTime=newValue
                  stream_visitor.currentTime=newValue
                }
              });
              $scope.play_video=function(){
                $scope.play_pause=true;
                stream_agent.play();
                stream_visitor.play();
                handleSliderForVideo();
              }
              $scope.pause_video=function(){
                $scope.play_pause=false;
                stream_agent.pause();
                stream_visitor.pause();
                clearInterval(StopSliderOnPause)
              }
      }
    }, 1500);


    $scope.showChart = function(){
      console.log('modalllllllllllllllll');
      $uibModal.open({
        templateUrl: '/static/ngTemplates/app.support.review.fullChat.modal.html',
        size: 'lg',
        backdrop: true,
        resolve: {
          myChatThreadData: function() {
            return $scope.myChatThreadData;
          }
        },
        controller: function($scope, myChatThreadData , $users , $uibModalInstance, Flash) {

          $scope.myChatThreadData = myChatThreadData
          $scope.calculateTime = function (user , agent) {
            if (user!=undefined) {
              var usertime = new Date(user);
              var agenttime = new Date(agent);
              var diff = Math.floor((agenttime - usertime)/60000)
              if (diff<60) {
                return diff+' Mins';
              }else if (diff>=60 && diff<60*24) {
                return Math.floor(diff/60)+' Hrs';
              }else if (diff>=60*24) {
                return Math.floor(diff/(60*24))+' Days';
              }
            }else {
              return
            }
          }
          $http({
              method: 'GET',
              url: '/api/support/supportChat/?uid='+myChatThreadData.uid,
            }).
            then(function(response) {
              console.log(response.data,typeof response.data,response.data.length);
              $scope.fullChatData = response.data
            });


          checkEmail = function(){
            console.log($scope.form.email);
            $http({
                method: 'GET',
                url: '/api/support/visitor/?email='+$scope.form.email+'&uid='+uid,
              }).
              then(function(response) {
                console.log(response.data,typeof response.data,response.data.length);
                if (response.data.length ==1 && response.data[0].email == $scope.form.email) {
                  $scope.form = response.data[0]
                }
              });
          }
          $scope.changeStatus = function(status){
            $http({
              method: 'PATCH',
              url: '/api/support/chatThread/' + $scope.myChatThreadData.pk + '/',
              data: {status:status}
            }).
            then(function(response) {
              Flash.create('success', 'Updated')
              $uibModalInstance.dismiss(response.data.status)
            });
          }

        },
      }).result.then(function () {

      }, function (status) {
        console.log(status);
        console.log($scope.myChatThreadData);
        if (status != 'backdrop click' && status != 'escape key press') {
          $scope.myChatThreadData.status = status
        }
      });

    }
    $scope.snap=function() {
        ctx_agent.fillRect(0, 0, w, h);
        ctx_agent.drawImage(stream_agent, 0, 0, w, h);
        ctx_visitor.fillRect(0, 0, w, h);
        ctx_visitor.drawImage(stream_visitor, 0, 0, w, h);
        $uibModal.open({
          templateUrl: '/static/ngTemplates/app.qualityCheck.capture.modal.html',
          size: 'md',
          backdrop: true,
          resolve: {
            data: function(){
              return $scope.msgData.uid
            }
          },
          controller: function($scope, $users, $uibModalInstance,data, Flash) {
            console.log("model opened");
            $scope.uidd=data;
            $scope.imgsrc_agent =canvas_agent.toDataURL();
            $scope.imgsrc_visitor =canvas_visitor.toDataURL();
            $scope.timeOfCapture=stream_agent.currentTime;

            function dataURItoBlob(dataURI) {
              var byteString = atob(dataURI.split(',')[1]);
              var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
              var ab = new ArrayBuffer(byteString.length);
              var ia = new Uint8Array(ab);
              for (var i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
              }
              var blob = new Blob([ab], {type: mimeString});
              return blob;
            }

            $scope.blob_of_agent_image=dataURItoBlob($scope.imgsrc_agent);
            $scope.blob_of_visitor_image=dataURItoBlob($scope.imgsrc_visitor);

            $scope.onSend_Capture =function(){
                if ($scope.reviewForm.message.length == 0) {
                  Flash.create('warning','Please Write Some Comment')
                  return
                }
                $scope.timeOfGeneration=new Date().toISOString();
                var fd = new FormData();
                fd.append('message', $scope.reviewForm.message);
                fd.append('uid', $scope.uidd);
                fd.append('timestamp', $scope.timeOfCapture);
                fd.append('visitor_capture', $scope.blob_of_visitor_image);
                fd.append('agent_capture', $scope.blob_of_agent_image);
                fd.append('chatedDate', $scope.timeOfGeneration.split('T')[0]);
                console.log("Sending..");
                SendingPostRequest(fd);
                $uibModalInstance.dismiss()
              }
          },
          }).result.then(function() {

        }, function(data) {
          console.log(data);
        });
    };

      function SendingPostRequest(toSend){
        console.log("Posting....",toSend);
        $http({
          method: 'POST',
          url: '/api/support/reviewComment/',
          data : toSend,
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        }).
        then(function(response) {
          console.log(response.data);
          $scope.reviewCommentData.push(response.data)
          $scope.reviewForm = {message:'',visitor_capture:'',visitor_capture:''}
        }, function(err) {
          console.log(err.data.detail);
          Flash.create('danger', err.data.detail);
        });
      }
      $scope.postComment = function(){
        console.log($scope.msgData.created);
        if ($scope.reviewForm.message.length == 0) {
          Flash.create('warning','Please Write Some Comment')
          return
        }
        var fd1 = new FormData();
        fd1.append('message', $scope.reviewForm.message);
        fd1.append('uid', $scope.msgData.uid);
        fd1.append('chatedDate', $scope.msgData.created.split('T')[0]);
        console.log(fd1);
        SendingPostRequest(fd1);
      }





      // $scope.postComment = function(){
      //   console.log($scope.msgData.created);
      //   if ($scope.reviewForm.message.length == 0) {
      //     Flash.create('warning','Please Write Some Comment')
      //     return
      //   }
      //   var toSend = {message:$scope.reviewForm.message,uid:$scope.msgData.uid,chatedDate:$scope.msgData.created.split('T')[0]}
      //   $http({
      //     method: 'POST',
      //     url: '/api/support/reviewComment/',
      //     data : toSend
      //   }).
      //   then(function(response) {
      //     console.log(response.data,'dddddddddddd',typeof response.data);
      //     console.log(response.data);
      //     $scope.reviewCommentData.push(response.data)
      //     $scope.reviewForm = {message:''}
      //   }, function(err) {
      //     console.log(err.data.detail);
      //     Flash.create('danger', err.data.detail);
      //   });
      // }
    }

    },
  };
});

app.directive('chatBox', function() {
  return {
    templateUrl: '/static/ngTemplates/chatBox.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      index: '=',
      closeChat: '='
    },
    controller: function($scope, $users, $uibModal, $http, ngAudio, Flash, $sce, webNotification) {
      $scope.IsVisitorOn=true;
      $scope.isVisitorVideoShowing=true;

        $http({
            method: 'GET',
            url: '/api/support/getMyUser/?getCompanyDetails=' + $scope.data.companyPk,
          }).then(function(response){
            $scope.companyName=response.data[0]
          })

      setTimeout(function () {
        document.getElementById('chatBoxdiv'+$scope.index).focus()
      }, 1000);

      $scope.textAreaBehavior = function(e){
        if (e.keyCode == 13 && !e.shiftKey)
            {
                // prevent default behavior
                e.preventDefault();
                console.log('both');
                $scope.send();
            }
            if (e.keyCode == 13&&e.shiftKey)
            {
              console.log('here');
            }
      }

      setInterval(function () {
        // alert($scope.data.currentUrl)
      }, 10000);


      // $scope.closeIframe1=$scope.data.closeIframe

      setTimeout(function() {
        if (document.getElementById("iframeChat" + $scope.data.uid) != null)
          $scope.getFrameContent = document.getElementById("iframeChat"+ $scope.data.uid).contentWindow;
      }, 2000);
      $scope.captureImage = function() {
        if ($scope.getFrameContent==undefined) {
          $scope.getFrameContent = document.getElementById("iframeChat"+ $scope.data.uid).contentWindow;
        }
        $scope.getFrameContent.postMessage('captureImage', webRtcAddress);
      }

      // const permissionToRemove = {
      //     permissions: ["microphone"]
      //     }

      // $scope.$watch('data.closeIframe',function(newValue,oldValue){
      //   if(newValue){
      //     // if ($scope.getFrameContent==undefined) {
      //     //   $scope.getFrameContent = document.getElementById("iframeChat"+ $scope.data.uid).contentWindow;
      //     // }
      //     // console.log('going to call');
      //     // $scope.getFrameContent.postMessage('agentCalled', webRtcAddress);
      //     // $scope.closeIframe1=newValue
      //
      //           browser.permissions.remove(permissionToRemove).then(result => {
      //             console.log(result);
      //           });
      //       }
      // })

      $scope.toggleVisitorScreen=function(){
        if(!$scope.alreadyDone){
          $scope.isVisitorVideoShowing=!$scope.isVisitorVideoShowing;
          if(!$scope.isVisitorVideoShowing){
            // document.getElementById("iframeChat" + $scope.data.uid).style.height="14%";
            $scope.msgDivHeight = 51
            connection.session.publish(wamp_prefix+'service.support.chat.' + $scope.data.uid, ['ToggleVisitorVideo'], {}, {
              acknowledge: true
            }).
            then(function(publication) {
              console.log("Published");
            });
          }
        else{
          // document.getElementById("iframeChat" + $scope.data.uid).style.height="100%"
          $scope.msgDivHeight = 52
          // document.getElementById("iframeChat" + $scope.data.uid).style.transition=".5s"
          connection.session.publish(wamp_prefix+'service.support.chat.' + $scope.data.uid, ['ShowVisitorVideo'], {}, {
            acknowledge: true
          }).
          then(function(publication) {
            console.log("Published");
          });
        }
        }
      }
      // window.addEventListener("message", receiveMessage, false);
      $scope.hideVisitorScreen = function() {
        $scope.IsVisitorOn=!$scope.IsVisitorOn;
        if($scope.IsVisitorOn){
          connection.session.publish(wamp_prefix+'service.support.chat.' + $scope.data.uid, ['ShowVisitorScreen'], {}, {
            acknowledge: true
          }).
          then(function(publication) {
            console.log("Published");
          });
        }
      else{
        connection.session.publish(wamp_prefix+'service.support.chat.' + $scope.data.uid, ['hideVisitorScreen'], {}, {
          acknowledge: true
        }).
        then(function(publication) {
          console.log("Published");
        });
      }
      }

      // alert($scope.data.closeIframe+"******")

      $scope.setHeight = function () {
        console.log('timesss');
        if ($scope.data.audio) {
          $scope.msgDivHeight = 66
        }else if ($scope.data.video) {
          $scope.msgDivHeight = 51
        }else {
          $scope.msgDivHeight = 71
        }
      }

      $scope.setHeight()

      window.addEventListener("message", receiveMessage, false);

      function receiveMessage(event) {
        if(event.data=='callFromAgentplease'){
          alert('aaaaaaaaaaa gyaaaaaaaaaaa');
        }
        if (event.origin == webRtcAddress&&event.data.indexOf("*")) {
          console.log(event.data + ' ******************');
          var uid = event.data.split('*')[0]
          var imageData = event.data.split('*')[1]
          if (uid==$scope.data.uid) {
            $scope.takeSnapshot(imageData)
          }
        }
      }

      $scope.me = $users.get('mySelf');
      // console.log($scope.data,'will fetch here');
      $scope.visitorForm = ''
      $scope.isTyping = false;
      $scope.chatHistBtn = false;
      $scope.chatHistory = []
      console.log($scope.data);
      console.log('adsd', $scope.data);




      $scope.takeSnapshot = function(imageUrl) {
        $uibModal.open({
          templateUrl: '/static/ngTemplates/app.support.takeSnapshot.modal.html',
          size: 'lg',
          backdrop: true,
          controller: function($scope, $users, $uibModalInstance, $timeout, $rootScope) {

            $scope.imageUrl = imageUrl;

            $scope.bgCanvasImage = function() {
              $scope.canvas.setBackgroundImage($scope.imageUrl, $scope.canvas.renderAll.bind($scope.canvas), {
                backgroundImageOpacity: 0.5,
                backgroundImageStretch: false
              });
            }

            $scope.showCanvas = false;


            $timeout(function() {
              $scope.canvas = new fabric.Canvas('snapshotCanvas', {
                selection: false
              });

              $scope.showCanvas = true;


              var modalBody = document.getElementById('modalBody');
              $scope.canvas.setWidth(800);
              $scope.canvas.setHeight(500);

              $rootScope.rectangles = [];
              $rootScope.circles = [];
              $rootScope.triangles = [];
              $scope.data = {
                "objects": []
              };


              $scope.size = 3;
              $scope.col = '#000000';
              $scope.mode = null;
              // $scope.HeightCount = 0;

              $scope.startx;
              $scope.starty;
              $scope.endx;
              $scope.endy;

              fabric.Object.prototype.selectable = false;

              $scope.SetPen = function() {
                $scope.canvas.isDrawingMode = true;
                $scope.canvas.freeDrawingBrush.color = $scope.col;
                $scope.canvas.freeDrawingBrush.width = $scope.size;
              }

              $scope.SetPen();
              $scope.mode = 'line'

              $scope.setColor = function(col) {
                $scope.col = col;
                $scope.canvas.freeDrawingBrush.color = col;
              }

              $scope.canvas.on('path:created', function(options) {
                //console.log(options.path.path);
                $scope.temp = {
                  timestamp: new Date().getTime(),
                  type: options.path.type,
                  originX: options.path.originX,
                  originY: options.path.originY,
                  left: options.path.left,
                  top: options.path.top,
                  fill: options.path.fill,
                  strokeLineCap: options.path.strokeLineCap,
                  stroke: options.path.stroke,
                  strokeWidth: options.path.strokeWidth,
                  pathOffset: options.path.pathOffset,
                  path: options.path.path,
                  lockMovementX: true,
                  lockMovementY: true,
                  hasControls: false,
                  hasBorders: false,
                  selectable: false,
                  hoverCursor: 'default',
                  objectCaching: false
                };

                //push path into $scope.data
                $scope.data['objects'].push($scope.temp);
                //console.log(options.path);
                // $scope.data['objects'].push(options.path);
              });

              $scope.canvas.on('mouse:down', function(options) {
                $scope.pointer = $scope.canvas.getPointer(options.e);
                $scope.startx = $scope.pointer.x;
                $scope.starty = $scope.pointer.y;
              });

              $scope.canvas.on('mouse:move', function(options) {
                $scope.pointer = $scope.canvas.getPointer(options.e);
                $scope.endx = $scope.pointer.x;
                $scope.endy = $scope.pointer.y;
              });

              $scope.canvas.on('mouse:up', function() {

                if ($scope.endy - $scope.starty < 0) {
                  // if drag towards top
                  var tempy = $scope.starty;
                  $scope.starty = $scope.endy;
                  $scope.endy = tempy;
                }

                if ($scope.endx - $scope.startx < 0) {
                  //  if drag towards left
                  var tempx = $scope.startx;
                  $scope.startx = $scope.endx;
                  $scope.endx = tempx;
                }

                if ($scope.mode == "rect") {
                  $scope.temp = {
                    timestamp: new Date().getTime(),
                    type: $scope.mode,
                    left: $scope.startx,
                    top: $scope.starty,
                    width: $scope.endx - $scope.startx,
                    height: $scope.endy - $scope.starty,
                    fill: '',
                    stroke: $scope.col,
                    strokeWidth: $scope.size,
                    lockMovementX: true,
                    lockMovementY: true,
                    hasControls: false,
                    hasBorders: false,
                    selectable: false,
                    hoverCursor: 'default'
                  };
                  $scope.data['objects'].push($scope.temp);
                } else if ($scope.mode == "circle") {
                  $scope.temp = {
                    type: $scope.mode,
                    left: $scope.startx,
                    top: $scope.starty,
                    radius: ($scope.endx - $scope.startx) / 2,
                    fill: '',
                    stroke: $scope.col,
                    strokeWidth: $scope.size,
                    lockMovementX: true,
                    lockMovementY: true,
                    hasControls: false,
                    hasBorders: false,
                    selectable: false,
                    hoverCursor: 'default'
                  };
                  $scope.data['objects'].push($scope.temp);
                } else if ($scope.mode == "triangle") {
                  $scope.temp = {
                    type: $scope.mode,
                    left: $scope.startx,
                    top: $scope.starty,
                    originX: 'left',
                    originY: 'top',
                    width: $scope.endx - $scope.startx,
                    height: $scope.endy - $scope.starty,
                    fill: '',
                    stroke: $scope.col,
                    strokeWidth: $scope.size,
                    lockMovementX: true,
                    lockMovementY: true,
                    hasControls: false,
                    hasBorders: false,
                    selectable: false,
                    hoverCursor: 'default'
                  };
                  $scope.data['objects'].push($scope.temp);
                }

                redraw();

              });


              redraw();

              function redraw() {
                $rootScope.dataString = JSON.stringify($scope.data);
                console.log("In redraw");
                $scope.canvas.clear();
                //console.log("clear and load data");
                $scope.canvas.loadFromJSON($scope.dataString, $scope.canvas.renderAll.bind($scope.canvas));
                $scope.bgCanvasImage()

              }

            }, 1000);




            $scope.sendImage = function() {

              function dataURItoBlob(dataURI) {
                // convert base64/URLEncoded data component to raw binary data held in a string
                var byteString;
                if (dataURI.split(',')[0].indexOf('base64') >= 0)
                  byteString = atob(dataURI.split(',')[1]);
                else
                  byteString = unescape(dataURI.split(',')[1]);

                // separate out the mime component
                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                // write the bytes of the string to a typed array
                var ia = new Uint8Array(byteString.length);
                for (var i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
                }

                return new Blob([ia], {
                  type: mimeString
                });
              }


              var blob = dataURItoBlob($scope.canvas.toDataURL('png'));
              $uibModalInstance.dismiss(blob)

            }

          },
        }).result.then(function() {}, function(data) {

          $scope.chatBox.fileToSend = data;
          $scope.send('instructionImage');
        });
      }


      if(!typeof($scope.data.email)=='undefined'){
        if ($scope.data.email.length > 0 && $scope.data.email!=undefined) {
          $http({
            method: 'GET',
            url: '/api/support/visitor/?email=' + $scope.data.email,
          }).
          then(function(response) {
            console.log(response);
            if (response.data.length > 1) {
              $scope.chatHistBtn = true
            }
          })
        }

      }
      $scope.sound = ngAudio.load("static/audio/notification.mp3");

      $http({
        method: 'GET',
        url: '/api/support/visitor/?uid=' + $scope.data.uid,
      }).
      then(function(response) {
        console.log(response.data, typeof response.data, response.data.length);
        if (response.data.length > 0) {
          $scope.visitorForm = response.data[0]
        }
      });

      $http({
        method: 'GET',
        url: '/api/support/supportChat/?&uid=' + $scope.data.uid,
      }).then(function(response) {
        $scope.data.messages = [];
        console.log(response.data);
        for (var i = 0; i < response.data.length; i++) {
          $scope.data.messages.push(response.data[i]);
        }
        $scope.data.unreadMsg = 0
        $scope.data.boxOpen = true
        $scope.scroll()
      });


      console.log('userrrrrrr', $scope.me.pk);

      $scope.chatBox = {
        messageToSend: '',
        fileToSend: emptyFile
      }

      $scope.removeFile = function() {
        $scope.chatBox.fileToSend = emptyFile;
      }

      $scope.send = function(mediaType) {

        if ($scope.chatBox.fileToSend.size > 0) {

          $scope.attachment;
          var typ = $scope.chatBox.fileToSend.type.split('/')[0]

          var fd = new FormData();
          fd.append('attachment', $scope.chatBox.fileToSend);
          fd.append('user', $scope.me.pk);
          fd.append('uid', $scope.data.uid)
          fd.append('sentByAgent', true)

          if (mediaType=='instructionImage') {
            fd.append('attachmentType',mediaType)
          }else {
            fd.append('attachmentType', $scope.chatBox.fileToSend.type.split('/')[0])
          }

          $http({
            method: 'POST',
            data: fd,
            url: '/api/support/supportChat/',
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            // console.log($scope.response.data , 'data');
            $scope.data.messages.push(response.data)
            // $scope.attachment = response.data.attachment
            // console.log($scope.attachment);

            $scope.fileData = {
              filePk: response.data.pk
            }



            $scope.status = 'MF';
            connection.session.publish(wamp_prefix+'service.support.chat.' + $scope.data.uid, [$scope.status, $scope.fileData, $scope.me, new Date()], {}, {
              acknowledge: true
            }).
            then(function(publication) {
              console.log("Published");
            });

            $scope.chatBox.fileToSend = emptyFile;

            if (mediaType=='instructionImage') {
              $scope.scroll(1500)
            }else {
              $scope.scroll()
            }

          })



        }

        if ($scope.chatBox.messageToSend.length > 0) {


          console.log('here ', $scope.chatBox.messageToSend);


          var youtubeLink = $scope.chatBox.messageToSend.includes("www.youtube.com/");

          if (youtubeLink) {
            $scope.status = 'ML';
            link = "https://www.youtube.com/embed/" + $scope.chatBox.messageToSend.split("v=")[1];
            // var message = {msg:"" , link:link ,  sentByMe:true , created: new Date() }
            var dataToSend = {
              uid: $scope.data.uid,
              message: link,
              user: $scope.me.pk,
              attachmentType: 'youtubeLink',
              sentByAgent: true
            }
          } else {
            $scope.status = 'M';
            // var message = {msg:$scope.chatBox.messageToSend , sentByMe: true, created: new Date() }
            var dataToSend = {
              uid: $scope.data.uid,
              message: $scope.chatBox.messageToSend,
              user: $scope.me.pk,
              sentByAgent: true
            }
            console.log('MMMMMMMMMMMMMMMMMMMMMMMMMM ', dataToSend);

          }

          $http({
            method: 'POST',
            data: dataToSend,
            url: '/api/support/supportChat/'
          }).
          then(function(response) {
            console.log(response.data, 'dataaa');
            $scope.chatBox.messageToSend = ''
            $scope.data.messages.push(response.data)
            console.log($scope.me);

            console.log('publishing here... message', $scope.status, response.data, $scope.me.username);

            if(connection.session){
              connection.session.publish(wamp_prefix+'service.support.chat.' + $scope.data.uid, [$scope.status, response.data, $scope.me, new Date()], {}, {
                acknowledge: true
              }).
              then(function(publication) {
                console.log("Published", $scope.data.uid);
                // alert('deleiverd')
              },function(){
                alert('not deleivered')
              });
            }else{
              alert('you are not connected to internet')
            }
            $scope.scroll()
          });
        }
      };

      $scope.imageClicked=function(val){
        // alert(val)
        $uibModal.open({
          templateUrl: '/static/ngTemplates/app.support.chatBox.imageModal.html',
          size: 'lg',
          backdrop: true,
          resolve: {
            imageSrc: function() {
              return val;
            }
          },
          controller: function($scope, $users,imageSrc, $uibModalInstance) {
            $scope.myImageSrc=imageSrc
          },
          }).result.then(function() {

          }, function(data) {

          if (data != 'backdrop click' && data != '' && data != 'escape key press') {
            console.log(data);
            $scope.chatBox.messageToSend = $scope.chatBox.messageToSend + data
          }
        });
      }

      $scope.$watch('chatBox.messageToSend', function(newValue, oldValue) {
        $scope.status = "T";
        if (newValue != "") {
          if(connection.session){
            connection.session.publish(wamp_prefix+'service.support.chat.' + $scope.data.uid, [$scope.status], {}, {
              acknowledge: true
            }).
            then(function(publication) {
              console.log("Published");
            });
          }else{
            alert('you are not connected to internet')
          }
        }
      });


      $scope.chatClose = function(indx, uid, chatThreadPk) {
        $scope.status = "F";
        connection.session.publish(wamp_prefix+'service.support.chat.' + $scope.data.uid, [$scope.status, uid], {}, {
          acknowledge: true
        }).
        then(function(publication) {
          console.log("Published");
        });

        if ($scope.data.email) {

          $http({
            method: 'POST',
            url: '/api/support/emailChat/',
            data: {
              email: $scope.data.email,
              uid: $scope.data.uid
            }
          }).then(function(response) {
            console.log('send email');
          });

        }

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
        $scope.closeChatBox(indx, $scope.data.myUserIndex)
      }



      $scope.closeChatBox = function(indx, myUserIndex) {

        $scope.closeChat(indx, myUserIndex)
        $scope.data.boxOpen = false
      }

      $scope.attachFile = function() {
        $('#filePickerChat' + $scope.index).click();
      }

      $scope.scroll = function(delay) {

        if (delay==undefined || delay == null) {
          var delay = 300
        }

        console.log('calling');
        setTimeout(function() {
          var id = document.getElementById("scrollArea" + $scope.data.uid);
          id.scrollTop = id.scrollHeight;
        }, delay);
      }

      $scope.knowledgeBase = function(companyPk) {
        $uibModal.open({
          templateUrl: '/static/ngTemplates/app.support.knowledgeBase.modal.html',
          size: 'xl',
          backdrop: true,
          controller: function($scope, $users, $uibModalInstance) {



            $scope.text = ''
            $scope.selectedContent = ''

            if (!window.x) {
              x = {};
            }

            x.Selector = {};
            x.Selector.getSelected = function() {
              var t = '';
              if (window.getSelection) {
                t = window.getSelection();
                $scope.text = window.getSelection().toString();
              } else if (document.getSelection) {
                t = document.getSelection();
                text = document.getSelection().toString();
              } else if (document.selection) {
                t = document.selection.createRange().text;
                $scope.text = document.selection.createRange().htmlText
              }
              return t;
            }

            var pageX;
            var pageY;

            $(document).ready(function() {
              $(document).bind("mouseup", function(e) {

                pageX = e.pageX;
                pageY = e.pageY;

                var selectedText = x.Selector.getSelected();
                if (selectedText != '') {
                  $('ul.custom-menu').css({
                    'left': pageX - 170,
                    'top': pageY - 70
                  }).fadeIn(200);
                } else {
                  $('ul.custom-menu').fadeOut(200);
                }
              });
              // $(document).on("mousedown", function(e) {
              //   pageX = e.pageX;
              //   pageY = e.pageY;
              // });
            });


            $scope.$watch('text', function(newValue, oldValue) {
              if (oldValue != '') {
                $scope.selectedContent = oldValue
              }
            });




            $scope.sendSelectedContent = function() {
              setTimeout(function() {
                console.log($scope.selectedContent);
                $uibModalInstance.dismiss($scope.selectedContent)
              }, 500);

            }









            $scope.form = {
              title: ''
            }
            console.log(companyPk);
            $http({
              method: 'GET',
              url: '/api/support/documentation/?customer=' + companyPk,
            }).
            then(function(response) {
              console.log(response.data);
              $scope.docData = response.data

            });
            $scope.filterData = function(title) {
              $http({
                method: 'GET',
                url: '/api/support/documentation/?customer=' + companyPk + '&title__icontains=' + title,
              }).
              then(function(response) {
                console.log(response.data);
                $scope.docData = response.data
              });
            }

            $scope.closeModal = function() {
              $uibModalInstance.close()
            }
            $scope.sowDetails = 0
            $scope.textShow = function(pk) {
              console.log(pk);
              $scope.sowDetails = pk
            }

            $scope.sendDocument = function(doc) {
              console.log(doc);
              $uibModalInstance.dismiss(doc)
            }




          },
        }).result.then(function() {

        }, function(data) {

          if (data != 'backdrop click' && data != '' && data != 'escape key press') {
            console.log(data);
            $scope.chatBox.messageToSend = $scope.chatBox.messageToSend + data
            // $scope.send()
          }

        });
      }

      $scope.getChatHistory = function(email) {
        console.log('email ', email);
        $http({
          method: 'GET',
          url: '/api/support/getChatHistory/?email=' + email,
        }).
        then(function(response) {
          console.log(response.data.data);
          $scope.chatHistory = response.data.data
          console.log(response.data.data, 'ressssssssssssin chat hist');
          $scope.chatHistModal(email)
        })
      }


      $scope.chatHistModal = function(email) {
        console.log('chatHistModal', email);
        $uibModal.open({
          templateUrl: '/static/ngTemplates/app.support.chatHistory.modal.html',
          size: 'xl',
          backdrop: true,
          resolve: {
            chatData: function() {
              return $scope.chatHistory;
            }
          },
          controller: function($scope, chatData, $users, $uibModalInstance, Flash) {
            $scope.chatData = chatData;
            $scope.email = email
            $scope.searchForm = {
              value: ''
            }


            $scope.searchText = function() {

              var all_text = document.getElementById('all_text')
              for (var i = 0; i < all_text.childNodes.length; i++) {
                for (var j = 0; j < all_text.childNodes[i].length; j++) {
                  console.log(all_text.childNodes[i].childNodes[j]);
                }
              }
              console.log(all_text);
              // var page = $('#all_text');
              // var pageText = page.text().replace("<span>","").replace("</span>");
              // var searchedText = $scope.searchForm.value
              // var theRegEx = new RegExp("("+searchedText+")", "igm");
              // var newHtml = pageText.replace(theRegEx ,"<span style='background-color:yellow'>$1</span>");
              // page.html(newHtml);

              for (var i = 0; i < $scope.chatData.length; i++) {
                for (var j = 0; j < $scope.chatData[i].chatList.length; j++) {
                  if ($scope.chatData[i].chatList[j].message) {
                    var page = $('#p' + j);
                    // console.log(page.text(),'page');
                    // var page = $('#all_text');
                    var pageText = page.text().replace("<span>", "").replace("</span>");
                    // console.log(pageText);
                    var searchedText = $scope.searchForm.value
                    var theRegEx = new RegExp("(" + searchedText + ")", "igm");
                    var newHtml = pageText.replace(theRegEx, "<span style='background-color:yellow'>$1</span>");
                    page.html(newHtml);
                  }
                }
              }
              // for (var i = 0; i < $scope.texts.length; i++) {
              //     var page = $('#all_text'+i);
              //     // var page = $('#all_text');
              //     var pageText = page.text().replace("<span>","").replace("</span>");
              //     console.log(pageText);
              //     var searchedText = $scope.searchForm.value
              //     var theRegEx = new RegExp("("+searchedText+")", "igm");
              //     var newHtml = pageText.replace(theRegEx ,"<span style='background-color:yellow'>$1</span>");
              //     page.html(newHtml);
              // }

            }

          },
        }).result.then(function() {

        }, function(data) {

        });
      }




      $scope.chatTransfer = function(uid, chatThreadPk) {
        console.log($scope.data, 'entireeeeeeeeeeeeee');
        $scope.onlineAgents = []
        $scope.offlineAgents = []
        $http({
          method: 'GET',
          url: '/api/support/getMyUser/?allAgents',
        }).
        then(function(response) {
          console.log(response.data.allAgents, '@@@@@@@@@@@@@@@@@@@@@');
          $scope.allAgents = response.data.allAgents
          for (var i = 0; i < $scope.allAgents.length; i++) {
            connection.session.call(wamp_prefix+'service.support.hhhhh.' + $scope.allAgents[i], []).
            then((function(i) {
              return function(res) {
                console.log('online', i);
                $scope.onlineAgents.push($scope.allAgents[i])
              }
            })(i), (function(i) {
              return function(err) {
                console.log(err, 'offline agents');
                $scope.offlineAgents.push($scope.allAgents[i])
              }
            })(i))
          }
        });
        // $scope.opnpoup = function(){
        $uibModal.open({
          templateUrl: '/static/ngTemplates/app.support.chatTransfer.modal.html',
          size: 'xl',
          backdrop: true,
          resolve: {
            onlineAgents: function() {
              return $scope.onlineAgents;
            },
            offlineAgents: function() {
              return $scope.offlineAgents;
            },
            userData: function() {
              return $scope.data;
            }
          },
          controller: function($scope, onlineAgents, offlineAgents, userData, $users, $uibModalInstance, Flash) {
            console.log(onlineAgents, offlineAgents);
            $scope.me = $users.get("mySelf")
            $scope.onlineAgents = onlineAgents
            $scope.offlineAgents = offlineAgents
            $scope.agentPk = 0;
            $scope.agentForm = {
              name: '',
              pk: 0
            }
            $scope.selectedAgent = function(pk) {
              $scope.agentPk = pk
              $scope.agentForm.name = $users.get(pk).username
              $scope.agentForm.pk = pk

            }

            $scope.transferChat = function() {
              // console.log('in traaaaa');

              connection.session.call(wamp_prefix+'service.support.heartbeat.' + $scope.agentForm.pk, ['popup', $scope.me.username, userData]).then(
                function(res) {
                  // console.log(userData.chatThreadPk, $scope.agentForm.pk);
                  $http({
                    method: 'PATCH',
                    url: '/api/support/chatThread/' + userData.chatThreadPk + '/',
                    data: {
                      user: $scope.agentForm.pk
                    }
                  }).
                  then(function(response) {});
                  Flash.create('success', "Chat Has Been Transfered Sucessfully")
                  $uibModalInstance.dismiss('close')

                },
                function(err) {
                  console.log("Error:", err);
                  Flash.create('danger', "Chat Couldn't Transfer - Some Server Issues")
                }
              );
            }





          },
        }).result.then(function() {

        }, function(data) {
          if (data == 'close') {
            console.log(data);
            console.log($scope.index);
            $scope.closeChatBox($scope.index, $scope.data.myUserIndex)
            // console.log($scope.data);
            // console.log($scope.data.myUserIndex , 'ffffffffffffff');
          }
        });
        // }


        // setTimeout(function () {
        //   $scope.opnpoup()
        // }, 1000);

      }


      $scope.searchCannedRes = function(val) {
        var hash = "#"
        if (val.includes('#')) {
          // beforeHash = val.slice(0,val.indexOf(hash))
          var textAfterHash = val.slice(val.indexOf(hash) + hash.length);
          if (textAfterHash.length > 0) {
            return $http({
              method: 'GET',
              url: '/api/support/cannedResponses/?text__icontains=' + textAfterHash + '&service=' + $scope.data.servicePk
            }).
            then(function(response) {
              console.log(response.data);
              // $scope.chatBox.messageToSend+=response.data.text
              return response.data;
            })
          }
        }
      }



      $scope.editUserDetails = function(uid) {
        console.log($scope.visitorForm);
        $uibModal.open({
          templateUrl: '/static/ngTemplates/app.support.editUserDetails.modal.html',
          size: 'md',
          backdrop: true,
          resolve: {
            visitorData: function() {
              return $scope.visitorForm;
            }
          },
          controller: function($scope, visitorData, $users, $uibModalInstance, Flash) {
            $scope.uid = uid
            console.log(uid);
            console.log(visitorData);

            if (typeof visitorData == 'string') {
              $scope.form = {
                email: '',
                name: '',
                phoneNumber: '',
                notes: ''
              }
            } else {
              $scope.form = visitorData
            }




            // $scope.$watch('form.email', function(newValue, oldValue) {
            //   console.log('inside weathcccc');
            //   // console.log($scope.form);
            //   // console.log(newValue);
            //   if (newValue.length>0) {
            //     $http({
            //       method: 'GET',
            //       url: '/api/support/visitor/?email='+newValue,
            //     }).
            //     then(function(response) {
            //
            //       console.log(response.data);
            //     });
            //   }
            //
            // });
            checkEmail = function() {
              console.log($scope.form.email);
              $http({
                method: 'GET',
                url: '/api/support/visitor/?email=' + $scope.form.email,
              }).
              then(function(response) {
                console.log(response.data, typeof response.data, response.data.length);
                if (response.data.length > 0 && response.data[0].email == $scope.form.email) {
                  $scope.form.name = response.data[0].name
                  $scope.form.email = response.data[0].email
                  $scope.form.phoneNumber = response.data[0].phoneNumber
                  $scope.form.notes = response.data[0].notes
                }
              });
            }

            $scope.submit = function() {


              if ($scope.form.email == '') {
                Flash.create('danger', 'Email is required')
                return
              }


              $scope.toSend = $scope.form
              $scope.toSend.uid = $scope.uid;

              var method = 'POST'
              var url = '/api/support/visitor/'
              if ($scope.form.pk != undefined) {
                method = 'PATCH'
                url += $scope.form.pk + '/'
              }

              $http({
                method: method,
                url: url,
                data: $scope.toSend
              }).
              then(function(response) {
                // dataName = response.data.name
                // $scope.form = response.data;
                Flash.create('success', 'User details saved')
                $uibModalInstance.dismiss(response.data)


                connection.session.publish(wamp_prefix+'service.support.createDetailCookie.' + response.data.uid, [response.data]).then(
                  function(res) {},
                  function(err) {

                  }
                );

              });
            }

          },
        }).result.then(function() {

        }, function(data) {
          if (data != 'backdrop click' && data != 'escape key press') {
            $scope.data.name = data.name
            $scope.data.email = data.email
            $scope.visitorForm = data
            console.log('something#################');


            $http({
              method: 'GET',
              url: '/api/support/visitor/?email=' + data.email,
            }).
            then(function(response) {
              if (response.data.length > 1) {
                $scope.chatHistBtn = true
              }
            })

          }
        });
      }


      // $scope.arremoji = ['👋', '💁', '🙃', '🙏', '😬', '👇', '👈', '👉', '👋', '👏', '👐', '👆', '☝', '👊', '✋', '✌', '✊', '👌', '👍', '👎'];
      //
      // $scope.emojiOpen = false
      //
      // $scope.insertEmoji = function(indx) {
      //   $scope.chatBox.messageToSend += $scope.arremoji[indx]
      // }
      //
      //
      // $scope.openEmoji = function() {
      //   $scope.emojiOpen = !$scope.emojiOpen
      //
      // }

    }
  };
});


app.directive('messageStrip', function() {
  return {
    templateUrl: '/static/ngTemplates/messageStrip.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      openChat: '=',
    },
    controller: function($scope, $users) {
      $scope.me = $users.get('mySelf');
      if ($scope.me.pk == $scope.data.originator) {
        $scope.friend = $scope.data.user;
      } else {
        $scope.friend = $scope.data.originator;
      }
      $scope.clicked = function() {
        $scope.data.count = 0;
        $scope.openChat($scope.friend)
      }
    }
  };
});

app.directive('notificationStrip', function() {
  return {
    templateUrl: '/static/ngTemplates/notificationStrip.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
    },
    controller: function($scope, $http, $users, $aside) {
      var parts = $scope.data.shortInfo.split(':');
      // console.log(parts);
      if (typeof parts[1] == 'undefined') {
        $scope.notificationType = 'default';
      } else {
        $scope.notificationType = parts[0];
      }
      // console.log($scope.data);
      // console.log($scope.notificationType);
      var nodeUrl = '/api/social/' + $scope.notificationType + '/'
      if (typeof parts[1] != 'undefined' && $scope.data.originator == 'social') {
        // console.log(nodeUrl + parts[1]);
        $http({
          method: 'GET',
          url: nodeUrl + parts[1] + '/'
        }).
        then(function(response) {
          $scope.friend = response.data.user;
          if ($scope.notificationType == 'postComment') {
            var url = '/api/social/post/' + response.data.parent + '/';
          } else if ($scope.notificationType == 'pictureComment') {
            var url = '/api/social/picture/' + response.data.parent + '/';
          }
          $http({
            method: 'GET',
            url: url
          }).then(function(response) {
            $scope.notificationData = response.data;
            if ($scope.notificationType == 'pictureComment') {
              $http({
                method: 'GET',
                url: '/api/social/album/' + $scope.data.shortInfo.split(':')[3] + '/?user=' + $users.get($scope.notificationData.user).username
              }).
              then(function(response) {
                $scope.objParent = response.data;
              });
            };
          });
        });
      } else if (typeof parts[1] != 'undefined' && $scope.data.originator == 'git') {
        if (parts[0] == 'codeComment') {
          var url = '/api/git/commitNotification/?sha=' + parts[2];
          $http({
            method: 'GET',
            url: url
          }).
          then(function(response) {
            $scope.commit = response.data[0];
          });
          var url = '/api/git/codeComment/' + parts[1] + '/';
          $http({
            method: 'GET',
            url: url
          }).
          then(function(response) {
            $scope.codeComment = response.data;
          });
        }
      };

      $scope.openAlbum = function(position, backdrop, input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.album.html',
          placement: position,
          size: 'lg',
          backdrop: backdrop,
          controller: 'controller.social.aside.picture',
          resolve: {
            input: function() {
              return input;
            }
          }
        }).result.then(postClose, postClose);
      }

      $scope.openPost = function(position, backdrop, input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.post.html',
          placement: position,
          size: 'md',
          backdrop: backdrop,
          controller: 'controller.social.aside.post',
          resolve: {
            input: function() {
              return input;
            }
          }
        }).result.then(postClose, postClose);
      }

      $scope.openCommit = function() {
        $aside.open({
          templateUrl: '/static/ngTemplates/app.GIT.aside.exploreNotification.html',
          position: 'left',
          size: 'xxl',
          backdrop: true,
          resolve: {
            input: function() {
              return $scope.commit;
            }
          },
          controller: 'projectManagement.GIT.exploreNotification',
        })
      }

      $scope.openNotification = function() {
        $http({
          method: 'PATCH',
          url: '/api/PIM/notification/' + $scope.data.pk + '/',
          data: {
            read: true
          }
        }).
        then(function(response) {
          $scope.$parent.notificationClicked($scope.data.pk);
          $scope.data.read = true;
        });
        if ($scope.notificationType == 'postLike' || $scope.notificationType == 'postComment') {
          $scope.openPost('right', true, {
            data: $scope.notificationData,
            onDelete: function() {
              return;
            }
          })
        } else if ($scope.notificationType == 'pictureLike' || $scope.notificationType == 'pictureComment') {
          $scope.openAlbum('right', true, {
            data: $scope.notificationData,
            parent: $scope.objParent,
            onDelete: ""
          })
        } else if ($scope.notificationType == 'codeComment') {
          $scope.openCommit()
        }
      }
    },
  };
});


app.directive('chatWindow', function($users) {
  return {
    templateUrl: '/static/ngTemplates/chatWindow.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      friendUrl: '=',
      pos: '=',
      cancel: '&',
    },
    controller: function($scope, $location, $anchorScroll, $http, $templateCache, $timeout, ngAudio) {
      // console.log($scope.pos);
      $scope.me = $users.get("mySelf");
      $scope.friend = $users.get($scope.friendUrl);
      // console.log($scope.friend);
      $scope.sound = ngAudio.load("static/audio/notification.mp3");

      $scope.isTyping = false;
      $scope.toggle = true;
      $scope.messageToSend = "";
      $scope.fileToSend = emptyFile;
      $scope.chatForm = {
        messageToSend: '',
        fileToSend: emptyFile
      }
      $scope.status = "N"; // neutral / No action being performed
      $scope.send = function() {
        var msg = angular.copy($scope.chatForm.messageToSend)
        if (msg != "") {
          $scope.status = "M"; // contains message
          var dataToSend = {
            message: msg,
            user: $scope.friend.pk,
            read: false
          };


          $http({
            method: 'POST',
            data: dataToSend,
            url: '/api/PIM/chatMessage/'
          }).
          then(function(response) {
            $scope.ims.push(response.data)
            $scope.senderIsMe.push(true);
            console.log('sending.......', response.data.message, $scope.friend.username);
            connection.session.publish(wamp_prefix+'service.chat.' + $scope.friend.username, [$scope.status, response.data.message, $scope.me, response.data.pk], {}, {
              acknowledge: true
            }).
            then(function(publication) {
              console.log('published');
            });

            // connection.session.publish('service.chat.General', [$scope.status, response.data.message, $scope.me.username, 'General'], {}, {
            //   acknowledge: true
            // }).
            // then(function(publication) {
            //   console.log('published');
            // });

            $scope.chatForm.messageToSend = "";
          })
        }
      }; // send function for text

      $scope.sendFile = function() {
        console.log('send message ');
        var fd = new FormData();
        var file = $scope.chatForm.fileToSend
        console.log($scope.chatForm.fileToSend);
        console.log(file);
        if (file != emptyFile) {
          $scope.status = "MF"; // contains message
          // var dataToSend = {attachment:file , user: $scope.friend.pk , read:false};
          fd.append('attachment', file);
          fd.append('user', $scope.friend.pk);
          fd.append('read', false);
          $http({
            method: 'POST',
            data: fd,
            url: '/api/PIM/chatMessage/',
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            console.log('resssssss', response.data);
            // $scope.ims.push(response.data)
            var fileTypeArr = response.data.attachment.split('.')
            var fileType = fileTypeArr[fileTypeArr.length - 1]
            if (fileType == 'jpg' || fileType == 'jpeg' || fileType == 'png' || fileType == 'svg' || fileType == 'gif') {
              response.data.fileType = 'image'
            } else {
              response.data.fileType = 'document'
            }
            $scope.ims.push(response.data)
            $scope.senderIsMe.push(true);
            console.log(response.data.attachment);
            connection.session.publish(wamp_prefix+'service.chat.' + $scope.friend.username, [$scope.status, response.data.attachment, $scope.me, response.data.pk], {}, {
              acknowledge: true
            }).
            then(function(publication) {});
            $scope.chatForm.fileToSend = emptyFile;
          })
        }
      }; // send function for file

      $scope.attachFile = function() {
        console.log($scope.friend.pk);
        $('#filePickerChat' + $scope.friend.pk).click();
      }

      $scope.$watch('chatForm.fileToSend', function(newValue, oldValue) {
        if (newValue == emptyFile) {
          return;
        }
        console.log('herreee', $scope.chatForm.fileToSend);
      });

      $scope.removeFile = function() {
        $scope.chatForm.fileToSend = emptyFile;
      }

      $scope.expandImage = function(imgUrl) {
        console.log('expaaannddddd');
        console.log(imgUrl);
      }

      $scope.addMessage = function(msg, url) {
        console.log('in add messagge');
        $scope.sound.play();
        $http({
          method: 'PATCH',
          url: '/api/PIM/chatMessage/' + url + '/?mode=',
          data: {
            read: true
          }
        }).
        then(function(response) {
          console.log('resssssssss');
          if (response.data.attachment) {
            var fileTypeArr = response.data.attachment.split('.')
            var fileType = fileTypeArr[fileTypeArr.length - 1]
            if (fileType == 'jpg' || fileType == 'jpeg' || fileType == 'png' || fileType == 'svg' || fileType == 'gif') {
              response.data.fileType = 'image'
            } else {
              response.data.fileType = 'document'
            }
          }
          $scope.ims.push(response.data);
          $scope.senderIsMe.push(false);
        });
      };

      $scope.fetchMessages = function() {
        $scope.method = 'GET';
        $scope.url = '/api/PIM/chatMessageBetween/?other=' + $scope.friend.username;
        $scope.ims = [];
        $scope.imsCount = 0;
        $scope.senderIsMe = [];
        $http({
          method: $scope.method,
          url: $scope.url
        }).
        then(function(response) {
          $scope.imsCount = response.data.length;
          for (var i = 0; i < response.data.length; i++) {
            var im = response.data[i];
            var sender = $users.get(im.originator)
            if (sender.username == $scope.me.username) {
              $scope.senderIsMe.push(true);
            } else {
              $scope.senderIsMe.push(false);
            }
            if (im.attachment) {
              var fileTypeArr = im.attachment.split('.')
              var fileType = fileTypeArr[fileTypeArr.length - 1]
              if (fileType == 'jpg' || fileType == 'jpeg' || fileType == 'png' || fileType == 'svg' || fileType == 'gif') {
                im.fileType = 'image'
              } else {
                im.fileType = 'document'
              }
            }
            $scope.ims.push(im);
            // console.log($scope.ims.length);
          }
        });
      };
      $scope.fetchMessages();
      $scope.scroll = function() {
        var $id = $("#scrollArea" + $scope.pos);
        $id.scrollTop($id[0].scrollHeight);
      }
    },
    // attrs is the attrs passed from the main scope
    link: function postLink(scope, element, attrs) {
      scope.$watch('chatForm.messageToSend', function(newValue, oldValue) {
        // console.log("changing");
        scope.status = "T"; // the sender is typing a message
        if (newValue != "") {
          connection.session.publish(wamp_prefix+'service.chat.' + scope.friend.username, [scope.status, scope.chatForm.messageToSend, scope.me.username]);
        }
        scope.status = "N";
      }); // watch for the messageTosend
      scope.$watch('ims.length', function() {
        setTimeout(function() {
          scope.scroll();
        }, 500);
      });
      scope.$watch('pos', function(newValue, oldValue) {
        // console.log(newValue);
        scope.location = 30 + newValue * 320;
        // console.log("setting the new position value");
        // console.log();
      });
    } // link
  };
});
