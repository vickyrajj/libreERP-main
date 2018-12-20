var projectsStepsData = [
  {indx: 1, text : 'created', display : 'Created'},
  {indx: 2 , text : 'sent_for_approval', display : 'Sent For Approval'},
  {indx: 3 , text : 'approved', display : 'Approved'},
  {indx: 4 , text : 'ongoing', display : 'OnGoing'},
];
app.controller("businessManagement.projects", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {

  $scope.data = {
    tableData: [],
    archieveData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.projects.service.item.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/support/projects/',
    // filterSearch: true,
    // searchField: 'title',
    deletable: true,
    itemsNumPerView: [12, 21, 30],
    // getParams: [{
    //   key: 'status',
    //   value: 'created'
    // }],
    searchField: 'title',
  }


  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.projects.archieve.item.html',
  }, ];

  $scope.archieveConfig = {
    views: views,
    url: '/api/support/projects/',
    // filterSearch: true,
    // searchField: 'title',
    deletable: true,
    itemsNumPerView: [12, 21, 30],
    getParams: [{
      key: 'status',
      value: 'archieve'
    }],
    searchField: 'title',
  }
  $scope.data1 = {
    tableData: []
  };

  console.log($scope.data1.tableData, 'tttttttttt');

  views1 = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.projects.approval.html',
  }, ];



  $scope.config1 = {
    views: views1,
    url: '/api/support/projects/',
    // filterSearch: true,
    // searchField: 'title',
    deletable: true,
    itemsNumPerView: [9, 15, 21],
    getParams: [{
      key: 'status',
      value: 'sent_for_approval'
    }],
    searchField: 'title',
  }

  $scope.data2 = {
    tableData: []
  };

  views2 = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.projects.approval.success.html',
  }, ];

  $scope.config2 = {
    views: views2,
    url: '/api/support/projects/',
    // filterSearch: true,
    // searchField: 'title',
    deletable: true,
    itemsNumPerView: [9, 15, 21],
    getParams: [{
      key: 'status',
      value: 'approved'
    }],
    searchField: 'title',
  }

  $scope.data3 = {
    tableData: []
  };
  console.log($scope.data3.tableData, 'jjjjjjjjj');

  views3 = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.projects.invoice.html',
  }, ];

  $scope.config3 = {
    views: views3,
    url: '/api/support/material/',
    // filterSearch: true,
    // searchField: 'title',
    deletable: true,
    itemsNumPerView: [9, 15, 21],
    // getParams: [{
    //   key: '',
    //   value: 'approved'
    // }],
    searchField: 'project__title',
  }




  $scope.me = $users.get('mySelf');
  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode, 'fffffffff');


    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Project : ';
          var appType = 'projectEditor';
        } else if (action == 'details') {
          var title = 'Project Details : ';
          var appType = 'projectDetails';
        } else if (action == 'delete') {
          console.log("aaaaaaaaa");
          $http({
            method: 'DELETE',
            url: '/api/support/projects/' + $scope.data.tableData[i].pk + '/'
          }).
          then(function(response) {
            Flash.create('success', 'Item Deleted');
          })
          $scope.data.tableData.splice(i, 1)
          return;
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].title,
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

  $timeout(function() {
    $scope.addTab({"title":"Project Details : dfdsfsd","cancel":true,"app":"projectDetails","data":{"pk":1,"index":0},"active":true})
  },1000)

  $scope.tableActionArchieve = function(target, action, mode) {
    console.log(target, action, mode, 'fffffffffgggggggggggggggg');


    for (var i = 0; i < $scope.data.archieveData.length; i++) {
      if ($scope.data.archieveData[i].pk == parseInt(target)) {
        if (action == 'details') {
          var title = 'Details :';
          var appType = 'projectarchieveDetails';
        }

        $scope.addTab({
          title: title + $scope.data.archieveData[i].title,
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

  $scope.tableAction1 = function(target, action, mode) {


    for (var i = 0; i < $scope.data1.tableData.length; i++) {
      if ($scope.data1.tableData[i].pk == parseInt(target)) {
        if (action == 'bom') {
          var title = 'Pending :';
          var appType = 'bomDetails';
        }

        $scope.addTab({
          title: title + $scope.data1.tableData[i].title,
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
  $scope.tableAction2 = function(target, action, mode) {
    console.log(target, action, mode, 'ggggggggggggggggggggggggggggg');


    for (var i = 0; i < $scope.data2.tableData.length; i++) {
      if ($scope.data2.tableData[i].pk == parseInt(target)) {
        if (action == 'success') {
          var title = 'GRN :';
          var appType = 'bomApproved';
        }

        $scope.addTab({
          title: title + $scope.data2.tableData[i].title,
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
  $scope.tableAction3 = function(target, action, mode) {
    console.log(target, action, mode, 'ggggggggggggggggggggggggggggg');


    for (var i = 0; i < $scope.data3.tableData.length; i++) {
      if ($scope.data3.tableData[i].pk == parseInt(target)) {
        if (action == 'invoice') {
          var title = 'On Going Details:';
          var appType = 'invoiceDetails';
        }

        $scope.addTab({
          title: title + $scope.data3.tableData[i].project.title,
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





})
app.controller("businessManagement.projects.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $filter) {




  $scope.resetForm = function() {
    $scope.form = {
      vendor: '',
      title: '',
      responsible: [],
      date: '',
      service: '',
      machinemodel: '',
      comm_nr: '',
      customer_ref: '',
    }
  }

  $scope.companySearch = function(query) {
    return $http.get('/api/ERP/service/?name__contains=' + query).
    then(function(response) {
      console.log(response.data, 'ccccccccccccccc');
      return response.data;
    })
  };
  $scope.vendorSearch = function(query) {
    return $http.get('/api/support/vendor/?name__contains=' + query).
    then(function(response) {
      // console.log($scope.vendor, 'ccccccccccccccc');
      // $scope.form.vendor = response.data.map(function(v){
      //   return v.pk
      // })
      return response.data;
    })
  };

  $scope.showCreateCompanyBtn = false;
  $scope.companyExist = false;
  $scope.me = $users.get('mySelf');
  console.log($scope.me, 'hhhhhhhhhhhhhh');

  $scope.companySearch = function(query) {
    return $http.get('/api/ERP/service/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.$watch('form.service', function(newValue, oldValue) {
    // console.log(newValue);
    if (typeof newValue == "string" && newValue.length > 0) {
      $scope.showCreateCompanyBtn = true;
      $scope.companyExist = false;
      $scope.showCompanyForm = false;
    } else if (typeof newValue == "object") {
      $scope.companyExist = true;
    } else {
      $scope.showCreateCompanyBtn = false;
      $scope.showCompanyForm = false;
    }

    if (newValue == '') {
      $scope.showCreateCompanyBtn = false;
      $scope.showCompanyForm = false;
      $scope.companyExist = false;
    }

  });

  $scope.openCreateService = function() {
    // console.log($scope.form.service, '-----------------');
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.projects.service.create.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        data: function() {
          return $scope.form.service;
        }
      },
      controller: function($scope, data, $uibModalInstance) {
        // console.log(data);
        $scope.form = {
          service: data,
          mobile: null,
          about: null,
          telephone: null,
          cin: null,
          tin: null,
          logo: null,
          web: null,
          address: {
            street: null,
            city: null,
            state: null,
            country: null,
            pincode: null
          }
        }

        if (typeof data == 'object') {
          $scope.form.service = data.name
          $scope.form.mobile = data.mobile
          $scope.form.telephone = data.telephone
          $scope.form.tin = data.tin
          $scope.form.cin = data.cin
          $scope.form.address = data.address
          $scope.form.logo = data.logo
          $scope.form.web = data.web
          $scope.form.about = data.about

        } else {
          $scope.form.service = data
        }
        //------------------------------------------------------------------------
        $scope.createCompany = function() {
          var method = 'POST'
          var addUrl = '/api/ERP/address/'
          var serviceUrl = '/api/ERP/service/'
          if ($scope.form.address.pk) {
            method = 'PATCH'
            addUrl = addUrl + $scope.form.address.pk + '/'
            serviceUrl = serviceUrl + data.pk + '/'
          }
          console.log(addUrl, serviceUrl);
          $http({
            method: method,
            url: addUrl,
            data: $scope.form.address
          }).
          then(function(response) {
            var dataToSend = {
              name: $scope.form.service,
              mobile: $scope.form.mobile,
              about: $scope.form.about,
              address: response.data.pk,
              telephone: $scope.form.telephone,
              cin: $scope.form.cin,
              tin: $scope.form.tin,
              logo: $scope.form.logo,
              web: $scope.form.web,
            };
            $http({
              method: method,
              url: serviceUrl,
              data: dataToSend
            }).
            then(function(response) {
              Flash.create('success', 'Saved');
              $uibModalInstance.dismiss(response.data);
            });
          })
        }
      }, //----controller ends
    }).result.then(function(f) {
      $scope.fetchData();
    }, function(f) {
      console.log('777777777777777777777777', f);
      if (typeof f == 'object') {
        $scope.form.service = f
      }
    });

  }

  // -----------------------------------------------------------------------------

  if (typeof $scope.tab == 'undefined') {
    $scope.mode = 'new';
    $scope.resetForm()
  } else {
    $scope.mode = 'edit';
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
  }
  // $scope.dateChange = function() {
  //   $scope.date = $scope.form.date.toJSON().split('T')[0]
  // }
  $scope.createProjects = function() {
    console.log($scope.form.responsible, 'vvvvvvvvvvvvvv');

    if ($scope.form.responsible == null || $scope.form.responsible.length == 0) {
      Flash.create('warning', 'Please Mention Responsible Person Name')
      return
    }

    if (typeof $scope.form.date == 'object') {
      $scope.form.date = $scope.form.date.toJSON().split('T')[0]
    }
    $scope.$watch('form.vendor', function(newValue, oldValue) {
        console.log(newValue,'hhhhhhhhhhhhhh');

    })
    // if($scope.mode == 'new'){
    //   $scope.date = $scope.form.date.toJSON().split('T')[0]
    // }else{
    //
    //
    // }
    console.log($scope.date, 'dddddddddddd');
    var method = 'POST'
    var Url = '/api/support/projects/'
    console.log($scope.form.machinemodel, 'mmm');
    var dataToSend = {
      service: $scope.form.service.pk,
      vendor:$scope.form.vendor.pk,
      title: $scope.form.title,
      responsible: $scope.form.responsible,
      date: $scope.form.date,
      machinemodel: $scope.form.machinemodel,
      comm_nr: $scope.form.comm_nr,
      customer_ref: $scope.form.customer_ref

    };

    if ($scope.mode == 'edit') {
      method = 'PATCH'
      Url = Url + $scope.form.pk + '/'
    }

    $http({
      method: method,
      url: Url,
      data: dataToSend,
      // transformRequest: angular.identity,
      // headers: {
      //   'Content-Type': undefined
      // }
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      if ($scope.mode == 'new') {
        $scope.resetForm()
      }
    });
  }

})

app.controller("businessManagement.projects.service.item", function($scope, $state, $users, $stateParams, $http, Flash) {


})

app.controller("businessManagement.projects.service.view", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.projectSteps = {steps : projectsStepsData}
  if ($scope.tab == undefined) {
    $scope.resetForm();
  } else {
    $scope.form = $scope.data.tableData[$scope.tab.data.index];
  }
  // $scope.form.exRate = 75;

  console.log($scope.form);
  for (var i = 0; i < $scope.projectSteps.steps.length; i++) {
      if ($scope.projectSteps.steps[i].text == $scope.form.status) {
        $scope.form.selectedStatus = $scope.projectSteps.steps[i].indx;
        break;
      }
    }


  $scope.me = $users.get('mySelf');
  $http.get('/api/HR/userSearch/').
  then(function(response) {
    $scope.persons = response.data;
    $scope.name = []

    function filterByPk(item) {
      if ($scope.form.responsible.includes(item.pk)) {
        console.log(item.first_name + item.last_name, 'vvvvvvvvv');
        $scope.name.push(item.first_name + item.last_name)
      }
    }
    $scope.persons.filter(filterByPk);
  })

  $scope.data = []

  $scope.addTableRow = function(indx) {
    $scope.data.push({
      part_no: '',
      description_1: '',
      price: '',
      quantity1: 1,
      // landed_price:0,
    });
  }



  $scope.change = function(query) {
    return $http.get('/api/support/products/?limit=10&part_no__contains=' + query).
    then(function(response) {
      return response.data.results;
    })
  };



  $scope.deleteTable = function(val, index) {

    if ($scope.data[index].pk != undefined) {
      for (var i = 0; i < $scope.productpk.length; i++) {
        for (var products in $scope.productpk[i]) {
          console.log($scope.productpk[i][products]);
          if (val == $scope.productpk[i][products].part_no) {
            $http({
              method: 'DELETE',
              url: '/api/support/bom/' + $scope.productpk[i].pk + '/'
            }).
            then((function(index) {
              return function(response) {
                var price =   $scope.data[index].price* $scope.data[index].quantity1
                $scope.form.invoiceValue -= price
                $scope.data.splice(index, 1);

                Flash.create('success', 'Deleted');
              }
            })(index))
          }
        }
      }


    } else {
      $scope.data.splice(index, 1);
    }
  };

  $scope.projects = []
  $scope.fetchData = function(index) {
    $http({
      method: 'GET',
      url: '/api/support/bom/?project=' + $scope.form.pk

    }).
    then(function(response) {
      $scope.projects = response.data
      for (var i = 0; i < $scope.projects.length; i++) {
        var totalprice = $scope.projects[i].price*$scope.projects[i].quantity1
        $scope.form.invoiceValue += totalprice
      }

    })
  }


  $scope.productpk = []
  $scope.fetchData()
  $scope.$watch('projects', function(newValue, oldValue) {
    var cost = 0
    for (var i = 0; i < newValue.length; i++) {

      var totalprice = newValue[i].price*newValue[i].quantity1
      cost += totalprice
      console.log(typeof oldValue[i], '11111111111');
      if (typeof oldValue[i] == "undefined") {

      }
      // || newValue[i].landed_price != oldValue[i].landed_price
      else if (newValue[i].price != oldValue[i].price || newValue[i].quantity1 != oldValue[i].quantity1) {
        $scope.form.invoiceValue = 0
        var dataSend = {
          quantity1: newValue[i].quantity1,
          price: newValue[i].price,
          // invoice_price: newValue[i].price,
          // landed_price:newValue[i].landed_price,
        }
        $http({
          method: 'PATCH',
          url: '/api/support/bom/' + newValue[i].pk + '/',
          data: dataSend
        }).
        then(function(response) {

        })
      }

    }
    $scope.form.invoiceValue = cost
  }, true)

  $scope.showbutton = false
  $scope.$watch('data', function(newValue, oldValue) {
    var cost = 0
    if (typeof newValue[0] == 'undefined') {

    } else if (typeof newValue[0].part_no == 'object') {
      for (var i = 0; i < newValue.length; i++) {
        var totalprice = newValue[i].price*newValue[i].quantity1
        cost += totalprice
      }
      $scope.form.invoiceValue += cost
      $scope.data[$scope.data.length - 1] = newValue[0].part_no
      $scope.data[$scope.data.length - 1].quantity1 = 1
      $scope.projectlist = []
      $scope.projectlist.push($scope.form.pk)
      var dataSend = {
        user: $scope.me.pk,
        products: $scope.data[$scope.data.length - 1].pk,
        project: $scope.projectlist,
        quantity1: 1,
        price: $scope.data[$scope.data.length - 1].price,
        // landed_price:$scope.data[$scope.data.length - 1].landed_price
      }
      $http({
        method: 'POST',
        url: '/api/support/bom/',
        data: dataSend
      }).
      then(function(response) {
        $scope.data[$scope.data.length - 1].listPk = response.data.pk
        $scope.data[$scope.data.length - 1].landed_price = response.data.price
        $scope.productpk.push(response.data);
        console.log($scope.productpk, 'ooooooo');
        $scope.showbutton = true
      })
      return
    } else if (typeof $scope.data[$scope.data.length - 1].part_no == 'object') {
      for (var i = 0; i < $scope.data.length; i++) {
        var cost = 0
        var totalprice = $scope.data[i].price*$scope.data[i].quantity1
        cost+= totalprice
      }
      $scope.form.invoiceValue = cost
      $scope.data[$scope.data.length - 1] = $scope.data[$scope.data.length - 1].part_no
      $scope.data[$scope.data.length - 1].quantity1 = 1
      $scope.projectlist = []
      $scope.projectlist.push($scope.form.pk)
      var dataSend = {
        user: $scope.me.pk,
        products: $scope.data[$scope.data.length - 1].pk,
        project: $scope.projectlist,
        quantity1: 1,
        price: $scope.data[$scope.data.length - 1].price,
        // landed_price:$scope.data[$scope.data.length - 1].landed_price
      }
      $http({
        method: 'POST',
        url: '/api/support/bom/',
        data: dataSend
      }).
      then(function(response) {
        $scope.data[$scope.data.length - 1].listPk = response.data.pk
        $scope.data[$scope.data.length - 1].landed_price = response.data.price
        $scope.productpk.push(response.data);
      })
      return
    } else {
      var cost = 0
      for (var i = 0; i < newValue.length; i++) {
        console.log("aaaaaaaaaaaaaaa");

          var totalprice = newValue[i].price*newValue[i].quantity1
          cost+= totalprice

        if (newValue[i].listPk) {
          if (newValue[i].price != oldValue[i].price || newValue[i].quantity1 != oldValue[i].quantity1 || newValue[i].landed_price != oldValue[i].landed_price) {

            var dataSend = {
              quantity1: newValue[i].quantity1,
              price: newValue[i].price,
              // landed_price:newValue[i].landed_price,
            }
            $http({
              method: 'PATCH',
              url: '/api/support/bom/' + newValue[i].listPk + '/',
              data: dataSend
            }).
            then(function(response) {})
          }
        }

      }
      $scope.form.invoiceValue =   $scope.form.invoiceValue +cost
    }


  }, true)


  // $scope.form.invoiceValue = ''
  // $scope.$watch('form.invoiceValue', function(newValue, oldValue) {
  //   console.log(newValue,'aaaaaaaaaaaaaaa');
  //   $scope.form.invoiceValueINR = $scope.newValue*form.exrate
  //
  // })



  $scope.deleteData = function(pk, index) {

    $http({
      method: 'DELETE',
      url: '/api/support/bom/' + pk + '/'
    }).
    then((function(index) {
      return function(response) {
        var price = $scope.projects[index].price* $scope.projects[index].quantity1
        $scope.form.invoiceValue -= price
        $scope.projects.splice(index, 1);
        Flash.create('success', 'Deleted');
      }
    })(index))

  }
  $scope.save = function() {
    console.log($scope.data);
    for (var i = 0; i < $scope.data.length; i++) {
      if ($scope.data[i].user.length == 0) {
        Flash.create('warning', 'Please Remove Empty Rows');
        return
      }
    }
    for (var i = 0; i < $scope.data.length; i++) {
      var url = '/api/support/bom/'
      var method = 'POST';
      if ($scope.data[i].pk != undefined) {
        url += $scope.data[i].pk + '/'
        method = 'PATCH';
      }
      var toSend = {
        user: $scope.data[i].user,
        products: $scope.data[i].products,
        project: $scope.form.pk,
      }
      $http({
        method: method,
        url: url,
        data: toSend
      }).
      then((function(i) {
        return function(response) {
          $scope.bomData.push(response.data)
          if (i == $scope.data.length - 1) {
            Flash.create('success', 'Saved');
            $scope.data = []
          }
        }
      })(i))
    }

  }
  $scope.revision = function() {
    var send = {
      revision: $scope.form.revision,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }

  $scope.sendForApproval = function() {
    var date = new Date().toJSON().split('T')[0]
    var sendStatus = {
      status: 'sent_for_approval',
      approved1: true,
      approved1_user: $scope.me.pk,
      approved1_date: date
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: sendStatus,
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      link = window.location
      console.log(response.data, 'aaaaaa');
      $http({
        method: 'POST',
        url: '/api/support/sendEmail/',
        data: {
          'pkValue': $scope.form.pk,
          'link': link
        },
      }).
      then(function(response) {
        Flash.create('success', 'Email Sent');
      })
    })
  }









})
app.controller("businessManagement.projects.approval", function($scope, $state, $users, $stateParams, $http, Flash) {


})
app.controller("businessManagement.projects.approval.success", function($scope, $state, $users, $stateParams, $http, Flash) {


})
app.controller("businessManagement.projects.approval.view", function($scope, $state, $users, $stateParams, $http, Flash) {

  if ($scope.tab == undefined) {
    $scope.resetForm();
  } else {
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
  }
  console.log($scope.form);
  $scope.projectSteps = {steps : projectsStepsData}
  for (var i = 0; i < $scope.projectSteps.steps.length; i++) {
      if ($scope.projectSteps.steps[i].text == $scope.form.status) {
        $scope.form.selectedStatus = $scope.projectSteps.steps[i].indx;
        break;
      }
    }
  $scope.me = $users.get('mySelf');
  $http.get('/api/HR/userSearch/').
  then(function(response) {
    $scope.persons = response.data;
    console.log($scope.form.responsible, 'bbbbbbbbbbbb');
    $scope.name = []

    function filterByPk(item) {
      if ($scope.form.responsible.includes(item.pk)) {
        console.log(item.first_name + item.last_name, 'vvvvvvvvv');
        $scope.name.push(item.first_name + item.last_name)
      }
    }
    $scope.persons.filter(filterByPk);
  })
  $scope.projects = []
  $scope.fetchData = function(index) {
    $http({
      method: 'GET',
      url: '/api/support/bom/?project=' + $scope.form.pk

    }).
    then(function(response) {
      $scope.projects = response.data
      for (var i = 0; i < $scope.projects; i++) {

      }

    })
  }
  $scope.fetchData()

  $scope.$watch('projects', function(newValue, oldValue) {
    if (typeof newValue == 'object') {
      $scope.total = 0
      for (var i = 0; i < $scope.projects.length; i++) {
        console.log($scope.projects[i].pk);
        if (isNaN($scope.projects[i].quantity1 * $scope.projects[i].price) == false)
          $scope.total += $scope.projects[i].quantity1 * $scope.projects[i].price
        $scope.quanty = $scope.projects[i].quantity1
        $scope.price = $scope.projects[i].price
        $scope.invoice_price = $scope.projects[i].price
        $scope.landed_price = $scope.projects[i].price
        $scope.quanty2 = $scope.projects[i].quantity1

        var sendtoBom = {
          quantity1: $scope.quanty,
          price: $scope.price,
          invoice_price: $scope.invoice_price,
          landed_price: $scope.landed_price,
          quantity2: $scope.quanty2,
        }
        $http({
          method: 'PATCH',
          url: 'api/support/bom/' + $scope.projects[i].pk + '/',
          data: sendtoBom,
        }).
        then(function(response) {})

      }
    }
  }, true)

  $scope.accept = function() {
    var date = new Date().toJSON().split('T')[0]
    var sendStatus = {
      status: 'approved',
      approved1: true,
      approved1_user: $scope.me.pk,
      approved1_date: date
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: sendStatus,
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      console.log(response.data, 'aaaaaa');
    })
  }

  $scope.reject = function() {
    var sendStatus = {
      status: 'created',
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: sendStatus,
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
    })
  }




})
app.controller("businessManagement.projects.success.view", function($scope, $state, $users, $stateParams, $http, Flash) {

  if ($scope.tab == undefined) {
    $scope.resetForm();
  } else {
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
    $scope.form.exRate = 75;
  }
  console.log($scope.form);
  $scope.projectSteps = {steps : projectsStepsData}
  for (var i = 0; i < $scope.projectSteps.steps.length; i++) {
      if ($scope.projectSteps.steps[i].text == $scope.form.status) {
        $scope.form.selectedStatus = $scope.projectSteps.steps[i].indx;
        break;
      }
    }
  $http.get('/api/HR/userSearch/').
  then(function(response) {
    $scope.persons = response.data;
    $scope.name = []

    function filterByPk(item) {
      if ($scope.form.responsible.includes(item.pk)) {
        $scope.name.push(item.first_name + item.last_name)
      }
    }
    $scope.persons.filter(filterByPk);
  })
  $scope.fetchData = function() {
    $http({
      method: 'GET',
      url: '/api/support/bom/?project=' + $scope.form.pk
    }).
    then(function(response) {
      $scope.projects = response.data

    })
  }
  $scope.fetchData()


  $scope.$watch('projects', function(newValue, oldValue) {
    if (typeof newValue == 'object') {
      $scope.total = 0
      for (var i = 0; i < $scope.projects.length; i++) {
        $scope.total += $scope.projects[i].quantity2 * $scope.projects[i].landed_price
        console.log($scope.projects[i].invoice_price, $scope.projects[i].landed_price, 'jjjjjjjjjj');
        var sendtoBom = {
          quantity2: $scope.projects[i].quantity2,
          price: $scope.projects[i].price,
          invoice_price: $scope.projects[i].invoice_price,
          landed_price: $scope.projects[i].landed_price,
        }
        $http({
          method: 'PATCH',
          url: 'api/support/bom/' + $scope.projects[i].pk + '/',
          data: sendtoBom,
        }).
        then(function(response) {})


      }
    }
  }, true)




  $scope.saveInfo = function() {

    if ($scope.form.invoiceValue == null || $scope.form.invoiceValue < 0 || $scope.form.invoiceValue == undefined) {
      $scope.form.invoiceValue = 0
    }
    if ($scope.form.packing == null || $scope.form.packing < 0 || $scope.form.packing == undefined) {
      $scope.form.packing = 0
    }
    if ($scope.form.insurance == null || $scope.form.insurance < 0 || $scope.form.insurance == undefined) {
      $scope.form.insurance = 0
    }
    if ($scope.form.freight == null || $scope.form.freight < 0 || $scope.form.freight == undefined) {
      $scope.form.freight = 0
    }
    if ($scope.form.assessableValue == null || $scope.form.assessableValue < 0 || $scope.form.assessableValue == undefined) {
      $scope.form.assessableValue = 0

    }
    if ($scope.form.gst1 == null || $scope.form.gst1 < 0 || $scope.form.gst1 == undefined) {
      $scope.form.gst1 = 0
    }
    if ($scope.form.gst2 == null || $scope.form.gst2 < 0 || $scope.form.gst2 == undefined) {
      $scope.form.gst2 = 0
    }
    if ($scope.form.clearingCharges1 == null || $scope.form.clearingCharges1 < 0 || $scope.form.clearingCharges1 == undefined) {
      $scope.form.clearingCharges1 = 0
    }
    if ($scope.form.clearingCharges2 == null || $scope.form.clearingCharges2 < 0 || $scope.form.clearingCharges2 == undefined) {
      $scope.form.clearingCharges2 = 0
    }


    var dataToSave = {
      'invoiceValue': $scope.form.invoiceValue,
      'packing': $scope.form.packing,
      'insurance': $scope.form.insurance,
      'freight': $scope.form.freight,
      'assessableValue': $scope.form.assessableValue,
      'gst1': $scope.form.gst1,
      'gst2': $scope.form.gst2,
      'clearingCharges1': $scope.form.clearingCharges1,
      'clearingCharges2': $scope.form.clearingCharges2,
      'projectPK': $scope.form.pk
    }
    $http({
      method: 'POST',
      url: '/api/support/calculate/',
      data: dataToSave,
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      console.log(response.data, 'aaaaaa');
      $scope.fetchData()
    })

  }

  $scope.send = function() {
    if ($scope.form.savedStatus == true) {
      Flash.create('warning', 'Already Saved in Inventory');
    } else {
      for (var i = 0; i < $scope.projects.length; i++) {
        $scope.qty = $scope.projects[i].quantity2;
        $scope.rate = $scope.projects[i].landed_price.toFixed(2)
        $scope.pkforProduct = $scope.projects[i].products.pk


        $scope.inventory = {
          product: $scope.pkforProduct,
          qty: $scope.qty,
          rate: $scope.rate,
        }
        $http({
          method: 'POST',
          url: '/api/support/inventory/',
          data: $scope.inventory,
        }).
        then(function(response) {
          Flash.create('success', 'Saved');
          console.log(response.data, 'aaaaaa');
          $http({
            method: 'PATCH',
            url: '/api/support/projects/' + $scope.form.pk + '/',
            data: {
              savedStatus: true,
              status:'ongoing'
            },
          }).
          then(function(response) {
            Flash.create('success', 'Saved');
            $scope.form.savedStatus = response.data.savedStatus
            console.log(response.data, 'aaaaaa');

          })
        })
      }
    }
  }
  $http({
    method: 'GET',
    url: '/api/support/material/?project=' + $scope.form.pk,
  }).
  then(function(response) {
    $scope.material = response.data
    console.log($scope.material, 'llllllllll');
    for (var i = 0; i < $scope.material.length; i++) {
      $scope.issue = $scope.material[i].materialIssue
      $scope.sum = $scope.issue.map(function(m) {
        return m.qty * m.price
      }).reduce(function(a, b) {
        return a + b
      }, 0)
    }
  })






})

app.controller("businessManagement.projects.invoice", function($scope, $state, $users, $stateParams, $http, Flash) {


})
app.controller("businessManagement.projects.invoice.view", function($scope, $state, $users, $stateParams, $http, Flash) {

  if ($scope.tab == undefined) {
    $scope.resetForm();
  } else {
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
  }
  console.log($scope.form);
  $scope.projectSteps = {steps : projectsStepsData}
  for (var i = 0; i < $scope.projectSteps.steps.length; i++) {
      if ($scope.projectSteps.steps[i].text == $scope.form.status) {
        $scope.form.selectedStatus = $scope.projectSteps.steps[i].indx;
        break;
      }
    }
    function sum(data) {
      console.log(data);
      if (data == $scope.form.materialIssue) {
        return data.map(function(m) {
          return m.qty * m.price
        }).reduce(function(a, b) {
          return a + b
        }, 0)
      } else if (data == $scope.purchase) {
        return data.map(function(m) {
          return m.quantity1 * m.price
        }).reduce(function(a, b) {
          return a + b
        }, 0)
      }
    }

    $http({
      method: 'GET',
      url: '/api/support/material/?project=' + $scope.form.pk,
    }).
    then(function(response) {
      console.log(response.data)
      $scope.form.materialIssue = response.data
      $scope.materialSum = sum($scope.form.materialIssue)
    })

  $http({
    method: 'GET',
    url: '/api/support/bom/?project=' + $scope.form.pk,
  }).
  then(function(response) {
    console.log(response.data);
    $scope.purchase = response.data;
    $scope.purchaseSum = sum($scope.purchase)
  })

  function sum(data) {
    if (data == $scope.form.materialIssue) {
      return data.map(function(m) {
        return m.qty * m.price
      }).reduce(function(a, b) {
        return a + b
      }, 0)
    } else if (data == $scope.purchase) {
      return data.map(function(m) {
        return m.quantity1 * m.price
      }).reduce(function(a, b) {
        return a + b
      }, 0)
    }
  }
  console.log($scope.form,'aaaaaaaaaaaaaaaaa');






})
