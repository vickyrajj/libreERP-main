app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.reviews', {
    url: "/reviews",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.reviews.html',
        controller: 'businessManagement.reviews',
      }
    }
  })
});
app.controller("businessManagement.reviews.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope , ngAudio , $interval , $permissions) {


  $scope.commentPerm =  $permissions.myPerms('module.reviews.comment')

  console.log($scope.commentPerm);

  $scope.msgData = $scope.tab.data
  console.log($scope.tab.data);
  $scope.reviewCommentData = []
  $http({
    method: 'GET',
    url: '/api/support/reviewComment/?user='+$scope.msgData[0].user_id+'&uid='+$scope.msgData[0].uid+'&chatedDate='+$scope.msgData[0].created.split('T')[0],
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


  $scope.postComment = function(){
    console.log($scope.msgData[0].created);
    if ($scope.reviewForm.message.length == 0) {
      Flash.create('warning','Please Write Some Comment')
      return
    }
    var toSend = {message:$scope.reviewForm.message,uid:$scope.msgData[0].uid,chatedDate:$scope.msgData[0].created.split('T')[0]}
    $http({
      method: 'POST',
      url: '/api/support/reviewComment/',
      data : toSend
    }).
    then(function(response) {
      console.log(response.data,'dddddddddddd',typeof response.data);
      console.log(response.data);
      $scope.reviewCommentData.push(response.data)
      $scope.reviewForm = {message:''}
    }, function(err) {
      console.log(err.data.detail);
      Flash.create('danger', err.data.detail);
    });
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
  $scope.getData = function(date,user,email,client,download){
    console.log('@@@@@@@@@@@@@@@@@@',date,user,email,client,download);
    var url = '/api/support/reviewHomeCal/?'
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
        $scope.reviewData =response.data
      });
    }
  }
  $scope.getData($scope.form.date,$scope.form.user,$scope.form.email,$scope.form.client)
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
    // console.log(oldValue,newValue);
    if (oldValue == undefined || oldValue == null) {
      $scope.changeDateType = true
    }
  })
  $scope.filterData = function(download){

    // console.log($scope.form.date,typeof($scope.form.date),$scope.oldDateValue);
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
  }

  $scope.download = function(){
    $scope.filterData(true)
  }
  // views = [{
  //   name: 'list',
  //   icon: 'fa-th-large',
  //   template: '/static/ngTemplates/genericTable/genericSearchList.html',
  //   itemTemplate: '/static/ngTemplates/app.reviews.items.html',
  // }, ];
  //
  //
  // $scope.config = {
  //   views: views,
  //   url: '/api/support/supportChat/',
  //   searchField: 'name',
  //   itemsNumPerView: [16, 32, 48],
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
