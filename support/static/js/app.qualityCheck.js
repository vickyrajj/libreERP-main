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

  $scope.msgData=[]
  $scope.fullChatData=[]
  $scope.msgData = $scope.tab.data.chatThreadData
  $scope.fullChatData=$scope.tab.data.supportChatData
  $scope.me = $users.get('mySelf');
  $scope.reviewCommentData = [];

  $http({
    method: 'GET',
    url: '/api/support/reviewComment/?uid='+$scope.msgData.uid+'&chatedDate='+$scope.msgData.created.split('T')[0],
  }).
  then(function(response) {
    console.log(response.data,'dddddddddddd',typeof response.data);
    $scope.reviewCommentData =response.data
  });

  $http({
    method: 'GET',
    url: '/api/support/chatThread/?uid='+$scope.msgData.uid
  }).
  then(function(response) {
    console.log(response.data,'dddddddddddd',typeof response.data);
    console.log(response.data[0]);
    console.log($scope.msgData);
    $scope.myChatThreadData =response.data[0]
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
            // dataName = response.data.name
            Flash.create('success', 'Updated')
            $uibModalInstance.dismiss(response.data.status)
          });
        }

      },
    }).result.then(function () {

    }, function (status) {
      if (status != 'backdrop click' && status != 'escape key press') {
        $scope.myChatThreadData.status = status
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

  $scope.form = {date:null,user:'',email:'',client:''}
  $scope.reviewData = []
  $scope.archivedData=[]
  $scope.browseTab = true;
  $scope.chatTypes=['All','audio','video','Audio & Video']
  $scope.form.selectedChatType="All";
  $scope.sortOptions=['Created','Agent Name','UID','Rating','Company']
  $scope.selectedSortOption={
    value:'Created'
  }
  $scope.selectedSortOptionArch={
    value:'Created'
  }
  $scope.isTableView=true
  $scope.viewby = 15;
  $scope.viewbyArch = 15;
  $scope.currentPage = {
    page:0
  }
  $scope.currentPageArch = {
    page:0
  }
  $scope.offset=0

  $scope.detailInfoData={
    chatThreadData:null,
    supportChatData:null,
  }
  $scope.detailInfoDataArch={
    chatThreadData:null,
    supportChatData:null,
  }

  $scope.setMyView=function(){
    $scope.isTableView=!$scope.isTableView
  }

  $scope.filterByUid=function(isArchived){
    if(isArchived){
      $scope.archivedData.sort(function(a, b){return a.uid > b.uid});
      $scope.setTableValuesArch ()
    }else{
      $scope.reviewData.sort(function(a, b){return a.uid - b.uid});
      $scope.setTableValues ()
    }
  }

  $scope.filterByCompany=function(isArchived){
    if(isArchived){
      $scope.archivedData.sort(function(a, b){return a.company > b.company});
      $scope.setTableValuesArch ()
    }else{
      $scope.reviewData.sort(function(a, b){return a.company > b.company});
      $scope.setTableValues ()
    }

  }

  $scope.filterByRating=function(isArchived){
    if(isArchived){
      $scope.archivedData.sort(function(a, b){return a.rating < b.rating});
      $scope.setTableValuesArch ()
    }else{
      $scope.reviewData.sort(function(a, b){return a.rating < b.rating});
      $scope.setTableValues ()
    }
  }

  $scope.filterByStatus=function(isArchived){
    if(isArchived){
      $scope.archivedData.sort(function(a, b){return a.statusChat > b.statusChat});
      $scope.setTableValuesArch ()
    }else{
      $scope.reviewData.sort(function(a, b){return a.statusChat > b.statusChat});
      $scope.setTableValues ()
    }
  }

  $scope.filterByUser=function(isArchived){
    if(isArchived){
      $scope.archivedData.sort(function(a, b){return $filter("getName")(a.user_id) > $filter("getName")(b.user_id)});
      $scope.setTableValuesArch ()
    }else{
      $scope.reviewData.sort(function(a, b){return $filter("getName")(a.user_id) > $filter("getName")(b.user_id)});
      $scope.setTableValues ()
    }
  }

  $scope.filterByCreated=function(isArchived){
    console.log($scope.reviewData);
    if(isArchived){
      $scope.archivedData.sort(function(a, b){return $filter('date')(a.created, 'dd/MM/yyyy') > $filter('date')(b.created, 'dd/MM/yyyy')});
      $scope.setTableValuesArch ()
    }else{
      $scope.reviewData.sort(function(a, b){return $filter('date')(a.created, 'dd/MM/yyyy') > $filter('date')(b.created, 'dd/MM/yyyy')});
      console.log($scope.reviewData);
      if($scope.reviewData.length>0){
        $scope.tabelRowAction($scope.reviewData[0])
      }
      $scope.setTableValues ()
    }
  }

  $scope.setTableValues =function(){
    $scope.totalItems = $scope.reviewDataLength;
    $scope.itemsPerPage = $scope.viewby;
    $scope.maxSize = 4;
    $scope.setPage(1)
  }
  $scope.setTableValuesArch =function(){
    $scope.totalItemsArch = $scope.archivedDataLength;
    $scope.itemsPerPageArch = $scope.viewbyArch;
    $scope.maxSizeArch = 4;
    $scope.setPageArch(1)
  }

  $scope.setPage = function (pageNo) {
    console.log('page No' +pageNo);
    $scope.currentPage.page = pageNo;
    $scope.setPagingData($scope.currentPage.page)
  };
  $scope.setPageArch = function (pageNo) {
    if(pageNo==$scope.currentPageArch.page)
      return
    $scope.currentPageArch.page = pageNo;
    $scope.setPagingDataArch($scope.currentPageArch.page)
  };

  $scope.setPagingData= function (page) {
    // console.log(page);
    // var pagedData = $scope.reviewData.slice(
    //   (page - 1) * $scope.itemsPerPage,
    //   page * $scope.itemsPerPage
    // );
    // $scope.tableDataAvail = pagedData;

    $scope.offset=(page-1)*$scope.viewby
    $scope.filterData()
  }
  $scope.setPagingDataArch= function (page) {
    $scope.offset=(page-1)*$scope.viewby
    $scope.filterData()
  }

  $scope.pageChanged = function() {
    $scope.setPage($scope.currentPage.page)
  };
  $scope.pageChangedArch = function() {
    $scope.setPageArch($scope.currentPageArch.page)
  };

   $scope.setItemsPerPageArch = function(num) {
     $scope.itemsPerPageArch = num;
     $scope.currentPageArch.page = 1;
     $scope.setPageArch($scope.currentPageArch.page)
   }
   $scope.setItemsPerPage = function(num) {
     $scope.itemsPerPage = num;
     $scope.currentPage.page = 1;
     $scope.setPage($scope.currentPage.page)
   }

   $scope.tabelRowAction=function(data){
     $scope.lastActiveTR=$scope.reviewData.indexOf(data)
     $scope.isDetailInfoUpdated=false
     $scope.detailInfoData.chatThreadData=data
     $scope.fetchChatsForUID(data)

   }

    $scope.tabelRowActionArch=function(data){
      $scope.lastActiveTRArch=$scope.archivedData.indexOf(data)
      console.log(data , $scope.lastActiveTRArch );
      $scope.isDetailInfoUpdatedArch=false
      $scope.detailInfoDataArch.chatThreadData=data
      $scope.fetchChatsForUIDArch(data);
    }


   $scope.fetchChatsForUID= function(data){
     $http({
       method: 'GET',
       url: '/api/support/reviewHomeChats/?uid='+data.uid,
     }).
     then(function(response) {
       console.log('response data' , response.data);
       $scope.detailInfoData.supportChatData = response.data
       setTimeout(function () {
         $scope.isDetailInfoUpdated=true
       }, 100);
     });
   }
   $scope.fetchChatsForUIDArch= function(data){
     $http({
       method: 'GET',
       url: '/api/support/reviewHomeChats/?uid='+data.uid,
     }).
     then(function(response) {
       console.log('response data' ,response.data );
       $scope.detailInfoDataArch.supportChatData = response.data
       setTimeout(function () {
         $scope.isDetailInfoUpdated=true
       }, 200);
     });
   }



  // $scope.$watch('selectedSortOption.value',function(newValue,oldValue){
  //   if (newValue==undefined) {
  //     return
  //   }
  //   switch (newValue) {
  //       case 'Created':
  //         $scope.filterByCreated(false);
  //         break;
  //       case 'Agent Name':
  //         $scope.filterByUser(false);
  //         break;
  //       case 'UID':
  //          $scope.filterByUid(false);
  //         break;
  //       case 'Rating':
  //         $scope.filterByRating(false);
  //         break;
  //       case 'Company':
  //         $scope.filterByCompany(false);
  //         break;
  //     }
  // },true)
  // $scope.$watch('selectedSortOptionArch.value',function(newValue,oldValue){
  //   if (newValue==undefined) {
  //     return
  //   }
  //   switch (newValue) {
  //       case 'Created':
  //         $scope.filterByCreated(true);
  //         break;
  //       case 'Agent Name':
  //         $scope.filterByUser(true);
  //         break;
  //       case 'UID':
  //          $scope.filterByUid(true);
  //         break;
  //       case 'Rating':
  //         $scope.filterByRating(true);
  //         break;
  //       case 'Company':
  //         $scope.filterByCompany(true);
  //         break;
  //     }
  // },true)
  let myCount=0;
  let myCountArch=0;

  $scope.getArchData = function(date,user,email,client,download,typOfCall){
    $scope.archivedData=[];
    $scope.loadingDataForArc=true;
    var url = '/api/support/reviewHomeCal/?status=archived&limit='+$scope.viewby+'&offset='+$scope.offset
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
    if (typOfCall=='audio') {
      url += '&audio'
    }
    if (typOfCall=='video') {
      url += '&video'
    }
    if (typOfCall=='both') {
      url += '&both'
    }
    if (download) {
      $window.open(url+'&download','_blank');
    }else {
      $http({
        method: 'GET',
        url: url,
      }).
      then(function(response) {
        $scope.archivedData = response.data.data
        console.log($scope.archivedData , " Archieve data");
        $scope.archivedDataLength = response.data.dataLength
        if($scope.archivedData.length>0){
          $scope.tabelRowActionArch($scope.archivedData[0])
          if(myCountArch<1){
            $scope.setTableValuesArch()
          }
          myCountArch++;
          $scope.archievedMyDialouge=false;
        }else{
          $scope.archievedMyDialouge=true;
        }

        $scope.loadingDataForArc=false;
        $scope.isDetailInfoUpdatedArch=true

      });
    }
  }



  $scope.getData = function(date,user,email,client,download,typOfCall){
    $scope.reviewData=[]
    $scope.loadingData=true;
    var url = '/api/support/reviewHomeCal/?limit='+$scope.viewby+'&offset='+$scope.offset
    if (date!=null&&typeof date == 'object') {
      url += '&date=' + date.toJSON().split('T')[0]
    }
    if (typeof user == 'object') {
      url += '&user=' + user.pk
    }
    if (typeof client == 'object') {
      url += '&client=' + client.pk
    }
    if (typOfCall=='audio') {
      url += '&audio'
    }
    if (typOfCall=='video') {
      url += '&video'
    }
    if (typOfCall=='both') {
      url += '&both'
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
        $scope.reviewData = response.data.data
        console.log($scope.reviewData , " Review data");
        $scope.reviewDataLength = response.data.dataLength
        if($scope.reviewData.length>0){
          if(myCount<1){
            $scope.setTableValues()
          }
          myCount++;
          $scope.tabelRowAction($scope.reviewData[0])
          $scope.noDataDialouge=false;
        }else{
          $scope.noDataDialouge=true;
        }

        $scope.loadingData=false;
        $scope.isDetailInfoUpdated=true

      });
    }
  }

  $scope.getData($scope.form.date,$scope.form.user,$scope.form.email,$scope.form.client,$scope.form.typOfCall)
  $scope.getArchData($scope.form.date,$scope.form.user,$scope.form.email,$scope.form.client,$scope.form.typOfCall)

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

    var typOfCall=''
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
      typOfCall='audio'
    }
    else if ($scope.form.selectedChatType=='video') {
      typOfCall='video'
    }
    else if ($scope.form.selectedChatType=='Audio & Video') {
      typOfCall='both'
    }
    if ($scope.changeDateType&&$scope.form.date!=null) {
      res = new Date($scope.form.date)
      var date = new Date(res.setDate(res.getDate() + 1))
    }else {
      var date = $scope.form.date
    }
    // console.log(date);
    $scope.getData(date,user,$scope.form.email,client,download,typOfCall)
    $scope.getArchData(date,user,$scope.form.email,client,download,typOfCall)
  }

    $scope.download = function(){
      $scope.filterData(true)
    }

  $scope.tableAction = function(index) {

    console.log($scope.reviewData[index]);

    $http({
      method: 'GET',
      url: '/api/support/reviewHomeChats/?uid='+$scope.reviewData[index].uid,
    }).
    then(function(response) {
      var appType = 'Info';

        $scope.addTab({
          title: 'Agent : ' + $scope.reviewData[index].uid,
          cancel: true,
          app: 'AgentInfo',
          data: {
            chatThreadData:$scope.reviewData[index],
            supportChatData:response.data
          },
          active: true,
          typ:'browse'
        })
    });

  }
  $scope.tableArchAction = function(index) {


    $http({
      method: 'GET',
      url: '/api/support/reviewHomeChats/?uid='+$scope.archivedData[index].uid,
    }).
    then(function(response) {
      var appType = 'Info';
      $scope.addTab({
        title: 'Agent : ' + $scope.archivedData[index].uid,
        cancel: true,
        app: 'AgentInfo',
        data: {
            chatThreadData:$scope.archivedData[index],
            supportChatData:response.data
          },
        active: true,
        typ:'archived'
      })
    });
  }

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
    console.log(input);
    console.log($scope.tabs);
    for (var i = 0; i < $scope.tabs.length; i++) {
      console.log($scope.tabs[i].data.chatThreadData.id,input.data.chatThreadData.id, $scope.tabs[i].app ,input.app);
      if ($scope.tabs[i].data.chatThreadData.id == input.data.chatThreadData.id && $scope.tabs[i].app == input.app) {
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
