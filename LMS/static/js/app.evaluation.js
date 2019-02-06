app.config(function($stateProvider) {
  $stateProvider.state('home.evaluation', {
    url: "/evaluation",
    templateUrl: '/static/ngTemplates/app.LMS.evaluation.html',
    controller: 'home.LMS.evaluation'
  });
});

app.controller('home.LMS.evaluation', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.evaluation.item.html',
  }, ];

  groupViews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.evaluation.paper.group.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/LMS/paper/',
    searchField: 'ques',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }

  $scope.groupConfig = {
    views: groupViews,
    url: '/api/LMS/paperGroup/',
    searchField: 'ques',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Paper :';
          var appType = 'paperEditor';
        } else if (action == 'details') {
          var title = 'Paper Details :';
          var appType = 'paperExplorer';
        }


        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            paper: $scope.data.tableData[i]
          },
          active: true
        })
      }
    }

  }

  $scope.tableActionPaperGroup = function(target, action, mode) {
    console.log(target, action, mode, '-----------tattta acccc mmmm');
    console.log($scope.data.paperGroupTableData, '-------data');

    for (var i = 0; i < $scope.data.paperGroupTableData.length; i++) {
      if ($scope.data.paperGroupTableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Paper Group :';
          var appType = 'paperGroupEditor';
        }
        $scope.paperGroupData = $scope.data.paperGroupTableData[i]
        $scope.addTab({
          title: title + $scope.data.paperGroupTableData[i].title,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        })
      }
    }

  }

  $scope.savePaperGroup = function() {
    console.log($scope.paperGroupData);

    var f = $scope.paperGroupData
    if (f.title.length == 0 || f.description.length == 0) {
      Flash.create('danger', 'All Fields Are Required')
      return
    }
    if (f.blogData.ogimage == emptyFile && (f.blogData.ogimageUrl == '' || f.blogData.ogimageUrl == undefined)) {
      Flash.create('danger', 'Either the OG image file OR og image url is required')
      return;
    }
    if (f.blogData.tagsCSV == '' || f.blogData.section == '' || f.blogData.author == '' || f.blogData.description == '') {
      Flash.create('danger', 'Please check the All SEO related fields');
      return;
    }
    var toSend = {
      title: f.title,
      description: f.description,
      subject: f.subject.pk
    }
    var method = 'PATCH'
    var url = '/api/LMS/paperGroup/' + f.pk + '/'
    $http({
      method: method,
      url: url,
      data: toSend,
    }).
    then(function(response) {
      var f = $scope.paperGroupData
      var fd = new FormData();
      if (f.blogData.ogimage != emptyFile && typeof f.blogData.ogimage != 'string' && f.blogData.ogimage != null) {
        fd.append('ogimage', f.blogData.ogimage);
      } else {
        fd.append('ogimageUrl', f.blogData.ogimageUrl);
      }
      fd.append('contentType', 'paperGroup');
      fd.append('title', f.blogData.title);
      fd.append('shortUrl', f.blogData.shortUrl);
      fd.append('description', f.blogData.description);
      fd.append('tagsCSV', f.blogData.tagsCSV);
      fd.append('section', f.blogData.section);
      fd.append('author', f.blogData.author);
      fd.append('header', f.pk)
      var method = 'POST';
      var url = '/api/PIM/blog/';
      if (f.blogData.pk) {
        method = 'PATCH';
        url += f.blogData.pk + '/';
      }
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
        Flash.create('success', 'Saved Successfully')
      });
    })
  }



  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
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

app.controller("home.LMS.evaluation.explore", function($scope, $state, $users, $stateParams, $http, Flash) {
  $scope.paper = $scope.tab.data.paper;
});


app.controller("home.LMS.evaluation.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.resetForm = function() {
    $scope.selectedquestions = []
    $scope.questions = []
    $scope.form = {
      topic: '',
      text: '',
      subject: '',
      typ: '',
      book: '',
      section: '',
      name: '',
      timelimit: '',
      group: '',
      description: '',
      level: '',
    }
  }
  $scope.resetForm();
  $scope.time = new Date();

  if ($scope.tab == undefined || $scope.tab.data == undefined) {
    $scope.mode = 'new';
    $scope.form.timelimit = 60;
    $scope.form.level = 'easy'
  } else {
    $scope.mode = 'edit';
    $scope.selectedquestions = $scope.tab.data.paper.questions;
    $scope.form.name = $scope.tab.data.paper.name
    $scope.form.description = $scope.tab.data.paper.description
    $scope.form.level = $scope.tab.data.paper.level
    console.log($scope.selectedquestions);
    console.log($scope.tab.data.paper.timelimit, 'ddddd');
    $scope.form.timelimit = $scope.tab.data.paper.timelimit;
  }

  $scope.$watch('form.topic', function(newValue, oldValue) {
    if (typeof newValue != 'object') {
      return;
    }
    $scope.fetchQuestions();
  });

  $scope.$watch('form.section', function(newValue, oldValue) {
    if (typeof newValue != 'object') {
      return;
    }
    $scope.fetchQuestions();
  });

  $scope.paperGroupSearch = function(query) {
    return $http.get('/api/LMS/paperGroup/?limit=10&title__icontains=' + query).
    then(function(response) {
      return response.data.results;
    })
  };

  $scope.openPaperGroup = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMs.evaluation.papergroup.form.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        groupData: function() {
          return $scope.form.group;
        }
      },
      controller: function($scope, $uibModalInstance, groupData) {
        console.log(groupData);
        if (groupData.pk) {
          $scope.paperGroupForm = groupData
        } else {
          $scope.paperGroupForm = {
            title: groupData,
            description: '',
            subject: '',
            blogData: {
              title: '',
              shortUrl: '',
              ogimage: emptyFile,
              ogimageUrl: '',
              description: '',
              tagsCSV: '',
              section: '',
              author: '',
            }
          }
        }

        $scope.subjectSearch = function(query) {
          return $http.get('/api/LMS/subject/?limit=10&title__icontains=' + query).
          then(function(response) {
            return response.data.results;
          })
        };

        $scope.cancel = function() {
          $uibModalInstance.dismiss('Cancel')
        }

        $scope.save = function() {
          console.log($scope.paperGroupForm);
          var f = $scope.paperGroupForm
          if (f.title.length == 0 || f.description.length == 0) {
            Flash.create('danger', 'All Fields Are Required')
            return
          }
          if (f.subject.pk == undefined) {
            Flash.create('danger', 'Please Select Proper Subject')
            return
          }

          if (f.blogData.ogimage == emptyFile && (f.blogData.ogimageUrl == '' || f.blogData.ogimageUrl == undefined)) {
            Flash.create('danger', 'Either the OG image file OR og image url is required')
            return;
          }
          if (f.blogData.tagsCSV == '' || f.blogData.section == '' || f.blogData.author == '' || f.blogData.description == '') {
            Flash.create('danger', 'Please check the All SEO related fields');
            return;
          }

          var toSend = {
            title: f.title,
            description: f.description,
            subject: f.subject.pk
          }
          var method = 'POST'
          var url = '/api/LMS/paperGroup/'
          if (f.pk != undefined) {
            method = 'PATCH'
            url += f.pk + '/'
          }
          $http({
            method: method,
            url: url,
            data: toSend,
          }).
          then(function(response) {
            // Flash.create('success', 'Saved Successfully')
            $scope.paperGroupForm.pk = response.data.pk
            var f = $scope.paperGroupForm
            var fd = new FormData();
            if (f.blogData.ogimage != emptyFile && typeof f.blogData.ogimage != 'string' && f.blogData.ogimage != null) {
              fd.append('ogimage', f.blogData.ogimage);
            } else {
              fd.append('ogimageUrl', f.blogData.ogimageUrl);
            }
            fd.append('contentType', 'paperGroup');
            fd.append('title', f.blogData.title);
            fd.append('shortUrl', f.blogData.shortUrl);
            fd.append('description', f.blogData.description);
            fd.append('tagsCSV', f.blogData.tagsCSV);
            fd.append('section', f.blogData.section);
            fd.append('author', f.blogData.author);
            fd.append('header', response.data.pk)
            var method = 'POST';
            var url = '/api/PIM/blog/';
            if (f.blogData.pk) {
              method = 'PATCH';
              url += f.blogData.pk + '/';
            }
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
              $scope.paperGroupForm.blogData = response.data
              Flash.create('success', 'Saved Successfully')
              $uibModalInstance.dismiss($scope.paperGroupForm)
            });
          })
        }
      },
    }).result.then(function(a) {

    }, function(a) {
      console.log(a);
      if (a.pk != undefined) {
        $scope.form.group = a
      }
    });
  }

  $scope.fetchQuestions = function() {

    // if (typeof $scope.form.topic != 'object') {
    //   return;
    // }
    if ($scope.form.typ == 'book') {
      var url = '/api/LMS/question/?bookSection=' + $scope.form.section.pk + '&ques__contains=' + $scope.form.text
    } else {
      var url = '/api/LMS/question/?topic=' + $scope.form.topic.pk + '&ques__contains=' + $scope.form.text
    }
    $http({
      method: 'GET',
      url: url
    }).
    then(function(response) {
      $scope.questions.length = 0
      angular.forEach(response.data, function(obj) {
        $scope.questions.push({
          'ques': obj
        })
      })
      console.log($scope.questions);
    })
  }

  $scope.subjectSearch = function(query) {
    return $http.get('/api/LMS/subject/?title__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.topicSearch = function(query) {
    return $http.get('/api/LMS/topic/?title__contains=' + query + '&subject=' + $scope.form.subject.pk).
    then(function(response) {
      return response.data;
    })
  };

  $scope.bookSearch = function(query) {
    return $http.get('/api/LMS/book/?title__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.sectionSearch = function(query) {
    return $http.get('/api/LMS/section/?title__contains=' + query + '&book=' + $scope.form.book.pk).
    then(function(response) {
      return response.data;
    })
  };

  $scope.add = function() {
    $scope.title = false;
    for (var i = 0; i < $scope.questions.length; i++) {
      console.log($scope.questions[i])
      if ($scope.questions[i].selected) {
        $scope.selectedquestions.push({
          'ques': $scope.questions[i].ques,
          'marks': 1,
          'negativeMarks': 0.25,
          'optional': false
        })
      }
    }
  };


  $scope.delete = function(indx) {
    $scope.selectedquestions.splice(indx, 1)
  }

  console.log($scope.form.description, 'eeee');
  $scope.save = function() {

    if ($scope.form.group.pk == undefined) {
      Flash.create('danger', 'Please Select Proper Paper Group')
      return
    }

    if (!$scope.form.name.length) {
      Flash.create('danger', 'Add Question Paper Title')
      return
    }

    if (!$scope.form.description) {
      Flash.create('danger', 'Add Question Paper description')
      return
    }

    var toSend = []
    for (var i = 0; i < $scope.selectedquestions.length; i++) {
      console.log($scope.selectedquestions[i])
      var data = {
        ques: $scope.selectedquestions[i].ques.pk,
        marks: $scope.selectedquestions[i].marks,
        optional: $scope.selectedquestions[i].optional,
        negativeMarks: $scope.selectedquestions[i].negativeMarks,
      }
      toSend.push(data)
    }
    if ($scope.mode == 'edit') {
      var method = 'PATCH';
      var url = '/api/LMS/paper/' + $scope.tab.data.paper.pk + '/';
      $http({
        method: method,
        url: url,
        data: {
          questions: toSend,
          name: $scope.form.name,
          timelimit: $scope.form.timelimit,
          group: $scope.form.group.pk,
          description: $scope.form.description,
          level: $scope.form.level
        }
      }).
      then(function(response) {
        Flash.create('success', 'Question Paper Updated');
        console.log(response.data);
      })
    } else {
      var method = 'POST';

      $http({
        method: method,
        url: '/api/LMS/paper/',
        data: {
          questions: toSend,
          name: $scope.form.name,
          timelimit: $scope.form.timelimit,
          group: $scope.form.group.pk,
          description: $scope.form.description,
          level: $scope.form.level
        }
      }).
      then(function(response) {
        Flash.create('success', 'Question Paper Created');
        resetForm();
      }, function(response) {
        Flash.create('warning', 'Add Question Paper Title ');
      });


    }

  };






});






// app.controller('home.LMS.evaluation', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
//   // settings main page controller
//
//   $scope.data = {
//     tableData: []
//   };
//
//   views = [{
//     name: 'list',
//     icon: 'fa-th-large',
//     template: '/static/ngTemplates/genericTable/genericSearchList.html',
//     itemTemplate: '/static/ngTemplates/home.LMS.evaluation.item.html',
//   }, ];
//
//   var options = {
//     main: {
//       icon: 'fa-pencil',
//       text: 'edit'
//     },
//   };
//
//   $scope.config = {
//     views: views,
//     url: '/api/LMS/evaluation/',
//     searchField: 'item',
//     itemsNumPerView: [12, 24, 48],
//   }
//
//
//   $scope.tableAction = function(target, action, mode) {
//     console.log(target, action, mode);
//     console.log($scope.data.tableData);
//
//     if (action == 'edit') {
//       for (var i = 0; i < $scope.data.tableData.length; i++) {
//         if ($scope.data.tableData[i].pk == parseInt(target)) {
//           $scope.addTab({
//             title: 'Edit Asset : ' + $scope.data.tableData[i].pk,
//             cancel: true,
//             app: 'editAsset',
//             data: {
//               pk: target,
//               asset: $scope.data.tableData[i]
//             },
//             active: true
//           })
//         }
//       }
//     }
//   }
//
//   $scope.tabs = [];
//   $scope.searchTabActive = true;
//
//   $scope.closeTab = function(index) {
//     $scope.tabs.splice(index, 1)
//   }
//
//   $scope.addTab = function(input) {
//     console.log(JSON.stringify(input));
//     $scope.searchTabActive = false;
//     alreadyOpen = false;
//     for (var i = 0; i < $scope.tabs.length; i++) {
//       if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
//         $scope.tabs[i].active = true;
//         alreadyOpen = true;
//       } else {
//         $scope.tabs[i].active = false;
//       }
//     }
//     if (!alreadyOpen) {
//       $scope.tabs.push(input)
//     }
//   }
// })
