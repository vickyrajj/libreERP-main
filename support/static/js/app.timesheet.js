app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.timesheet', {
    url: "/timesheet",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.timesheet.html',
        controller: 'businessManagement.timesheet',
      }
    }
  })
});
app.controller("businessManagement.timesheet.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope , ngAudio , $interval, $timeout , $permissions) {


  // console.log($scope.commentPerm);
  // $scope.me = $users.get('mySelf');
console.log($scope.me);

$scope.form1 = {date:new Date()}

$scope.fetchhh=function(date){
  var url = '/api/support/heartbeat/?pk='+$scope.tab.data+'&getDetailData'

  if (date!=null&&typeof date == 'object') {
    url += '&date=' + date.toJSON().split('T')[0]
    // $scope.filterParams.push({key : 'date' , value :date.toJSON().split('T')[0]})
  }
  $http({
  method: 'GET',
  url: url,
  }).
  then(function(response) {
  // $scope.custDetails = response.data[0]
  console.log(response.data,'dddddddddddd',typeof response.data);
  $scope.fullInfo =response.data
  });
}
$scope.fetchhh($scope.form1.date);
$scope.filterCall=function(){
  $scope.fetchhh($scope.form1.date);
}


})
app.controller("businessManagement.timesheet", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope,$window) {

  $scope.data = {
    tableData: []
  };

  // $http({
  //   method: 'GET',
  //   url: url,
  // }).
  // then(function(response) {
  //   // $scope.custDetails = response.data[0]
  //   console.log(response.data,'dddddddddddd',typeof response.data);
  //   $scope.fullInfo =response.data
  // });

  $scope.form = {date:new Date(),user:'',email:'',client:''}
  $scope.reviewData = []
  // $scope.archivedData=[]

function archived(){
  console.log('called');
}

$scope.browseTab = true;
$scope.archiveTab = false;


  $scope.getData = function(date,user,email,client,download){
    console.log('@@@@@@@@@@@@@@@@@@',date,user,email,client,download);
    var url = '/api/support/heartbeat/?'
    url += 'getTimeSheetData'
    // if (date!=null&&typeof date == 'object') {
    //   url += '&date=' + date.toJSON().split('T')[0]
    //   // $scope.filterParams.push({key : 'date' , value :date.toJSON().split('T')[0]})
    // }
    if (typeof user == 'object') {
      url += '&user=' + user.pk
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
  $scope.getData($scope.form.date,$scope.form.user)
  // $scope.getArchData($scope.form.date,$scope.form.user,$scope.form.email,$scope.form.client)

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
    // if (typeof $scope.form.date =='undefined') {
    //   Flash.create('warning','Please Select Proper Date')
    //   return
    // }
    if (typeof $scope.form.user == 'string' && $scope.form.user.length > 0) {
      Flash.create('warning','Please Select Suggested User')
      return
    }else if (typeof $scope.form.user == 'object') {
      var user = $scope.form.user
    }else {
      var user = ''
    }
    // if (typeof $scope.form.client == 'string' && $scope.form.client.length > 0) {
    //   Flash.create('warning','Please Select Suggested Client')
    //   return
    // }else if (typeof $scope.form.client == 'object') {
    //   var client = $scope.form.client
    // }else {
    //   var client = ''
    // }
    // if ($scope.form.email==undefined) {
    //   Flash.create('warning','Please Select Valid Email')
    //   return
    // }
    console.log($scope.form);
    // if ($scope.changeDateType&&$scope.form.date!=null) {
    //   console.log('update');
    //   res = new Date($scope.form.date)
    //   var date = new Date(res.setDate(res.getDate() + 1))
    // }else {
    //   console.log('no changeeeeeee');
    //   var date = $scope.form.date
    // }
    console.log(date);
    $scope.getData(date,user,$scope.form.email,client,download)
    // $scope.getArchData(date,user,$scope.form.email,client,download)
  }

  $scope.download = function(){
    $scope.filterData(true)
  }



  $scope.tableAction = function(target) {
    // console.log(target, action, mode);
    console.log($scope.reviewData[target]);



    var appType = 'Info';
    $scope.addTab({
      title: 'Agent : ' + $scope.reviewData[target][0].user_id,
      cancel: true,
      app: 'AgentInfo',
      data: $scope.reviewData[target][0].user_id,
      active: true,
      typ:'browse'
    })
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
