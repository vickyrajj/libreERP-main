app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.reviews', {
    url: "/reviews",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.reviews.html',
        controller: 'businessManagement.customerReviews',
      }
    }
  })
});

app.controller("businessManagement.customerReviews", function($scope, $state, $http, $rootScope,$filter,$uibModal,DTOptionsBuilder, DTColumnDefBuilder) {

  $rootScope.state = 'Reviews';
  $scope.reviewData = []
  $scope.form = {date:new Date(),email:''}
  $scope.loadingData=true;
  $scope.isDetailInfoUpdated=false
  $scope.currentPage = {
    page:1
  }
  $scope.pageOptions=['8','20','30']
  $scope.pageOptionsSelected={
    value:$scope.pageOptions[0]
  }
  $scope.offset=0
  $scope.detailInfoData={
    chatThreadData:null,
    supportChatData:null,
  }

    $scope.setTableValues =function(){
      $scope.totalItems = $scope.reviewDataLength;
      $scope.itemsPerPage = $scope.pageOptionsSelected.value;
      $scope.maxSize = 4;
      $scope.setPage(1)
    }

   $scope.setPage = function (pageNo) {
     $scope.currentPage.page = pageNo;
     $scope.setPagingData($scope.currentPage.page)
   };

   $scope.setPagingData= function (page) {
     $scope.offset=(page-1)*$scope.pageOptionsSelected.value
     $scope.filterData()
   }

   $scope.pageChanged = function() {
     $scope.setPage($scope.currentPage.page)
   };

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

   $scope.fetchChatsForUID= function(data){
     $http({
       method: 'GET',
       url: '/api/support/supportChat/?uid='+data.uid,
     }).
     then(function(response) {
       console.log('response data' , response.data);
       $scope.detailInfoData.supportChatData = response.data
       setTimeout(function () {
         $scope.isDetailInfoUpdated=true
       }, 100);
     });
   }


    let myCount=0;
    var today_date = new Date();
    var today_day = today_date.getDate();
    var today_month = today_date.getMonth() + 1;
    var today_year = today_date.getFullYear();
    if (today_day < 10) {
      today_day = '0' + today_day;
    }
    if (today_month < 10) {
      today_month = '0' + today_month;
    }
    var today_date = today_year + '-' + today_month + '-' + today_day;

    $http({
      method: 'GET',
      url:'/api/support/reviewHomeCal/?customer&&limit='+$scope.pageOptionsSelected.value+'&offset='+$scope.offset+'&date='+today_date
    }).
    then(function(response) {
      $scope.reviewData = response.data.data
      console.log($scope.reviewData , " Review data");
      $scope.reviewDataLength = response.data.dataLength
      $scope.totalItems = response.data.dataLength
      if($scope.reviewData.length>0){
        $scope.tabelRowAction($scope.reviewData[0])
        $scope.noDataDialouge=false;
      }else{
        $scope.noDataDialouge=true;
      }
      if(myCount<1){
        $scope.setTableValues()
      }
      myCount++;
      $scope.loadingData=false;
      $scope.isDetailInfoUpdated=true
    });

  $scope.tableAction = function(index) {

    $http({
      method: 'GET',
      url: '/api/support/supportChat/?uid='+$scope.reviewData[index].uid,
    }).
    then(function(response) {
      var appType = 'Info';
        $scope.addTab({
          title: 'Chat : ' + $scope.reviewData[index].uid,
          cancel: true,
          app: 'ChatInfo',
          data: {
            chatThreadData:$scope.reviewData[index],
            supportChatData:response.data
          },
          active: true,
        })
    });
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;
  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }
  $scope.addTab = function(input) {
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
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

  $scope.isTableView=true

  $scope.setMyView=function(){
    $scope.isTableView=!$scope.isTableView
  }

  $scope.chatTypes=['All','audio','video','Audio & Video']
  $scope.form.selectedChatType="All";
  $scope.sortOptions=['Created','Agent Name','UID','Rating','Company']
  $scope.selectedSortOption={
    value:'Created'
  }
  $scope.loadingData=true;

  $scope.setLocationData=function(data){

    let myLocationData = JSON.parse(data)
    if (myLocationData.city != null) {
      if (myLocationData.hasOwnProperty('timezone')) {
        return {
          'city': myLocationData.city,
          'country_name': myLocationData.country,
          'region_name': myLocationData.regionName,
          'zip': myLocationData.zip,
          'ip': myLocationData.query,
          'flag': '/static/Flags/' + myLocationData.countryCode.toLowerCase() + '.png',
          'location': {
            'capital': null,
            'languages': null
          },
          'longitude':myLocationData.lon,
          'latitude':myLocationData.lat
        }
      } else {
        let dataValue = Object.assign(myLocationData)
        dataValue.flag = '/static/Flags/' + myLocationData.country_code.toLowerCase() + '.png',
        dataValue.timezone = null
        return dataValue
      }
    }
  }

  $scope.getData = function(date,email,download,typOfCall){
   $scope.reviewData=[]
   $scope.loadingData=true;
    var url = '/api/support/reviewHomeCal/?customer&limit='+$scope.pageOptionsSelected.value+'&offset='+$scope.offset
    // '/api/support/reviewHomeCal/?customer&chatedDate='+new Date()
    if (date!=null&&typeof date == 'object') {
      url += '&date=' + date.toJSON().split('T')[0]
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
    if ($scope.selectedSortOption.value!='' && $scope.selectedSortOption.value!=undefined ) {
      url += '&sort' + '&sortby=' + $scope.selectedSortOption.value
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
        for (let i = 0; i < $scope.archivedData.length; i++) {
          $scope.reviewData[i].location=$scope.setLocationData($scope.reviewData[i].location)
        }
        $scope.reviewDataLength = response.data.dataLength
        $scope.totalItems = response.data.dataLength
        if($scope.reviewData.length>0){
          $scope.tabelRowAction($scope.reviewData[0])
          $scope.noDataDialouge=false;
        }else{
          $scope.noDataDialouge=true;
        }
        if(myCount<1){
          $scope.setTableValues()
        }
        myCount++;
        $scope.loadingData=false;
        $scope.isDetailInfoUpdated=true
      });
    }
  }


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
        $scope.getData(date,$scope.form.email,download,typOfCall)
    }

    $scope.download = function(){
      $scope.filterData(true)
    }

})



app.controller("app.customerReviews.explore", function($scope, $http, $permissions, $timeout, $uibModal) {

  $scope.commentPerm = false;
  $timeout(function () {
    $scope.commentPerm =  $permissions.myPerms('module.reviews.comment')
  }, 500);

  $scope.reviewCommentData = []
  $scope.reviewForm = {message:''}
  $scope.msgData=[]
  $scope.fullChatData=[]
  $scope.msgData = $scope.tab.data.chatThreadData
  $scope.fullChatData=$scope.tab.data.supportChatData

  $http({
    method: 'GET',
    url: '/api/support/visitor/?uid=' + $scope.msgData.uid,
  }).
  then(function(response) {
    console.log(response.data, typeof response.data, response.data.length);
    $scope.visitorDetails=response.data[0]
  });

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


  $http({
    method: 'GET',
    url: '/api/support/reviewComment/?user='+$scope.msgData.user_id+'&uid='+$scope.msgData.uid+'&chatedDate='+$scope.msgData.created.split('T')[0],
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
    size: 'xl',
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
      Flash.create('danger', err.data.detail);
    });
  }
  $scope.postComment = function(){
    if ($scope.reviewForm.message.length == 0) {
      Flash.create('warning','Please Write Some Comment')
      return
    }
    var fd1 = new FormData();
    fd1.append('message', $scope.reviewForm.message);
    fd1.append('uid', $scope.msgData.uid);
    fd1.append('chatedDate', $scope.msgData.created.split('T')[0]);
    SendingPostRequest(fd1);
  }

});