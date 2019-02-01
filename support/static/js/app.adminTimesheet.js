app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.adminTimesheet', {
    url: "/adminTimesheet",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.adminTimesheet.html',
        controller: 'businessManagement.adminTimesheet',
      }
    }
  })
});
app.controller("businessManagement.adminTimesheet.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope , ngAudio , $interval, $timeout , $permissions) {

    console.log($scope.me);
    $scope.form1 = {date:new Date()}
    $scope.fetchhh=function(date){
      var url = '/api/support/heartbeat/?pk='+$scope.tab.data+'&getDetailData'
      if (date!=null&&typeof date == 'object') {
        url += '&date=' + date.toJSON().split('T')[0]
      }
      $http({
      method: 'GET',
      url: url,
      }).
      then(function(response) {
        console.log(response.data);
        $scope.fullInfo =response.data
      });
    }
    $scope.fetchhh($scope.form1.date);

    $scope.filterCall=function(){
      $scope.fetchhh($scope.form1.date);
    }
})
app.controller("businessManagement.adminTimesheet", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope,$window) {

  $scope.data = {
    tableData: []
  };

  console.log($users.get('mySelf'));
  $scope.form = {date:new Date(),user:'',email:'',client:''}
  $scope.reviewData = []
  $scope.browseTab = true;
  $scope.archiveTab = false;


  $scope.getData = function(date,user,email,client,download){
    var url = '/api/support/heartbeat/?'
    url += 'getTimeSheetData'
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
        console.log(response.data);
        $scope.reviewData =response.data
      });
    }
  }
  $scope.getData($scope.form.date,$scope.form.user)


  $scope.changeDateType = false
  $scope.$watch('form.date', function(newValue, oldValue) {
    if (oldValue == undefined || oldValue == null) {
      $scope.changeDateType = true
    }
  })
  $scope.filterData = function(download){

    if (typeof $scope.form.date =='undefined'||$scope.form.date ==null) {
      Flash.create('warning','Please Select Proper Date')
      return
    }
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
});
