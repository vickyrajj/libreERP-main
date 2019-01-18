var projectsStepsData = [{
    indx: 1,
    text: 'created',
    display: 'Created'
  },
  {
    indx: 2,
    text: 'sent_for_approval',
    display: 'Sent For Approval'
  },
  {
    indx: 3,
    text: 'approved',
    display: 'Approved'
  },
  {
    indx: 4,
    text: 'ongoing',
    display: 'OnGoing'
  },
];
app.controller("businessManagement.projects", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $permissions, $timeout, ) {

  $scope.cmnrList = []
  $rootScope.tabIdx = null
  $scope.changeIdx = function(idx) {
    $rootScope.tabIdx = idx
  }
  $scope.filteredData = {}

  $http({
    method: 'GET',
    url: '/api/support/getCmrList/',
  }).
  then(function(response) {
    console.log(response.data);
    $scope.cmnrList = response.data
    for (var i = 0; i < $scope.cmnrList.length; i++) {
      $scope.filteredData[$scope.cmnrList[i]] = {'totalPo':0,'totalOrdered':0,'totalConsumed':0,'comm_nr':$scope.cmnrList[i]}
      $http({
        method: 'GET',
        url: '/api/support/productTable/?comm=' + $scope.cmnrList[i],
      }).
      then((function(i) {
        return function(response) {
          console.log(response.data);
          $scope.filteredData[$scope.cmnrList[i]].cmrTableData = response.data
          $http({
            method: 'GET',
            url: '/api/support/projects/?savedStatus=false&junkStatus=false&comm_nr=' + $scope.cmnrList[i],
          }).
          then((function(i) {
            return function(response) {
              console.log(response.data);
              for (var j = 0; j < response.data.length; j++) {
                var clr = "hsl(" + 360 * Math.random() + ',' +(25 + 70 * Math.random()) + '%,' +(85 + 10 * Math.random()) + '%,0.2)';
                console.log(clr,'colorrrrrrrrrr');
                response.data[j].colorCode = clr
                $scope.filteredData[$scope.cmnrList[i]].totalOrdered += response.data[j].total_po
                $scope.filteredData[$scope.cmnrList[i]].totalConsumed += response.data[j].total_material
                if (response.data[j].pk in $scope.filteredData[$scope.cmnrList[i]].cmrTableData) {
                  for (var k = 0; k < $scope.filteredData[$scope.cmnrList[i]].cmrTableData[response.data[j].pk].length; k++) {
                    $scope.filteredData[$scope.cmnrList[i]].cmrTableData[response.data[j].pk][k].colorCode = clr
                    $scope.filteredData[$scope.cmnrList[i]].totalPo += $scope.filteredData[$scope.cmnrList[i]].cmrTableData[response.data[j].pk][k].landingCost
                  }
                }
              }
              $scope.filteredData[$scope.cmnrList[i]].serializerData = response.data
            }
          })(i));
        }
      })(i));

    }
  })
  $scope.$watch('tabIdx', function(newValue, oldValue) {
    console.log(newValue, $scope.cmnrList[$rootScope.tabIdx]);
    if ($scope.cmnrList[$rootScope.tabIdx] != undefined) {
      $scope.cmrData = $scope.filteredData[$scope.cmnrList[$rootScope.tabIdx]]
      console.log($scope.cmrData);
    }
  });


  $scope.data = {
    archieveData: [],
    junkData: [],
  };




  archieveviews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.projects.archieve.item.html',
  }, ];

  $scope.archieveConfig = {
    views: archieveviews,
    url: '/api/support/projects/',
    // filterSearch: true,
    // searchField: 'title',
    deletable: true,
    itemsNumPerView: [12, 21, 30],
    getParams: [{
        key: 'savedStatus',
        value: true
      },
      {
        key: 'status',
        value: 'ongoing'
      },
    ],
    searchField: 'title',
  }

  junkveviews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.projects.junk.item.html',
  }, ];

  $scope.junkConfig = {
    views: junkveviews,
    url: '/api/support/projects/',
    // filterSearch: true,
    // searchField: 'title',
    deletable: true,
    itemsNumPerView: [12, 21, 30],
    getParams: [{
      key: 'junkStatus',
      value: true
    }],
    searchField: 'title',
  }






  $scope.me = $users.get('mySelf');
  $scope.cmrTableAction = function(idx, action) {
    console.log(idx, action);
    $scope.selectedData = $scope.cmrData.serializerData[idx]
    console.log($scope.selectedData);
    if (action == 'edit') {
      var title = 'Edit Project : ';
      var appType = 'projectEditor';
    } else if (action == 'details') {
      var title = 'Project Details : ';
      var appType = 'projectDetails';
    } else if (action == 'delete') {
      var dataSend = {
        junkStatus: true
      }
      console.log($scope.selectedData);
      $http({
        method: 'PATCH',
        data: dataSend,
        url: '/api/support/projects/' + $scope.selectedData.pk + '/'
      }).
      then(function(response) {
        Flash.create('success', 'Item Deleted');
      })
      $scope.cmrData.serializerData.splice(idx, 1)
      return;
    }

    $scope.addTab({
      title: title + $scope.selectedData.title,
      cancel: true,
      app: appType,
      data: {
        pk: $scope.selectedData.pk,
        index: idx,
        cmData: $scope.selectedData
      },
      active: true
    })

  }



  $scope.tableActionArchieve = function(target, action, mode) {
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
  $scope.tableActionJunk = function(target, action, mode) {
    console.log("heeeeeeeerrrrrrrrrrrreeeeeeeee");
    for (var i = 0; i < $scope.data.junkData.length; i++) {
      if ($scope.data.junkData[i].pk == parseInt(target)) {
        if (action == 'details') {
          var title = 'Details :';
          var appType = 'projectjunkDetails';
        }

        $scope.addTab({
          title: title + $scope.data.junkData[i].title,
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
  $scope.searchTabActive = {'active':true};

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
    if ($scope.tabs.length==0) {
      $scope.searchTabActive.active = true;
    }
  }

  $scope.addTab = function(input) {
    $scope.searchTabActive.active = false;
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

  $scope.openCreateService = function(mode) {
    console.log(mode);
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
        $scope.form = {}
        console.log(data, 'aaaaaaaaaaaaaaa');
        if (typeof data == 'object') {
          console.log("here");
          $scope.form = data

          // $scope.form.service = data.name
          // $scope.form.mobile = data.mobile
          // $scope.form.telephone = data.telephone
          // $scope.form.tin = data.tin
          // $scope.form.cin = data.cin
          // $scope.form.address = data.address
          // $scope.form.logo = data.logo
          // $scope.form.web = data.web
          // $scope.form.about = data.about
          // $scope.form.email = data.email
          // $scope.form.email = data.email

        } else {
          $scope.form.name = data
        }
        console.log($scope.form);
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
          $http({
            method: method,
            url: addUrl,
            data: $scope.form.address
          }).
          then(function(response) {
            var dataToSend = {
              name: $scope.form.name,
              customerName: $scope.form.customerName,
              email: $scope.form.email,
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
    $scope.form = $scope.tab.data.cmData
  }
  // $scope.dateChange = function() {
  //   $scope.date = $scope.form.date.toJSON().split('T')[0]
  // }
  $scope.createProjects = function() {
    console.log(typeof $scope.form.vendor,'aaaaaaaa');
    if ($scope.form.service == ''||typeof $scope.form.service!='object') {
      Flash.create('warning', 'Please Select Customer')
      return
    }
    if ($scope.form.vendor == ''||typeof $scope.form.vendor!='object') {
      Flash.create('warning', 'Please Select Vendor')
      return
    }
    if ($scope.form.title == '') {
      Flash.create('warning', 'Please Add Title')
      return
    }
    if($scope.form.date == ''){
      Flash.create('warning', 'Please Add Tentative Closing Date')
      return
    }
    else if (typeof $scope.form.date == 'object') {
        $scope.form.date = $scope.form.date.toJSON().split('T')[0]

    }
    if ($scope.form.comm_nr == '') {
      Flash.create('warning', 'Please Add comm_nr')
      return
    }
    // $scope.$watch('form.vendor', function(newValue, oldValue) {
    //   console.log(newValue, 'hhhhhhhhhhhhhh');
    //
    // })
    // if($scope.mode == 'new'){
    //   $scope.date = $scope.form.date.toJSON().split('T')[0]
    // }else{
    //
    //
    // }
    var method = 'POST'
    var Url = '/api/support/projects/'
    var dataToSend = {
      service: $scope.form.service.pk,
      vendor: $scope.form.vendor.pk,
      title: $scope.form.title,
      responsible: $scope.form.responsible,
      date: $scope.form.date,
      machinemodel: $scope.form.machinemodel,
      comm_nr: $scope.form.comm_nr,
      quote_ref: $scope.form.quote_ref,
      enquiry_ref: $scope.form.enquiry_ref

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

app.controller("businessManagement.projects.service.view", function($scope, $state, $users, $stateParams, $http, Flash, $rootScope, $uibModal) {

  $scope.projectSteps = {
    steps: projectsStepsData
  }
  if ($scope.tab == undefined) {
    $scope.resetForm();
  } else {
    $scope.form = $scope.tab.data.cmData;
  }


  $scope.updateStatus = function() {
    for (var i = 0; i < $scope.projectSteps.steps.length; i++) {
      if ($scope.projectSteps.steps[i].text == $scope.form.status) {
        $scope.form.selectedStatus = $scope.projectSteps.steps[i].indx;
        break;
      }
    }
  }
  $scope.updateStatus()

  $scope.me = $users.get('mySelf');
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

  $scope.data = []
  $scope.showButton = true
  $scope.addTableRow = function(indx) {
    $scope.data.push({
      part_no: '',
      description_1: '',
      price: '',
      weight: 0,
      quantity1: 1,
      quotePrice: 0,
      inrPrice: 0,
      packing: 0,
      insurance: 0,
      freight: 0,
      gst: 0,
      gstVal: 0,
      cif: 0,
      custom: 0,
      customVal: 0,
      socialVal: 0,
      charge1: 0,
      charge2: 0,
      landed_price: 0,
      customs_no: 0
    });
    $scope.showButton = false
  }
  $scope.options = false
  $scope.showOption = function() {
    if ($scope.options == false) {
      $scope.options = true
    } else {
      $scope.options = false
    }
  }


  $scope.change = function(query) {
    return $http.get('/api/support/products/?limit=10&search=' + query).
    then(function(response) {
      return response.data.results;
    })
  };





  $scope.projects = []


  $scope.updateAll = function() {
    if ($scope.projects.length > 0) {
      console.log("EEEEEEEEEEEEEEEEE");

      for (var i = 0; i < $scope.projects.length; i++) {
        $scope.projects[i].quotePrice = parseFloat((($scope.form.profitMargin * $scope.projects[i].price) / 100 + $scope.projects[i].price).toFixed(2))
        $scope.projects[i].inrPrice = parseFloat(($scope.projects[i].price * $scope.form.exRate).toFixed(2))
        $scope.projects[i].packing = parseFloat(((($scope.form.packing / $scope.form.invoiceValue) * $scope.projects[i].inrPrice)).toFixed(2))
        $scope.projects[i].insurance = parseFloat(((($scope.form.insurance / $scope.form.invoiceValue) * $scope.projects[i].inrPrice)).toFixed(2))
        $scope.projects[i].freight = parseFloat(((($scope.form.freight / $scope.form.invoiceValue) * $scope.projects[i].inrPrice)).toFixed(2))
        $scope.projects[i].cif = parseFloat(($scope.projects[i].inrPrice + $scope.projects[i].packing + $scope.projects[i].insurance + $scope.projects[i].freight).toFixed(2))
        $scope.projects[i].customVal = parseFloat((($scope.projects[i].cif + (($scope.projects[i].cif * $scope.form.assessableValue) / 100)) * ($scope.projects[i].custom) / 100).toFixed(2))
        $scope.projects[i].socialVal = parseFloat(($scope.projects[i].customVal * 0.1).toFixed(2))
        $scope.projects[i].gstVal = parseFloat(($scope.projects[i].cif + $scope.projects[i].customVal + $scope.projects[i].socialVal) * ($scope.projects[i].gst) / 100).toFixed(2)
        $scope.projects[i].charge1 = parseFloat(($scope.projects[i].inrPrice * ($scope.form.clearingCharges1 / ($scope.form.invoiceValue * $scope.form.exRate))).toFixed(2))
        $scope.projects[i].charge2 = parseFloat(($scope.projects[i].inrPrice * ($scope.form.clearingCharges2 / ($scope.form.invoiceValue * $scope.form.exRate))).toFixed(2))
        $scope.projects[i].landed_price = (($scope.projects[i].cif + $scope.projects[i].customVal + $scope.projects[i].socialVal + $scope.projects[i].charge1 + $scope.projects[i].charge2).toFixed(2))
      }
    }
    if ($scope.data.length > 0) {
      console.log("FFFFFFFFFFFFFFFFFFFFFF");
      for (var i = 0; i < $scope.data.length; i++) {
        $scope.data[i].quotePrice = parseFloat((($scope.form.profitMargin * $scope.data[i].price) / 100 + $scope.data[i].price).toFixed(2))
        $scope.data[i].inrPrice = parseFloat(($scope.data[i].price * $scope.form.exRate).toFixed(2))
        $scope.data[i].packing = parseFloat(((($scope.form.packing / $scope.form.invoiceValue) * $scope.data[i].inrPrice)).toFixed(2))
        $scope.data[i].insurance = parseFloat(((($scope.form.insurance / $scope.form.invoiceValue) * $scope.data[i].inrPrice)).toFixed(2))
        $scope.data[i].freight = parseFloat(((($scope.form.freight / $scope.form.invoiceValue) * $scope.data[i].inrPrice)).toFixed(2))
        $scope.data[i].cif = parseFloat(($scope.data[i].inrPrice + $scope.data[i].packing + $scope.data[i].insurance + $scope.data[i].freight).toFixed(2))
        $scope.data[i].customVal = parseFloat((($scope.data[i].cif + (($scope.data[i].cif * $scope.form.assessableValue) / 100)) * ($scope.data[i].custom) / 100).toFixed(2))
        $scope.data[i].socialVal = parseFloat(($scope.data[i].customVal * 0.1).toFixed(2))
        $scope.data[i].gstVal = parseFloat(($scope.data[i].cif + $scope.data[i].customVal + $scope.data[i].socialVal) * ($scope.data[i].gst) / 100).toFixed(2)
        $scope.data[i].charge1 = parseFloat(($scope.data[i].inrPrice * ($scope.form.clearingCharges1 / ($scope.form.invoiceValue * $scope.form.exRate))).toFixed(2))
        $scope.data[i].charge2 = parseFloat(($scope.data[i].inrPrice * ($scope.form.clearingCharges2 / ($scope.form.invoiceValue * $scope.form.exRate))).toFixed(2))
        $scope.data[i].landed_price = (($scope.data[i].cif + $scope.data[i].customVal + $scope.data[i].socialVal + $scope.data[i].charge1 + $scope.data[i].charge2).toFixed(2))
      }
    }
  }
  $scope.invoceSave = function() {
    console.log("aaaaaa");
    var send = {
      invoiceValue: $scope.form.invoiceValue,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }

  function sum(data) {
    if (data == $scope.materialIssue) {
      return data.map(function(m) {
        return m.qty * m.price
      }).reduce(function(a, b) {
        return a + b
      }, 0)
    } else if (data == $scope.projects) {
      return data.map(function(m) {
        return m.quantity1 * m.price
      }).reduce(function(a, b) {
        return a + b
      }, 0)
    }
  }


  $scope.materialIssue = []

  $scope.fetchMaterial = function() {
    $http({
      method: 'GET',
      url: '/api/support/material/?project=' + $scope.form.pk,
    }).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        for (var j = 0; j < response.data[i].materialIssue.length; j++) {
          $scope.materialIssue.push(response.data[i].materialIssue[j])
          $scope.materialSum = sum($scope.materialIssue)
        }
      }
    })
  }
  if ($scope.form.status == 'ongoing') {
    $scope.fetchMaterial()
  }


  $scope.fetchData = function() {
    $scope.data = []
    $http({
      method: 'GET',
      url: '/api/support/bom/?project=' + $scope.form.pk
    }).
    then(function(response) {
      $scope.projects = response.data
      $scope.purchaseSum = sum($scope.projects)
      var tot = 0
      var totweight = 0
      console.log($scope.purchaseSum, 'kkkkkkkkkkkkkkkkkk');
      $scope.form.invoiceValue = 0
      $scope.form.weightValue = 0
      for (var i = 0; i < $scope.projects.length; i++) {
        var totalprice = $scope.projects[i].price * $scope.projects[i].quantity1
        tot += totalprice
        var weight = $scope.projects[i].products.weight * $scope.projects[i].quantity1
        totweight += weight
        console.log(totweight, 'aaaaaaaa');
      }
      $scope.form.invoiceValue = tot
      $scope.invoceSave()
      $scope.form.weightValue = totweight
      $scope.updateAll()
      $scope.showButton = true
      // $rootScope.allData =  $scope.projects

    })
  }



  $scope.productpk = []
  $scope.fetchData()
  $scope.$watch('projects', function(newValue, oldValue) {
    // console.log('DDDDDDDDDDDDDDDDDDDD');
    // var cost = 0
    // var cost = $scope.form.invoiceValue
    for (var i = 0; i < newValue.length; i++) {
      if (typeof oldValue[i] == "undefined") {

      } else if (newValue[i].price != oldValue[i].price || newValue[i].quantity1 != oldValue[i].quantity1 || newValue[i].custom != oldValue[i].custom || newValue[i].gst != oldValue[i].gst || newValue[i].quantity2 != oldValue[i].quantity2 || newValue[i].landed_price !=
        oldValue[i].landed_price) {
        // console.log( newValue[i],'aaaaaaaaaaaaaa');
        // if(newValue[i].quantity1==''){
        //   var newQty = 0
        // }
        // else{
        //   var newQty = newValue[i].quantity1
        // }
        // if(oldValue[i].quantity1==''){
        //   var oldQty = 0
        // }
        // else{
        //   var oldQty = oldValue[i].quantity1
        // }
        // console.log(oldValue[i].quantity1, newValue[i].quantity1);
        // var oldtotalprice = oldValue[i].price * oldQty
        // console.log(oldtotalprice);
        // cost -= oldtotalprice
        // console.log(cost);
        // var totalprice = newValue[i].price * newQty
        // console.log(totalprice);
        // cost += totalprice
        // console.log(cost);
        var dataSend = {
          quantity1: newValue[i].quantity1,
          price: newValue[i].price,
          custom: newValue[i].custom,
          gst: newValue[i].gst,
          landed_price: newValue[i].landed_price,
          quantity2: newValue[i].quantity2,
        }
        $http({
          method: 'PATCH',
          url: '/api/support/bom/' + newValue[i].pk + '/',
          data: dataSend
        }).
        then(function(response) {
          // $scope.fetchData()
        })
      }
      // $scope.form.invoiceValue = cost
    }
    $scope.updateAll()
  }, true)

  $scope.showbutton = false
  $scope.$watch('data', function(newValue, oldValue) {
    var cost = 0
    var totweight = 0
    if (typeof newValue[0] == 'undefined') {

    } else if (typeof newValue[0].part_no == 'object') {
      $scope.showButton = true
      if ($scope.data.length > 1) {
        for (var i = 0; i < $scope.data.length; i++) {
          console.log($scope.data[i].products, 'aaaaaaaaa');
          if ($scope.data[i].pk == newValue[0].part_no.pk) {
            Flash.create('danger', 'Product already added');
            return
          }
        }
      }
      if ($scope.projects.length > 0) {
        for (var i = 0; i < $scope.projects.length; i++) {
          if ($scope.projects[i].products.pk == newValue[0].part_no.pk) {
            Flash.create('danger', 'Product already added');
            return
          }
        }
      }
      if (newValue[0].part_no.pk)
        $scope.data[$scope.data.length - 1] = newValue[0].part_no
      $scope.data[$scope.data.length - 1].quantity1 = 1
      var totalprice = $scope.data[$scope.data.length - 1].price * $scope.data[$scope.data.length - 1].quantity1
      cost += totalprice
      $scope.form.invoiceValue += cost
      $scope.invoceSave()
      var weight = $scope.data[$scope.data.length - 1].weight * $scope.data[$scope.data.length - 1].quantity1
      totweight += weight
      $scope.form.weightValue += totweight
      $scope.updateAll()
      $scope.projectlist = []
      $scope.projectlist.push($scope.form.pk)
      var dataSend = {
        user: $scope.me.pk,
        products: $scope.data[$scope.data.length - 1].pk,
        project: $scope.form.pk,
        quantity1: 1,
        price: $scope.data[$scope.data.length - 1].price,
        landed_price: $scope.data[$scope.data.length - 1].landed_price,
        custom: $scope.data[$scope.data.length - 1].custom,
        gst: $scope.data[$scope.data.length - 1].gst,
        customs_no: $scope.data[$scope.data.length - 1].customs_no,
      }
      $http({
        method: 'POST',
        url: '/api/support/bom/',
        data: dataSend
      }).
      then(function(response) {
        $scope.data[$scope.data.length - 1].listPk = response.data.pk
        $scope.productpk.push(response.data);
        $scope.showbutton = true

        return
      })
    } else if (typeof $scope.data[$scope.data.length - 1].part_no == 'object') {
      if ($scope.data.length > 1) {
        for (var i = 0; i < $scope.data.length; i++) {
          console.log($scope.data[i], 'aaaaaaaaa');
          if ($scope.data[i].pk == $scope.data[$scope.data.length - 1].part_no.pk) {
            Flash.create('danger', 'Product already added');
            return
          }
        }
      }
      if ($scope.projects.length > 0) {
        for (var i = 0; i < $scope.projects.length; i++) {
          if ($scope.projects[i].products.pk == $scope.data[$scope.data.length - 1].part_no.pk) {
            Flash.create('danger', 'Product already added');
            return
          }
        }
      }
      console.log('BBBBBBBBBBBBBBBBBBBBB');
      $scope.showButton = true
      var cost = 0
      var totweight = 0
      cost = $scope.form.invoiceValue
      totweight = $scope.form.weightValue
      $scope.data[$scope.data.length - 1] = $scope.data[$scope.data.length - 1].part_no
      $scope.data[$scope.data.length - 1].quantity1 = 1
      var totalprice = $scope.data[$scope.data.length - 1].price * $scope.data[$scope.data.length - 1].quantity1
      cost += totalprice
      $scope.form.invoiceValue = cost
      $scope.invoceSave()
      var weight = $scope.data[$scope.data.length - 1].weight * $scope.data[$scope.data.length - 1].quantity1
      console.log(weight, 'aaaaaaa');
      totweight += weight
      $scope.form.weightValue = totweight
      $scope.updateAll()
      $scope.projectlist = []
      $scope.projectlist.push($scope.form.pk)
      var dataSend = {
        user: $scope.me.pk,
        products: $scope.data[$scope.data.length - 1].pk,
        project: $scope.form.pk,
        quantity1: 1,
        price: $scope.data[$scope.data.length - 1].price,
        landed_price: $scope.data[$scope.data.length - 1].landed_price,
        custom: $scope.data[$scope.data.length - 1].custom,
        gst: $scope.data[$scope.data.length - 1].gst,
        customs_no: $scope.data[$scope.data.length - 1].customs_no,
      }
      $http({
        method: 'POST',
        url: '/api/support/bom/',
        data: dataSend
      }).
      then(function(response) {
        $scope.data[$scope.data.length - 1].listPk = response.data.pk
        $scope.productpk.push(response.data);
        return
      })
    } else {
      console.log('CCCCCCCCCCCCCCCC');
      var cost = $scope.form.invoiceValue
      var totweight = $scope.form.weightValue
      // cost = $scope.form.invoiceValue
      for (var i = 0; i < newValue.length; i++) {
        if (newValue[i].listPk) {
          if (newValue[i].quantity1 == '') {
            var newQty = 0
          } else {
            var newQty = newValue[i].quantity1
          }
          if (oldValue[i].quantity1 == '') {
            var oldQty = 0
          } else {
            var oldQty = oldValue[i].quantity1
          }

          var oldtotalprice = oldValue[i].price * oldQty
          cost -= oldtotalprice
          var totalprice = newValue[i].price * newQty
          cost += totalprice



          console.log(totweight, 'kkkkkkkkkkkkkk');
          var oldtotalweight = oldValue[i].weight * oldQty
          totweight -= oldtotalweight
          console.log(totweight, 'aaaaaaaaaaaa');
          var newtotweight = newValue[i].weight * newQty
          totweight += newtotweight
          console.log(totweight, 'jjjjjjjjjjjj');



          if (newValue[i].quantity1 != oldValue[i].quantity1 || newValue[i].landed_price != oldValue[i].landed_price || newValue[i].custom != oldValue[i].custom || newValue[i].gst != oldValue[i].gst) {

            // var oldtotalprice = oldValue[i].price * oldValue[i].quantity1
            // var totalprice = newValue[i].price * newValue[i].quantity1
            // cost -= oldtotalprice
            // cost += totalprice
            $scope.updateAll()
            var dataSend = {
              quantity1: newValue[i].quantity1,
              price: newValue[i].price,
              landed_price: newValue[i].landed_price,
              custom: newValue[i].custom,
              gst: newValue[i].gst,
              customs_no: newValue[i].customs_no,
            }
            $http({
              method: 'PATCH',
              url: '/api/support/bom/' + newValue[i].listPk + '/',
              data: dataSend
            }).
            then(function(response) {
              $scope.form.invoiceValue = cost
              $scope.form.weightValue = totweight

            })
          }
        }
      }
      $scope.form.invoiceValue = cost
      $scope.form.weightValue = totweight
      $scope.invoceSave()
      return
    }
  }, true)



  $scope.deleteTable = function(val, index) {
    if (val != undefined) {
      // if (val === $scope.data[index].listPk) {
      $http({
        method: 'DELETE',
        url: '/api/support/bom/' + val + '/'
      }).
      then(function(response) {
        // var pricee = $scope.projects[index].price
        // var qty = $scope.projects[index].quantity1
        $scope.data = []
        $scope.fetchData()
        Flash.create('success', 'Deleted');
        // $scope.form.invoiceValue = 0
        // $scope.updateAll()
        // $scope.projects.splice(index, 1);
        return
      })
      // then((function(index) {
      //   return function(response) {
      //     var price = $scope.data[index].price * $scope.data[index].quantity1
      //     $scope.form.invoiceValue = $scope.form.invoiceValue - price
      //     $scope.data.splice(index, 1);
      //     Flash.create('success', 'Deleted');
      //     $scope.updateAll()
      //     return
      //   }
      // })(index))
      // }
    } else {
      $scope.data = []
      $scope.fetchData()
      // $scope.data.splice(index, 1);
      // $scope.updateAll()
      return
    }
  };

  $scope.deleteData = function(pk, index, price, qty) {
    // var priceVal = price * qty
    // $scope.form.invoiceValue =$scope.form.invoiceValue - priceVal
    // $scope.pricee = price
    // $scope.qty = qty
    // console.log($scope.pricee,$scope.qty);
    // var price = $scope.pricee * $scope.qty
    // console.log($scope.form.invoiceValue,'aaaaaaaaaaa');
    // $scope.form.invoiceValue =$scope.form.invoiceValue - price
    $http({
      method: 'DELETE',
      url: '/api/support/bom/' + pk + '/'
    }).
    then(function(response) {
      // var pricee = $scope.projects[index].price
      // var qty = $scope.projects[index].quantity1

      $scope.data = []
      $scope.fetchData()
      Flash.create('success', 'Deleted');
      // $scope.form.invoiceValue = 0
      // $scope.updateAll()
      // $scope.projects.splice(index, 1);
      return

    })





    // then((function(index) {
    //   return function(response) {
    //     var pricee = $scope.projects[index].price
    //     var qty = $scope.projects[index].quantity1
    //     var price = pricee * qty
    //     console.log($scope.form.invoiceValue,'aaaaaaaaaaa');
    //     $scope.form.invoiceValue =$scope.form.invoiceValue - price
    //     // $scope.data=[]
    //     // $scope.fetchData()
    //     Flash.create('success', 'Deleted');
    //     $scope.updateAll()
    //     $scope.projects.splice(index, 1);
    //     return
    //   }
    // })(index))


  }

  $scope.save = function() {
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

  $scope.saveCurrency = function(){
    var send = {
      currency: $scope.form.currency,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }
  $scope.validity = function() {
    var send = {
      quoteValidity: $scope.form.quoteValidity,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }

  $scope.incoTerms = function() {
    var send = {
      terms: $scope.form.terms,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }
  $scope.incoTermsPo = function() {
    console.log("eeeeeeeeeeeeeeee");
    var send = {
      termspo: $scope.form.termspo,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }

  $scope.deliverySave = function() {
    var send = {
      Delivery: $scope.form.Delivery,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }



  $scope.paymentSave = function() {
    var send = {
      paymentTerms: $scope.form.paymentTerms,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }

  $scope.paymentSavePO = function() {
    var send = {
      paymentTerms1: $scope.form.paymentTerms1,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }
  $scope.shipmentModeSave = function() {
    var send = {
      shipmentMode: $scope.form.shipmentMode,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }
  $scope.shipmentDetails = function() {
    var send = {
      shipmentDetails: $scope.form.shipmentDetails,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }

  $scope.quoteNotesDetails = function() {
    var send = {
      quoteNotes: $scope.form.quoteNotes,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }
  $scope.poNotesDetails = function() {
    var send = {
      poNotes: $scope.form.poNotes,
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
      weightValue: $scope.form.weightValue.toFixed(2),
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
      $scope.form.status = response.data.status
      $scope.updateStatus()
      Flash.create('success', 'Saved');
      $scope.fetchData()
      link = window.location

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


  $scope.poChange = function() {
    var send = {
      poNumber: $scope.form.poNumber,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      return
    })
  }

  $scope.poDateChange = function() {
    console.log($scope.form.poDate, 'aaaaaaaaa');
    var send = {
      poDate: $scope.form.poDate.toJSON().split('T')[0],
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      return
    })
  }





  $scope.quoteChange = function() {
    var send = {
      quoteRefNumber: $scope.form.quoteRefNumber,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      return
    })

  }

  $scope.quoteDateChange = function() {
    console.log($scope.form.poDate, 'aaaaaaaaa');
    var send = {
      quoteDate: $scope.form.quoteDate.toJSON().split('T')[0],
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      return
    })
  }


  $scope.invoiceChange = function() {
    var send = {
      invoiceNumber: $scope.form.invoiceNumber,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      return
    })
  }



  $scope.boeChange = function() {
    var send = {
      boeRefNumber: $scope.form.boeRefNumber,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      return
    })

  }


  $scope.packingChange = function() {

    var send = {
      packing: $scope.form.packing,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      $scope.updateAll()
    })

  }



  $scope.assemblyValChange = function() {
    var send = {
      assessableValue: $scope.form.assessableValue,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      $scope.updateAll()
    })

  }


  $scope.insuranceChange = function() {
    var send = {
      insurance: $scope.form.insurance,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      $scope.updateAll()
    })
  }

  $scope.freightChange = function() {
    var send = {
      freight: $scope.form.freight,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      $scope.updateAll()
    })
  }
  $scope.clearingchar1Change = function() {
    var send = {
      clearingCharges1: $scope.form.clearingCharges1,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      $scope.updateAll()
    })
  }
  $scope.clearingchar2Change = function() {
    var send = {
      clearingCharges2: $scope.form.clearingCharges2,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      $scope.updateAll()
    })
  }

  $scope.exrateChange = function() {
    var send = {
      exRate: $scope.form.exRate,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      // if (newValue != null) {
      $scope.updateAll()
      // }
    })
  }
  $scope.profitmarginChange = function() {
    var send = {
      profitMargin: $scope.form.profitMargin,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {
      $scope.updateAll()
    })
  }

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
      $scope.form.status = response.data.status
      $scope.updateStatus()
      $scope.fetchData()
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
      $scope.form.status = response.data.status
      $scope.updateStatus()
      $scope.data = []
    })
  }

  $scope.send = function() {
    dateVal = new Date()
    console.log(dateVal,'aaaa');
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: {
        status: 'ongoing',
        grnDate: dateVal.toJSON().split('T')[0]
      },
    }).
    then(function(response) {
    for (var i = 0; i < $scope.projects.length; i++) {
      $scope.qty = $scope.projects[i].quantity2;
      $scope.rate = $scope.projects[i].landed_price
      $scope.pkforProduct = $scope.projects[i].products.pk
      $scope.project = $scope.form.pk
      $scope.inventory = {
        product: $scope.pkforProduct,
        qty: $scope.qty,
        addedqty: $scope.qty,
        rate: $scope.rate,
        project: $scope.project
      }
      $http({
        method: 'POST',
        url: '/api/support/inventory/',
        data: $scope.inventory,
      }).
      then(function(response) {
        Flash.create('success', 'Saved');

      })
    }

      Flash.create('success', 'Saved');
      $scope.form.status = response.data.status
      $scope.updateStatus()
      $scope.fetchMaterial()

    })
  }

  $scope.archieve = function() {
    var sendStatus = {
      savedStatus: true,

    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: sendStatus,
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      // $scope.form.status = response.data.status
    })

  }

  $scope.invoiceAdd = function(){

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.projects.invoice.modal.form.html',
      size: 'xl',
      backdrop: false,
      resolve: {
        data: function() {
          return $scope.form;
        }
      },
      controller: function($scope,data, $uibModalInstance) {
        $scope.form = data
        console.log(  $scope.form,'aaaaaaaa');
        $scope.$watch('form.isDetails', function(newValue, oldValue) {
          if(newValue==true){
            $scope.form.shipName = $scope.form.billName
            $scope.form.shipAddress = $scope.form.billAddress
            $scope.form.shipGst = $scope.form.billGst
            $scope.form.shipState = $scope.form.billState
            $scope.form.shipCode = $scope.form.billCode
          }
          else{
            $scope.form.shipName =''
            $scope.form.shipAddress = ''
            $scope.form.shipGst = ''
            $scope.form.shipState = ''
            $scope.form.shipCode =''
          }
        })
        $scope.products = []
        $scope.addTableRow = function(indx) {
          $scope.products.push({
            part_no: '',
            description_1: '',
            qty:0,
            customs_no:'',
            price: 0,
            taxableprice:0,
            cgst : 0,
            cgstVal:0,
            sgst:0,
            sgstVal:0,
            igst:0,
            igstVal:0,
            total:0
          });
        }
        $scope.close=function(){
          $uibModalInstance.dismiss();
        }
      }, //----controller ends
    }).result.then(function(f) {
      $scope.fetchData();
    }, function(f) {
      if (typeof f == 'object') {
        $scope.form.service = f
      }
    });
  }

  //   $uibModal.open({
  //     templateUrl: '/static/ngTemplates/app.projects.send.archieve.modal.html',
  //     size: 'lg',
  //     backdrop: true,
  //     resolve: {
  //       data: function() {
  //         return $scope.form;
  //       }
  //     },
  //     controller: function($scope, data, $uibModalInstance) {
  //       console.log(data,'aaaaaaaaaaaaaa');
  //
  //   // $uibModalInstance.dismiss(response.data);
  //     }, //----controller ends
  //   // }).result.then(function(f) {
  //   //   // $scope.fetchData();
  //   // }, function(f) {
  //   //   if (typeof f == 'object') {
  //   //     // $scope.form.service = f
  //   //   }
  //   });
  // }


})

app.controller("businessManagement.projects.invoice", function($scope, $state, $users, $stateParams, $http, Flash) {


})

app.controller("businessManagement.projects.archieve.explore", function($scope, $state, $users, $stateParams, $http, Flash) {
  $scope.form = $scope.data.archieveData[$scope.tab.data.index]
  $scope.projects = []
  $scope.materialIssue = []


  // $scope.updateAll = function() {
  //   for (var i = 0; i < $scope.projects.length; i++) {
  //     $scope.projects[i].quotePrice = parseFloat((($scope.form.profitMargin * $scope.projects[i].price) / 100 + $scope.projects[i].price).toFixed(2))
  //     $scope.projects[i].inrPrice = parseFloat(($scope.projects[i].price * $scope.form.exRate).toFixed(2))
  //     $scope.projects[i].packing = parseFloat(((($scope.form.packing/ $scope.form.invoiceValue) * $scope.projects[i].inrPrice)).toFixed(2))
  //     $scope.projects[i].insurance = parseFloat(((($scope.form.insurance  / $scope.form.invoiceValue) * $scope.projects[i].inrPrice)).toFixed(2))
  //     $scope.projects[i].freight = parseFloat(((($scope.form.freight / $scope.form.invoiceValue) * $scope.projects[i].inrPrice)).toFixed(2))
  //     $scope.projects[i].cif = parseFloat(($scope.projects[i].inrPrice + $scope.projects[i].packing + $scope.projects[i].insurance + $scope.projects[i].freight).toFixed(2))
  //     $scope.projects[i].cif = parseFloat(($scope.projects[i].inrPrice + $scope.projects[i].packing + $scope.projects[i].insurance + $scope.projects[i].freight).toFixed(2))
  //     $scope.projects[i].customVal = parseFloat((($scope.projects[i].cif +(($scope.projects[i].cif * $scope.form.assessableValue)/100))*($scope.projects[i].custom)/100).toFixed(2))
  //     $scope.projects[i].socialVal = parseFloat(($scope.projects[i].customVal *0.1).toFixed(2))
  //     $scope.projects[i].gstVal = parseFloat(($scope.projects[i].cif+$scope.projects[i].customVal+$scope.projects[i].socialVal)*($scope.projects[i].gst)/100).toFixed(2)
  //     $scope.projects[i].charge1 = parseFloat(($scope.projects[i].inrPrice * ($scope.form.clearingCharges1 / ($scope.form.invoiceValue * $scope.form.exRate))).toFixed(2))
  //     $scope.projects[i].charge2 = parseFloat(($scope.projects[i].inrPrice * ($scope.form.clearingCharges2 / ($scope.form.invoiceValue * $scope.form.exRate))).toFixed(2))
  //     $scope.projects[i].landed_price = (($scope.projects[i].cif + $scope.projects[i].customVal + $scope.projects[i].socialVal + $scope.projects[i].charge1 + $scope.projects[i].charge2).toFixed(2))
  //   }
  //
  // }

  function sum(data) {
    if (data == $scope.materialIssue) {
      return data.map(function(m) {
        return m.qty * m.price
      }).reduce(function(a, b) {
        return a + b
      }, 0)
    } else if (data == $scope.projects) {
      return data.map(function(m) {
        return m.quantity1 * m.price
      }).reduce(function(a, b) {
        return a + b
      }, 0)
    }
  }
  $scope.invoceSave = function() {
    console.log("aaaaaa");
    var send = {
      invoiceValue: $scope.form.invoiceValue,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }

  $scope.fetchData = function() {

    $http({
      method: 'GET',
      url: '/api/support/bom/?project=' + $scope.form.pk
    }).
    then(function(response) {
      $scope.projects = response.data
      $scope.purchaseSum = sum($scope.projects)
      var tot = 0
      var totweight = 0
      console.log($scope.purchaseSum, 'kkkkkkkkkkkkkkkkkk');
      $scope.form.invoiceValue = 0
      for (var i = 0; i < $scope.projects.length; i++) {
        var totalprice = $scope.projects[i].price * $scope.projects[i].quantity1
        tot += totalprice
        var weight = $scope.projects[i].products.weight * $scope.projects[i].quantity1
        totweight += weight
      }
      $scope.form.invoiceValue = tot
      $scope.invoceSave()
      $scope.form.weightValue = totweight.toFixed(2)
      console.log($scope.form.weightValue, 'aaaaaaaaaaaaaa');

      // $scope.updateAll()
      // $rootScope.allData =  $scope.projects

    })
  }

  $scope.fetchMaterial = function() {
    $http({
      method: 'GET',
      url: '/api/support/material/?project=' + $scope.form.pk,
    }).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        console.log(response.data, 'jjjjjjjjjjjjj');
        for (var j = 0; j < response.data[i].materialIssue.length; j++) {
          $scope.materialIssue.push(response.data[i].materialIssue[j])
          $scope.materialSum = sum($scope.materialIssue)
        }
      }
    })
  }



  $scope.fetchData()
  $scope.fetchMaterial()

})
// app.controller("businessManagement.projects.invoice.view", function($scope, $state, $users, $stateParams, $http, Flash) {
//
//
//   if ($scope.tab == undefined) {
//     $scope.resetForm();
//   } else {
//     $scope.form = $scope.data.tableData[$scope.tab.data.index]
//   }
//   $scope.projectSteps = {
//     steps: projectsStepsData
//   }
//
//   $scope.updateStatus = function(){
//     for (var i = 0; i < $scope.projectSteps.steps.length; i++) {
//       if ($scope.projectSteps.steps[i].text == $scope.form.status) {
//         $scope.form.selectedStatus = $scope.projectSteps.steps[i].indx;
//         break;
//       }
//     }
//   }
//   $scope.updateStatus()
//
//   function sum(data) {
//     if (data == $scope.form.materialIssue) {
//       return data.map(function(m) {
//         return m.qty * m.price
//       }).reduce(function(a, b) {
//         return a + b
//       }, 0)
//     } else if (data == $scope.purchase) {
//       return data.map(function(m) {
//         return m.quantity1 * m.price
//       }).reduce(function(a, b) {
//         return a + b
//       }, 0)
//     }
//   }
//   $scope.materialIssue = []
//   $http({
//     method: 'GET',
//     url: '/api/support/material/?project=' + $scope.form.pk,
//   }).
//   then(function(response) {
//     for (var i = 0; i < response.data.length; i++) {
//       for (var j = 0; j < response.data[i].materialIssue.length; j++) {
//         $scope.materialIssue.push(response.data[i].materialIssue[j])
//         $scope.materialSum = sum($scope.materialIssue)
//       }
//     }
//   })
//
//   $http({
//     method: 'GET',
//     url: '/api/support/bom/?project=' + $scope.form.pk,
//   }).
//   then(function(response) {
//     $scope.purchase = response.data;
//     $scope.purchaseSum = sum($scope.purchase)
//   })
//
//   function sum(data) {
//     if (data == $scope.materialIssue) {
//       return data.map(function(m) {
//         return m.qty * m.price
//       }).reduce(function(a, b) {
//         return a + b
//       }, 0)
//     } else if (data == $scope.purchase) {
//       return data.map(function(m) {
//         return m.quantity1 * m.price
//       }).reduce(function(a, b) {
//         return a + b
//       }, 0)
//     }
//   }
// })

app.controller("businessManagement.projects.junk.explore", function($scope, $state, $users, $stateParams, $http, Flash) {
  $scope.form = $scope.data.junkData[$scope.tab.data.index]
  $scope.projects = []
  $scope.materialIssue = []


  // $scope.updateAll = function() {
  //   for (var i = 0; i < $scope.projects.length; i++) {
  //     $scope.projects[i].quotePrice = parseFloat((($scope.form.profitMargin * $scope.projects[i].price) / 100 + $scope.projects[i].price).toFixed(2))
  //     $scope.projects[i].inrPrice = parseFloat(($scope.projects[i].price * $scope.form.exRate).toFixed(2))
  //     $scope.projects[i].packing = parseFloat(((($scope.form.packing/ $scope.form.invoiceValue) * $scope.projects[i].inrPrice)).toFixed(2))
  //     $scope.projects[i].insurance = parseFloat(((($scope.form.insurance  / $scope.form.invoiceValue) * $scope.projects[i].inrPrice)).toFixed(2))
  //     $scope.projects[i].freight = parseFloat(((($scope.form.freight / $scope.form.invoiceValue) * $scope.projects[i].inrPrice)).toFixed(2))
  //     $scope.projects[i].cif = parseFloat(($scope.projects[i].inrPrice + $scope.projects[i].packing + $scope.projects[i].insurance + $scope.projects[i].freight).toFixed(2))
  //     $scope.projects[i].cif = parseFloat(($scope.projects[i].inrPrice + $scope.projects[i].packing + $scope.projects[i].insurance + $scope.projects[i].freight).toFixed(2))
  //     $scope.projects[i].customVal = parseFloat((($scope.projects[i].cif +(($scope.projects[i].cif * $scope.form.assessableValue)/100))*($scope.projects[i].custom)/100).toFixed(2))
  //     $scope.projects[i].socialVal = parseFloat(($scope.projects[i].customVal *0.1).toFixed(2))
  //     $scope.projects[i].gstVal = parseFloat(($scope.projects[i].cif+$scope.projects[i].customVal+$scope.projects[i].socialVal)*($scope.projects[i].gst)/100).toFixed(2)
  //     $scope.projects[i].charge1 = parseFloat(($scope.projects[i].inrPrice * ($scope.form.clearingCharges1 / ($scope.form.invoiceValue * $scope.form.exRate))).toFixed(2))
  //     $scope.projects[i].charge2 = parseFloat(($scope.projects[i].inrPrice * ($scope.form.clearingCharges2 / ($scope.form.invoiceValue * $scope.form.exRate))).toFixed(2))
  //     $scope.projects[i].landed_price = (($scope.projects[i].cif + $scope.projects[i].customVal + $scope.projects[i].socialVal + $scope.projects[i].charge1 + $scope.projects[i].charge2).toFixed(2))
  //   }
  //
  // }

  function sum(data) {
    if (data == $scope.materialIssue) {
      return data.map(function(m) {
        return m.qty * m.price
      }).reduce(function(a, b) {
        return a + b
      }, 0)
    } else if (data == $scope.projects) {
      return data.map(function(m) {
        return m.quantity1 * m.price
      }).reduce(function(a, b) {
        return a + b
      }, 0)
    }
  }

  $scope.invoceSave = function() {
    console.log("aaaaaa");
    var send = {
      invoiceValue: $scope.form.invoiceValue,
    }
    $http({
      method: 'PATCH',
      url: '/api/support/projects/' + $scope.form.pk + '/',
      data: send,
    }).
    then(function(response) {})
  }
  $scope.fetchData = function() {

    $http({
      method: 'GET',
      url: '/api/support/bom/?project=' + $scope.form.pk
    }).
    then(function(response) {
      $scope.projects = response.data
      $scope.purchaseSum = sum($scope.projects)
      var tot = 0
      var totweight = 0
      console.log($scope.purchaseSum, 'kkkkkkkkkkkkkkkkkk');
      $scope.form.invoiceValue = 0
      for (var i = 0; i < $scope.projects.length; i++) {
        var totalprice = $scope.projects[i].price * $scope.projects[i].quantity1
        tot += totalprice
        var weight = $scope.projects[i].products.weight * $scope.projects[i].quantity1
        totweight += weight
      }
      $scope.form.invoiceValue = tot
      $scope.invoceSave()
      $scope.form.weightValue = totweight.toFixed(2)

      // $scope.updateAll()
      // $rootScope.allData =  $scope.projects

    })
  }

  $scope.fetchMaterial = function() {
    $http({
      method: 'GET',
      url: '/api/support/material/?project=' + $scope.form.pk,
    }).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        console.log(response.data, 'jjjjjjjjjjjjj');
        for (var j = 0; j < response.data[i].materialIssue.length; j++) {
          $scope.materialIssue.push(response.data[i].materialIssue[j])
          $scope.materialSum = sum($scope.materialIssue)
        }
      }
    })
  }
  $scope.fetchData()
  $scope.fetchMaterial()



})
