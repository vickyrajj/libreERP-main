app.config(function($stateProvider) {
  $stateProvider.state('home.courses', {
    url: "/courses",
    templateUrl: '/static/ngTemplates/app.LMS.courses.html',
    controller: 'home.LMS.courses'
  });
});

app.controller("home.LMS.courses", function($scope, $state, $users, $stateParams, $http, Flash, $timeout) {


  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.course.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/LMS/course/',
    searchField: 'title',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode, );
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Course :';
          var appType = 'courseEditor';
        } else if (action == 'details') {
          var title = 'Details :';
          var appType = 'courseExplorer';
        }


        $scope.addTab({
          title: title + $scope.data.tableData[i].title,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            course: $scope.data.tableData[i]
          },
          active: true
        })
      }
    }

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

app.controller("home.LMS.courses.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $aside, $rootScope) {

  $http({
    method: 'GET',
    url: '/api/PIM/blog/?contentType=book&&header=' + $scope.dataPK,
  }).
  then(function(response) {
    console.log($scope.dataPK);
    if (response.data.length > 0) {
      console.log('editttttt');
      $scope.blogType = 'edit'
      $scope.blogData = response.data[0]
    } else {
      console.log('newwwwwwwwww');
      $scope.blogType = 'new'
      $scope.blogData = {}
    }
  })

  $scope.blogPopup = function(bookId) {
    console.log('-------------dasdsad');
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMS.book.blogForm.html',
      size: 'md',
      backdrop: true,
      resolve: {
        blogData: function() {
          return $scope.blogData;
        },
        bookId: function() {
          return bookId;
        },
      },
      controller: function($scope, blogData, bookId, $uibModalInstance) {
        console.log('bbbbbbbbb', blogData, bookId);

        if (blogData.pk) {
          $scope.blogForm = blogData
        } else {
          $scope.blogForm = {
            contentType: 'course',
            tags: [],
            ogimage: emptyFile,
            ogimageUrl: '',
            description: '',
            tagsCSV: '',
            section: '',
            author: ''
          }
        }
        console.log($scope.blogForm);
        $scope.cancelBlog = function() {
          $uibModalInstance.dismiss()
        }
        $scope.saveBlog = function() {
          console.log('clickedddddddddddddddddd');
          console.log($scope.blogForm);

          var tags = [];
          for (var i = 0; i < $scope.blogForm.tags.length; i++) {
            tags.push($scope.blogForm.tags[i].pk)
          }

          var fd = new FormData();

          if ($scope.blogForm.ogimage == emptyFile && ($scope.blogForm.ogimageUrl == '' || $scope.blogForm.ogimageUrl == undefined)) {
            Flash.create('danger', 'Either the OG image file OR og image url is required')
            return;
          }
          if ($scope.blogForm.tagsCSV == '' || $scope.blogForm.section == '' || $scope.blogForm.author == '' || $scope.blogForm.description == '') {
            Flash.create('danger', 'Please check the All SEO related fields');
            return;
          }

          if ($scope.blogForm.ogimage != emptyFile && typeof $scope.blogForm.ogimage != 'string' && $scope.blogForm.ogimage != null) {
            fd.append('ogimage', $scope.blogForm.ogimage);

          } else {
            fd.append('ogimageUrl', $scope.blogForm.ogimageUrl);
          }


          fd.append('tagsCSV', $scope.blogForm.tagsCSV);
          fd.append('section', $scope.blogForm.section);
          fd.append('author', $scope.blogForm.author);
          fd.append('description', $scope.blogForm.description);
          fd.append('header', '1')
          fd.append('contentType', 'course');
          fd.append('tags', tags);

          if ($scope.blogForm.pk) {
            method = 'PATCH';
            url = '/api/PIM/blog/' + $scope.blogForm.pk + '/';
          } else {
            method = 'POST';
            url = '/api/PIM/blog/';
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
            if ($scope.blogForm.pk) {
              Flash.create('success', 'Updated');
            } else {
              Flash.create('success', 'Created');
            }
            $uibModalInstance.dismiss(response.data)
          });

        }

      },
    }).result.then(function() {

    }, function(reason) {

      if (reason != undefined) {
        $scope.blogType = 'edit'
        $scope.blogData = reason
      }

    });
  }

  $scope.course = $scope.tab.data.course;

  $scope.activeTab = 0;

  $scope.tabs = [{
      name: 'File',
      active: true,
      icon: 'file-o'
    },
    {
      name: 'Video',
      active: false,
      icon: 'video-camera'
    },
    {
      name: 'Presentation',
      active: false,
      icon: 'file-powerpoint-o'
    },
    {
      name: 'Homework',
      active: false,
      icon: 'question-circle-o'
    },
    {
      name: 'Announcement',
      active: false,
      icon: 'bullhorn'
    },
    {
      name: 'Notes',
      active: false,
      icon: 'sticky-note-o'
    },
  ]

  $scope.enrollmentForm = {
    user: undefined
  }

  $scope.addEnrollment = function() {
    if ($scope.enrollmentForm.user == undefined || typeof $scope.enrollmentForm.user != 'object') {
      Flash.create('warning', 'Please select a user first');
      return;
    }


    for (var i = 0; i < $scope.course.enrollments.length; i++) {
      if ($scope.course.enrollments[i].user == $scope.enrollmentForm.user.pk) {
        Flash.create('danger', 'User already enrolled for this course');
        return;
      }
    }

    var toSend = {
      user: $scope.enrollmentForm.user.pk,
      course: $scope.course.pk
    }

    $http({
      method: 'POST',
      url: '/api/LMS/enrollment/',
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Added')
      $scope.enrollmentForm.user = undefined;
      $scope.course.enrollments.push(response.data);
    })

  }

  $scope.studyMaterialForm = {
    attachment: emptyFile
  }

  $scope.saveFile = function() {
    if ($scope.studyMaterialForm.attachment == emptyFile) {
      Flash.create('warning', 'No file selected');
      return;
    }

    var fd = new FormData();

    fd.append('attachment', $scope.studyMaterialForm.attachment)
    fd.append('course', $scope.course.pk)
    if ($scope.activeTab == 0) {
      fd.append('typ', 'file')
    } else {
      fd.append('typ', 'video')
    }

    $http({
      method: 'POST',
      url: '/api/LMS/studyMaterial/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      $scope.course.studyMaterials.push(response.data);
      Flash.create('success', 'File added');
    })

  }

  // $scope.open = function () {
  //   console.log('opening pop up');
  //   var modalInstance = $modal.open({
  //     // templateUrl: 'popup.html',
  //   });
  // }

  //------------fetch books
  // $scope.booksdata = [];
  $http({
    method: 'GET',
    url: '/api/LMS/bookcoursemap/?course=' + $scope.course.pk
  }).then(function(response) {
    // $scope.booksdata.push(response.data);
    $scope.bdata = response.data;
  })


  //-------------adding books
  $scope.addBook = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMs.course.bookUpload.html',
      size: 'md',
      backdrop: true,
      resolve: {
        data: function() {
          return $scope.course;
        }
      },
      controller: function($scope, $uibModalInstance, data) {
        $scope.bookSearch = function(query) {
          return $http.get('/api/LMS/book/?title__contains=' + query).
          then(function(response) {
            return response.data;
          })
        };

        $scope.saveBook = function() {
          var url = '/api/LMS/bookcoursemap/'
          var method = 'POST';
          var toSend = {
            book: $scope.form.book.pk,
            course: data.pk,
            referenceBook: $scope.form.referencebook,
          }
          $http({
            method: method,
            url: url,
            data: toSend
          }).
          then(function(response) {
              // console.log(response);
              Flash.create('success', 'Book Added successfully');
              $uibModalInstance.dismiss(response.data);
            },
            function(error) {
              // console.log(error, '-----err');
              Flash.create('danger', 'Book is already added,choose a diffrent book');
            })
        }
      }, //controller ends
    }).result.then(function(f) {

    }, function(f) {
      $scope.bdata.push(f)
      // console.log(f, '--------pushed');
    });
  } //addbookfunction ends


  //-------fetch note
  $http({
    method: 'GET',
    url: '/api/LMS/note/'
  }).then(function(response) {
    $scope.noteData = response.data;
  })
  //---------adding notes
  $scope.addNotes = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMs.course.notesUpload.html',
      size: 'md',
      backdrop: true,
      controller: function($scope, $uibModalInstance) {
        $scope.saveNote = function() {
          var fd = new FormData();
          fd.append('title', $scope.form.title);
          fd.append('description', $scope.form.description);
          fd.append('urlSuffix', $scope.form.url);
          fd.append('image', $scope.form.image);

          $http({
            method: 'POST',
            url: '/api/LMS/note/',
            data: fd,
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            Flash.create('success', 'Added Notes successfully')
            $uibModalInstance.dismiss(response.data);
          })
        }
      }, //controller ends
    })
  } //addnotesfunction ends


  //-----notesection
  $scope.noteSection = function(indx) {
    // console.log(pk);
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMs.course.noteSection.html',
      size: 'md',
      backdrop: true,
      resolve: {
        data: function() {
          return $scope.noteData[indx];
        }
      },
      controller: function($scope, $uibModalInstance, data) {
        $scope.reset = function() {
          $scope.form = {
            txt: '',
            image: emptyFile,
            mode: false
          }
        }
        $scope.reset();
        $scope.notevalues = data.title;
        $scope.saveNoteSection = function() {
          console.log('ccccccclllll----in');
          var fd = new FormData();
          if ($scope.form.mode) {
            fd.append('note', data.pk);
            fd.append('txt', $scope.form.noteTxt);
            fd.append('mode', 'text');
            if ($scope.form.noteTxt == '') {
              return;
            }
          } else {
            fd.append('note', data.pk);
            fd.append('image', $scope.form.noteImage);
            fd.append('mode', 'image');
          }
          var method = 'POST'
          var url = '/api/LMS/notesection/'
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
            $scope.reset();
          })
        }
      }, //controller ends
    })
  } //notesection function ends

  $scope.noteInfo = function(indx) {
    $aside.open({
      templateUrl: '/static/ngTemplates/app.Lms.course.note.explore.html',
      placement: 'left',
      size: 'xl',
      backdrop: true,
      resolve: {
        data: function() {
          return $scope.noteData[indx];
        },
      },
      controller: function($scope, data) {
        $scope.note = data;
        $http({
          method: 'GET',
          url: '/api/LMS/notesection/?note=' + data.pk
        }).then(function(response) {
          $scope.nSection = response.data;
        })
      }

    })

  }
  //------fetch announcements
  $http({
    method: 'GET',
    url: '/api/LMS/announcement/'
  }).then(function(response) {
    $scope.announcements = response.data;
    // console.log($scope.announcements, '----------repspspsppspspsps');
  })
  $rootScope.paperSearch = function(query) {
    //search for the paper
    return $http.get('/api/LMS/paper/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $rootScope.getPaper = function(paper) {
    if (typeof paper == 'undefined') {
      return;
    }
    return paper.name;
  }

  $rootScope.userSearch = function(query) {
    //search for the user
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $rootScope.getUserName = function(user) {
    if (typeof user == 'undefined') {
      return;
    }
    return user.first_name + '  ' + user.last_name;
  }

  //---------adding announcements
  $scope.announce = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMs.course.announcement.form.html',
      size: 'lg',
      backdrop: true,
      controller: function($scope, $uibModalInstance) {

        $scope.reset = function() {
          $scope.form = {
            typ: 'general',
            notificationType: 'sms&email',
            messageTxt: '',
          }
        }
        $scope.reset();


        //-----save announcements
        $scope.saveAnnouncement = function() {
          $scope.me = $users.get('mySelf');

          var toSend = {
            typ: $scope.form.typ,
            announcer: $scope.me.pk,
            notification: $scope.form.notificationType,
            txt: $scope.form.messageTxt,
          }


          if ($scope.form.typ == 'general') {
            console.log('in general');
          } else {
            if ($scope.form.typ == 'quiz') {
              toSend.paper = $scope.form.paper.pk
              console.log($scope.form.paperDueDate, '------dddateee');
              if ($scope.form.time != undefined && $scope.form.paperDueDate != undefined) {
                toSend.time = $scope.form.time
                toSend.paperDueDate = $scope.form.paperDueDate.toJSON().split('T')[0]
              } else {
                Flash.create('danger', 'Fill all the Fileds');
                return;
              }
            } else if ($scope.form.typ == 'onlineclass') {
              toSend.meetingId = $scope.form.meetId
              if ($scope.form.time != undefined && $scope.form.date != undefined) {
                toSend.time = $scope.form.time
                toSend.date = $scope.form.date
              } else {
                Flash.create('danger', 'Fill all the Fileds');
                return;
              }
            } else if ($scope.form.typ == 'class') {
              toSend.venue = $scope.form.classVenue
              if ($scope.form.classTime != undefined && $scope.form.classDate != undefined) {
                toSend.date = $scope.form.classDate
                toSend.time = $scope.form.classTime
              } else {
                Flash.create('danger', 'Fill all the Fileds');
                return;
              }
            } else {
              toSend.venue = $scope.form.quizVenue
              if ($scope.form.quizTime != undefined && $scope.form.quizDate != undefined) {
                toSend.date = $scope.form.quizDate
                toSend.time = $scope.form.quizTime
              } else {
                Flash.create('danger', 'Fill all the Fileds');
                return;
              }

            }
          }
          $http({
            method: 'POST',
            url: '/api/LMS/announcement/',
            data: toSend,
          }).
          then(function(response) {
            Flash.create('success', 'Saved Successfully')
            $uibModalInstance.dismiss(response.data);
            $scope.reset();
          })
        }
      }, //controller ends
    }).result.then(function(a) {

    }, function(a) {
      // console.log(a,typeof a);
      if (typeof a == 'object') {
        $scope.announcements.push(a)
      }
    });
  } //-------------announcement ends



  //----------fetch homework-------------
  $http({
    method: 'GET',
    url: '/api/LMS/homework/?course=' + $scope.course.pk
  }).then(function(response) {
    $scope.homwrkData = response.data;
  })
  //-----------adding homewoks
  $scope.homework = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMs.course.homework.form.html',
      size: 'md',
      backdrop: true,
      resolve: {
        data: function() {
          return $scope.course;
        }
      },
      controller: function($scope, $uibModalInstance, data) {
        $scope.saveHomework = function() {
          console.log('ccccccclllll----in-----homeeeeee save', data.pk, '-----------', $scope.form.paper.pk);
          var fd = new FormData();
          fd.append('course', data.pk);
          fd.append('paper', $scope.form.paper.pk);
          fd.append('comment', $scope.form.comment);
          fd.append('pdf', $scope.form.pdf);
          var method = 'POST'
          var url = '/api/LMS/homework/'
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
            Flash.create('success', 'Saved Successfully');
            $uibModalInstance.dismiss(response.data);

          })
        }

      }, //controller ends
    }).result.then(function(h) {

    }, function(h) {
      if (typeof h == 'object') {
        $scope.homwrkData.push(h)
      }
    })
  }
  //homework ends------------

});

app.controller("home.LMS.courses.form", function($scope, $state, $users, $stateParams, $http, Flash) {


  $scope.resetForm = function() {
    $scope.form = {
      topic: '',
      enrollmentStatus: 'open',
      description: '',
      dp: emptyFile,
      TAs: [],
      instructor: undefined,
      title: ''
    };
  }

  if (typeof $scope.tab == 'undefined') {
    $scope.mode = 'new';
    $scope.resetForm()
  } else {
    $scope.mode = 'edit';
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
    console.log($scope.form);
  }

  $scope.topicSearch = function(query) {
    return $http.get('/api/LMS/topic/?limit=15&title__contains=' + query).
    then(function(response) {
      return response.data.results;
    })
  };

  $scope.getName = function(topic) {
    if (typeof topic != 'object') {
      return;
    }
    return topic.title + '  (' + topic.subject.title + ')';
  }

  $scope.userSearch = function(query) {
    //search for the user
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.getInstructor = function(user) {
    if (typeof user == 'undefined') {
      return;
    }
    return user.first_name + '  ' + user.last_name;
  }


  $scope.saveCourse = function() {
    if ($scope.mode == 'new') {
      var method = 'POST'
      var url = '/api/LMS/course/'
    } else {
      var method = 'PATCH'
      var url = '/api/LMS/course/' + $scope.form.pk + '/'
    }
    var fd = new FormData();
    fd.append('title', $scope.form.title);
    fd.append('topic', $scope.form.topic.pk);
    fd.append('enrollmentStatus', $scope.form.enrollmentStatus);
    fd.append('description', $scope.form.description);
    fd.append('dp', $scope.form.dp);
    fd.append('TAs', $scope.form.TAs);
    fd.append('instructor', $scope.form.instructor.pk);
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
      if (response.config.method) {
        Flash.create('success', 'Updated Course successfully')
      } else {
        Flash.create('success', 'Created Course successfully')
      }
      if ($scope.mode == 'new') {
        $scope.resetForm();
      }
    })

  }


});
