app.controller("controller.home.profile", function($scope , $state , $users ,  $stateParams , $http , Flash,$uibModal) {

  // $scope.data = $scope.tab.data;

  $scope.me = $users.get("mySelf");

  console.log('aaaaaaaaaaaaaaaaaaaaaa', $scope.me.pk);
  $http({
    method: 'GET',
    url: '/api/HR/payroll/?user=' + $scope.me.pk
  }).
  then(function(response) {
    $scope.payroll = response.data[0];
    console.log($scope.payroll);
  })
  console.log('((((((((((((((()))))))))))))))', $scope.me.pk);
  $http({
    method: 'GET',
    url: '/api/HR/designation/?user=' + $scope.me.pk
  }).
  then(function(response) {
    console.log(response.data, '&&&&&&&&&&&&&&&&&&&&&&&7');
    $scope.designation = response.data[0];
    console.log($scope.designation);

    if (typeof $scope.designation.division == 'number') {
      $http({
        method: 'GET',
        url: '/api/organization/divisions/' + $scope.designation.division + '/'
      }).
      then(function(response) {
        $scope.designation.division = response.data;
      })
    }

    if (typeof $scope.designation.unit == 'number') {
      $http({
        method: 'GET',
        url: '/api/organization/unit/' + $scope.designation.unit + '/'
      }).
      then(function(response) {
        $scope.designation.unit = response.data;
      })

    }




  })

  $http({
    method: 'GET',
    url: '/api/HR/profileAdminMode/?user=' + $scope.me.pk
  }).
  then(function(response) {
    console.log(response.data, '&&&&&&&&&&&&&&&&&&&&&&&7');
    $scope.data = response.data[0];
    console.log($scope.data);
  })

  $scope.openModal = function(payroll) {
  $uibModal.open({
       templateUrl: '/static/ngTemplates/app.home.profile.modal.html',
       size: 'md',
       controller: function($scope,$http, Flash,$uibModalInstance,$users){
         $scope.data = payroll;
         console.log($scope.data);

         $scope.joiningDate =new Date($scope.data.joiningDate);
         $scope.joiningDateYear = $scope.joiningDate.getFullYear();
         $scope.joiningMonth =  $scope.joiningDate.getMonth();

         $scope.currentDate = new Date()
         $scope.currentYear = new Date().getFullYear()
         $scope.currentMonth =  new Date().getMonth();

         if($scope.data.lastWorkingDate!=null){
           $scope.lastWorkingDate =new Date($scope.data.lastWorkingDate);
           $scope.lastWorkingYear = $scope.lastWorkingDate.getFullYear();
           $scope.lastWorkingMonth = $scope.lastWorkingDate.getMonth();
         }
         else{
           $scope.lastWorkingDate = $scope.currentDate
           $scope.lastWorkingYear = $scope.currentYear
           $scope.lastWorkingMonth = $scope.currentMonth
         }




         if ($scope.lastWorkingYear<$scope.currentYear) {
           $scope.currentYear = $scope.lastWorkingYear
           $scope.currentDate = $scope.lastWorkingDate
         }



         $scope.$watch('currentYear', function(newValue, oldValue) {

           console.log($scope.joiningMonth,$scope.lastWorkingMonth);
           $scope.monthsData =[]
           $scope.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
           if($scope.joiningDateYear==$scope.lastWorkingYear){;
             if($scope.joiningMonth==$scope.lastWorkingMonth){
               $scope.monthsData.push($scope.months[$scope.joiningMonth])
             }
             else{
               $scope.monthsData = $scope.months.splice($scope.joiningMonth,$scope.lastWorkingMonth-1)
             }
           }
           else if(newValue==$scope.joiningDateYear){
             $scope.monthsData = $scope.months.splice($scope.joiningMonth,$scope.months.length)
           }
           else if(newValue==$scope.lastWorkingYear){
             $scope.monthsData =  $scope.months.splice(0,$scope.lastWorkingMonth+1)
           }
           else{
             $scope.monthsData = $scope.months
           }
         })

         $scope.next = function() {
           if($scope.lastWorkingYear == $scope.currentYear ){
             return ;
           }
           else{
           $scope.currentYear += 1;
           }
         }

         $scope.prev = function() {
           if($scope.joiningDateYear == $scope.currentYear ){
             return ;
           }
           else{
           $scope.currentYear -= 1;
           }
         }



               $scope.cancel = function () {
                 $uibModalInstance.dismiss('cancel')
               }
         },
       })
     }


});
