app.config(function($stateProvider) {

  $stateProvider.state('businessManagement.customers', {
    url: "/customers",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.customers.html',
        controller: 'businessManagement.customers',
      }
    }
  })
});


app.controller("businessManagement.customers", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.customers.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/ERP/service/',
    searchField: 'name',
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit : ';
          var appType = 'companyEdit';
        } else if (action == 'info') {
          var title = 'Details : ';
          var appType = 'companyInfo';
        } else if (action == 'document') {
          var title = 'Document : ';
          var appType = 'document';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
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

app.controller("businessManagement.customers.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
  $scope.compDetails = $scope.tab.data
  $scope.custDetails = {}
  $http({
    method: 'GET',
    url: '/api/support/customerProfile/?service=' + $scope.compDetails.pk,
  }).
  then(function(response) {
    $scope.custDetails = response.data[0]
    console.log($scope.custDetails, 'dddddddddddd');
  });

  $scope.openChartPopoup = function(pk) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.customer.chat.modal.html',
      size: 'md',
      backdrop: true,
      resolve: {
        cPk: function() {
          return $scope.custDetails.pk;
        }
      },
      controller: function($scope, $users, $timeout, $uibModalInstance, cPk) {
        $scope.cpk;
        $http({
          method: 'GET',
          url: '/api/support/script/chatter/?pk=' + cPk,
        }).
        then(function(response) {
          console.log('reeeeeeeeeeeeeeeeeeesssssssssss', response.data);
          $scope.cpk = response.data.data
          console.log($scope.cpk);
        });

        $timeout(function() {
          console.log(window.location.host, 'hosttttttt');
          $scope.src = '<script src="' + "http://" + window.location.host + "/script/chatter-" + $scope.cpk + ".js" + '"></script>'
        }, 600);

      },
    })

  }



  $scope.fetchProcess = function() {
    $scope.process_list =[]
    $http({
      method: 'GET',
      url: 'api/support/companyProcess/?service='+$scope.compDetails.pk
    }).
    then(function(response) {
      console.log(response.data, 'response');
      $scope.process_list = response.data
    });
  }

  $scope.fetchProcess()



  $scope.add_process1 = function() {
    if ($scope.process_text) {
      for (var i = 0; i < $scope.process_list.length; i++) {
        if ($scope.process_list[i] == $scope.process_text) {
          Flash.create('warning', 'This process Is Already Added')
          return
        }
      }
      $http({
        method: 'POST',
        url: 'api/support/companyProcess/',
        data: {
          text: $scope.process_text,
          service: $scope.compDetails.pk
        }
      }).
      then(function(response) {
        console.log(response.data, 'response');
          $scope.process_list.push(response.data)
          $scope.process_text = ''
      });

      // $scope.process_list.push($scope.process_text)
    } else {
      Flash.create('warning', 'Mention Some process')
    }
  }

  $scope.close_process = function(indx) {
    // console.log('closingl',indx,$scope.process_list);
    $scope.process_list.splice(indx, 1)

    // $http({method : 'DELETE' , url : '/api/PIM/calendar/' + $scope.itemInView.data.pk + '/'}).
    // then(function(response){
    //   $scope.data.items.splice($scope.data.items.indexOf($scope.itemInView) , 1);
    // })


  }

})

app.controller("businessManagement.customers.document", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
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
  $scope.compDetails = $scope.tab.data
  console.log($scope.compDetails);
  $http({
    method: 'GET',
    url: '/api/support/customerProfile/?service=' + $scope.compDetails.pk,
  }).
  then(function(response) {
    $scope.custDetails = response.data[0]
    console.log($scope.custDetails, 'dddddddddddd');
    $http({
      method: 'GET',
      url: '/api/support/documentation/?customer=' + $scope.custDetails.pk,
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
    fd.append('customer', $scope.custDetails.pk);
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
      Flash.create('success', 'Saved');
      if ($scope.docForm.pk == undefined) {
        $scope.custDocs.push(response.data)
      }
      $scope.docForm = response.data

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
          console.log('ddddddddddddddd', response.data);
          $scope.versions.push(response.data)
        });

    })
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




  // $scope.openChartPopoup = function(pk){
  //   $uibModal.open({
  //     templateUrl: '/static/ngTemplates/app.customer.chat.modal.html',
  //     size: 'md',
  //     backdrop: true,
  //     resolve: {
  //       cPk: function() {
  //         return $scope.custDetails.pk;
  //       }
  //     },
  //     controller: function($scope, $users , $timeout , $uibModalInstance , cPk) {
  //       $scope.cpk ;
  //       $http({
  //         method: 'GET',
  //         url: '/api/support/script/chatter/?pk='+cPk,
  //       }).
  //       then(function(response) {
  //         console.log('reeeeeeeeeeeeeeeeeeesssssssssss',response.data);
  //         $scope.cpk= response.data.data
  //         console.log($scope.cpk);
  //       });
  //
  //       $timeout(function () {
  //         console.log(window.location.host,'hosttttttt');
  //         $scope.src = '<script src="' + "http://"+window.location.host+"/script/chatter-" + $scope.cpk + ".js" + '"></script>'
  //       }, 600);
  //
  //     },
  //   })
  //
  // }

  $scope.fetchVersions = function(pk) {
    $http({
      method: 'GET',
      url: '/api/support/documentVersion/?parent=' + pk,
    }).
    then(function(response) {
      $scope.versions = response.data
      console.log($scope.versions);
    });
  }

  $scope.setActiveVersion = function(version) {
    $scope.activeVersion = version

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.customer.version.modal.html',
      size: 'md',
      backdrop: true,
      controller: function($scope, $users, $timeout, $uibModalInstance) {
        $scope.version = version
        console.log(version);
      },
    })

    // $scope.editVersion = version
    // $scope.docForm.text = version.text
    // $scope.docForm.title = version.title
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

})

app.controller("businessManagement.customers.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css: '/static/css/bootstrap.min.css',
    inline: false,
    plugins: 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme: 'modern',
    height: 180,
    toolbar: 'saveBtn publishBtn cancelBtn headerMode bodyMode | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
  };

  $scope.me = $users.get('mySelf')
  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.cpForm = {
    chat: false,
    call: false,
    email: false,
    videoAndAudio: false,
    vr: false,
    windowColor: '#000000',
    callBack: false,
    ticket: false,
    dp: emptyFile,
    name: '',
    supportBubbleColor: '#286EFA',
    firstMessage: ''
  }
  $scope.fetCustomerProfile = function(pk) {
    $scope.cpForm.service = pk
    $http({
      method: 'GET',
      url: '/api/support/customerProfile/?service=' + pk,
    }).
    then(function(response) {
      console.log(response.data);
      if (response.data[0].pk != null) {
        $scope.cpForm = response.data[0]
        console.log($scope.cpForm, 'fetching');
      }
    });
  }

  if ($scope.tab != undefined) {
    $scope.mode = 'edit';
    $scope.form = $scope.tab.data;
    if ($scope.form.address == null) {
      $scope.form.address = {
        street: null,
        city: null,
        state: null,
        pincode: null,
        country: null
      }
    }
    $scope.fetCustomerProfile($scope.form.pk)
  } else {
    $scope.mode = 'new';
    $scope.form = {
      name: '',
      telephone: '',
      about: '',
      contactPerson: '',
      mobile: '',
      address: {
        street: null,
        city: null,
        state: null,
        pincode: null,
        country: null
      },
      cin: '',
      tin: '',
      logo: '',
      web: ''
    }
  }

  $scope.saveCompanyDetails = function() {
    var f = $scope.form
    if (f.name.length == 0) {
      Flash.create('warning', 'Name Is Required')
      return
    }
    if (f.contactPerson != null && f.contactPerson.length > 0 && typeof f.contactPerson != 'object') {
      Flash.create('warning', 'Contact Person Must Be Suggested One')
      return
    }
    $scope.toSend = {
      name: f.name,
      user: $scope.me.pk
    }
    if (f.telephone != null && f.telephone.length > 0) {
      $scope.toSend.telephone = f.telephone
    }
    if (f.about != null && f.about.length > 0) {
      $scope.toSend.about = f.about
    }
    if (f.mobile != null && f.mobile.length > 0) {
      $scope.toSend.mobile = f.mobile
    }
    if (f.cin != null && f.cin.length > 0) {
      $scope.toSend.cin = f.cin
    }
    if (f.tin != null && f.tin.length > 0) {
      $scope.toSend.tin = f.tin
    }
    if (f.logo != null && f.logo.length > 0) {
      $scope.toSend.logo = f.logo
    }
    if (f.web != null && f.web.length > 0) {
      $scope.toSend.web = f.web
    }
    if (f.contactPerson != null && typeof f.contactPerson == 'object') {
      $scope.toSend.contactPerson = f.contactPerson.pk
    }

    console.log($scope.toSend);
    $scope.companysave = function() {
      console.log('save companyyyyyyyyyyyy');
      if ($scope.mode == 'new') {
        var method = 'POST'
        var url = '/api/ERP/service/'
      } else {
        var method = 'PATCH'
        var url = '/api/ERP/service/' + $scope.form.pk + '/'
      }
      $http({
        method: method,
        url: url,
        data: $scope.toSend
      }).
      then(function(response) {
        $scope.form = response.data;
        if ($scope.form.address == null) {
          $scope.form.address = {
            street: null,
            city: null,
            state: null,
            pincode: null,
            country: null
          }
        }
        $scope.cpForm.service = $scope.form.pk
        Flash.create('success', 'Saved');
        if ($scope.mode == 'new') {
          $scope.mode = 'edit'
        }
      }, function(err) {
        console.log(err, 'err');
        Flash.create('danger', err.status + ' : ' + err.statusText + ': ' + err.data.name);
      });
    }

    // if (f.address!=null) {
    console.log('addressssssssssss', f.address);

    if (f.address.street != null && f.address.street.length > 0 || f.address.city != null && f.address.city.length > 0 || f.address.state != null && f.address.state.length > 0 || f.address.country != null && f.address.country.length > 0) {
      var addData = f.address
      var method = 'POST'
      var url = '/api/ERP/address/'
      if (f.address.pk != undefined) {
        method = 'PATCH'
        url += f.address.pk + '/'
      }
      if (addData.pincode == null) {
        delete addData.pincode
      }
      $http({
        method: method,
        url: url,
        data: addData
      }).
      then(function(response) {
        $scope.form.address = response.data;
        $scope.toSend.address = response.data.pk;
        $scope.companysave()
      })
    } else {
      console.log('no addressssssssssss');
      $scope.companysave()
    }
    // }
  }



  $scope.saveCustomerProfile = function() {
    $scope.saveCompanyDetails()
    console.log($scope.cpForm);
    var fd = new FormData();

    var cpF = $scope.cpForm
    if (cpF.windowColor == '') {
      delete cpF.windowColor
    }
    if (cpF.supportBubbleColor == '') {
      delete cpF.supportBubbleColor
    }
    if (cpF.firstMessage == null || cpF.firstMessage == '') {
      delete cpF.firstMessage
      console.log('thereee', cpF.firstMessage);
    } else {
      fd.append('firstMessage', cpF.firstMessage);
      console.log('not thereee', cpF.firstMessage);
    }
    if (cpF.name == null || cpF.name == '') {
      delete cpF.name
    } else {
      fd.append('name', cpF.name);
    }
    var method = 'POST'
    var url = '/api/support/customerProfile/'
    if ($scope.cpForm.pk != undefined) {
      method = 'PATCH'
      url += $scope.cpForm.pk + '/'
    }
    //
    // $http({
    //   method: method,
    //   url: url,
    //   data: cpF
    // }).
    // then(function(response) {
    //   $scope.cpForm = response.data;
    // });

    fd.append('call', cpF.call);
    fd.append('email', cpF.email);
    fd.append('callBack', cpF.callBack);
    fd.append('chat', cpF.chat);
    fd.append('videoAndAudio', cpF.videoAndAudio);
    fd.append('ticket', cpF.ticket);
    fd.append('vr', cpF.vr);
    fd.append('service', cpF.service);

    console.log(cpF.name);
    console.log($scope.cpForm);

    if (cpF.windowColor != '') {
      fd.append('windowColor', cpF.windowColor);
    }
    if (cpF.supportBubbleColor != '') {
      fd.append('supportBubbleColor', cpF.supportBubbleColor);
    }

    // if (cpF.firstMessage != '') {
    //   fd.append('firstMessage', cpF.firstMessage);
    // }

    console.log(cpF.dp, 'dddddddddddddddddddddddddddddddddddddd');


    if (cpF.dp && typeof cpF.dp != 'string') {

      fd.append('dp', cpF.dp);
      console.log('append');
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
      $scope.cpForm = response.data;
      console.log(response.data);
    })



    // }


  }


})
