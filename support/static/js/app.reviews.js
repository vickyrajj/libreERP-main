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


app.controller("businessManagement.customerReviews", function($scope, $state, $http, $rootScope) {
  $rootScope.state = 'Reviews';
  $scope.reviewData = []


    $scope.form = {date:new Date(),email:''}

  console.log('in review function');

  $http({
    method: 'GET',
    url: '/api/support/reviewHomeCal/?customer',
  }).
  then(function(response) {
    $scope.reviewData = response.data
    console.log($scope.reviewData);
  });

  $scope.tableAction = function(target) {
    // console.log(target, action, mode);
    console.log($scope.reviewData[target]);
    var appType = 'Info';
    $scope.addTab({
      title: 'Chat : ' + $scope.reviewData[target][0].uid,
      cancel: true,
      app: 'ChatInfo',
      data: $scope.reviewData[target],
      active: true
    })

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
      console.log($scope.tabs[i].data[0].id, input.data[0].id, $scope.tabs[i].app, input.app);
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

  $scope.getData = function(date,email,download){
    console.log('@@@@@@@@@@@@@@@@@@',date,email,download);
    var url = '/api/support/reviewHomeCal/?'
    if (date!=null&&typeof date == 'object') {
      url += '&date=' + date.toJSON().split('T')[0]
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


  $scope.changeDateType = false
  $scope.$watch('form.date', function(newValue, oldValue) {
    console.log(oldValue,newValue);
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
    if ($scope.form.email==undefined) {
      Flash.create('warning','Please Select Valid Email')
      return
    }
    console.log($scope.form);

    if ($scope.changeDateType&&$scope.form.date!=null) {
      console.log('update');
      console.log($scope.form.date);
      res = new Date($scope.form.date)
      console.log(res);
      var date = new Date(res.setDate(res.getDate() + 1))
    }else {
      console.log('no changeeeeeee');
      var date = $scope.form.date
    }
    console.log(date);
    $scope.getData(date,$scope.form.email,download)
  }

  $scope.download = function(){
    $scope.filterData(true)
  }




})



app.controller("app.customerReviews.explore", function($scope, $http, $permissions) {
  console.log($scope.tab.data);
  $scope.data = $scope.tab.data
  $scope.commentPerm =  $permissions.myPerms('module.reviews.comment')

  $scope.reviewForm = {message:''}

  $scope.calculateTime = function(user, agent) {
    console.log('inside cal cccccccccccc');
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


});
