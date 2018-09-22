app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.customerKnowledgeBase', {
    url: "/customerReviews",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.customerKnowledgeBase.html',
        controller: 'businessManagement.customerKnowledgeBase',
      }
    }
  })
});

app.controller("businessManagement.customerKnowledgeBase", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope , ngAudio , $interval , $permissions) {

  var emptyFile = new File([""], "");
  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css: '/static/css/bootstrap.min.css',
    inline: false,
    plugins: 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme: 'modern',
    height: 400,
    toolbar: 'saveBtn publishBtn cancelBtn headerMode bodyMode | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
  };
  // $scope.state = 'Knowledge Base';
  $scope.custDetailsPk;
  $http({
    method: 'GET',
    url: '/api/support/reviewHomeCal/?customer&customerProfilePkList',
  }).
  then(function(response) {
    console.log(response.data);
    $scope.custDetailsPk = response.data[0];
    $http({
      method: 'GET',
      url: '/api/support/documentation/?customer=' + $scope.custDetailsPk,
    }).
    then(function(response) {
      $scope.custDocs = response.data
      console.log($scope.custDocs, 'dddddddddddd');
    });
  });

  $scope.addDoc = function(idx) {
    if (idx == -1) {
      $scope.docForm = {
        title: '',
        text: '',
        docs: emptyFile
      }
      $scope.versions = [];
    } else {
      $scope.docForm = $scope.custDocs[idx]
      console.log($scope.docForm,'%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
      $scope.versions = [];
      console.log('coming hereeeee');
      $scope.fetchVersions($scope.docForm.pk)
    }
    console.log($scope.docForm);
  }

  $scope.saveDoc = function() {
    console.log($scope.docForm);
    if ($scope.docForm.title == null || $scope.docForm.title.length == 0) {
      Flash.create('warning', 'Title Is Required')
      return
    }
    console.log($scope.docForm.text == null);
    if (($scope.docForm.text == null || $scope.docForm.text.length == 0) && ($scope.docForm.docs == null || $scope.docForm.docs == emptyFile)) {
      Flash.create('warning', 'Either Content Or Document File Is Required')
      return
    }

    var fd = new FormData();
    fd.append('title', $scope.docForm.title);
    fd.append('customer', $scope.custDetailsPk);

    console.log($scope.docForm.process,'this is process');

    if ($scope.docForm.process!=null && typeof $scope.docForm.process != 'string') {
      console.log($scope.docForm.process.pk,'dddddddddddddddddd');
      console.log($scope.docForm.process);
      fd.append('process' , $scope.docForm.process.pk)
    }

    if ($scope.docForm.articleOwner!=null && typeof $scope.docForm.articleOwner != 'string') {
      console.log('article owner' , $scope.docForm.articleOwner , $scope.docForm.articleOwner.pk);
      fd.append('articleOwner' , $scope.docForm.articleOwner.pk)
    }

    if ($scope.docForm.text != null && $scope.docForm.text.length > 0) {
      fd.append('text', $scope.docForm.text);
    }
    if ($scope.docForm.docs != null && typeof $scope.docForm.docs != 'string' && $scope.docForm.docs != emptyFile) {
      fd.append('docs', $scope.docForm.docs);
    }
    var method = 'POST'
    var url = '/api/support/documentation/'
    if ($scope.docForm.pk != undefined) {
      method = 'PATCH'
      url += $scope.docForm.pk + '/'
    }
    console.log(fd);

    $http({
      method: method,
      url: url,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      // Flash.create('success', 'Saved');
      if ($scope.docForm.pk == undefined) {
        $scope.custDocs.push(response.data)
      }
      $scope.docForm = response.data
      console.log('docFormmmmmmmmmmmmmmmmmm',$scope.docForm);

      $http({
        method: 'POST',
        url: '/api/support/documentVersion/',
        data: {
          text: response.data.text,
          parent: response.data.pk,
          title: response.data.title
        }
      }).
      then(function(response) {
        // console.log('ddddddddddddddd', response.data);
        response.data.active = false
        $scope.versions.push(response.data)
      });



    })


    console.log($scope.selected_process,'ffffffffffffff');
  }

  $scope.$watch('docForm.text', function(newValue, oldValue) {
    var span = document.createElement('span');
    span.innerHTML = newValue;
    // console.log(span.innerHTML);
    $scope.h1_array = [{}];
    $scope.h2_array = [{}];

    var nodes = span.getElementsByTagName('h1');
    for (var i = 0; i < nodes.length; i++) {
      var current = nodes[i].outerHTML;
      var index = newValue.indexOf(current);
      var tempString = newValue.substring(0, index);
      var lineNumber = tempString.split('\n').length;
      if (span.getElementsByTagName('h1')[i].innerHTML !== "&nbsp;")
        $scope.h1_array.push({
          title: nodes[i].innerHTML,
          index_val: lineNumber,
          childeren: [{}]
        });
      // console.log($scope.h1_array);
    }
    var nodes_h2 = span.getElementsByTagName('h2');
    for (var j = 0; j < nodes_h2.length; j++) {
      var current = nodes_h2[j].outerHTML;
      var index = newValue.indexOf(current);
      var tempString = newValue.substring(0, index);
      var lineNumber = tempString.split('\n').length;
      if (span.getElementsByTagName('h2')[j].innerHTML !== "&nbsp;")
        $scope.h2_array.push({
          title: nodes_h2[j].innerHTML,
          index_val: lineNumber
        });
      // console.log($scope.h2_array);
    }

    if ($scope.h1_array.length > 1) {
      var ind = 1;
      for (var k = 1; k < $scope.h2_array.length; k++) {
        while (ind < $scope.h1_array.length && $scope.h2_array[k].index_val > $scope.h1_array[ind].index_val) {
          ind = ind + 1;
        }
        $scope.h1_array[--ind].childeren.push($scope.h2_array[k]);
      }
    }
  }, true)

  // $scope.h1tag=function(){
  //   var index = docForm.text.indexOf('console');
  //   console.log(index);
  // }

  $scope.fetchVersions = function(pk) {
    $http({
      method: 'GET',
      url: '/api/support/documentVersion/?parent=' + pk,
    }).
    then(function(response) {
      $scope.versions = response.data
      for (var i = 0; i < $scope.versions.length; i++) {
        $scope.versions[i].active = false
      }

    });
  }

  $scope.openVersion = function(indx) {
    $scope.version = $scope.versions[indx];

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.customer.version.modal.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        version: function() {
          return $scope.versions[indx];
        }
      },
      controller: function($scope, $users, version, $timeout, $uibModalInstance) {
        $scope.version = version

        $scope.close = function () {
            $uibModalInstance.dismiss();
        }
      },
    })
  }

  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };



  $scope.processSearch = function(val) {
    return $http({
      method: 'GET',
      url: '/api/support/companyProcess/?text__contains=' + val
    }).
    then(function(response) {
      return response.data;
    })
  }




});
