var app = angular.module('myApp', ['ui.bootstrap', 'ngAudio', 'ngRating']);

app.config(function($httpProvider) {

  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;

});

var emptyFile = new File([""], "");

app.directive('fileModel', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function() {
        scope.$apply(function() {
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);


app.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if (event.which === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});


app.controller('myCtrl1', function($scope, $rootScope, $timeout, $uibModal, $interval, $http, ngAudio) {

  $scope.attachMessageFile = function() {
    $('#messageFile').click()
  }

  $scope.sound = ngAudio.load("/static/audio/tutorWelcome_student.mp3");
  $scope.sound.play();

  $scope.messageFile = emptyFile;

  $scope.$watch('messageFile', function(newValue, oldValue) {
    if (newValue != emptyFile) {
      var fd = new FormData();
      fd.append('session', $scope.roomID);
      fd.append('sender', $scope.pk);
      fd.append('attachment', $scope.messageFile);

      $http({
        method: 'POST',
        url: '/api/tutors/tutors24Message/',
        data: fd,
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).
      then(function(response) {


        $scope.messages.push({
          'sendByMe': true,
          'message': response.data.attachment,
          'created': new Date()
        });

        $scope.connection.session.publish($scope.roomID, ['chatStudent', new Date(), response.data.attachment], {}, {
          acknowledge: true
        }).
        then(function(publication) {
          console.log("Attachment dent");
        });

      })
    };
  })


  $scope.dp = '/static/images/userIcon.png';

  $http({
    method: 'GET',
    url: '/api/HR/users/?mode=mySelf&format=json'
  }).
  then(function(response) {
    console.log('res', response);
    $scope.profile = response.data[0].profile;
    $scope.pk = response.data[0].pk;
    $scope.name = response.data[0].first_name + ' ' + response.data[0].last_name;
    if ($scope.profile.displayPicture != null) {
      $scope.dp = $scope.profile.displayPicture;
    }
  })


  $scope.data = {
    "objects": []
  };
  $scope.dataForRefresh = [];
  $scope.grids = ['plain', 'math', 'english'];
  $scope.gridIndex = 0;
  $scope.tutorMsg = [];
  $scope.studMsg = [];
  $scope.messages = [];
  $scope.teacherName = 'Vikas Motla';
  $scope.teacherId = '22134';
  $scope.averageRating = 5;
  $scope.heightCount = 0;


  $scope.roomID = window.location.href.split('?session=')[1];
  // $scope.roomID = '123';

  $scope.calculateTime = function() {
    $scope.timeMins = parseInt($scope.inSecs / 60);
    $scope.timeSecs = parseInt($scope.inSecs % 60);

    // console.log($scope.timeMins, $scope.timeSecs);

  }


  $timeout(function() {
    $http({
      method: 'GET',
      url: '/api/tutors/tutors24Session/' + $scope.roomID + '/'
    }).
    then(function(response) {
      console.log(response.data);

      if (response.data.minutes != null) {
        $interval(function() {
          alert('Your session already ended, Please close this window');
          $scope.connection.close();
        }, 3000);
      }

      if (!response.data.started) {
        $http({
          method: 'PATCH',
          url: '/api/tutors/tutors24Session/' + $scope.roomID + '/',
          data: {
            started: true
          }
        }).then(function(response) {

        })
      }

      $interval(function() {
        $http({
          method: 'PATCH',
          url: '/api/tutors/tutors24Session/' + $scope.roomID + '/',
          data: {
            end: new Date()
          }
        }).then(function(response) {})
      }, 90000)

      $scope.sessionObj = response.data;
      var start = new Date($scope.sessionObj.start);
      var now = new Date();

      $scope.inSecs = (now.getTime() - start.getTime()) / 1000;

      $interval(function() {
        $scope.inSecs += 1;
        $scope.calculateTime();
      }, 1000)

      $http({
        method: 'GET',
        url: '/api/HR/userSearch/' + response.data.tutor + '/'
      }).
      then(function(response) {
        $scope.teacher = response.data;
        if ($scope.teacher.profile.displayPicture == null) {
          $scope.teacher.profile.displayPicture = '/static/images/userIcon.png';
        }
      })

    })
  }, 10000)



  $scope.oldTime = 0;
  $scope.endSessionTime = 0;


  $scope.dataVariables = {
    isEndSession: false,
    newMsg: 0,
    onlineStatus: true,
    disconnectModalOpen: false,
    isConnected: false,
    sendObjectsData: true,
    sendImageData: false,
    isImageSet: true,
    sendHeight: true
  };


  window.onfocus = function() {
    $scope.dataVariables.isWindowActive = true;
    $scope.dataVariables.newMsg = 0;
    document.title = "Student Home";
  };

  window.onblur = function() {
    $scope.dataVariables.isWindowActive = false;
  };

  $interval(function() {
    if (!$scope.dataVariables.isWindowActive) {
      if ($scope.dataVariables.newMsg >= 1) {
        document.title = $scope.dataVariables.newMsg + ' New Message';
      }
    }
  }, 1000)


  $('.dropdown-toggle').dropdown();


  $scope.addFile = function() {

    console.log("will add file");
    $('#filePicker').click();

  }

  $scope.form = {
    'image': emptyFile
  }

  document.getElementById('filePicker').onchange = function(e) {


    var tosend = new FormData();
    if (e.target.files[0] != emptyFile && e.target.files[0] != null) {
      console.log('coming here....');
      tosend.append('image', e.target.files[0])
    }

    console.log("to send ", tosend);

    $http({
      method: 'POST',
      url: '/api/tutors/tutors24Image/',
      data: tosend,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      var imgUrl = response.data.image;
      var scaledImage = imgUrl;//  imgUrl.replace("."  + imgUrl.split('.').pop()  , '_scaled.' + imgUrl.split('.').pop());
      $scope.addImage(scaledImage);

    })


    $scope.canvas.isDrawingMode = false;
  }


  $scope.handleRemoteContent = function(args) {
    if (!args[0]) {
      console.log("inside null");
      $scope.data = {
        "objects": []
      };
      $scope.redraw();
    } else if (args[0] == 'increaseHeight') {
      // console.log('incresing canvas height');
      $scope.dataVariables.sendHeight = false;
      $scope.increaseCanvas();
    } else if (args[0] == 'chatTeacher') {
      $scope.messageCame(args[1], args[2]);
    } else if (args[0] == 'online') {
      $scope.isOnline(args[1]);
    } else if (args[0] == 'sendAllData') {
       $scope.sendAllData();
    } else if (args[0] == 'allData') {
      $scope.gridType = args[1];
      $scope.addDataOnRefresh(args[2]);
    } else if (args[0] == 'image') {
      $scope.imageFromOther(args[1]);
    } else if (args[0] == 'changeGridType') {
      $scope.gridType = args[1];
      $scope.gridIndex = args[2];
      $scope.dataVariables.sendObjectsData = false;
      $scope.dataVariables.sendImageData = false;
      $scope.redraw();
    } else {
      $scope.dataFromOther(args[0]);
      // $scope.data['objects'].push(args[0]);
    }

  }


  $scope.connection = new autobahn.Connection({
    url: 'wss://ws.cioc.in:443/ws',
    realm: 'default'
  });

  $scope.connection.onopen = function(session) {
    $scope.dataVariables.isConnected = true;
    console.log("Connected")

    $scope.connection.session.subscribe($scope.roomID, $scope.handleRemoteContent).then(
      function(sub) {
        console.log("subscribed to", $scope.roomID);

        //just subscribed , then send a message to the other party to send all the data on canas to me
        $scope.connection.session.publish($scope.roomID, ['sendAllData'], {}, {
          acknowledge: true
        }).
        then(function(publication) {
          console.log("Published");
        });


      },
      function(err) {
        console.log("failed to subscribed: " + err);
      }
    );

  }


  $scope.connection.open();

  // $scope.showFeedback = function () {
  //   console.log('show feedback...');
  //   $rootScope.$emit('clicked', {
  //     deal:'feedback'
  //   });
  // }


  $scope.openpopup = function() {

    console.log('open popup');
    // console.log('Ismodal open..', $scope.dataVariables.disconnectModalOpen);
    $scope.endSessionTime++;

    if ($scope.endSessionTime > 3) {
      $scope.dataVariables.isEndSession = true;
      console.log('end this session....');
    }

    if ($scope.dataVariables.disconnectModalOpen) {
      return;
    }

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.public.student.disconnectModal.html',
      resolve: {
        data: function() {
          return $scope.dataVariables;
        }
      },
      backdrop: 'static',
      controller: function($scope, $rootScope, data, $timeout, $uibModalInstance) {
        $scope.dataVariables = data;

        $rootScope.$on('tutorBackOnline', function(evt, data) {
          console.log('tutorBackOnline......');
          // console.log(evt, data);
          $uibModalInstance.dismiss();
        });

        $scope.endSession = function() {
          $uibModalInstance.dismiss('end');
        }
      }

    }).result.then(function(succ) {
      console.log(succ);
    }, function(reason) {
      console.log(reason);
      if (reason == 'end') {
        $scope.showFeedbackForm();
      }
    });

    $scope.dataVariables.disconnectModalOpen = true;
  }

  $scope.showFeedbackForm = function() {
    $scope.feedBack = $uibModal.open({
      templateUrl: '/static/ngTemplates/app.public.student.feedback.html',
      resolve: {
        roomID: function() {
          return $scope.roomID;
        },
        mins: function() {
          return $scope.timeMins;
        }
      },
      backdrop: 'static',
      controller: function($scope, $rootScope, roomID, $http, mins) {


        $scope.mode = 'feedback';
        $scope.roomID = roomID;
        $scope.form = {
          rating: 1,
          feedbackText: ''
        }
        $scope.save = function() {

          var toSend = $scope.form;
          toSend.minutes = mins;

          $http({
            url: '/api/tutors/tutors24Session/' + $scope.roomID + '/',
            method: 'PATCH',
            data: toSend
          }).
          then(function(response) {
            $scope.mode = 'thankyou';
            window.location = "https://24tutors.com/ERP/#/studentHome"
          })
        }
      }
    })
  }

  $scope.changeGrid = function() {
    $scope.dataVariables.sendObjectsData = false;
    $scope.dataVariables.sendImageData = false;
    $scope.gridIndex++;
    if ($scope.gridIndex == $scope.grids.length) {
      $scope.gridIndex = 0;
    }
    $scope.gridType = $scope.grids[$scope.gridIndex];

    $scope.redraw();

    $scope.connection.session.publish($scope.roomID, ['changeGridType', $scope.gridType, $scope.gridIndex], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log('grid type sent');
    });
  }


  $scope.isOnline = function(NewHeartBeatTime) {
    $scope.oldTime = NewHeartBeatTime;
  }

  $interval(function() {
    $scope.newTime = new Date().getTime();
    if (($scope.newTime - $scope.oldTime) <= 10000) {
      $scope.dataVariables.onlineStatus = true;
      $scope.endSessionTime = 0;
      $scope.dataVariables.isEndSession = false;
      if ($scope.dataVariables.disconnectModalOpen) {
        console.log('close modal.....');
        // broadcast
        $rootScope.$broadcast('tutorBackOnline', {});
        $scope.dataVariables.disconnectModalOpen = false;
      }

    } else {
      $scope.dataVariables.onlineStatus = false;
      // console.log($scope.onlineStatus);
      $scope.openpopup();
    }
  }, 10000);


  $interval(function() {
    $scope.connection.session.publish($scope.roomID, ['online', new Date().getTime()], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Heart Beat sent...");
    });
  }, 5000);

  $scope.messageCame = function(timestamp, msgTutor) {
    $scope.dataVariables.newMsg++;
    console.log('message from tutor', msgTutor);
    $scope.tutorMsg.push(msgTutor);
    $scope.messages.push({
      'sendByMe': false,
      'message': msgTutor,
      'created': timestamp
    });
  }

  $scope.enterStudentMsg = function() {
    $scope.studMsg.push($scope.studentText);
    $scope.messages.push({
      'sendByMe': true,
      'message': $scope.studentText,
      'created': new Date()
    });
    $scope.connection.session.publish($scope.roomID, ['chatStudent', new Date(), $scope.studentText], {}, {
      acknowledge: true
    }).
    then(function(publication) {


    });

    var toSend = {
      session: $scope.roomID,
      msg: $scope.studentText,
      sender: $scope.pk,
    }
    $http({
      method: 'POST',
      url: '/api/tutors/tutors24Message/',
      data: toSend
    })

    $scope.studentText = '';
  }

  $scope.imageFromOther = function(dataOfImage) {
    $scope.dataVariables.sendImageData = false;
    $scope.dataVariables.sendObjectsData = false;

    url = dataOfImage.imageURL;


    fabric.Image.fromURL(url, function(Img) {
      Img.setLeft(dataOfImage.imageLeft);
      Img.setTop(dataOfImage.imageTop);


      $scope.images.push(Img);

      $scope.redraw();

    });
  }

  $scope.addDataOnRefresh = function(dataToAddOnRefresh) {

    $scope.dataToAdd = JSON.parse(dataToAddOnRefresh);
    $scope.dataForRefresh = $scope.dataToAdd;

    for (var i = 0; i < $scope.dataToAdd.length; i++) {
      if ($scope.dataToAdd[i].type=='path') {

        $scope.path1 = new fabric.Path('M 0 0 L 50 0 z', {
          left: 0,
          top: 0,
          originX:$scope.dataToAdd[i].originX,
          originY:$scope.dataToAdd[i].originY,
          stroke: $scope.dataToAdd[i].stroke,
          strokeWidth: $scope.dataToAdd[i].strokeWidth,
          fill: $scope.dataToAdd[i].fill,
          strokeLineCap: $scope.dataToAdd[i].strokeLineCap,
          selectable: false,
          hasBorders:false,
          hasControls:false,
          lockMovementX:true,
          lockMovementY:true,
        });

        $scope.path1.path = $scope.dataToAdd[i].path;
        $scope.all.push($scope.path1);

      }
      else if ($scope.dataToAdd[i].type=='rect') {
          $scope.rect2 = new fabric.Rect({
            left: $scope.dataToAdd[i].left,
            top: $scope.dataToAdd[i].top,
            fill: $scope.dataToAdd[i].fill,
            width: $scope.dataToAdd[i].width,
            height: $scope.dataToAdd[i].height,
            stroke: $scope.dataToAdd[i].stroke,
            strokeWidth: $scope.dataToAdd[i].strokeWidth,
            selectable: false,
            hoverCursor: 'default'
          });
          // "add" rectangle onto canvas
          $scope.all.push($scope.rect2);
      }
      else if ($scope.dataToAdd[i].type=='circle') {
          $scope.cir2 = new fabric.Circle({
            left: $scope.dataToAdd[i].left,
            top: $scope.dataToAdd[i].top,
            radius: $scope.dataToAdd[i].radius,
            fill: $scope.dataToAdd[i].fill,
            stroke: $scope.dataToAdd[i].stroke,
            strokeWidth: $scope.dataToAdd[i].strokeWidth,
            selectable: false,
            hoverCursor: 'default'
          });

          $scope.all.push($scope.cir2);
      }
      else if ($scope.dataToAdd[i].type=='triangle') {
          $scope.tri2 = new fabric.Triangle({
            left: $scope.dataToAdd[i].left,
            top: $scope.dataToAdd[i].top,
            originX: $scope.dataToAdd[i].originX,
            originY: $scope.dataToAdd[i].originY,
            width: $scope.dataToAdd[i].width,
            height: $scope.dataToAdd[i].height,
            fill: $scope.dataToAdd[i].fill,
            stroke: $scope.dataToAdd[i].stroke,
            strokeWidth: $scope.dataToAdd[i].strokeWidth,
            selectable: false,
            hoverCursor: 'default'
          });

          $scope.all.push($scope.tri2);
      }
      else if ($scope.dataToAdd[i].type=='i-text') {
          $scope.newText2 = new fabric.IText($scope.dataToAdd[i].text, {
            fontWeight: $scope.dataToAdd[i].fontWeight,
            fontFamily: $scope.dataToAdd[i].fontFamily,
            fontSize: $scope.dataToAdd[i].fontSize,
            top: $scope.dataToAdd[i].top,
            left: $scope.dataToAdd[i].left,
            selectable:false,
            hasBorders:false,
            hasControls:false,
            lockMovementX:true,
            lockMovementY:true,
            timestamp: $scope.dataToAdd[i].timestamp
          });
          $scope.all.push($scope.newText2);

      }
      else {
        var imgRefreshData = $scope.dataToAdd[i];
        fabric.Image.fromURL(imgRefreshData.src, function(imgObject) {
          imgObject.scaleToWidth(imgRefreshData.width);
          imgObject.scaleToHeight(imgRefreshData.height);
          imgObject.set({
            timestamp: imgRefreshData.timestamp,
            top: imgRefreshData.top,
            left: imgRefreshData.left
          });

          $scope.all.push(imgObject);
          $scope.redraw();
        });
      }
    }

    $scope.dataVariables.sendObjectsData = false;
    $scope.dataVariables.sendImageData = false;
    $scope.redraw();
  }

  $scope.dataFromOther = function(objectDataToAdd) {
    var obj = JSON.parse(objectDataToAdd);
    $scope.dataVariables.sendObjectsData = false;
    $scope.dataVariables.sendImageData = false;

    if (obj.type == 'path') {

      $scope.path1 = new fabric.Path('M 0 0 L 50 0 z', {
        left: 0,
        top: 0,
        originX: obj.originX,
        originY: obj.originY,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        fill: obj.fill,
        strokeLineCap: obj.strokeLineCap,
        hasBorders: false,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        selectable: false
      });

      $scope.path1.path = obj.path;
      $scope.all.push($scope.path1);

      $scope.temp = {
        type: $scope.path1.type,
        originX: $scope.path1.originX,
        originY: $scope.path1.originY,
        left: $scope.path1.left,
        top: $scope.path1.top,
        fill: $scope.path1.fill,
        strokeLineCap: $scope.path1.strokeLineCap,
        stroke: $scope.path1.stroke,
        strokeWidth: $scope.path1.strokeWidth,
        pathOffset: $scope.path1.pathOffset,
        path: $scope.path1.path
      };

      $scope.dataForRefresh.push($scope.temp);

    } else if (obj.type == 'i-text') {

      $scope.newText2 = new fabric.IText(obj.text, {
        fontWeight: obj.fontWeight,
        fontFamily: obj.fontFamily,
        fontSize: obj.fontSize,
        top: obj.top,
        left: obj.left,
        timestamp: obj.timestamp
      });
      $scope.all.push($scope.newText2);

      $scope.temp = {
        type: $scope.newText2.type,
        originX: $scope.newText2.originX,
        originY: $scope.newText2.originY,
        left: $scope.newText2.left,
        top: $scope.newText2.top,
        fill: $scope.newText2.fill,
        strokeWidth: $scope.newText2.strokeWidth,
        scaleX: $scope.newText2.scaleX,
        scaleY: $scope.newText2.scaleY,
        opacity: $scope.newText2.opacity,
        visible: $scope.newText2.visible,
        text: $scope.newText2.text,
        fontSize: $scope.newText2.fontSize,
        fontWeight: $scope.newText2.fontWeight,
        fontFamily: $scope.newText2.fontFamily,
        fontStyle: $scope.newText2.fontStyle,
        lineHeight: $scope.newText2.lineHeight,
        textDecoration: $scope.newText2.textDecoration,
        textAlign: $scope.newText2.textAlign
      }
      $scope.dataForRefresh.push($scope.temp)

    } else if (obj.type == 'rect') {

      $scope.rect2 = new fabric.Rect({
        left: obj.left,
        top: obj.top,
        fill: obj.fill,
        width: obj.width,
        height: obj.height,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        selectable: false,
        hoverCursor: 'default'
      });
      // "add" rectangle onto canvas
      $scope.all.push($scope.rect2);

      $scope.temp = {
        timestamp: $scope.rect2.timestamp,
        type: $scope.rect2.type,
        left: $scope.rect2.left,
        top: $scope.rect2.top,
        width: $scope.rect2.width,
        height: $scope.rect2.height,
        fill: '',
        stroke: $scope.rect2.stroke,
        strokeWidth: $scope.rect2.strokeWidth
      };
      $scope.dataForRefresh.push($scope.temp);

    } else if (obj.type == 'circle') {
      $scope.cir2 = new fabric.Circle({
        left: obj.left,
        top: obj.top,
        radius: obj.radius,
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        selectable: false,
        hoverCursor: 'default'
      });

      $scope.all.push($scope.cir2);

      $scope.temp = {
        type: $scope.cir2.type,
        left: $scope.cir2.left,
        top: $scope.cir2.top,
        radius: $scope.cir2.radius,
        fill: '',
        stroke: $scope.cir2.stroke,
        strokeWidth: $scope.cir2.strokeWidth
      };

      $scope.dataForRefresh.push($scope.temp);

    } else if (obj.type == 'triangle') {
      $scope.tri2 = new fabric.Triangle({
        left: obj.left,
        top: obj.top,
        originX: obj.originX,
        originY: obj.originY,
        width: obj.width,
        height: obj.height,
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        selectable: false,
        hoverCursor: 'default'
      });

      $scope.all.push($scope.tri2);

      $scope.temp = {
        type: $scope.tri2.type,
        left: $scope.tri2.left,
        top: $scope.tri2.top,
        originX: $scope.tri2.originX,
        originY: $scope.tri2.originY,
        width: $scope.tri2.width,
        height: $scope.tri2.height,
        fill: '',
        stroke: $scope.tri2.stroke,
        strokeWidth: $scope.tri2.strokeWidth
      };
      $scope.dataForRefresh.push($scope.temp);

    } else if (obj.type == 'image') {

      fabric.Image.fromURL(obj.src, function(imgObject) {
        imgObject.scaleToWidth(obj.width);
        imgObject.scaleToHeight(obj.height);
        imgObject.set({
          timestamp: obj.timestamp,
          top: obj.top,
          left: obj.left
        });

        $scope.temp = {
          timestamp: imgObject.timestamp,
          type: imgObject.type,
          originX: imgObject.originX,
          originY: imgObject.originY,
          left: imgObject.left,
          top: imgObject.top,
          width: imgObject.width,
          height: imgObject.height,
          scaleX: imgObject.scaleX,
          scaleY: imgObject.scaleY,
          src: obj.src
        }
        $scope.dataForRefresh.push($scope.temp);

        $scope.all.push(imgObject);
        $scope.redraw();
      });

    }
    $scope.redraw();


    //checktype create respective shapes and push into all.
  }

  $scope.sendData = function() {
    $scope.objectToSend = [];
    for (var i = 0; i < $scope.dataToSend.length; i++) {
      if ($scope.dataToSend[i].type == $scope.mode) {
        $scope.objectToSend[0] = $scope.dataToSend[i];
      }
    }

    $scope.objectToSend1 = JSON.stringify($scope.objectToSend[0]);

    // console.log('seendnndndnddd', $scope.objectToSend1);


    $scope.connection.session.publish($scope.roomID, [$scope.objectToSend1], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Published");
    });

  }

  $scope.sendAllData = function() {
    $scope.allDataInString = JSON.stringify($scope.dataForRefresh);
    $scope.connection.session.publish($scope.roomID, ['allData',$scope.gridType , $scope.allDataInString], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Published");
    });
  }

  $scope.sendDimensions = function() {
    console.log($scope.heightCount);
    $scope.connection.session.publish($scope.roomID, ['increaseHeight'], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Published");
    });
  }

  $scope.sendImage = function() {
    $scope.lastImageItem = $scope.images.slice(-1)[0];

    $scope.imageObjectToSend = {
      imageURL: $scope.lastImageItem.toDataURL(),
      imageTop: $scope.lastImageItem.top,
      imageLeft: $scope.lastImageItem.left,
      imageHeight: $scope.lastImageItem.height,
      imageWidth: $scope.lastImageItem.width,
      // imageOriginX: $scope.lastImageItem.originX,
      // imageOriginY: $scope.lastImageItem.originY,
      timestamp: $scope.lastImageItem.timestamp

    }


    $scope.connection.session.publish($scope.roomID, ['image', $scope.imageObjectToSend], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Published");
    });
  }



  $scope.canvas = new fabric.Canvas('tutorCanvas', {
    selection: false
  });


  var canvash = document.getElementById("canvasContainer").clientHeight;
  var canvasw = document.getElementById("canvasContainer").clientWidth;



  $scope.canvas.setHeight(canvash);
  $scope.canvas.setWidth(canvasw);


  $scope.rectangles = [];
  $scope.circles = [];
  $scope.triangles = [];
  $scope.images = [];
  $scope.paths = [];
  $scope.textData;

  $scope.all = [];
  $scope.dataToSend = [];

  $scope.isEraser = false;
  $scope.size = 1;
  $scope.eraserSize = 1;
  $scope.col = 'black';
  $scope.mode = null;

  $scope.startx;
  $scope.starty;
  $scope.endx;
  $scope.endy;

  fabric.Object.prototype.selectable = false;
  $scope.canvas.isDrawingMode = true;

  $scope.mathGrid = [];
  $scope.englishGrid = [];
  $scope.gridSapce = 70;


  for (var i = 0; i < ($scope.canvas.width / $scope.gridSapce); i++) {
    $scope.grid1 = new fabric.Line([i * $scope.gridSapce, 0, i * $scope.gridSapce, $scope.canvas.height], {
      stroke: '#aca6a6',
      selectable: false,
      hasBorders: false,
      hasControls: false
    });
    $scope.mathGrid.push($scope.grid1);
  }

  for (var i = 0; i < ($scope.canvas.height / $scope.gridSapce); i++) {
    $scope.grid2 = new fabric.Line([0, i * $scope.gridSapce, $scope.canvas.width, i * $scope.gridSapce], {
      stroke: '#aca6a6',
      selectable: false,
      hasBorders: false,
      hasControls: false
    });
    $scope.mathGrid.push($scope.grid2);
  }

  for (var i = 0; i < ($scope.canvas.height / $scope.gridSapce); i++) {
    $scope.gride = new fabric.Line([0, i * $scope.gridSapce, $scope.canvas.width, i * $scope.gridSapce], {
      stroke: '#aca6a6',
      selectable: false,
      hasBorders: false,
      hasControls: false
    })
    $scope.englishGrid.push($scope.gride);
  }

  $scope.increaseCanvas = function() {
    $scope.heightCount = $scope.canvas.height + 150;
    $scope.canvas.setHeight($scope.heightCount);
    if ($scope.dataVariables.sendHeight) {
      $scope.sendDimensions();
    }
  }

  $scope.setPen = function() {
    $scope.canvas.isDrawingMode = true;
    $scope.canvas.freeDrawingBrush.color = $scope.col;
    $scope.canvas.freeDrawingBrush.width = $scope.size;
  }


  $scope.setEraser = function() {
    $scope.mode = 'eraser';
    $scope.isShape = false;
    $scope.canvas.isDrawingMode = true;
    $scope.canvas.freeDrawingBrush.width = $scope.eraserSize;
    $scope.canvas.freeDrawingBrush.color = '#ffffff';
  }




  $scope.canvas.on('path:created', function(options) {
    if ($scope.mode != 'eraser') {
      $scope.mode = 'path';
    }

    $scope.freePath = [];

    // $scope.freePath[0] = options.path.path[0];
    // for (var i = 1, j = 1; i < options.path.path.length; j++, i = i + 4) {
    //   $scope.freePath[j] = options.path.path[i];
    // }
    //
    // options.path.path = $scope.freePath;



    options.path.lockMovementX = true;
    options.path.lockMovementY = true;
    options.path.hasControls = false;
    options.path.hasBorders = false;
    options.path.selectable = false;
    options.path.hoverCursor = 'default';


    $scope.all.push(options.path);
    // $scope.paths.push(options.path);

    $scope.temp = {
      timestamp: new Date().getTime(),
      type: options.path.type,
      originX: options.path.originX,
      originY: options.path.originY,
      left: options.path.left,
      top: options.path.top,
      fill: options.path.fill,
      strokeLineCap: 'round',
      stroke: options.path.stroke,
      strokeWidth: options.path.strokeWidth,
      pathOffset: options.path.pathOffset,
      path: options.path.path
    };

    $scope.dataToSend.push($scope.temp);
    $scope.dataForRefresh.push($scope.temp);


  });

  $scope.addImage = function(url) {
    fabric.Object.prototype.selectable = true;
    $scope.mode = 'image';
    $scope.dataVariables.sendImageData = false;
    $scope.dataVariables.sendObjectsData = false;
    $scope.dataVariables.isImageSet = false;


    fabric.Image.fromURL(url, function(Img) {

      // Img.scaleToWidth(200);
      // Img.scaleToHeight(200);
      Img.set({
        timestamp: new Date().getTime()
      });


      $scope.temp = {
        timestamp: Img.timestamp,
        type: Img.type,
        originX: Img.originX,
        originY: Img.originY,
        left: Img.left,
        top: Img.top,
        width: Img.width,
        height: Img.height,
        scaleX: Img.scaleX,
        scaleY: Img.scaleY,
        src: url
      }

      $scope.dataToSend.push($scope.temp);
      $scope.dataForRefresh.push($scope.temp);



      $scope.all.push(Img);
      $scope.redraw();
    });
  }

  window.addEventListener("paste", function(e) {
    var clipboardData, url;
    e.stopPropagation();
    e.preventDefault();

    var cbData = e.clipboardData;

    for (var i = 0; i < cbData.items.length; i++) {
      // get the clipboard item
      var cbDataItem = cbData.items[i];
      var type = cbDataItem.type;
      // warning: most browsers don't support image data type
      if (type.indexOf("image") != -1) {
        // grab the imageData (as a blob)
        $scope.mode = 'image';
        var imageData = cbDataItem.getAsFile();


        var tosend = new FormData();
        if (imageData != emptyFile && imageData != null) {
          tosend.append('image', imageData)
        }

        $http({
          method: 'POST',
          url: '/api/tutors/tutors24Image/',
          data: tosend,
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        }).
        then(function(response) {

          var scaledImage = response.data.image;//.replace(".", '_scaled.');
          $scope.addImage(scaledImage);
        })

      }
      // if (type.indexOf("text")!=-1)
      //  {
      //     clipboardData = e.clipboardData || window.clipboardData;
      //     textData = clipboardData.getData('Text');
      //     console.log(textData);
      //     $scope.text = new fabric.Text(textData,
      //        { left: 0,
      //          top: 0,
      //          fontWeight: 'normal',
      //          fontFamily: 'Times New Roman',
      //          fontSize: 20});
      //          $scope.data['objects'].push($scope.text);
      //          $scope.redraw();
      //   }
    }
    $scope.canvas.isDrawingMode = false;
  });

  $scope.canvas.on('object:scaling', function(options) {
    $scope.dataVariables.sendImageData = false;
    for (var i = 0; i < $scope.dataToSend.length; i++) {
      if ($scope.dataToSend[i].timestamp == options.target.timestamp) {
        $scope.dataToSend[i].width = options.target.width * options.target.scaleX;
        $scope.dataToSend[i].height = options.target.height * options.target.scaleY;
        //  console.log(options.target.width*options.target.scaleX);
        // console.log($scope.dataToSend[i].scaleX, $scope.dataToSend[i].scaleX);
      }
    }
  })

  $scope.canvas.on('object:moving', function(options) {
    if (options.target.type == "image") {
      $scope.dataVariables.sendImageData = false;
      for (var i = 0; i < $scope.dataToSend.length; i++) {
        if ($scope.dataToSend[i].timestamp == options.target.timestamp) {
          $scope.dataToSend[i].top = options.target.top;
          $scope.dataToSend[i].left = options.target.left;
          console.log(options.target.top);
        }
      }
    } else {
      console.log("ffffffffffff");
    }
  })


  $scope.canvas.on('mouse:down', function(options) {

    $scope.pointer = $scope.canvas.getPointer(options.e);
    $scope.startx = $scope.pointer.x;
    $scope.starty = $scope.pointer.y;

    if (($scope.canvas.height - $scope.starty) < 150) {
      $scope.dataVariables.sendHeight = true;
      $scope.increaseCanvas();
    }

    console.log($scope.mode);

    if (!$scope.dataVariables.isImageSet) {
      if (!options.target) {
        $scope.dataVariables.sendImageData = true;
        $scope.dataVariables.isImageSet = true;
        //  $scope.canvas.off('object:moving');
        for (var i = 0; i < $scope.all.length; i++) {
          if ($scope.all[i].type == "image") {
            $scope.all[i].selectable = false;
            $scope.all[i].hoverCursor = 'default';
          }
        }
      }
    } else {
      $scope.dataVariables.sendObjectsData = true;
    }

    if ($scope.mode == "i-text") {
      $scope.newText = new fabric.IText('', {
        fontWeight: 'normal',
        fontFamily: 'Times New Roman',
        fontSize: 20,
        objectCaching: false,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        hoverCursor: 'default',
        timestamp: new Date().getTime()
      });
      $scope.canvas.add($scope.newText);
      $scope.canvas.centerObject($scope.newText);
      $scope.newText.set({
        left: $scope.startx,
        top: $scope.starty
      });
      $scope.canvas.setActiveObject($scope.newText);
      $scope.newText.enterEditing();
      $scope.newText.selectAll();
    }

    $scope.canvas.on('mouse:move', function(options) {
      $scope.pointer = $scope.canvas.getPointer(options.e);
      $scope.endx = $scope.pointer.x;
      $scope.endy = $scope.pointer.y;

      $scope.dataVariables.sendObjectsData = false;

      if ($scope.mode == "rect") {

        $scope.rect2 = new fabric.Rect({
          left: $scope.startx,
          top: $scope.starty,
          fill: '',
          width: $scope.endx - $scope.startx,
          height: $scope.endy - $scope.starty,
          stroke: $scope.col
        });

        $scope.redraw();
        $scope.canvas.add($scope.rect2);
      } else if ($scope.mode == "circle") {

        $scope.cir = new fabric.Circle({
          left: $scope.startx,
          top: $scope.starty,
          radius: ($scope.endx - $scope.startx) / 2,
          fill: '',
          stroke: $scope.col,
          strokeWidth: 2
        });

        $scope.redraw();
        $scope.canvas.add($scope.cir);

      } else if ($scope.mode == "triangle") {

        $scope.tri = new fabric.Triangle({
          left: $scope.startx,
          top: $scope.starty,
          originX: 'left',
          originY: 'top',
          width: $scope.endx - $scope.startx,
          height: $scope.endy - $scope.starty,
          fill: '',
          stroke: $scope.col,
          strokeWidth: 2
        });

        $scope.redraw();
        $scope.canvas.add($scope.tri);

      }

    });

  });

  $scope.canvas.on('mouse:up', function(options) {

    $scope.canvas.off('mouse:move');
    $scope.dataVariables.sendObjectsData = true;

    if (options.e.button == 2) {
      return;
    }

    if ($scope.endy - $scope.starty < 0) {
      // if drag towards top
      var tempy = $scope.starty;
      $scope.starty = $scope.endy;
      $scope.endy = tempy;
    }

    if ($scope.endx - $scope.startx < 0) {
      //  if drag towards left
      var tempx = $scope.startx;
      $scope.startx = $scope.endx;
      $scope.endx = tempx;
    }

    if ($scope.mode == "i-text") {
      $scope.canvas.on('text:editing:exited', function(e) {
        e.target.selectable = false;
        $scope.temp = {
          timestamp: $scope.newText.timestamp,
          type: $scope.newText.type,
          originX: $scope.newText.originX,
          originY: $scope.newText.originY,
          left: $scope.newText.left,
          top: $scope.newText.top,
          fill: $scope.newText.fill,
          strokeWidth: $scope.newText.strokeWidth,
          scaleX: $scope.newText.scaleX,
          scaleY: $scope.newText.scaleY,
          opacity: $scope.newText.opacity,
          visible: $scope.newText.visible,
          text: e.target.text,
          fontSize: $scope.newText.fontSize,
          fontWeight: $scope.newText.fontWeight,
          fontFamily: $scope.newText.fontFamily,
          fontStyle: $scope.newText.fontStyle,
          lineHeight: $scope.newText.lineHeight,
          textDecoration: $scope.newText.textDecoration,
          textAlign: $scope.newText.textAlign
        }

        $scope.dataToSend.push($scope.temp);
        $scope.dataForRefresh.push($scope.temp);


        $scope.all.push(e.target);
        //$scope.canvas.clear();
        // $scope.data['objects'].push($scope.newText);
        // $scope.data['objects'].push($scope.temp);
        $scope.redraw();
        $scope.canvas.off('text:editing:exited');
      });

      fabric.Object.prototype.selectable = true;
      $scope.canvas.isDrawingMode = false;
      $scope.canvas.selection = true;
      return false;
    } else if ($scope.mode == "rect") {

      $scope.rect1 = new fabric.Rect({
        left: $scope.startx,
        top: $scope.starty,
        fill: '',
        width: $scope.endx - $scope.startx,
        height: $scope.endy - $scope.starty,
        stroke: $scope.col,
        strokeWidth: 2,
        selectable: false,
        hoverCursor: 'default',
        objectCaching: false,
        timestamp: new Date().getTime()
      });
      // "add" rectangle onto canvas
      $scope.all.push($scope.rect1);
      // $scope.rectangles.push($scope.rect1);
      // canvas.add($scope.rect1);

      $scope.temp = {
        timestamp: $scope.rect1.timestamp,
        type: $scope.rect1.type,
        left: $scope.rect1.left,
        top: $scope.rect1.top,
        width: $scope.rect1.width,
        height: $scope.rect1.height,
        fill: '',
        stroke: $scope.rect1.stroke,
        strokeWidth: $scope.rect1.strokeWidth
      };
      $scope.dataToSend.push($scope.temp);
      $scope.dataForRefresh.push($scope.temp);

      // $scope.data['objects'].push($scope.temp);
    } else if ($scope.mode == "circle") {

      $scope.cir = new fabric.Circle({
        left: $scope.startx,
        top: $scope.starty,
        radius: ($scope.endx - $scope.startx) / 2,
        fill: '',
        stroke: $scope.col,
        strokeWidth: 2,
        selectable: false,
        hoverCursor: 'default',
        objectCaching: false,
        timestamp: new Date().getTime()
      });

      $scope.all.push($scope.cir);
      // $scope.circles.push($scope.cir);

      $scope.temp = {
        type: $scope.cir.type,
        left: $scope.cir.left,
        top: $scope.cir.top,
        radius: $scope.cir.radius,
        fill: '',
        stroke: $scope.cir.stroke,
        strokeWidth: $scope.cir.strokeWidth
      };
      $scope.dataToSend.push($scope.temp);
      $scope.dataForRefresh.push($scope.temp);

      // $scope.data['objects'].push($scope.temp);

    } else if ($scope.mode == "triangle") {

      $scope.tri = new fabric.Triangle({
        left: $scope.startx,
        top: $scope.starty,
        originX: 'left',
        originY: 'top',
        width: $scope.endx - $scope.startx,
        height: $scope.endy - $scope.starty,
        fill: '',
        stroke: $scope.col,
        strokeWidth: 2,
        selectable: false,
        hoverCursor: 'default',
        objectCaching: false,
        timestamp: new Date().getTime()
      });

      $scope.all.push($scope.tri);

      // $scope.triangles.push($scope.tri);
      $scope.temp = {
        type: $scope.tri.type,
        left: $scope.tri.left,
        top: $scope.tri.top,
        originX: $scope.tri.originX,
        originY: $scope.tri.originY,
        width: $scope.tri.width,
        height: $scope.tri.height,
        fill: '',
        stroke: $scope.tri.stroke,
        strokeWidth: $scope.tri.strokeWidth
      };
      $scope.dataToSend.push($scope.temp);
      $scope.dataForRefresh.push($scope.temp);

      // $scope.data['objects'].push($scope.temp);
    }

    if (!$scope.dataVariables.isImageSet) {
      return;
    }

    $scope.redraw();

  });

  $scope.redraw = function() {
    // $rootScope.dataString = JSON.stringify($scope.data);

    $scope.canvas.clear();


    //console.log("clear and load data");
    // $scope.canvas.loadFromJSON($scope.dataString, $scope.canvas.renderAll.bind($scope.canvas));
    if ($scope.gridType == 'plain') {

    } else if ($scope.gridType == 'math') {
      for (var i = 0; i < $scope.mathGrid.length; i++) {
        $scope.canvas.add($scope.mathGrid[i]);
      }
    } else if ($scope.gridType == 'english') {
      for (var i = 0; i < $scope.englishGrid.length; i++) {
        $scope.canvas.add($scope.englishGrid[i]);
      }
    }

    for (var i = 0; i < $scope.all.length; i++) {
      $scope.canvas.add($scope.all[i]);
      // $scope.canvas.renderAll();
    }

    if ($scope.dataVariables.isConnected) {

      if ($scope.mode == "image") {
        if ($scope.dataVariables.sendImageData) {
          $scope.sendData();
        }
      } else {
        if ($scope.dataVariables.sendObjectsData) {
          console.log('will send objects data....');
          $scope.sendData();
        }
      }



    }

  }

});





// app.controller('myCtrl2', function($scope , $rootScope){
//     $scope.can = new fabric.Canvas('canvas2', { selection: false });
//
//     $scope.copy = function ()
//    {
//      $scope.can.loadFromJSON($rootScope.dataString);
//    //  console.log($scope.dataString);
//    }
// });
