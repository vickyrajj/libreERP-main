app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.qualityCheck', {
    url: "/qualityCheck",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.qualityCheck.html',
        controller: 'businessManagement.reviews',
      }
    }
  })
});
app.controller("businessManagement.reviews.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope , ngAudio , $interval , $permissions) {


  $scope.commentPerm =  $permissions.myPerms('module.reviews.comment')

  // console.log($scope.commentPerm);
  $scope.me = $users.get('mySelf');

  console.log($scope.commentPerm);

  $scope.msgData = $scope.tab.data
  console.log($scope.tab.data);
  $scope.reviewCommentData = [];



  $http({
    method: 'GET',
    // url: '/api/support/reviewComment/?user='+$scope.msgData[0].user_id+'&uid='+$scope.msgData[0].uid+'&chatedDate='+$scope.msgData[0].created.split('T')[0],
    url: '/api/support/reviewComment/?uid='+$scope.msgData[0].uid+'&chatedDate='+$scope.msgData[0].created.split('T')[0],

  }).
  then(function(response) {
    console.log(response.data,'dddddddddddd',typeof response.data);
    $scope.reviewCommentData =response.data
  });
  $http({
    method: 'GET',
    url: '/api/support/chatThread/?uid='+$scope.msgData[0].uid
  }).
  then(function(response) {
    console.log(response.data,'dddddddddddd',typeof response.data);
    $scope.chatThreadData =response.data[0]
  });
  $scope.reviewForm = {message:''}

  $scope.audio_chat={
    agent:null,
    visitor:null
  };
  $scope.video_chat={
    agent:null,
    visitor:null
  };
  console.log($scope.msgData[0].typ);
  $scope.typ=$scope.msgData[0].typ
  if($scope.msgData[0].typ=='audio'){
    $scope.audio_chat={
      agent:'/static/videos/agent'+$scope.msgData[0].uid+'.mp3',
      visitor:'/static/videos/local'+$scope.msgData[0].uid+'.mp3'
    }
  }

  else if($scope.msgData[0].typ=='video'){
    $scope.video_chat={
      agent:'/static/videos/agent'+$scope.msgData[0].uid+'.webm',
      visitor:'/static/videos/local'+$scope.msgData[0].uid+'.webm'
    }
  }
console.log($scope.video_chat.agent);
var stream_agent,stream_visitor,canvas_agent,canvas_visitor,ctx_agent,ctx_visitor;


setTimeout(function () {

  if($scope.video_chat||$scope.audio_chat){

    if ($scope.video_chat.agent) {

        stream_agent  = document.getElementById("vid_agent");
        stream_visitor  = document.getElementById("vid_visitor");
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
          console.log(stream_agent);

    }
  }

}, 900);



  setTimeout(function () {

  if(stream_agent.readyState>0&&stream_agent.readyState>0){

    console.log(stream_agent);


        console.log(stream_agent.duration);
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

          var clear_int;

          function kuchb(){

            clear_int=setInterval(function () {
              $scope.slider.options.ceil=stream_agent.duration;
              console.log($scope.slider.value);
              console.log(stream_agent.duration);

              if($scope.slider.value+1>=stream_agent.duration){
                clearInterval(clear_int);
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
            console.log(newValue+'  '+oldValue);
            if(newValue-oldValue>1||oldValue-newValue>1){
              stream_agent.currentTime=newValue
              stream_visitor.currentTime=newValue
            }

          });


          $scope.play_video=function(){
            $scope.play_pause=true;
            stream_agent.play();
            stream_visitor.play();
            kuchb();
          }

          $scope.pause_video=function(){
            $scope.play_pause=false;
            stream_agent.pause();
            stream_visitor.pause();
            clearInterval(clear_int)
          }

  }
}, 1500);

  // $scope.screenshots =[];
$scope.snap=function() {
    ctx_agent.fillRect(0, 0, w, h);
    ctx_agent.drawImage(vid_agent, 0, 0, w, h);
    ctx_visitor.fillRect(0, 0, w, h);
    ctx_visitor.drawImage(vid_visitor, 0, 0, w, h);



    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.qualityCheck.capture.modal.html',
      size: 'md',
      backdrop: true,
      resolve: {
        data: function(){
          return $scope.msgData[0].uid
        }
      },
      controller: function($scope, $users, $uibModalInstance,data, Flash) {
        console.log("model opened");
        $scope.uidd=data;
        $scope.imgsrc_agent =canvas_agent.toDataURL();
        $scope.imgsrc_visitor =canvas_visitor.toDataURL();
        $scope.timeOfCapture=vid_agent.currentTime;

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
            // var toSend={message:$scope.reviewForm.message,uid:$scope.uidd,timestamp:$scope.timeOfCapture,visitor_capture:$scope.imgsrc_visitor,agent_capture:$scope.imgsrc_agent}
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
    console.log($scope.msgData[0].created);
    if ($scope.reviewForm.message.length == 0) {
      Flash.create('warning','Please Write Some Comment')
      return
    }

    var fd1 = new FormData();
    fd1.append('message', $scope.reviewForm.message);
    fd1.append('uid', $scope.msgData[0].uid);
    fd1.append('chatedDate', $scope.msgData[0].created.split('T')[0]);
    console.log(fd1);
    SendingPostRequest(fd1);
  }


  $scope.showChart = function(){
    console.log('modalllllllllllllllll');
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.support.review.fullChat.modal.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        chatThreadData: function() {
          return $scope.chatThreadData;
        }
      },
      controller: function($scope, chatThreadData , $users , $uibModalInstance, Flash) {

        $scope.chatThreadData = chatThreadData
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
            url: '/api/support/supportChat/?uid='+chatThreadData.uid,
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
            url: '/api/support/chatThread/' + $scope.chatThreadData.pk + '/',
            data: {status:status}
          }).
          then(function(response) {
            // dataName = response.data.name
            Flash.create('success', 'Updated')
            $uibModalInstance.dismiss(response.data.status)
          });
        }

      },
    }).result.then(function () {

    }, function (status) {
      console.log(status);
      console.log($scope.chatThreadData);
      if (status != 'backdrop click') {
        $scope.chatThreadData.status = status
      }
    });

  }

  // $interval(function() {
  //
  //   $scope.sound = ngAudio.load("static/audio/notification.mp3");
  //   $scope.sound.play();
  //   console.log('sdfsdf', $scope.sound);
  // }, 3000)


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



})
app.controller("businessManagement.reviews", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope,$window) {

  $scope.data = {
    tableData: []
  };

  $scope.form = {date:new Date(),user:'',email:'',client:''}
  $scope.reviewData = []
  $scope.archivedData=[]

function archived(){
  console.log('called');
}

  $scope.getArchData = function(date,user,email,client,download){
    console.log('@@@@@@@@@@@@@@@@@@',date,user,email,client,download);
    var url = '/api/support/reviewHomeCal/?status=archived'
    if (date!=null&&typeof date == 'object') {
      url += '&date=' + date.toJSON().split('T')[0]
    }
    if (typeof user == 'object') {
      url += '&user=' + user.pk
    }
    if (typeof client == 'object') {
      url += '&client=' + client.pk
    }
    if (email.length > 0 && email.indexOf('@') > 0) {
      url += '&email=' + email
    }
    if (download) {
      $window.open(url+'&download','_blank');
    }else {
      $http({
        method: 'GET',
        url: url,
      }).
      then(function(response) {
        // $scope.custDetails = response.data[0]
        console.log(response.data,'dddddddddddd',typeof response.data);
        $scope.archivedData =response.data
      });
    }
  }

  // $scope.filterParams=[];

  $scope.getData = function(date,user,email,client,download){
    console.log('@@@@@@@@@@@@@@@@@@',date,user,email,client,download);
    var url = '/api/support/reviewHomeCal/?'
    if (date!=null&&typeof date == 'object') {
      url += '&date=' + date.toJSON().split('T')[0]
      // $scope.filterParams.push({key : 'date' , value :date.toJSON().split('T')[0]})
    }
    if (typeof user == 'object') {
      url += '&user=' + user.pk
      // $scope.filterParams.push({key : 'user' , value :user.pk})
    }
    if (typeof client == 'object') {
      url += '&client=' + client.pk
      // $scope.filterParams.push({key : 'client' , value :client.pk})
    }
    if (email.length > 0 && email.indexOf('@') > 0) {
      url += '&email=' + email
      // $scope.filterParams.push({key : 'email' , value :email})
    }
    if (download) {
      $window.open(url+'&download','_blank');
    }else {
      $http({
        method: 'GET',
        url: url,
      }).
      then(function(response) {
        // $scope.custDetails = response.data[0]
        console.log(response.data,'dddddddddddd',typeof response.data);
        $scope.reviewData =response.data
      });
    }
  }
  $scope.getData($scope.form.date,$scope.form.user,$scope.form.email,$scope.form.client)
  $scope.getArchData($scope.form.date,$scope.form.user,$scope.form.email,$scope.form.client)
  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response){
      return response.data;
    })
  };
  $scope.serviceSearch = function(query) {
    return $http.get('/api/ERP/service/?name__contains=' + query+'&limit=15').
    then(function(response){
      return response.data.results;
    })
  };
  $scope.changeDateType = false
  $scope.$watch('form.date', function(newValue, oldValue) {
    console.log(oldValue,newValue);
    if (oldValue == undefined || oldValue == null) {
      $scope.changeDateType = true
    }
  })
  $scope.filterData = function(download){

    console.log($scope.form.date,typeof($scope.form.date),$scope.oldDateValue);
    if (typeof $scope.form.date =='undefined') {
      Flash.create('warning','Please Select Proper Date')
      return
    }
    if (typeof $scope.form.user == 'string' && $scope.form.user.length > 0) {
      Flash.create('warning','Please Select Suggested User')
      return
    }else if (typeof $scope.form.user == 'object') {
      var user = $scope.form.user
    }else {
      var user = ''
    }
    if (typeof $scope.form.client == 'string' && $scope.form.client.length > 0) {
      Flash.create('warning','Please Select Suggested Client')
      return
    }else if (typeof $scope.form.client == 'object') {
      var client = $scope.form.client
    }else {
      var client = ''
    }
    if ($scope.form.email==undefined) {
      Flash.create('warning','Please Select Valid Email')
      return
    }
    console.log($scope.form);
    if ($scope.changeDateType&&$scope.form.date!=null) {
      console.log('update');
      res = new Date($scope.form.date)
      var date = new Date(res.setDate(res.getDate() + 1))
    }else {
      console.log('no changeeeeeee');
      var date = $scope.form.date
    }
    console.log(date);
    $scope.getData(date,user,$scope.form.email,client,download)
    $scope.getArchData(date,user,$scope.form.email,client,download)
  }

  $scope.download = function(){
    $scope.filterData(true)
  }


  // views = [{
  //   name: 'list',
  //   icon: 'fa-th-large',
  //   template: '/static/ngTemplates/genericTable/genericSearchList.html',
  //   itemTemplate: '/static/ngTemplates/app.qualityCheck.items.html',
  // }, ];
  //
  //
  // $scope.config = {
  //   views: views,
  //   url: '/api/support/reviewHomeCal/',
  //   searchField: 'name',
  //   itemsNumPerView: [16, 32, 48],
  //   getParams:$scope.filterParams
  // }


  $scope.tableAction = function(target) {
    // console.log(target, action, mode);
    console.log($scope.reviewData[target]);
    var appType = 'Info';
    $scope.addTab({
      title: 'Agent : ' + $scope.reviewData[target][0].uid,
      cancel: true,
      app: 'AgentInfo',
      data: $scope.reviewData[target],
      active: true
    })
    // for (var i = 0; i < $scope.reviewData.length; i++) {
    //   if ($scope.reviewData[i].pk == parseInt(target)) {
    //     if (action == 'edit') {
    //       var title = 'Edit : ';
    //       var appType = 'companyEdit';
    //     } else if (action == 'info') {
    //       var title = 'Details : ';
    //       var appType = 'companyInfo';
    //     }
    //
    //     $scope.addTab({
    //       title: title + $scope.reviewData[i].pk,
    //       cancel: true,
    //       app: appType,
    //       data: $scope.reviewData[i],
    //       active: true
    //     })
    //   }
    // }
  }
  $scope.tableArchAction = function(target) {
    // console.log(target, action, mode);
    console.log($scope.archivedData[target]);
    var appType = 'Info';
    $scope.addTab({
      title: 'Agent : ' + $scope.archivedData[target][0].uid,
      cancel: true,
      app: 'AgentInfo',
      data: $scope.archivedData[target],
      active: true
    })}

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    // console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      console.log($scope.tabs[i].data[0].id,input.data[0].id, $scope.tabs[i].app ,input.app);
      if ($scope.tabs[i].data[0].id == input.data[0].id && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

});
