app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.timesheets', {
    url: "/timesheets",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.timesheets.html',
        controller: 'businessManagement.timesheets',
      }
    }
  })
});
// app.controller("businessManagement.timesheets.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope , ngAudio , $interval, $timeout , $permissions) {
//
// console.log($scope.me);
//
// $scope.form1 = {date:new Date()}
//
// $scope.fetchhh=function(date){
//   var url = '/api/support/heartbeat/?pk='+$scope.tab.data+'&getDetailData'
//
//   if (date!=null&&typeof date == 'object') {
//     url += '&date=' + date.toJSON().split('T')[0]
//   }
//   $http({
//   method: 'GET',
//   url: url,
//   }).
//   then(function(response) {
//
//   console.log(response.data,'dddddddddddd',typeof response.data);
//   $scope.fullInfo =response.data
//   });
// }
// $scope.fetchhh($scope.form1.date);
// $scope.filterCall=function(){
//   $scope.fetchhh($scope.form1.date);
// }
//
//
// })
app.controller("businessManagement.timesheets", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope,$window) {

  $scope.data = {
    tableData: []
  };

console.log($users.get('mySelf'));
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
    $scope.me=$users.get('mySelf')
    console.log($scope.me.pk);
    var url = '/api/support/heartbeat/?pk='+$scope.me.pk+'&getDetailData'

    if (date!=null&&typeof date == 'object') {
      url += '&date=' + date.toJSON().split('T')[0]
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
    if (typeof $scope.form.date =='undefined'||$scope.form.date ==null) {
      Flash.create('warning','Please Select Proper Date')
      return
    }
    console.log($scope.form);
    $scope.getData($scope.form.date)

  }

  $scope.download = function(){
    $scope.filterData(true)
  }
  $scope.ActiveRows=[]

  $scope.showData=function(index){
    if($scope.ActiveRows[index]){
      $scope.ActiveRows[index]=false;
      return;
    }
    for (var i = 0; i < $scope.ActiveRows.length; i++) {
      $scope.ActiveRows[i]=false
    }
    $scope.ActiveRows[index]=true
  }

  $scope.tableAction = function(target) {

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
      // console.log($scope.tabs[i].data,input.data[0].id, $scope.tabs[i].app ,input.app);
      if ($scope.tabs[i].data == input.data && $scope.tabs[i].app == input.app) {
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
