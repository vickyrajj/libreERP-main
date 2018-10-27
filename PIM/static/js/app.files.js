app.controller("controller.home.files", function($scope, $state, $users, $stateParams, $http, Flash) {
    $scope.allImages = []
    $scope.imagesSearch = false
    $scope.form = {
      file: emptyFile,
      value: ''
    }

    $scope.fetchImages = function () {
      if ($scope.imagesSearch == false) {
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

        for (var i = 0; i < $scope.allImages.length; i++) {
          if ($scope.imagesSearch) {
            var name = $scope.allImages[i].split('pictureUploads/')[1]
          }else {
            var name = $scope.allImages[i].split('images/')[1]
          }
          $scope.allImages[i] = {path: $scope.allImages[i] , name:name}
        }

      })
    }

    $scope.$watch('imagesSearch', function(newValue, oldValue) {
      console.log(newValue, 'aaaaaaaaaaaaaa');
        $scope.fetchImages();
    })

    $scope.addMedia = function() {
      console.log($scope.form.file);
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


$scope.rename = function (renameText, indx) {

  if (renameText=='') {
    return
  }

  if ($scope.imagesSearch) {
    var extension = $scope.allImages[indx].path.split('pictureUploads/')[1].split('.')[1]
    var oldName = $scope.allImages[indx].name
    var newName = renameText +"."+ extension
  }else {
    var extension = $scope.allImages[indx].path.split('images/')[1].split('.')[1]
    var oldName = $scope.allImages[indx].name
    var newName = renameText +"."+ extension
  }


  var fd = new FormData();
  fd.append('oldName',oldName)
  fd.append('newName',newName)
  fd.append('path',$scope.allImages[indx].path)
  fd.append('rename',1)


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
    $scope.renameText = ''
    $scope.allImages[indx].name = newName
    // $scope.fetchImages()
    // $scope.allImages = response.data

  })
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
