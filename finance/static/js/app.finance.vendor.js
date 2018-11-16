app.controller('businessManagement.finance.vendor', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

    $scope.data = {
        tableData: []
    };

    views = [{
        name: 'list',
        icon: 'fa-th-large',
        template: '/static/ngTemplates/genericTable/genericSearchList.html',
        itemTemplate: '/static/ngTemplates/app.finance.vendor.item.html',
    }, ];


    $scope.config = {
        views: views,
        url: '/api/finance/vendorprofile/',
        filterSearch: true,
        searchField: 'name',
        deletable: true,
        itemsNumPerView: [16, 32, 48],
    }


    $scope.tableAction = function(target, action, mode) {
        console.log(target, action, mode);
        console.log($scope.data.tableData);

        for (var i = 0; i < $scope.data.tableData.length; i++) {
            if ($scope.data.tableData[i].pk == parseInt(target)) {
                if (action == 'edit') {
                    var title = 'Edit VendorProfile :';
                    var appType = 'vendorEditor';
                } else if (action == 'details') {
                    var title = 'Details :';
                    var appType = 'vendorExplorer';
                }


                console.log({
                    title: title + $scope.data.tableData[i].service.name,
                    cancel: true,
                    app: appType,
                    data: {
                        pk: target,
                        index: i
                    },
                    active: true
                });


                $scope.addTab({
                    title: title + $scope.data.tableData[i].service.name,
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

    $scope.$on('exploreCustomer', function(event, input) {
        console.log("recieved");
        console.log(input);
        $scope.addTab({
            "title": "Details :" + input.vendor.service,
            "cancel": true,
            "app": "vendorExplorer",
            "data": {
                "pk": input.vendor.pk
            },
            "active": true
        })
    });


    $scope.$on('editCustomer', function(event, input) {
        console.log("recieved");
        console.log(input);
        $scope.addTab({
            "title": "Edit :" + input.vendor.service,
            "cancel": true,
            "app": "vendorEditor",
            "data": {
                "pk": input.vendor.pk,
                vendor: input.vendor
            },
            "active": true
        })
    });

})




app.controller("businessManagement.finance.vendor.form", function($scope, $state, $users, $stateParams, $http, Flash) {

    $scope.resetForm = function() {
        $scope.form = {
            contactperson: '',
            mobile: '',
            email: '',
            paymentTerm: '',
            contentDocs: emptyFile,
            service: ''
        }
    }

    $scope.companySearch = function(query) {
        return $http.get('/api/ERP/service/?name__contains=' + query).
        then(function(response) {
            return response.data;
        })
    };


    if (typeof $scope.tab == 'undefined') {
        $scope.mode = 'new';
        $scope.resetForm()
    } else {
        $scope.mode = 'edit';
        $scope.form = $scope.data.tableData[$scope.tab.data.index]
    }

    $scope.createVendor = function() {

        if (typeof $scope.form.service != "object") {
            Flash.create('warning', 'Please Select Suggested company')
            return
        }
        if ($scope.form.contactPerson == null || $scope.form.contactPerson.length == 0) {
            Flash.create('warning', 'Please Mention Contact Person Name')
            return
        }
        var method = 'POST'
        var Url = '/api/finance/vendorprofile/'
        var fd = new FormData();
        fd.append('service', $scope.form.service.pk);
        fd.append('contactPerson', $scope.form.contactPerson);
        if ($scope.form.contentDocs != null && $scope.form.contentDocs != emptyFile) {
            fd.append('contentDocs', $scope.form.contentDocs);
        }
        if ($scope.form.mobile != null && $scope.form.mobile.length > 0) {
            fd.append('mobile', $scope.form.mobile);
        }
        if ($scope.form.email != null && $scope.form.email.length > 0) {
            fd.append('email', $scope.form.email);

        }
        if ($scope.form.paymentTerm != null && $scope.form.paymentTerm.length > 0) {
            fd.append('paymentTerm', $scope.form.paymentTerm);
        }

        if ($scope.mode == 'edit') {
            method = 'PATCH'
            Url = Url + $scope.form.pk + '/'
        }
        $http({
            method: method,
            url: Url,
            data: fd,
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).
        then(function(response) {
            Flash.create('success', 'Saved');
            if ($scope.mode == 'new') {
                $scope.resetForm()
            }
        });
    }

})

app.controller("businessManagement.finance.vendor.item", function($scope, $state, $users, $stateParams, $http, Flash) {

})



app.controller("businessManagement.finance.vendor.explore", function($scope, $state, $users, $stateParams, $http, Flash) {


    if ($scope.data != undefined) {
        $scope.vendorData = $scope.data.tableData[$scope.tab.data.index]
    }

    $scope.items = []

    $scope.addTableRow = function() {
        $scope.items.push({
            particular: '',
            rate: '',
        });
        console.log($scope.items);
    }

    $scope.totalRate = function() {

        if ($scope.items == undefined) {
            return 0;
        }

        var total = 0;
        for (var i = 0; i < $scope.items.length; i++) {
            if ($scope.items[i].rate != undefined) {
                total += $scope.items[i].rate;
            }
        }
        return total
        // console.log('aaaaaa', total);
    }

    $scope.deleteTable = function(index) {
        if ($scope.items[index].pk != undefined) {
            $http({
                method: 'DELETE',
                url: '/api/finance/VendorService/' + $scope.items[index].pk + '/'
            }).
            then((function(index) {
                return function(response) {
                    $scope.items.splice(index, 1);
                    Flash.create('success', 'Deleted');
                }
            })(index))

        } else {
            $scope.items.splice(index, 1);
        }
    };

    $scope.deleteData = function(pk, ind) {
      $http({
        method: 'DELETE',
        url: '/api/finance/VendorService/' + $scope.items[ind].pk + '/'
      }).
      then((function(ind) {
        return function(response) {
          $scope.VendorService.splice(ind, 1);
          Flash.create('success', 'Deleted');
        }
      })(ind))

    }


$scope.fetchData = function(index) {
    $http({
      method: 'GET',
      url: '/api/finance/vendorservice/?vendorProfile=' + $scope.vendorData.pk

    }).
    then(function(response) {
      $scope.vendorServiceData = response.data;
      console.log('---------------------------------');
      console.log($scope.vendorServiceData);
    })
}
$scope.fetchData()

    $scope.save = function() {

        for (var i = 0; i < $scope.items.length; i++) {
            var url = '/api/finance/vendorservice/'
            var method = 'POST';
            if ($scope.items[i].pk != undefined) {
              url += $scope.items[i].pk + '/'
              method = 'PATCH';
            }
            var toSend = {
                    particular: $scope.items[i].particular,
                    rate: $scope.items[i].rate,
                    vendorProfile: $scope.vendorData.pk,
                }
                // console.log(toSend);

            $http({
                method: method,
                url: url,
                data: toSend
            }).
            then((function(i) {
                return function(response) {
                    $scope.items[i].pk = response.data.pk;
                    Flash.create('success', 'Saved');
                    $scope.fetchData()
                }
            })(i))

        }

    }

//   $scope.save = function() {
//   console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
//
//
//   for (var i = 0; i < $scope.items.length; i++) {
//           if ($scope.configureForm.pk == undefined) {
//             var method = 'POST';
//             var url = '/api/finance/vendorservice/'
//           } else {
//             var method = 'PATCH';
//             url += $scope.items[i].pk + '/';
//           }
//     }
//   var toSend = {
//     particular: $scope.items[i].particular,
//     rate: $scope.items[i].rate,
//     vendorProfile: $scope.vendorData.pk,
//
//   }
//
//   $http({
//     method: method,
//     url: url,
//     data: toSend
//   }).
//   then(function(response) {
//     if ($scope.configureForm.pk == undefined) {
//       Flash.create('success', 'Saved');
//       $scope.resetForm();
//     } else {
//       Flash.create('success', 'Updated');
//       $scope.configureForm = response.data
//     }
//   })
//
// }



})
