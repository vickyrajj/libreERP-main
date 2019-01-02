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
app.controller("businessManagement.reviews.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope , ngAudio , $interval, $timeout , $permissions) {

  $scope.commentPerm = false;
  $timeout(function () {
    $scope.commentPerm =  $permissions.myPerms('module.reviews.comment')
  }, 500);

  $scope.me = $users.get('mySelf');
  $scope.msgData = $scope.tab.data
  $scope.reviewCommentData = [];

  $http({
    method: 'GET',
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

  $scope.typ=$scope.msgData[0].typ
  if($scope.msgData[0].typ=='audio'){
    $scope.audio_chat={
      agent:'/media/agent'+$scope.msgData[0].uid+'.mp3',
      visitor:'/media/local'+$scope.msgData[0].uid+'.mp3'
    }
  }

  else if($scope.msgData[0].typ=='video'){
    $scope.video_chat={
      agent:'/media/agent'+$scope.msgData[0].uid+'.webm',
      visitor:'/media/local'+$scope.msgData[0].uid+'.webm'
    }
    $scope.screen_video='/media/screen'+$scope.msgData[0].uid+'.webm'
  }

  var stream_agent,stream_visitor,canvas_agent,canvas_visitor,ctx_agent,ctx_visitor,unique_agent_video_id,unique_visitor_video_id;

  setTimeout(function () {

    if($scope.video_chat||$scope.audio_chat){

      if ($scope.video_chat.agent) {
          unique_agent_video_id="vid_agent"+$scope.chatThreadData.uid;
          unique_visitor_video_id="vid_visitor"+$scope.chatThreadData.uid;
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
          return $scope.msgData[0].uid
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
      if (status != 'backdrop click' && status != 'escape key press') {
        $scope.chatThreadData.status = status
      }
    });

  }
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
app.controller("businessManagement.reviews", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal,$filter, $rootScope,$window) {

  $scope.data = {
    tableData: []
  };

  $scope.form = {date:new Date(),user:'',email:'',client:''}
  $scope.reviewData = []
  $scope.archivedData=[]
  $scope.browseTab = true;
  $scope.chatTypes=['All','audio','video','Audio & Video']
  $scope.form.selectedChatType="All";
  $scope.sortOptions=['Created','Agent Name','UID','Rating','Company']
  $scope.selectedSortOption={
    value:'Created'
  }
  $scope.tableUpdated=false
  $scope.archTableUpdated=true
  $scope.isTableView=true

  $scope.setMyView=function(){
    $scope.isTableView=!$scope.isTableView
  }
  $scope.filterByUid=function(){
      $scope.reviewData.sort(function(a, b){return a[0].uid - b[0].uid});
  }
  $scope.filterByCompany=function(){
      $scope.reviewData.sort(function(a, b){return a[0].company > b[0].company});
  }
  $scope.filterByRating=function(){
      $scope.reviewData.sort(function(a, b){return a[0].rating > b[0].rating});
  }
  $scope.filterByStatus=function(){
      $scope.reviewData.sort(function(a, b){return a[0].statusChat > b[0].statusChat});
  }
  $scope.filterByUser=function(){
      $scope.reviewData.sort(function(a, b){return $filter("getName")(a[0].user_id) > $filter("getName")(b[0].user_id)});
  }
  $scope.filterByCreated=function(){
      $scope.reviewData.sort(function(a, b){return $filter('date')(a[0].created, 'dd/MM/yyyy') > $filter('date')(b[0].created, 'dd/MM/yyyy')});
  }




  $scope.getArchData = function(date,user,email,client,download,audio,video){
    $scope.archivedData=[];
    $scope.loadingDataForArc=true;
    $scope.archTableUpdated=false
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
    if (audio) {
      url += '&audio'
    }
    if (video) {
      url += '&video'
    }
    if (download) {
      $window.open(url+'&download','_blank');
    }else {
      $http({
        method: 'GET',
        url: url,
      }).
      then(function(response) {
        console.log(response.data,'dddddddddddd',typeof response.data);
        $scope.archivedData =response.data
        $scope.loadingDataForArc=false;
        $scope.archTableUpdated=true;
        if(response.data.length<1){
          $scope.archievedMyDialouge=true;
        }else{
          $scope.archievedMyDialouge=false;
        }
      });
    }
  }

  $scope.$watch('selectedSortOption.value',function(newValue,oldValue){
    $scope.tableUpdated=false
    setTimeout(function () {
      $scope.tableUpdated=true
    }, 150);
    switch (newValue) {
        case 'Created':
          $scope.filterByCreated();
          break;
        case 'Agent Name':
          $scope.filterByUser();
          break;
        case 'UID':
           $scope.filterByUid();
          break;
        case 'Rating':
          $scope.filterByRating();
          break;
        case 'Company':
          $scope.filterByCompany();
          break;
      }
  },true)

  $scope.getData = function(date,user,email,client,download,audio,video){

   $scope.reviewData=[]
   $scope.tableUpdated=false
   $scope.loadingData=true;
    var url = '/api/support/reviewHomeCal/?limit'
    if (date!=null&&typeof date == 'object') {
      url += '&date=' + date.toJSON().split('T')[0]
    }
    if (typeof user == 'object') {
      url += '&user=' + user.pk
    }
    if (typeof client == 'object') {
      url += '&client=' + client.pk
    }
    if (audio) {
      url += '&audio'
    }
    if (video) {
      url += '&video'
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
        console.log(response.data,'dddddddddddd',typeof response.data);
        $scope.reviewData=response.data
        $scope.filterByCreated()
        $scope.loadingData=false;
        $scope.tableUpdated=true
        if(response.data.length<1){
          $scope.myDialouge=true;
        }else{
          $scope.myDialouge=false;
        }
      });
    }
  }

  $scope.getData($scope.form.date,$scope.form.user,$scope.form.email,$scope.form.client,$scope.form.audio,$scope.form.video)
  $scope.getArchData($scope.form.date,$scope.form.user,$scope.form.email,$scope.form.client,$scope.form.audio,$scope.form.video)

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
    if ($scope.form.selectedChatType=='audio') {
      var audio=true
    }else{
      var audio=false
    }
    if ($scope.form.selectedChatType=='video') {
      var video=true
    }else{
      var video=false
    }
    if ($scope.form.selectedChatType=='Audio & Video') {
      var audio=true
      var video=true
    }

    if ($scope.changeDateType&&$scope.form.date!=null) {
      res = new Date($scope.form.date)
      var date = new Date(res.setDate(res.getDate() + 1))
    }else {
      var date = $scope.form.date
    }
    console.log(date);
    $scope.getData(date,user,$scope.form.email,client,download,audio,video)
    $scope.getArchData(date,user,$scope.form.email,client,download,audio,video)
  }

  $scope.download = function(){
    $scope.filterData(true)
  }

  $scope.tableAction = function(target,table) {

    if(table){
      target=$scope.reviewData.indexOf(target)
    }

    var appType = 'Info';
    $scope.addTab({
      title: 'Agent : ' + $scope.reviewData[target][0].uid,
      cancel: true,
      app: 'AgentInfo',
      data: $scope.reviewData[target],
      active: true,
      typ:'browse'
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
  $scope.tableArchAction = function(target,table) {

    if(table){
      target=$scope.archivedData.indexOf(target)
    }
    // console.log(target, action, mode);
    console.log($scope.archivedData[target]);
    var appType = 'Info';
    $scope.addTab({
      title: 'Agent : ' + $scope.archivedData[target][0].uid,
      cancel: true,
      app: 'AgentInfo',
      data: $scope.archivedData[target],
      active: true,
      typ:'archived'
    })}

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    console.log($scope.tabs[index].typ);
    if ($scope.tabs[index].typ=='archived') {
      $scope.browseTab = false;
      $scope.archiveTab = true;
      console.log($scope.archiveTab);
    }else if ($scope.tabs[index].typ=='browse') {
      $scope.archiveTab = false;
      $scope.browseTab = true;
      console.log($scope.archiveTab);
    }
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
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
