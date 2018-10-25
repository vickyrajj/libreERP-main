app.controller("controller.home.files", function($scope , $state , $users ,  $stateParams , $http , Flash) {
$scope.allImages = []
$scope.imagesSearch=''

  $scope.$watch('imagesSearch', function(newValue, oldValue) {
    console.log(newValue,'aaaaaaaaaaaaaa');
    // if(newValue==false){
    //   console.log("aaaaaaaaaaaaaaaaaaaaaaaggggggggfffffffffffffff");
    //   var dataToSend = {
    //     value :'static'
    //   }
    // }
    // else{
    //   var dataToSend = {
    //     value :'media'
    //   }
    // }
    // console.log(dataToSend,'adffffffffffffff');
  $http({
    method: 'GET',
    url: '/api/PIM/imageFetch/',
    // data : dataToSend
  }).
  then(function(response) {
    $scope.allImages = response.data

  })

  })


});
