app.controller('businessManagement.finance.pettyCash', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $uibModal) {
  $scope.me = $users.get('mySelf');
  console.log($scope.me);
  $scope.form = {
    amount: 1,
    project: '',
    description: '',
    heading: '',
    attachment: emptyFile
  }
  $scope.userAccounts = []
  $http.get('/api/finance/account/?personal=true&contactPerson=' + $scope.me.pk).
  then(function(response) {
    console.log(response.data);
    // response.data = []
    // response.data = response.data.splice(0,1)
    $scope.userAccounts = response.data;
    if (response.data.length > 0) {
      if (response.data.length == 1) {
        $scope.form.accountIdx = 0
      } else {
        $scope.form.accountIdx = -1
      }
    }
  })

  $scope.limit = 0
  $scope.expData = []
  $scope.showMore = true
  $scope.getExpenseData = function(){
    $scope.limit += 3
    console.log($scope.limit);
    $http.get('/api/finance/getExpenseData/?limit=' + $scope.limit).
    then(function(response) {
      console.log(response.data);
      $scope.expData = response.data
      if ($scope.expData.length<$scope.limit) {
        $scope.showMore = false
      }
      for (var i = 0; i < $scope.expData.length; i++) {
        var clr = "hsl(" + 360 * Math.random() + ',' + (25 + 70 * Math.random()) + '%,' + (85 + 10 * Math.random()) + '%,0.5)';
        $scope.expData[i].colorCode = clr
      }
    })
  }
  $scope.getExpenseData()

  $scope.titleSearch = function(query) {
    return $http.get('/api/finance/expenseHeading/?limit=15&title__icontains=' + query).
    then(function(response) {
      return response.data.results;
    })
  };

  $scope.projectSearch = function(query) {
    return $http.get('/api/projects/project/?title__icontains=' + query).
    then(function(response) {
      return response.data;
    })
  };


  $scope.$watch('form.project', function(newValue, oldValue) {
    if (newValue.length>0&&newValue.pk==undefined) {
      $scope.form.newProject = true
    }else {
      $scope.form.newProject = false
    }
  })
  $scope.openProjectPopup = function(){
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.finance.pettyCash.projectForm.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        form: function() {
          return $scope.form
        },
      },
      controller: function($scope,$http, Flash, $users, $uibModalInstance,form){
        $scope.projForm = {title:form.project,dueDate:new Date(),description:'',budget:0}
        $scope.createProject = function(){
          console.log($scope.projForm );
          var f = $scope.projForm
          if (f.title.length == 0) {
            Flash.create('danger', 'Please Write Some Title')
            return
          }
          if (f.budget == null || f.budget == undefined) {
            Flash.create('danger', 'Mention Project Budget');
            return;
          }
          if (f.description.length == 0) {
            Flash.create('danger', 'Write Some Description Of The Project');
            return;
          }
          $http({
            method: 'POST',
            url: '/api/projects/project/',
            data: {
              title: f.title,
              description: f.description,
              dueDate: f.dueDate,
              budget: f.budget
            }
          }).
          then(function(response) {
            console.log(response.data);
            Flash.create('success', 'Project Created Successfilly');
            $uibModalInstance.dismiss(response.data)
          })
        }
      },
    }).result.then(function() {}, function(res) {
      if (res.pk) {
        console.log('updating project');
        $scope.form.project = res
      }
    });
  }

  $scope.postData = function() {
    var f = $scope.form
    console.log(f);
    var formData = new FormData();
    formData.append('amount', f.amount)
    formData.append('project', f.project.pk)
    formData.append('account', $scope.userAccounts[f.accountIdx].pk)
    formData.append('heading', f.heading.pk)

    if (f.attachment != emptyFile) {
      formData.append('attachment', f.attachment)
    }
    if (f.description.length > 0) {
      formData.append('description', f.description)
    }

    console.log(formData);

    $http({
      method: 'POST',
      url: '/api/projects/pettyCash/',
      data: formData,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      $scope.getExpenseData()
      $scope.form = {
        amount: 1,
        project: '',
        description: '',
        heading: '',
        attachment: emptyFile,
        accountIdx: 0
      }
      if ($scope.userAccounts.length > 1) {
        $scope.form.accountIdx = -1
      }
    })

  }

  $scope.createRecord = function() {
    var f = $scope.form
    if (f.heading.length == 0) {
      Flash.create('danger', 'Please Write Some Title')
      return
    }
    if (f.project.length == 0) {
      Flash.create('warning', 'Select The Projet');
      return;
    }
    if (f.project.pk==undefined) {
      Flash.create('warning', 'Create A New Project');
      return;
    }
    if (f.accountIdx == -1) {
      Flash.create('warning', 'Select The Account');
      return;
    }
    if (f.amount == null || f.amount == undefined) {
      Flash.create('warning', 'Select Proper Amount');
      return;
    }
    if (f.amount>$scope.userAccounts[f.accountIdx].balance) {
      Flash.create('warning', 'In sufficient Amount');
      return;
    }else {
      $scope.userAccounts[f.accountIdx].balance -= f.amount
    }

    if (f.heading.pk == undefined) {
      $http({
        method: 'POST',
        url: '/api/finance/expenseHeading/',
        data: {
          title: f.heading
        }
      }).
      then(function(response) {
        console.log(response.data);
        f.heading = response.data
        $scope.postData()
      })
    } else {
      $scope.postData()
    }

  }

  $scope.openExpenseDetails = function(idx) {
    $aside.open({
      templateUrl: '/static/ngTemplates/app.finance.pettyCash.details.html',
      size: 'xl',
      backdrop: true,
      placement:'right',
      resolve: {
        expData: function() {
          return $scope.expData[idx]
        },
      },
      controller: 'businessManagement.finance.pettyCash.details',
    }).result.then(function() {}, function(res) {
    });
  }

})

app.controller('businessManagement.finance.pettyCash.details', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $uibModalInstance , expData) {
  // console.log(expData);
  $scope.data = expData
  $http.get('/api/projects/pettyCash/?project='+$scope.data.projectPk+'&getUserExpenses').
  then(function(response) {
    // console.log(response.data);
    $scope.expensesData = response.data
  })
  $scope.cancel = function(){
    $uibModalInstance.dismiss();
  }
})
