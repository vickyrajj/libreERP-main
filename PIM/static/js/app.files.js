app.controller("controller.home.files", function($scope, $state, $users, $stateParams, $http, Flash) {
    $scope.allImages = []
    $scope.imagesSearch = ''
    $scope.form = {
      file: emptyFile,
      value: ''
    }
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
    $scope.addMedia = function() {
      if($scope.imagesSearch == false){
        $scope.form.value = 'static'
        var fd = new FormData();
        fd.append('value',$scope.form.value)
        if($scope.form.file=='emptyFile'){
          Flash.create('danger','No image Selected')
          return;
        }
        else{
          fd.append('file',$scope.form.file)
        }
      }
      else{

      }
      console.log(fd, '@@@@@@@@@@@@@@@@@@@@@@@@@@@@' );
      $http({
        method: 'POST',
        url: '/api/PIM/imageFetch/',
        data: fd,
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).
      then(function(response) {
        // $scope.allImages = response.data

      })







      // if ($scope.imagesSearch == false) {
      //   $scope.value = 'static',
        // var fd = new FormData();
        // fd.append('value', $scope.form.value);
        // if ($scope.form.file == emptyFile) {
        //   Flash.create('danger', 'No image selected');
        //   return;
        // } else {
        //   fd.append('image', $scope.form.file);
        // }
      // }
      // else {
      //
      // }
      // $http({
      //   method: 'POST',
      //   url: '/api/PIM/imageFetch/',
      //   data: fd,
      //   transformRequest: angular.identity,
      //   headers: {
      //     'Content-Type': undefined
      //   }
      // }).
      // then(function(response) {
      //   // $scope.allImages = response.data
      //
      // })
}



$scope.removeMedia = function(indx, mediaName) {
console.log($scope.imagesSearch, '@@@@@@@@@@@@@@@@@@@@@@');
if ($scope.imagesSearch == false) {
  url = '/api/PIM/imageFetch/?mediaName=' + mediaName + '&value=static'
} else {
  url = '/api/PIM/imageFetch/?mediaName=' + mediaName + '&value=media'
}
$http({
  method: 'DELETE',
  url: url,
}).
then(function(response) {
  $scope.allImages.splice(indx, 1)
})
}




});
