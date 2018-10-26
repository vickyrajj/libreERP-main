app.controller("controller.home.files", function($scope, $state, $users, $stateParams, $http, Flash) {
  $scope.allImages = []
  $scope.imagesSearch = ''

  $scope.$watch('imagesSearch', function(newValue, oldValue) {
    console.log(newValue, 'aaaaaaaaaaaaaa');
    if (newValue == false) {
      value = 'static'
      url = '/api/PIM/imageFetch/?value=' + value
    } else {
      value = 'media'
      url = '/api/PIM/imageFetch/?value=' + value
    }
    $http({
      method: 'GET',
      url: url,
    }).
    then(function(response) {
      $scope.allImages = response.data

    })
  })


$scope.removeMedia = function(indx,mediaName){
  console.log($scope.imagesSearch,'@@@@@@@@@@@@@@@@@@@@@@');
  if($scope.imagesSearch==false){
      url = '/api/PIM/imageFetch/?mediaName=' + mediaName + '&value=static'
  }
  else{
    url = '/api/PIM/imageFetch/?mediaName=' + mediaName + '&value=media'
  }
  $http({
    method: 'DELETE',
    url: url,
  }).
  then(function(response) {
    $scope.allImages.splice(indx,1)
  })
}




});
