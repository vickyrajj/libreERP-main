// you need to first configure the states for this app

app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.finance', {
      url: "/finance",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
        },
        "menu@businessManagement.finance": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller: 'controller.generic.menu',
        },
        "@businessManagement.finance": {
          templateUrl: '/static/ngTemplates/app.finance.default.html',
          controller: 'businessManagement.finance.default',
        }
      }
    })
    .state('businessManagement.finance.accounts', {
      url: "/accounts",
      templateUrl: '/static/ngTemplates/app.finance.accounts.html',
      controller: 'businessManagement.finance.accounts'
    })
    .state('businessManagement.finance.costCenter', {
      url: "/costCenter",
      templateUrl: '/static/ngTemplates/app.finance.costCenter.html',
      controller: 'businessManagement.finance.costCenter'
    })
    .state('businessManagement.finance.sales', {
      url: "/sales",
      templateUrl: '/static/ngTemplates/app.finance.sales.html',
      controller: 'businessManagement.finance.sales'
    })
    .state('businessManagement.finance.vendor', {
      url: "/vendor",
      templateUrl: '/static/ngTemplates/app.finance.vendor.html',
      controller: 'businessManagement.finance.vendor'
    })
    .state('businessManagement.finance.expenses', {
      url: "/expenses",
      templateUrl: '/static/ngTemplates/app.finance.expenses.html',
      controller: 'businessManagement.finance.expenses'
    })
    .state('businessManagement.finance.pettyCash', {
      url: "/pettyCash",
      templateUrl: '/static/ngTemplates/app.finance.pettyCash.html',
      controller: 'businessManagement.finance.pettyCash'
    })
    .state('businessManagement.finance.invoicing', {
      url: "/invoicing",
      templateUrl: '/static/ngTemplates/app.finance.invoicing.html',
      controller: 'businessManagement.finance.invoicing'
    })
    .state('businessManagement.finance.inventory', {
      url: "/inventory",
      templateUrl: '/static/ngTemplates/app.finance.inventory.html',
      controller: 'businessManagement.finance.inventory'
    })
    .state('businessManagement.finance.GSTReporting', {
      url: "/GSTReporting",
      templateUrl: '/static/ngTemplates/app.finance.GSTReporting.html',
      controller: 'businessManagement.finance.GSTReporting'
    })
});


app.controller('businessManagement.finance.default', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$uibModal) {

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function random_rgba() {
    var o = Math.round,
      r = Math.random,
      s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 1 + ')';
  }

  $http.get('/api/finance/monthsExpensesData/').
  then(function(response) {
    console.log(response.data);
    new Chart(document.getElementById("active-line-chart"), {
      type: "line",
      data: {
        labels: response.data.labels,
        datasets: [{
          label: "Month Wise Expenses",
          data: response.data.datasets,
          backgroundColor: "#e92815",
          borderColor: "#e27d73",
          fill: false,
          lineTension: 0,
          radius: 7
        }, ]
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: "Month Wise Expenses",
          fontSize: 18,
          fontColor: "#111"
        },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false,
            },
          }],
          yAxes: [{
            gridLines: {
              display: false,
            },
          }]
        }
      }
    });
  })

  $http.get('/api/finance/expensesGraphData/').
  then(function(response) {
    console.log(response.data);
    $scope.expData = response.data
    for (var i = 0; i < $scope.expData.datasets.length; i++) {
      clr = getRandomColor()
      console.log(clr);
      $scope.expData.datasets[i].backgroundColor = clr
      $scope.expData.datasets[i].hoverBackgroundColor = clr
    }
    var numberWithCommas = function(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    new Chart(document.getElementById("items-bar-chart"), {
      type: 'bar',
      data: {
        labels: $scope.expData.labels,
        datasets: $scope.expData.datasets
      },
      options: {
        title: {
          display: true,
          text: "Projects Expenses",
          fontSize: 18,
          fontColor: "#111"
        },
        legend: {
          display: true,
          labels: {
            fontColor: "#333",
            fontSize: 16
          }
        },
        tooltips: {
          mode: 'label',
          callbacks: {
            label: function(tooltipItem, data) {
              return data.datasets[tooltipItem.datasetIndex].label + ": " + numberWithCommas(tooltipItem.yLabel);
            }
          }
        },
        scales: {
          xAxes: [{
            stacked: true,
            gridLines: {
              display: false,
            },
          }],
          yAxes: [{
            stacked: true,
            gridLines: {
              display: false,
            },
          }]
        }
      }
    });
  })

  $scope.projectWiseData = function(){
    $http.get('/api/projects/project/?projectClosed=false').
    then(function(response) {
      console.log(response.data);
      $scope.projExpData = response.data
      setTimeout(function() {
        for (var i = 0; i < $scope.projExpData.length; i++) {
          $scope.projExpData[i].expPercent = (($scope.projExpData[i].totalCost * 100) / $scope.projExpData[i].budget).toFixed(1)

          clr = random_rgba()
          var ids = "expense-doughnut-chart" + i
          console.log(ids, clr);
          new Chart(document.getElementById(ids), {
            type: 'doughnut',
            data: {
              labels: ['Expenses', 'Balance'],
              datasets: [{
                backgroundColor: [clr, 'rgba(255, 255, 255, 0)'],
                data: [$scope.projExpData[i].totalCost, ($scope.projExpData[i].budget - $scope.projExpData[i].totalCost)]
              }]
            },
            options: {
              cutoutPercentage: 70,
              legend: {
                display: false
              },
              title: {
                display: false,
                text: $scope.projExpData[i].title,
              }
            },
          });
        }
      }, 500);

    })
  }
  $scope.projectWiseData()

  $scope.showProjectForm=function(obj){
    console.log(obj);
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.finance.pettyCash.projectForm.html',
      size: 'lg',
      backdrop: true,
      controller: function($scope,$http, Flash, $users, $uibModalInstance){
        console.log('incontrollerrrrrr',obj);
        $scope.projForm = obj
        $scope.closeProject = function(){
          $http({
            method: 'PATCH',
            url: '/api/projects/project/' + $scope.projForm.pk + '/',
            data: {
              projectClosed: true,
            }
          }).
          then(function(response) {
            console.log(response.data);
            Flash.create('success', 'Project Closed Successfilly');
            $uibModalInstance.dismiss('Update')
          })
        }
        $scope.updateProject = function(){
          console.log($scope.projForm );
          var f = $scope.projForm
          if (f.title==null || f.title.length == 0) {
            Flash.create('danger', 'Please Write Some Title')
            return
          }
          if (f.budget == null || f.budget == undefined) {
            Flash.create('danger', 'Mention Project Budget');
            return;
          }
          if (f.description == null || f.description.length == 0) {
            Flash.create('danger', 'Write Some Description Of The Project');
            return;
          }
          var toSend = {
            title: f.title,
            description: f.description,
            budget: f.budget
          }
          console.log(typeof f.dueDate);
          if (typeof f.dueDate == 'object') {
            toSend.dueDate == f.dueDate
          }
          $http({
            method: 'PATCH',
            url: '/api/projects/project/' + $scope.projForm.pk + '/',
            data: toSend
          }).
          then(function(response) {
            console.log(response.data);
            Flash.create('success', 'Updated');
            $uibModalInstance.dismiss('Update')
          })
        }
      },
    }).result.then(function() {}, function(res) {
      if (res=='Update') {
        console.log('refresh graph');
        $scope.projectWiseData()
      }
    });
  }

})
