app.controller('businessManagement.finance.accounts.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, account, $uibModalInstance) {

  console.log(account);
  if (account.pk) {
    $scope.mode = 'edit';
    $scope.form = account
  } else {
    $scope.mode = 'new';
    $scope.form = {
      title: '',
      bank: '',
      number: '',
      ifsc: '',
      bankAddress: '',
      personal: false,
      contactPerson: null,
      balance: 0,
      authorizedSignaturies: [],
    }
  }

  $scope.saveAccount = function() {
    console.log($scope.form);
    var f = $scope.form
    if (f.title.length == 0 || f.bank.length == 0 || f.number.length == 0 || f.ifsc.length == 0 || f.bankAddress.length == 0) {
      Flash.create('warning', 'All Fields Are Required');
      return;
    }
    var toSend = {
      title: f.title,
      bank: f.bank,
      number: f.number,
      ifsc: f.ifsc,
      bankAddress: f.bankAddress,
      personal: f.personal,
      balance: f.balance,
    }
    if (f.personal) {
      if (f.contactPerson == null || typeof f.contactPerson != 'object' || f.contactPerson.pk == undefined) {
        Flash.create('warning', 'Please Mention Owner');
        return;
      } else {
        toSend.contactPerson = f.contactPerson.pk
      }
    } else {
      if (f.authorizedSignaturies.length == 0) {
        Flash.create('warning', 'Please Add Authorized Signature Users');
        return;
      } else {
        toSend.authorizedSignaturies = f.authorizedSignaturies
        toSend.contactPerson = f.authorizedSignaturies[0]
      }
    }
    console.log(toSend);
    var url = '/api/finance/account/';
    if ($scope.mode == 'new') {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += $scope.form.pk + '/';
    }

    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      $uibModalInstance.dismiss('saved')
    })
  }

});


app.controller('businessManagement.finance.accounts.transaction', function($scope, $http, Flash, accountObj, $uibModalInstance) {

  console.log(accountObj);
  $scope.accountData = accountObj

  $scope.form = {
    toAcc: '',
    amount: 1,
    externalReferenceID: '',
    externalConfirmationID: '',
    showMore: false,
  }
  $scope.accountSearch = function(query) {
    return $http.get('/api/finance/account/?number__icontains=' + query).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        if (response.data[i].pk==$scope.accountData.pk) {
          response.data.splice(i,1)
        }
      }
      return response.data;
    })
  };
  $scope.getAccountName = function(acc){
    if (acc) {
      return acc.number + ' ( ' + acc.bank + ' )'
    }
  }

  $scope.transferMoney = function() {
    console.log($scope.form);
    var f = $scope.form
    if (f.toAcc.length==0||f.toAcc.pk==undefined) {
      Flash.create('warning', 'Please Select Proper Account Number');
      return;
    }
    if (f.amount > $scope.accountData.balance) {
      Flash.create('warning', 'Insufficient Amount');
      return;
    }
    var toSend = {
      fromAcc: $scope.accountData.pk,
      toAcc: f.toAcc.pk,
      amount: f.amount,
    }
    if (f.externalReferenceID!=null && f.externalReferenceID.length>0) {
      toSend.externalReferenceID = f.externalReferenceID
    }
    if (f.externalConfirmationID!=null && f.externalConfirmationID.length>0) {
      toSend.externalConfirmationID = f.externalConfirmationID
    }

    console.log(toSend);
    $http({
      method: 'POST',
      url: '/api/finance/transaction/',
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      $uibModalInstance.dismiss(response.data)
    })
  }
});

app.controller('businessManagement.finance.accounts', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $uibModal) {

  $scope.data = {
    tableData: []
  };

  var multiselectOptions = [{
    icon: 'fa fa-download',
    text: 'Download Expenses Summary'
  },{
    icon: 'fa fa-plus',
    text: 'new'
  }, ];

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.finance.accounts.item.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/finance/account/',
    searchField: 'number',
    itemsNumPerView: [12, 24, 48],
    multiselectOptions: multiselectOptions,
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);
    if (action == 'new') {
      console.log('new');
      $scope.openAccountForm();
    }else if (action=='Download Expenses Summary') {
      window.open('/api/finance/downloadExpenseSummary/', '_blank');
    } else {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          if (action == 'accountBrowser') {
            $scope.addTab({
              title: 'Account details : ' + $scope.data.tableData[i].number,
              cancel: true,
              app: 'accountBrowser',
              data: {
                pk: target,
                index: i
              },
              active: true
            })
          } else {
            $scope.openAccountForm($scope.data.tableData[i]);
          }

        }
      }
    }



  }

  $scope.openAccountForm = function(data) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.finance.accounts.form.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        account: function() {
          if (data == undefined || data == null) {
            return {};
          } else {
            return data;
          }
        },
      },
      controller: 'businessManagement.finance.accounts.form',
    }).result.then(function() {

    }, function(res) {
      if (res == 'saved') {
        console.log('refreshinggggggg');
        $scope.$broadcast('forceRefetch', {})
      }

    });
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

var bankIconMap = {
  hdfc: '/static/images/credit/hdfc.jpg',
  citi: '/static/images/credit/citi.png',
  sbi: '/static/images/credit/sbi.png'
}

app.controller('businessManagement.finance.accounts.item', function($scope, $http) {

  $scope.getBankIcon = function(bankName) {
    if (bankIconMap[bankName]) {
      return bankIconMap[bankName];
    } else {
      return '/static/images/defaultBank.jpg'
    }
  }


});





app.controller('businessManagement.finance.accounts.explore', function($scope, $http, $aside, $uibModal) {

  $scope.getBankIcon = function(bankName) {
    if (bankIconMap[bankName]) {
      return bankIconMap[bankName];
    } else {
      return '/static/images/defaultBank.jpg'
    }
  }
  $scope.account = $scope.data.tableData[$scope.tab.data.index]

  $scope.transactions = {
    tableData: []
  };

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.finance.transaction.item.html',
  }, ];

  var multiselectOptions = [{
    icon: 'fa fa-share',
    text: 'transaction'
  }, {
    icon: 'fa fa-plus',
    text: 'addMoney'
  }, ];

  $scope.config = {
    views: views,
    url: '/api/finance/transaction/',
    searchField: 'toAcc__number',
    itemsNumPerView: [20, 40, 60],
    multiselectOptions: multiselectOptions,
    getParams: [{
      "key": 'filterBoth',
      "value": $scope.account.number
    }],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);

    if (action == 'addMoney') {
      $uibModal.open({
        templateUrl: '/static/ngTemplates/app.finance.accounts.addMoney.html',
        size: 'md',
        resolve: {
          accountObj: function() {
            return $scope.account;
          }
        },
        controller: function($scope, $http, Flash, accountObj, $uibModalInstance) {
          $scope.accountData = accountObj;
          $scope.accountData.addAmount = 1;
          $scope.addMoney = function functionName() {
            $http({
              method: 'PATCH',
              url: '/api/finance/account/' + $scope.accountData.pk + '/',
              data: {addMoney:$scope.accountData.addAmount}
            }).
            then(function(response) {
              Flash.create('success', 'Saved');
              $uibModalInstance.dismiss(response.data)
            })
          }
        },
      }).result.then(function() {
      }, function(res) {
        if (res.pk) {
          $scope.account = res
        }
      });
    }else if (action == 'transaction') {
      $uibModal.open({
        templateUrl: '/static/ngTemplates/app.finance.accounts.transaction.html',
        size: 'lg',
        resolve: {
          accountObj: function() {
            return $scope.account;
          }
        },
        controller: 'businessManagement.finance.accounts.transaction',
      }).result.then(function() {
      }, function(res) {
        if (res.pk) {
          $scope.account.balance -= res.amount
          $scope.$broadcast('forceRefetch', {})
        }
      });

    }else if (action == 'more') {
      for (var i = 0; i < $scope.transactions.tableData.length; i++) {
        if ($scope.transactions.tableData[i].pk == parseInt(target)) {
          var targetObj = $scope.transactions.tableData[i];
          $uibModal.open({
            templateUrl: '/static/ngTemplates/app.finance.transactionDetails.html',
            size: 'lg',
            resolve: {
              transaction: function() {
                return targetObj;
              }
            },
            controller: function($scope, transaction) {
              $scope.transaction = transaction;
            },
          });

        }
      }

    }


  }

})
