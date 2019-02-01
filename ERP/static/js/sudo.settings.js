app.controller('home.settings.configure.blog', function($scope, $stateParams, $http, $aside, $state, Flash, $users, $filter) {
  console.log('hey');

  $scope.editor = {
    title: '',
    pk: null
  }

  $http({
    method: 'GET',
    url: '/api/PIM/blogTags/'
  }).
  then(function(response) {
    $scope.tags = response.data;
  })

  $scope.edit = function(index) {
    $scope.tagBackup = angular.copy($scope.tags[index]);
    $scope.tags.splice(index, 1)
    $scope.editor.title = angular.copy($scope.tagBackup.title);
    $scope.editor.pk = angular.copy($scope.tagBackup.pk);
  }

  $scope.saveCategory = function() {
    var url = '/api/PIM/blogTags/'
    var method = 'POST';
    var dataToSend = {
      title: $scope.editor.title
    };
    if ($scope.editor.pk != null) {
      $scope.tagBackup.title = $scope.editor.title;
      url += $scope.editor.pk + '/';
      method = 'PATCH';
    }

    $http({
      method: method,
      url: url,
      data: dataToSend
    }).
    then(function(response) {
      $scope.tags.push(response.data);
      $scope.editor = {
        title: '',
        pk: null
      };
    })

  }

  $scope.delete = function(index) {
    $http({
      method: 'DELETE',
      url: '/api/PIM/blogTags/' + $scope.tags[index].pk + '/'
    }).
    then(function(response) {
      $scope.tags.splice(index, 1);
    })
  }

  $scope.cancelEditor = function() {
    $scope.tags.push($scope.tagBackup);
    $scope.editor = {
      title: '',
      pk: null
    };
  }

});
app.controller('home.settings.configure', function($scope, $stateParams, $http, $aside, $state, Flash, $users, $filter) {

  // settings for dashboard controller
  if (typeof $stateParams.canConfigure == 'undefined') {
    return;
  }

  $http({
    method: 'GET',
    url: '/api/ERP/appSettingsAdminMode/?app=' + $stateParams.canConfigure
  }).
  then(function(response) {
    $scope.settings = response.data;
    for (var i = 0; i < $scope.settings.length; i++) {
      $scope.settings[i].data = $scope.settings[i][$scope.settings[i].fieldType];
    }
  })

  $scope.save = function() {
    for (var i = 0; i < $scope.settings.length; i++) {
      if ($scope.settings[i].fieldType == 'flag') {
        dataToSend = {
          flag: $scope.settings[i].flag
        }

      } else {
        dataToSend = {
          value: $scope.settings[i].value
        }
      }
      $http({
        method: 'PATCH',
        url: '/api/ERP/appSettingsAdminMode/' + $scope.settings[i].pk + '/',
        data: dataToSend
      }).
      then(function(response) {
        Flash.create('success', response.status + ' : ' + response.statusText);
      }, function(response) {
        Flash.create('danger', response.status + ' : ' + response.statusText);
      });
    }
  }


});


app.controller('home.settings.menu', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  // settings main page controller

  var getState = function(input) {
    parts = input.name.split('.');
    // console.log(parts);
    if (parts[0] == 'configure') {
      return 'home.settings.configure ({canConfigure :' + input.canConfigure + ', app :"' + parts[2] + '"})';;
    } else {
      return input.name.replace('sudo', 'home')
    }
  }

  $scope.apps = [];

  $scope.buildMenu = function(apps) {
    for (var i = 0; i < apps.length; i++) {
      a = apps[i];
      parts = a.name.split('.');
      if (a.module != 2 || parts.length != 3) {
        continue;
      }
      a.state = getState(a)
      a.dispName = parts[parts.length - 1];
      $scope.apps.push(a);
    }
  }

  as = $permissions.apps();
  if (typeof as.success == 'undefined') {
    $scope.buildMenu(as);
  } else {
    as.success(function(response) {
      $scope.buildMenu(response);
    });
  };

  $scope.isActive = function(index) {
    app = $scope.apps[index]
    if (angular.isDefined($state.params.app)) {
      return $state.params.app == app.name.split('.')[2]
    } else {
      return $state.is(app.name.replace('sudo', 'home'))
    }
  }

});


app.controller('home.settings', function($scope, $http, $aside, $state, Flash, $users, $filter,$uibModal) {
  console.log('in settingssssssss');
  $scope.sai = 'Kiran'
  $scope.blogsData = []
  $http({
    method: 'GET',
    url: '/api/PIM/blog/?contentType=article&state=published'
  }).
  then(function(response) {
    console.log('articleeeeeeeee',response.data);
    if (response.data.length>0) {
      $scope.blogsData = $scope.blogsData.concat(response.data)
    }
  })
  $http({
    method: 'GET',
    url: '/api/PIM/blog/?contentType__in=book,course,paperGroup'
  }).
  then(function(response) {
    console.log('books,course,papergroupdataaaaaa',response.data);
    if (response.data.length>0) {
      $scope.blogsData = $scope.blogsData.concat(response.data)
    }
  })
  $http({
    method: 'GET',
    url: '/api/LMS/subject/'
  }).
  then(function(response) {
    console.log('subjecttttttttt',response.data);
    $scope.subjectData = response.data;
  })
  $http({
    method: 'GET',
    url: '/api/LMS/section/'
  }).
  then(function(response) {
    console.log('sectipnnnnnnnnnnn',response.data);
    $scope.SectionData = response.data;
  })
  $http({
    method: 'GET',
    url: '/api/LMS/note/'
  }).
  then(function(response) {
    console.log('notesssssssss',response.data);
    $scope.notesData = response.data;
  })
  $http({
    method: 'GET',
    url: '/api/LMS/paper/'
  }).
  then(function(response) {
    console.log('paperrrrrrr',response.data);
    $scope.paperData = response.data;
  })
  $scope.editObject = function(typ,idx,clr){
    console.log(typ,idx);
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.ERP.settings.editSeoDetails.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        formData: function() {
          if (typ=='blog') {
            return $scope.blogsData[idx];
          }else if (typ=='subject') {
            return $scope.subjectData[idx];
          }else if (typ=='section') {
            return $scope.SectionData[idx];
          }else if (typ=='notes') {
            return $scope.notesData[idx];
          }else if (typ=='paper') {
            return $scope.paperData[idx];
          }else {
            return 'sai';
          }
        },
      },
      controller: function($scope, $uibModalInstance,formData) {
        console.log('editttttttt',typ,idx,clr,formData);
        $scope.formData = formData
        $scope.typ = typ
        $scope.clr = clr
        $scope.saveBlog = function() {
          console.log('save blog postssssssss');
          if ($scope.formData.title==null||$scope.formData.title.length==0) {
            Flash.create('danger', 'Title Is Required')
            return
          }
          if ($scope.formData.description==null||$scope.formData.description.length==0) {
            Flash.create('danger', 'Description Is Required')
            return
          }
          if ($scope.formData.shortUrl==null||$scope.formData.shortUrl.length==0) {
            Flash.create('danger', 'Description Is Required')
            return
          }
          if ($scope.formData.ogimage==null&&$scope.formData.ogimageUrl==null) {
            Flash.create('danger', 'Either Og Image Or Og Image URL Is Required')
            return
          }
          var fd = new FormData();
          fd.append('title',$scope.formData.title)
          fd.append('description',$scope.formData.description)
          fd.append('shortUrl',$scope.formData.shortUrl)
          fd.append('ogimageUrl',$scope.formData.ogimageUrl)
          if ($scope.formData.ogimage!=null&&typeof $scope.formData.ogimage!='string') {
            fd.append('ogimage',$scope.formData.ogimage)
          }
          $http({
            method: 'PATCH',
            url: '/api/PIM/blog/'+$scope.formData.pk+'/',
            data: fd,
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            $uibModalInstance.dismiss(response.data)
            Flash.create('success', 'Updated Successfully')
          }, function(err) {
            Flash.create('danger', 'Internal Error')
          })
        }
        $scope.saveSubject = function() {
          console.log('save subjecttttttt');
          if ($scope.formData.description==null||$scope.formData.description.length==0) {
            Flash.create('danger', 'Description Is Required')
            return
          }
          var fd = new FormData();
          fd.append('description',$scope.formData.description)
          if ($scope.formData.dp!=null&&typeof $scope.formData.dp!='string') {
            fd.append('dp',$scope.formData.dp)
          }
          $http({
            method: 'PATCH',
            url: '/api/LMS/subject/'+$scope.formData.pk+'/',
            data: fd,
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            $uibModalInstance.dismiss(response.data)
            Flash.create('success', 'Updated Successfully')
          }, function(err) {
            Flash.create('danger', 'Internal Error')
          })
        }
        $scope.saveSection = function() {
          console.log('save Sectionnnnnnnn');
          if ($scope.formData.seoTitle==null||$scope.formData.seoTitle.length==0) {
            Flash.create('danger', 'Title Is Required')
            return
          }
          if ($scope.formData.description==null||$scope.formData.description.length==0) {
            Flash.create('danger', 'Description Is Required')
            return
          }
          if ($scope.formData.shortUrl==null||$scope.formData.shortUrl.length==0) {
            Flash.create('danger', 'URL Is Required')
            return
          }
          $http({
            method: 'PATCH',
            url: '/api/LMS/section/'+$scope.formData.pk+'/',
            data: {seoTitle:$scope.formData.seoTitle,description:$scope.formData.description,shortUrl:$scope.formData.shortUrl}
          }).
          then(function(response) {
            $uibModalInstance.dismiss(response.data)
            Flash.create('success', 'Updated Successfully')
          }, function(err) {
            Flash.create('danger', 'Internal Error')
          })
        }
        $scope.saveNotes = function() {
          console.log('save notessssss');
          if ($scope.formData.title==null||$scope.formData.title.length==0) {
            Flash.create('danger', 'Title Is Required')
            return
          }
          if ($scope.formData.description==null||$scope.formData.description.length==0) {
            Flash.create('danger', 'Description Is Required')
            return
          }
          if ($scope.formData.urlSuffix==null||$scope.formData.urlSuffix.length==0) {
            Flash.create('danger', 'URL Is Required')
            return
          }
          var fd = new FormData();
          fd.append('title',$scope.formData.title)
          fd.append('description',$scope.formData.description)
          fd.append('urlSuffix',$scope.formData.urlSuffix)
          if ($scope.formData.image!=null&&typeof $scope.formData.image!='string') {
            fd.append('image',$scope.formData.image)
          }
          $http({
            method: 'PATCH',
            url: '/api/LMS/note/'+$scope.formData.pk+'/',
            data: fd,
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            $uibModalInstance.dismiss(response.data)
            Flash.create('success', 'Updated Successfully')
          }, function(err) {
            Flash.create('danger', 'Internal Error')
          })
        }
        $scope.savePaper = function() {
          console.log('save paperrrr');
          if ($scope.formData.name==null||$scope.formData.name.length==0) {
            Flash.create('danger', 'Title Is Required')
            return
          }
          if ($scope.formData.description==null||$scope.formData.description.length==0) {
            Flash.create('danger', 'Description Is Required')
            return
          }
          $http({
            method: 'PATCH',
            url: '/api/LMS/paper/'+$scope.formData.pk+'/',
            data: {name:$scope.formData.name,description:$scope.formData.description}
          }).
          then(function(response) {
            $uibModalInstance.dismiss(response.data)
            Flash.create('success', 'Updated Successfully')
          }, function(err) {
            Flash.create('danger', 'Internal Error')
          })
        }
      },
    }).result.then(function() {

    }, function(reason) {
      console.log(reason,typ,idx);
      if (reason.pk) {
        if (typ=='blog') {
          $scope.blogsData[idx] = reason
        }else if (typ=='subject') {
          $scope.subjectData[idx] = reason
        }else if (typ=='section') {
          $scope.SectionData[idx] = reason
        }else if (typ=='notes') {
          $scope.notesData[idx] = reason
        }else if (typ=='paper') {
          $scope.paperData[idx] = reason
        }
      }
    });
  }
});
